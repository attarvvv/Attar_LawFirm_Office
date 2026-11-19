const { pool } = require('../src/config/db');

// Model Pengguna (User Model)
// Mengelola query ke tabel users pada basis data lawfirm_db
class UserModel {
  // Ambil semua pengguna dengan filter opsional (pencarian nama/email dan filter role)
  static async findAll({ search, role } = {}) {
    let query = `
      SELECT id, nama, email, role 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    // Filter berdasarkan peran pengguna jika dipilih
    if (role && ['admin', 'lawyer', 'staff'].includes(role)) {
      query += ` AND role = ?`;
      params.push(role);
    }

    // Filter pencarian berdasarkan nama atau email
    if (search && search.trim()) {
      query += ` AND (nama LIKE ? OR email LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ` ORDER BY id ASC`;
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Cari pengguna berdasarkan email (termasuk kolom 'pass' untuk verifikasi login)
  static async findByEmail(email) {
    const query = `
      SELECT id, nama, email, pass, role 
      FROM users 
      WHERE email = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [email.toLowerCase().trim()]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Cari pengguna berdasarkan ID (tanpa menyertakan 'pass' demi keamanan)
  static async findById(id) {
    const query = `
      SELECT id, nama, email, role 
      FROM users 
      WHERE id = ? 
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Tambah pengguna baru ke tabel `users` (default peran: 'staff')
  static async create({ nama, email, hashedPassword, role = 'staff' }) {
    const query = `
      INSERT INTO users (nama, email, pass, role) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      nama.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      role
    ]);

    return {
      id: result.insertId,
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      role
    };
  }

  // Perbarui data pengguna
  static async update(id, { nama, email, hashedPassword, role }) {
    const updates = [];
    const params = [];

    if (nama !== undefined) {
      updates.push('nama = ?');
      params.push(nama.trim());
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email.toLowerCase().trim());
    }
    if (hashedPassword) {
      updates.push('pass = ?');
      params.push(hashedPassword);
    }
    if (role !== undefined && ['admin', 'lawyer', 'staff'].includes(role)) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) return await this.findById(id);

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, params);

    return await this.findById(id);
  }

  // Hapus pengguna dari database
  static async delete(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Hitung jumlah administrator tersisa
  static async countAdmins() {
    const query = `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
    const [rows] = await pool.execute(query);
    return rows[0]?.count || 0;
  }

  // Cek relasi data artikel dan profil pengacara sebelum penghapusan
  static async checkDependencies(id) {
    const [articles] = await pool.execute('SELECT COUNT(*) as count FROM articles WHERE author_id = ?', [id]);
    const [lawyers] = await pool.execute('SELECT COUNT(*) as count FROM lawyers WHERE user_id = ?', [id]);
    return {
      articlesCount: articles[0]?.count || 0,
      lawyersCount: lawyers[0]?.count || 0
    };
  }
}

module.exports = UserModel;
