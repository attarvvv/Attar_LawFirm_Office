// Rute publik untuk daftar pengacara kantor hukum (tanpa autentikasi)
const express = require('express');
const router = express.Router();
const LawyerController = require('../controllers/lawyerController');

// GET /api/lawyers - Daftar pengacara aktif untuk tampilan profil website publik
router.get('/', LawyerController.publicIndex);

module.exports = router;

