// Model Kategori Artikel (Category Model) berbasis arsitektur OOP
// Mengelola data kategori pada tabel categories di basis data lawfirm_db
const { pool } = require('../src/config/db');

class CategoryModel {
  // Fungsi pembuat slug dari nama teks
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

  // Buat slug unik dengan menambahkan angka jika terjadi duplikasi nama
  static async generateUniqueSlug(name, currentId = null) {
    const baseSlug = this.slugify(name);
    let candidateSlug = baseSlug || 'kategori';
    let counter = 1;

    while (true) {
      let query = 'SELECT id FROM categories WHERE slug = ?';
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

  // Ambil seluruh kategori dengan jumlah artikel terkait
  static async getAll() {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.created_at,
        COUNT(a.id) AS articles_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      GROUP BY c.id, c.name, c.slug, c.created_at
      ORDER BY c.name ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Ambil detail satu kategori berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.created_at,
        COUNT(a.id) AS articles_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.slug, c.created_at
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Ambil satu kategori berdasarkan slug
  static async getBySlug(slug) {
    const query = `
      SELECT id, name, slug, created_at
      FROM categories
      WHERE slug = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Tambah kategori baru
  static async create({ name, slug }) {
    const query = `INSERT INTO categories (name, slug) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [name.trim(), slug]);
    return await this.getById(result.insertId);
  }

  // Perbarui nama atau slug kategori
  static async update(id, { name, slug }) {
    const query = `UPDATE categories SET name = ?, slug = ? WHERE id = ?`;
    await pool.execute(query, [name.trim(), slug, id]);
    return await this.getById(id);
  }

  // Hapus kategori dari database
  static async delete(id) {
    const query = `DELETE FROM categories WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;

