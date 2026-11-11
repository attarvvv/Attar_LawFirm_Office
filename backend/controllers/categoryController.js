// Controller Kategori Artikel (Category Controller) berbasis arsitektur OOP
// Mengelola rute publik dan administrasi kategori artikel
const CategoryModel = require('../models/categoryModel');

class CategoryController {
  // Ambil seluruh kategori (dapat diakses publik dan seluruh pengguna internal)
  static async index(req, res, next) {
    try {
      const categories = await CategoryModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Daftar kategori berhasil dimuat.',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil detail satu kategori berdasarkan ID
  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.getById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan.'
        });
      }

      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // Tambah kategori baru (khusus peran Administrator)
  static async store(req, res, next) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori wajib diisi.'
        });
      }

      // Generate slug unik otomatis dari nama kategori
      const slug = await CategoryModel.generateUniqueSlug(name.trim());
      const newCategory = await CategoryModel.create({
        name: name.trim(),
        slug
      });

      return res.status(201).json({
        success: true,
        message: 'Kategori baru berhasil ditambahkan.',
        data: newCategory
      });
    } catch (error) {
      next(error);
    }
  }

  // Perbarui kategori yang sudah ada (khusus peran Administrator)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await CategoryModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan.'
        });
      }

      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori tidak boleh kosong.'
        });
      }

      // Buat ulang slug jika nama berubah
      const slug = await CategoryModel.generateUniqueSlug(name.trim(), id);
      const updatedCategory = await CategoryModel.update(id, {
        name: name.trim(),
        slug
      });

      return res.status(200).json({
        success: true,
        message: 'Kategori berhasil diperbarui.',
        data: updatedCategory
      });
    } catch (error) {
      next(error);
    }
  }

  // Hapus kategori permanen (khusus peran Administrator)
  // Menangani penolakan database jika kategori masih terikat dengan artikel
  static async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await CategoryModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan.'
        });
      }

      try {
        await CategoryModel.delete(id);
      } catch (dbError) {
        // Tangani error foreign key constraint (ER_ROW_IS_REFERENCED_2 / errno 1451)
        if (dbError.code === 'ER_ROW_IS_REFERENCED_2' || dbError.errno === 1451) {
          return res.status(400).json({
            success: false,
            message: 'Kategori ini tidak bisa dihapus karena masih memiliki artikel terkait. Pindahkan atau hapus artikel tersebut terlebih dahulu.'
          });
        }
        throw dbError;
      }

      return res.status(200).json({
        success: true,
        message: `Kategori '${existing.name}' berhasil dihapus.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;

