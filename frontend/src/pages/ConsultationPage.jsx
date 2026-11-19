// Halaman Publik Khusus Permohonan Konsultasi Hukum Online (ConsultationPage)
// Menyediakan formulir lengkap pendaftaran jadwal temu advokat dengan integrasi API backend dan informasi jaminan kerahasiaan
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { fetchPublicServices } from '../api/services';
import { submitPublicConsultation } from '../api/consultations';
import heroOfficeImg from '../assets/hero-office.webp';
import {
  FaCheckCircle,
  FaBalanceScale,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaFileAlt,
  FaArrowRight,
  FaShieldAlt,
  FaClock,
  FaMapMarkerAlt,
  FaLock,
  FaArrowLeft,
  FaSpinner
} from 'react-icons/fa';

export default function ConsultationPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // State data formulir
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    message: '',
    requested_date: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Batas minimum tanggal pertemuan adalah hari ini (format YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Set judul dokumen untuk SEO dan kenyamanan pengguna
  useEffect(() => {
    document.title = 'Konsultasi Hukum Online - Attar Lawfirm Office';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let isMounted = true;
    const loadServices = async () => {
      try {
        const res = await fetchPublicServices();
        if (isMounted && res.success) {
          setServices(res.data || []);
        }
      } catch (err) {
        console.warn('Gagal memuat kategori layanan hukum:', err.message);
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    };

    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validasi input klien sebelum submit
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.client_name.trim()) {
      errors.client_name = 'Nama lengkap wajib diisi.';
    }

    if (!formData.client_email.trim()) {
      errors.client_email = 'Alamat email aktif wajib diisi.';
    } else if (!emailRegex.test(formData.client_email.trim())) {
      errors.client_email = 'Format alamat email tidak valid.';
    }

    if (!formData.client_phone.trim()) {
      errors.client_phone = 'Nomor telepon atau WhatsApp aktif wajib diisi.';
    } else if (formData.client_phone.trim().replace(/\D/g, '').length < 8) {
      errors.client_phone = 'Nomor telepon minimal 8 digit angka.';
    }

    if (!formData.service_id) {
      errors.service_id = 'Silakan pilih bidang keahlian/kategori perkara.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Keterangan atau uraian singkat perkara wajib diisi.';
    }

    if (!formData.requested_date) {
      errors.requested_date = 'Pilih tanggal pertemuan yang Anda inginkan.';
    } else if (formData.requested_date < todayStr) {
      errors.requested_date = 'Tanggal pertemuan tidak boleh di masa lampau.';
    }

    return errors;
  };

  // Tangani pengiriman formulir konsultasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim(),
        client_phone: formData.client_phone.trim(),
        service_id: parseInt(formData.service_id, 10),
        message: formData.message.trim(),
        requested_date: formData.requested_date
      };

      const res = await submitPublicConsultation(payload);

      if (res.success) {
        setIsSuccess(true);
        setSubmittedData(payload);
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    } catch (err) {
      setServerError(err.message || 'Terjadi kesalahan sistem saat mengirim permohonan konsultasi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form untuk pengajuan perkara lainnya
  const handleResetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      service_id: '',
      message: '',
      requested_date: ''
    });
    setFormErrors({});
    setServerError(null);
    setIsSuccess(false);
    setSubmittedData(null);
  };

  // Format tanggal bahasa Indonesia untuk kartu sukses
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-dark flex flex-col justify-between selection:bg-accent selection:text-primary">
      {/* Navigasi Utama */}
      <Navbar />

      <main className="flex-1">
        {/* Banner Header Halaman Konsultasi dengan Latar Foto Hero Office */}
        <section className="relative bg-primary text-white pt-36 pb-24 overflow-hidden">
          {/* Foto Latar Belakang Sinematik Ruang Kerja Kantor Hukum */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-102"
            style={{ backgroundImage: `url(${heroOfficeImg})` }}
          />

          {/* Lapisan Gradien Gelap: Pekat untuk Keterbacaan Teks Maksimal */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/98 via-primary/90 to-primary/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/70" />

          {/* Garis Grid Dekoratif */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(to right, #C2A878 1px, transparent 1px), linear-gradient(to bottom, #C2A878 1px, transparent 1px)',
              backgroundSize: '4rem 4rem'
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            {/* Tautan Kembali ke Beranda */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-white transition-colors mb-6 group"
            >
              <FaArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              <span>Kembali ke Halaman Utama</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
              Formulir Konsultasi Hukum Online
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed font-normal">
              Sampaikan kebutuhan dan pokok permasalahan hukum Anda secara langsung kepada tim advokat kami. Kami menyediakan pendampingan profesional berbasis integritas dan kepastian hukum.
            </p>
          </div>
        </section>

        {/* Konten Utama: 2 Kolom Formulir & Info Sekretariat */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-24 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Formulir Permohonan atau Tampilan Sukses */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-200/80 p-6 sm:p-10">
              {isSuccess ? (
                // State Berhasil Terkirim (Success Screen)
                <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <FaCheckCircle className="w-10 h-10" />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h2 className="text-2xl font-bold text-primary">
                      Permohonan Konsultasi Berhasil Terkirim!
                    </h2>
                    <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                      Terima kasih, <strong className="text-primary">{submittedData?.client_name}</strong>. Permohonan konsultasi Anda telah masuk ke sistem operasional internal kantor kami.
                    </p>
                  </div>

                  {/* Ringkasan Data yang Dikirim */}
                  <div className="max-w-md mx-auto p-4 rounded-xl bg-cream border border-gray-200/80 text-left text-xs space-y-2">
                    <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="text-dark-muted">Tanggal Pertemuan Diajukan:</span>
                      <span className="font-semibold text-primary">{formatIndoDate(submittedData?.requested_date)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                      <span className="text-dark-muted">Nomor WhatsApp/Telepon:</span>
                      <span className="font-semibold text-primary">{submittedData?.client_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Alamat Email:</span>
                      <span className="font-semibold text-primary">{submittedData?.client_email}</span>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary leading-relaxed text-left flex items-start gap-3">
                    <FaClock className="text-accent w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Tim administrasi dan advokat Attar Lawfirm akan meninjau berkas perkara Anda dalam waktu 1x24 jam kerja dan menghubungi Anda via WhatsApp atau telepon untuk penetapan jadwal janji temu resmi.
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all text-center"
                    >
                      Kembali ke Beranda
                    </Link>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cream hover:bg-gray-100 text-primary border border-gray-200 text-xs font-bold tracking-wider uppercase transition-colors"
                    >
                      Ajukan Konsultasi Lain
                    </button>
                  </div>
                </div>
              ) : (
                // Tampilan Formulir Konsultasi
                <div>
                  <div className="border-b border-gray-100 pb-5 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">
                      Lengkapi Informasi Permohonan
                    </h2>
                    <p className="text-xs sm:text-sm text-dark-muted mt-1">
                      Silakan isi formulir di bawah ini dengan lengkap untuk memudahkan advokat kami mempelajari pokok perkara Anda.
                    </p>
                  </div>

                  {serverError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                      <span className="font-bold shrink-0">Gagal:</span>
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Baris 1: Nama Lengkap & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1.5">
                          Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          <input
                            type="text"
                            value={formData.client_name}
                            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                            placeholder="Contoh: Hendra Kusuma, S.E."
                            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark ${
                              formErrors.client_name ? 'border-red-400' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {formErrors.client_name && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors.client_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-primary mb-1.5">
                          Alamat Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          <input
                            type="email"
                            value={formData.client_email}
                            onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                            placeholder="nama@email.com"
                            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark ${
                              formErrors.client_email ? 'border-red-400' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {formErrors.client_email && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors.client_email}</p>
                        )}
                      </div>
                    </div>

                    {/* Baris 2: Nomor Telepon & Tanggal Pertemuan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-primary mb-1.5">
                          Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          <input
                            type="tel"
                            value={formData.client_phone}
                            onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                            placeholder="081234567890"
                            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark font-mono ${
                              formErrors.client_phone ? 'border-red-400' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-dark-muted mt-1">
                          Nomor aktif yang dapat dihubungi untuk konfirmasi WhatsApp.
                        </p>
                        {formErrors.client_phone && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors.client_phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-primary mb-1.5">
                          Tanggal Janji Temu Diharapkan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                          <input
                            type="date"
                            min={todayStr}
                            value={formData.requested_date}
                            onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                            className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark ${
                              formErrors.requested_date ? 'border-red-400' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <p className="text-[10px] text-dark-muted mt-1">
                          Pilihan tanggal tatap muka di kantor SCBD atau daring.
                        </p>
                        {formErrors.requested_date && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors.requested_date}</p>
                        )}
                      </div>
                    </div>

                    {/* Kategori Bidang Keahlian */}
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        Kategori Permasalahan Hukum <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaBalanceScale className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                        <select
                          value={formData.service_id}
                          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                          disabled={loadingServices}
                          className={`w-full pl-9 pr-8 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark ${
                            formErrors.service_id ? 'border-red-400' : 'border-gray-300'
                          }`}
                        >
                          <option value="">
                            {loadingServices ? 'Memuat bidang keahlian...' : '-- Pilih Bidang Keahlian Hukum --'}
                          </option>
                          {services.map((svc) => (
                            <option key={svc.id} value={svc.id}>
                              {svc.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.service_id && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.service_id}</p>
                      )}
                    </div>

                    {/* Keterangan / Uraian Perkara */}
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">
                        Keterangan & Rincian Perkara <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaFileAlt className="absolute left-3.5 top-3 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                        <textarea
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Jelaskan ringkasan permasalahan hukum Anda secara singkat, pihak yang terlibat, serta dokumen pokok yang telah Anda miliki..."
                          className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border bg-cream/40 focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent text-dark leading-relaxed ${
                            formErrors.message ? 'border-red-400' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {formErrors.message && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.message}</p>
                      )}
                    </div>

                    {/* Catatan Jaminan Kerahasiaan */}
                    <div className="p-3.5 rounded-xl bg-cream border border-accent/30 flex items-start gap-3 text-xs text-primary">
                      <FaShieldAlt className="text-accent w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-dark-muted leading-relaxed">
                        <strong className="text-primary font-semibold">Jaminan Hak Konfidensial:</strong> Seluruh data, identitas, dan berkas yang Anda cantumkan dilindungi oleh hak kerahasiaan hubungan Advokat-Klien sesuai UU No. 18 Tahun 2003 tentang Advokat.
                      </p>
                    </div>

                    {/* Tombol Kirim Permohonan */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-60 text-primary font-bold text-xs tracking-wider uppercase shadow-lg shadow-accent/20 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin text-primary" />
                            <span>Mengirim Permohonan...</span>
                          </>
                        ) : (
                          <>
                            <span>Kirim Permohonan Konsultasi</span>
                            <FaArrowRight className="w-3 h-3 text-primary" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Kolom Kanan: Informasi Sekretariat & Nilai Layanan */}
            <div className="lg:col-span-4 space-y-6">
              {/* Kartu Keunggulan Layanan Konsultasi */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 space-y-4">
                <h3 className="text-sm font-bold text-primary pb-3 border-b border-gray-100 flex items-center gap-2">
                  <FaBalanceScale className="text-accent w-4 h-4" />
                  <span>Standar Advokasi Kami</span>
                </h3>

                <div className="space-y-3.5 text-xs text-dark-muted">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary block font-semibold">Analisis Yuridis Terukur</strong>
                      <span>Penelaahan kasus berbasis bukti dan yurisprudensi terbaru.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary block font-semibold">Advokat Bersumpah PERADI</strong>
                      <span>Didampingi langsung oleh praktisi berlisensi resmi.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-primary block font-semibold">Fleksibilitas Pertemuan</strong>
                      <span>Tersedia tatap muka di SCBD Jakarta atau daring via Google Meet.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu Kontak & Sekretariat Kantor */}
              <div className="bg-primary text-white rounded-2xl shadow-lg p-6 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-accent/15 rounded-bl-full pointer-events-none" />

                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Sekretariat & Hotline
                </h3>

                <div className="space-y-3 text-xs text-gray-300">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-accent w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Kantor Pusat</strong>
                      <p>Menara Keadilan Lt. 18, SCBD, Jakarta Selatan</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaClock className="text-accent w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Jam Pelayanan</strong>
                      <p>Senin – Jumat: 09:00 – 18:00 WIB</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaPhoneAlt className="text-accent w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Hotline Telepon</strong>
                      <p className="text-accent font-semibold">(021) 5550-8899</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-accent w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold">Surat Elektronik</strong>
                      <p>office@attarlaw.id</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu Portal Staf */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-dark-muted flex items-center justify-between shadow-xs">
                <div>
                  <p className="font-bold text-primary">Staf atau Advokat Internal?</p>
                  <p className="text-[11px] text-gray-400">Masuk ke sistem kelola jadwal</p>
                </div>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg bg-cream hover:bg-gray-100 text-primary border border-gray-200 text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FaLock className="text-accent w-3 h-3" />
                  <span>Portal Staf</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Halaman */}
      <Footer />
    </div>
  );
}
