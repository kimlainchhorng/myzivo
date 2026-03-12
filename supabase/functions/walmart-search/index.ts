/**
 * Walmart Product Search Edge Function
 * Proxies requests to RapidAPI Walmart endpoint
 * Never exposes API key to client
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPID_API_HOST = "walmart-api4.p.rapidapi.com";

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

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Walmart API error [${response.status}]: ${body}`);
      throw new Error(`Walmart API returned ${response.status}`);
    }

    const data = await response.json();

    // Normalize products into simplified objects
    const items = (data.items || data.products || []).map((item: any) => ({
      productId: item.id || item.usItemId || item.product_id || "",
      name: item.name || item.title || "",
      price: item.price?.current ?? item.salePrice ?? item.price ?? 0,
      image: item.image || item.thumbnailImage || item.largeFrontImage || "",
      brand: item.brand || item.brandName || "",
      rating: item.rating?.average ?? item.customerRating ?? null,
      inStock: item.availabilityStatusV2?.value !== "OUT_OF_STOCK",
    }));

    return new Response(
      JSON.stringify({ products: items, totalCount: data.totalCount || items.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Walmart search error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
