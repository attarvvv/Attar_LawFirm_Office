// Modul API untuk komunikasi fitur Konsultasi Masuk dengan backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fungsi bantuan untuk menyusun header request dan token autentikasi
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

// Ambil daftar konsultasi masuk dengan filter status dan kata kunci pencarian
export async function fetchConsultations({ status = 'all', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search && search.trim() !== '') params.append('search', search.trim());

  const response = await fetch(`${API_BASE_URL}/admin/consultations?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data konsultasi.');
  }

  return data;
}

// Ambil detail satu konsultasi (otomatis mengubah status unread menjadi read di backend)
export async function fetchConsultationDetail(id) {
  const response = await fetch(`${API_BASE_URL}/admin/consultations/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat detail konsultasi.');
  }

  return data;
}

// Perbarui status konsultasi (misalnya: 'replied' atau 'archived')
export async function updateConsultationStatus(id, { status }) {
  const response = await fetch(`${API_BASE_URL}/admin/consultations/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui status konsultasi.');
  }

  return data;
}

// Muat data contoh konsultasi jika basis data masih kosong
export async function seedSampleConsultations() {
  const response = await fetch(`${API_BASE_URL}/admin/consultations/seed`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data contoh konsultasi.');
  }

  return data;
}

// Kirim permohonan konsultasi baru (publik)
export async function submitPublicConsultation(formData) {
  const response = await fetch(`${API_BASE_URL}/consultations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengirim permohonan konsultasi.');
  }

  return data;
}

