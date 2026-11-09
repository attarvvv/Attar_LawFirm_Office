import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchMe, logoutUser } from '../api/auth';

// Context autentikasi untuk mengelola state login di seluruh aplikasi
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verifikasi sesi pengguna saat aplikasi pertama kali dimuat
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetchMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          // Reset token jika sesi telah kedaluwarsa atau tidak valid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  // Fungsi proses login pengguna
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        return { success: true };
      }
    } catch (err) {
      setError(err.message || 'Login gagal.');
      return { success: false, message: err.message };
    }
  };

  // Fungsi proses registrasi staf baru
  const register = async (nama, email, password) => {
    setError(null);
    try {
      const res = await registerUser({ nama, email, password });
      return { success: true, message: res.message, user: res.user };
    } catch (err) {
      setError(err.message || 'Registrasi gagal.');
      return { success: false, message: err.message };
    }
  };

  // Fungsi proses logout dan pembersihan sesi lokal
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Terjadi kesalahan saat memanggil API logout:', err);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isLawyer: user?.role === 'lawyer',
    isStaff: user?.role === 'staff'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook kustom untuk mengakses context autentikasi
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
