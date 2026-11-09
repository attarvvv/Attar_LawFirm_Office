import React, { useState } from 'react';

/**
 * Komponen Logo Brand Attar Lawfirm
 * Mendukung logo gambar dari folder public:
 * - Letakkan file logo di: `frontend/public/logo.png` (atau .svg / .jpg)
 * - Jika file gambar logo belum ada, otomatis menggunakan icon cadangan secara aman.
 */
export default function BrandLogo({ size = 'normal', inverted = false }) {
  const isLarge = size === 'large';
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3 select-none">
      {/* 1. Tampilkan Gambar Logo (jika file /logo.png ada di folder public) */}
      {!imageError ? (
        <img
          src="/logo.png"
          alt="Logo Attar Lawfirm"
          onError={() => setImageError(true)}
          className={`${
            isLarge ? 'h-11 w-auto max-w-[140px]' : 'h-9 w-auto max-w-[110px]'
          } object-contain transition-all`}
        />
      ) : (
        /* Fallback: Icon timbangan jika gambar logo belum ditaruh di folder */
        <div
          className={`flex items-center justify-center rounded-lg border ${
            inverted
              ? 'bg-accent/20 border-accent/40 text-accent'
              : 'bg-primary text-accent border-accent/30'
          } ${isLarge ? 'w-11 h-11 text-xl' : 'w-9 h-9 text-base'} shadow-sm flex-shrink-0`}
          aria-hidden="true"
        >
          <span>⚖️</span>
        </div>
      )}

      {/* 2. Teks Nama Kantor Hukum */}
      <div className="flex flex-col">
        <span
          className={`font-semibold tracking-tight leading-none ${
            isLarge ? 'text-xl' : 'text-base'
          } ${inverted ? 'text-white' : 'text-primary'}`}
        >
          Attar <span className="text-accent font-bold">Lawfirm</span>
        </span>
        <span
          className={`text-[10px] tracking-widest uppercase font-medium mt-0.5 ${
            inverted ? 'text-gray-300' : 'text-dark-muted'
          }`}
        >
          Office
        </span>
      </div>
    </div>
  );
}
