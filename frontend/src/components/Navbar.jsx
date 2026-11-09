import React from 'react';
import { t } from '../i18n';
import { FaBars } from 'react-icons/fa';

// Komponen bar navigasi atas (topbar)
export default function Navbar({ onOpenSidebar, isCollapsed, onToggleCollapse }) {
  return (
    <header className="h-20 bg-white border-b border-gray-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Tombol menu samping dan judul portal */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Tombol laci mobile */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-lg text-primary hover:bg-cream transition-colors focus:outline-none"
          aria-label="Buka menu navigasi mobile"
        >
          <FaBars className="w-5 h-5" />
        </button>

        {/* Tombol toggle ciutkan sidebar untuk layar desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg text-primary hover:bg-cream hover:text-accent-dark transition-colors focus:outline-none border border-gray-200"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          <FaBars className="w-4 h-4" />
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
