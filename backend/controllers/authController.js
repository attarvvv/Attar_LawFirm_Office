const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Helper: Buat token JWT baru dengan masa berlaku tertentu
function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'attar_lawfirm_secret_jwt_key_2026_secure_random_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// Helper: Pasang cookie HttpOnly pada response untuk keamanan sesi browser (anti-XSS)
function setAuthCookie(res, token) {
  const cookieDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 1;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieDays * 24 * 60 * 60 * 1000
  };

  res.cookie('token', token, cookieOptions);
}

// Controller: Registrasi pengguna staf baru
// - Registrasi publik hanya diizinkan untuk peran 'staff'.
// - Kolom kata sandi di-hash menggunakan bcrypt ke kolom `pass`.
// - Kolom `pass` tidak pernah dikembalikan pada response JSON.
async function register(req, res, next) {
  try {
    // Terima nama dan password baik dalam format bahasa Indonesia maupun Inggris
    const nama = req.body.nama || req.body.name;
    const email = req.body.email;
    const password = req.body.pass || req.body.password;
    const requestedRole = req.body.role;

    // 1. Validasi field wajib
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.'
      });
    }

    // 2. Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid.'
      });
    }

    // 3. Validasi panjang kata sandi
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal harus 6 karakter.'
      });
    }

    // 4. Pengamanan eskalasi peran: Cegah pembuatan akun admin/lawyer lewat form publik
    if (requestedRole && requestedRole !== 'staff') {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran publik hanya diizinkan untuk peran "staff". Peran admin atau lawyer harus ditugaskan secara internal oleh Administrator.'
      });
    }

    const assignedRole = 'staff';

    // 5. Cek apakah email sudah terdaftar
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    // 6. Hash kata sandi dengan bcrypt
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Simpan pengguna baru ke database
    const newUser = await UserModel.create({
      nama,
      email,
      hashedPassword,
      role: assignedRole
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Akun Anda telah dibuat sebagai staff.',
      user: {
        id: newUser.id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Controller: Autentikasi dan login pengguna
// - Verifikasi email dan kecocokan hash password bcrypt pada kolom `pass`.
// - Pesan error dibuat generik untuk mencegah enumeration attack.
// - Menghasilkan token JWT dan menetapkan HttpOnly cookie.
async function login(req, res, next) {
  try {
    const email = req.body.email;
    const password = req.body.pass || req.body.password;

    // 1. Validasi kelengkapan input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.'
      });
    }

    // 2. Ambil data pengguna berdasarkan email
    const user = await UserModel.findByEmail(email);

    // 3. Verifikasi pengguna dan kata sandi
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak valid.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.pass);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak valid.'
      });
    }

    // 4. Buat payload dan tanda tangani token JWT
    const tokenPayload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    };
    const token = generateToken(tokenPayload);

    // 5. Pasang cookie HttpOnly
    setAuthCookie(res, token);

    // 6. Kirim respon sukses beserta data profil pengguna (tanpa kata sandi)
    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: tokenPayload
    });
  } catch (error) {
    next(error);
  }
}

// Controller: Ambil profil akun pengguna saat ini (Me)
async function getMe(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Controller: Logout pengguna dan hapus cookie sesi
async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return res.status(200).json({
    success: true,
    message: 'Logout berhasil. Sesi telah diakhiri.'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
