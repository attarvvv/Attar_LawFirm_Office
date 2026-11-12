// Modul API untuk bidang keahlian dan layanan hukum kantor Attar Lawfirm
import {
  FaGavel,
  FaBalanceScale,
  FaBriefcase,
  FaHandshake,
  FaShieldAlt,
  FaFileContract,
  FaUserShield,
  FaLandmark,
  FaUniversity,
  FaStamp
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Daftar kurasi ikon bidang keahlian beserta label penjelas untuk dropdown pilihan form
export const CURATED_SERVICE_ICONS = [
  { key: 'FaGavel', label: 'Palu Hakim (Hukum Pidana & Litigasi)', icon: FaGavel },
  { key: 'FaBalanceScale', label: 'Timbangan Keadilan (Hukum Perdata & Umum)', icon: FaBalanceScale },
  { key: 'FaBriefcase', label: 'Tas Bisnis (Hukum Bisnis & Korporasi)', icon: FaBriefcase },
  { key: 'FaHandshake', label: 'Jabat Tangan (Ketenagakerjaan & Mediasi)', icon: FaHandshake },
  { key: 'FaShieldAlt', label: 'Perisai (Perlindungan Hukum & Kepatuhan)', icon: FaShieldAlt },
  { key: 'FaFileContract', label: 'Kontrak Legal (Perjanjian & Legal Audit)', icon: FaFileContract },
  { key: 'FaUserShield', label: 'Perlindungan Klien (Hak Konsumen & Sipil)', icon: FaUserShield },
  { key: 'FaLandmark', label: 'Gedung Tata Negara (Hukum Publik & Administrasi)', icon: FaLandmark },
  { key: 'FaUniversity', label: 'Institusi Finansial (Perbankan & Pasar Modal)', icon: FaUniversity },
  { key: 'FaStamp', label: 'Stempel Legal (HAKI, Hak Cipta & Paten)', icon: FaStamp }
];

// Peta pencocokan string kunci ikon ke komponen React Icons sesungguhnya (termasuk kunci legacy)
const ICON_COMPONENT_MAP = {
  FaGavel: FaGavel,
  FaBalanceScale: FaBalanceScale,
  FaBriefcase: FaBriefcase,
  FaHandshake: FaHandshake,
  FaShieldAlt: FaShieldAlt,
  FaFileContract: FaFileContract,
  FaUserShield: FaUserShield,
  FaLandmark: FaLandmark,
  FaUniversity: FaUniversity,
  FaStamp: FaStamp,
  business: FaBriefcase,
  civil: FaBalanceScale,
  labor: FaHandshake,
  ip: FaStamp
};

// Ambil komponen ikon berdasarkan kunci teks dengan fallback ke FaBalanceScale jika tidak ditemukan
export function getServiceIconComponent(iconKey) {
  if (!iconKey) return FaBalanceScale;
  return ICON_COMPONENT_MAP[iconKey] || FaBalanceScale;
}

// Fungsi bantuan untuk menyusun header request dengan token Bearer
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

// Ambil daftar bidang keahlian untuk halaman publik website (Landing Page)
export async function fetchPublicServices() {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'GET'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat daftar bidang keahlian.');
  }

  return data;
}

// Ambil seluruh data bidang keahlian untuk area internal portal admin
export async function fetchAdminServices() {
  const response = await fetch(`${API_BASE_URL}/admin/services`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat bidang keahlian internal.');
  }

  return data;
}

// Ambil detail satu bidang keahlian berdasarkan ID
export async function fetchServiceById(id) {
  const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat detail bidang keahlian.');
  }

  return data;
}

// Tambah bidang keahlian baru (khusus administrator)
export async function createService(payload) {
  const response = await fetch(`${API_BASE_URL}/admin/services`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menambahkan bidang keahlian.');
  }

  return data;
}

// Perbarui bidang keahlian (khusus administrator)
export async function updateService(id, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memperbarui bidang keahlian.');
  }

  return data;
}

// Hapus bidang keahlian permanen (khusus administrator)
export async function deleteService(id) {
  const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menghapus bidang keahlian.');
  }

  return data;
}

