// Komponen Profil Kantor Hukum (About Section)
// Menyajikan sejarah, filosofi pelayanan, dan keunggulan strategis kantor Attar Lawfirm Office
import React from 'react';
import { FaGavel, FaUserSecret, FaHandshake, FaCheckCircle } from 'react-icons/fa';

export default function AboutSection() {
  return (
    <section id="profil" className="py-24 bg-cream text-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Profil Kantor Hukum
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Dedikasi Menegakkan Keadilan dan Melindungi Kepentingan Klien
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Konten Utama Dua Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Paragraf Narasi Profil Kantor */}
          <div className="space-y-5 text-sm sm:text-base text-dark-muted leading-relaxed">
            <p>
              <strong className="text-primary font-semibold">Attar Lawfirm Office</strong> didirikan dengan komitmen teguh untuk menjadi mitra hukum tepercaya bagi individu, pelaku usaha, serta institusi korporasi di seluruh Indonesia. Kami memadukan pemahaman yuridis mendalam dengan strategi penanganan perkara yang terukur guna menghasilkan solusi hukum yang tepat sasaran.
            </p>
            <p>
              Dalam dinamika hukum dan bisnis yang semakin kompleks, kami tidak hanya bertindak sebagai perwakilan di meja peradilan (litigasi), melainkan juga sebagai penasihat strategis (non-litigasi) yang memitigasi risiko hukum sejak tahap perencanaan kontrak dan operasional usaha.
            </p>
            <p>
              Setiap perkara yang dipercayakan kepada kantor kami ditangani secara langsung oleh tim advokat berpengalaman yang berpegang teguh pada kode etik profesi, transparansi komunikasi, dan loyalitas tertinggi terhadap hak-hak hukum klien.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-primary">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-accent w-4 h-4 shrink-0" />
                <span>Advokat Berpengalaman Lintas Sektor</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-accent w-4 h-4 shrink-0" />
                <span>Pendekatan Kasus Berbasis Bukti Nyata</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-accent w-4 h-4 shrink-0" />
                <span>Transparansi Biaya & Strategi Perkara</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-accent w-4 h-4 shrink-0" />
                <span>Jaringan Ahli Hukum Terkemuka</span>
              </div>
            </div>
          </div>

          {/* Kotak Filosofi & Prinsip Kerja Kantor */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full pointer-events-none" />

            <h3 className="text-xl font-bold text-primary pb-3 border-b border-gray-100">
              3 Prinsip Utama Praktik Advokasi Kami
            </h3>

            {/* Pilar 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-base">
                <FaGavel className="text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">Analisis Yuridis Mendalam</h4>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Kami membedah setiap dokumen, fakta empiris, dan regulasi terkait guna menyusun posisi tawar hukum yang kokoh.
                </p>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-base">
                <FaUserSecret className="text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">Kerahasiaan Klien Tanpa Batas</h4>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Menjaga kerahasiaan informasi perkara adalah mandat moral dan hukum tertinggi yang kami terapkan secara ketat.
                </p>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-base">
                <FaHandshake className="text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary">Penyelesaian Berorientasi Solusi</h4>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Mengutamakan efisiensi waktu dan hasil terbaik bagi klien, baik melalui mediasi perdamaian maupun proses persidangan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

