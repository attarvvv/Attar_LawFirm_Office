import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAppointments,
  updateAppointmentStatus,
  seedSampleAppointments
} from '../api/appointments';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaBalanceScale,
  FaUserTie,
  FaCheck,
  FaTimes,
  FaEdit,
  FaSearch,
  FaSyncAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaStickyNote,
  FaCommentDots
} from 'react-icons/fa';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modal State untuk Edit Status & Catatan Admin
  const [activeModalData, setActiveModalData] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalAdminNotes, setModalAdminNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Ambil data janji temu dari server
  const loadAppointments = async (status = statusFilter, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAppointments({ status, search });
      if (res.success) {
        setAppointments(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data janji temu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(statusFilter, appliedSearch);
  }, [statusFilter, appliedSearch]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

  // Reset Search
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
  };

  // Quick Action: Ubah Status Langsung
  const handleQuickStatusChange = async (id, newStatus) => {
    const confirmMessage = {
      confirmed: 'Konfirmasi dan jadwalkan janji temu ini?',
      completed: 'Tandai konsultasi janji temu ini sebagai telah SELESAI?',
      cancelled: 'Batalkan jadwal janji temu ini?'
    }[newStatus] || 'Perbarui status janji temu?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await updateAppointmentStatus(id, { status: newStatus });
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Gagal mengubah status.');
    }
  };

  // Buka Modal Detail & Catatan
  const openDetailModal = (item) => {
    setActiveModalData(item);
    setModalStatus(item.status);
    setModalAdminNotes(item.admin_notes || '');
  };

  // Simpan perubahan dari modal
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!activeModalData) return;

    setSubmittingAction(true);
    try {
      await updateAppointmentStatus(activeModalData.id, {
        status: modalStatus,
        admin_notes: modalAdminNotes
      });
      setActiveModalData(null);
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handler Seeder jika data masih kosong
  const handleSeedData = async () => {
    if (!window.confirm('Muat data contoh janji temu ke dalam database?')) return;
    setLoading(true);
    try {
      const res = await seedSampleAppointments();
      if (res.success) {
        setAppointments(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      alert(err.message || 'Gagal memuat data contoh.');
    } finally {
      setLoading(false);
    }
  };

  // Format Tanggal Indonesia
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  // Format Jam
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5) + ' WIB';
  };

  // Status Styling Helper (Disimpan untuk referensi / jika ingin diaktifkan kembali)
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Menunggu Konfirmasi',
          badgeClass: 'bg-amber-50/40 text-amber-900 border-amber-400',
          dotClass: 'bg-amber-500'
        };
      case 'confirmed':
        return {
          label: 'Dikonfirmasi',
          badgeClass: 'bg-blue-50/40 text-blue-900 border-blue-400',
          dotClass: 'bg-blue-500'
        };
      case 'completed':
        return {
          label: 'Selesai',
          badgeClass: 'bg-emerald-50/40 text-emerald-900 border-emerald-400',
          dotClass: 'bg-emerald-500'
        };
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          badgeClass: 'bg-rose-50/40 text-rose-900 border-rose-400',
          dotClass: 'bg-rose-500'
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-gray-50 text-gray-800 border-gray-300',
          dotClass: 'bg-gray-400'
        };
    }
  };

  // Tab Status Filter List
  const filterTabs = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'pending', label: 'Menunggu Konfirmasi', count: stats.pending },
    { key: 'confirmed', label: 'Dikonfirmasi', count: stats.confirmed },
    { key: 'completed', label: 'Selesai', count: stats.completed },
    { key: 'cancelled', label: 'Dibatalkan', count: stats.cancelled }
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Janji Temu Klien
          </h2>
          <p className="text-sm text-dark-muted mt-0.5">
            Kelola permohonan konsultasi hukum dan jadwal pertemuan klien dengan para advokat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAppointments()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg shadow-sm transition-colors focus:outline-none"
            title="Muat ulang data"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {appointments.length === 0 && !loading && (
            <button
              onClick={handleSeedData}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              + Muat Data Contoh
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-4">
        {/* Tab Filter Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all focus:outline-none ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-muted hover:bg-cream hover:text-primary'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive
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
              placeholder="Cari berdasarkan nama klien, email, telepon, atau kode booking (#APT)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-cream/40 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
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

      {/* Pesan Error jika terjadi kegagalan API */}
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
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Tampilan Kosong (Empty State) */}
      {!loading && appointments.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-cream text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            <FaCalendarAlt className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-primary mb-1">
            Tidak Ada Janji Temu Ditemukan
          </h3>
          <p className="text-xs text-dark-muted mb-6 leading-relaxed">
            {appliedSearch || statusFilter !== 'all'
              ? 'Tidak ada janji temu yang cocok dengan filter atau kata kunci pencarian yang dipilih.'
              : 'Belum ada data permohonan janji temu dari klien pada sistem database.'}
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
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              + Muat 4 Data Contoh
            </button>
          </div>
        </div>
      )}

      {/* Grid Kartu Janji Temu (Proporsional, Rapi, Lengkap) */}
      {!loading && appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* 1. Card Header: Kode Booking (Status badge dinonaktifkan) */}
                <div className="px-5 py-3.5 bg-cream/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary tracking-wider">
                      #{item.booking_code}
                    </span>
                  </div>
                </div>

                {/* 2. Card Body: Data Klien, Jadwal, Pengacara, Catatan */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Data Klien */}
                  <div>
                    <h4 className="text-base font-bold text-primary leading-tight">
                      {item.client_name}
                    </h4>
                    <div className="mt-2 space-y-1 text-xs text-dark-muted">
                      <div className="flex items-center gap-2 truncate">
                        <FaEnvelope className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <a
                          href={`mailto:${item.client_email}`}
                          className="hover:text-primary hover:underline truncate"
                          title="Kirim email"
                        >
                          {item.client_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhoneAlt className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <a
                          href={`tel:${item.client_phone}`}
                          className="hover:text-primary hover:underline font-mono"
                          title="Hubungi telepon"
                        >
                          {item.client_phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Jadwal Janji Temu */}
                  <div className="p-3 bg-cream/70 rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-medium text-primary">
                      <FaCalendarAlt className="text-accent w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDateIndo(item.appointment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-muted">
                      <FaClock className="text-accent w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-semibold text-primary">{formatTime(item.appointment_time)}</span>
                    </div>
                  </div>

                  {/* Layanan Hukum & Pengacara Terkait */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <FaBalanceScale className="text-accent w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Layanan Hukum
                        </span>
                        <span className="font-semibold text-primary">
                          {item.service_title || 'Konsultasi Hukum Umum'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <FaUserTie className="text-accent w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Pengacara / Advokat
                        </span>
                        <span className="font-medium text-primary">
                          {item.lawyer_name || 'Menunggu Penugasan'}
                        </span>
                        {item.lawyer_title && (
                          <span className="block text-[11px] text-gray-500">
                            {item.lawyer_title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Catatan / Kebutuhan Klien */}
                  {item.notes && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 mb-1">
                        <FaStickyNote className="text-accent" />
                        <span>Kebutuhan Klien</span>
                      </div>
                      <p className="text-dark-muted leading-relaxed line-clamp-2">
                        {item.notes}
                      </p>
                    </div>
                  )}

                  {/* Catatan Internal Admin (Jika Ada) */}
                  {item.admin_notes && (
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-800 mb-0.5">
                        <FaCommentDots className="text-blue-600" />
                        <span>Catatan Internal</span>
                      </div>
                      <p className="text-blue-900 leading-relaxed italic">
                        &quot;{item.admin_notes}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Card Footer: Action Buttons Proporsional */}
                <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Contextual Action Buttons */}
                  <div className="flex items-center gap-2 flex-1">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleQuickStatusChange(item.id, 'confirmed')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        title="Setujui dan konfirmasi jadwal ini"
                      >
                        <FaCheck className="w-3 h-3 text-accent" />
                        <span>Konfirmasi</span>
                      </button>
                    )}

                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => handleQuickStatusChange(item.id, 'completed')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        title="Tandai pertemuan ini telah selesai"
                      >
                        <FaCheckCircle className="w-3 h-3" />
                        <span>Selesai</span>
                      </button>
                    )}

                    {(item.status === 'pending' || item.status === 'confirmed') && (
                      <button
                        onClick={() => handleQuickStatusChange(item.id, 'cancelled')}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                        title="Batalkan janji temu"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Tombol Detail & Catatan */}
                  <button
                    onClick={() => openDetailModal(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-white hover:bg-cream border border-gray-200 rounded-lg transition-colors shadow-xs"
                    title="Buka detail lengkap dan catatan admin"
                  >
                    <FaEdit className="w-3 h-3 text-accent" />
                    <span>Kelola</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Ubah Status / Catatan Admin */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-primary">
                  Kelola Janji Temu
                </h3>
                <p className="text-xs text-dark-muted font-mono">
                  Kode: #{activeModalData.booking_code}
                </p>
              </div>
              <button
                onClick={() => setActiveModalData(null)}
                className="p-1.5 text-gray-400 hover:text-primary rounded-lg"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* Ringkasan Klien */}
              <div className="p-3 rounded-xl bg-cream border border-gray-200/80 space-y-1">
                <p className="font-bold text-primary text-sm">{activeModalData.client_name}</p>
                <p className="text-dark-muted">{activeModalData.client_email} &bull; {activeModalData.client_phone}</p>
                <p className="text-primary font-medium pt-1">
                  {formatDateIndo(activeModalData.appointment_date)} | {formatTime(activeModalData.appointment_time)}
                </p>
              </div>

              {/* Pilihan Status */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  Status Janji Temu
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="pending">Menunggu Konfirmasi (Pending)</option>
                  <option value="confirmed">Dikonfirmasi (Confirmed)</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              {/* Catatan Admin / Ruang Rapat */}
              <div>
                <label className="block font-bold text-primary mb-1">
                  Catatan Internal Admin / Ruang Rapat
                </label>
                <textarea
                  rows="3"
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  placeholder="Contoh: Disetujui di Ruang Rapat A, berkas kontrak sudah diprint..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              {/* Tombol Aksi Modal */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModalData(null)}
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {submittingAction ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

