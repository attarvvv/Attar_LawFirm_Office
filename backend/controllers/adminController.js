// Controller Admin: Mengelola shell dashboard dan endpoint pengujian hak akses

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
      version: '1.0.0 (Step 1 - Sistem Autentikasi)',
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

// Endpoint pengujian khusus peran admin (staff atau lawyer akan ditolak dengan 403 Forbidden)
async function getManageUsersStub(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Akses administrator terverifikasi. Modul kelola pengguna (Step lanjutan).',
    adminActionAllowed: true,
    currentUser: req.user
  });
}

module.exports = {
  getDashboardStub,
  getManageUsersStub
};
