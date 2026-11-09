/**
 * i18n Translation Dictionary
 * Default language: Indonesian (id)
 * Secondary language ready: English (en)
 * 
 * Structured to ensure zero hardcoded blocking for future multi-language rollouts.
 */

const translations = {
  id: {
    // App Brand
    brandName: "ATTAR LAWFIRM OFFICE",
    brandSubtitle: "Sistem Manajemen Kantor Hukum Internal",

    // Auth Common
    email: "Alamat Email",
    emailPlaceholder: "nama@attarlaw.id",
    password: "Kata Sandi",
    passwordPlaceholder: "Minimal 6 karakter",
    confirmPassword: "Konfirmasi Kata Sandi",
    confirmPasswordPlaceholder: "Ulangi kata sandi Anda",
    fullName: "Nama Lengkap",
    fullNamePlaceholder: "Contoh: Budi Santoso, S.H.",

    // Login Page
    loginTitle: "Masuk ke Akun Anda",
    loginSubtitle: "Akses portal internal kantor hukum Attar Lawfirm",
    loginBtn: "Masuk",
    loggingIn: "Memverifikasi...",
    noAccount: "Belum memiliki akun staf?",
    registerHere: "Daftar Akun Staf",
    loginSuccess: "Login berhasil! Mengalihkan ke dashboard...",

    // Register Page
    registerTitle: "Pendaftaran Akun Staf",
    registerSubtitle: "Hanya untuk staf operasional internal kantor hukum",
    registerNotice: "Catatan: Pendaftaran mandiri ini hanya untuk peran Staf. Akun Pengacara dan Administrator dibuat langsung oleh Administrator kantor.",
    registerBtn: "Daftar Sekarang",
    registering: "Mendaftarkan...",
    haveAccount: "Sudah memiliki akun?",
    loginHere: "Masuk di sini",
    registerSuccess: "Pendaftaran berhasil! Mengalihkan ke halaman masuk...",

    // Validation Errors
    errEmailRequired: "Email wajib diisi",
    errEmailInvalid: "Format email tidak valid",
    errPasswordRequired: "Kata sandi wajib diisi",
    errPasswordMin: "Kata sandi minimal 6 karakter",
    errNameRequired: "Nama lengkap wajib diisi",
    errConfirmPasswordRequired: "Konfirmasi kata sandi wajib diisi",
    errPasswordMismatch: "Konfirmasi kata sandi tidak cocok",

    // Roles
    roleAdmin: "Administrator",
    roleLawyer: "Pengacara",
    roleStaff: "Staf Operasional",

    // Dashboard Shell
    dashboardTitle: "Dashboard Utama",
    welcomeUser: "Selamat Datang,",
    dashboardDesc: "Shell portal internal kantor hukum Attar Lawfirm (Step 1 - Sistem Autentikasi).",

    // Navigation
    navDashboard: "Dashboard",
    navAppointments: "Janji Temu",
    navArticles: "Artikel & Berita",
    navLawyers: "Daftar Pengacara",
    navConsultations: "Konsultasi Masuk",
    navManageUsers: "Kelola Pengguna",
    navLogout: "Keluar",

    // Gated Section
    adminOnlySection: "Khusus Administrator",
    manageUsersDesc: "Modul pengelolaan akun dan peran staf/pengacara (Akan diaktifkan pada step berikutnya).",
    testAdminApiBtn: "Uji Hak Akses Admin (API)",

    // Status Stubs
    activeAppointments: "Janji Temu Aktif",
    incomingConsultations: "Konsultasi Baru",
    publishedArticles: "Artikel Terbit",
    activeLawyers: "Pengacara Terdaftar",
    stubNotice: "Modul ini disiapkan untuk tahap berikutnya."
  },

  en: {
    brandName: "Attar Lawfirm Office",
    brandSubtitle: "Internal Law Firm Management Portal",
    email: "Email Address",
    emailPlaceholder: "name@attarlaw.id",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Repeat your password",
    fullName: "Full Name",
    fullNamePlaceholder: "e.g. John Doe, Esq.",
    loginTitle: "Sign In to Your Account",
    loginSubtitle: "Access the internal portal of Attar Lawfirm",
    loginBtn: "Sign In",
    loggingIn: "Authenticating...",
    noAccount: "Don't have a staff account yet?",
    registerHere: "Register Staff Account",
    loginSuccess: "Login successful! Redirecting to dashboard...",
    registerTitle: "Staff Registration",
    registerSubtitle: "Internal operational staff registration only",
    registerNotice: "Note: Public registration creates 'staff' accounts only. Lawyer and Admin accounts must be provisioned by an Administrator.",
    registerBtn: "Register Now",
    registering: "Registering...",
    haveAccount: "Already have an account?",
    loginHere: "Sign in here",
    registerSuccess: "Registration successful! Redirecting to login...",
    errEmailRequired: "Email is required",
    errEmailInvalid: "Invalid email format",
    errPasswordRequired: "Password is required",
    errPasswordMin: "Password must be at least 6 characters",
    errNameRequired: "Full name is required",
    errConfirmPasswordRequired: "Password confirmation is required",
    errPasswordMismatch: "Passwords do not match",
    roleAdmin: "Administrator",
    roleLawyer: "Lawyer",
    roleStaff: "Staff",
    dashboardTitle: "Main Dashboard",
    welcomeUser: "Welcome,",
    dashboardDesc: "Internal legal portal shell (Step 1 - Auth System).",
    navDashboard: "Dashboard",
    navAppointments: "Appointments",
    navArticles: "Articles & News",
    navLawyers: "Lawyers List",
    navConsultations: "Consultations",
    navManageUsers: "Manage Users",
    navLogout: "Log Out",
    adminOnlySection: "Administrator Only",
    manageUsersDesc: "Internal user and role management module (Coming in the next step).",
    testAdminApiBtn: "Test Admin RBAC (API)",
    activeAppointments: "Active Appointments",
    incomingConsultations: "New Consultations",
    publishedArticles: "Published Articles",
    activeLawyers: "Registered Lawyers",
    stubNotice: "This module will be connected in subsequent steps."
  }
};

let currentLang = 'id';

/**
 * Translation helper function
 * 
 * @param {string} key - Dictionary key
 * @returns {string} Translated string
 */
export function t(key) {
  const dict = translations[currentLang] || translations.id;
  return dict[key] || translations.id[key] || key;
}

/**
 * Set active language
 * 
 * @param {'id' | 'en'} lang 
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
}

/**
 * Get active language
 * 
 * @returns {string}
 */
export function getLanguage() {
  return currentLang;
}

export default translations;

