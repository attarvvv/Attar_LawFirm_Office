// Komponen Kontak & Permintaan Konsultasi (ContactSection)
// Catatan: Tombol ini mengarahkan ke kontak langsung; dapat dialihkan ke formulir booking janji temu online saat fitur janji temu publik selesai dibangun.
import React from 'react';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaWhatsapp,
  FaShieldAlt
} from 'react-icons/fa';

export default function ContactSection({ onOpenConsultation }) {
  return (
    <section id="kontak" className="py-24 bg-white text-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Hubungi Kantor Kami
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Konsultasikan Kebutuhan Hukum Anda
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-dark-muted leading-relaxed">
            Tim advokat dan konsultan hukum Attar Lawfirm siap mendengarkan, menganalisis, dan memberikan advis hukum profesional untuk melindungi hak dan kepentingan Anda.
          </p>
        </div>

        {/* Kotak Informasi Kontak & Banner Konsultasi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Detail Informasi Kontak Kantor (7 Kolom) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Alamat Kantor */}
            <div className="bg-cream p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-4">
                  <FaMapMarkerAlt className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-1.5">Alamat Kantor Utama</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Menara Keadilan Lt. 18, Suite 1802<br />
                  Jl. Jenderal Sudirman Kav. 52-53, SCBD<br />
                  Jakarta Selatan 12190, Indonesia
                </p>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-200">
                Pusat Operasional & Pertemuan Klien
              </p>
            </div>

            {/* Nomor Telepon & WhatsApp */}
            <div className="bg-cream p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-4">
                  <FaPhoneAlt className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-1.5">Telepon & Layanan Hotline</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Telepon: (021) 5550-8899<br />
                  Hotline / WA: +62 811-8899-000<br />
                  Faks: (021) 5550-8890
                </p>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-200">
                Respon Cepat Pada Jam Kerja
              </p>
            </div>

            {/* Alamat Surat Elektronik (Email) */}
            <div className="bg-cream p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-4">
                  <FaEnvelope className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-1.5">Surat Elektronik (Email)</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Konsultasi: konsultasi@attarlaw.id<br />
                  Sekretariat: office@attarlaw.id<br />
                  Kemitraan: corporate@attarlaw.id
                </p>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-200">
                Dokumen & Permohonan Tertulis
              </p>
            </div>

            {/* Jam Operasional Kantor */}
            <div className="bg-cream p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg mb-4">
                  <FaClock className="text-accent" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-1.5">Waktu Operasional</h3>
                <p className="text-xs text-dark-muted leading-relaxed">
                  Senin - Jumat: 08.30 - 17.30 WIB<br />
                  Sabtu: Dengan Janji Temu Terjadwal<br />
                  Minggu & Hari Libur Nasional: Tutup
                </p>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-200">
                Layanan Darurat Pidana Tersedia 24 Jam
              </p>
            </div>
          </div>

          {/* Banner Aksi Cepat Konsultasi (5 Kolom) */}
          <div className="lg:col-span-5 bg-primary text-white p-8 sm:p-10 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-bl-full pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-accent text-xs font-semibold tracking-wide uppercase mb-6">
                <FaShieldAlt className="w-3.5 h-3.5 text-accent" />
                <span>Konsultasi Terjadwal</span>
              </div>

              <h3 className="text-2xl font-bold mb-4 leading-snug">
                Siap Menyelesaikan Permasalahan Hukum Anda Secara Profesional?
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                Hubungi sekretariat kantor kami hari ini untuk menjadwalkan sesi konsultasi tatap muka maupun daring bersama advokat spesialis kami.
              </p>

              <div className="space-y-3">
                {onOpenConsultation && (
                  <button
                    type="button"
                    onClick={onOpenConsultation}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-primary font-bold text-xs tracking-wider uppercase shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FaPhoneAlt className="w-3.5 h-3.5" />
                    <span>Ajukan Konsultasi Sekarang</span>
                  </button>
                )}

                <a
                  href="tel:+622155508899"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 text-accent" />
                  <span>Hubungi Hotline (021) 5550-8899</span>
                </a>

                <a
                  href="mailto:konsultasi@attarlaw.id"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  <FaEnvelope className="w-3.5 h-3.5 text-accent" />
                  <span>Kirim Email Konsultasi</span>
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 text-[11px] text-gray-400">
              Setiap korespondensi dan data yang disampaikan dijamin kerahasiaannya berdasarkan standar etika profesi advokat.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

