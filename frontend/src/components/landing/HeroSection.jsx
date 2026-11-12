// Komponen Hero Section utama halaman publik
// Menampilkan nama firma, tagline, tombol CTA, dan elemen visual dekoratif berbasis CSS murni
import React from 'react';
import { FaShieldAlt, FaBalanceScale, FaAward, FaUserCheck, FaChevronRight } from 'react-icons/fa';

export default function HeroSection({ onOpenConsultation }) {
  return (
    <section
      id="beranda"
      className="relative min-h-[92vh] flex items-center justify-center bg-primary text-white pt-28 pb-20 overflow-hidden"
    >
      {/* Elemen Dekoratif CSS Murni: Gradien Ambient & Pola Geometris */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent-light blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-primary-light blur-2xl" />
      </div>

      {/* Grid Pattern CSS Halus */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(to right, #C2A878 1px, transparent 1px), linear-gradient(to bottom, #C2A878 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Label Badge Kantor Hukum */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-accent/40 text-accent-light text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-xs">
          <FaBalanceScale className="w-3.5 h-3.5 text-accent" />
          <span>Kantor Advokat & Konsultan Hukum Terpercaya</span>
        </div>

        {/* Judul Utama Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight lg:leading-tight text-white mb-6">
          Integritas, Strategi Hukum Unggul, dan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent">
            Keadilan Tanpa Kompromi
          </span>
        </h1>

        {/* Tagline & Deskripsi Pengantar */}
        <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Attar Lawfirm Office mendedikasikan keahlian hukum komprehensif dalam menangani sengketa perdata, perkara pidana, kepatuhan korporasi, hingga transaksi bisnis strategis dengan standar etika profesional tertinggi.
        </p>

        {/* Tombol Aksi CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Tombol Konsultasi Sekarang membuka modal formulir konsultasi online */}
          <button
            type="button"
            onClick={onOpenConsultation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-primary font-bold text-sm tracking-wide shadow-xl shadow-accent/20 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Konsultasi Sekarang</span>
            <FaChevronRight className="w-3 h-3 text-primary" />
          </button>

          {/* Tombol Eksplorasi Bidang Keahlian */}
          <a
            href="#layanan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            <span>Jelajahi Bidang Keahlian</span>
          </a>
        </div>

        {/* Indikator Rekam Jejak & Kepercayaan (Trust Stats) */}
        <div className="pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <FaAward className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">15+ Tahun</p>
              <p className="text-[11px] text-gray-400">Pengalaman Litigasi & Konsultasi</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <FaShieldAlt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Ratusan Kasus</p>
              <p className="text-[11px] text-gray-400">Perkara Bisnis & Perdata Tuntas</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <FaUserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Berlisensi PERADI</p>
              <p className="text-[11px] text-gray-400">Tim Advokat Resmi Bersumpah</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <FaBalanceScale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">100% Konfidensial</p>
              <p className="text-[11px] text-gray-400">Jaminan Kerahasiaan Klien</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

