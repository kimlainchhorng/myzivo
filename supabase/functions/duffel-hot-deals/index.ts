import { serve } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Duffel Hot Deals Edge Function
 * 
 * Searches multiple popular routes across flexible dates (7, 14, 21, 30 days out)
 * to find the cheapest real deals. Returns sorted by savings/price.
 * Results cached in-memory for 4 hours.
 */

const DUFFEL_API_URL = 'https://api.duffel.com';

const dealCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// Popular deal routes from major US hubs
const DEAL_ROUTES = [
  { origin: 'JFK', destination: 'MIA', destName: 'Miami', destKey: 'miami' },
  { origin: 'JFK', destination: 'CUN', destName: 'Cancún', destKey: 'cancun' },
  { origin: 'LAX', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas' },
  { origin: 'ORD', destination: 'MCO', destName: 'Orlando', destKey: 'orlando' },
  { origin: 'ATL', destination: 'SAN', destName: 'San Diego', destKey: 'san-diego' },
  { origin: 'DFW', destination: 'SFO', destName: 'San Francisco', destKey: 'san-francisco' },
  { origin: 'MSY', destination: 'MIA', destName: 'Miami', destKey: 'miami' },
  { origin: 'MSY', destination: 'CUN', destName: 'Cancún', destKey: 'cancun' },
  { origin: 'MSY', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas' },
  { origin: 'MSY', destination: 'MCO', destName: 'Orlando', destKey: 'orlando' },
  { origin: 'MSY', destination: 'ATL', destName: 'Atlanta', destKey: 'atlanta' },
  { origin: 'MSY', destination: 'DFW', destName: 'Dallas', destKey: 'dallas' },
];

interface DealResult {
  origin: string;
  originCode: string;
  destination: string;
  destinationKey: string;
  destinationCode: string;
  price: number;
  departureDate: string;
  airline: string;
  airlineLogo: string | null;
  stops: number;
  duration: string;
}

async function searchRoute(
  origin: string,
  destination: string,
  departureDate: string,
  apiKey: string
): Promise<{ price: number; airline: string; airlineLogo: string | null; stops: number; duration: string } | null> {
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

    // Find cheapest offer
    let cheapest = offers[0];
    for (const o of offers) {
      if (parseFloat(o.total_amount) < parseFloat(cheapest.total_amount)) {
        cheapest = o;
      }
    }

    const slice = cheapest.slices?.[0];
    const segments = slice?.segments || [];
    const carrier = cheapest.owner || segments[0]?.operating_carrier || {};
    
    // Calculate duration
    const totalMinutes = segments.reduce((acc: number, seg: { duration?: string }) => {
      if (!seg.duration) return acc;
      const match = seg.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return acc;
      return acc + (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0');
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const duration = `${hours}h ${mins}m`;

    return {
      price: parseFloat(cheapest.total_amount),
      airline: carrier.name || 'Airline',
      airlineLogo: carrier.logo_symbol_url || carrier.logo_lockup_url || null,
      stops: Math.max(0, segments.length - 1),
      duration,
    };
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
    const body = await req.json().catch(() => ({}));
    const userOrigin = body.origin as string | undefined;

    const apiKey = Deno.env.get('DUFFEL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DUFFEL_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = `deals:${userOrigin || 'all'}`;
    const cached = dealCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter routes based on user origin if provided
    let routes = DEAL_ROUTES;
    if (userOrigin) {
      routes = routes.filter(r => r.origin === userOrigin);
      // If no routes match, use all routes
      if (routes.length === 0) routes = DEAL_ROUTES;
    }

    // Search across 3 flexible dates
    const datesToCheck = [7, 14, 21].map(daysOut => {
      const d = new Date();
      d.setDate(d.getDate() + daysOut);
      return d.toISOString().split('T')[0];
    });

    const deals: DealResult[] = [];
    const seen = new Set<string>();

    // Limit parallel requests to avoid rate limiting (pick 6 routes max)
    const selectedRoutes = routes.slice(0, 6);

    const promises = selectedRoutes.flatMap(route =>
      datesToCheck.map(async (date) => {
        const result = await searchRoute(route.origin, route.destination, date, apiKey);
        if (!result) return;

        const dedupKey = `${route.origin}-${route.destination}`;
        // Keep cheapest per route
        if (seen.has(dedupKey)) {
          const existing = deals.find(d => d.originCode === route.origin && d.destinationCode === route.destination);
          if (existing && existing.price <= result.price) return;
          // Replace with cheaper
          const idx = deals.indexOf(existing!);
          if (idx >= 0) deals.splice(idx, 1);
        }
        seen.add(dedupKey);

        deals.push({
          origin: route.origin,
          originCode: route.origin,
          destination: route.destName,
          destinationKey: route.destKey,
          destinationCode: route.destination,
          price: result.price,
          departureDate: date,
          airline: result.airline,
          airlineLogo: result.airlineLogo,
          stops: result.stops,
          duration: result.duration,
        });
      })
    );

    await Promise.all(promises);

    // Sort by price ascending
    deals.sort((a, b) => a.price - b.price);

    const responseData = { deals: deals.slice(0, 8) };
    dealCache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Hot deals error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
