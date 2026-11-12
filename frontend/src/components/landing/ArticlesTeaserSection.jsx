// Komponen Artikel Teaser (ArticlesTeaserSection) untuk halaman publik
// Menampilkan 3 artikel terbit terkini; otomatis disembunyikan jika belum ada artikel terbit
import React, { useState, useEffect } from 'react';
import { fetchPublicArticles, getThumbnailUrl } from '../../api/articles';
import { FaCalendarAlt, FaNewspaper, FaTag } from 'react-icons/fa';

export default function ArticlesTeaserSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil 3 artikel publik terbit terbaru dari backend
  useEffect(() => {
    let isMounted = true;
    const loadArticles = async () => {
      try {
        const res = await fetchPublicArticles({ limit: 3 });
        if (isMounted && res.success) {
          setArticles(res.data || []);
        }
      } catch (err) {
        // Gagal memuat artikel publik tidak boleh merusak landing page
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sembunyikan bagian ini seutuhnya jika belum ada artikel terbit atau proses memuat selesai tanpa data
  if (!loading && articles.length === 0) {
    return null;
  }

  // Fungsi pembersih tag HTML dari konten artikel untuk menampilkan kutipan teks murni
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  return (
    <section id="artikel" className="py-24 bg-cream text-dark border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-semibold tracking-wider uppercase mb-3">
            Edukasi & Wawasan Hukum
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            Artikel & Kabar Hukum Terkini
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-sm sm:text-base text-dark-muted leading-relaxed">
            Kumpulan artikel edukatif, analisis regulasi terbaru, dan wawasan praktis dari para advokat Attar Lawfirm Office.
          </p>
        </div>

        {/* State Memuat (Loading) */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="h-44 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded-sm w-3/4" />
                <div className="h-3 bg-gray-100 rounded-sm w-full" />
                <div className="h-3 bg-gray-100 rounded-sm w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Grid Kartu Artikel */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => {
              const thumbnailUrl = getThumbnailUrl(article.thumbnail);
              const plainExcerpt = stripHtml(article.content);
              const formattedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Terbaru';

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Gambar Thumbnail atau Placeholder */}
                    <div className="relative h-48 bg-primary/10 overflow-hidden">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}

                      <div
                        className={`w-full h-full flex items-center justify-center bg-primary/5 text-accent ${
                          thumbnailUrl ? 'hidden' : ''
                        }`}
                      >
                        <FaNewspaper className="w-12 h-12 opacity-40" />
                      </div>

                      {/* Kategori Badge */}
                      {article.category_name && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/90 text-white text-[11px] font-semibold backdrop-blur-xs shadow-xs">
                          <FaTag className="w-2.5 h-2.5 text-accent" />
                          <span>{article.category_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Badan Kartu */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-[11px] text-dark-muted mb-2">
                        <FaCalendarAlt className="text-accent" />
                        <span>{formattedDate}</span>
                      </div>

                      <h3 className="text-base font-bold text-primary mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-dark-muted leading-relaxed line-clamp-3">
                        {plainExcerpt || 'Baca kupasan hukum dan panduan praktis regulasi dari tim advokat kami.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Kartu (Penulis) */}
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-dark-muted">
                    <span className="font-medium text-primary">
                      Oleh: {article.author_name || 'Tim Advokat'}
                    </span>
                    <span className="text-accent-dark font-semibold">
                      Artikel Hukum
                    </span>
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

