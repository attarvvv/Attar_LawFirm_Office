// Controller Bidang Keahlian (Service Controller) berbasis arsitektur OOP
// Mengelola alur request-response untuk layanan hukum dan spesialisasi kantor
const ServiceModel = require('../models/serviceModel');

// Daftar ikon kurasi yang diizinkan untuk disimpan ke basis data
const ALLOWED_ICONS = [
  'FaGavel',
  'FaBalanceScale',
  'FaBriefcase',
  'FaHandshake',
  'FaShieldAlt',
  'FaFileContract',
  'FaUserShield',
  'FaLandmark',
  'FaUniversity',
  'FaStamp',
  'business',
  'civil',
  'labor',
  'ip'
];

class ServiceController {
  // Ambil daftar bidang keahlian untuk halaman publik (landing page)
  static async publicIndex(req, res, next) {
    try {
      const services = await ServiceModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Daftar bidang keahlian publik berhasil dimuat.',
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil seluruh bidang keahlian untuk area internal portal
  static async index(req, res, next) {
    try {
      const services = await ServiceModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Data bidang keahlian internal berhasil dimuat.',
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil detail satu bidang keahlian berdasarkan ID
  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const service = await ServiceModel.getById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Bidang keahlian tidak ditemukan.'
        });
      }

      return res.status(200).json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  // Tambah bidang keahlian baru (khusus administrator)
  static async store(req, res, next) {
    try {
      const { title, description, icon } = req.body;

      // Validasi field judul wajib diisi
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Judul bidang keahlian wajib diisi.'
        });
      }

      // Validasi nama ikon harus termasuk dalam daftar ikon yang diizinkan
      if (icon && !ALLOWED_ICONS.includes(icon.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Ikon bidang keahlian tidak valid. Pilih dari daftar ikon yang tersedia.'
        });
      }

      // Generate slug unik otomatis dari judul
      const slug = await ServiceModel.generateUniqueSlug(title);

      const newService = await ServiceModel.create({
        title,
        slug,
        description,
        icon: icon ? icon.trim() : 'FaBalanceScale'
      });

      return res.status(201).json({
        success: true,
        message: `Bidang keahlian '${newService.title}' berhasil dibuat.`,
        data: newService
      });
    } catch (error) {
      next(error);
    }
  }

  // Perbarui bidang keahlian yang sudah ada (khusus administrator)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ServiceModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Bidang keahlian tidak ditemukan.'
        });
      }

      const { title, description, icon } = req.body;

      // Validasi judul tidak boleh string kosong jika dikirim
      if (title !== undefined && (!title || !title.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Judul bidang keahlian tidak boleh kosong.'
        });
      }

      // Validasi ikon jika dikirimkan
      if (icon && !ALLOWED_ICONS.includes(icon.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Ikon bidang keahlian tidak valid. Pilih dari daftar ikon yang tersedia.'
        });
      }

      const targetTitle = title ? title.trim() : existing.title;
      let targetSlug = existing.slug;

      // Jika judul berubah, buat ulang slug yang unik
      if (title && title.trim() !== existing.title) {
        targetSlug = await ServiceModel.generateUniqueSlug(targetTitle, id);
      }

      const updatedService = await ServiceModel.update(id, {
        title: targetTitle,
        slug: targetSlug,
        description: description !== undefined ? description : existing.description,
        icon: icon !== undefined ? (icon ? icon.trim() : null) : existing.icon
      });

      return res.status(200).json({
        success: true,
        message: `Bidang keahlian '${updatedService.title}' berhasil diperbarui.`,
        data: updatedService
      });
    } catch (error) {
      next(error);
    }
  }

  // Hapus bidang keahlian permanen (khusus administrator)
  static async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ServiceModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Bidang keahlian tidak ditemukan.'
        });
      }

      await ServiceModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Bidang keahlian '${existing.title}' berhasil dihapus.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;

