// Halaman Utama Publik (Landing Page) Kantor Hukum Attar Lawfirm Office
// Merakit seluruh seksi beranda publik secara modular dengan navigasi anchor dan desain responsif
import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import VisionMissionSection from '../components/landing/VisionMissionSection';
import ServicesSection from '../components/landing/ServicesSection';
import LawyersSection from '../components/landing/LawyersSection';
import ArticlesTeaserSection from '../components/landing/ArticlesTeaserSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';
import ConsultationModal from '../components/landing/ConsultationModal';

export default function LandingPage() {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Set judul dokumen dan metadata halaman publik
  useEffect(() => {
    document.title = 'Attar Lawfirm Office - Kantor Advokat & Konsultan Hukum Terpercaya';

    // Tambah atau perbarui tag meta deskripsi untuk SEO & higienitas halaman web
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      'Attar Lawfirm Office adalah kantor advokat dan konsultan hukum terpercaya di Indonesia yang menangani litigasi sengketa bisnis, perdata, pidana, dan kepatuhan hukum korporasi.';

    return () => {
      document.title = 'Attar Lawfirm Office - Internal Portal';
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans text-dark scroll-smooth selection:bg-accent selection:text-primary">
      {/* Navigasi Utama Publik */}
      <Navbar onOpenConsultation={() => setIsConsultationModalOpen(true)} />

      {/* Bagian Hero Utama */}
      <main>
        <HeroSection onOpenConsultation={() => setIsConsultationModalOpen(true)} />

        {/* Profil Kantor Hukum */}
        <AboutSection />

        {/* Visi & Misi */}
        <VisionMissionSection />

        {/* Bidang Keahlian & Spesialisasi Hukum */}
        <ServicesSection />

        {/* Tim Advokat Berlisensi */}
        <LawyersSection />

        {/* Teaser Artikel & Berita Hukum Terkini */}
        <ArticlesTeaserSection />

        {/* Kontak Sekretariat & Konsultasi Langsung */}
        <ContactSection onOpenConsultation={() => setIsConsultationModalOpen(true)} />
      </main>

      {/* Footer & Tautan Portal Staf */}
      <Footer onOpenConsultation={() => setIsConsultationModalOpen(true)} />

      {/* Modal Formulir Permohonan Konsultasi Publik */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />
    </div>
  );
}

