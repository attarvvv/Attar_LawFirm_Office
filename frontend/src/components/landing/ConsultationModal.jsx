// Komponen Modal Formulir Permohonan Konsultasi Publik (ConsultationModal)
// Menampilkan form lengkap pengajuan konsultasi online dengan validasi tanggal dan integrasi layanan
import React, { useState, useEffect } from 'react';
import { fetchPublicServices } from '../../api/services';
import { submitPublicConsultation } from '../../api/consultations';
import {
  FaTimes,
  FaCheckCircle,
  FaBalanceScale,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaFileAlt
} from 'react-icons/fa';

export default function ConsultationModal({ isOpen, onClose }) {
  const [services, setServices] = useState([]);
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

  // Ambil tanggal hari ini dalam format YYYY-MM-DD sebagai batas minimum pemilihan tanggal
  const todayStr = new Date().toISOString().split('T')[0];

  // Muat daftar bidang keahlian untuk dropdown kategori permasalahan
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadServices = async () => {
      try {
        const res = await fetchPublicServices();
        if (isMounted && res.success) {
          setServices(res.data || []);
        }
      } catch (err) {
        console.warn('Gagal memuat daftar bidang keahlian:', err.message);
      }
    };

    loadServices();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Reset state form saat modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setServerError(null);
      setFormErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validasi input klien sebelum submit ke server
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.client_name.trim()) {
      errors.client_name = 'Nama lengkap wajib diisi.';
    }

    if (!formData.client_email.trim()) {
      errors.client_email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(formData.client_email.trim())) {
      errors.client_email = 'Format alamat email tidak valid.';
    }

    if (!formData.client_phone.trim()) {
      errors.client_phone = 'Nomor telepon/WhatsApp wajib diisi.';
    } else if (formData.client_phone.trim().length < 8) {
      errors.client_phone = 'Nomor telepon minimal 8 digit.';
    }

    if (!formData.service_id) {
      errors.service_id = 'Pilih kategori permasalahan hukum.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Keterangan atau keluhan hukum wajib diisi.';
    }

    if (!formData.requested_date) {
      errors.requested_date = 'Pilih tanggal pertemuan yang diinginkan.';
    } else if (formData.requested_date < todayStr) {
      errors.requested_date = 'Tanggal pertemuan tidak boleh di masa lalu.';
    }

    return errors;
  };

  // Tangani pengiriman form
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
      const res = await submitPublicConsultation({
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim(),
        client_phone: formData.client_phone.trim(),
        service_id: parseInt(formData.service_id, 10),
        message: formData.message.trim(),
        requested_date: formData.requested_date
      });

      if (res.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      setServerError(err.message || 'Terjadi kesalahan saat mengirim permohonan konsultasi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between border-b border-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-accent">
              <FaBalanceScale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Konsultasi Hukum Online</h3>
              <p className="text-[11px] text-gray-300">
                Sampaikan permohonan konsultasi langsung kepada kantor kami
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tampilan Konfirmasi Berhasil */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
              <FaCheckCircle />
            </div>
            <h4 className="text-xl font-bold text-primary">Permohonan Konsultasi Diterima</h4>
            <p className="text-xs sm:text-sm text-dark-muted max-w-sm mx-auto leading-relaxed">
              Permintaan konsultasi Anda telah kami terima. Tim kami akan segera meninjau dan mengirimkan konfirmasi jadwal resmi melalui WhatsApp atau email yang Anda daftarkan.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Pengajuan Konsultasi */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {serverError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
                {serverError}
              </div>
            )}

            {/* 1. Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Contoh: Pratama Wibowo"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
                />
              </div>
              {formErrors.client_name && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.client_name}</p>
              )}
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
                />
              </div>
              {formErrors.client_email && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.client_email}</p>
              )}
            </div>

            {/* 3. No. Telepon / WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                No. Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
                />
              </div>
              <p className="text-[10px] text-dark-muted mt-0.5">
                Nomor ini akan menerima notifikasi konfirmasi resmi jadwal pertemuan via WhatsApp.
              </p>
              {formErrors.client_phone && (
                <p className="text-[11px] text-red-500 mt-0.5">{formErrors.client_phone}</p>
              )}
            </div>

            {/* 4. Kategori Permasalahan */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                Kategori Permasalahan Hukum <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark bg-white"
              >
                <option value="">-- Pilih Bidang Keahlian / Masalah --</option>
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.title}
                  </option>
                ))}
              </select>
              {formErrors.service_id && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.service_id}</p>
              )}
            </div>

            {/* 5. Keterangan / Keluhan */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                Keterangan / Keluhan Hukum <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Uraikan secara singkat permasalahan atau sengketa hukum yang sedang Anda hadapi..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark resize-none"
              />
              {formErrors.message && (
                <p className="text-[11px] text-red-500 mt-0.5">{formErrors.message}</p>
              )}
            </div>

            {/* 6. Tanggal Janji Temu yang Diinginkan */}
            <div>
              <label className="block text-xs font-semibold text-dark mb-1">
                Tanggal Janji Temu yang Diinginkan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={formData.requested_date}
                  onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark bg-white"
                />
              </div>
              <p className="text-[10px] text-dark-muted mt-0.5">
                Pilih tanggal yang paling sesuai; jam pertemuan akan dikonfirmasi oleh tim kami.
              </p>
              {formErrors.requested_date && (
                <p className="text-[11px] text-red-500 mt-0.5">{formErrors.requested_date}</p>
              )}
            </div>

            {/* Tombol Kirim Form */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-dark-muted hover:text-dark hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-primary bg-accent hover:bg-accent-dark rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Mengirim Permohonan...' : 'Kirim Permohonan Konsultasi'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

