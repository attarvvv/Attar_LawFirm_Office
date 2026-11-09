const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Pool koneksi MySQL untuk database 'lawfirm_db'
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lawfirm_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Cek koneksi ke database saat server mulai berjalan
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Berhasil terhubung ke MySQL (${process.env.DB_NAME || 'lawfirm_db'})`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Error] Gagal terhubung ke MySQL: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
