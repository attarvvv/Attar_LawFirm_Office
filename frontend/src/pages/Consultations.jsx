// Halaman Konsultasi Masuk (Consultations Inbox)
// Menampilkan daftar pesan konsultasi dari klien publik dengan filter status, pencarian, dan modal detail
import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import {
  fetchConsultations,
  fetchConsultationDetail,
  updateConsultationStatus,
  seedSampleConsultations
} from '../api/consultations';
import {
  FaInbox,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaEnvelope,
  FaPhoneAlt,
  FaBalanceScale,
  FaClock,
  FaCheckDouble,
  FaEye
} from 'react-icons/fa';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk filter status dan input pencarian
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // State untuk modal detail pesan
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Ambil daftar konsultasi dari backend
  const loadConsultations = async (status = statusFilter, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchConsultations({ status, search });
      if (res.success) {
        setConsultations(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data konsultasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations(statusFilter, appliedSearch);
  }, [statusFilter, appliedSearch]);

  // Eksekusi pencarian saat form disubmit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  // Reset pencarian ke kondisi awal
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
  };

  // Buka detail pesan dan otomatis tandai telah dibaca jika sebelumnya unread
  const handleOpenDetail = async (item) => {
    setActiveModalItem(item);
    setModalLoading(true);

    try {
      // Backend akan otomatis memperbarui status unread menjadi read pada endpoint detail
      const res = await fetchConsultationDetail(item.id);
      if (res.success && res.data) {
        setActiveModalItem(res.data);
        // Perbarui item di daftar lokal agar tampilan status langsung sinkron
        setConsultations((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, status: res.data.status } : c))
        );
        // Jika status sebelumnya unread, kurangi counter unread dan tambah counter read
        if (item.status === 'unread') {
          setStats((prev) => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            read: prev.read + 1
          }));
        }
      }
    } catch (err) {
      console.error('Gagal mengambil detail konsultasi:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Ubah status konsultasi (misalnya: 'replied' atau 'archived')
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await updateConsultationStatus(id, { status: newStatus });
      // Perbarui modal aktif jika sedang dibuka
      if (activeModalItem && activeModalItem.id === id) {
        setActiveModalItem((prev) => ({ ...prev, status: newStatus }));
      }
      // Muat ulang daftar konsultasi dan statistik
      loadConsultations(statusFilter, appliedSearch);
    } catch (err) {
      alert(err.message || 'Gagal mengubah status konsultasi.');
    } finally {
      setActionLoading(false);
    }
  };

  // Muat data contoh jika database masih kosong
  const handleSeedData = async () => {
    if (!window.confirm('Muat data contoh konsultasi masuk ke dalam database?')) return;
    setLoading(true);
    try {
      const res = await seedSampleConsultations();
      if (res.success) {
        setConsultations(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      alert(err.message || 'Gagal memuat data contoh.');
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal dan waktu dalam bahasa Indonesia
  const formatDateTimeIndo = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch {
      return dateTimeStr;
    }
  };

  // Daftar tab filter status
  const filterTabs = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'unread', label: 'Belum Dibaca', count: stats.unread },
    { key: 'read', label: 'Dibaca', count: stats.read },
    { key: 'replied', label: 'Dibalas', count: stats.replied },
    { key: 'archived', label: 'Diarsipkan', count: stats.archived }
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
            <span>Konsultasi Masuk</span>
            {stats.unread > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent-dark">
                {stats.unread} pesan baru
              </span>
            )}
          </h2>
          <p className="text-sm text-dark-muted mt-0.5">
            Daftar permohonan konsultasi hukum online dari formulir kontak klien publik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadConsultations()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-xs transition-colors focus:outline-none"
            title="Muat ulang daftar konsultasi"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {consultations.length === 0 && !loading && (
            <button
              onClick={handleSeedData}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-xs transition-colors focus:outline-none"
            >
              + Muat Data Contoh
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
              placeholder="Cari berdasarkan nama klien, email, nomor telepon, atau subjek..."
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
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && consultations.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-cream text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            <FaInbox className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary mb-1">
            Tidak Ada Konsultasi Ditemukan
          </h3>
          <p className="text-xs text-dark-muted mb-6 leading-relaxed">
            {appliedSearch || statusFilter !== 'all'
              ? 'Tidak ada pesan yang cocok dengan filter atau kata kunci pencarian yang dipilih.'
              : 'Belum ada permohonan konsultasi masuk yang tercatat di sistem.'}
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
            <button
              onClick={handleSeedData}
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              + Muat 5 Data Contoh
            </button>
          </div>
        </div>
      )}

      {/* Grid Kartu Konsultasi */}
      {!loading && consultations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {consultations.map((item) => {
            const isUnread = item.status === 'unread';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md ${
                  isUnread
                    ? 'border-accent/60 shadow-xs'
                    : 'border-gray-200/90 shadow-xs'
                }`}
              >
                {/* 1. Header Kartu: Layanan & StatusBadge */}
                <div className="px-5 py-3.5 bg-cream/40 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FaBalanceScale className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span className="text-xs font-semibold text-primary truncate">
                      {item.service_title || 'Konsultasi Umum'}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {/* 2. Body Kartu: Subjek, Klien, Waktu Masuk, Pratinjau Pesan */}
                <div className="p-5 space-y-3.5 flex-1">
                  <div>
                    <h4
                      className={`text-sm leading-snug line-clamp-2 ${
                        isUnread
                          ? 'font-bold text-primary'
                          : 'font-semibold text-gray-800'
                      }`}
                    >
                      {item.subject}
                    </h4>

                    {/* Informasi Pengirim */}
                    <div className="mt-2.5 space-y-1 text-xs text-dark-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary truncate">
                          {item.client_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 truncate text-[11px]">
                        <FaEnvelope className="w-3 h-3 text-accent flex-shrink-0" />
                        <span className="truncate">{item.client_email}</span>
                      </div>
                      {item.client_phone && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <FaPhoneAlt className="w-3 h-3 text-accent flex-shrink-0" />
                          <span className="font-mono">{item.client_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Waktu Masuk */}
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <FaClock className="w-3 h-3 text-accent" />
                    <span>{formatDateTimeIndo(item.created_at)}</span>
                  </div>

                  {/* Pratinjau Pesan */}
                  <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {item.message}
                  </div>
                </div>

                {/* 3. Footer Kartu: Tombol Aksi Cepat */}
                <div
                  className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    {item.status !== 'replied' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'replied')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                        title="Tandai konsultasi ini telah dibalas"
                      >
                        <FaCheckDouble className="w-3 h-3" />
                        <span>Tandai Dibalas</span>
                      </button>
                    )}

                    {item.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'archived')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        title="Arsipkan pesan konsultasi"
                      >
                        <span>Arsipkan</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDetail(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg transition-colors shadow-xs"
                    title="Buka pesan lengkap"
                  >
                    <FaEye className="w-3 h-3 text-accent" />
                    <span>Lihat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Konsultasi */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-cream text-primary border border-accent/20">
                    {activeModalItem.service_title || 'Konsultasi Umum'}
                  </span>
                  <StatusBadge status={activeModalItem.status} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-primary mt-1">
                  {activeModalItem.subject}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <FaClock className="w-3 h-3 text-accent" />
                  <span>Diterima pada {formatDateTimeIndo(activeModalItem.created_at)}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"
                aria-label="Tutup detail modal"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Badan Modal (Scrollable) */}
            <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              {/* Ringkasan Profil Pengirim */}
              <div className="p-3.5 rounded-xl bg-cream/60 border border-gray-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Data Klien Pengirim
                  </span>
                </div>
                <p className="text-sm font-bold text-primary">
                  {activeModalItem.client_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-muted">
                  <div className="flex items-center gap-1.5">
                    <FaEnvelope className="text-accent w-3 h-3" />
                    <a
                      href={`mailto:${activeModalItem.client_email}`}
                      className="hover:underline hover:text-primary"
                    >
                      {activeModalItem.client_email}
                    </a>
                  </div>
                  {activeModalItem.client_phone && (
                    <div className="flex items-center gap-1.5">
                      <FaPhoneAlt className="text-accent w-3 h-3" />
                      <a
                        href={`tel:${activeModalItem.client_phone}`}
                        className="hover:underline hover:text-primary font-mono"
                      >
                        {activeModalItem.client_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Isi Pesan Konsultasi */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                  Isi Pesan Konsultasi
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-dark leading-relaxed whitespace-pre-wrap text-xs sm:text-sm font-normal">
                  {modalLoading ? 'Memuat isi pesan...' : activeModalItem.message}
                </div>
              </div>
            </div>

            {/* Footer Modal: Tombol Aksi */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {activeModalItem.status !== 'replied' && (
                  <button
                    onClick={() => handleStatusChange(activeModalItem.id, 'replied')}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <FaCheckDouble className="w-3.5 h-3.5" />
                    <span>Tandai Dibalas</span>
                  </button>
                )}

                {activeModalItem.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusChange(activeModalItem.id, 'archived')}
                    disabled={actionLoading}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <span>Arsipkan</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeModalItem.client_email}?subject=Tanggapan Konsultasi: ${encodeURIComponent(activeModalItem.subject)}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <FaEnvelope className="w-3.5 h-3.5 text-accent" />
                  <span>Balas via Email</span>
                </a>

                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

