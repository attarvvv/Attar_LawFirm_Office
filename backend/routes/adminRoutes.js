const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const consultationController = require('../controllers/consultationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard-stub - Ringkasan dashboard shell (Dapat diakses admin, lawyer, staff)
router.get('/dashboard-stub', verifyToken, adminController.getDashboardStub);

// GET /api/admin/manage-users-stub - Endpoint khusus peran admin (Role: admin saja)
router.get('/manage-users-stub', verifyToken, requireRole('admin'), adminController.getManageUsersStub);

// GET /api/admin/consultations - Daftar konsultasi masuk beserta rekap statistik status
router.get('/consultations', verifyToken, consultationController.getAllConsultations);

// POST /api/admin/consultations/seed - Muat data contoh konsultasi untuk pengujian
router.post('/consultations/seed', verifyToken, consultationController.triggerSeeder);

// GET /api/admin/consultations/:id - Detail lengkap satu konsultasi (otomatis ubah status unread ke read)
router.get('/consultations/:id', verifyToken, consultationController.getConsultationById);

// PATCH /api/admin/consultations/:id/status - Ubah status konsultasi (unread, read, replied, archived)
router.patch('/consultations/:id/status', verifyToken, consultationController.updateConsultationStatus);

module.exports = router;
