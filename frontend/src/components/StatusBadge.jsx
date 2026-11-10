// Komponen reusable untuk menampilkan label status janji temu dan konsultasi
// Menggunakan gaya teks berwarna dan titik (dot) tanpa latar belakang atau garis pembatas pill
import React from 'react';

// Konfigurasi pemetaan warna dan label status bahasa Indonesia
const statusConfig = {
  // Status Janji Temu (Appointments)
  pending: {
    label: 'Menunggu',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500'
  },
  confirmed: {
    label: 'Dikonfirmasi',
    textClass: 'text-blue-700',
    dotClass: 'bg-blue-500'
  },
  completed: {
    label: 'Selesai',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500'
  },
  cancelled: {
    label: 'Dibatalkan',
    textClass: 'text-rose-700',
    dotClass: 'bg-rose-500'
  },

  // Status Konsultasi Masuk (Consultations)
  unread: {
    label: 'Belum Dibaca',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500'
  },
  read: {
    label: 'Dibaca',
    textClass: 'text-blue-700',
    dotClass: 'bg-blue-500'
  },
  replied: {
    label: 'Dibalas',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500'
  },
  archived: {
    label: 'Diarsipkan',
    textClass: 'text-gray-500',
    dotClass: 'bg-gray-400'
  },

  // Status Pengacara (Lawyers)
  active: {
    label: 'Aktif',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500'
  },
  inactive: {
    label: 'Nonaktif',
    textClass: 'text-gray-500',
    dotClass: 'bg-gray-400'
  }
};

export default function StatusBadge({ status, className = '' }) {
  const config = statusConfig[status] || {
    label: status || '-',
    textClass: 'text-gray-600'
  };

  return (
    <span className={`inline-flex items-center text-xs font-semibold ${config.textClass} ${className}`}>
      {config.label}
    </span>
  );
}

