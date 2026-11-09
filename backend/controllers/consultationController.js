// Controller untuk modul Konsultasi Masuk (Consultations)
// Menangani pengajuan konsultasi publik serta pengelolaan konsultasi oleh tim internal portal
const ConsultationModel = require('../models/consultationModel');
const { seedConsultationsData } = require('../src/config/seed');

// Format regex standar untuk validasi alamat email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pengajuan konsultasi hukum baru dari form publik (tanpa autentikasi)
async function createConsultation(req, res, next) {
  try {
    const { client_name, client_email, client_phone, service_id, subject, message } = req.body;

    // Validasi data wajib diisi
    if (!client_name || !client_email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, subjek konsultasi, dan pesan wajib diisi.'
      });
    }

    // Validasi format email klien
    if (!emailRegex.test(client_email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Format alamat email tidak valid.'
      });
    }

    // Simpan konsultasi ke database dengan status default 'unread'
    const newConsultation = await ConsultationModel.create({
      client_name: client_name.trim(),
      client_email: client_email.trim(),
      client_phone: client_phone ? client_phone.trim() : null,
      service_id: service_id || null,
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Permohonan konsultasi hukum Anda berhasil dikirim. Tim kami akan segera menindaklanjuti.',
      data: newConsultation
    });
  } catch (error) {
    next(error);
  }
}

// Ambil seluruh daftar konsultasi masuk dengan filter status dan pencarian (area internal)
async function getAllConsultations(req, res, next) {
  try {
    const { status, search } = req.query;

    // Ambil data konsultasi sesuai filter serta ringkasan jumlah per status
    const consultations = await ConsultationModel.findAll({ status, search });
    const stats = await ConsultationModel.getStats();

    return res.status(200).json({
      success: true,
      message: 'Data konsultasi masuk berhasil dimuat.',
      stats,
      data: consultations
    });
  } catch (error) {
    next(error);
  }
}

// Ambil detail satu konsultasi berdasarkan ID (area internal)
// Otomatis ubah status jadi 'read' saat staf/admin pertama kali membuka konsultasi yang masih berstatus 'unread'
async function getConsultationById(req, res, next) {
  try {
    const { id } = req.params;
    const consultation = await ConsultationModel.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Data konsultasi tidak ditemukan.'
      });
    }

    // Otomatis ubah status jadi 'read' saat pertama kali dilihat oleh petugas internal
    if (consultation.status === 'unread') {
      await ConsultationModel.updateStatus(id, 'read');
      consultation.status = 'read';
    }

    return res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
}

// Perbarui status konsultasi secara manual (unread, read, replied, archived)
async function updateConsultationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi nilai status yang diizinkan sesuai enum database
    const allowedStatuses = ['unread', 'read', 'replied', 'archived'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Pilihan: unread, read, replied, archived.'
      });
    }

    // Pastikan data konsultasi yang akan diubah memang ada
    const existing = await ConsultationModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data konsultasi tidak ditemukan.'
      });
    }

    // Simpan status baru ke database
    await ConsultationModel.updateStatus(id, status);
    const updated = await ConsultationModel.findById(id);

    return res.status(200).json({
      success: true,
      message: `Status konsultasi berhasil diubah menjadi '${status}'.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Muat data contoh konsultasi untuk keperluan pengujian lokal
async function triggerSeeder(req, res, next) {
  try {
    await seedConsultationsData();
    const consultations = await ConsultationModel.findAll();
    const stats = await ConsultationModel.getStats();

    return res.status(200).json({
      success: true,
      message: 'Data contoh konsultasi berhasil dimuat.',
      stats,
      data: consultations
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
  triggerSeeder
};

