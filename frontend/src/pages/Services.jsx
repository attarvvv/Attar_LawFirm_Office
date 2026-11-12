// Halaman Pengelolaan Bidang Keahlian (Services Management)
// Menyediakan daftar bidang keahlian, form tambah/edit dengan pilihan ikon terkurasi, dan aksi hapus
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminServices,
  createService,
  updateService,
  deleteService,
  CURATED_SERVICE_ICONS,
  getServiceIconComponent
} from '../api/services';
import {
  FaBalanceScale,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

export default function Services() {
  const { user, isAdmin } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pencarian
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'FaBalanceScale'
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State Konfirmasi Hapus
  const [deletingId, setDeletingId] = useState(null);

  // Muat data bidang keahlian dari backend
  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminServices();
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data bidang keahlian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filter daftar bidang keahlian berdasarkan kata kunci pencarian
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase().trim();
    return services.filter((s) => {
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      const matchSlug = s.slug?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSlug;
    });
  }, [services, searchQuery]);

  // Buka modal untuk menambah bidang keahlian baru
  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: 'FaBalanceScale'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Buka modal untuk mengedit bidang keahlian
  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || 'FaBalanceScale'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Tutup modal form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormError(null);
  };

  // Submit form tambah atau edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Judul bidang keahlian wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingService) {
        const res = await updateService(editingService.id, formData);
        if (res.success) {
          setServices((prev) =>
            prev.map((item) => (item.id === editingService.id ? res.data : item))
          );
          handleCloseModal();
        }
      } else {
        const res = await createService(formData);
        if (res.success) {
          setServices((prev) => [...prev, res.data]);
          handleCloseModal();
        }
      }
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  // Eksekusi penghapusan bidang keahlian
  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus bidang keahlian "${title}"?`);
    if (!isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await deleteService(id);
      if (res.success) {
        setServices((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus bidang keahlian.');
    } finally {
      setDeletingId(null);
    }
  };

  // Komponen ikon yang sedang aktif terpilih di form
  const SelectedFormIcon = getServiceIconComponent(formData.icon);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Bidang Keahlian
          </h2>
          <p className="text-sm text-dark-muted mt-0.5">
            Kelola bidang keahlian dan layanan hukum kantor yang ditampilkan pada halaman utama publik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadServices}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Muat ulang daftar bidang keahlian"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {isAdmin ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FaPlus className="w-3.5 h-3.5 text-accent" />
              <span>Tambah Bidang Keahlian</span>
            </button>
          ) : (
            <div className="text-xs text-dark-muted bg-gray-100 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <FaInfoCircle className="text-accent" />
              <span>Akses kelola khusus Administrator</span>
            </div>
          )}
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, deskripsi, atau slug..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
          />
        </div>
      </div>

      {/* Pesan Kesalahan */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <div className="p-1 rounded-full bg-red-100 text-red-600">!</div>
          <div className="flex-1">
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadServices}
            className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs animate-pulse space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded-sm w-3/4" />
              <div className="h-3 bg-gray-100 rounded-sm w-full" />
              <div className="h-3 bg-gray-100 rounded-sm w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-cream flex items-center justify-center text-accent mb-3">
            <FaBalanceScale className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-primary">Tidak Ada Bidang Keahlian</h3>
          <p className="text-xs text-dark-muted max-w-sm mx-auto mt-1">
            {searchQuery
              ? `Tidak ditemukan bidang keahlian yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada bidang keahlian yang ditambahkan ke sistem.'}
          </p>
          {isAdmin && !searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs"
            >
              <FaPlus className="w-3.5 h-3.5 text-accent" />
              <span>Tambah Bidang Keahlian Pertama</span>
            </button>
          )}
        </div>
      )}

      {/* Grid Kartu Bidang Keahlian */}
      {!loading && !error && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const IconComponent = getServiceIconComponent(service.icon);
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Header Kartu: Ikon & Aksi */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center text-xl border border-primary/10 shadow-xs">
                      <IconComponent className="text-accent" />
                    </div>

                    {/* Tombol Aksi Admin */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="p-2 text-dark-muted hover:text-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit bidang keahlian"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.title)}
                          disabled={deletingId === service.id}
                          className="p-2 text-dark-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus bidang keahlian"
                        >
                          <FaTrash className={`w-3.5 h-3.5 ${deletingId === service.id ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Judul & Slug */}
                  <h3 className="text-base font-semibold text-primary mb-1">
                    {service.title}
                  </h3>
                  <div className="inline-block px-2 py-0.5 rounded-sm bg-gray-100 text-gray-500 font-mono text-[10px] mb-3">
                    /{service.slug}
                  </div>

                  {/* Deskripsi */}
                  <p className="text-xs text-dark-muted leading-relaxed line-clamp-3">
                    {service.description || 'Belum ada deskripsi untuk bidang keahlian ini.'}
                  </p>
                </div>

                {/* Footer Kartu: Kunci Ikon Info */}
                <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {service.icon || 'FaBalanceScale'}
                  </span>
                  <span>ID #{service.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Bidang Keahlian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between border-b border-primary-light">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent">
                  <FaBalanceScale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    {editingService ? 'Edit Bidang Keahlian' : 'Tambah Bidang Keahlian'}
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    {editingService ? `Memperbarui "${editingService.title}"` : 'Menambahkan spesialisasi hukum baru'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Judul Bidang Keahlian */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">
                  Judul Bidang Keahlian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Hukum Pidana & Tindak Pidana Khusus"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark"
                />
              </div>

              {/* Pilihan Ikon dengan Pratinjau Langsung */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">
                  Ikon Representatif <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cream border border-accent/30 text-accent flex items-center justify-center text-lg shrink-0 shadow-xs">
                    <SelectedFormIcon />
                  </div>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark bg-white"
                  >
                    {CURATED_SERVICE_ICONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Pilih ikon resmi dari daftar kurasi yang paling menggambarkan bidang perkara.
                </p>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan cakupan layanan, jenis pendampingan, atau perkara hukum yang ditangani..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-dark resize-none"
                />
              </div>

              {/* Tombol Aksi Form */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-dark-muted hover:text-dark hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <FaCheck className="w-3.5 h-3.5 text-accent" />
                  <span>{submitting ? 'Menyimpan...' : editingService ? 'Simpan Perubahan' : 'Tambah Bidang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

