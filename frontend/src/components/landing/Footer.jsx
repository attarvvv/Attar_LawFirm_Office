// Komponen Footer halaman publik
// Menyajikan ringkasan brand, tautan navigasi cepat, hak cipta, dan tautan Portal Staf
import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';
import { FaShieldAlt, FaBalanceScale } from 'react-icons/fa';

export default function Footer({ onOpenConsultation }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white border-t border-accent/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Kolom 1 & 2: Identitas Kantor */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="normal" inverted={true} />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mt-3">
              Kantor advokat dan penasihat hukum independen yang berdedikasi memberikan solusi hukum berkualitas tinggi, berintegritas, dan terpercaya bagi klien korporasi maupun perorangan.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300">
              <FaBalanceScale className="text-accent" />
              <span>Advokat Terdaftar & Berlisensi Resmi</span>
            </div>
          </div>

          {/* Kolom 3: Tautan Navigasi Cepat */}
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <a href="#beranda" className="hover:text-accent transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#profil" className="hover:text-accent transition-colors">
                  Profil Kantor
                </a>
              </li>
              <li>
                <a href="#visi-misi" className="hover:text-accent transition-colors">
                  Visi & Misi
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Bidang Keahlian
                </a>
              </li>
              <li>
                <a href="#pengacara" className="hover:text-accent transition-colors">
                  Daftar Pengacara
                </a>
              </li>
              <li>
                <a href="#artikel" className="hover:text-accent transition-colors">
                  Artikel & Berita
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="hover:text-accent transition-colors text-left cursor-pointer"
                >
                  Konsultasi Online
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Bidang Keahlian Unggulan */}
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
              Layanan Utama
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Hukum Bisnis & Korporasi
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Sengketa Perdata & Arbitrase
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Hukum Pidana Bisnis
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Hukum Ketenagakerjaan
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors">
                  Hak Kekayaan Intelektual (HAKI)
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 5: Kontak Cepat */}
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
              Sekretariat
            </h4>
            <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
              <p>Menara Keadilan Lt. 18</p>
              <p>SCBD, Jakarta Selatan</p>
              <p className="text-accent font-semibold pt-1">Telp: (021) 5550-8899</p>
              <p className="text-gray-400">Email: office@attarlaw.id</p>
            </div>
          </div>
        </div>

        {/* Baris Hak Cipta & Tautan Masuk Portal Staf */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {currentYear} Attar Lawfirm Office. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </p>

          {/* Tautan Portal Staf dibuat kecil dan rapi di footer agar tidak tampak seperti login klien publik */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[11px] text-gray-400 hover:text-accent transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/5"
              title="Akses Portal Operasional Internal Staf & Advokat"
            >
              <FaShieldAlt className="w-3 h-3 text-accent/70" />
              <span>Portal Staf</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

