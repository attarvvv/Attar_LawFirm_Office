// Komponen Tim Pengacara (Lawyers Section) untuk halaman publik
// Menampilkan para advokat dan konsultan hukum aktif yang dimuat dari endpoint publik backend
import React, { useState, useEffect } from 'react';
import { fetchPublicLawyers, getPhotoUrl } from '../../api/lawyers';
import { FaUserTie, FaGraduationCap, FaBalanceScale } from 'react-icons/fa';

export default function LawyersSection() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil daftar pengacara publik dari API backend
  useEffect(() => {
    let isMounted = true;
    const loadLawyersData = async () => {
      try {
        const res = await fetchPublicLawyers();
        if (isMounted && res.success) {
          setLawyers(res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat profil pengacara.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLawyersData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="pengacara" className="py-24 bg-white text-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Tim Advokat Profesional
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Para Pengacara & Penasihat Hukum Kami
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-dark-muted leading-relaxed">
            Beranggotakan para praktisi hukum berpengalaman yang siap memberikan pendampingan litigasi dan non-litigasi dengan integritas tanpa celah.
          </p>
        </div>

        {/* State Memuat (Loading Skeletons) */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-cream p-6 rounded-2xl border border-gray-100 shadow-xs animate-pulse space-y-4"
              >
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
                <div className="h-5 bg-gray-200 rounded-sm w-1/2 mx-auto" />
                <div className="h-3 bg-gray-100 rounded-sm w-3/4 mx-auto" />
                <div className="h-16 bg-gray-100 rounded-sm w-full" />
              </div>
            ))}
          </div>
        )}

        {/* State Galat */}
        {error && !loading && (
          <div className="bg-cream p-8 rounded-2xl border border-gray-200 text-center max-w-md mx-auto">
            <p className="text-sm text-red-600 font-semibold mb-2">Gagal Memuat Profil Pengacara</p>
            <p className="text-xs text-dark-muted">{error}</p>
          </div>
        )}

        {/* State Kosong */}
        {!loading && !error && lawyers.length === 0 && (
          <div className="bg-cream rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center text-accent mb-3">
              <FaUserTie className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-primary">Data Pengacara Belum Ditampilkan</h3>
            <p className="text-xs text-dark-muted mt-1">
              Profil tim advokat kantor hukum sedang dalam proses sinkronisasi database.
            </p>
          </div>
        )}

        {/* Grid Kartu Pengacara */}
        {!loading && !error && lawyers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lawyers.map((lawyer) => {
              const photoUrl = getPhotoUrl(lawyer.photo);

              // Buat inisial nama jika foto pengacara belum diunggah
              const initials = (lawyer.full_name || 'Advokat')
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <div
                  key={lawyer.id}
                  className="bg-cream rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Foto atau Inisial Pengacara */}
                    <div className="flex items-center gap-4 mb-5">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={lawyer.full_name}
                          className="w-18 h-18 rounded-2xl object-cover border-2 border-accent shadow-sm shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}

                      <div
                        className={`w-18 h-18 rounded-2xl bg-primary text-accent font-bold text-xl flex items-center justify-center border-2 border-accent shadow-sm shrink-0 ${
                          photoUrl ? 'hidden' : ''
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-primary truncate">
                          {lawyer.full_name}
                        </h3>
                        <p className="text-xs font-semibold text-accent-dark mt-0.5">
                          {lawyer.title}
                        </p>
                        {lawyer.specialization && (
                          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-white text-primary text-[11px] font-medium border border-gray-200 shadow-2xs">
                            <FaBalanceScale className="w-2.5 h-2.5 text-accent" />
                            <span className="truncate max-w-[160px]">{lawyer.specialization}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ringkasan Biografi / Pengalaman */}
                    <p className="text-xs text-dark-muted leading-relaxed line-clamp-4">
                      {lawyer.bio || 'Praktisi hukum berdedikasi tinggi dengan fokus penanganan perkara litigasi dan kepatuhan korporasi terkemuka.'}
                    </p>
                  </div>

                  {/* Footer Kartu Pengacara */}
                  <div className="mt-6 pt-4 border-t border-gray-200/70 flex items-center justify-between text-[11px] text-dark-muted">
                    <span className="flex items-center gap-1.5 text-primary font-medium">
                      <FaGraduationCap className="text-accent" />
                      <span>Advokat PERADI</span>
                    </span>
                    <a
                      href="#kontak"
                      className="text-xs font-semibold text-accent-dark hover:text-primary transition-colors"
                    >
                      Jadwalkan Konsultasi &rarr;
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

