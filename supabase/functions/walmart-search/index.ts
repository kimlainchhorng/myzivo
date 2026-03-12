/**
 * Walmart Product Search Edge Function
 * Proxies requests to RapidAPI Walmart endpoint (walmart-serp.php)
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

    // Build the correct walmart-serp.php URL
    const walmartUrl = `https://www.walmart.com/search?q=${encodeURIComponent(query)}&page=${page}`;
    const apiUrl = `https://${RAPID_API_HOST}/walmart-serp.php?url=${encodeURIComponent(walmartUrl)}`;

    console.log("[walmart-search] Query:", query, "| API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[walmart-search] API error [${response.status}]:`, body);
      throw new Error(`Walmart API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("[walmart-search] Raw response keys:", Object.keys(data));
    console.log("[walmart-search] Body keys:", data.body ? Object.keys(data.body) : "no body");

    // Response shape: { body: { products: [{ title, image, link, price: { currentPrice, originalPrice } }] } }
    const rawProducts = data.body?.products || data.products || [];
    console.log("[walmart-search] Raw products count:", rawProducts.length);
    if (rawProducts.length > 0) {
      console.log("[walmart-search] Sample product:", JSON.stringify(rawProducts[0]).slice(0, 500));
    }

    // Parse price string like "$3.48" or "3.48" to number
    const parsePrice = (p: any): number => {
      if (typeof p === "number") return p;
      if (typeof p === "string") {
        const cleaned = p.replace(/[^0-9.]/g, "");
        return parseFloat(cleaned) || 0;
      }
      if (p && typeof p === "object") {
        return parsePrice(p.currentPrice || p.current || p.price || 0);
      }
      return 0;
    };

    // Extract product ID from link like "/ip/Product-Name/12345"
    const extractId = (link: string): string => {
      if (!link) return crypto.randomUUID().slice(0, 12);
      const match = link.match(/\/(\d{5,})/);
      return match ? match[1] : crypto.randomUUID().slice(0, 12);
    };

    // Clean product name: remove trailing size+price junk
    const cleanName = (name: string): string => {
      if (!name) return "";
      // Remove everything from the first $ onward (price + unit price)
      let cleaned = name.replace(/\s*\$[\d.,]+.*$/, "");
      // Remove unit-price patterns like "3.8 ¢/fl oz" or "2.5¢/oz"
      cleaned = cleaned.replace(/\s*[\d.]+\s*¢\/[a-z\s]+$/i, "");
      // Remove trailing quantity patterns like "128 fl oz", "64 oz", "1 Gallon", "12 ct", "2 pk", "16.9 fl oz" etc.
      cleaned = cleaned.replace(/\s*,?\s*\d+(\.\d+)?\s*(fl\s*oz|oz|gal|gallon|ct|count|pk|pack|lb|lbs|ml|l|kg|g|pt|qt|each)\s*$/i, "");
      // Fix concatenated size like "Gallon128" → "Gallon"
      cleaned = cleaned.replace(/([a-zA-Z])(\d{2,})\s*$/, "$1");
      // Remove trailing commas, dashes, pipes
      cleaned = cleaned.replace(/[\s,\-|]+$/, "").trim();
      return cleaned;
    };

    // Extract brand: use API brand field, or first segment before comma in title
    const extractBrand = (item: any): string => {
      if (item.brand) return item.brand;
      if (item.brandName) return item.brandName;
      const title = item.title || item.name || "";
      const firstComma = title.indexOf(",");
      if (firstComma > 0 && firstComma < 40) {
        return title.slice(0, firstComma).trim();
      }
      return "";
    };

    const items = rawProducts.map((item: any) => ({
      productId: item.id || item.usItemId || item.product_id || extractId(item.link || ""),
      name: cleanName(item.title || item.name || ""),
      price: parsePrice(item.price),
      image: item.image || item.thumbnailImage || item.largeFrontImage || "",
      brand: extractBrand(item),
      rating: item.rating?.average ?? item.customerRating ?? item.ratings ?? null,
      inStock: true,
      store: "Walmart",
    }));

    console.log("[walmart-search] Mapped items count:", items.length);
    if (items.length > 0) {
      console.log("[walmart-search] Sample mapped:", JSON.stringify(items[0]));
    }

    return new Response(
      JSON.stringify({ products: items, totalCount: data.body?.totalCount || items.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[walmart-search] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
