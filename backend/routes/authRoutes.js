const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Registrasi staf internal baru (Publik)
router.post('/register', authController.register);

// POST /api/auth/login - Login dan penerbitan token JWT + cookie (Publik)
router.post('/login', authController.login);

// GET /api/auth/me - Ambil profil pengguna aktif (Perlu token)
router.get('/me', verifyToken, authController.getMe);

// POST /api/auth/logout - Akhiri sesi dan hapus cookie (Perlu token / Publik)
router.post('/logout', authController.logout);

module.exports = router;
