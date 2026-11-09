const { pool } = require('../src/config/db');

/**
 * Model Pengguna (User Model)
 * Mengelola query ke tabel `users` pada basis data `lawfirm_db`.
 *
 * Pemetaan Kolom:
 * - id: INT AUTO_INCREMENT (Primary Key)
 * - nama: VARCHAR(100) -> Nama lengkap pengguna
 * - email: VARCHAR(100) -> Alamat email (unik)
 * - pass: VARCHAR(255) -> Hash kata sandi bcrypt
 * - role: ENUM('admin', 'lawyer', 'staff') -> Peran internal
 */
class UserModel {
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
}

module.exports = UserModel;
