// Halaman pendaftaran (Register) akun staf internal kantor hukum Attar Lawfirm
// Menggunakan layout split: formulir di sisi kiri dan panel visual brand di sisi kanan
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { t } from '../i18n';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle
} from 'react-icons/fa';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tangani perubahan nilai input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  // Validasi form registrasi di sisi klien
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = t('errNameRequired');
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = t('errPasswordMin');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errConfirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errPasswordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kirim data registrasi ke server backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    const result = await register(
      formData.nama.trim(),
      formData.email.trim(),
      formData.password
    );

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(t('registerSuccess'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setServerError(result.message || 'Registrasi gagal.');
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

      {/* SISI KIRI: Formulir Registrasi (~40-50% desktop, full di mobile) */}
      <div className="w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-[#FAF8F3] overflow-y-auto">
        {/* Header Logo di Desktop */}
        <div className="hidden lg:block">
          <BrandLogo size="normal" />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-dark-muted">
              {t('registerSubtitle')}
            </p>
          </div>

          {/* Pemberitahuan kebijakan pembatasan peran pendaftaran publik */}
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <FaInfoCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              {t('registerNotice')}
            </p>
          </div>

          {/* Banner notifikasi sukses */}
          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <FaCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-emerald-800 font-medium">
                {successMessage}
              </div>
            </div>
          )}

          {/* Banner notifikasi error */}
          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <FaExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-red-800 font-medium leading-relaxed">
                {serverError}
              </div>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
            {/* Input Nama Lengkap */}
            <div>
              <label htmlFor="nama" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {t('fullName')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="h-4 w-4" />
                </div>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder={t('fullNamePlaceholder')}
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.nama
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-accent focus:ring-accent/20'
                  }`}
                />
              </div>
              {errors.nama && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.nama}</p>
              )}
            </div>

            {/* Input Alamat Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
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
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Input Kata Sandi */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {t('password')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Input Konfirmasi Kata Sandi */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1"
              >
                {t('confirmPassword')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={`block w-full pl-10 pr-11 py-2.5 sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-accent focus:ring-accent/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Tombol Aksi Registrasi Warna Accent Emas (#C2A878) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-primary bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('registering')}</span>
                  </div>
                ) : (
                  t('registerBtn')
                )}
              </button>
            </div>
          </form>

          {/* Tautan Kembali ke Halaman Login */}
          <div className="mt-6 pt-6 border-t border-gray-200/80 text-center">
            <p className="text-xs sm:text-sm text-dark-muted">
              {t('haveAccount')}{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-accent-dark transition-colors underline underline-offset-4"
              >
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Catatan Hak Akses */}
        <p className="text-center text-[11px] text-dark-muted mt-6">
          Pendaftaran publik ini hanya berlaku untuk peran Staf Operasional.
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
            Bergabunglah dengan tim operasional profesional Attar Lawfirm untuk memberikan pelayanan hukum yang transparan dan terpercaya.
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
