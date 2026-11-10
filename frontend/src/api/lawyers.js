// Modul API untuk komunikasi fitur Pengacara (Lawyers) dengan backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Basis URL server tanpa akhiran /api untuk memuat aset file statis foto
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

// Helper untuk menyusun URL foto lengkap dari path relatif yang tersimpan di basis data
export function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
}

// Ambil seluruh daftar pengacara internal dengan filter pencarian dan status
export async function fetchLawyers({ search = '', status = 'all' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search && search.trim() !== '') params.append('search', search.trim());

  const response = await fetch(`${API_BASE_URL}/admin/lawyers?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data pengacara.');
  }

  return data;
}

// Ambil detail satu pengacara berdasarkan ID
export async function fetchLawyerById(id) {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat detail pengacara.');
  }

  return data;
}

// Tambah pengacara baru (mendukung FormData multipart jika menyertakan upload foto)
export async function createLawyer(payload, isMultipart = false) {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers`, {
    method: 'POST',
    headers: getHeaders(isMultipart),
    credentials: 'include',
    body: isMultipart ? payload : JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menambahkan pengacara baru.');
  }

  return data;
}

// Perbarui data pengacara (mendukung FormData jika mengganti foto)
export async function updateLawyer(id, payload, isMultipart = false) {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${id}`, {
    method: 'PUT',
    headers: getHeaders(isMultipart),
    credentials: 'include',
    body: isMultipart ? payload : JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui data pengacara.');
  }

  return data;
}

// Balik status aktif/nonaktif pengacara
export async function toggleLawyerActive(id) {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${id}/toggle-active`, {
    method: 'PATCH',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengubah status keaktifan pengacara.');
  }

  return data;
}

// Hapus pengacara permanen
export async function deleteLawyer(id) {
  const response = await fetch(`${API_BASE_URL}/admin/lawyers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menghapus data pengacara.');
  }

  return data;
}

