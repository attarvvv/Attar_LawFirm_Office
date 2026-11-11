// Model Artikel & Berita (Article Model) berbasis arsitektur OOP
// Mengelola operasi basis data untuk tabel articles dengan relasi ke tabel categories dan users
const { pool } = require('../src/config/db');

class ArticleModel {
  // Fungsi pembuat slug dari teks judul
  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Buat slug unik untuk artikel guna menghindari benturan rute URL
  static async generateUniqueSlug(title, currentId = null) {
    const baseSlug = this.slugify(title);
    let candidateSlug = baseSlug || 'artikel';
    let counter = 1;

    while (true) {
      let query = 'SELECT id FROM articles WHERE slug = ?';
      const params = [candidateSlug];

      if (currentId) {
        query += ' AND id != ?';
        params.push(currentId);
      }

      const [rows] = await pool.execute(query, params);
      if (rows.length === 0) {
        return candidateSlug;
      }

      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }
  }

  // Ambil daftar artikel terbit untuk tampilan website publik dengan pagination dan filter
  static async getAllPublished({ category = null, search = '', page = 1, limit = 10 } = {}) {
    let baseWhere = ` WHERE a.status = 'published'`;
    const params = [];

    // Filter berdasarkan slug kategori
    if (category && category.trim() !== '') {
      baseWhere += ` AND c.slug = ?`;
      params.push(category.trim());
    }

    // Filter pencarian teks judul atau isi artikel
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      baseWhere += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      params.push(keyword, keyword);
    }

    // Hitung total data untuk metadata paginasi
    const countQuery = `
      SELECT COUNT(a.id) AS total
      FROM articles a
      INNER JOIN categories c ON a.category_id = c.id
      ${baseWhere}
    `;
    const [countRows] = await pool.execute(countQuery, params);
    const total = Number(countRows[0]?.total || 0);

    // Hitung offset paginasi
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    // Ambil baris data artikel terbit
    const dataQuery = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.category_id,
        a.author_id,
        a.thumbnail,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        u.nama AS author_name
      FROM articles a
      INNER JOIN categories c ON a.category_id = c.id
      INNER JOIN users u ON a.author_id = u.id
      ${baseWhere}
      ORDER BY a.published_at DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Pastikan limit dan offset bertipe integer murni
    const [rows] = await pool.query(dataQuery, [...params, parsedLimit, offset]);

    return {
      articles: rows,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    };
  }

  // Ambil satu artikel terbit berdasarkan slug (untuk halaman baca publik)
  static async getBySlugPublished(slug) {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.category_id,
        a.author_id,
        a.thumbnail,
        a.content,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        u.nama AS author_name
      FROM articles a
      INNER JOIN categories c ON a.category_id = c.id
      INNER JOIN users u ON a.author_id = u.id
      WHERE a.slug = ? AND a.status = 'published'
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Ambil seluruh artikel untuk area internal portal (draf dan terbit)
  static async getAllAdmin({ status = 'all', category = null, author = null, search = '' } = {}) {
    let query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.category_id,
        a.author_id,
        a.thumbnail,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        u.nama AS author_name,
        u.role AS author_role
      FROM articles a
      INNER JOIN categories c ON a.category_id = c.id
      INNER JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter status jika dipilih dan bukan 'all'
    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    // Filter berdasarkan ID atau slug kategori
    if (category && category !== 'all') {
      if (!isNaN(category)) {
        query += ` AND a.category_id = ?`;
        params.push(parseInt(category, 10));
      } else {
        query += ` AND c.slug = ?`;
        params.push(category);
      }
    }

    // Filter berdasarkan ID penulis
    if (author && author !== 'all') {
      query += ` AND a.author_id = ?`;
      params.push(parseInt(author, 10));
    }

    // Filter pencarian judul artikel
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      query += ` AND a.title LIKE ?`;
      params.push(keyword);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Ambil detail satu artikel secara lengkap berdasarkan ID (untuk form edit)
  static async getById(id) {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.category_id,
        a.author_id,
        a.thumbnail,
        a.content,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        u.nama AS author_name,
        u.role AS author_role
      FROM articles a
      INNER JOIN categories c ON a.category_id = c.id
      INNER JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Hitung ringkasan jumlah artikel berdasarkan status untuk filter tab
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
      FROM articles
    `;
    const [rows] = await pool.execute(query);
    const row = rows[0] || {};
    return {
      total: Number(row.total || 0),
      draft: Number(row.draft || 0),
      published: Number(row.published || 0)
    };
  }

  // Tambah artikel baru
  static async create({ title, slug, category_id, author_id, thumbnail = null, content, status = 'draft' }) {
    // Tentukan waktu terbit awal jika artikel langsung dibuat berstatus published
    const publishedAt = status === 'published' ? new Date() : null;

    const query = `
      INSERT INTO articles 
        (title, slug, category_id, author_id, thumbnail, content, status, published_at)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      title.trim(),
      slug,
      parseInt(category_id, 10),
      parseInt(author_id, 10),
      thumbnail || null,
      content,
      status,
      publishedAt
    ];

    const [result] = await pool.execute(query, params);
    return await this.getById(result.insertId);
  }

  // Perbarui artikel yang ada
  static async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const fields = [];
    const params = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title.trim());
    }
    if (data.slug !== undefined) {
      fields.push('slug = ?');
      params.push(data.slug);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      params.push(parseInt(data.category_id, 10));
    }
    if (data.thumbnail !== undefined) {
      fields.push('thumbnail = ?');
      params.push(data.thumbnail);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      params.push(data.content);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);

      // Logika published_at: Jika status beralih ke published dan published_at belum pernah terisi, isi tanggal sekarang
      // Jika pernah terbit sebelumnya lalu dijadikan draf dan diterbitkan kembali, jangan timpa tanggal awal terbitnya
      if (data.status === 'published' && !existing.published_at) {
        fields.push('published_at = CURRENT_TIMESTAMP');
      }
    }

    if (fields.length === 0) {
      return existing;
    }

    const query = `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(query, params);
    return await this.getById(id);
  }

  // Ubah status artikel (draft <-> published)
  static async updateStatus(id, newStatus) {
    const existing = await this.getById(id);
    if (!existing) return null;

    let query = 'UPDATE articles SET status = ?';
    const params = [newStatus];

    // Isi published_at hanya jika pertama kali diterbitkan
    if (newStatus === 'published' && !existing.published_at) {
      query += ', published_at = CURRENT_TIMESTAMP';
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    return await this.getById(id);
  }

  // Hapus artikel permanen
  static async delete(id) {
    const query = `DELETE FROM articles WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ArticleModel;

