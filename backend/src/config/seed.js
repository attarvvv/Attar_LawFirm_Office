const { pool } = require('./db');

// Seeder data awal untuk pengujian modul sistem internal portal
// Memastikan tabel services, lawyers, appointments, dan consultations memiliki data contoh yang rapi
async function seedAppointmentsData() {
  try {
    // 1. Cek dan isi layanan hukum jika masih kosong
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

    // 2. Cek dan isi daftar pengacara jika masih kosong
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

    // 3. Cek dan isi janji temu jika masih kosong
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

// Seeder data contoh untuk pengujian modul Konsultasi Masuk (Consultations)
async function seedConsultationsData() {
  try {
    const [consultations] = await pool.query('SELECT count(*) as count FROM consultations');
    if (consultations[0].count === 0) {
      const [serviceRows] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 4');
      const s1 = serviceRows[0]?.id || 1;
      const s2 = serviceRows[1]?.id || 2;
      const s3 = serviceRows[2]?.id || 3;
      const s4 = serviceRows[3]?.id || 4;

      await pool.query(`
        INSERT INTO consultations 
        (client_name, client_email, client_phone, service_id, subject, message, status, created_at) 
        VALUES
        ('Rian Pratama', 'rian.pratama@startup.id', '081234567891', ?, 'Pertanyaan Perizinan OSS dan Struktur Saham PT', 'Halo tim Attar Lawfirm, kami sedang mendirikan perseroan terbatas baru di bidang edutech dan butuh panduan mengenai klasifikasi KBLI di OSS serta pembagian hak suara saham pendiri. Mohon informasi terkait prosedur dan biayanya.', 'unread', NOW() - INTERVAL 1 HOUR),
        ('Siti Nurhaliza', 'siti.nurhaliza@gmail.com', '081398765432', ?, 'Sengketa Batas Tanah Warisan Keluarga', 'Selamat siang, keluarga kami memiliki sertifikat tanah di Jakarta Selatan namun ada klaim dari pihak ketiga atas sebagian batas pekarangan. Kami berencana menempuh jalur mediasi terlebih dahulu sebelum ke pengadilan. Apakah bisa dijadwalkan konsultasi awal minggu ini?', 'unread', NOW() - INTERVAL 3 HOUR),
        ('Ahmad Fauzi', 'ahmad.fauzi@logistikprima.co.id', '082112233445', ?, 'Tinjauan Draf Kontrak Kerja PKWT 2026', 'Perusahaan kami ingin memperbarui klausul kerahasiaan data (NDA) dan non-kompetisi dalam template perjanjian kerja waktu tertentu kami agar sesuai dengan regulasi ketenagakerjaan terbaru.', 'read', NOW() - INTERVAL 1 DAY),
        ('Dian Permatasari', 'dian.permatasari@creativehub.com', '085712345678', ?, 'Pendaftaran Hak Merek Kelas 35 & 42', 'Terima kasih atas tanggapan sebelumnya. Kami sudah mengumpulkan seluruh logo brand dan formulir bukti pemakaian pertama untuk segera diajukan ke Ditjen KI.', 'replied', NOW() - INTERVAL 2 DAY),
        ('Gunawan Wijaya', 'gunawan.w@ptsejahteramaju.com', '081823456789', NULL, 'Permintaan Penawaran Legal Retainer Bulanan', 'Kami tertarik dengan skema retainer pendampingan hukum operasional rutin untuk perusahaan logistik skala menengah. Harap kirimkan proposal penawaran jasa hukum ke email kami.', 'archived', NOW() - INTERVAL 5 DAY)
      `, [s1, s2, s3, s4]);
      console.log('[Seeder] Data konsultasi masuk (consultations) berhasil ditambahkan.');
    }
    return true;
  } catch (err) {
    console.error('[Seeder Error]:', err.message);
    throw err;
  }
}

// Jalankan langsung jika dipanggil dari CLI
if (require.main === module) {
  Promise.all([seedAppointmentsData(), seedConsultationsData()])
    .then(() => {
      console.log('Seeder selesai.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedAppointmentsData, seedConsultationsData };

