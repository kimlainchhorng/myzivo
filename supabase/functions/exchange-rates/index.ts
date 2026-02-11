/**
 * Exchange Rates Edge Function
 * Fetches and caches daily FX rates relative to USD
 */

import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fallback rates if API fails (USD = 1.0)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  KRW: 1320.0,
  SGD: 1.34,
  THB: 35.5,
  KHR: 4100.0,
};

const SUPPORTED_CURRENCIES = Object.keys(FALLBACK_RATES);
const CACHE_TTL_HOURS = 24;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cached rates first
    const { data: cachedRates } = await supabase
      .from("exchange_rates")
      .select("*")
      .gte(
        "fetched_at",
        new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString()
      )
      .order("fetched_at", { ascending: false })
      .limit(SUPPORTED_CURRENCIES.length);

    // If we have fresh cached rates, return them
    if (cachedRates && cachedRates.length === SUPPORTED_CURRENCIES.length) {
      const rates: Record<string, number> = {};
      cachedRates.forEach((row: any) => {
        rates[row.target_currency] = row.rate;
      });

      return new Response(
        JSON.stringify({
          rates,
          cached: true,
          fetchedAt: cachedRates[0].fetched_at,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to fetch fresh rates from external API
    let freshRates: Record<string, number> = { ...FALLBACK_RATES };
    let fetchSuccess = false;

    try {
      // Using exchangerate-api.com (free tier: 1500 requests/month)
      // Alternative: frankfurter.app (free, no key needed)
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=USD"
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.rates) {
          freshRates.USD = 1.0;
          
          // Map API rates to our supported currencies
          for (const code of SUPPORTED_CURRENCIES) {
            if (code === "USD") continue;
            if (data.rates[code]) {
              freshRates[code] = data.rates[code];
            }
          }
          
          fetchSuccess = true;
        }
      }
    } catch (apiError) {
      console.error("FX API error:", apiError);
      // Continue with fallback rates
    }

    // Store rates in database
    const now = new Date().toISOString();
    const upsertData = SUPPORTED_CURRENCIES.map((code) => ({
      base_currency: "USD",
      target_currency: code,
      rate: freshRates[code] || FALLBACK_RATES[code] || 1.0,
      fetched_at: now,
    }));

    await supabase
      .from("exchange_rates")
      .upsert(upsertData, {
        onConflict: "base_currency,target_currency",
      });

    return new Response(
      JSON.stringify({
        rates: freshRates,
        cached: false,
        fetchedAt: now,
        source: fetchSuccess ? "api" : "fallback",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Exchange rates error:", error);

    // Return fallback rates on any error
    return new Response(
      JSON.stringify({
        rates: FALLBACK_RATES,
        cached: false,
        error: "Using fallback rates",
      }),
      {
        status: 200, // Still return 200 with fallback data
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
