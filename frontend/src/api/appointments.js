// Modul API janji temu untuk komunikasi dengan endpoint janji temu di backend

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

// Ambil daftar janji temu dengan filter status dan kata kunci pencarian
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

// Perbarui status janji temu dan catatan internal admin
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

// Ambil ringkasan statistik total janji temu berdasarkan status
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

// Muat data contoh janji temu jika tabel di database masih kosong
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
