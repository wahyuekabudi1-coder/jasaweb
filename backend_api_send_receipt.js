// =========================================================================
// Backend API: send-receipt.js
// Endpoint: POST /api/send-receipt
// Deskripsi: Pengiriman e-kuitansi otomatis via Resend email API
// =========================================================================

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'billing@nexstack.studio';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Gunakan POST.' });
  }

  try {
    const { trxReference, email, amount } = req.body || {};

    if (!trxReference) {
      return res.status(400).json({ success: false, error: 'Nomor referensi transaksi wajib disertakan.' });
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Alamat email tujuan tidak valid.' });
    }

    if (!RESEND_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'RESEND_API_KEY belum diatur di environment variable (.env).' 
      });
    }

    const resend = new Resend(RESEND_API_KEY);
    const formattedAmount = Number(amount || 0).toLocaleString('id-ID');

    // Kirim email via Resend SDK
    const emailResult = await resend.emails.send({
      from: `NexStack Studio <${EMAIL_FROM}>`,
      to: [email.trim().toLowerCase()],
      subject: `[Kuitansi Resmi] Pembayaran DP Proyek NexStack Studio (${trxReference})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0e15; color: #f1f5f9; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
          <div style="border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: bold; color: #00f0ff;">NexStack.studio</span>
            <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">PT NexStack Digital Solusi — Rekayasa Perangkat Lunak Full-Stack</p>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">Bukti Pembayaran Uang Muka (DP 50%)</h2>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Terima kasih. Pembayaran uang muka proyek Anda telah kami verifikasi dengan sukses. Detail transaksi:</p>
          
          <div style="background: #10131a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Nomor Referensi</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #00f0ff; text-align: right;">${trxReference}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Nominal Pembayaran</td>
                <td style="padding: 8px 0; font-weight: bold; color: #ffffff; text-align: right;">Rp ${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Metode Pembayaran</td>
                <td style="padding: 8px 0; color: #ffffff; text-align: right;">QRIS Dinamis (Verified)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Status Transaksi</td>
                <td style="padding: 8px 0; text-align: right;"><span style="background: #064e3b; color: #34d399; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold;">SETTLED / LUNAS DP</span></td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">Tim Lead Architect kami akan segera menghubungi Anda dalam waktu 1x24 jam untuk penjadwalan sprint kick-off dan serah terima roadmap teknis.</p>
          
          <div style="border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center;">
            &copy; ${new Date().getFullYear()} NexStack Studio. Hak Cipta Dilindungi Undang-Undang.<br/>
            One Pacific Plaza Lv.12, Mega Kuningan, Jakarta Selatan.
          </div>
        </div>
      `
    });

    // Perbarui status email_sent_at jika database tersedia
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        await supabase
          .from('transactions')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('trx_reference', trxReference);
      } catch (dbErr) {
        console.warn('[Update email_sent_at warning]', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'E-kuitansi resmi berhasil dikirim ke ' + email,
      emailId: emailResult?.data?.id || null
    });

  } catch (err) {
    console.error('[Send Receipt Exception]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
