/**
 * Costco Product Search Edge Function
 * Proxies requests to RapidAPI Costco endpoint
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPID_API_HOST = "costco-api2.p.rapidapi.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPID_API_KEY = Deno.env.get("RAPID_API_KEY");
    if (!RAPID_API_KEY) {
      throw new Error("RAPID_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const page = url.searchParams.get("page") || "1";

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Query parameter 'q' is required (min 2 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = `https://${RAPID_API_HOST}/search?query=${encodeURIComponent(query)}&page=${page}`;

    console.log("[costco-search] Query:", query, "| API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[costco-search] API error [${response.status}]:`, body);
      throw new Error(`Costco API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("[costco-search] Raw response keys:", Object.keys(data));

    // Normalize: try common response shapes
    const rawProducts = data.products || data.results || data.items || data.body?.products || [];
    console.log("[costco-search] Raw products count:", rawProducts.length);
    if (rawProducts.length > 0) {
      console.log("[costco-search] Sample product:", JSON.stringify(rawProducts[0]).slice(0, 500));
    }

    const parsePrice = (p: any): number => {
      if (typeof p === "number") return p;
      if (typeof p === "string") {
        const cleaned = p.replace(/[^0-9.]/g, "");
        return parseFloat(cleaned) || 0;
      }
      if (p && typeof p === "object") {
        return parsePrice(p.currentPrice || p.current || p.price || p.value || 0);
      }
      return 0;
    };

    const items = rawProducts.map((item: any) => ({
      productId: item.id || item.productId || item.product_id || crypto.randomUUID().slice(0, 12),
      name: item.title || item.name || item.productName || "",
      price: parsePrice(item.price),
      image: item.image || item.thumbnail || item.img || item.imageUrl || "",
      brand: item.brand || item.brandName || "",
      rating: item.rating?.average ?? item.rating ?? null,
      inStock: item.inStock !== false,
      store: "Costco",
    }));

    console.log("[costco-search] Mapped items count:", items.length);

    return new Response(
      JSON.stringify({ products: items, totalCount: items.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[costco-search] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
