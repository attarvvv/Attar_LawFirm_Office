// Modul API untuk manajemen pengguna internal (Users CRUD)
// Khusus diakses oleh pengguna dengan peran Administrator

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fungsi bantuan untuk menyusun header request beserta token autentikasi
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Ambil seluruh daftar pengguna dengan filter pencarian dan peran
export async function fetchUsers({ search, role } = {}) {
  const params = new URLSearchParams();
  if (search && search.trim()) params.append('search', search.trim());
  if (role && role !== 'all') params.append('role', role);

  const url = `${API_BASE_URL}/admin/users${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data pengguna.');
  }

  return data;
}

// Ambil detail satu pengguna berdasarkan ID
export async function fetchUserById(id) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Pengguna tidak ditemukan.');
  }

  return data;
}

// Tambah pengguna internal baru
export async function createUser({ nama, email, password, role }) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ nama, email, password, role })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menambahkan pengguna baru.');
  }

  return data;
}

// Perbarui data pengguna
export async function updateUser(id, { nama, email, password, role }) {
  const payload = { nama, email, role };
  if (password && password.trim()) {
    payload.password = password.trim();
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui data pengguna.');
  }

  return data;
}

// Hapus pengguna dari sistem
export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menghapus pengguna.');
  }

  return data;
}
