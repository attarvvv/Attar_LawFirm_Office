// Middleware upload foto pengacara menggunakan multer dan pemrosesan gambar ke format WebP via sharp
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Simpan file sementara di memory buffer agar dapat diproses oleh sharp sebelum disimpan ke disk
const storage = multer.memoryStorage();

// Filter validasi tipe file gambar (hanya JPG, JPEG, PNG, dan WEBP yang diizinkan)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Format file tidak didukung. Harap unggah foto berformat JPG, PNG, atau WEBP.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Batas ukuran maksimal file foto 2MB (2 * 1024 * 1024 byte)
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
}).single('photo');

// Middleware pembungkus untuk menangani error upload dari multer dengan pesan bahasa Indonesia
function handlePhotoUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran file foto melebihi batas maksimal 2MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Gagal mengunggah foto: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Terjadi kesalahan saat validasi file foto.'
      });
    }
    next();
  });
}

// Fungsi konversi buffer gambar menjadi file WebP terkompresi
// Kualitas diatur ~80 dan lebar maksimal dibatasi 800px agar ukuran file tetap ringan tanpa mengorbankan ketajaman foto profil
async function processAndSavePhoto(buffer) {
  const uploadDir = path.join(__dirname, '../uploads/lawyers');

  // Pastikan folder penyimpanan tersedia
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate nama file unik berbasis timestamp dan angka acak
  const filename = `lawyer-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const fullPath = path.join(uploadDir, filename);

  // Kompresi ke format WebP dengan batas lebar 800px
  await sharp(buffer)
    .resize(800, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toFile(fullPath);

  // Kembalikan path relatif untuk disimpan ke kolom basis data
  return `/uploads/lawyers/${filename}`;
}

// Fungsi pembantu untuk menghapus file foto lama dari disk saat foto diperbarui atau pengacara dihapus
function deletePhotoFile(relativePath) {
  if (!relativePath) return;
  try {
    // Normalisasi path relatif ke path absolut sistem file
    const cleanRelative = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const fullPath = path.join(__dirname, '..', cleanRelative);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    // Tangani kegagalan penghapusan file lama agar tidak membatalkan respons utama
    console.warn(`[Peringatan] Gagal menghapus file foto lama (${relativePath}):`, err.message);
  }
}

module.exports = {
  handlePhotoUpload,
  processAndSavePhoto,
  deletePhotoFile
};

