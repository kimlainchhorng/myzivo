import { serve } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Duffel Destination Prices Edge Function
 * Fetches lowest one-way fares from a user's nearest airport to popular destinations.
 * Results cached in-memory for 6 hours.
 */

const DUFFEL_API_URL = 'https://api.duffel.com';

// In-memory cache
const priceCache = new Map<string, { data: Record<string, number | null>; expires: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Destination IATA codes
const DESTINATION_CODES: Record<string, string> = {
  miami: 'MIA',
  'las-vegas': 'LAS',
  'new-york': 'JFK',
  cancun: 'CUN',
  'los-angeles': 'LAX',
  // Cambodia destinations
  'siem-reap': 'REP',
  sihanoukville: 'KOS',
  kampot: 'PNH', // No airport in Kampot, use PNH
  battambang: 'PNH', // No airport, use PNH
  kep: 'PNH', // No airport, use PNH
};

async function fetchLowestFare(
  origin: string,
  destination: string,
  departureDate: string,
  apiKey: string
): Promise<number | null> {
  try {
    const response = await fetch(`${DUFFEL_API_URL}/air/offer_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date: departureDate }],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
          max_connections: 1,
        }
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    const offers = json.data?.offers || [];
    if (offers.length === 0) return null;

    const prices = offers
      .map((o: { total_amount: string }) => parseFloat(o.total_amount))
      .filter((p: number) => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : null;
  } catch {
    return null;
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { origin, destinations } = await req.json();

    if (!origin || !destinations || !Array.isArray(destinations)) {
      return new Response(JSON.stringify({ error: 'origin and destinations[] required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DUFFEL_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use a date ~14 days from now for better pricing
    const searchDate = new Date();
    searchDate.setDate(searchDate.getDate() + 14);
    const departureDate = searchDate.toISOString().split('T')[0];

    const cacheKey = `${origin}:${destinations.sort().join(',')}:${departureDate}`;
    const cached = priceCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify({ prices: cached.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all destination prices in parallel
    const results: Record<string, number | null> = {};
    const uniqueDestCodes = new Map<string, string[]>();

    // Group destinations by IATA code to avoid duplicate API calls
    for (const dest of destinations) {
      const code = DESTINATION_CODES[dest];
      if (!code) continue;
      if (!uniqueDestCodes.has(code)) uniqueDestCodes.set(code, []);
      uniqueDestCodes.get(code)!.push(dest);
    }

    const fetchPromises = Array.from(uniqueDestCodes.entries()).map(async ([code, destKeys]) => {
      if (code === origin) {
        // Same airport, skip
        for (const key of destKeys) results[key] = null;
        return;
      }
      const price = await fetchLowestFare(origin, code, departureDate, apiKey);
      for (const key of destKeys) results[key] = price;
    });

    await Promise.all(fetchPromises);

    // Cache results
    priceCache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify({ prices: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Destination prices error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
