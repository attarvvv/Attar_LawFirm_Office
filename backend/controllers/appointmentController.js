const AppointmentModel = require('../models/appointmentModel');
const WhatsappService = require('../services/whatsappService');
const { seedAppointmentsData } = require('../src/config/seed');

// Helper format tanggal Indonesia panjang (contoh: "Kamis, 12 November 2026")
function formatIndonesianDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Ambil seluruh daftar janji temu dengan filter opsional
async function getAllAppointments(req, res, next) {
  try {
    const { status, search } = req.query;
    const appointments = await AppointmentModel.findAll({ status, search });
    const stats = await AppointmentModel.getStats();

    return res.status(200).json({
      success: true,
      message: 'Data janji temu berhasil dimuat.',
      stats,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}

// Ambil detail satu janji temu
async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = await AppointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Data janji temu tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}

// Perbarui data janji temu fleksibel (status, meeting_location, admin_notes)
async function updateAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { status, meeting_location, admin_notes } = req.body;

    // Pastikan janji temu ada
    const exists = await AppointmentModel.findById(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Data janji temu tidak ditemukan.'
      });
    }

    // Validasi status jika dikirimkan
    if (status !== undefined) {
      const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status janji temu tidak valid. Pilihan: pending, confirmed, completed, cancelled.'
        });
      }
    }

    await AppointmentModel.update(id, { status, meeting_location, admin_notes });
    const updated = await AppointmentModel.findById(id);

    return res.status(200).json({
      success: true,
      message: 'Data janji temu berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Alias kompatibilitas untuk pembaruan status lama
const updateAppointmentStatus = updateAppointment;

// Kirim pesan notifikasi konfirmasi janji temu via WhatsApp
async function sendConfirmation(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = await AppointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Data janji temu tidak ditemukan.'
      });
    }

    // Validasi server-side status wajib confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Konfirmasi WhatsApp hanya dapat dikirim jika status janji temu telah Dikonfirmasi.'
      });
    }

    // Validasi lokasi pertemuan wajib sudah ditentukan
    if (!appointment.meeting_location || !appointment.meeting_location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lokasi pertemuan wajib ditentukan terlebih dahulu sebelum mengirim konfirmasi.'
      });
    }

    // Validasi nomor telepon klien
    if (!appointment.client_phone || !appointment.client_phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon klien tidak tersedia.'
      });
    }

    // Format variabel template pesan
    const clientName = appointment.client_name;
    const locationText = appointment.meeting_location;
    const dateText = formatIndonesianDate(appointment.appointment_date);
    const lawyerName = appointment.lawyer_name || 'Advokat Attar Lawfirm';

    // Format pesan persis sesuai template instruksi
    const message = `PEMBERITAHUAN KONFIRMASI JANJI TEMU
Yth. Bapak/Ibu ${clientName},
Dengan hormat,
Melalui pemberitahuan ini, kami informasikan bahwa janji temu Anda telah berhasil dikonfirmasi oleh pihak kami.
Sehubungan dengan hal tersebut, kami mengundang Anda untuk hadir sesuai dengan jadwal dan informasi pertemuan berikut:
DETAIL JANJI TEMU

Lokasi: ${locationText}
Tanggal: ${dateText}
Pengacara: ${lawyerName}

Kami mengharapkan kehadiran Anda tepat waktu sesuai dengan jadwal yang telah ditentukan. Mohon untuk memperhatikan detail informasi pertemuan di atas guna memastikan kelancaran proses konsultasi.
Apabila terdapat perubahan jadwal atau kendala dalam menghadiri pertemuan, silakan menghubungi pihak kami melalui saluran komunikasi yang tersedia.
Demikian pemberitahuan ini kami sampaikan. Terima kasih atas kepercayaan dan kerja sama yang telah diberikan.
Hormat kami,
Tim Administrasi
Attar Lawfirm Office`;

    // Kirim pesan melalui bot WhatsApp Baileys
    const result = await WhatsappService.sendMessage(appointment.client_phone, message);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Gagal mengirim pesan WhatsApp. Pastikan bot terhubung.'
      });
    }

    // Catat timestamp pengiriman konfirmasi hanya jika pengiriman benar-benar berhasil
    const isResend = Boolean(appointment.confirmation_sent_at);
    await AppointmentModel.markConfirmationSent(id);
    const updated = await AppointmentModel.findById(id);

    return res.status(200).json({
      success: true,
      is_resend: isResend,
      message: isResend
        ? 'Pesan konfirmasi WhatsApp berhasil dikirim ulang ke klien.'
        : 'Pesan konfirmasi WhatsApp berhasil dikirim ke klien.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Ambil statistik ringkasan jumlah janji temu
async function getAppointmentStats(req, res, next) {
  try {
    const stats = await AppointmentModel.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

// Trigger seeder data awal contoh jika database kosong
async function triggerSeeder(req, res, next) {
  try {
    await seedAppointmentsData();
    const appointments = await AppointmentModel.findAll();
    const stats = await AppointmentModel.getStats();

    return res.status(200).json({
      success: true,
      message: 'Data contoh berhasil dimuat ke database.',
      stats,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  sendConfirmation,
  getAppointmentStats,
  triggerSeeder
};

