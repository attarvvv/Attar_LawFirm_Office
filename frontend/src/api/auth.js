/**
 * Auth API Client
 * Manages communication with the Node.js Express backend.
 * Uses both Authorization Bearer headers and HttpOnly cookie credentials.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to get authorization headers
 */
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

/**
 * Register user (forced to 'staff' on backend)
 */
export async function registerUser({ nama, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    credentials: 'include', // Receive HttpOnly cookies if any
    body: JSON.stringify({
      nama,
      email,
      pass: password // Mapped to `pass` on backend/DB
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registrasi gagal.');
  }

  return data;
}

/**
 * Login user
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    credentials: 'include', // Automatically stores HttpOnly cookie
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

/**
 * Fetch current user profile (Me)
 */
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

/**
 * Logout user
 */
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(true),
    credentials: 'include'
  });

  const data = await response.json();
  return data;
}

/**
 * Fetch dashboard shell overview stub
 */
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

/**
 * Test admin-only endpoint stub
 */
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

