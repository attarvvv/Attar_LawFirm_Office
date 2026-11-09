import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { t } from '../i18n';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaNewspaper,
  FaBalanceScale,
  FaComments,
  FaUsersCog,
  FaTimes,
  FaShieldAlt,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // Daftar navigasi: Hanya Dashboard dan Janji Temu yang memiliki rute aktif saat ini
  const navItems = [
    { name: t('navDashboard'), path: '/admin/dashboard', icon: FaTachometerAlt },
    { name: t('navAppointments'), path: '/admin/appointments', icon: FaCalendarAlt },
    { name: t('navConsultations'), path: '#', icon: FaComments, isPlaceholder: true },
    { name: t('navArticles'), path: '#', icon: FaNewspaper, isPlaceholder: true },
    { name: t('navLawyers'), path: '#', icon: FaBalanceScale, isPlaceholder: true },
  ];

  return (
    <>
      {/* Overlay latar belakang untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-primary text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl border-r border-accent/20`}
      >
        {/* Header Wordmark */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-primary-light">
          <BrandLogo size="normal" inverted={true} />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-300 hover:text-accent rounded-lg focus:outline-none"
            aria-label="Tutup menu navigasi"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Bagian Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {/* Menu Utama */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent/80">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !item.isPlaceholder && location.pathname === item.path;

                // Jika menu masih berupa placeholder (belum ada halaman)
                if (item.isPlaceholder) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-primary-light/50 hover:text-gray-200 transition-colors cursor-default select-none"
                      title="Modul ini belum tersedia"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-accent/60" />
                        <span>{item.name}</span>
                      </div>
                    </div>
                  );
                }

                // Menu yang sudah aktif (Dashboard & Janji Temu)
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-primary font-semibold shadow-sm'
                        : 'text-gray-200 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-accent'}`} />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bagian Khusus Administrator (Hanya tampil jika user adalah admin) */}
          {isAdmin && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-accent/80">
                <span>{t('adminOnlySection')}</span>
                <FaShieldAlt className="text-accent/60 w-3 h-3" />
              </div>

              <div className="space-y-1">
                <a
                  href="#manage-users"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-primary-light hover:text-white transition-colors border border-accent/30 bg-primary-light/50"
                >
                  <div className="flex items-center gap-3">
                    <FaUsersCog className="w-4 h-4 text-accent" />
                    <span>{t('navManageUsers')}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bar Sesi Pengguna & Tombol Logout */}
        <div className="p-4 border-t border-primary-light bg-primary-dark/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-accent text-primary font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.nama}</p>
              <div className="mt-0.5">
                <span className="text-[10px] uppercase font-medium text-accent tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                logout();
              }
            }}
            className="p-2 text-gray-300 hover:text-red-400 hover:bg-primary-light rounded-lg transition-colors focus:outline-none flex-shrink-0"
            title="Keluar dari sistem"
            aria-label="Keluar dari sistem"
          >
            <FaSignOutAlt className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
