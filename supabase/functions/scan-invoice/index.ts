// Scan invoice/receipt image with Lovable AI Gateway (Gemini vision)
// Returns structured invoice JSON: vendor, invoice_number, date, time, payment_method, items[], totals.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an OCR + invoice parser. The user uploads a photo of a receipt/invoice from an auto-parts vendor (e.g. AutoZone, NAPA, O'Reilly, Advance Auto Parts) or a service vendor.
Extract a STRICT JSON object with these fields. Money values must be integers in cents. Quantity is a number. If a value is not present, use null (not empty string).
For AutoZone Commercial Invoice photos, prefer these mappings: vendor = AutoZone, invoice_number = the "Invoice Number" value under Order Information, date/time = "Order Date", payment_method = CASH/CARD shown near the bottom, subtotal/tax/total = bottom summary, item name = Description, part_number = Part #, quantity = QTY, unit_price_cents = Cost when shown, line_total_cents = Total.
Never return an empty item if a bottom total exists; create one line item from the invoice total/subtotal when the item table is partially unreadable.
{
  "vendor": string|null,            // company/store name e.g. "AutoZone"
  "invoice_number": string|null,    // invoice / receipt # / order #
  "date": string|null,              // YYYY-MM-DD
  "time": string|null,              // HH:MM in 24h
  "payment_method": "cash"|"card"|"check"|"aba"|"other"|null,
  "subtotal_cents": number|null,
  "tax_cents": number|null,
  "total_cents": number|null,
  "items": [
    {
      "part_number": string|null,
      "name": string,
      "quantity": number,
      "unit_price_cents": number,
      "line_total_cents": number
    }
  ]
}
Use the use_invoice_data tool to return the result. Do NOT include any prose.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { image_url, image_base64, mime_type } = await req.json();
    if (!image_url && !image_base64) {
      return new Response(JSON.stringify({ error: "image_url or image_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeMime = (typeof mime_type === "string" && mime_type.startsWith("image/")) ? mime_type : "image/jpeg";
    const imagePayload = image_url ? image_url : `data:${safeMime};base64,${image_base64}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the invoice data from this image." },
              { type: "image_url", image_url: { url: imagePayload } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "use_invoice_data",
              description: "Return the extracted invoice data.",
              parameters: {
                type: "object",
                properties: {
                  vendor: { type: ["string", "null"] },
                  invoice_number: { type: ["string", "null"] },
                  date: { type: ["string", "null"] },
                  time: { type: ["string", "null"] },
                  payment_method: { type: ["string", "null"], enum: ["cash", "card", "check", "aba", "other", null] },
                  subtotal_cents: { type: ["integer", "null"] },
                  tax_cents: { type: ["integer", "null"] },
                  total_cents: { type: ["integer", "null"] },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        part_number: { type: ["string", "null"] },
                        name: { type: "string" },
                        quantity: { type: "number" },
                        unit_price_cents: { type: "integer" },
                        line_total_cents: { type: "integer" },
                      },
                      required: ["name", "quantity", "unit_price_cents", "line_total_cents"],
                    },
                  },
                },
                required: ["items"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "use_invoice_data" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argStr = toolCall?.function?.arguments;
    if (!argStr) {
      return new Response(JSON.stringify({ error: "Could not parse invoice", raw: data }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any = {};
    try { parsed = JSON.parse(argStr); } catch { parsed = {}; }

    return new Response(JSON.stringify({ success: true, invoice: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scan-invoice error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
