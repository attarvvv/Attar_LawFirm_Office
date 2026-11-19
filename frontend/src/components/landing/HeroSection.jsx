// Komponen Hero Section utama halaman publik dengan latar belakang foto sinematik penuh dan kartu floating fitur
// Menampilkan headline bertenaga, badge status, tombol aksi kapsul elegan, dan indikator kepercayaan
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaBalanceScale, FaAward, FaUserCheck, FaArrowRight } from 'react-icons/fa';
import heroOfficeImg from '../../assets/hero-office.webp';

export default function HeroSection({ onOpenConsultation }) {
  return (
    <section
      id="beranda"
      className="relative min-h-screen flex flex-col justify-between bg-primary text-white pt-32 sm:pt-36 pb-12 overflow-hidden"
    >
      {/* Foto Latar Belakang Sinematik Penuh (Full-Cover Law Office) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-102"
        style={{ backgroundImage: `url(${heroOfficeImg})` }}
      />

      {/* Lapisan Gradien Gelap: Pekat di Sisi Kiri untuk Keterbacaan Teks Maksimal */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/98 via-primary/90 to-primary/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/60" />

      {/* Pola Garis Grid Halus CSS */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(to right, #C2A878 1px, transparent 1px), linear-gradient(to bottom, #C2A878 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* Konten Utama Hero (Kiri Sinematik & Kartu Floating Kanan Bawah) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          {/* Kolom Kiri: Headline, Tagline, dan Tombol Aksi Kapsul */}
          <div className="lg:col-span-8 text-left">
            {/* Judul Utama Headline Bold & Masif */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white mb-4">
              Integritas & Strategi Hukum, <br className="hidden sm:inline" />
              Menegakkan Keadilan.
            </h1>

            {/* Sub-headline Aksen Emas */}
            <p className="text-sm sm:text-base font-semibold text-accent mb-4 tracking-wide">
              Mitra Hukum Tepercaya dalam Litigasi & Kepatuhan Korporasi.
            </p>

            {/* Paragraf Pengantar Singkat */}
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 max-w-xl font-normal">
              Attar Lawfirm Office mendedikasikan pemahaman yuridis mendalam dan integritas tanpa kompromi untuk melindungi hak serta kepentingan bisnis Anda di seluruh Indonesia.
            </p>

            {/* Kelompok Tombol CTA Bergaya Kapsul Modern Sesuai Referensi Desain */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Tombol Utama Kapsul Putih — Direct ke Halaman Konsultasi Online */}
              <Link
                to="/konsultasi"
                className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white hover:bg-cream text-primary font-bold text-xs uppercase tracking-wider shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Konsultasi Sekarang</span>
                <div className="w-8 h-8 rounded-full bg-accent group-hover:bg-accent-dark flex items-center justify-center text-primary transition-colors">
                  <FaArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Tombol Sekunder Kapsul Gelap Berbingkai Halus */}
              <a
                href="#layanan"
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/30 font-semibold text-xs uppercase tracking-wider backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <span>Jelajahi Bidang Keahlian</span>
                <FaArrowRight className="w-3 h-3 text-accent group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Kolom Kanan Bawah: Kartu Mini Fitur Mengambang (/01) Sesuai Referensi */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="hidden lg:flex items-center gap-4 bg-white/95 backdrop-blur-md text-primary p-4 rounded-2xl shadow-2xl border border-white/50 max-w-xs animate-in fade-in duration-500">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-primary">/01</span>
                  <div className="w-8 h-0.5 bg-accent rounded-full" />
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                    <span>‹</span>
                    <span>›</span>
                  </div>
                </div>
                <p className="text-[11px] text-dark leading-snug font-medium">
                  Riset yuridis komprehensif & penanganan perkara berbasis bukti nyata.
                </p>
              </div>

              {/* Pratinjau Foto Ruang Kerja Berbingkai Kecil */}
              <div className="relative w-16 h-14 rounded-xl overflow-hidden shadow-inner shrink-0 bg-primary-dark">
                <img
                  src={heroOfficeImg}
                  alt="Pratinjau Riset Hukum"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-xs">
                    <FaBalanceScale className="w-3 h-3 text-accent-dark" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Bawah: Metrik Kepercayaan (Trust Stats) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-accent/40 flex items-center justify-center text-accent shrink-0 backdrop-blur-xs">
              <FaAward className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white">15+ Tahun</p>
              <p className="text-[11px] text-gray-300">Pengalaman Litigasi & Konsultasi</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-accent/40 flex items-center justify-center text-accent shrink-0 backdrop-blur-xs">
              <FaShieldAlt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white">Ratusan Kasus</p>
              <p className="text-[11px] text-gray-300">Perkara Bisnis & Perdata Tuntas</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-accent/40 flex items-center justify-center text-accent shrink-0 backdrop-blur-xs">
              <FaUserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white">Berlisensi PERADI</p>
              <p className="text-[11px] text-gray-300">Tim Advokat Resmi Bersumpah</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-accent/40 flex items-center justify-center text-accent shrink-0 backdrop-blur-xs">
              <FaBalanceScale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white">100% Konfidensial</p>
              <p className="text-[11px] text-gray-300">Jaminan Kerahasiaan Klien</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

