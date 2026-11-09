import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { t } from '../i18n';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

// Halaman login staf dan administrator kantor hukum
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rute tujuan yang sebelumnya dicoba diakses sebelum diarahkan ke halaman login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Tangani perubahan nilai input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error inline saat pengguna mulai mengetik ulang
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Validasi form di sisi klien sebelum dikirim ke server
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = t('errEmailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t('errEmailInvalid');
      }
    }

    if (!formData.password) {
      newErrors.password = t('errPasswordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proses pengiriman form login ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    const result = await login(formData.email.trim(), formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.message || 'Email atau kata sandi tidak valid.');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo dan identitas kantor hukum */}
        <div className="flex justify-center mb-6">
          <BrandLogo size="large" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          {t('loginTitle')}
        </h2>
        <p className="mt-2 text-sm text-dark-muted">
          {t('loginSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-gray-200/80">
          {/* Banner notifikasi jika login gagal */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <FaExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 font-medium">
                {serverError}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Input alamat email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1.5">
                {t('email')}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-accent focus:ring-accent/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Input kata sandi dengan tombol lihat/sembunyikan */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-primary mb-1.5"
              >
                {t('password')}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('passwordPlaceholder')}
                  className={`block w-full pl-10 pr-11 py-2.5 sm:text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-accent focus:ring-accent/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Tombol aksi login */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('loggingIn')}</span>
                  </div>
                ) : (
                  t('loginBtn')
                )}
              </button>
            </div>
          </form>

          {/* Tautan menuju halaman pendaftaran staf */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-dark-muted">
              {t('noAccount')}{' '}
              <Link
                to="/register"
                className="font-semibold text-accent-dark hover:text-primary transition-colors underline underline-offset-4"
              >
                {t('registerHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Catatan kebijakan keamanan sistem */}
        <p className="mt-6 text-center text-xs text-dark-muted">
          Sistem hanya untuk personel berwenang Attar Lawfirm. Semua aktivitas dicatat secara aman.
        </p>
      </div>
    </div>
  );
}
