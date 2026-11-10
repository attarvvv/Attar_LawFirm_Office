// Controller Pengacara (Lawyer Controller) berbasis arsitektur OOP
// Mengelola alur request-response untuk fitur CRUD pengacara dan pemrosesan foto WebP
const LawyerModel = require('../models/lawyerModel');
const { processAndSavePhoto, deletePhotoFile } = require('../middleware/uploadMiddleware');

// Format regex standar untuk validasi alamat email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class LawyerController {
  // Ambil daftar pengacara publik (hanya yang aktif, tanpa email & telepon internal)
  static async publicIndex(req, res, next) {
    try {
      const lawyers = await LawyerModel.getPublicList();
      return res.status(200).json({
        success: true,
        message: 'Daftar pengacara publik berhasil dimuat.',
        data: lawyers
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil seluruh pengacara untuk area internal portal (aktif & nonaktif, filter & pencarian)
  static async index(req, res, next) {
    try {
      const { search, status } = req.query;
      const lawyers = await LawyerModel.getAll({ search, status });
      return res.status(200).json({
        success: true,
        message: 'Data pengacara internal berhasil dimuat.',
        data: lawyers
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil detail satu pengacara berdasarkan ID
  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const lawyer = await LawyerModel.getById(id);

      if (!lawyer) {
        return res.status(404).json({
          success: false,
          message: 'Data pengacara tidak ditemukan.'
        });
      }

      return res.status(200).json({
        success: true,
        data: lawyer
      });
    } catch (error) {
      next(error);
    }
  }

  // Tambahkan data pengacara baru (khusus peran Administrator)
  static async store(req, res, next) {
    try {
      const { full_name, title, bio, specialization, email, phone, is_active } = req.body;

      // Validasi field wajib diisi
      if (!full_name || !full_name.trim() || !title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap dan gelar/jabatan advokat wajib diisi.'
        });
      }

      // Validasi format email jika disediakan
      if (email && email.trim() !== '' && !emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Format alamat email tidak valid.'
        });
      }

      // Jika ada file foto yang diunggah, proses konversi ke WebP dan simpan ke disk
      let photoPath = null;
      if (req.file && req.file.buffer) {
        photoPath = await processAndSavePhoto(req.file.buffer);
      }

      const newLawyer = await LawyerModel.create({
        full_name,
        title,
        photo: photoPath,
        bio,
        specialization,
        email,
        phone,
        is_active: is_active === undefined ? 1 : is_active
      });

      return res.status(201).json({
        success: true,
        message: 'Data pengacara baru berhasil ditambahkan.',
        data: newLawyer
      });
    } catch (error) {
      next(error);
    }
  }

  // Perbarui data pengacara yang sudah ada (khusus peran Administrator)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await LawyerModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Data pengacara tidak ditemukan.'
        });
      }

      const { full_name, title, bio, specialization, email, phone, is_active } = req.body;

      // Validasi nama dan gelar jika diperbarui
      if (full_name !== undefined && !full_name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap advokat tidak boleh kosong.'
        });
      }
      if (title !== undefined && !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Gelar/jabatan advokat tidak boleh kosong.'
        });
      }

      // Validasi format email jika diperbarui
      if (email !== undefined && email.trim() !== '' && !emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Format alamat email tidak valid.'
        });
      }

      const updatePayload = {
        full_name,
        title,
        bio,
        specialization,
        email,
        phone,
        is_active
      };

      // Jika ada foto baru yang diunggah, simpan foto baru lalu bersihkan foto lama dari disk
      let oldPhotoToDelete = null;
      if (req.file && req.file.buffer) {
        const newPhotoPath = await processAndSavePhoto(req.file.buffer);
        updatePayload.photo = newPhotoPath;
        oldPhotoToDelete = existing.photo;
      }

      const updatedLawyer = await LawyerModel.update(id, updatePayload);

      // Hapus file foto lama setelah pembaruan database berhasil
      if (oldPhotoToDelete) {
        deletePhotoFile(oldPhotoToDelete);
      }

      return res.status(200).json({
        success: true,
        message: 'Data pengacara berhasil diperbarui.',
        data: updatedLawyer
      });
    } catch (error) {
      next(error);
    }
  }

  // Ubah status keaktifan pengacara aktif/nonaktif (khusus peran Administrator)
  static async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await LawyerModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Data pengacara tidak ditemukan.'
        });
      }

      const updated = await LawyerModel.toggleActive(id);
      const statusLabel = updated.is_active ? 'diaktifkan' : 'dinonaktifkan';

      return res.status(200).json({
        success: true,
        message: `Status pengacara ${updated.full_name} berhasil ${statusLabel}.`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // Hapus data pengacara secara permanen (khusus peran Administrator)
  // Menangani penolakan database jika pengacara masih terikat jadwal janji temu
  static async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await LawyerModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Data pengacara tidak ditemukan.'
        });
      }

      try {
        await LawyerModel.delete(id);
      } catch (dbError) {
        // Tangani kode error MySQL foreign key restriction (ER_ROW_IS_REFERENCED_2 / errno 1451)
        if (dbError.code === 'ER_ROW_IS_REFERENCED_2' || dbError.errno === 1451) {
          return res.status(400).json({
            success: false,
            message: 'Pengacara ini tidak bisa dihapus karena masih memiliki jadwal konsultasi terkait. Nonaktifkan saja statusnya jika tidak lagi aktif.'
          });
        }
        throw dbError;
      }

      // Bersihkan file foto dari disk jika ada
      if (existing.photo) {
        deletePhotoFile(existing.photo);
      }

      return res.status(200).json({
        success: true,
        message: `Data pengacara ${existing.full_name} berhasil dihapus.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LawyerController;

