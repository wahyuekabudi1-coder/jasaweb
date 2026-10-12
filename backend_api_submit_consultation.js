// =========================================================================
// Backend API: submit-consultation.js
// Endpoint: POST /api/submit-consultation
// Deskripsi: Validasi ketat, sanitasi, dan penyimpanan form konsultasi/booking ke database
// =========================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Gunakan POST.'
    });
  }

  try {
    const {
      name,
      email,
      whatsapp,
      company,
      projectType,
      targetTimeline,
      budgetEstimate,
      downPaymentEstimate,
      features,
      requirementsNote
    } = req.body || {};

    // 1. Validasi Input Server-Side
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nama klien wajib diisi (minimal 2 karakter).' });
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
    }

    if (!whatsapp || whatsapp.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Nomor WhatsApp wajib diisi (minimal 8 digit).' });
    }

    // Sanitasi data numerik
    const parsedBudget = Number(budgetEstimate) || 0;
    const parsedDp = Number(downPaymentEstimate) || Math.round(parsedBudget * 0.5);

    // 2. Hubungkan ke Database via Supabase Service Client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Konfigurasi server database (SUPABASE_URL / KEY) belum diatur di .env.'
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 3. Insert ke Tabel `consultations`
    const { data: consultation, error: insertError } = await supabase
      .from('consultations')
      .insert([
        {
          client_name: name.trim(),
          client_email: email.trim().toLowerCase(),
          client_whatsapp: whatsapp.trim(),
          company_name: company ? company.trim() : null,
          project_type: projectType || 'custom_web_app',
          target_timeline: targetTimeline || '4 - 8 Minggu',
          budget_estimate: parsedBudget,
          down_payment_estimate: parsedDp,
          project_features: Array.isArray(features) ? features : [],
          requirements_note: requirementsNote ? requirementsNote.trim() : '',
          status: 'new',
          ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
          user_agent: req.headers['user-agent'] || null
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('[DB Insert Error]', insertError);
      return res.status(500).json({
        success: false,
        error: 'Gagal menyimpan data konsultasi ke database: ' + insertError.message
      });
    }

    // 4. Buat Nomor Proposal Otomatis (NX-2025-EST-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const proposalNumber = `NX-${new Date().getFullYear()}-EST-${randomSuffix}`;

    const { data: proposal, error: proposalError } = await supabase
      .from('estimate_proposals')
      .insert([
        {
          proposal_number: proposalNumber,
          consultation_id: consultation.id,
          total_amount: parsedBudget,
          dp_amount: parsedDp,
          remaining_amount: parsedBudget - parsedDp,
          selected_tech_stack: ['PostgreSQL', 'Tailwind CSS', 'Node.js API', 'Supabase BaaS'],
          warranty_period_months: 3
        }
      ])
      .select()
      .single();

    if (proposalError) {
      console.warn('[Proposal Insert Warning]', proposalError.message);
    }

    // 5. Response Sukses
    return res.status(201).json({
      success: true,
      message: 'Permintaan konsultasi berhasil disimpan ke database.',
      consultationId: consultation.id,
      proposalNumber: proposal ? proposal.proposal_number : proposalNumber,
      clientName: consultation.client_name,
      createdAt: consultation.created_at
    });

  } catch (err) {
    console.error('[API Server Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan internal server: ' + err.message
    });
  }
}
