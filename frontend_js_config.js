// =========================================================================
// NexStack Studio - Frontend Configuration
// File: frontend/js/config.js
// =========================================================================

const CONFIG = {
  // Ganti dengan URL & Anon Key Supabase Anda di dashboard Supabase -> Project Settings -> API
  SUPABASE_URL: window.ENV_SUPABASE_URL || "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-public-key",
  
  // Endpoint API Backend
  API_BASE_URL: window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "/api"
    : "/api",
    
  APP_NAME: "NexStack Studio",
  CONTACT_WHATSAPP: "+6281289007210",
  SUPPORT_EMAIL: "hello@nexstack.studio"
};

if (typeof window !== "undefined") {
  window.NEXSTACK_CONFIG = CONFIG;
}
