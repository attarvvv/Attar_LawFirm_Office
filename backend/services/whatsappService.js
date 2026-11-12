// Layanan Integrasi WhatsApp (WhatsappService) berbasis arsitektur OOP
// Mengelola koneksi persistent Baileys, caching kredensial sesi ke disk, dan pengiriman notifikasi konfirmasi
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

class WhatsappService {
  // Objek socket aktif dan status koneksi global
  static sock = null;
  static isConnected = false;
  static isInitializing = false;
  // Hitung percobaan reconnect agar tidak loop tanpa batas saat QR belum di-scan
  static reconnectAttempts = 0;
  static MAX_RECONNECT = 5;

  // Normalisasi nomor telepon klien ke format JID standar WhatsApp internasional (@s.whatsapp.net)
  static normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;

    // Bersihkan karakter selain angka seperti spasi, tanda minus, atau tanda plus
    let clean = phoneNumber.toString().replace(/\D/g, '');

    // Ubah awalan lokal 0 menjadi kode negara Indonesia 62
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }

    // Jika belum berawalan 62 dan panjang nomor wajar, tambahkan awalan 62
    if (!clean.startsWith('62') && clean.length >= 9 && clean.length <= 13) {
      clean = '62' + clean;
    }

    return `${clean}@s.whatsapp.net`;
  }

  // Inisialisasi koneksi persistent WhatsApp saat server Express pertama kali berjalan
  static async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      const sessionDir = path.join(__dirname, '../whatsapp-session');
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      // Muat kredensial sesi multi-file dari penyimpanan folder lokal
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS('Desktop')
      });

      // Simpan pembaruan kredensial dan kunci autentikasi saat diperbarui
      this.sock.ev.on('creds.update', saveCreds);

      // Pantau pembaruan status koneksi dan pembuatan QR code login
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Cetak QR code ke terminal — reset penghitung reconnect saat QR baru muncul
        if (qr) {
          this.reconnectAttempts = 0;
          console.log('\n====================================================');
          console.log('[WhatsApp] Silakan scan QR code berikut untuk menghubungkan WhatsApp:');
          qrcode.generate(qr, { small: true });
          console.log('Scan dengan HP → WhatsApp → ⋮ Menu → Perangkat Tertaut → Tautkan Perangkat');
          console.log('====================================================\n');
        }

        // Tangani saat koneksi terbuka dan siap mengirim pesan
        if (connection === 'open') {
          this.isConnected = true;
          this.isInitializing = false;
          this.reconnectAttempts = 0;
          console.log('[WhatsApp] Bot WhatsApp Attar Lawfirm berhasil terhubung dan siap beroperasi.');
        }

        // Tangani pemutusan koneksi dengan batas maksimum reconnect
        if (connection === 'close') {
          this.isConnected = false;
          this.isInitializing = false;
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          // Jika sesi di-logout dari HP — tidak perlu reconnect, hapus sesi lama
          if (statusCode === DisconnectReason.loggedOut) {
            console.log('[WhatsApp] Sesi dicabut dari HP. Hapus folder whatsapp-session/ lalu restart server untuk scan QR baru.');
            this.clearSession();
            return;
          }

          // Jika sudah mencapai batas reconnect — hentikan loop, tunggu restart manual
          if (this.reconnectAttempts >= this.MAX_RECONNECT) {
            console.log(`[WhatsApp] Gagal reconnect setelah ${this.MAX_RECONNECT}x percobaan. WhatsApp dinonaktifkan sementara.`);
            console.log('[WhatsApp] Restart server backend untuk mencoba lagi.');
            return;
          }

          // Reconnect dengan jeda bertahap (backoff)
          this.reconnectAttempts += 1;
          const delay = this.reconnectAttempts * 5000;
          console.log(`[WhatsApp] Koneksi terputus (${statusCode || 'Unknown'}). Reconnect ke-${this.reconnectAttempts} dalam ${delay / 1000}s...`);
          setTimeout(() => {
            this.init();
          }, delay);
        }
      });
    } catch (error) {
      this.isInitializing = false;
      this.isConnected = false;
      console.error('[WhatsApp Error] Gagal menginisialisasi sesi WhatsApp:', error.message);
    }
  }

  // Hapus semua file sesi agar QR baru bisa digenerate saat restart
  static clearSession() {
    try {
      const sessionDir = path.join(__dirname, '../whatsapp-session');
      if (fs.existsSync(sessionDir)) {
        // Hapus semua file di dalam folder sesi (kecuali .gitkeep)
        fs.readdirSync(sessionDir).forEach((file) => {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(sessionDir, file));
          }
        });
        console.log('[WhatsApp] File sesi lama berhasil dihapus.');
      }
    } catch (err) {
      console.error('[WhatsApp] Gagal menghapus file sesi:', err.message);
    }
  }

  // Kirim pesan WhatsApp ke nomor telepon klien
  static async sendMessage(phoneNumber, messageText) {
    try {
      // Pastikan bot dalam kondisi terhubung
      if (!this.sock || !this.isConnected) {
        return {
          success: false,
          message: 'Sesi WhatsApp belum terhubung. Silakan scan QR code di terminal console server terlebih dahulu.'
        };
      }

      const jid = this.normalizePhoneNumber(phoneNumber);
      if (!jid) {
        return {
          success: false,
          message: 'Nomor telepon klien tidak valid.'
        };
      }

      // Kirim pesan teks melalui socket Baileys
      const sent = await this.sock.sendMessage(jid, { text: messageText });

      // Verifikasi respons penerimaan dari server WhatsApp selama 2.5 detik
      const isRejected = await new Promise((resolve) => {
        const timer = setTimeout(() => {
          this.sock?.ev?.off('messages.update', updateHandler);
          resolve(null);
        }, 2500);

        const updateHandler = (updates) => {
          for (const u of updates) {
            if (u.key?.id === sent?.key?.id) {
              const params = u.update?.messageStubParameters;
              const has463 = Array.isArray(params) && params.includes('463');
              if (u.update?.status === 0 || has463) {
                clearTimeout(timer);
                this.sock?.ev?.off('messages.update', updateHandler);
                resolve(params?.[1] || 'Akun dibatasi oleh WhatsApp (Error 463: Your account has been restricted).');
                return;
              }
            }
          }
        };

        this.sock?.ev?.on('messages.update', updateHandler);
      });

      if (isRejected) {
        return {
          success: false,
          restricted: true,
          message: `${isRejected} Silakan kirim pesan manual atau minta klien chat nomor bot terlebih dahulu.`
        };
      }

      return {
        success: true,
        message: 'Pesan berhasil dikirim via WhatsApp.'
      };
    } catch (error) {
      console.error('[WhatsApp Send Error]:', error.message);
      return {
        success: false,
        message: `Gagal mengirim pesan WhatsApp: ${error.message}`
      };
    }
  }
}

module.exports = WhatsappService;

