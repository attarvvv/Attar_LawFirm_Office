# Dokumentasi Teknis & Panduan Pengujian API - Attar Lawfirm Office (Step 1)

Dokumentasi ini mencakup instruksi instalasi, konfigurasi basis data MySQL (`lawfirm_db`), cara menjalankan backend dan frontend, serta panduan pengujian lengkap menggunakan Postman.

---

## 1. Ikhtisar & Arsitektur Step 1

Step 1 membangun fondasi autentikasi dan otorisasi internal untuk kantor hukum **Attar Lawfirm Office**:
* **Backend**: Node.js + Express.js dengan arsitektur modular (`routes`, `controllers`, `models`, `middleware`).
* **Frontend**: React + Tailwind CSS + `react-icons` dengan font Poppins dan palet warna korporat kantor hukum (`#14342B`, `#C2A878`, `#FAF8F3`, `#1C1C1C`).
* **Basis Data**: MySQL terhubung ke skema `lawfirm_db` menggunakan connection pool `mysql2/promise`.
* **Keamanan**: Password di-hash menggunakan `bcryptjs`, autentikasi berbasis stateless JWT (JSON Web Token), dan HttpOnly Cookie.

---

## 2. Struktur Direktori Proyek

```
attar-lawfirm-office/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # API client (fetch) dengan credentials & Bearer token
│   │   ├── components/      # BrandLogo, Navbar, Sidebar, ProtectedRoute, AdminLayout
│   │   ├── context/         # AuthContext (state user, login, register, logout)
│   │   ├── i18n/            # Kamus terjemahan (Default: Bahasa Indonesia)
│   │   ├── pages/           # Login, Register, Dashboard (Admin Shell)
│   │   ├── App.jsx          # Routing & guards
│   │   ├── main.jsx         # React DOM entry
│   │   └── index.css        # Tailwind directives & tema warna
│   ├── index.html           # Google Fonts (Poppins) & root
│   ├── tailwind.config.js   # Konfigurasi warna (#14342B, #C2A878, dll.)
│   ├── vite.config.js       # Vite build config
│   ├── package.json
│   ├── .env                 # VITE_API_BASE_URL
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (MySQL connection pool mysql2/promise)
│   │   ├── app.js           # Konfigurasi Express, CORS, cookie-parser, routing
│   │   └── server.js        # Server listener & database health check
│   ├── routes/
│   │   ├── authRoutes.js    # /register, /login, /me, /logout
│   │   └── adminRoutes.js   # /dashboard-stub, /manage-users-stub
│   ├── controllers/
│   │   ├── authController.js   # Logika login, registrasi, me, logout
│   │   └── adminController.js  # Shell dashboard & stub RBAC admin
│   ├── models/
│   │   └── userModel.js     # Query langsung ke tabel `users` (nama, pass, role)
│   ├── middleware/
│   │   ├── authMiddleware.js # verifyToken & requireRole RBAC
│   │   └── errorHandler.js   # Centralized error handler
│   ├── package.json
│   ├── .env                 # Konfigurasi MySQL, JWT, Port
│   └── .env.example
├── docs/
│   └── README.md            # Panduan teknis & pengujian Postman (file ini)
├── .gitignore
└── README.md
```

---

## 3. Penjelasan Konfigurasi Environment (`.env`)

### Backend: `backend/.env`
| Variabel | Deskripsi | Nilai Default |
|---|---|---|
| `PORT` | Port server Express | `5000` |
| `NODE_ENV` | Mode lingkungan (`development` / `production`) | `development` |
| `FRONTEND_URL` | Asal frontend yang diizinkan CORS | `http://localhost:5173` |
| `DB_HOST` | Host MySQL Server | `127.0.0.1` |
| `DB_PORT` | Port MySQL Server | `3306` |
| `DB_USER` | Username MySQL | `root` |
| `DB_PASSWORD`| Kata sandi MySQL | *(kosong untuk default Laragon)* |
| `DB_NAME` | Nama database yang sudah ada | `lawfirm_db` |
| `JWT_SECRET` | Kunci enkripsi tanda tangan JWT | `attar_lawfirm_secret_jwt_key_2026_secure_random_token` |
| `JWT_EXPIRES_IN` | Durasi masa berlaku token | `1d` |
| `COOKIE_EXPIRES_DAYS` | Masa berlaku HttpOnly cookie (hari) | `1` |
| `BCRYPT_SALT_ROUNDS` | Jumlah putaran salt hashing password | `10` |

### Frontend: `frontend/.env`
| Variabel | Deskripsi | Nilai Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL basis API backend Express | `http://localhost:5000/api` |

---

## 4. Cara Menjalankan Aplikasi

Pastikan service MySQL aktif di Laragon/Workbench (`lawfirm_db` siap).

### Opsi A: Jalankan langsung dari Root (Rekomendasi)
```bash
# Terminal 1 - Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev:frontend
```

### Opsi B: Jalankan per Folder
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

## 5. Keputusan Keamanan & Tradeoff Token

### Mengapa HttpOnly Cookie + Header Bearer didukung sekaligus?
1. **HttpOnly Cookie (Untuk Browser Web)**:
   * **Kelebihan**: Kebal terhadap serangan XSS (*Cross-Site Scripting*), karena kode JavaScript jahat yang terinjeksi di browser klien tidak dapat membaca dokumen cookie `document.cookie`.
   * **Kelemahan**: Memerlukan mitigasi CSRF (diatasi dengan atribut `SameSite: 'lax'` dan validasi asal permintaan CORS).
2. **Authorization Header `Bearer <token>` (Untuk Postman / Mobile / Eksternal)**:
   * Memudahkan pengujian endpoint RESTful tanpa ketergantungan otomatisasi browser cookie.
3. **Implementasi Kami**:
   * Endpoint login backend menetapkan cookie `HttpOnly` **dan** mengembalikan token JWT di body JSON.
   * Middleware `verifyToken` memeriksa header `Authorization: Bearer <token>` terlebih dahulu; jika tidak tersedia, secara otomatis membaca cookie `token`.

---

## 6. Panduan Lengkap Pengujian Postman

### Pengaturan Environment di Postman
Untuk mempercepat pengujian, buat **Postman Environment** baru bernama `Attar Lawfirm Dev`:
1. Tambahkan variabel:
   * `baseUrl`: `http://localhost:5000/api`
   * `token`: *(kosongkan terlebih dahulu)*
2. Pada tab **Tests** di request **POST /api/auth/login**, tempelkan skrip otomatis berikut agar Postman otomatis menyimpan token:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
        console.log("Token JWT berhasil disimpan ke environment:", jsonData.token);
    }
}
```

---

### Skenario 1: POST /api/auth/register (Pendaftaran Pengguna)

#### Kasus 1.1: Berhasil Mendaftar (201 Created)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "nama": "Ahmad Fauzi, S.H.",
  "email": "ahmad.fauzi@attarlaw.id",
  "pass": "Rahasia123!"
}
```
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Registrasi berhasil. Akun Anda telah dibuat sebagai staff.",
  "user": {
    "id": 1,
    "nama": "Ahmad Fauzi, S.H.",
    "email": "ahmad.fauzi@attarlaw.id",
    "role": "staff"
  }
}
```
* **Verifikasi Keamanan**: Perhatikan bahwa kolom `pass` atau hash kata sandi **TIDAK PERNAH** dikembalikan dalam respons.

---

#### Kasus 1.2: Email Duplikat (409 Conflict)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**: *(Gunakan email yang sama dengan Kasus 1.1)*
```json
{
  "nama": "Ahmad Kloning",
  "email": "ahmad.fauzi@attarlaw.id",
  "pass": "Rahasia123!"
}
```
* **Expected Status**: `409 Conflict`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Email sudah terdaftar. Silakan gunakan email lain atau login."
}
```

---

#### Kasus 1.3: Data Tidak Lengkap / Validasi Input (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "invalid-email-format",
  "pass": "123"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Nama, email, dan kata sandi wajib diisi."
}
```

---

#### Kasus 1.4: Uji Keamanan Ekskalasi Peran / Privilege Escalation (400 Bad Request)
* **Deskripsi**: Mencoba mendaftarkan diri secara ilegal dengan peran `admin` atau `lawyer`.
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "nama": "Peretas Jahat",
  "email": "hacker@attarlaw.id",
  "pass": "HackerPass123!",
  "role": "admin"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Pendaftaran publik hanya diizinkan untuk peran \"staff\". Peran admin atau lawyer harus ditugaskan secara internal oleh Administrator."
}
```

---

### Skenario 2: POST /api/auth/login (Otentikasi Pengguna)

#### Kasus 2.1: Login Berhasil (200 OK)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "ahmad.fauzi@attarlaw.id",
  "pass": "Rahasia123!"
}
```
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Login berhasil.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nama": "Ahmad Fauzi, S.H.",
    "email": "ahmad.fauzi@attarlaw.id",
    "role": "staff"
  }
}
```
* **Otomatisasi**: Variabel `{{token}}` akan tersimpan otomatis jika skrip tes Postman telah dipasang.

---

#### Kasus 2.2: Kata Sandi Salah (401 Unauthorized)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "ahmad.fauzi@attarlaw.id",
  "pass": "PasswordSalahTotal"
}
```
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Email atau kata sandi tidak valid."
}
```

---

#### Kasus 2.3: Email Tidak Terdaftar (401 Unauthorized)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "email": "tidak.ada@attarlaw.id",
  "pass": "Sembarang123!"
}
```
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Email atau kata sandi tidak valid."
}
```
* **Catatan Praktik Keamanan**: Pesan kegagalan sengaja dibuat identik dengan Kasus 2.2 ("Email atau kata sandi tidak valid") guna mencegah teknik *User Enumeration Attack* di mana peretas mencoba menebak daftar email karyawan yang terdaftar.

---

### Skenario 3: GET /api/auth/me (Profil Pengguna Saat Ini)

#### Kasus 3.1: Token Valid (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/auth/me`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "nama": "Ahmad Fauzi, S.H.",
    "email": "ahmad.fauzi@attarlaw.id",
    "role": "staff"
  }
}
```

---

#### Kasus 3.2: Tanpa Token / Token Tidak Diberikan (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/auth/me`
* *(Jangan sertakan header Authorization dan cookie)*
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak ditemukan."
}
```

---

#### Kasus 3.3: Token Rusak / Tidak Valid (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/auth/me`
* **Headers**:
  * `Authorization`: `Bearer token_asal_asalan_palsu`
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Token tidak valid atau rusak."
}
```

---

### Skenario 4: Pengujian Route Terproteksi & Role-Based Access Control (RBAC)

#### Kasus 4.1: GET /api/admin/dashboard-stub (Akses Seluruh Pengguna Internal)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/dashboard-stub`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data dashboard shell berhasil dimuat.",
  "user": {
    "id": 1,
    "nama": "Ahmad Fauzi, S.H.",
    "role": "staff"
  },
  "system": {
    "appName": "Attar Lawfirm Office",
    "version": "1.0.0 (Step 1 - Auth System)",
    "status": "active"
  },
  "stubs": {
    "appointmentsCount": 0,
    "consultationsCount": 0,
    "articlesCount": 0,
    "lawyersCount": 0
  }
}
```

---

#### Kasus 4.2: GET /api/admin/manage-users-stub dengan Token Staff (403 Forbidden)
* **Deskripsi**: Mencoba mengakses endpoint khusus Administrator menggunakan token akun staff.
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/manage-users-stub`
* **Headers**:
  * `Authorization`: `Bearer {{token}}` *(Token role staff)*
* **Expected Status**: `403 Forbidden`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses terlarang. Anda (staff) tidak memiliki izin untuk tindakan ini."
}
```

---

#### Kasus 4.3: GET /api/admin/manage-users-stub dengan Token Admin (200 OK)
* **Deskripsi**: Diuji setelah mengubah role user menjadi `admin` di tabel database atau login dengan akun admin.
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/manage-users-stub`
* **Headers**:
  * `Authorization`: `Bearer {{admin_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Akses administrator terverifikasi. Modul kelola pengguna (Step lanjutan).",
  "adminActionAllowed": true,
  "currentUser": {
    "id": 2,
    "nama": "Principal Partner",
    "email": "admin@attarlaw.id",
    "role": "admin"
  }
}
```

---

### Skenario 5: POST /api/auth/logout (Mengakhiri Sesi)

* **Method**: `POST`
* **URL**: `{{baseUrl}}/auth/logout`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Logout berhasil. Sesi telah diakhiri."
}
```
* **Efek Samping**: Cookie `token` dihapus dari browser klien.

---

### Skenario 6: Modul Konsultasi Masuk (Consultations Inbox)

Modul ini menangani pengajuan permohonan konsultasi hukum online dari publik dan pengelolaan pesan masuk oleh staf/pengacara/admin kantor hukum.

#### 6.1 POST /api/consultations (Formulir Pengajuan Publik - Tanpa Autentikasi)

##### Kasus 6.1.1: Pengajuan Berhasil (201 Created, Default Status `unread`)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/consultations`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "client_name": "Rian Pratama",
  "client_email": "rian.pratama@startup.id",
  "client_phone": "081234567891",
  "service_id": 1,
  "subject": "Pertanyaan Perizinan OSS dan Struktur Saham PT",
  "message": "Halo tim Attar Lawfirm, kami butuh panduan mengenai klasifikasi KBLI di OSS serta pembagian hak suara saham pendiri. Mohon informasi prosedurnya."
}
```
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Permohonan konsultasi hukum Anda berhasil dikirim. Tim kami akan segera menindaklanjuti.",
  "data": {
    "id": 1,
    "client_name": "Rian Pratama",
    "client_email": "rian.pratama@startup.id",
    "client_phone": "081234567891",
    "service_id": 1,
    "subject": "Pertanyaan Perizinan OSS dan Struktur Saham PT",
    "message": "Halo tim Attar Lawfirm, kami butuh panduan mengenai klasifikasi KBLI di OSS serta pembagian hak suara saham pendiri. Mohon informasi prosedurnya.",
    "status": "unread",
    "created_at": "2026-11-09T03:00:00.000Z",
    "service_title": "Hukum Bisnis & Korporasi"
  }
}
```

##### Kasus 6.1.2: Data Wajib Tidak Lengkap (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/consultations`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "client_name": "Rian Pratama",
  "client_email": "rian.pratama@startup.id"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Nama lengkap, email, subjek konsultasi, dan pesan wajib diisi."
}
```

##### Kasus 6.1.3: Format Email Tidak Valid (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/consultations`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "client_name": "Rian Pratama",
  "client_email": "bukan-alamat-email",
  "subject": "Konsultasi Umum",
  "message": "Pesan konsultasi hukum."
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Format alamat email tidak valid."
}
```

---

#### 6.2 GET /api/admin/consultations (Daftar Konsultasi Masuk - Terproteksi)

##### Kasus 6.2.1: Tanpa Token Autentikasi (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations`
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak ditemukan."
}
```

##### Kasus 6.2.2: Dengan Token Valid (200 OK, Mengembalikan Data & Rekap Status)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data konsultasi masuk berhasil dimuat.",
  "stats": {
    "total": 5,
    "unread": 2,
    "read": 1,
    "replied": 1,
    "archived": 1
  },
  "data": [
    {
      "id": 1,
      "client_name": "Rian Pratama",
      "client_email": "rian.pratama@startup.id",
      "client_phone": "081234567891",
      "service_id": 1,
      "subject": "Pertanyaan Perizinan OSS dan Struktur Saham PT",
      "message": "...",
      "status": "unread",
      "created_at": "2026-11-09T03:00:00.000Z",
      "service_title": "Hukum Bisnis & Korporasi"
    }
  ]
}
```

##### Kasus 6.2.3: Filter Status `?status=unread` (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations?status=unread`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response**: Hanya mengembalikan konsultasi yang berstatus `unread`, namun objek `stats` tetap mencakup rekap keseluruhan.

##### Kasus 6.2.4: Pencarian Kata Kunci `?search=saham` (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations?search=saham`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response**: Mengembalikan konsultasi yang nama klien, email, telepon, atau subjeknya memuat kata `saham`.

---

#### 6.3 GET /api/admin/consultations/:id (Detail Konsultasi & Auto-Mark As Read - Terproteksi)

##### Kasus 6.3.1: Ambil Detail & Verifikasi Perubahan Otomatis `unread` -> `read` (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations/1`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "client_name": "Rian Pratama",
    "client_email": "rian.pratama@startup.id",
    "client_phone": "081234567891",
    "service_id": 1,
    "subject": "Pertanyaan Perizinan OSS dan Struktur Saham PT",
    "message": "Halo tim Attar Lawfirm, kami butuh panduan...",
    "status": "read",
    "created_at": "2026-11-09T03:00:00.000Z",
    "service_title": "Hukum Bisnis & Korporasi"
  }
}
```
* **Verifikasi Khusus**: Jika konsultasi awalnya berstatus `unread`, pemanggilan endpoint ini akan otomatis memperbarui nilai kolom `status` di tabel database menjadi `read`. Pada pemanggilan kedua, status akan tetap `read`.

##### Kasus 6.3.2: ID Konsultasi Tidak Ditemukan (404 Not Found)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations/999999`
* **Headers**:
  * `Authorization`: `Bearer {{token}}`
* **Expected Status**: `404 Not Found`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Data konsultasi tidak ditemukan."
}
```

##### Kasus 6.3.3: Tanpa Token Autentikasi (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/consultations/1`
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak ditemukan."
}
```

---

#### 6.4 PATCH /api/admin/consultations/:id/status (Ubah Status Manual - Terproteksi)

##### Kasus 6.4.1: Tandai Sebagai Dibalas / Archived (200 OK)
* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/consultations/1/status`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer {{token}}`
* **Request Body**:
```json
{
  "status": "replied"
}
```
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Status konsultasi berhasil diubah menjadi 'replied'.",
  "data": {
    "id": 1,
    "client_name": "Rian Pratama",
    "status": "replied"
  }
}
```

##### Kasus 6.4.2: Nilai Enum Status Tidak Valid (400 Bad Request)
* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/consultations/1/status`
* **Headers**:
  * `Content-Type`: `application/json`
  * `Authorization`: `Bearer {{token}}`
* **Request Body**:
```json
{
  "status": "status_ngawur"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Status tidak valid. Pilihan: unread, read, replied, archived."
}
```

##### Kasus 6.4.3: Tanpa Token Autentikasi (401 Unauthorized)
* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/consultations/1/status`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "status": "archived"
}
```
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak ditemukan."
}
```

---

### Skenario 7: Modul Daftar Pengacara (Lawyers CRUD & WebP Upload)

Modul ini mengelola profil advokat kantor hukum menggunakan arsitektur OOP (`LawyerModel` dan `LawyerController`), pipeline upload file foto dengan konversi otomatis ke format WebP (quality 80, resize max-width 800px via `sharp`), serta penanganan integritas relasi foreign key pada penghapusan.

#### Catatan Penyimpanan Folder Uploads
* Folder penyimpanan fisik berada di `backend/uploads/lawyers/`.
* Disajikan sebagai file statis melalui Express pada endpoint `http://localhost:5000/uploads/...`.
* Folder diabaikan oleh git (`.gitignore`), namun struktur direktori dipertahankan melalui file `.gitkeep`.
* Database hanya menyimpan path relatif (misal: `/uploads/lawyers/lawyer-xxxxx.webp`), dan URL gambar penuh dibentuk oleh frontend.

---

#### 7.1 GET /api/lawyers (Daftar Pengacara Publik - Tanpa Autentikasi)

* **Deskripsi**: Menampilkan pengacara berstatus aktif (`is_active = true`) untuk tampilan publik. Kolom sensitif seperti kontak internal (`email` dan `phone`) secara sengaja disembunyikan.
* **Method**: `GET`
* **URL**: `{{baseUrl}}/lawyers`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Daftar pengacara publik berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "full_name": "H. Muhammad Attar, S.H., M.H.",
      "title": "Managing Partner & Senior Advocate",
      "photo": null,
      "bio": null,
      "specialization": "Hukum Bisnis, Litigasi Perdata & Arbitrase"
    }
  ]
}
```

---

#### 7.2 GET /api/admin/lawyers (Daftar Pengacara Internal - Terproteksi)

##### Kasus 7.2.1: Tanpa Token Autentikasi (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Expected Status**: `401 Unauthorized`

##### Kasus 7.2.2: Dengan Token Valid (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**: `Authorization: Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Query Parameters Opsional**:
  * `?status=active` (hanya advokat aktif)
  * `?status=inactive` (hanya advokat nonaktif)
  * `?search=litigasi` (pencarian nama, gelar, atau spesialisasi)

---

#### 7.3 GET /api/admin/lawyers/:id (Detail Pengacara - Terproteksi)

* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/lawyers/1`
* **Headers**: `Authorization: Bearer {{token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": null,
    "full_name": "H. Muhammad Attar, S.H., M.H.",
    "title": "Managing Partner & Senior Advocate",
    "photo": null,
    "bio": null,
    "specialization": "Hukum Bisnis, Litigasi Perdata & Arbitrase",
    "email": "attar@attarlaw.id",
    "phone": "081234567890",
    "is_active": 1,
    "created_at": "2026-11-07T08:29:17.000Z",
    "updated_at": "2026-11-07T08:29:17.000Z"
  }
}
```

---

#### 7.4 POST /api/admin/lawyers (Tambah Pengacara Baru - Khusus Admin)

##### Kasus 7.4.1: Berhasil dengan Upload Foto (201 Created)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**:
  * `Authorization`: `Bearer {{admin_token}}`
* **Body Type**: `form-data`
* **Form-data Fields**:
  * `full_name` (Text): `Dewi Sartika, S.H., M.H.`
  * `title` (Text): `Senior Associate - Litigasi Bisnis`
  * `specialization` (Text): `Hukum Perdata dan Arbitrase`
  * `email` (Text): `dewi.sartika@attarlaw.id`
  * `phone` (Text): `081299887766`
  * `is_active` (Text): `1`
  * `photo` (File): *Pilih file gambar .jpg, .png, atau .webp*
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data pengacara baru berhasil ditambahkan.",
  "data": {
    "id": 4,
    "full_name": "Dewi Sartika, S.H., M.H.",
    "title": "Senior Associate - Litigasi Bisnis",
    "photo": "/uploads/lawyers/lawyer-1794315780089-972784711.webp",
    "specialization": "Hukum Perdata dan Arbitrase",
    "email": "dewi.sartika@attarlaw.id",
    "phone": "081299887766",
    "is_active": 1
  }
}
```

##### Kasus 7.4.2: Akses Ditolak untuk Peran Staf / Non-Admin (403 Forbidden)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Expected Status**: `403 Forbidden`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses terlarang. Peran 'staff' tidak memiliki izin untuk tindakan ini."
}
```

##### Kasus 7.4.3: Field Wajib Kosong (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**: `Authorization: Bearer {{admin_token}}`, `Content-Type: application/json`
* **Request Body**:
```json
{
  "full_name": "Advokat Tanpa Gelar"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Nama lengkap dan gelar/jabatan advokat wajib diisi."
}
```

##### Kasus 7.4.4: File Non-Gambar / PDF (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body Type**: `form-data` dengan field `photo` berisi file berkas `.pdf`
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Format file tidak didukung. Harap unggah foto berformat JPG, PNG, atau WEBP."
}
```

##### Kasus 7.4.5: Ukuran File Melebihi 2MB (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/lawyers`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body Type**: `form-data` dengan field `photo` berukuran > 2MB
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Ukuran file foto melebihi batas maksimal 2MB."
}
```

---

#### 7.5 PUT /api/admin/lawyers/:id (Perbarui Pengacara - Khusus Admin)

* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/lawyers/4`
* **Headers**:
  * `Authorization`: `Bearer {{admin_token}}`
  * `Content-Type`: `application/json` *(atau form-data jika mengganti foto)*
* **Request Body**:
```json
{
  "full_name": "Dewi Sartika, S.H., M.H.",
  "title": "Partner - Litigasi Bisnis & Korporasi",
  "specialization": "Hukum Perdata, Arbitrase & Sengketa Komersial"
}
```
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data pengacara berhasil diperbarui.",
  "data": {
    "id": 4,
    "title": "Partner - Litigasi Bisnis & Korporasi"
  }
}
```

---

#### 7.6 PATCH /api/admin/lawyers/:id/toggle-active (Ubah Status Aktif/Nonaktif - Khusus Admin)

* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/lawyers/4/toggle-active`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Status pengacara Dewi Sartika, S.H., M.H. berhasil dinonaktifkan.",
  "data": {
    "id": 4,
    "is_active": 0
  }
}
```

---

#### 7.7 DELETE /api/admin/lawyers/:id (Hapus Pengacara - Khusus Admin)

##### Kasus 7.7.1: Gagal Dihapus karena Masih Memiliki Jadwal Janji Temu (400 Bad Request)
* **Deskripsi**: Menghapus advokat yang ID-nya masih terikat di tabel `appointments` (misal ID: 1).
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/lawyers/1`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Pengacara ini tidak bisa dihapus karena masih memiliki jadwal konsultasi terkait. Nonaktifkan saja statusnya jika tidak lagi aktif."
}
```

##### Kasus 7.7.2: Berhasil Dihapus (Advokat Tanpa Jadwal Terikat) (200 OK)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/lawyers/4`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data pengacara Dewi Sartika, S.H., M.H. berhasil dihapus."
}
```
* **Efek Samping**: File foto fisik pada disk `/uploads/lawyers/...` otomatis terhapus dengan aman.


---

### Skenario 8: Pengelolaan Kategori & Artikel Berita (OOP CRUD & Upload Thumbnail)

Skenario ini memverifikasi fungsionalitas manajemen Kategori dan Artikel (Draft / Published), sistem otorisasi berbasis peran (RBAC) dan kepemilikan penulis (*author-or-admin*), serta konversi otomatis thumbnail WebP.

---

#### 8.1 GET /api/categories (Daftar Kategori Publik)

* **Method**: `GET`
* **URL**: `{{baseUrl}}/categories`
* **Akses**: Publik (tanpa autentikasi)
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Daftar kategori berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "name": "Hukum Pidana & Korupsi",
      "slug": "hukum-pidana-korupsi",
      "created_at": "2026-11-11T13:24:00.000Z",
      "articles_count": 5
    }
  ]
}
```

---

#### 8.2 POST /api/admin/categories (Tambah Kategori - Khusus Admin)

##### Kasus 8.2.1: Ditolak jika Bukan Admin (403 Forbidden)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/categories`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Body (raw JSON)**:
```json
{
  "name": "Hukum Tata Negara"
}
```
* **Expected Status**: `403 Forbidden`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Fitur ini hanya dapat diakses oleh Administrator."
}
```

##### Kasus 8.2.2: Berhasil Ditambahkan oleh Admin (201 Created)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/categories`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "name": "Hukum Pidana & Korupsi"
}
```
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Kategori 'Hukum Pidana & Korupsi' berhasil dibuat.",
  "data": {
    "id": 1,
    "name": "Hukum Pidana & Korupsi",
    "slug": "hukum-pidana-korupsi",
    "created_at": "2026-11-11T13:24:00.000Z",
    "articles_count": 0
  }
}
```

---

#### 8.3 DELETE /api/admin/categories/:id (Hapus Kategori - Khusus Admin)

##### Kasus 8.3.1: Gagal Dihapus karena Masih Memiliki Artikel Terkait (400 Bad Request)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/categories/1`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Kategori ini tidak bisa dihapus karena masih memiliki artikel terkait. Pindahkan atau hapus artikel tersebut terlebih dahulu."
}
```

##### Kasus 8.3.2: Berhasil Dihapus (Kategori Kosong) (200 OK)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/categories/2`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Kategori 'Kategori Sementara' berhasil dihapus."
}
```

---

#### 8.4 GET /api/articles (Daftar Artikel Publik - Terbit Saja)

* **Method**: `GET`
* **URL**: `{{baseUrl}}/articles?page=1&limit=10&category=hukum-pidana-korupsi&search=waris`
* **Akses**: Publik
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Daftar artikel terbit berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "title": "Panduan Hukum Waris Menurut KUHPerdata",
      "slug": "panduan-hukum-waris-menurut-kuhperdata",
      "category_id": 1,
      "author_id": 1,
      "thumbnail": "/uploads/articles/thumbnail-1762867440000-841920.webp",
      "status": "published",
      "published_at": "2026-11-11T13:24:00.000Z",
      "created_at": "2026-11-11T13:24:00.000Z",
      "updated_at": "2026-11-11T13:24:00.000Z",
      "category_name": "Hukum Pidana & Korupsi",
      "category_slug": "hukum-pidana-korupsi",
      "author_name": "Muhammad Attar Putra Pratama"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### 8.5 GET /api/articles/:slug (Detail Artikel Publik Berdasarkan Slug)

##### Kasus 8.5.1: Artikel Masih Berstatus Draft atau Tidak Ditemukan (404 Not Found)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/articles/artikel-masih-draft`
* **Expected Status**: `404 Not Found`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Artikel tidak ditemukan atau belum dipublikasikan."
}
```

##### Kasus 8.5.2: Artikel Berhasil Dimuat (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/articles/panduan-hukum-waris-menurut-kuhperdata`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Panduan Hukum Waris Menurut KUHPerdata",
    "slug": "panduan-hukum-waris-menurut-kuhperdata",
    "category_id": 1,
    "author_id": 1,
    "thumbnail": "/uploads/articles/thumbnail-1762867440000-841920.webp",
    "content": "<p>Ini adalah panduan komprehensif...</p>",
    "status": "published",
    "published_at": "2026-11-11T13:24:00.000Z",
    "category_name": "Hukum Pidana & Korupsi",
    "author_name": "Muhammad Attar Putra Pratama"
  }
}
```

---

#### 8.6 GET /api/admin/articles (Daftar Artikel Internal Portal)

##### Kasus 8.6.1: Ditolak jika Belum Login (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/articles`
* **Expected Status**: `401 Unauthorized`

##### Kasus 8.6.2: Berhasil Dimuat untuk Pengguna Internal (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/articles?status=all`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data artikel internal berhasil dimuat.",
  "stats": {
    "total": 3,
    "draft": 1,
    "published": 2
  },
  "counts": {
    "total": 3,
    "draft": 1,
    "published": 2
  },
  "data": [
    {
      "id": 1,
      "title": "Panduan Hukum Waris Terkini",
      "slug": "panduan-hukum-waris-terkini",
      "status": "draft",
      "author_name": "Muhammad Attar Putra Pratama",
      "author_role": "staff"
    }
  ]
}
```

---

#### 8.7 POST /api/admin/articles (Buat Artikel Baru - Multipart Form-Data)

* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/articles`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Body (`form-data`)**:
  * `title`: `Panduan Hukum Waris Menurut KUHPerdata`
  * `category_id`: `1`
  * `content`: `<p>Isi panduan komprehensif...</p>`
  * `status`: `draft`
  * `thumbnail`: `[File Gambar .jpg / .png]`
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Artikel 'Panduan Hukum Waris Menurut KUHPerdata' berhasil disimpan.",
  "data": {
    "id": 1,
    "title": "Panduan Hukum Waris Menurut KUHPerdata",
    "slug": "panduan-hukum-waris-menurut-kuhperdata",
    "category_id": 1,
    "author_id": 1,
    "thumbnail": "/uploads/articles/thumbnail-1762867440000-841920.webp",
    "status": "draft",
    "published_at": null
  }
}
```

---

#### 8.8 PUT /api/admin/articles/:id (Perbarui Artikel - Author atau Admin)

##### Kasus 8.8.1: Ditolak jika Pengguna Lain yang Mencoba Edit (403 Forbidden)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/articles/1`
* **Headers**: `Authorization: Bearer {{other_user_token}}`
* **Body (raw JSON / form-data)**:
```json
{
  "title": "Percobaan Modifikasi Ilegal"
}
```
* **Expected Status**: `403 Forbidden`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Anda hanya dapat mengubah atau memperbarui artikel yang Anda tulis sendiri."
}
```

##### Kasus 8.8.2: Berhasil Diperbarui oleh Penulis atau Admin (200 OK)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/articles/1`
* **Headers**: `Authorization: Bearer {{staff_token}}` (atau `{{admin_token}}`)
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Artikel 'Panduan Hukum Waris Terkini (Revisi Penulis)' berhasil diperbarui.",
  "data": {
    "id": 1,
    "title": "Panduan Hukum Waris Terkini (Revisi Penulis)",
    "slug": "panduan-hukum-waris-terkini-revisi-penulis"
  }
}
```

---

#### 8.9 PATCH /api/admin/articles/:id/status (Ubah Status Draft / Terbit)

##### Kasus 8.9.1: Ditolak jika Bukan Penulis / Admin (403 Forbidden)
* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/articles/1/status`
* **Headers**: `Authorization: Bearer {{other_user_token}}`
* **Body (raw JSON)**:
```json
{
  "status": "published"
}
```
* **Expected Status**: `403 Forbidden`

##### Kasus 8.9.2: Publikasi Pertama Kali (Mengisi Timestamp `published_at`) (200 OK)
* **Method**: `PATCH`
* **URL**: `{{baseUrl}}/admin/articles/1/status`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Body (raw JSON)**:
```json
{
  "status": "published"
}
```
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Status artikel berhasil diubah menjadi 'published'.",
  "data": {
    "id": 1,
    "status": "published",
    "published_at": "2026-11-11T13:24:00.000Z"
  }
}
```
* **Catatan**: Jika status dikembalikan ke `draft` lalu di-`published` kembali, nilai `published_at` awal akan tetap dipertahankan dan tidak ditimpa dengan waktu baru.

---

#### 8.10 DELETE /api/admin/articles/:id (Hapus Artikel - Author atau Admin)

##### Kasus 8.10.1: Ditolak jika Bukan Penulis / Admin (403 Forbidden)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/articles/1`
* **Headers**: `Authorization: Bearer {{other_user_token}}`
* **Expected Status**: `403 Forbidden`

##### Kasus 8.10.2: Berhasil Dihapus oleh Penulis atau Admin (200 OK)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/articles/1`
* **Headers**: `Authorization: Bearer {{staff_token}}` (atau `{{admin_token}}`)
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Artikel 'Panduan Hukum Waris Terkini (Revisi Penulis)' berhasil dihapus."
}
```
* **Efek Samping**: File thumbnail WebP pada folder fisik `backend/uploads/articles/...` otomatis dibersihkan dari penyimpanan disk.


---

### Skenario 9: Pengelolaan Bidang Keahlian / Layanan Hukum (Services Management)

Skenario ini memverifikasi endpoint publik `GET /api/services` untuk konsumsi Halaman Utama (Landing Page), proteksi endpoint internal `GET /api/admin/services`, serta hak akses eksklusif Administrator untuk operasi CRUD (`POST`, `PUT`, `DELETE`) dan validasi ketat kunci ikon kurasi.

---

#### 9.1 GET /api/services (Daftar Bidang Keahlian Publik)

* **Method**: `GET`
* **URL**: `{{baseUrl}}/services`
* **Akses**: Publik (tanpa header Authorization)
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Daftar bidang keahlian publik berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "title": "Hukum Bisnis & Korporasi",
      "slug": "hukum-bisnis-korporasi",
      "description": "Konsultasi pendirian badan usaha, kontrak bisnis, dan kepatuhan regulasi.",
      "icon": "FaBriefcase",
      "created_at": "2026-11-07T08:29:17.000Z"
    }
  ]
}
```

---

#### 9.2 GET /api/admin/services (Daftar Bidang Keahlian Internal Portal)

##### Kasus 9.2.1: Ditolak jika Belum Terautentikasi (401 Unauthorized)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/services`
* **Expected Status**: `401 Unauthorized`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak ditemukan."
}
```

##### Kasus 9.2.2: Berhasil Dimuat oleh Pengguna Internal (Staff/Lawyer/Admin) (200 OK)
* **Method**: `GET`
* **URL**: `{{baseUrl}}/admin/services`
* **Headers**: `Authorization: Bearer {{staff_token}}` (atau `{{admin_token}}`)
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Data bidang keahlian internal berhasil dimuat.",
  "data": [
    {
      "id": 1,
      "title": "Hukum Bisnis & Korporasi",
      "slug": "hukum-bisnis-korporasi",
      "description": "Konsultasi pendirian badan usaha, kontrak bisnis, dan kepatuhan regulasi.",
      "icon": "FaBriefcase",
      "created_at": "2026-11-07T08:29:17.000Z"
    }
  ]
}
```

---

#### 9.3 POST /api/admin/services (Tambah Bidang Keahlian Baru - Khusus Admin)

##### Kasus 9.3.1: Ditolak jika Bukan Administrator (403 Forbidden)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/services`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Hukum Kepailitan & PKPU",
  "icon": "FaBalanceScale"
}
```
* **Expected Status**: `403 Forbidden`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Akses ditolak. Fitur ini hanya dapat diakses oleh Administrator."
}
```

##### Kasus 9.3.2: Ditolak jika Ikon Tidak Terdaftar dalam Daftar Kurasi (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/services`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Hukum Lingkungan",
  "icon": "FaRandomInvalidIcon"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Ikon bidang keahlian tidak valid. Pilih dari daftar ikon yang tersedia."
}
```

##### Kasus 9.3.3: Ditolak jika Field Judul Tidak Diisi (400 Bad Request)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/services`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "",
  "description": "Deskripsi tanpa judul",
  "icon": "FaGavel"
}
```
* **Expected Status**: `400 Bad Request`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Judul bidang keahlian wajib diisi."
}
```

##### Kasus 9.3.4: Berhasil Dibuat oleh Admin dengan Ikon Sah (201 Created)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/admin/services`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Hukum Pajak & Keuangan",
  "description": "Konsultasi sengketa pajak dan audit kepatuhan perpajakan perusahaan.",
  "icon": "FaUniversity"
}
```
* **Expected Status**: `201 Created`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Bidang keahlian 'Hukum Pajak & Keuangan' berhasil dibuat.",
  "data": {
    "id": 5,
    "title": "Hukum Pajak & Keuangan",
    "slug": "hukum-pajak-keuangan",
    "description": "Konsultasi sengketa pajak dan audit kepatuhan perpajakan perusahaan.",
    "icon": "FaUniversity",
    "created_at": "2026-11-12T11:03:29.000Z"
  }
}
```

---

#### 9.4 PUT /api/admin/services/:id (Perbarui Bidang Keahlian - Khusus Admin)

##### Kasus 9.4.1: Ditolak jika Bukan Administrator (403 Forbidden)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/services/5`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Percobaan Modifikasi Staf"
}
```
* **Expected Status**: `403 Forbidden`

##### Kasus 9.4.2: ID Bidang Keahlian Tidak Ditemukan (404 Not Found)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/services/9999`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Judul Baru"
}
```
* **Expected Status**: `404 Not Found`
* **Expected Response Body**:
```json
{
  "success": false,
  "message": "Bidang keahlian tidak ditemukan."
}
```

##### Kasus 9.4.3: Berhasil Diperbarui oleh Admin (200 OK)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/admin/services/5`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Body (raw JSON)**:
```json
{
  "title": "Hukum Perpajakan & Keuangan Bisnis",
  "description": "Pendampingan keberatan pajak, banding di pengadilan pajak, dan audit kepatuhan fiskal.",
  "icon": "FaUniversity"
}
```
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Bidang keahlian 'Hukum Perpajakan & Keuangan Bisnis' berhasil diperbarui.",
  "data": {
    "id": 5,
    "title": "Hukum Perpajakan & Keuangan Bisnis",
    "slug": "hukum-perpajakan-keuangan-bisnis",
    "description": "Pendampingan keberatan pajak, banding di pengadilan pajak, dan audit kepatuhan fiskal.",
    "icon": "FaUniversity"
  }
}
```

---

#### 9.5 DELETE /api/admin/services/:id (Hapus Bidang Keahlian - Khusus Admin)

##### Kasus 9.5.1: Ditolak jika Bukan Administrator (403 Forbidden)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/services/5`
* **Headers**: `Authorization: Bearer {{staff_token}}`
* **Expected Status**: `403 Forbidden`

##### Kasus 9.5.2: Berhasil Dihapus oleh Admin (200 OK)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/admin/services/5`
* **Headers**: `Authorization: Bearer {{admin_token}}`
* **Expected Status**: `200 OK`
* **Expected Response Body**:
```json
{
  "success": true,
  "message": "Bidang keahlian 'Hukum Perpajakan & Keuangan Bisnis' berhasil dihapus."
}
```
