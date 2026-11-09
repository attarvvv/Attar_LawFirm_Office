const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');

const app = express();

// Konfigurasi CORS untuk frontend dan kredensial (cookie/token)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman atau curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Akses CORS ditolak oleh kebijakan server'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parser untuk body JSON, urlencoded, dan cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Endpoint cek kesehatan server (health check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Attar Lawfirm Office aktif.',
    timestamp: new Date().toISOString()
  });
});

// Daftarkan route modular
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// Tangani route 404 (tidak ditemukan)
app.use(notFoundHandler);

// Handler error terpusat
app.use(errorHandler);

module.exports = app;
