// Komponen sidebar navigasi utama internal portal
// Mendukung mode penuh dan rel ikon (collapsed) di desktop serta laci di mobile
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { t } from '../i18n';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaInbox,
  FaNewspaper,
  FaUserTie,
  FaBalanceScale,
  FaUsersCog,
  FaTimes,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // Daftar navigasi: Dashboard, Janji Temu, Konsultasi Masuk, Pengacara, Bidang Keahlian, dan Artikel adalah rute aktif
  const navItems = [
    { name: t('navDashboard'), path: '/admin/dashboard', icon: FaTachometerAlt },
    { name: t('navAppointments'), path: '/admin/appointments', icon: FaCalendarAlt },
    { name: t('navConsultations'), path: '/admin/consultations', icon: FaInbox },
    { name: t('navLawyers'), path: '/admin/lawyers', icon: FaUserTie },
    { name: t('navServices'), path: '/admin/services', icon: FaBalanceScale },
    { name: t('navArticles'), path: '/admin/articles', icon: FaNewspaper },
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-primary text-white flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-72'
        } shadow-xl border-r border-accent/20`}
      >
        {/* Header Wordmark & Tombol Ciutkan / Tutup */}
        <div
          className={`h-20 flex items-center border-b border-primary-light transition-all ${
            isCollapsed
              ? 'justify-center flex-col p-2'
              : 'justify-between px-6'
          }`}
        >
          <BrandLogo size="normal" inverted={true} iconOnly={isCollapsed} />

          {/* Tombol ciutkan/lebarkan sidebar khusus desktop */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex p-1.5 text-gray-300 hover:text-accent hover:bg-primary-light rounded-lg transition-colors focus:outline-none ${
              isCollapsed ? 'mt-1' : ''
            }`}
            title={isCollapsed ? 'Perluas Menu Sidebar' : 'Ciutkan Menu Sidebar'}
            aria-label={isCollapsed ? 'Perluas Menu Sidebar' : 'Ciutkan Menu Sidebar'}
          >
            {isCollapsed ? (
              <FaChevronRight className="w-3.5 h-3.5" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Tombol tutup drawer mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-300 hover:text-accent rounded-lg focus:outline-none"
            aria-label="Tutup menu navigasi"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Bagian Navigasi */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {/* Menu Utama */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent/80">
                Menu Utama
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = !item.isPlaceholder && location.pathname === item.path;

                // Jika menu masih berupa placeholder (belum ada halaman)
                if (item.isPlaceholder) {
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center rounded-lg text-sm font-medium text-gray-400 hover:bg-primary-light/50 hover:text-gray-200 transition-colors cursor-default select-none ${
                        isCollapsed
                          ? 'justify-center p-3'
                          : 'justify-between px-3.5 py-2.5'
                      }`}
                      title={item.name + ' (Segera Hadir)'}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <Icon className="w-4 h-4 text-accent/60 flex-shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </div>
                    </div>
                  );
                }

                // Menu yang sudah aktif (Dashboard, Janji Temu, dan Konsultasi Masuk)
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={item.name}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                      isCollapsed
                        ? 'justify-center p-3'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-accent text-primary font-semibold shadow-xs'
                        : 'text-gray-200 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-accent'}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bagian Khusus Administrator (Hanya tampil jika user adalah admin) */}
          {isAdmin && (
            <div>
              {!isCollapsed ? (
                <>
                  <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-accent/80">
                    <span>{t('adminOnlySection')}</span>
                    <FaShieldAlt className="text-accent/60 w-3 h-3" />
                  </div>

                  <div className="space-y-1">
                    <a
                      href="#manage-users"
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-primary-light hover:text-white transition-colors border border-accent/30 bg-primary-light/50"
                      title={t('navManageUsers')}
                    >
                      <div className="flex items-center gap-3">
                        <FaUsersCog className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{t('navManageUsers')}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex justify-center py-2 border-t border-primary-light/60">
                  <a
                    href="#manage-users"
                    className="p-3 rounded-lg text-accent hover:bg-primary-light hover:text-white transition-colors border border-accent/30 bg-primary-light/50 flex items-center justify-center"
                    title={`${t('navManageUsers')} (Khusus Administrator)`}
                  >
                    <FaUsersCog className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bar Sesi Pengguna & Tombol Logout */}
        <div
          className={`border-t border-primary-light bg-primary-dark/70 transition-all ${
            isCollapsed
              ? 'p-3 flex flex-col items-center gap-3'
              : 'p-4 flex items-center justify-between gap-3'
          }`}
        >
          <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div
              className="w-9 h-9 rounded-full bg-accent text-primary font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0 cursor-default"
              title={`${user?.nama || 'Pengguna'} (${user?.role || 'Staff'})`}
            >
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-xs font-semibold text-white truncate leading-tight" title={user?.nama}>
                  {user?.nama}
                </p>
                <div className="mt-1.5">
                  <span className="inline-block text-[10px] uppercase font-bold text-accent tracking-wider bg-accent/15 px-2 py-0.5 rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            )}
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
