const AppointmentModel = require('../models/appointmentModel');
const { seedAppointmentsData } = require('../src/config/seed');

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

// Perbarui status janji temu (pending, confirmed, completed, cancelled) & catatan admin
async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status janji temu tidak valid. Pilihan: pending, confirmed, completed, cancelled.'
      });
    }

    const exists = await AppointmentModel.findById(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Data janji temu tidak ditemukan.'
      });
    }

    await AppointmentModel.updateStatus(id, { status, admin_notes });
    const updated = await AppointmentModel.findById(id);

    return res.status(200).json({
      success: true,
      message: `Status janji temu berhasil diubah menjadi '${status}'.`,
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
  updateAppointmentStatus,
  getAppointmentStats,
  triggerSeeder
};

