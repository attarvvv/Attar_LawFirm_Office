// Halaman manajemen akun pengguna internal kantor hukum (Users CRUD)
// Khusus dapat diakses oleh peran Administrator
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users';
import {
  FaUsersCog,
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaShieldAlt,
  FaUserTie,
  FaUser,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaKey,
  FaEnvelope,
  FaIdCard,
  FaSyncAlt
} from 'react-icons/fa';

export default function Users() {
  const { user: currentUser } = useAuth();

  // State data pengguna dan pemuatan
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // State notifikasi toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State modal form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // State nilai form
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

  // State modal konfirmasi hapus
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Tampilkan notifikasi toast dengan auto-dismiss 4 detik
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Muat data pengguna dari backend
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({ search, role: roleFilter });
      setUsers(res.data || []);
    } catch (err) {
      showToast(err.message || 'Gagal memuat daftar pengguna.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Panggil ulang loadUsers saat filter peran berubah
  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  // Handler submit form pencarian
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // Hitung rekap statistik peran pengguna
  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const lawyerCount = users.filter((u) => u.role === 'lawyer').length;
    const staffCount = users.filter((u) => u.role === 'staff').length;
    return { total, adminCount, lawyerCount, staffCount };
  }, [users]);

  // Buka modal untuk tambah pengguna baru
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      nama: '',
      email: '',
      role: 'staff',
      password: '',
      confirmPassword: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Buka modal untuk edit pengguna yang ada
  const handleOpenEditModal = (targetUser) => {
    setModalMode('edit');
    setSelectedUser(targetUser);
    setFormData({
      nama: targetUser.nama,
      email: targetUser.email,
      role: targetUser.role,
      password: '',
      confirmPassword: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handler simpan data form (Tambah / Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validasi nama dan email
    if (!formData.nama.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Alamat email wajib diisi.');
      return;
    }

    // Validasi kata sandi saat tambah akun baru
    if (modalMode === 'create') {
      if (!formData.password) {
        setFormError('Kata sandi wajib diisi untuk pengguna baru.');
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Kata sandi minimal harus 6 karakter.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    } else {
      // Validasi kata sandi saat edit (jika diisi)
      if (formData.password) {
        if (formData.password.length < 6) {
          setFormError('Kata sandi baru minimal harus 6 karakter.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError('Konfirmasi kata sandi tidak cocok.');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const res = await createUser({
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        showToast(res.message || 'Pengguna baru berhasil ditambahkan.', 'success');
      } else {
        const res = await updateUser(selectedUser.id, {
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });
        showToast(res.message || 'Data pengguna berhasil diperbarui.', 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Buka dialog konfirmasi hapus pengguna
  const handleOpenDeleteModal = (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.', 'error');
      return;
    }
    setUserToDelete(targetUser);
    setDeleteModalOpen(true);
  };

  // Eksekusi penghapusan pengguna
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteUser(userToDelete.id);
      showToast(res.message || 'Pengguna berhasil dihapus.', 'success');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus pengguna.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Helper tampilan badge peran
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent-dark border border-accent/40">
            <FaShieldAlt className="w-3 h-3 text-accent-dark" />
            Administrator
          </span>
        );
      case 'lawyer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <FaUserTie className="w-3 h-3 text-primary" />
            Pengacara
          </span>
        );
      case 'staff':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FaUser className="w-3 h-3 text-blue-600" />
            Staf Operasional
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <FaCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <FaExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <FaUsersCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-dark tracking-tight">Kelola Pengguna</h1>
            <p className="text-xs sm:text-sm text-dark-muted mt-0.5">
              Manajemen akun staf, pengacara, dan administrator internal kantor hukum.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-xs focus:ring-2 focus:ring-primary/20"
        >
          <FaUserPlus className="w-4 h-4 text-accent" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-medium text-dark-muted">Total Pengguna</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-medium text-dark-muted">Administrator</div>
          <div className="text-2xl font-bold text-accent-dark mt-1">{stats.adminCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-medium text-dark-muted">Pengacara</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats.lawyerCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="text-xs font-medium text-dark-muted">Staf Operasional</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.staffCount}</div>
        </div>
      </div>

      {/* Bar Pencarian & Filter Peran */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Form Pencarian */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </form>

        {/* Filter Peran & Tombol Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium text-dark-muted">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === 'all'
                  ? 'bg-white text-primary font-semibold shadow-xs'
                  : 'hover:text-dark'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === 'admin'
                  ? 'bg-white text-primary font-semibold shadow-xs'
                  : 'hover:text-dark'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter('lawyer')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === 'lawyer'
                  ? 'bg-white text-primary font-semibold shadow-xs'
                  : 'hover:text-dark'
              }`}
            >
              Pengacara
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === 'staff'
                  ? 'bg-white text-primary font-semibold shadow-xs'
                  : 'hover:text-dark'
              }`}
            >
              Staf
            </button>
          </div>

          <button
            onClick={loadUsers}
            title="Muat Ulang Data"
            className="p-2.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <FaSyncAlt className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabel Daftar Pengguna */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-dark-muted">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-dark-muted">
            <FaUsersCog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-dark">Tidak Ada Pengguna Ditemukan</p>
            <p className="text-xs text-dark-muted mt-1 max-w-sm mx-auto">
              Tidak ada data yang cocok dengan kriteria pencarian atau filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-dark-muted">
                  <th className="py-3.5 px-4 sm:px-6">Pengguna</th>
                  <th className="py-3.5 px-4">Alamat Email</th>
                  <th className="py-3.5 px-4">Peran / Hak Akses</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((item) => {
                  const isCurrent = item.id === currentUser?.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Kolom Nama & Identitas */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs flex-shrink-0 uppercase">
                            {item.nama.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-dark flex items-center gap-2">
                              <span>{item.nama}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-accent/20 text-accent-dark font-bold px-1.5 py-0.5 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-dark-muted">ID: #{item.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Email */}
                      <td className="py-4 px-4 font-mono text-xs text-dark">
                        {item.email}
                      </td>

                      {/* Kolom Peran */}
                      <td className="py-4 px-4">
                        {renderRoleBadge(item.role)}
                      </td>

                      {/* Kolom Aksi */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Data Pengguna"
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Tidak dapat menghapus akun Anda sendiri'
                                : 'Hapus Pengguna'
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {modalMode === 'create' ? <FaUserPlus className="w-5 h-5" /> : <FaEdit className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark font-serif">
                    {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Data Pengguna'}
                  </h3>
                  <p className="text-xs text-dark-muted">
                    {modalMode === 'create'
                      ? 'Daftarkan akun staf, advokat, atau administrator baru'
                      : `Perbarui data untuk ${selectedUser?.nama}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Badan Form Modal */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Alert Error Form */}
              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <FaExclamationCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Budi Santoso, S.H."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Alamat Email */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@attarlaw.id"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Peran / Hak Akses */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  Peran / Hak Akses <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'staff'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-dark flex items-center gap-1.5">
                      <FaUser className="w-3 h-3 text-blue-600" /> Staf
                    </div>
                    <div className="text-[10px] text-dark-muted mt-0.5">Operasional</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'lawyer' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'lawyer'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-dark flex items-center gap-1.5">
                      <FaUserTie className="w-3 h-3 text-primary" /> Pengacara
                    </div>
                    <div className="text-[10px] text-dark-muted mt-0.5">Konsultasi</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'admin'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-dark flex items-center gap-1.5">
                      <FaShieldAlt className="w-3 h-3 text-accent-dark" /> Admin
                    </div>
                    <div className="text-[10px] text-dark-muted mt-0.5">Akses Penuh</div>
                  </button>
                </div>
              </div>

              {/* Kata Sandi */}
              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">
                  {modalMode === 'create' ? 'Kata Sandi' : 'Kata Sandi Baru (Opsional)'}{' '}
                  {modalMode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      modalMode === 'create'
                        ? 'Minimal 6 karakter'
                        : 'Kosongkan jika tidak ingin mengubah kata sandi'
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Konfirmasi Kata Sandi (jika kata sandi diisi) */}
              {(modalMode === 'create' || formData.password) && (
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Ulangi kata sandi"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Tombol Aksi Modal */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 text-sm font-semibold text-dark-muted hover:text-dark hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{modalMode === 'create' ? 'Simpan Pengguna' : 'Perbarui Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS PENGGUNA */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 animate-scale-in text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <FaTrashAlt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark font-serif">Hapus Pengguna</h3>
            <p className="text-sm text-dark-muted mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-dark">"{userToDelete.nama}"</span> ({userToDelete.email})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-semibold text-dark-muted hover:text-dark hover:bg-gray-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {deleting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Hapus Pengguna</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
