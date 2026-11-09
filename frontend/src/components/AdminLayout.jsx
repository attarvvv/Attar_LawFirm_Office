// Layout utama area internal portal (Sidebar, Topbar, dan Konten)
// Mendukung persistensi status sidebar menciut/melebar di desktop via localStorage
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Fungsi toggle ciutkan / lebarkan sidebar desktop
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch (e) {
        console.error('Gagal menyimpan status sidebar ke localStorage:', e);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar navigasi internal portal */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Area konten utama yang menyesuaikan padding kiri dengan lebar sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Bar navigasi atas */}
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Badan halaman konten utama */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Kaki halaman (footer) */}
        <footer className="py-4 px-6 text-center text-xs text-dark-muted border-t border-gray-200/60 bg-white/50">
          &copy; {new Date().getFullYear()} Attar Lawfirm Office. Seluruh hak cipta dilindungi undang-undang.
        </footer>
      </div>
    </div>
  );
}
