import React, { useState } from 'react';

// Komponen logo brand kantor hukum (mendukung file gambar /logo.png dari folder public dan mode iconOnly)
export default function BrandLogo({ size = 'normal', inverted = false, iconOnly = false }) {
  const isLarge = size === 'large';
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex items-center ${iconOnly ? 'justify-center' : 'gap-3'} select-none`}>
      {/* Tampilkan gambar logo jika tersedia di folder public */}
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
        // Ikon cadangan timbangan keadilan jika file gambar belum dimasukkan
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

      {/* Teks identitas kantor hukum (disembunyikan saat mode iconOnly) */}
      {!iconOnly && (
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
      )}
    </div>
  );
}
