# 🗄️ Database Management & Deployment Guide
NexStack Studio Web Development Platform

Folder ini berisi skrip skema, migrasi, dan seed data resmi untuk database PostgreSQL / Supabase.

---

## 📌 Isi Direktori `database/`
- `schema.sql`: Skema inti DDL tabel (`consultations`, `estimate_proposals`, `transactions`, `audit_logs`), tipe ENUM, indeks, dan aturan Row Level Security (RLS).
- `seed.sql`: Data contoh awal untuk verifikasi sistem kalkulator, proposal, dan simulasi pembayaran QRIS.
- `migrations/`:
  - `001_initial_schema.sql`: Migrasi inisialisasi tabel dasar.
  - `002_add_audit_and_constraints.sql`: Migrasi penambahan indeks keamanan dan audit log.

---

## 🚀 Cara Menjalankan Database

### Opsi 1: Supabase (Paling Mudah, Gratis & Cloud)
1. Buka [https://supabase.com](https://supabase.com) dan buat project baru (`nexstack-studio`).
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file `database/schema.sql`, salin seluruh isinya, lalu tempel ke editor Supabase dan klik **Run**.
4. (Opsional) Buka file `database/seed.sql`, tempel dan klik **Run** untuk memasukkan data contoh awal.
5. Selesai! Buka menu **Project Settings -> API** untuk mendapatkan `Project URL` dan `anon key`.

### Opsi 2: PostgreSQL Lokal atau VPS (Docker / CLI)
Jika menggunakan PostgreSQL di server VPS/lokal:
```bash
# 1. Buat database baru
createdb -U postgres nexstack_db

# 2. Jalankan skema
psql -U postgres -d nexstack_db -f database/schema.sql

# 3. Jalankan seed data
psql -U postgres -d nexstack_db -f database/seed.sql
```

---

## 🔒 Catatan Keamanan
- File `.sql` ini tidak mengandung kredensial rahasia apa pun.
- Kredensial koneksi (URL, Key, DB Password) harus dimasukkan melalui file `.env` di server atau dashboard environment hosting Anda.
