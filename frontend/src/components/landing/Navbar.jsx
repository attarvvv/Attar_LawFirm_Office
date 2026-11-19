// Komponen navigasi atas (Navbar) publik dengan desain floating capsule modern
// Menampilkan logo brand, kapsul tautan menu di tengah, serta tombol CTA dan shortcut di sisi kanan
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../BrandLogo';
import { FaBars, FaTimes, FaArrowRight, FaLock } from 'react-icons/fa';

export default function Navbar({ onOpenConsultation }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pantau posisi scroll untuk penyesuaian intensitas backdrop navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper resolusi tautan anchor jika diakses dari luar halaman beranda
  const getLinkHref = (href) => (location.pathname === '/' ? href : `/${href}`);

  // Daftar tautan menu navigasi anchor
  const navLinks = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Profil', href: '#profil' },
    { name: 'Visi & Misi', href: '#visi-misi' },
    { name: 'Layanan', href: '#layanan' },
    { name: 'Pengacara', href: '#pengacara' },
    { name: 'Artikel', href: '#artikel' },
    { name: 'Kontak', href: '#kontak' }
  ];

  // Tutup menu drawer mobile saat tautan diklik
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/95 backdrop-blur-md shadow-xl py-3 border-b border-accent/20'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identitas Brand Kantor Hukum */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden shrink-0">
            <BrandLogo size="normal" inverted={true} />
          </Link>

          {/* Kapsul Menu Navigasi Tengah (Desktop - Gaya Kapsul Putih Floating) */}
          <div className="hidden lg:flex items-center bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/40">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={getLinkHref(link.href)}
                  className="text-xs font-semibold text-primary hover:text-accent-dark tracking-wide transition-colors duration-150"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Kelompok Aksi Kanan (Tombol CTA & Shortcut Portal) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Tombol CTA Utama Konsultasi Kapsul Aksen — Direct ke Halaman Konsultasi */}
            <Link
              to="/konsultasi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-dark text-primary font-bold text-xs tracking-wider uppercase shadow-lg shadow-accent/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Konsultasi</span>
              <FaArrowRight className="w-2.5 h-2.5 text-primary" />
            </Link>

            {/* Tombol Akses Portal Staf / Login Internal Bulat */}
            <Link
              to="/login"
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg border border-white/40"
              title="Akses Portal Internal Staf & Advokat"
            >
              <FaLock className="w-3 h-3 text-primary" />
            </Link>
          </div>

          {/* Tombol Menu Hamburger Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="w-9 h-9 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md focus:outline-hidden transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
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
                href={getLinkHref(link.href)}
                onClick={handleLinkClick}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-accent hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                to="/konsultasi"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-accent text-primary font-bold text-xs tracking-wider uppercase shadow-md cursor-pointer"
              >
                <span>Konsultasi Sekarang</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>

              <Link
                to="/login"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-white/10 text-white font-semibold text-xs border border-white/20"
              >
                <FaLock className="w-3 h-3 text-accent" />
                <span>Portal Internal Staf</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

