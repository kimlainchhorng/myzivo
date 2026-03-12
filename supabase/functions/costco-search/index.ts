/**
 * Costco Product Search Edge Function
 * Proxies requests to RapidAPI Real-Time Costco Data endpoint
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPID_API_HOST = "real-time-costco-data.p.rapidapi.com";

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

    const apiUrl = `https://${RAPID_API_HOST}/search?query=${encodeURIComponent(query)}&page=${page}&country=us`;

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

    const rawProducts = data.products || data.data?.products || data.data || [];
    console.log("[costco-search] Raw products count:", rawProducts.length);
    if (rawProducts.length > 0) {
      console.log("[costco-search] Sample product keys:", Object.keys(rawProducts[0]).slice(0, 15));
    }

    const parsePrice = (item: any): number => {
      // Try various Costco price fields
      const price =
        item.item_location_pricing_salePrice ??
        item.item_location_pricing_listPrice ??
        item.item_location_pricing_pricePerUnit_price ??
        item.minSalePrice ??
        item.maxSalePrice ??
        0;
      if (typeof price === "number") return price;
      if (typeof price === "string") {
        const cleaned = price.replace(/[^0-9.]/g, "");
        return parseFloat(cleaned) || 0;
      }
      return 0;
    };

    const decodeHtml = (str: string): string => {
      return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    };

    const items = rawProducts.map((item: any) => ({
      productId: item.item_number || item.group_id || item.id || crypto.randomUUID().slice(0, 12),
      name: item.item_product_name || item.name || item.description || "",
      price: parsePrice(item),
      image: decodeHtml(item.image || item.item_collateral_primaryimage || item.item_product_primary_image || ""),
      brand: (item.Brand_attr && item.Brand_attr[0]) || "",
      rating: item.item_ratings ?? null,
      inStock: item.isItemInStock !== false && item.deliveryStatus !== "out of stock",
      store: "Costco",
    }));

    console.log("[costco-search] Mapped items count:", items.length);

    return new Response(
      JSON.stringify({ products: items, totalCount: data.total_products || items.length }),
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
