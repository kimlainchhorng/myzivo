const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PACKAGE_NAME = "com.myzivo.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, nonce } = await req.json();

    if (!token || !nonce) {
      return new Response(JSON.stringify({ error: "token and nonce are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_PLAY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyRes = await fetch(
      `https://playintegrity.googleapis.com/v1/${PACKAGE_NAME}:decodeIntegrityToken?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrity_token: token }),
      }
    );

    const verdict = await verifyRes.json();
    const tokenPayload = verdict.tokenPayloadExternal;

    if (!tokenPayload) {
      return new Response(JSON.stringify({ passed: false, error: "Invalid token" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appVerdict = tokenPayload.appIntegrity?.appRecognitionVerdict;
    const deviceVerdict = tokenPayload.deviceIntegrity?.deviceRecognitionVerdict ?? [];
    const returnedNonce = tokenPayload.requestDetails?.nonce;

    const passed =
      returnedNonce === nonce &&
      appVerdict === "PLAY_RECOGNIZED" &&
      (deviceVerdict.includes("MEETS_DEVICE_INTEGRITY") ||
        deviceVerdict.includes("MEETS_STRONG_INTEGRITY"));

    return new Response(JSON.stringify({ passed, appVerdict, deviceVerdict }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
