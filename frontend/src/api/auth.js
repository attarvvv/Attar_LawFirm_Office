// Modul API autentikasi untuk komunikasi dengan backend Express
// Mendukung pengiriman header Authorization Bearer dan cookie HttpOnly

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fungsi bantuan untuk menyusun header request beserta token autentikasi
function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Registrasi pengguna staf baru
export async function registerUser({ nama, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    credentials: 'include', // Izinkan penerimaan cookie HttpOnly dari server
    body: JSON.stringify({
      nama,
      email,
      pass: password // Kolom password dipetakan ke field 'pass' pada database
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registrasi gagal.');
  }

  return data;
}

// Login pengguna ke sistem
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    credentials: 'include', // Menyimpan cookie HttpOnly secara otomatis pada browser
    body: JSON.stringify({
      email,
      pass: password
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Email atau kata sandi tidak valid.');
  }

  return data;
}

// Ambil profil data pengguna yang sedang login (me)
export async function fetchMe() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(true),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Sesi berakhir.');
  }

  return data;
}

// Logout dan akhiri sesi pengguna
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(true),
    credentials: 'include'
  });

  const data = await response.json();
  return data;
}

// Ambil data ringkasan dashboard shell
export async function fetchDashboardStub() {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard-stub`, {
    method: 'GET',
    headers: getHeaders(true),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat stub dashboard.');
  }

  return data;
}

// Uji coba akses endpoint khusus administrator (RBAC)
export async function fetchAdminUsersStub() {
  const response = await fetch(`${API_BASE_URL}/admin/manage-users-stub`, {
    method: 'GET',
    headers: getHeaders(true),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Akses ditolak (Bukan Administrator).');
  }

  return data;
}
