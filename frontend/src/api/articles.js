// Modul API untuk komunikasi fitur Artikel & Berita dengan backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Basis URL server tanpa akhiran /api untuk memuat thumbnail gambar
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Fungsi bantuan untuk menyusun header autentikasi token
function getHeaders(isMultipart = false) {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper untuk menyusun URL thumbnail lengkap dari path relatif di database
export function getThumbnailUrl(thumbnailPath) {
  if (!thumbnailPath) return null;
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return thumbnailPath;
  }
  const cleanPath = thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
}

// Ambil daftar artikel publik untuk landing page dan pembaca (hanya artikel berstatus published)
export async function fetchPublicArticles({ limit = 3, page = 1, category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (page) params.append('page', page);
  if (category) params.append('category', category);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`, {
    method: 'GET'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat artikel publik.');
  }

  return data;
}

// Ambil seluruh artikel internal portal dengan filter status, kategori, dan pencarian judul
export async function fetchAdminArticles({ status = 'all', category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (category && category !== 'all') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());

  const response = await fetch(`${API_BASE_URL}/admin/articles?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data artikel.');
  }

  return data;
}

// Ambil detail satu artikel untuk proses editing
export async function fetchArticleById(id) {
  const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat detail artikel.');
  }

  return data;
}

// Buat artikel baru (mendukung FormData jika menyertakan upload thumbnail)
export async function createArticle(payload, isMultipart = false) {
  const response = await fetch(`${API_BASE_URL}/admin/articles`, {
    method: 'POST',
    headers: getHeaders(isMultipart),
    credentials: 'include',
    body: isMultipart ? payload : JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal membuat artikel baru.');
  }

  return data;
}

// Perbarui artikel (mendukung FormData jika mengganti thumbnail)
export async function updateArticle(id, payload, isMultipart = false) {
  const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'PUT',
    headers: getHeaders(isMultipart),
    credentials: 'include',
    body: isMultipart ? payload : JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui artikel.');
  }

  return data;
}

// Ubah status publikasi artikel (draft / published)
export async function updateArticleStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/admin/articles/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengubah status artikel.');
  }

  return data;
}

// Hapus artikel permanen
export async function deleteArticle(id) {
  const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menghapus artikel.');
  }

  return data;
}

