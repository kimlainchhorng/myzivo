// Shared CORS helper (re-export pattern). Many functions in this project define
// their own copy; this is the canonical version for the new device-link suite.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
