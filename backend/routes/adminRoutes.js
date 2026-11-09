const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// GET /api/admin/dashboard-stub - Ringkasan dashboard shell (Dapat diakses admin, lawyer, staff)
router.get('/dashboard-stub', verifyToken, adminController.getDashboardStub);

// GET /api/admin/manage-users-stub - Endpoint khusus peran admin (Role: admin saja)
router.get('/manage-users-stub', verifyToken, requireRole('admin'), adminController.getManageUsersStub);

module.exports = router;
