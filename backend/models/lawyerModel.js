// Model Pengacara (Lawyer Model) berbasis arsitektur OOP
// Mengelola seluruh operasi basis data pada tabel lawyers di basis data lawfirm_db
const { pool } = require('../src/config/db');

class LawyerModel {
  // Ambil seluruh pengacara untuk area internal portal dengan filter pencarian dan status
  static async getAll({ search, status } = {}) {
    let query = `
      SELECT 
        id,
        user_id,
        full_name,
        title,
        photo,
        bio,
        specialization,
        email,
        phone,
        is_active,
        created_at,
        updated_at
      FROM lawyers
      WHERE 1=1
    `;
    const params = [];

    // Filter status aktif/nonaktif
    if (status === 'active') {
      query += ` AND is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND is_active = 0`;
    }

    // Filter pencarian berdasarkan nama, gelar/jabatan, atau spesialisasi hukum
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      query += ` AND (full_name LIKE ? OR title LIKE ? OR specialization LIKE ?)`;
      params.push(keyword, keyword, keyword);
    }

    query += ` ORDER BY id ASC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Ambil daftar pengacara publik (hanya pengacara aktif dan tanpa detail kontak internal)
  static async getPublicList() {
    const query = `
      SELECT 
        id,
        full_name,
        title,
        photo,
        bio,
        specialization
      FROM lawyers
      WHERE is_active = 1
      ORDER BY id ASC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Ambil data satu pengacara secara lengkap berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT 
        id,
        user_id,
        full_name,
        title,
        photo,
        bio,
        specialization,
        email,
        phone,
        is_active,
        created_at,
        updated_at
      FROM lawyers
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Tambahkan data pengacara baru ke tabel lawyers
  static async create({ user_id = null, full_name, title, photo = null, bio = null, specialization = null, email = null, phone = null, is_active = 1 }) {
    const query = `
      INSERT INTO lawyers 
        (user_id, full_name, title, photo, bio, specialization, email, phone, is_active)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      user_id ? parseInt(user_id, 10) : null,
      full_name.trim(),
      title.trim(),
      photo || null,
      bio ? bio.trim() : null,
      specialization ? specialization.trim() : null,
      email ? email.trim().toLowerCase() : null,
      phone ? phone.trim() : null,
      is_active === false || is_active === '0' || is_active === 0 ? 0 : 1
    ];

    const [result] = await pool.execute(query, params);
    return await this.getById(result.insertId);
  }

  // Perbarui data pengacara yang sudah ada berdasarkan ID
  static async update(id, data) {
    const fields = [];
    const params = [];

    if (data.full_name !== undefined) {
      fields.push('full_name = ?');
      params.push(data.full_name.trim());
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      params.push(data.title.trim());
    }
    // Jika ada foto baru yang dikirimkan, perbarui kolom photo
    if (data.photo !== undefined) {
      fields.push('photo = ?');
      params.push(data.photo);
    }
    if (data.bio !== undefined) {
      fields.push('bio = ?');
      params.push(data.bio ? data.bio.trim() : null);
    }
    if (data.specialization !== undefined) {
      fields.push('specialization = ?');
      params.push(data.specialization ? data.specialization.trim() : null);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email ? data.email.trim().toLowerCase() : null);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      params.push(data.phone ? data.phone.trim() : null);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      params.push(data.is_active === false || data.is_active === '0' || data.is_active === 0 ? 0 : 1);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    const query = `UPDATE lawyers SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.execute(query, params);
    return await this.getById(id);
  }

  // Balik status keaktifan pengacara (aktif <-> nonaktif)
  static async toggleActive(id) {
    const query = `UPDATE lawyers SET is_active = NOT is_active WHERE id = ?`;
    await pool.execute(query, [id]);
    return await this.getById(id);
  }

  // Hapus data pengacara permanen dari tabel
  static async delete(id) {
    const query = `DELETE FROM lawyers WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = LawyerModel;

