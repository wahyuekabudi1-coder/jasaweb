// =========================================================================
// NexStack Studio - Database Client & API Connector
// File: frontend/js/database-client.js
// =========================================================================

(function(window) {
  const config = window.NEXSTACK_CONFIG || {
    API_BASE_URL: "/api",
    SUPABASE_URL: "",
    SUPABASE_ANON_KEY: ""
  };

  const NexStackDB = {
    /**
     * Mengirim data formulir konsultasi ke backend serverless API
     * Melakukan sanitasi & enkapsulasi di sisi server
     */
    async submitConsultation(payload) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/submit-consultation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal menyimpan permintaan konsultasi");
        }

        return { success: true, data: result };
      } catch (err) {
        console.error("[NexStackDB Client] Submit Consultation Error:", err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Meminta pembuatan transaksi QRIS dinamis resmi ke backend
     */
    async createQrisTransaction(proposalNumber, amount, email) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/create-qris`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            proposalNumber,
            amount,
            customerEmail: email
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal membuat invoice QRIS");
        }

        return { success: true, data: result };
      } catch (err) {
        console.error("[NexStackDB Client] Create QRIS Error:", err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Meminta pengiriman e-kuitansi resmi ke email pelanggan via backend Resend
     */
    async requestReceiptEmail(trxReference, email, amount) {
      try {
        const response = await fetch(`${config.API_BASE_URL}/send-receipt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            trxReference,
            email,
            amount
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Gagal mengirimkan e-kuitansi ke email");
        }

        return { success: true, data: result };
      } catch (err) {
        console.error("[NexStackDB Client] Send Receipt Error:", err);
        return { success: false, error: err.message };
      }
    }
  };

  window.NexStackDB = NexStackDB;
})(window);
