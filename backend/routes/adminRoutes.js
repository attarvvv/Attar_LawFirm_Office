const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const consultationController = require('../controllers/consultationController');
const LawyerController = require('../controllers/lawyerController');
const CategoryController = require('../controllers/categoryController');
const ArticleController = require('../controllers/articleController');
const { handlePhotoUpload, handleThumbnailUpload } = require('../middleware/uploadMiddleware');
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

// Rute manajemen kategori artikel (Categories CRUD)
// GET /api/admin/categories - Seluruh staf dan pengacara dapat melihat kategori untuk dropdown artikel
router.get('/categories', verifyToken, CategoryController.index);

// GET /api/admin/categories/:id - Detail satu kategori
router.get('/categories/:id', verifyToken, CategoryController.show);

// POST /api/admin/categories - Tambah kategori baru (khusus admin)
router.post('/categories', verifyToken, requireRole('admin'), CategoryController.store);

// PUT /api/admin/categories/:id - Perbarui kategori (khusus admin)
router.put('/categories/:id', verifyToken, requireRole('admin'), CategoryController.update);

// DELETE /api/admin/categories/:id - Hapus kategori (khusus admin, penanganan FK restrict jika ada artikel terikat)
router.delete('/categories/:id', verifyToken, requireRole('admin'), CategoryController.destroy);

// Rute manajemen artikel edukasi hukum (Articles CRUD)
// GET /api/admin/articles - Seluruh pengguna internal dapat melihat daftar draf dan terbit
router.get('/articles', verifyToken, ArticleController.index);

// GET /api/admin/articles/:id - Detail artikel lengkap untuk form edit
router.get('/articles/:id', verifyToken, ArticleController.show);

// POST /api/admin/articles - Buat artikel baru (dapat dibuat oleh staf/pengacara/admin, author_id otomatis dari token)
router.post('/articles', verifyToken, handleThumbnailUpload, ArticleController.store);

// PUT /api/admin/articles/:id - Perbarui artikel (hanya penulis artikel asli atau admin)
router.put('/articles/:id', verifyToken, handleThumbnailUpload, ArticleController.update);

// PATCH /api/admin/articles/:id/status - Ubah status publikasi draft/published (hanya penulis atau admin)
router.patch('/articles/:id/status', verifyToken, ArticleController.updateStatus);

// DELETE /api/admin/articles/:id - Hapus artikel (hanya penulis artikel asli atau admin)
router.delete('/articles/:id', verifyToken, ArticleController.destroy);

module.exports = router;
