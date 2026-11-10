const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const consultationController = require('../controllers/consultationController');
const LawyerController = require('../controllers/lawyerController');
const { handlePhotoUpload } = require('../middleware/uploadMiddleware');
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

// Rute manajemen pengacara (Lawyers CRUD)
// GET /api/admin/lawyers - Seluruh pengguna internal (admin, lawyer, staff) dapat melihat daftar lengkap
router.get('/lawyers', verifyToken, LawyerController.index);

// GET /api/admin/lawyers/:id - Detail satu pengacara termasuk kontak internal
router.get('/lawyers/:id', verifyToken, LawyerController.show);

// POST /api/admin/lawyers - Tambah pengacara baru (khusus admin, mendukung upload foto multipart/form-data)
router.post('/lawyers', verifyToken, requireRole('admin'), handlePhotoUpload, LawyerController.store);

// PUT /api/admin/lawyers/:id - Perbarui data pengacara (khusus admin, mendukung upload foto pengganti)
router.put('/lawyers/:id', verifyToken, requireRole('admin'), handlePhotoUpload, LawyerController.update);

// PATCH /api/admin/lawyers/:id/toggle-active - Ubah status aktif/nonaktif pengacara (khusus admin)
router.patch('/lawyers/:id/toggle-active', verifyToken, requireRole('admin'), LawyerController.toggleActive);

// DELETE /api/admin/lawyers/:id - Hapus pengacara permanen (khusus admin, penanganan FK restrict jadwal)
router.delete('/lawyers/:id', verifyToken, requireRole('admin'), LawyerController.destroy);

module.exports = router;
