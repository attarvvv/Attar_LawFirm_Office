// Middleware penanganan error terpusat (tidak membocorkan stack trace di mode produksi)
function errorHandler(err, req, res, next) {
  console.error('[Error Aplikasi]:', err);

  // Penanganan error duplikasi email di MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Data dengan informasi ini sudah terdaftar (email sudah digunakan).'
    });
  }

  // Penanganan format JSON body tidak valid
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Format payload JSON tidak valid.'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Middleware penanganan endpoint 404 (tidak ditemukan)
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
