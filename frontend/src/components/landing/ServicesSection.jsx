// Komponen Bidang Keahlian (Services Section) untuk halaman publik
// Menampilkan daftar spesialisasi hukum yang dimuat secara dinamis dari endpoint publik backend
import React, { useState, useEffect } from 'react';
import { fetchPublicServices, getServiceIconComponent } from '../../api/services';
import { FaBalanceScale, FaArrowRight } from 'react-icons/fa';

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data bidang keahlian dari endpoint publik backend
  useEffect(() => {
    let isMounted = true;
    const loadServicesData = async () => {
      try {
        const res = await fetchPublicServices();
        if (isMounted && res.success) {
          setServices(res.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat layanan bidang keahlian.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadServicesData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="layanan" className="py-24 bg-cream text-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Keahlian Hukum Kami
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Bidang Keahlian & Spesialisasi Perkara
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-dark-muted leading-relaxed">
            Didukung oleh advokat spesialis berpengalaman, kami menangani spektrum persoalan hukum secara terfokus demi perlindungan hak dan kelancaran bisnis Anda.
          </p>
        </div>

        {/* State Memuat (Loading Skeletons) */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-gray-100 shadow-xs animate-pulse space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="h-5 bg-gray-200 rounded-sm w-3/4" />
                <div className="h-3 bg-gray-100 rounded-sm w-full" />
                <div className="h-3 bg-gray-100 rounded-sm w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* State Galat (Error Fallback) */}
        {error && !loading && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md mx-auto shadow-xs">
            <p className="text-sm text-red-600 font-semibold mb-2">Gagal Memuat Bidang Keahlian</p>
            <p className="text-xs text-dark-muted mb-4">{error}</p>
            <a
              href="#kontak"
              className="inline-block px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light"
            >
              Hubungi Kantor Langsung
            </a>
          </div>
        )}

        {/* State Kosong (Empty State) */}
        {!loading && !error && services.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-cream flex items-center justify-center text-accent mb-3">
              <FaBalanceScale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-primary">Informasi Segera Diperbarui</h3>
            <p className="text-xs text-dark-muted mt-1">
              Daftar bidang keahlian resmi sedang dalam proses pemutakhiran data.
            </p>
          </div>
        )}

        {/* Grid Kartu Bidang Keahlian */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const IconComp = getServiceIconComponent(service.icon);
              return (
                <div
                  key={service.id}
                  className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Kotak Ikon Layanan */}
                    <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center text-xl mb-5 transition-colors duration-300 border border-primary/10">
                      <IconComp className="text-accent group-hover:text-accent-light" />
                    </div>

                    {/* Judul Bidang Keahlian */}
                    <h3 className="text-base font-bold text-primary mb-2.5 group-hover:text-accent-dark transition-colors">
                      {service.title}
                    </h3>

                    {/* Deskripsi Singkat */}
                    <p className="text-xs text-dark-muted leading-relaxed">
                      {service.description || 'Layanan konsultasi dan pendampingan hukum spesifik sesuai regulasi terkini.'}
                    </p>
                  </div>

                  {/* Tautan CTA Konsultasi Layanan Ini */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a
                      href="#kontak"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary group-hover:text-accent transition-colors"
                    >
                      <span>Konsultasikan Perkara</span>
                      <FaArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-1" />
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

