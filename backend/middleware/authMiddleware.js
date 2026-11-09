const jwt = require('jsonwebtoken');

// Middleware: Validasi token JWT dari header Authorization atau cookie HttpOnly
function verifyToken(req, res, next) {
  let token = null;

  // 1. Periksa header Authorization (Bearer <token>)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Alternatif: Periksa cookie HttpOnly jika token tidak ada di header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Jika token tidak ditemukan
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
    });
  }

  try {
    // Verifikasi validitas token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'attar_lawfirm_secret_jwt_key_2026_secure_random_token');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token telah kedaluwarsa. Silakan login kembali.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau rusak.'
    });
  }
}

// Middleware: Pembatasan akses berbasis peran pengguna (RBAC)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Pengguna belum terautentikasi.'
      });
    }

    // Periksa apakah peran pengguna diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses terlarang. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};
