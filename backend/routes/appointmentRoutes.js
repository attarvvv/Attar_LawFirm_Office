const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Semua rute janji temu diproteksi oleh token autentikasi
router.use(verifyToken);

// GET /api/appointments - Ambil daftar janji temu (bisa filter ?status=pending&search=...)
router.get('/', appointmentController.getAllAppointments);

// GET /api/appointments/stats - Ambil ringkasan statistik
router.get('/stats', appointmentController.getAppointmentStats);

// POST /api/appointments/seed - Muat data contoh janji temu
router.post('/seed', appointmentController.triggerSeeder);

// GET /api/appointments/:id - Detail janji temu
router.get('/:id', appointmentController.getAppointmentById);

// PATCH /api/appointments/:id/status - Update status janji temu
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// PATCH /api/appointments/:id - Update data janji temu (status, meeting_location, admin_notes)
router.patch('/:id', appointmentController.updateAppointment);

// POST /api/appointments/:id/send-confirmation - Kirim notifikasi konfirmasi WhatsApp
router.post('/:id/send-confirmation', appointmentController.sendConfirmation);

module.exports = router;

