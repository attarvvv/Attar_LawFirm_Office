// Controller untuk modul Konsultasi Masuk (Consultations)
// Menangani pengajuan konsultasi publik serta pengelolaan konsultasi oleh tim internal portal
const ConsultationModel = require('../models/consultationModel');
const ServiceModel = require('../models/serviceModel');
const AppointmentModel = require('../models/appointmentModel');
const LawyerModel = require('../models/lawyerModel');
const { seedConsultationsData } = require('../src/config/seed');

// Format regex standar untuk validasi alamat email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pengajuan konsultasi hukum baru dari form publik (tanpa autentikasi)
async function createConsultation(req, res, next) {
  try {
    const { client_name, client_email, client_phone, service_id, subject, message, requested_date } = req.body;

    // Validasi field wajib diisi
    if (!client_name || !client_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap wajib diisi.'
      });
    }

    if (!client_email || !client_email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Alamat email wajib diisi.'
      });
    }

    // Validasi format email klien
    if (!emailRegex.test(client_email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Format alamat email tidak valid.'
      });
    }

    // Validasi nomor telepon/WhatsApp wajib diisi demi kelancaran konfirmasi
    if (!client_phone || !client_phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon/WhatsApp wajib diisi untuk pengiriman konfirmasi.'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Keterangan atau keluhan hukum wajib diisi.'
      });
    }

    // Validasi tanggal janji temu yang diinginkan
    if (!requested_date) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal janji temu yang diinginkan wajib dipilih.'
      });
    }

    // Pastikan tanggal valid dan bukan di masa lalu
    const parsedDate = new Date(requested_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Format tanggal janji temu tidak valid.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(requested_date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal janji temu yang diinginkan tidak boleh di masa lalu.'
      });
    }

    // Tentukan subjek otomatis dari judul bidang keahlian jika tidak disediakan oleh pengguna
    let finalSubject = subject ? subject.trim() : '';
    if (!finalSubject && service_id) {
      const service = await ServiceModel.getById(service_id);
      if (service && service.title) {
        finalSubject = `Konsultasi mengenai ${service.title}`;
      }
    }

    if (!finalSubject) {
      finalSubject = 'Permohonan Konsultasi Hukum';
    }

    // Simpan konsultasi ke database dengan status default 'unread'
    const newConsultation = await ConsultationModel.create({
      client_name: client_name.trim(),
      client_email: client_email.trim(),
      client_phone: client_phone.trim(),
      service_id: service_id ? parseInt(service_id, 10) : null,
      requested_date: requested_date,
      subject: finalSubject,
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Permohonan konsultasi Anda telah kami terima. Tim kami akan segera menghubungi Anda.',
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
    const allowedStatuses = ['unread', 'read', 'replied', 'archived', 'converted'];
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

// Konversi konsultasi menjadi janji temu resmi di tabel appointments
async function convertToAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { lawyer_id, appointment_date, appointment_time } = req.body;

    // Pastikan konsultasi ada
    const consultation = await ConsultationModel.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Data konsultasi tidak ditemukan.'
      });
    }

    // Tolak jika konsultasi sudah dikonversi atau diarsipkan
    if (consultation.status === 'converted' || consultation.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Konsultasi ini sudah dikonversi menjadi janji temu atau telah diarsipkan.'
      });
    }

    // Validasi field input wajib
    if (!lawyer_id) {
      return res.status(400).json({
        success: false,
        message: 'Pengacara yang menangani wajib dipilih.'
      });
    }

    if (!appointment_date) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal janji temu wajib diisi.'
      });
    }

    if (!appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'Jam pertemuan janji temu wajib diisi.'
      });
    }

    // Pastikan pengacara valid
    const lawyer = await LawyerModel.getById(lawyer_id);
    if (!lawyer) {
      return res.status(400).json({
        success: false,
        message: 'Pengacara yang dipilih tidak ditemukan.'
      });
    }

    // Generate kode booking janji temu unik
    const bookingCode = await AppointmentModel.generateBookingCode();

    // Buat janji temu baru di tabel appointments
    const newAppointment = await AppointmentModel.create({
      booking_code: bookingCode,
      client_name: consultation.client_name,
      client_email: consultation.client_email,
      client_phone: consultation.client_phone,
      lawyer_id: parseInt(lawyer_id, 10),
      service_id: consultation.service_id,
      appointment_date: appointment_date,
      appointment_time: appointment_time,
      notes: consultation.message,
      status: 'pending',
      meeting_location: null,
      admin_notes: null
    });

    // Ubah status konsultasi menjadi 'converted'
    await ConsultationModel.updateStatus(id, 'converted');

    return res.status(201).json({
      success: true,
      message: 'Janji temu berhasil dibuat dari data konsultasi.',
      data: {
        appointment_id: newAppointment.id,
        booking_code: newAppointment.booking_code,
        appointment: newAppointment
      }
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
  convertToAppointment,
  triggerSeeder
};

