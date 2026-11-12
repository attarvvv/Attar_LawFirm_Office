// Komponen navigasi atas (Navbar) publik untuk Halaman Utama
// Menyediakan tautan navigasi anchor section, tombol CTA, dan menu drawer responsif di layar mobile
import React, { useState, useEffect } from 'react';
import BrandLogo from '../BrandLogo';
import { FaBars, FaTimes, FaPhoneAlt } from 'react-icons/fa';

export default function Navbar({ onOpenConsultation }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pantau posisi scroll untuk memberikan efek background navbar yang solid saat digulir
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Daftar tautan menu anchor pada halaman utama
  const navLinks = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Profil', href: '#profil' },
    { name: 'Visi & Misi', href: '#visi-misi' },
    { name: 'Bidang Keahlian', href: '#layanan' },
    { name: 'Pengacara', href: '#pengacara' },
    { name: 'Artikel', href: '#artikel' },
    { name: 'Kontak', href: '#kontak' }
  ];

  // Tutup menu drawer saat tautan diklik pada mobile
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/95 backdrop-blur-md shadow-lg py-3 border-b border-accent/20'
          : 'bg-primary py-4 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Identitas Brand Kantor Hukum */}
          <a href="#beranda" className="flex items-center gap-3 group focus:outline-hidden">
            <BrandLogo size="normal" inverted={true} />
          </a>

          {/* Navigasi Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-wider font-medium text-gray-200 hover:text-accent transition-colors duration-200 py-1"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Tombol CTA Aksi Cepat Konsultasi (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-dark text-primary font-semibold text-xs tracking-wide shadow-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <FaPhoneAlt className="w-3 h-3 text-primary" />
              <span>Konsultasi Sekarang</span>
            </button>
          </div>

          {/* Tombol Menu Hamburger Mobile */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 focus:outline-hidden transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Drawer Mobile (Slide-down) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary-dark/98 border-t border-accent/20 px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={handleLinkClick}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-accent hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  handleLinkClick();
                  if (onOpenConsultation) onOpenConsultation();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-accent text-primary font-semibold text-xs tracking-wider uppercase shadow-md cursor-pointer"
              >
                <FaPhoneAlt className="w-3.5 h-3.5" />
                <span>Konsultasi Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

