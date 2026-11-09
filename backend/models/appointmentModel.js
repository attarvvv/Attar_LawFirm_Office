const { pool } = require('../src/config/db');

/**
 * Model Janji Temu (Appointment Model)
 * Mengelola query ke tabel `appointments` dengan relasi ke `lawyers` dan `services`.
 */
class AppointmentModel {
  /**
   * Ambil daftar janji temu dengan filter status dan pencarian kata kunci.
   */
  static async findAll({ status, search } = {}) {
    let query = `
      SELECT 
        a.id,
        a.booking_code,
        a.client_name,
        a.client_email,
        a.client_phone,
        a.lawyer_id,
        a.service_id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
        a.appointment_time,
        a.notes,
        a.status,
        a.admin_notes,
        a.created_at,
        a.updated_at,
        l.full_name AS lawyer_name,
        l.title AS lawyer_title,
        l.specialization AS lawyer_specialization,
        s.title AS service_title
      FROM appointments a
      LEFT JOIN lawyers l ON a.lawyer_id = l.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Filter status jika dipilih
    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    // Filter pencarian teks (nama klien, email, telepon, atau kode booking)
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      query += ` AND (a.client_name LIKE ? OR a.client_email LIKE ? OR a.booking_code LIKE ? OR a.client_phone LIKE ?)`;
      params.push(keyword, keyword, keyword, keyword);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Ambil detail satu janji temu berdasarkan ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        a.id,
        a.booking_code,
        a.client_name,
        a.client_email,
        a.client_phone,
        a.lawyer_id,
        a.service_id,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
        a.appointment_time,
        a.notes,
        a.status,
        a.admin_notes,
        a.created_at,
        a.updated_at,
        l.full_name AS lawyer_name,
        l.title AS lawyer_title,
        l.specialization AS lawyer_specialization,
        s.title AS service_title
      FROM appointments a
      LEFT JOIN lawyers l ON a.lawyer_id = l.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Perbarui status dan catatan admin untuk janji temu
   */
  static async updateStatus(id, { status, admin_notes }) {
    let query = `UPDATE appointments SET status = ?`;
    const params = [status];

    if (admin_notes !== undefined) {
      query += `, admin_notes = ?`;
      params.push(admin_notes);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  /**
   * Hitung ringkasan jumlah janji temu berdasarkan status
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM appointments
    `;
    const [rows] = await pool.execute(query);
    const row = rows[0] || {};
    return {
      total: Number(row.total || 0),
      pending: Number(row.pending || 0),
      confirmed: Number(row.confirmed || 0),
      completed: Number(row.completed || 0),
      cancelled: Number(row.cancelled || 0)
    };
  }
}

module.exports = AppointmentModel;

