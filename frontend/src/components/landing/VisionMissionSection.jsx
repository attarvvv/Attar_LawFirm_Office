// Komponen Visi & Misi Kantor Hukum (VisionMissionSection)
// Menyajikan arah strategis jangka panjang dan komitmen misi operasional Attar Lawfirm Office
import React from 'react';
import { FaEye, FaBullseye, FaCheck } from 'react-icons/fa';

export default function VisionMissionSection() {
  const missionPoints = [
    'Memberikan jasa bantuan dan konsultasi hukum dengan menjunjung tinggi kode etik advokat Indonesia serta integritas moral tanpa cela.',
    'Merumuskan strategi hukum yang adaptif, terukur, dan mengutamakan perlindungan maksimal terhadap hak dan aset hukum klien.',
    'Mendorong penyelesaian sengketa hukum yang efektif dan bermartabat melalui jalur litigasi persidangan maupun mediasi negosiasi non-litigasi.',
    'Turut serta mengedukasi masyarakat dan pelaku usaha dalam meningkatkan kepatuhan hukum dan literasi kesadaran hukum nasional.'
  ];

  return (
    <section id="visi-misi" className="py-24 bg-white text-dark border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Arah & Landasan Nilai
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Visi & Misi Kantor
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Tata Letak Kartu Berdampingan (Visi Kiri, Misi Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Kartu Pernyataan Visi (5 Kolom di Layar Besar) */}
          <div className="lg:col-span-5 bg-primary text-white p-8 sm:p-10 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Hiasan Visual Lingkaran Cahaya Aksen */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-accent text-xs font-semibold tracking-wide uppercase mb-6">
                <FaEye className="w-3.5 h-3.5 text-accent" />
                <span>Visi Utama</span>
              </div>

              <blockquote className="text-lg sm:text-xl font-bold leading-relaxed text-white">
                &ldquo;Menjadi kantor advokat dan konsultan hukum terkemuka di Indonesia yang dipercaya secara luas, unggul dalam menyajikan solusi hukum strategis berintegritas tinggi serta berorientasi pada kepastian hukum dan keadilan substantif.&rdquo;
              </blockquote>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 text-xs text-gray-300">
              Landasan filosofis yang mengarahkan setiap langkah pengabdian kami kepada para pencari keadilan dan pelaku usaha.
            </div>
          </div>

          {/* Kartu Daftar Misi (7 Kolom di Layar Besar) */}
          <div className="lg:col-span-7 bg-cream p-8 sm:p-10 rounded-2xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 text-accent-dark text-xs font-semibold tracking-wide uppercase mb-6">
                <FaBullseye className="w-3.5 h-3.5 text-accent-dark" />
                <span>Misi Operasional Kami</span>
              </div>

              <div className="space-y-4">
                {missionPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent-dark flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <FaCheck className="w-3 h-3 text-accent-dark" />
                    </div>
                    <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-dark-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Komitmen nyata kami untuk mendampingi setiap langkah perkara hukum Anda.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

