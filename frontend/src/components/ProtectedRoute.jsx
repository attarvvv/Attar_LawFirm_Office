import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards routes against unauthenticated requests.
 * Supports optional Role-Based Access Control (RBAC) via `allowedRoles`.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Array<string>} [props.allowedRoles] - e.g. ['admin'], ['admin', 'lawyer']
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-primary">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-dark-muted tracking-wide animate-pulse">
          Memverifikasi sesi aman...
        </p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving attempted path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation if specified
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-200 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Akses Terbatas</h2>
          <p className="text-sm text-dark-muted mb-6">
            Akun Anda terdaftar sebagai <span className="font-semibold text-primary uppercase">{user?.role}</span> dan tidak memiliki otorisasi untuk mengakses halaman ini.
          </p>
          <a
            href="/admin/dashboard"
            className="inline-block px-5 py-2.5 bg-primary text-accent font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}

