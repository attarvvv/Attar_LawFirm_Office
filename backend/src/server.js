const app = require('./app');
const { testConnection } = require('./config/db');
const WhatsappService = require('../services/whatsappService');

const PORT = process.env.PORT || 5000;

// Inisialisasi dan jalankan HTTP server
async function startServer() {
  // Verifikasi koneksi ke database 'lawfirm_db'
  await testConnection();

  // Inisialisasi sesi WhatsApp Web Baileys di latar belakang
  WhatsappService.init();

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Server API Attar Lawfirm Office`);
    console.log(`Berjalan di: http://localhost:${PORT}`);
    console.log(`Endpoint Auth: http://localhost:${PORT}/api/auth`);
    console.log(`Endpoint Admin: http://localhost:${PORT}/api/admin`);
    console.log(`Origin Diizinkan: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`====================================================`);
  });

  // Penanganan graceful shutdown saat proses dihentikan
  const shutdown = () => {
    console.log('\n[Server] Menutup server HTTP secara aman...');
    server.close(() => {
      console.log('[Server] Koneksi HTTP berhasil ditutup.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
