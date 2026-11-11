// Rute publik untuk kategori artikel (tanpa autentikasi)
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// GET /api/categories - Daftar seluruh kategori untuk filter publik
router.get('/', CategoryController.index);

module.exports = router;

