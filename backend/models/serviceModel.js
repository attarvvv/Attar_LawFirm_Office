// Model Bidang Keahlian (Service Model) berbasis arsitektur OOP
// Mengelola data layanan dan spesialisasi hukum pada tabel services di basis data lawfirm_db
const { pool } = require('../src/config/db');

class ServiceModel {
  // Fungsi pembuat format slug URL dari teks judul
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

  // Buat slug unik otomatis dengan sufiks angka jika terdapat judul yang serupa
  static async generateUniqueSlug(title, currentId = null) {
    const baseSlug = this.slugify(title);
    let candidateSlug = baseSlug || 'layanan';
    let counter = 1;

    while (true) {
      let query = 'SELECT id FROM services WHERE slug = ?';
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

  // Ambil seluruh bidang keahlian untuk halaman publik maupun internal portal
  static async getAll() {
    const query = `
      SELECT id, title, slug, description, icon, created_at 
      FROM services 
      ORDER BY id ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Ambil detail satu bidang keahlian berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT id, title, slug, description, icon, created_at 
      FROM services 
      WHERE id = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Ambil detail satu bidang keahlian berdasarkan slug
  static async getBySlug(slug) {
    const query = `
      SELECT id, title, slug, description, icon, created_at 
      FROM services 
      WHERE slug = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Tambah bidang keahlian baru ke tabel services
  static async create({ title, slug, description = null, icon = null }) {
    const query = `
      INSERT INTO services (title, slug, description, icon) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      title.trim(),
      slug,
      description ? description.trim() : null,
      icon ? icon.trim() : null
    ]);
    return await this.getById(result.insertId);
  }

  // Perbarui bidang keahlian yang sudah ada
  static async update(id, { title, slug, description = null, icon = null }) {
    const query = `
      UPDATE services 
      SET title = ?, slug = ?, description = ?, icon = ? 
      WHERE id = ?
    `;
    await pool.execute(query, [
      title.trim(),
      slug,
      description ? description.trim() : null,
      icon ? icon.trim() : null,
      id
    ]);
    return await this.getById(id);
  }

  // Hapus bidang keahlian dari tabel services
  static async delete(id) {
    const query = `DELETE FROM services WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ServiceModel;

