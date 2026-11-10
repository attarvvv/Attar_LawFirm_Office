// Halaman utama dashboard internal portal kantor hukum
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAdminUsersStub } from '../api/auth';
import { fetchAppointmentStats } from '../api/appointments';
import { fetchConsultations } from '../api/consultations';
import { fetchLawyers } from '../api/lawyers';
import { t } from '../i18n';
import {
  FaCalendarCheck,
  FaInbox,
  FaFileAlt,
  FaUserTie,
  FaShieldAlt,
  FaUsersCog,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [adminTestResult, setAdminTestResult] = useState(null);
  const [testingAdminApi, setTestingAdminApi] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [consultationCount, setConsultationCount] = useState(0);
  const [lawyerCount, setLawyerCount] = useState(0);

  // Ambil data jumlah janji temu, konsultasi, dan pengacara aktif
  useEffect(() => {
    async function loadStats() {
      try {
        const appRes = await fetchAppointmentStats();
        if (appRes.success && appRes.data) {
          // Jumlah janji temu aktif (pending + confirmed)
          const active = (appRes.data.pending || 0) + (appRes.data.confirmed || 0);
          setAppointmentCount(active);
        }
      } catch (err) {
        console.warn('Gagal memuat stats janji temu di dashboard:', err.message);
      }

      try {
        const consultRes = await fetchConsultations();
        if (consultRes.success && consultRes.stats) {
          // Jumlah pesan konsultasi belum dibaca (unread) atau total aktif
          setConsultationCount(consultRes.stats.unread || 0);
        }
      } catch (err) {
        console.warn('Gagal memuat stats konsultasi di dashboard:', err.message);
      }

      try {
        const lawyerRes = await fetchLawyers({ status: 'active' });
        if (lawyerRes.success && lawyerRes.data) {
          setLawyerCount(lawyerRes.data.length);
        }
      } catch (err) {
        console.warn('Gagal memuat data pengacara di dashboard:', err.message);
      }
    }
    loadStats();
  }, []);

  // Uji coba endpoint khusus peran Administrator (RBAC)
  const handleTestAdminRoute = async () => {
    setTestingAdminApi(true);
    setAdminTestResult(null);

    try {
      const res = await fetchAdminUsersStub();
      setAdminTestResult({
        success: true,
        status: 200,
        message: 'Akses DITERIMA (200 OK): Anda memiliki wewenang administrator penuh.',
        data: res
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        status: 403,
        message: `Akses DITOLAK (403 Forbidden): Akun ${user?.role} tidak diizinkan mengakses resource administrator.`
      });
    } finally {
      setTestingAdminApi(false);
    }
  };

  // Kartu metrik ringkasan modul kantor hukum
  const metricCards = [
    {
      title: t('activeAppointments'),
      count: String(appointmentCount),
      icon: FaCalendarCheck,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      note: 'Penjadwalan & booking klien',
      link: '/admin/appointments'
    },
    {
      title: t('incomingConsultations'),
      count: String(consultationCount),
      icon: FaInbox,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      note: 'Pesan baru belum dibaca',
      link: '/admin/consultations'
    },
    {
      title: t('publishedArticles'),
      count: '0',
      icon: FaFileAlt,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      note: 'Publikasi artikel & hukum',
      link: null
    },
    {
      title: t('activeLawyers'),
      count: String(lawyerCount),
      icon: FaUserTie,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      note: 'Profil & spesialisasi advokat',
      link: '/admin/lawyers'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-accent/20">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('welcomeUser')} {user?.nama}!
          </h2>
          <p className="mt-2 text-sm text-gray-200 leading-relaxed">
            Anda berhasil terautentikasi ke dalam portal operasional internal <strong className="text-accent">Attar Lawfirm Office</strong> sebagai{' '}
            <span className="uppercase font-semibold tracking-wider text-accent">
              {user?.role}
            </span>.
          </p>
        </div>

        {/* Ornamen watermark timbangan keadilan */}
        <div className="absolute right-4 -bottom-6 text-9xl text-white/5 pointer-events-none select-none font-serif">
          ⚖️
        </div>
      </div>

      {/* Ringkasan Modul Kantor Hukum */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-primary">
            Ringkasan Modul Kantor Hukum
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const CardWrapper = card.link ? Link : 'div';
            const wrapperProps = card.link ? { to: card.link } : {};

            return (
              <CardWrapper
                key={card.title}
                {...wrapperProps}
                className={`bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden block ${
                  card.link ? 'hover:border-accent cursor-pointer group' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-lg border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.link && (
                    <span className="text-xs font-semibold text-accent group-hover:text-primary transition-colors flex items-center gap-1">
                      <span>Buka</span>
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-dark-muted">{card.title}</h4>
                <div className="text-2xl font-bold text-primary mt-1 mb-2">
                  {card.count}
                </div>
                <p className="text-xs text-gray-400">{card.note}</p>
              </CardWrapper>
            );
          })}
        </div>
      </div>

      {/* Bagian Khusus Administrator (Hanya tampil jika yang login adalah Admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent-dark">
                <FaUsersCog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">
                  {t('navManageUsers')}
                </h3>
                <p className="text-xs text-dark-muted">
                  {t('manageUsersDesc')}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Terbuka (Admin)</span>
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-sm">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <FaCheckCircle className="text-emerald-600" />
                <span>Otorisasi Terverifikasi: Peran Administrator</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Sebagai Administrator, Anda memiliki akses penuh ke fitur pengelolaan pengguna di masa mendatang (membuat akun Pengacara, mengatur peran, dan menyetujui staf).
              </p>
            </div>

            {/* Penguji RBAC Interaktif */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Uji Keamanan Role-Based Access Control (RBAC)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Panggil endpoint terlindungi <code className="text-primary bg-gray-100 px-1 py-0.5 rounded font-mono">GET /api/admin/manage-users-stub</code>
                  </p>
                </div>
                <button
                  onClick={handleTestAdminRoute}
                  disabled={testingAdminApi}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60 cursor-pointer"
                >
                  <FaShieldAlt className="text-accent" />
                  <span>{testingAdminApi ? 'Memverifikasi...' : t('testAdminApiBtn')}</span>
                </button>
              </div>

              {adminTestResult && (
                <div
                  className={`mt-4 p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                    adminTestResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  <span className="font-bold text-sm">
                    {adminTestResult.success ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-semibold">{adminTestResult.message}</p>
                    <p className="mt-0.5 text-[11px] opacity-80">
                      HTTP Status: {adminTestResult.status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
