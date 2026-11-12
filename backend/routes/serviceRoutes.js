// Rute publik untuk bidang keahlian dan layanan hukum kantor (tanpa autentikasi)
const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');

// GET /api/services - Daftar bidang keahlian untuk tampilan website publik dan landing page
router.get('/', ServiceController.publicIndex);

module.exports = router;

