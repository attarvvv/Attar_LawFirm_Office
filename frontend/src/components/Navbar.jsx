import React from 'react';
import { t } from '../i18n';
import { FaBars } from 'react-icons/fa';

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="h-20 bg-white border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Sisi Kiri: Tombol Hamburger Mobile & Judul Halaman */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-lg text-primary hover:bg-cream transition-colors focus:outline-none"
          aria-label="Buka menu samping"
        >
          <FaBars className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="hidden sm:block text-xs text-dark-muted">
            Kantor Hukum Attar &bull; Internal Management System
          </p>
        </div>
      </div>
    </header>
  );
}
