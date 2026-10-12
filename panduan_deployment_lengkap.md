# 🚀 Panduan Lengkap Full-Stack & Deployment NexStack Studio (A s/d Z)

Panduan ini berisi seluruh file, skrip integrasi, dan langkah langkah untuk mengubah kode frontend NexStack Studio dari Stitch menjadi aplikasi **Full-Stack Nyata** dengan database aktif, webhook pembayaran, dan siap di-deploy secara online.

---

## 📁 1. Struktur Folder Project Rekomendasi
Setelah mengekstrak ZIP frontend dari Stitch, susun project Anda seperti ini:

```text
nexstack-studio/
├── index.html                  # Halaman Beranda (Home)
├── layanan.html                # Halaman Layanan & Kalkulator Biaya + Modal PDF
├── portofolio.html             # Halaman Showcase Karya
├── konsultasi.html             # Halaman Formulir Konsultasi & Booking
├── js/
│   ├── config.js               # Konfigurasi API & Supabase Key
│   └── database-client.js      # Penghubung Frontend ke Database
├── api/                        # Serverless Functions (Backend)
│   ├── submit-consultation.js  # Simpan Form Konsultasi
│   ├── create-qris.js          # Generate QRIS Dinamis Asli
│   ├── webhook-payment.js      # Callback Otomatis Saat QRIS Dibayar
│   └── send-receipt.js         # Pengiriman Email E-Kuitansi Otomatis
├── database_schema.sql         # Skrip SQL untuk setup database
├── package.json
└── vercel.json                 # Konfigurasi deployment gratis Vercel
```

---

## 🗄️ 2. Setup Database Gratis (Supabase PostgreSQL)
1. Buka [https://supabase.com](https://supabase.com) dan buat akun (Gratis).
2. Buat project baru bernama `nexstack-studio`.
3. Buka menu **SQL Editor** di sidebar kiri Supabase.
4. Salin seluruh isi file `database_schema.sql` (yang sudah kami sediakan) dan klik **Run**.
5. Buka menu **Project Settings** -> **API**:
   - Salin **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - Salin **anon public key** (kunci untuk frontend)
   - Salin **service_role secret key** (kunci rahasia untuk backend / API saja).

---

## 💻 3. Kode Penghubung Frontend ke Database (`js/database-client.js`)

Tambahkan script Supabase di file HTML Anda:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Lalu buat file `js/database-client.js`:
```javascript
// Konfigurasi Kredensial Supabase
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Fungsi Menyimpan Permintaan Konsultasi / Leads
async function submitConsultationForm(formData) {
  const { data, error } = await db
    .from('consultations')
    .insert([{
      client_name: formData.name,
      client_email: formData.email,
      client_whatsapp: formData.whatsapp,
      company_name: formData.company,
      project_type: formData.projectType,
      budget_estimate: formData.budget,
      down_payment_estimate: formData.dp,
      requirements_note: formData.notes
    }])
    .select();

  if (error) {
    console.error("Gagal menyimpan ke database:", error);
    return { success: false, error };
  }
  return { success: true, data: data[0] };
}

// 2. Fungsi Menyimpan Transaksi Pembayaran QRIS / Invoice
async function recordQrisTransaction(trxData) {
  const { data, error } = await db
    .from('transactions')
    .insert([{
      trx_reference: trxData.referenceId,
      amount: trxData.amount,
      payment_method: 'QRIS',
      payment_status: 'settled',
      paid_at: new Date().toISOString(),
      receipt_email: trxData.email
    }])
    .select();

  return { success: !error, data, error };
}

// 3. Fungsi Kirim Email E-Kuitansi (Memanggil API Backend)
async function sendReceiptEmail(email, trxReference, amount) {
  const response = await fetch('/api/send-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, trxReference, amount })
  });
  return await response.json();
}
```

---

## ⚡ 4. Setup API Backend Serverless (`api/send-receipt.js`)
Jika Anda meng-hosting di Vercel atau Netlify, Anda dapat menggunakan serverless function sederhana dengan Node.js dan **Resend** (Layanan Email API gratis):

```javascript
// api/send-receipt.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, trxReference, amount } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'NexStack Studio <billing@nexstack.id>',
      to: [email],
      subject: `E-Kuitansi Resmi Pembayaran DP Proyek [${trxReference}]`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0b0e15;">PT NEXSTACK DIGITAL SOLUSI</h2>
          <p>Terima kasih! Pembayaran uang muka (DP) proyek Anda telah berhasil kami verifikasi.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Nomor Referensi:</strong> ${trxReference}</p>
          <p><strong>Nominal Dibayar:</strong> Rp ${Number(amount).toLocaleString('id-ID')}</p>
          <p><strong>Metode:</strong> QRIS Dinamis (Verified)</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">LUNAS (DP 50%)</span></p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 13px; color: #64748b;">Tim konsultan dan lead developer kami akan segera menghubungi Anda untuk kick-off sprint proyek.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
```

---

## 🌐 5. Cara Deploy Dari Nol Sampai Online (Gratis & 3 Menit)

### Opsi A: Drag & Drop via Vercel (Paling Mudah)
1. Buka [https://vercel.com](https://vercel.com) dan buat akun (Login via GitHub).
2. Install Vercel CLI (jika pakai terminal):
   ```bash
   npm i -g vercel
   vercel
   ```
   *Atau* cukup hubungkan repositori GitHub Anda dan klik **Deploy**.
3. Di dashboard Vercel, masuk ke **Settings** -> **Environment Variables**, tambahkan:
   - `SUPABASE_URL` = (URL Supabase Anda)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Kunci rahasia Supabase)
   - `RESEND_API_KEY` = (API key dari resend.com untuk kirim email)

### Opsi B: Cloudflare Pages / Netlify
1. Buka **Netlify.com** atau **Cloudflare Pages**.
2. Drag & drop folder ZIP Anda langsung ke dashboard.
3. Website langsung aktif dengan SSL HTTPS gratis dan domain instan (misal: `nexstack-studio.vercel.app`).
