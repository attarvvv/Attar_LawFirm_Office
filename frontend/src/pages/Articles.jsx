// Halaman Pengelolaan Artikel & Berita (Articles Management)
// Menyediakan CRUD artikel edukasi hukum, rich text editor, filter status/kategori, dan manajemen kategori
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CategoryModal from '../components/CategoryModal';
import { fetchCategories } from '../api/categories';
import {
  fetchAdminArticles,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  getThumbnailUrl
} from '../api/articles';
import {
  FaNewspaper,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFolder,
  FaTimes,
  FaUpload,
  FaCheck,
  FaEye,
  FaUser,
  FaCalendarAlt,
  FaGlobeAmericas,
  FaFileAlt
} from 'react-icons/fa';

export default function Articles() {
  const { user, isAdmin } = useAuth();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter dan pencarian
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modal Kategori
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Modal Baca / Pratinjau
  const [previewArticle, setPreviewArticle] = useState(null);

  // Modal Form Tambah / Edit Artikel
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    content: '',
    status: 'draft'
  });

  // State upload thumbnail
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Muat daftar kategori untuk dropdown filter & form
  const loadCategoriesData = async () => {
    try {
      const res = await fetchCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.warn('Gagal memuat kategori:', err.message);
    }
  };

  // Muat daftar artikel dari server
  const loadArticlesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminArticles({
        status: statusFilter,
        category: categoryFilter,
        search: appliedSearch
      });
      if (res.success) {
        setArticles(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesData();
  }, []);

  useEffect(() => {
    loadArticlesData();
  }, [statusFilter, categoryFilter, appliedSearch]);

  // Eksekusi pencarian
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  // Reset pencarian
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
  };

  // Buka modal tambah artikel baru
  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      content: '',
      status: 'draft'
    });
    setSelectedFile(null);
    setPreviewThumbnailUrl(null);
    setFileError(null);
    setIsFormModalOpen(true);
  };

  // Buka modal edit artikel
  const handleOpenEditModal = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      category_id: String(article.category_id || ''),
      content: article.content || '',
      status: article.status || 'draft'
    });
    setSelectedFile(null);
    setPreviewThumbnailUrl(article.thumbnail ? getThumbnailUrl(article.thumbnail) : null);
    setFileError(null);
    setIsFormModalOpen(true);
  };

  // Tutup modal form
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingArticle(null);
    setSelectedFile(null);
    setPreviewThumbnailUrl(null);
    setFileError(null);
  };

  // Validasi file thumbnail di sisi klien
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Format file harus JPG, PNG, atau WEBP.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 2MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewThumbnailUrl(objectUrl);
  };

  // Simpan artikel (Tambah atau Edit)
  const handleSaveArticle = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Judul artikel wajib diisi.');
      return;
    }
    if (!formData.category_id) {
      alert('Pilih kategori artikel terlebih dahulu.');
      return;
    }
    if (!formData.content || !formData.content.trim() || formData.content === '<p><br></p>') {
      alert('Isi konten artikel tidak boleh kosong.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedFile) {
        const data = new FormData();
        data.append('title', formData.title.trim());
        data.append('category_id', formData.category_id);
        data.append('content', formData.content);
        data.append('status', formData.status);
        data.append('thumbnail', selectedFile);

        if (editingArticle) {
          await updateArticle(editingArticle.id, data, true);
        } else {
          await createArticle(data, true);
        }
      } else {
        const payload = {
          title: formData.title.trim(),
          category_id: parseInt(formData.category_id, 10),
          content: formData.content,
          status: formData.status
        };

        if (editingArticle) {
          await updateArticle(editingArticle.id, payload, false);
        } else {
          await createArticle(payload, false);
        }
      }

      handleCloseFormModal();
      loadArticlesData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan artikel.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status publikasi artikel (draft <-> published)
  const handleToggleStatus = async (article) => {
    const isPublishing = article.status === 'draft';
    const actionText = isPublishing ? 'mempublikasikan' : 'menjadikan draf';

    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} artikel '${article.title}'?`)) {
      return;
    }

    try {
      await updateArticleStatus(article.id, isPublishing ? 'published' : 'draft');
      loadArticlesData();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status artikel.');
    }
  };

  // Hapus artikel permanen
  const handleDeleteArticle = async (article) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus artikel '${article.title}'? Tindakan ini permanen.`)) {
      return;
    }

    try {
      await deleteArticle(article.id);
      loadArticlesData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus artikel.');
    }
  };

  // Format tanggal dalam bahasa Indonesia
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Cek apakah pengguna saat ini berhak mengubah/menghapus artikel (penulis artikel asli atau admin)
  const canUserManage = (article) => {
    if (isAdmin) return true;
    return user && article.author_id === user.id;
  };

  // Konfigurasi toolbar editor Quill
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean']
    ]
  };

  // Daftar tab filter status
  const filterTabs = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'published', label: 'Dipublikasikan', count: stats.published },
    { key: 'draft', label: 'Draf', count: stats.draft }
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Artikel & Berita
          </h2>
          <p className="text-sm text-dark-muted mt-0.5">
            Publikasikan tulisan edukasi hukum, studi kasus perkara, dan berita resmi kantor hukum.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => loadArticlesData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-xs transition-colors focus:outline-none cursor-pointer"
            title="Muat ulang daftar artikel"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Tombol Kelola Kategori (Khusus Administrator) */}
          {isAdmin && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-xs transition-colors focus:outline-none cursor-pointer"
              title="Kelola Kategori Artikel"
            >
              <FaFolder className="w-3.5 h-3.5 text-accent" />
              <span>Kelola Kategori</span>
            </button>
          )}

          {/* Tombol Buat Artikel (Dapat diakses oleh seluruh pengguna internal: admin, lawyer, staff) */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors focus:outline-none cursor-pointer"
          >
            <FaPlus className="w-3.5 h-3.5 text-accent" />
            <span>Tulis Artikel Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Status, Kategori & Pencarian */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-4">
        {/* Tab Filter Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all focus:outline-none cursor-pointer ${
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

        {/* Filter Kategori & Input Pencarian */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Dropdown Kategori */}
          <div className="w-full sm:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-cream/40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium text-primary cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name} ({cat.articles_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaSearch className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul artikel..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-cream/40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Cari
            </button>
            {appliedSearch && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-primary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
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
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs animate-pulse space-y-3"
            >
              <div className="h-40 bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-cream text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            <FaNewspaper className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary mb-1">
            Tidak Ada Artikel Ditemukan
          </h3>
          <p className="text-xs text-dark-muted mb-6 leading-relaxed">
            {appliedSearch || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ada artikel yang cocok dengan filter atau kata kunci pencarian yang dipilih.'
              : 'Belum ada tulisan artikel atau berita yang dibuat dalam sistem.'}
          </p>

          <div className="flex justify-center gap-3">
            {appliedSearch && (
              <button
                onClick={handleResetSearch}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-primary rounded-lg transition-colors cursor-pointer"
              >
                Hapus Filter Pencarian
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              + Buat Artikel Pertama
            </button>
          </div>
        </div>
      )}

      {/* Grid Kartu Artikel */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((item) => {
            const thumbUrl = getThumbnailUrl(item.thumbnail);
            const userAllowed = canUserManage(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Gambar Thumbnail atau Placeholder */}
                <div className="relative h-44 w-full bg-cream/70 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-accent/70 select-none">
                      <FaNewspaper className="w-10 h-10" />
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-primary/60">
                        Attar Lawfirm
                      </span>
                    </div>
                  )}

                  {/* Badge Status Publikasi */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Badan Kartu */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="inline-block text-[11px] font-semibold text-accent-dark tracking-wide uppercase">
                      {item.category_name || 'Umum'}
                    </span>

                    <h4
                      className="text-base font-bold text-primary leading-snug line-clamp-2 hover:text-accent-dark transition-colors cursor-pointer"
                      onClick={() => setPreviewArticle(item)}
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                  </div>

                  {/* Metadata Penulis & Waktu */}
                  <div className="pt-3 border-t border-gray-100 text-xs text-dark-muted space-y-1">
                    <div className="flex items-center gap-2">
                      <FaUser className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="truncate">{item.author_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <FaCalendarAlt className="w-3 h-3 text-accent flex-shrink-0" />
                      <span>
                        {item.status === 'published'
                          ? `Terbit: ${formatDateIndo(item.published_at)}`
                          : `Dibuat: ${formatDateIndo(item.created_at)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Kartu: Tombol Aksi */}
                <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Tombol Pratinjau / Baca */}
                  <button
                    onClick={() => setPreviewArticle(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg transition-colors shadow-xs cursor-pointer"
                    title="Lihat isi artikel"
                  >
                    <FaEye className="w-3 h-3 text-accent" />
                    <span>Baca</span>
                  </button>

                  {/* Tombol Khusus Penulis / Admin */}
                  {userAllowed && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          item.status === 'published'
                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        }`}
                        title={item.status === 'published' ? 'Jadikan Draf' : 'Terbitkan Sekarang'}
                      >
                        {item.status === 'published' ? (
                          <>
                            <FaFileAlt className="w-3 h-3" />
                            <span>Draf</span>
                          </>
                        ) : (
                          <>
                            <FaGlobeAmericas className="w-3 h-3" />
                            <span>Terbitkan</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        title="Edit artikel"
                      >
                        <FaEdit className="w-3.5 h-3.5 text-accent" />
                      </button>

                      <button
                        onClick={() => handleDeleteArticle(item)}
                        className="p-1.5 text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        title="Hapus artikel"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Kelola Kategori */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoriesUpdated={() => {
          loadCategoriesData();
          loadArticlesData();
        }}
      />

      {/* Modal Form Tambah / Edit Artikel */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Header Modal Form */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-primary">
                  {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Edukasi Hukum'}
                </h3>
                <p className="text-xs text-dark-muted">
                  {editingArticle
                    ? `Perbarui konten artikel "${editingArticle.title}"`
                    : 'Tuliskan ulasan hukum yang bermanfaat bagi masyarakat dan klien.'}
                </p>
              </div>

              <button
                onClick={handleCloseFormModal}
                className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Badan Form Modal (Scrollable) */}
            <form onSubmit={handleSaveArticle} className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              {/* Judul Artikel */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  Judul Artikel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Panduan Lengkap Hukum Waris dan Pembagian Harta Menurut KUHPerdata..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-medium"
                />
              </div>

              {/* Kategori, Status & Penulis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kategori */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-primary">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                      >
                        + Kategori Baru
                      </button>
                    )}
                  </div>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Publikasi */}
                <div>
                  <label className="block font-bold text-primary mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
                  >
                    <option value="draft">Draf (Belum Terbit)</option>
                    <option value="published">Publikasikan Sekarang</option>
                  </select>
                </div>

                {/* Penulis (Read-Only) */}
                <div>
                  <label className="block font-bold text-primary mb-1">
                    Penulis Konten
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.nama || 'Petugas Internal'}
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Upload Gambar Thumbnail */}
              <div>
                <label className="block font-bold text-primary mb-1.5">
                  Gambar Thumbnail Artikel (Otomatis dikonversi ke WebP)
                </label>
                <div className="flex items-center gap-4 p-3 bg-cream/40 rounded-xl border border-gray-200">
                  {previewThumbnailUrl ? (
                    <img
                      src={previewThumbnailUrl}
                      alt="Thumbnail Preview"
                      className="w-24 h-16 rounded-lg object-cover border border-accent shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded-lg bg-primary/10 text-primary font-medium flex items-center justify-center text-xs border border-gray-300 flex-shrink-0">
                      Thumbnail
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
                      className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-cream border border-gray-300 text-primary text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <FaUpload className="w-3 h-3 text-accent" />
                      <span>{selectedFile ? 'Ganti File Gambar' : 'Pilih Gambar'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500">
                      Maksimal 2MB. Format: JPG, PNG, atau WEBP.
                    </p>
                    {fileError && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1">
                        {fileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rich Text Editor Konten Artikel */}
              <div>
                <label className="block font-bold text-primary mb-1.5">
                  Isi Konten Artikel <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Tuliskan ulasan hukum, pasal-pasal rujukan, dan panduan hukum di sini..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              {/* Tombol Simpan Form */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
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
                      <span>{editingArticle ? 'Perbarui Artikel' : 'Simpan Artikel'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baca / Pratinjau Artikel */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header Modal Pratinjau */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-cream text-primary border border-accent/20">
                    {previewArticle.category_name}
                  </span>
                  <StatusBadge status={previewArticle.status} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-primary mt-1">
                  {previewArticle.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-dark-muted">
                  <span>Oleh: {previewArticle.author_name}</span>
                  <span>&bull;</span>
                  <span>
                    {previewArticle.status === 'published'
                      ? `Terbit: ${formatDateIndo(previewArticle.published_at)}`
                      : `Dibuat: ${formatDateIndo(previewArticle.created_at)}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPreviewArticle(null)}
                className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors cursor-pointer flex-shrink-0"
                aria-label="Tutup"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Badan Pratinjau Konten */}
            <div className="overflow-y-auto space-y-4 flex-1 pr-2 text-sm leading-relaxed">
              {previewArticle.thumbnail && (
                <img
                  src={getThumbnailUrl(previewArticle.thumbnail)}
                  alt={previewArticle.title}
                  className="w-full max-h-72 object-cover rounded-xl border border-gray-200"
                />
              )}

              {/* Render Konten dengan Sanitasi DOMPurify */}
              <div
                className="prose prose-sm max-w-none text-dark leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(previewArticle.content || '')
                }}
              />
            </div>

            {/* Footer Modal Pratinjau */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

