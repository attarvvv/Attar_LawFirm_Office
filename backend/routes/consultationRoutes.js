// Rute publik untuk modul konsultasi hukum (form pengajuan tanpa autentikasi)
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');

// POST /api/consultations - Kirim permohonan konsultasi hukum baru
router.post('/', consultationController.createConsultation);

module.exports = router;

