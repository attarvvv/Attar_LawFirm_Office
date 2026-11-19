const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

// Controller Admin: Mengelola shell dashboard, manajemen pengguna, dan status WhatsApp

// Ambil ringkasan data shell dashboard (dapat diakses oleh admin, lawyer, dan staff)
async function getDashboardStub(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Data dashboard shell berhasil dimuat.',
    user: {
      id: req.user.id,
      nama: req.user.nama,
      role: req.user.role
    },
    system: {
      appName: 'Attar Lawfirm Office',
      version: '1.0.0 (Internal Legal Practice Portal)',
      status: 'active'
    },
    stubs: {
      appointmentsCount: 0,
      consultationsCount: 0,
      articlesCount: 0,
      lawyersCount: 0
    }
  });
}

// Endpoint pengujian khusus peran admin (kompatibilitas backward)
async function getManageUsersStub(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Akses administrator terverifikasi. Modul kelola pengguna aktif.',
    adminActionAllowed: true,
    currentUser: req.user
  });
}

// Ambil daftar seluruh pengguna (khusus peran admin)
async function getAllUsers(req, res, next) {
  try {
    const { search, role } = req.query;
    const users = await UserModel.findAll({ search, role });

    return res.status(200).json({
      success: true,
      message: 'Daftar pengguna berhasil dimuat.',
      total: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

// Ambil detail satu pengguna berdasarkan ID (khusus peran admin)
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

// Tambah pengguna internal baru (admin, lawyer, atau staff)
async function createUser(req, res, next) {
  try {
    const nama = req.body.nama || req.body.name;
    const email = req.body.email;
    const password = req.body.pass || req.body.password;
    const role = req.body.role || 'staff';

    // Validasi field wajib
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan kata sandi wajib diisi.'
      });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid.'
      });
    }

    // Validasi panjang kata sandi
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal harus 6 karakter.'
      });
    }

    // Validasi peran yang diizinkan
    if (!['admin', 'lawyer', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Peran pengguna tidak valid. Pilihan: admin, lawyer, staff.'
      });
    }

    // Cek duplikasi email
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar pada pengguna lain.'
      });
    }

    // Hash kata sandi
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserModel.create({
      nama,
      email,
      hashedPassword,
      role
    });

    return res.status(201).json({
      success: true,
      message: `Pengguna baru berhasil ditambahkan sebagai ${role}.`,
      data: newUser
    });
  } catch (error) {
    next(error);
  }
}

// Perbarui data pengguna yang ada (khusus peran admin)
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { nama, email, role, password, pass } = req.body;

    const existing = await UserModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // Validasi email jika diubah
    if (email && email.toLowerCase().trim() !== existing.email.toLowerCase().trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid.'
        });
      }

      const duplicate = await UserModel.findByEmail(email);
      if (duplicate && duplicate.id !== Number(id)) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah digunakan oleh pengguna lain.'
        });
      }
    }

    // Pencegahan penghilangan peran admin terakhir jika peran diubah
    if (role && role !== 'admin' && existing.role === 'admin') {
      const adminCount = await UserModel.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Peran tidak dapat diubah karena ini adalah satu-satunya administrator tersisa.'
        });
      }
    }

    // Siapkan hash kata sandi baru jika dikirimkan
    let hashedPassword = undefined;
    const newPassword = password || pass;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi baru minimal harus 6 karakter.'
        });
      }
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
      hashedPassword = await bcrypt.hash(newPassword.trim(), saltRounds);
    }

    const updatedUser = await UserModel.update(id, {
      nama,
      email,
      role,
      hashedPassword
    });

    return res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Hapus pengguna (khusus peran admin dengan proteksi keamanan)
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    // 1. Cegah admin menghapus dirinya sendiri saat sedang aktif masuk
    if (targetId === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk.'
      });
    }

    const existing = await UserModel.findById(targetId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    // 2. Cegah penghapusan administrator terakhir
    if (existing.role === 'admin') {
      const adminCount = await UserModel.countAdmins();
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus administrator terakhir dalam sistem.'
        });
      }
    }

    // 3. Cek keterkaitan relasi database (artikel & profil pengacara)
    const dependencies = await UserModel.checkDependencies(targetId);
    if (dependencies.articlesCount > 0 || dependencies.lawyersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Pengguna tidak dapat dihapus karena masih terkait dengan ${dependencies.articlesCount} artikel atau profil pengacara aktif.`
      });
    }

    await UserModel.delete(targetId);

    return res.status(200).json({
      success: true,
      message: `Pengguna "${existing.nama}" berhasil dihapus.`
    });
  } catch (error) {
    next(error);
  }
}

// Ambil status koneksi WhatsApp bot saat ini beserta QR code aktif
async function getWhatsappStatus(req, res) {
  const WhatsappService = require('../services/whatsappService');
  return res.status(200).json({
    success: true,
    data: WhatsappService.getStatus()
  });
}

// Reset sesi WhatsApp dan minta pembuatan QR code baru
async function resetWhatsappSession(req, res) {
  const WhatsappService = require('../services/whatsappService');
  const status = await WhatsappService.resetSession();
  return res.status(200).json({
    success: true,
    message: 'Sesi WhatsApp berhasil direset. Silakan scan QR code baru.',
    data: status
  });
}

module.exports = {
  getDashboardStub,
  getManageUsersStub,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getWhatsappStatus,
  resetWhatsappSession
};
