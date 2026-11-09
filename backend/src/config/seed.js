const { pool } = require('./db');

/**
 * Seeder data awal untuk pengujian modul Janji Temu (Appointments)
 * Memastikan tabel `services`, `lawyers`, dan `appointments` memiliki data contoh yang rapi.
 */
async function seedAppointmentsData() {
  try {
    // 1. Cek & Isi Layanan Hukum (services)
    const [services] = await pool.query('SELECT count(*) as count FROM services');
    if (services[0].count === 0) {
      await pool.query(`
        INSERT INTO services (title, slug, description, icon) VALUES 
        ('Hukum Bisnis & Korporasi', 'hukum-bisnis-korporasi', 'Konsultasi pendirian badan usaha, kontrak bisnis, dan kepatuhan regulasi.', 'business'),
        ('Sengketa Perdata & Arbitrase', 'sengketa-perdata', 'Penyelesaian sengketa perdata, wanprestasi, dan hukum kepemilikan aset.', 'civil'),
        ('Hukum Ketenagakerjaan', 'hukum-ketenagakerjaan', 'Penyusunan PKWT/PKWTT, peraturan perusahaan, dan mediasi ketenagakerjaan.', 'labor'),
        ('Kekayaan Intelektual (HAKI)', 'kekayaan-intelektual', 'Pendaftaran dan perlindungan hak cipta, merek dagang, dan lisensi paten.', 'ip')
      `);
      console.log('[Seeder] Data layanan hukum berhasil ditambahkan.');
    }

    // 2. Cek & Isi Daftar Pengacara (lawyers)
    const [lawyers] = await pool.query('SELECT count(*) as count FROM lawyers');
    if (lawyers[0].count === 0) {
      await pool.query(`
        INSERT INTO lawyers (full_name, title, specialization, email, phone, is_active) VALUES 
        ('H. Muhammad Attar, S.H., M.H.', 'Managing Partner & Senior Advocate', 'Hukum Bisnis, Litigasi Perdata & Arbitrase', 'attar@attarlaw.id', '081234567890', 1),
        ('Dr. Siti Aminah, S.H., LL.M.', 'Partner / Legal Consultant', 'Hukum Perusahaan & Ketenagakerjaan', 'aminah@attarlaw.id', '081298765432', 1),
        ('Budi Santoso, S.H., M.Kn.', 'Senior Associate', 'Hukum Properti, Agraria & Kontrak', 'budi@attarlaw.id', '081377889900', 1)
      `);
      console.log('[Seeder] Data pengacara berhasil ditambahkan.');
    }

    // 3. Cek & Isi Janji Temu (appointments)
    const [apps] = await pool.query('SELECT count(*) as count FROM appointments');
    if (apps[0].count === 0) {
      const [lawyerRows] = await pool.query('SELECT id FROM lawyers ORDER BY id ASC LIMIT 3');
      const [serviceRows] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 3');

      const l1 = lawyerRows[0]?.id || 1;
      const l2 = lawyerRows[1]?.id || 1;
      const l3 = lawyerRows[2]?.id || 1;
      const s1 = serviceRows[0]?.id || 1;
      const s2 = serviceRows[1]?.id || 1;
      const s3 = serviceRows[2]?.id || 1;

      await pool.query(`
        INSERT INTO appointments 
        (booking_code, client_name, client_email, client_phone, lawyer_id, service_id, appointment_date, appointment_time, notes, status, admin_notes) 
        VALUES
        ('APT-2026-001', 'Bambang Soediro', 'bambang.soediro@gmail.com', '081122334455', ?, ?, '2026-11-10', '10:00:00', 'Konsultasi merger perusahaan dan peninjauan draf perjanjian pemegang saham.', 'pending', NULL),
        ('APT-2026-002', 'Dewi Lestari, S.E.', 'dewi.lestari@perusahaan.co.id', '081987654321', ?, ?, '2026-11-12', '14:00:00', 'Pendampingan sengketa perjanjian kerja bersama dan mediasi internal.', 'confirmed', 'Disetujui di Ruang Rapat Utama A'),
        ('APT-2026-003', 'Ir. Hendra Kusuma', 'hendra.k@mitrateknik.com', '085678901234', ?, ?, '2026-11-05', '09:30:00', 'Pendaftaran lisensi paten teknologi industri dan audit perlindungan HAKI.', 'completed', 'Konsultasi selesai, berkas dokumen fisik telah diserahkan.'),
        ('APT-2026-004', 'PT Mandiri Jaya Abadi', 'irwan.mandiri@corp.id', '082133445566', ?, ?, '2026-11-06', '13:00:00', 'Review kontrak distribusi barang lintas daerah.', 'cancelled', 'Dibatalkan oleh klien karena ada agenda dinas mendesak ke luar kota.')
      `, [l1, s1, l2, s2, l3, s3, l1, s1]);
      console.log('[Seeder] Data janji temu (appointments) berhasil ditambahkan.');
    }

    return true;
  } catch (err) {
    console.error('[Seeder Error]:', err.message);
    throw err;
  }
}

// Jalankan langsung jika dipanggil dari CLI
if (require.main === module) {
  seedAppointmentsData()
    .then(() => {
      console.log('Seeder selesai.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedAppointmentsData };

