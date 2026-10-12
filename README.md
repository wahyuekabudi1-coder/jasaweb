# 🚀 NexStack Studio - Full-Stack Production Package

Website resmi & sistem estimasi booking agensi pengembangan web dan aplikasi full-stack (**NexStack Studio**).

---

## 📁 Struktur Lengkap Repositori

```text
nexstack-studio/
├── frontend/                   # Antarmuka Pengguna & Interaksi UI
│   ├── index.html              # Beranda (Hero, Statistik, Alur Kerja, Portfolio Teaser)
│   ├── layanan.html            # Paket Harga, Kalkulator Estimasi, Modal PDF & QRIS
│   ├── portofolio.html         # Galeri Studi Kasus, Filter Kategori & Tech Stack
│   ├── konsultasi.html         # Formulir Konsultasi Terhubung Database
│   └── js/
│       ├── config.js           # Konfigurasi Klien (Supabase & API URL)
│       └── database-client.js  # Client-side SDK pemanggil API / Supabase
│
├── backend/                    # Serverless Functions & API Endpoints
│   ├── api/
│   │   ├── submit-consultation.js  # Handler POST data form konsultasi + proposal
│   │   ├── create-qris.js          # Generator transaksi QRIS resmi
│   │   ├── webhook-payment.js      # Callback verifikasi pembayaran sah
│   │   └── send-receipt.js         # Pengiriman e-kuitansi otomatis via Resend
│   └── package.json            # Dependensi backend Node.js
│
├── database/                   # Manajemen Database PostgreSQL
│   ├── schema.sql              # Skema DDL tabel, ENUM, Indeks, & RLS
│   ├── seed.sql                # Data awal untuk pengujian
│   ├── README.md               # Panduan impor dan eksekusi SQL
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_add_audit_and_constraints.sql
│
├── .env.example                # Template variabel lingkungan rahasia
├── .gitignore                  # Berkas proteksi Git (node_modules, .env)
├── vercel.json                 # Konfigurasi deployment gratis Vercel
└── README.md                   # Dokumentasi instalasi dan arsitektur (file ini)
```

---

## ⚙️ Persyaratan Sistem
- **Node.js**: Versi 18.x atau lebih baru
- **Database**: PostgreSQL 14+ atau Akun Gratis [Supabase](https://supabase.com)
- **Email Service**: Akun [Resend](https://resend.com) (Gratis 3.000 email/bulan)

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### 1. Ekstrak & Masuk ke Direktori
```bash
unzip nexstack-studio-fullstack.zip
cd nexstack-studio
```

### 2. Setup Environment Variables
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan kredensial Supabase serta Resend Anda.

### 3. Setup Database (Supabase)
1. Buka dashboard Supabase -> **SQL Editor**.
2. Salin isi `database/schema.sql` lalu klik **Run**.
3. (Opsional) Salin isi `database/seed.sql` lalu klik **Run** untuk mengisi data awal.

### 4. Menjalankan Server Backend & Frontend
```bash
# Install dependensi
npm install

# Jalankan secara lokal (dengan Vercel CLI atau Node)
npx vercel dev
# Atau buka frontend/index.html dengan Live Server
```

---

## 🚀 Panduan Deployment ke Production (3 Menit)

### Opsi A: Deployment via Vercel (Rekomendasi)
1. Upload folder project ini ke repositori **GitHub** Anda.
2. Buka dashboard [Vercel](https://vercel.com) -> Klik **Add New Project** -> Pilih repositori GitHub Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `MIDTRANS_SERVER_KEY`
4. Klik **Deploy**. Website dan seluruh API endpoint langsung aktif dengan HTTPS dan domain gratis!

### Opsi B: Web Hosting Biasa / cPanel
- Upload folder `frontend/` ke folder `public_html`.
- Import file `database/schema.sql` melalui menu **phpMyAdmin / PostgreSQL Database** di cPanel Anda.

---

## 🔒 Standar Keamanan & Validasi
- **Zero Exposed Secrets**: Tidak ada kunci rahasia atau password yang disimpan di dalam source code frontend.
- **Row Level Security (RLS)**: Tabel database dilindungi dengan kebijakan RLS sehingga pengunjung umum tidak dapat mengubah status transaksi secara ilegal.
- **Server-Side Validation**: Seluruh input diverifikasi dan disanitasi di sisi server sebelum masuk ke database.
