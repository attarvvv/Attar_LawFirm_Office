// Controller Artikel & Berita (Article Controller) berbasis arsitektur OOP
// Mengelola publikasi artikel, pembatasan hak akses penulis/admin, dan pemrosesan thumbnail WebP
const ArticleModel = require('../models/articleModel');
const CategoryModel = require('../models/categoryModel');
const { processAndSaveThumbnail, deletePhotoFile } = require('../middleware/uploadMiddleware');

class ArticleController {
  // Ambil daftar artikel publik yang telah terbit (dengan filter kategori, pencarian, dan paginasi)
  static async publicIndex(req, res, next) {
    try {
      const { category, search, page, limit } = req.query;
      const result = await ArticleModel.getAllPublished({ category, search, page, limit });

      return res.status(200).json({
        success: true,
        message: 'Daftar artikel terbit berhasil dimuat.',
        data: result.articles,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil detail satu artikel terbit berdasarkan slug untuk halaman baca publik
  static async publicShow(req, res, next) {
    try {
      const { slug } = req.params;
      const article = await ArticleModel.getBySlugPublished(slug);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Artikel tidak ditemukan atau belum dipublikasikan.'
        });
      }

      return res.status(200).json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil seluruh artikel untuk area internal portal (draf dan terbit) beserta ringkasan status
  static async index(req, res, next) {
    try {
      const { status, category, author, search } = req.query;
      const articles = await ArticleModel.getAllAdmin({ status, category, author, search });
      const stats = await ArticleModel.getStats();

      return res.status(200).json({
        success: true,
        message: 'Data artikel internal berhasil dimuat.',
        stats,
        counts: stats,
        data: articles
      });
    } catch (error) {
      next(error);
    }
  }

  // Ambil detail lengkap satu artikel berdasarkan ID untuk form edit
  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const article = await ArticleModel.getById(id);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Artikel tidak ditemukan.'
        });
      }

      return res.status(200).json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  }

  // Buat artikel baru (dapat dibuat oleh peran admin, lawyer, maupun staff)
  static async store(req, res, next) {
    try {
      const { title, category_id, content, status } = req.body;

      // Validasi field wajib diisi
      if (!title || !title.trim() || !category_id || !content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Judul artikel, kategori, dan isi konten artikel wajib diisi.'
        });
      }

      // Pastikan kategori yang dipilih memang terdaftar
      const categoryExists = await CategoryModel.getById(category_id);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Kategori yang dipilih tidak valid atau tidak ditemukan.'
        });
      }

      // Validasi nilai status yang diizinkan
      const allowedStatus = ['draft', 'published'];
      const chosenStatus = status && allowedStatus.includes(status) ? status : 'draft';

      // Pastikan author_id selalu diambil dari token user yang login demi keamanan
      const authorId = req.user.id;

      // Generate slug unik otomatis dari judul artikel
      const slug = await ArticleModel.generateUniqueSlug(title.trim());

      // Proses thumbnail jika ada file gambar yang diunggah
      let thumbnailPath = null;
      if (req.file && req.file.buffer) {
        thumbnailPath = await processAndSaveThumbnail(req.file.buffer);
      }

      const newArticle = await ArticleModel.create({
        title: title.trim(),
        slug,
        category_id: parseInt(category_id, 10),
        author_id: authorId,
        thumbnail: thumbnailPath,
        content: content.trim(),
        status: chosenStatus
      });

      return res.status(201).json({
        success: true,
        message: 'Artikel baru berhasil dibuat.',
        data: newArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // Perbarui artikel (hanya dapat diedit oleh penulis aslinya atau pengguna dengan peran Administrator)
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ArticleModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Artikel tidak ditemukan.'
        });
      }

      // Pemeriksaan otorisasi: hanya penulis artikel atau admin yang boleh memperbarui
      const isAuthor = existing.author_id === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya diperbolehkan mengedit artikel buatan Anda sendiri.'
        });
      }

      const { title, category_id, content, status } = req.body;

      // Validasi kelengkapan teks jika diperbarui
      if (title !== undefined && !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Judul artikel tidak boleh kosong.'
        });
      }
      if (content !== undefined && !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Isi konten artikel tidak boleh kosong.'
        });
      }

      // Validasi keberadaan kategori jika kategori diganti
      if (category_id !== undefined) {
        const categoryExists = await CategoryModel.getById(category_id);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message: 'Kategori yang dipilih tidak valid.'
          });
        }
      }

      const updateData = {};
      if (title !== undefined) {
        updateData.title = title.trim();
        // Buat ulang slug jika judul berubah
        updateData.slug = await ArticleModel.generateUniqueSlug(title.trim(), id);
      }
      if (category_id !== undefined) {
        updateData.category_id = parseInt(category_id, 10);
      }
      if (content !== undefined) {
        updateData.content = content.trim();
      }
      if (status !== undefined) {
        const allowedStatus = ['draft', 'published'];
        if (allowedStatus.includes(status)) {
          updateData.status = status;
        }
      }

      // Jika ada file thumbnail baru yang diunggah, proses WebP lalu bersihkan file lama dari disk
      let oldThumbnailToDelete = null;
      if (req.file && req.file.buffer) {
        const newThumbnailPath = await processAndSaveThumbnail(req.file.buffer);
        updateData.thumbnail = newThumbnailPath;
        oldThumbnailToDelete = existing.thumbnail;
      }

      const updatedArticle = await ArticleModel.update(id, updateData);

      // Bersihkan file thumbnail lama jika ada penggantian
      if (oldThumbnailToDelete) {
        deletePhotoFile(oldThumbnailToDelete);
      }

      return res.status(200).json({
        success: true,
        message: 'Artikel berhasil diperbarui.',
        data: updatedArticle
      });
    } catch (error) {
      next(error);
    }
  }

  // Ubah status publikasi artikel (draft <-> published)
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ArticleModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Artikel tidak ditemukan.'
        });
      }

      // Otorisasi: hanya penulis artikel atau admin yang boleh mengubah status
      const isAuthor = existing.author_id === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda tidak berhak mengubah status artikel ini.'
        });
      }

      const { status } = req.body;
      const allowedStatus = ['draft', 'published'];
      if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status tidak valid. Pilihan: draft atau published.'
        });
      }

      const updated = await ArticleModel.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Status artikel berhasil diubah menjadi '${status}'.`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  // Hapus artikel permanen
  static async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ArticleModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Artikel tidak ditemukan.'
        });
      }

      // Otorisasi: hanya penulis artikel atau admin yang boleh menghapus
      const isAuthor = existing.author_id === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya diperbolehkan menghapus artikel buatan Anda sendiri.'
        });
      }

      // Hapus data dari tabel
      await ArticleModel.delete(id);

      // Bersihkan file thumbnail fisik dari disk jika ada
      if (existing.thumbnail) {
        deletePhotoFile(existing.thumbnail);
      }

      return res.status(200).json({
        success: true,
        message: `Artikel '${existing.title}' berhasil dihapus.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ArticleController;
