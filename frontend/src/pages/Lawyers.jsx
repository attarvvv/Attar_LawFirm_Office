// Halaman Pengelolaan Pengacara (Lawyers Management)
// Menyediakan manajemen data pengacara, filter status, pencarian, dan formulir upload foto WebP
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  fetchLawyers,
  createLawyer,
  updateLawyer,
  toggleLawyerActive,
  deleteLawyer,
  getPhotoUrl
} from '../api/lawyers';
import {
  FaUserTie,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaEnvelope,
  FaPhoneAlt,
  FaBalanceScale,
  FaUpload,
  FaCheck
} from 'react-icons/fa';

export default function Lawyers() {
  const { user, isAdmin } = useAuth();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dan pencarian
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modal Form Tambah / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    bio: '',
    specialization: '',
    email: '',
    phone: '',
    is_active: true
  });

  // State upload foto & pratinjau (preview)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Ref input file
  const fileInputRef = useRef(null);

  // Ambil daftar pengacara dari server
  const loadLawyers = async (search = appliedSearch, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLawyers({ search, status });
      if (res.success) {
        setLawyers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengacara.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLawyers(appliedSearch, statusFilter);
  }, [appliedSearch, statusFilter]);

  // Hitung jumlah pengacara berdasarkan status untuk tab filter
  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    lawyers.forEach((l) => {
      if (l.is_active) active++;
      else inactive++;
    });
    return {
      total: lawyers.length,
      active,
      inactive
    };
  }, [lawyers]);

  // Eksekusi pencarian saat form disubmit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  // Reset pencarian
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
  };

  // Helper membuat inisial nama jika foto pengacara belum ada
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Buka modal tambah pengacara baru
  const handleOpenAddModal = () => {
    setEditingLawyer(null);
    setFormData({
      full_name: '',
      title: '',
      bio: '',
      specialization: '',
      email: '',
      phone: '',
      is_active: true
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setIsModalOpen(true);
  };

  // Buka modal edit data pengacara
  const handleOpenEditModal = (lawyer) => {
    setEditingLawyer(lawyer);
    setFormData({
      full_name: lawyer.full_name || '',
      title: lawyer.title || '',
      bio: lawyer.bio || '',
      specialization: lawyer.specialization || '',
      email: lawyer.email || '',
      phone: lawyer.phone || '',
      is_active: !!lawyer.is_active
    });
    setSelectedFile(null);
    setPreviewUrl(lawyer.photo ? getPhotoUrl(lawyer.photo) : null);
    setFileError(null);
    setIsModalOpen(true);
  };

  // Tutup modal form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLawyer(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
  };

  // Validasi file foto di sisi klien (tipe dan batas ukuran 2MB)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validasi tipe ekstensi/mimetype
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Format file harus JPG, PNG, atau WEBP.');
      setSelectedFile(null);
      return;
    }

    // Validasi ukuran maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 2MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Buat pratinjau URL lokal untuk ditampilkan di formulir
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Simpan data pengacara (Tambah atau Edit)
  const handleSaveLawyer = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.title.trim()) {
      alert('Nama lengkap dan gelar/jabatan advokat wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      // Jika ada file foto yang dipilih, kirim menggunakan FormData multipart
      if (selectedFile) {
        const data = new FormData();
        data.append('full_name', formData.full_name.trim());
        data.append('title', formData.title.trim());
        data.append('bio', formData.bio.trim());
        data.append('specialization', formData.specialization.trim());
        data.append('email', formData.email.trim());
        data.append('phone', formData.phone.trim());
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('photo', selectedFile);

        if (editingLawyer) {
          await updateLawyer(editingLawyer.id, data, true);
        } else {
          await createLawyer(data, true);
        }
      } else {
        // Jika tidak ada foto baru yang diunggah, kirim JSON biasa
        const payload = {
          full_name: formData.full_name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          specialization: formData.specialization.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          is_active: formData.is_active
        };

        if (editingLawyer) {
          await updateLawyer(editingLawyer.id, payload, false);
        } else {
          await createLawyer(payload, false);
        }
      }

      handleCloseModal();
      loadLawyers();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan data pengacara.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status aktif/nonaktif pengacara
  const handleToggleActive = async (lawyer) => {
    const aksi = lawyer.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${aksi} status pengacara ${lawyer.full_name}?`)) return;

    try {
      await toggleLawyerActive(lawyer.id);
      loadLawyers();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status pengacara.');
    }
  };

  // Hapus pengacara dengan penanganan pesan ramah jika terikat jadwal
  const handleDeleteLawyer = async (lawyer) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data pengacara ${lawyer.full_name}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await deleteLawyer(lawyer.id);
      loadLawyers();
    } catch (err) {
      // Tampilkan pesan error ramah dari backend jika diblokir oleh foreign key jadwal janji temu
      alert(err.message || 'Gagal menghapus data pengacara.');
    }
  };

  // Tab filter status
  const filterTabs = [
    { key: 'all', label: 'Semua', count: counts.total },
    { key: 'active', label: 'Aktif', count: counts.active },
    { key: 'inactive', label: 'Nonaktif', count: counts.inactive }
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
            <span>Daftar Pengacara</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent-dark">
              {counts.total} Advokat
            </span>
          </h2>
          <p className="text-sm text-dark-muted mt-0.5">
            Kelola profil tim advokat, bidang keahlian hukum, dan foto resmi kantor hukum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLawyers()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-xs transition-colors focus:outline-none"
            title="Muat ulang daftar"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Tombol Tambah Pengacara (Khusus Administrator) */}
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors focus:outline-none cursor-pointer"
            >
              <FaPlus className="w-3.5 h-3.5 text-accent" />
              <span>Tambah Pengacara</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Status & Kolom Pencarian */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-4">
        {/* Tab Filter Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all focus:outline-none ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-dark-muted hover:bg-cream hover:text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-accent text-primary'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Pencarian */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaSearch className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama advokat, gelar, atau spesialisasi hukum..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-cream/40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Cari
            </button>
            {appliedSearch && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-primary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Pesan Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-center gap-3">
          <FaTimes className="text-red-500 w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && lawyers.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-cream text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            <FaUserTie className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary mb-1">
            Tidak Ada Pengacara Ditemukan
          </h3>
          <p className="text-xs text-dark-muted mb-6 leading-relaxed">
            {appliedSearch || statusFilter !== 'all'
              ? 'Tidak ada pengacara yang cocok dengan filter atau kata kunci pencarian yang dipilih.'
              : 'Belum ada data advokat yang tersimpan dalam sistem.'}
          </p>

          <div className="flex justify-center gap-3">
            {appliedSearch && (
              <button
                onClick={handleResetSearch}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-primary rounded-lg transition-colors"
              >
                Hapus Filter Pencarian
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                + Tambah Pengacara Pertama
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid Kartu Pengacara */}
      {!loading && lawyers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {lawyers.map((item) => {
            const photoUrl = getPhotoUrl(item.photo);
            const statusKey = item.is_active ? 'active' : 'inactive';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Header Kartu: Status Aktif/Nonaktif */}
                <div className="px-5 py-3.5 bg-cream/40 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-xs text-dark-muted">
                    ID #{item.id}
                  </span>
                  <StatusBadge status={statusKey} />
                </div>

                {/* Badan Kartu: Foto, Nama, Gelar, Spesialisasi, Kontak */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    {/* Foto Pengacara atau Avatar Inisial jika belum ada foto */}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={item.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-accent/40 shadow-xs flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary text-accent font-bold flex items-center justify-center text-lg border-2 border-accent/30 shadow-xs flex-shrink-0">
                        {getInitials(item.full_name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-primary leading-tight truncate" title={item.full_name}>
                        {item.full_name}
                      </h4>
                      <p className="text-xs font-semibold text-accent-dark mt-0.5 leading-snug">
                        {item.title}
                      </p>
                      {item.specialization && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-dark-muted">
                          <FaBalanceScale className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2 leading-relaxed text-[11px]">
                            {item.specialization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Biodata Singkat jika ada */}
                  {item.bio && (
                    <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.bio}
                    </div>
                  )}

                  {/* Kontak Internal Pengacara */}
                  <div className="pt-2 border-t border-gray-100/80 space-y-1 text-xs text-dark-muted">
                    {item.email && (
                      <div className="flex items-center gap-2 truncate text-[11px]">
                        <FaEnvelope className="w-3 h-3 text-accent flex-shrink-0" />
                        <a href={`mailto:${item.email}`} className="truncate hover:text-primary hover:underline">
                          {item.email}
                        </a>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <FaPhoneAlt className="w-3 h-3 text-accent flex-shrink-0" />
                        <a href={`tel:${item.phone}`} className="font-mono hover:text-primary hover:underline">
                          {item.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Kartu: Aksi Administrator (Edit, Toggle Aktif, Hapus) */}
                {isAdmin && (
                  <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        item.is_active
                          ? 'text-gray-700 bg-white hover:bg-gray-100 border-gray-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                      title={item.is_active ? 'Nonaktifkan pengacara' : 'Aktifkan kembali pengacara'}
                    >
                      {item.is_active ? (
                        <>
                          <FaToggleOn className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nonaktifkan</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="w-3.5 h-3.5 text-gray-400" />
                          <span>Aktifkan</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg transition-colors shadow-xs"
                        title="Edit data advokat"
                      >
                        <FaEdit className="w-3 h-3 text-accent" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteLawyer(item)}
                        className="p-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-lg transition-colors"
                        title="Hapus data pengacara"
                        aria-label="Hapus pengacara"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit Pengacara */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-primary">
                  {editingLawyer ? 'Edit Profil Pengacara' : 'Tambah Pengacara Baru'}
                </h3>
                <p className="text-xs text-dark-muted">
                  {editingLawyer
                    ? `Perbarui informasi ${editingLawyer.full_name}`
                    : 'Lengkapi biodata advokat resmi kantor hukum'}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Badan Modal (Scrollable) */}
            <form onSubmit={handleSaveLawyer} className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              {/* Bagian Upload Foto dengan Pratinjau */}
              <div>
                <label className="block font-bold text-primary mb-1.5">
                  Foto Profil Resmi (Otomatis dikonversi ke WebP)
                </label>
                <div className="flex items-center gap-4 p-3 bg-cream/40 rounded-xl border border-gray-200">
                  {/* Pratinjau Foto */}
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Pratinjau Foto"
                      className="w-16 h-16 rounded-full object-cover border-2 border-accent shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-gray-300 flex-shrink-0">
                      Foto
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-cream border border-gray-300 text-primary text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <FaUpload className="w-3 h-3 text-accent" />
                      <span>{selectedFile ? 'Ganti Foto Terpilih' : 'Pilih File Foto'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500">
                      Maksimal ukuran 2MB. Format: JPG, PNG, atau WEBP.
                    </p>
                    {fileError && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1">
                        {fileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Nama Lengkap & Gelar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">
                    Nama Lengkap Advokat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Contoh: H. Muhammad Attar, S.H., M.H."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">
                    Gelar / Posisi Advokat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Managing Partner & Senior Advocate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>

              {/* Spesialisasi Hukum */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  Spesialisasi Bidang Hukum
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Contoh: Hukum Bisnis, Litigasi Perdata & Arbitrase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              {/* Email & Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="attar@attarlaw.id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-mono"
                  />
                </div>
              </div>

              {/* Biodata Lengkap */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  Biografi / Profil Ringkas
                </label>
                <textarea
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Pengalaman menangani perkara litigasi, sertifikasi advokat, atau rekam jejak akademis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent leading-relaxed"
                />
              </div>

              {/* Toggle Status Aktif */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="lawyer-is-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-accent accent-primary cursor-pointer"
                />
                <label htmlFor="lawyer-is-active" className="text-xs font-semibold text-primary cursor-pointer">
                  Advokat Aktif (Tampil dalam penugasan jadwal janji temu dan halaman publik)
                </label>
              </div>

              {/* Tombol Simpan Form */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!fileError}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <FaCheck className="w-3 h-3 text-accent" />
                      <span>{editingLawyer ? 'Perbarui Advokat' : 'Simpan Advokat'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

