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

