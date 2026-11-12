# Attar Lawfirm Office 

Sistem aplikasi web terintegrasi untuk kantor hukum **Attar Lawfirm Office**. Repositori ini berisi sistem manajemen internal (autentikasi, dashboard admin, manajemen janji temu, konsultasi klien, dan data pengacara).

---

## Gambaran Proyek

Aplikasi ini dirancang khusus untuk operasional internal kantor hukum (**Admin**, **Pengacara/Lawyer**, dan **Staf Operasional**). Klien atau pengunjung publik tidak memiliki akun login internal — mereka berinteraksi lewat formulir konsultasi/booking publik (tanpa akun) yang datanya langsung masuk ke sistem ini untuk ditindaklanjuti oleh tim internal.

---

## Fitur yang Sudah Tersedia

### Autentikasi & Dashboard
- [x] Login & Register akun internal (role: `admin`, `lawyer`, `staff`)
- [x] Proteksi rute berbasis JWT & role
- [x] Dashboard admin dengan sidebar collapsible (desktop) & drawer (mobile)
- [x] Layout Login/Register — form di kiri, panel brand di kanan

### Janji Temu (Appointments)
- [x] Daftar janji temu dengan filter status (Menunggu, Dikonfirmasi, Selesai, Dibatalkan) & pencarian
- [x] Detail per klien: layanan, pengacara terkait, kebutuhan klien, catatan internal

### Konsultasi Masuk (Consultations Inbox)
- [x] Endpoint publik untuk menerima konsultasi dari calon klien
- [x] Status otomatis & manual (Belum Dibaca → Dibaca → Dibalas/Diarsipkan)
- [x] Pencarian & filter status

### Daftar Pengacara (Lawyers)
- [x] CRUD dengan arsitektur OOP (Model & Controller berbasis class)
- [x] Upload foto profil dengan konversi otomatis ke **WebP** (kompresi ukuran file)
- [x] Endpoint publik (hanya pengacara aktif) untuk kebutuhan halaman publik nanti
- [x] Proteksi hapus data jika pengacara masih punya janji temu terkait

### Belum Dikerjakan
Lihat bagian [Roadmap](#roadmap-selanjutnya) di bawah.

---

## Role & Hak Akses

| Fitur | Admin | Lawyer | Staff |
|---|:---:|:---:|:---:|
| Login & akses dashboard | ✅ | ✅ | ✅ |
| Lihat & kelola status Janji Temu | ✅ | ✅ | ✅ |
| Lihat & kelola status Konsultasi | ✅ | ✅ | ✅ |
| Lihat Daftar Pengacara | ✅ | ✅ | ✅ |
| Tambah / Edit / Hapus Pengacara | ✅ | ❌ | ❌ |
| Lihat Bidang Keahlian | ✅ | ✅ | ✅ |
| Tambah / Edit / Hapus Bidang Keahlian | ✅ | ❌ | ❌ |
| Buat Artikel & Berita | ✅ | ✅ | ✅ |
| Edit / Hapus Artikel Sendiri | ✅ | ✅ | ✅ |
| Kelola Kategori Artikel | ✅ | ❌ | ❌ |
| Kelola Pengguna (akun internal) | ✅ | ❌ | ❌ |

> Registrasi publik lewat `/register` secara default hanya membuat akun dengan role `staff`. Akun `admin` atau `lawyer` dibuat/diatur oleh admin melalui menu **Kelola Pengguna**.

---

## Tech Stack

**Frontend**
- React (JavaScript) + Vite
- Tailwind CSS — palet: Primary `#14342B`, Accent `#C2A878`, Background `#FAF8F3`, Text `#1C1C1C`
- Tipografi: Google Fonts **Poppins**
- Ikon: `react-icons`
- State management: React Context API (`AuthContext`)

**Backend**
- Node.js + Express.js
- Arsitektur OOP (Model/Controller berbasis class) untuk fitur-fitur modular, mis. Daftar Pengacara
- Autentikasi: JWT (`jsonwebtoken`) + hashing password `bcryptjs`
- Upload & proses gambar: `multer` (upload) + `sharp` (konversi otomatis ke WebP, resize, kompresi)
- Session handling: HttpOnly Cookie + Authorization Bearer header

**Database**
- MySQL, koneksi lewat connection pool `mysql2/promise`
- Skema `lawfirm_db` dikelola sepenuhnya di **MySQL Workbench** — tidak ada file migrasi/seed di repo ini secara sengaja, supaya database tetap satu sumber kebenaran di luar kode
- Tabel utama saat ini: `users`, `lawyers`, `services`, `lawyer_schedules`, `appointments`, `consultations`, `categories`, `articles`

---

## Desain & Konvensi Proyek

- Tidak menggunakan logo/gambar hasil generate AI — seluruh elemen visual dibangun dari CSS, tipografi, dan `react-icons`
- Komentar kode: Bahasa Indonesia, gaya semi-formal, **satu baris (`//`) saja** — tidak ada comment block/JSDoc
- Status (badge) ditampilkan sebagai teks berwarna tanpa latar pil/card, lewat komponen `StatusBadge` yang reusable

---

## Struktur Folder
attar-lawfirm-office/
├── frontend/
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── .env
├── backend/
│ ├── src/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── middleware/
│ ├── uploads/ # Hasil upload foto (diabaikan git — lihat .gitignore)
│ ├── .env
│ └── package.json
├── docs/
│ └── README.md
├── .gitignore
└── README.md


---

## Panduan Menjalankan

Pastikan service MySQL aktif (`lawfirm_db`), lalu buka dua tab terminal dari root direktori:

```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:frontend
```

> **Catatan**: Baru pertama kali clone/setup? Jalankan `npm run install:all` dari root untuk menginstal seluruh dependensi backend & frontend sekaligus.

---

## Environment Variables

**`backend/.env`**

| Variabel | Keterangan |
|---|---|
| `DB_HOST` | Host MySQL (umumnya `localhost`) |
| `DB_USER` | Username MySQL |
| `DB_PASSWORD` | Password MySQL |
| `DB_NAME` | Nama database (`lawfirm_db`) |
| `DB_PORT` | Port MySQL (default `3306`) |
| `JWT_SECRET` | Secret key untuk signing token JWT |
| `JWT_EXPIRES_IN` | Masa berlaku token (mis. `1d`) |
| `PORT` | Port server backend (mis. `5000`) |

**`frontend/.env`**

| Variabel | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | URL dasar API backend (mis. `http://localhost:5000`) |

Lihat `.env.example` di masing-masing folder untuk template lengkapnya.

---

## Upload Foto Pengacara

Setiap foto yang diunggah lewat fitur Daftar Pengacara otomatis dikonversi ke format **WebP** (kualitas ±80, lebar maksimum 800px) menggunakan `sharp`, lalu disimpan di `backend/uploads/lawyers/`. Folder ini diabaikan git agar repo tetap ringan — hanya path relatif yang disimpan di kolom `photo` pada database.

---

## Dokumentasi Lengkap & Pengujian Postman

Silakan baca file panduan lengkap di:
**[`docs/README.md`](docs/README.md)** untuk:
- Penjelasan seluruh endpoint API per fitur
- Rincian arsitektur keamanan & pertimbangan HttpOnly cookie vs localStorage
- Panduan pengujian Postman (method, URL, headers, body, kode status HTTP, skrip auto-save token)

---

## Roadmap Selanjutnya

- [x] Halaman Utama publik (profil kantor, visi-misi, bidang keahlian, pengacara, kontak)
- [ ] Halaman Layanan & Konsultasi publik beserta alur penanganan perkara
- [ ] Form Booking Konsultasi publik untuk klien (tanpa akun)
- [x] Blog / Artikel Hukum (manajemen kategori & publikasi artikel)

---

© 2026 Attar Lawfirm Office. All rights reserved.