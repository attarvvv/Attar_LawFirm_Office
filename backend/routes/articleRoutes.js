// Rute publik untuk artikel edukasi hukum dan berita kantor hukum (tanpa autentikasi)
const express = require('express');
const router = express.Router();
const ArticleController = require('../controllers/articleController');

// GET /api/articles - Daftar artikel terbit (mendukung filter kategori, pencarian, dan paginasi)
router.get('/', ArticleController.publicIndex);

// GET /api/articles/:slug - Detail satu artikel terbit berdasarkan slug
router.get('/:slug', ArticleController.publicShow);

module.exports = router;

