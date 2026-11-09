import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Topbar */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 text-center text-xs text-dark-muted border-t border-gray-200/60 bg-white/50">
          &copy; {new Date().getFullYear()} Attar Lawfirm Office. All rights reserved. &bull; Internal System Step 1
        </footer>
      </div>
    </div>
  );
}

