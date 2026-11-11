// Modul API untuk pengelolaan kategori artikel dengan backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fungsi bantuan untuk menyusun header autentikasi token
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

// Ambil seluruh kategori artikel
export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat kategori artikel.');
  }

  return data;
}

// Tambah kategori artikel baru (khusus admin)
export async function createCategory(payload) {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menambahkan kategori.');
  }

  return data;
}

// Perbarui kategori artikel (khusus admin)
export async function updateCategory(id, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui kategori.');
  }

  return data;
}

// Hapus kategori artikel (khusus admin)
export async function deleteCategory(id) {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menghapus kategori.');
  }

  return data;
}

