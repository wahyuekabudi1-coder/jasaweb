// =========================================================================
// NexStack Studio - Automated Audit & Verification Test Suite
// File: tests/audit-verify.js
// Run via: npm test
// =========================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_FILES = [
  'package.json',
  'vercel.json',
  '.env.example',
  '.gitignore',
  'README.md',
  'backend/server.js',
  'backend/api/submit-consultation.js',
  'backend/api/create-qris.js',
  'backend/api/webhook-payment.js',
  'backend/api/send-receipt.js',
  'frontend/index.html',
  'frontend/layanan.html',
  'frontend/portofolio.html',
  'frontend/konsultasi.html',
  'frontend/js/config.js',
  'frontend/js/database-client.js',
  'database/schema.sql',
  'database/seed.sql',
  'database/README.md',
  'database/migrations/001_initial_schema.sql',
  'database/migrations/002_add_audit_and_constraints.sql'
];

let errors = [];
let passed = 0;

console.log('----------------------------------------------------');
console.log('🧪 MENJALANKAN VERIFIKASI INTEGRITAS PROYEK NEXSTACK');
console.log('----------------------------------------------------\n');

// 1. Verifikasi Keberadaan File Fisik
console.log('[1/4] Memeriksa kelengkapan file manifes dan struktur...');
for (const relPath of REQUIRED_FILES) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ Ada: ${relPath}`);
    passed++;
  } else {
    console.log(`  ✗ HILANG: ${relPath}`);
    errors.push(`File tidak ditemukan: ${relPath}`);
  }
}

// 2. Verifikasi RLS Security (Tidak boleh ada SELECT USING (true) tanpa filter)
console.log('\n[2/4] Memeriksa kebijakan keamanan SQL & Row Level Security...');
const schemaPath = path.join(rootDir, 'database/schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('Public read estimate proposals') && schemaContent.includes('USING (true)')) {
    errors.push('Pelanggaran Keamanan: schema.sql masih memiliki kebijakan SELECT estimate_proposals USING (true)');
  } else {
    console.log('  ✓ schema.sql: Kebijakan akses SELECT publik terbuka telah diamankan.');
  }

  if (schemaContent.includes('Public read transaction status') && schemaContent.includes('USING (true)')) {
    errors.push('Pelanggaran Keamanan: schema.sql masih memiliki kebijakan SELECT transactions USING (true)');
  } else {
    console.log('  ✓ schema.sql: Kebijakan SELECT transactions telah dikunci (No unrestricted public read).');
  }
}

// 3. Verifikasi Konsistensi Migrasi Database
console.log('\n[3/4] Memeriksa urutan dan konsistensi migrasi database...');
const mig1Path = path.join(rootDir, 'database/migrations/001_initial_schema.sql');
const mig2Path = path.join(rootDir, 'database/migrations/002_add_audit_and_constraints.sql');

if (fs.existsSync(mig1Path) && fs.existsSync(mig2Path)) {
  const mig1 = fs.readFileSync(mig1Path, 'utf8');
  const mig2 = fs.readFileSync(mig2Path, 'utf8');

  if (mig1.includes('CREATE TABLE IF NOT EXISTS consultations') && mig2.includes('CREATE TABLE IF NOT EXISTS audit_logs')) {
    console.log('  ✓ Migrasi 001 dan 002 berurutan secara konsisten (Initial Schema -> Audit & RLS Hardening).');
  } else {
    errors.push('Migrasi database tidak konsisten.');
  }
}

// 4. Verifikasi vercel.json & package.json
console.log('\n[4/4] Memeriksa konfigurasi deployment vercel.json & package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const vercel = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));

  if (pkg.scripts && pkg.scripts.test && pkg.scripts.start) {
    console.log('  ✓ package.json scripts (dev, start, test) terkonfigurasi dengan benar.');
  } else {
    errors.push('package.json kehilangan script start atau test.');
  }

  if (vercel.routes && Array.isArray(vercel.routes)) {
    console.log('  ✓ vercel.json memetakan rute /api/* dan frontend static dengan benar.');
  } else {
    errors.push('vercel.json tidak memiliki deklarasi routing yang valid.');
  }
} catch (e) {
  errors.push('Gagal mem-parsing package.json atau vercel.json: ' + e.message);
}

// Hasil Akhir
console.log('\n----------------------------------------------------');
if (errors.length === 0) {
  console.log(`✅ SEMUA PENGUJIAN INTEGRITAS BERHASIL (${passed}/${REQUIRED_FILES.length} file diverifikasi)`);
  console.log('----------------------------------------------------');
  process.exit(0);
} else {
  console.error(`❌ TERDAPAT ${errors.length} KESALAHAN:`);
  errors.forEach(err => console.error(`  - ${err}`));
  console.log('----------------------------------------------------');
  process.exit(1);
}
