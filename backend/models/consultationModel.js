// Model Konsultasi Masuk (Consultation Model)
// Mengelola query database untuk tabel consultations yang berelasi dengan tabel services
const { pool } = require('../src/config/db');

class ConsultationModel {
  // Tambah permohonan konsultasi baru (digunakan oleh form publik)
  static async create({ client_name, client_email, client_phone = null, service_id = null, subject, message }) {
    const query = `
      INSERT INTO consultations (client_name, client_email, client_phone, service_id, subject, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'unread')
    `;
    const params = [
      client_name,
      client_email,
      client_phone || null,
      service_id ? parseInt(service_id, 10) : null,
      subject,
      message
    ];

    const [result] = await pool.execute(query, params);
    return await this.findById(result.insertId);
  }

  // Ambil daftar seluruh konsultasi dengan filter status dan pencarian
  static async findAll({ status, search } = {}) {
    let query = `
      SELECT 
        c.id,
        c.client_name,
        c.client_email,
        c.client_phone,
        c.service_id,
        c.subject,
        c.message,
        c.status,
        c.created_at,
        s.title AS service_title
      FROM consultations c
      LEFT JOIN services s ON c.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filter status jika dipilih dan bukan 'all'
    if (status && status !== 'all') {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    // Filter pencarian teks berdasarkan nama, email, telepon, atau subjek pesan
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      query += ` AND (c.client_name LIKE ? OR c.client_email LIKE ? OR c.client_phone LIKE ? OR c.subject LIKE ?)`;
      params.push(keyword, keyword, keyword, keyword);
    }

    // Urutkan dari konsultasi yang paling baru masuk
    query += ` ORDER BY c.created_at DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Ambil detail satu konsultasi berdasarkan ID
  static async findById(id) {
    const query = `
      SELECT 
        c.id,
        c.client_name,
        c.client_email,
        c.client_phone,
        c.service_id,
        c.subject,
        c.message,
        c.status,
        c.created_at,
        s.title AS service_title
      FROM consultations c
      LEFT JOIN services s ON c.service_id = s.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Perbarui status konsultasi (unread, read, replied, archived)
  static async updateStatus(id, status) {
    const query = `UPDATE consultations SET status = ? WHERE id = ?`;
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Hitung jumlah konsultasi berdasarkan status untuk badge filter tab
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) AS unread,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS \`read\`,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) AS replied,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archived
      FROM consultations
    `;
    const [rows] = await pool.execute(query);
    const row = rows[0] || {};
    return {
      total: Number(row.total || 0),
      unread: Number(row.unread || 0),
      read: Number(row.read || 0),
      replied: Number(row.replied || 0),
      archived: Number(row.archived || 0)
    };
  }
}

module.exports = ConsultationModel;

