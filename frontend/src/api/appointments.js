/**
 * Appointments API Client
 * Mengelola komunikasi data janji temu dengan backend Express.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

// Ambil daftar janji temu dengan parameter status & pencarian
export async function fetchAppointments({ status = 'all', search = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search && search.trim() !== '') params.append('search', search.trim());

  const response = await fetch(`${API_BASE_URL}/appointments?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data janji temu.');
  }

  return data;
}

// Perbarui status janji temu (pending, confirmed, completed, cancelled) & catatan admin
export async function updateAppointmentStatus(id, { status, admin_notes }) {
  const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, admin_notes })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui status janji temu.');
  }

  return data;
}

// Ambil ringkasan statistik janji temu
export async function fetchAppointmentStats() {
  const response = await fetch(`${API_BASE_URL}/appointments/stats`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat statistik janji temu.');
  }

  return data;
}

// Muat data sampel jika tabel masih kosong
export async function seedSampleAppointments() {
  const response = await fetch(`${API_BASE_URL}/appointments/seed`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data contoh.');
  }

  return data;
}

