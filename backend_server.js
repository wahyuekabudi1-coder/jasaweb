// =========================================================================
// NexStack Studio - Express Development / Standalone Server
// File: backend/server.js
// Deskripsi: Server runtime lokal untuk menjalankan API & static frontend
// =========================================================================

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Import Handler Wrapper for Serverless Vercel Functions
const wrapHandler = (modulePath) => async (req, res) => {
  try {
    const handlerModule = await import(modulePath);
    return await handlerModule.default(req, res);
  } catch (err) {
    console.error(`[Server Route Error ${req.path}]`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// 1. API Endpoints
app.post('/api/submit-consultation', wrapHandler('./api/submit-consultation.js'));
app.post('/api/create-qris', wrapHandler('./api/create-qris.js'));
app.post('/api/webhook-payment', wrapHandler('./api/webhook-payment.js'));
app.post('/api/send-receipt', wrapHandler('./api/send-receipt.js'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NexStack Studio API Gateway'
  });
});

// 2. Serve Static Frontend Files
app.use('/js', express.static(path.join(rootDir, 'frontend', 'js')));
app.use(express.static(path.join(rootDir, 'frontend')));

// Routing Rewrites
app.get('/layanan', (req, res) => {
  res.sendFile(path.join(rootDir, 'frontend', 'layanan.html'));
});

app.get('/portofolio', (req, res) => {
  res.sendFile(path.join(rootDir, 'frontend', 'portofolio.html'));
});

app.get('/konsultasi', (req, res) => {
  res.sendFile(path.join(rootDir, 'frontend', 'konsultasi.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'frontend', 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 NexStack Studio Server Aktif di http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

export default app;
