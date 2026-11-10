// Halaman masuk (Login) portal internal kantor hukum Attar Lawfirm
// Menggunakan layout split: formulir di sisi kiri dan panel visual brand di sisi kanan
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { t } from '../i18n';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Validasi form di sisi klien
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF8F3]">
      {/* Banner Ringkas Mobile (Hanya tampil di layar kecil agar form tetap prioritas utama) */}
      <div className="lg:hidden bg-primary px-6 py-4 flex items-center justify-between border-b border-accent/20">
        <BrandLogo size="normal" inverted={true} />
        <span className="text-[10px] tracking-wider uppercase font-semibold text-accent/80">
          Internal Portal
        </span>
      </div>

      {/* SISI KIRI: Formulir Login (~40-50% desktop, full di mobile) */}
      <div className="w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-[#FAF8F3] overflow-y-auto">
        {/* Header Logo di Desktop */}
        <div className="hidden lg:block">
          <BrandLogo size="normal" />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Selamat Datang
            </h2>
            <p className="mt-2 text-sm text-dark-muted">
              Masuk ke akun Anda untuk mengakses portal operasional Attar Lawfirm.
            </p>
          </div>

          {/* Banner notifikasi jika login gagal */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <FaExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-red-800 font-medium leading-relaxed">
                {serverError}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Input Alamat Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                {t('email')}
              </label>
              <div className="relative rounded-xl shadow-xs">
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
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
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

            {/* Input Kata Sandi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-primary uppercase tracking-wider"
                >
                  {t('password')}
                </label>
              </div>
              <div className="relative rounded-xl shadow-xs">
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
                  className={`block w-full pl-10 pr-11 py-2.5 sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-accent focus:ring-accent/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Tombol Aksi Login Warna Accent Emas (#C2A878) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-primary bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('loggingIn')}</span>
                  </div>
                ) : (
                  t('loginBtn')
                )}
              </button>
            </div>
          </form>

          {/* Tautan Menuju Pendaftaran Akun Staf */}
          <div className="mt-6 pt-6 border-t border-gray-200/80 text-center">
            <p className="text-xs sm:text-sm text-dark-muted">
              {t('noAccount')}{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:text-accent-dark transition-colors underline underline-offset-4"
              >
                {t('registerHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Catatan Kebijakan Keamanan */}
        <p className="text-center text-[11px] text-dark-muted mt-6">
          Akses terbatas hanya untuk staf & advokat berwenang Attar Lawfirm.
        </p>
      </div>

      {/* SISI KANAN: Panel Visual Brand (Primary #14342B solid + Elemen Dekoratif CSS) */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[58%] bg-primary relative overflow-hidden flex-col items-center justify-center p-12 text-white select-none">
        {/* Dekorasi Garis Geometris CSS Murni */}
        <div className="absolute inset-10 border border-accent/20 rounded-3xl pointer-events-none" />
        <div className="absolute inset-16 border border-accent/10 rounded-2xl pointer-events-none" />

        {/* Gradasi Radial Lembut Emas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,168,120,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Konten Identitas Kantor Hukum */}
        <div className="relative z-10 max-w-lg text-center space-y-6">
          {/* Ikon Timbangan Skala Besar dengan Frame Elegan */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-5xl shadow-2xl backdrop-blur-xs">
            ⚖️
          </div>

          <div>
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Attar <span className="text-accent">Lawfirm</span> Office
            </h1>
            <p className="text-xs uppercase tracking-widest text-accent/80 font-medium mt-1">
              Internal Legal Practice & Advisory Portal
            </p>
          </div>

          <p className="text-sm xl:text-base text-gray-200/90 leading-relaxed font-light">
            Solusi tata kelola perkara hukum internal yang andal, aman, dan berintegritas tinggi untuk mengawal keadilan setiap klien.
          </p>

          {/* Nilai-Nilai Kantor Hukum */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-accent/80 font-medium">
            <span>Integritas</span>
            <span>&bull;</span>
            <span>Profesionalisme</span>
            <span>&bull;</span>
            <span>Kerahasiaan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
