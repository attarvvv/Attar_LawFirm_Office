import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Consultations from './pages/Consultations';
import Lawyers from './pages/Lawyers';
import Articles from './pages/Articles';

export default function App() {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rute Terproteksi Internal Portal */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Appointments />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/consultations"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Consultations />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lawyers"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Lawyers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      {/* Alias untuk Janji Temu, Konsultasi, Pengacara, dan Artikel */}
      <Route path="/admin/janji-temu" element={<Navigate to="/admin/appointments" replace />} />
      <Route path="/admin/konsultasi" element={<Navigate to="/admin/consultations" replace />} />
      <Route path="/admin/pengacara" element={<Navigate to="/admin/lawyers" replace />} />
      <Route path="/admin/articles" element={<ProtectedRoute><AdminLayout><Articles /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/artikel" element={<Navigate to="/admin/articles" replace />} />

      {/* Pengalihan Default */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
