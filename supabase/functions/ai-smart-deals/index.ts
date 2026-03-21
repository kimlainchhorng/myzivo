import { serve } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * AI Smart Deal Finder Edge Function
 * Uses Duffel API for real flight deals + Lovable AI for smart descriptions.
 */

const DUFFEL_API_URL = 'https://api.duffel.com';
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000;

interface SmartDeal {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  destinationKey: string;
  price: number;
  departureDate: string;
  returnDate: string | null;
  airline: string;
  airlineLogo: string | null;
  stops: number;
  duration: string;
  aiDescription: string;
  aiTip: string;
  dealScore: number;
  dealTag: string;
  savingsPercent: number;
  category: 'beach' | 'city' | 'adventure' | 'culture' | 'nightlife' | 'family';
}

// Expanded routes with categories
const SMART_ROUTES = [
  // Beach destinations
  { origin: 'JFK', destination: 'MIA', destName: 'Miami', destKey: 'miami', category: 'beach' as const },
  { origin: 'JFK', destination: 'CUN', destName: 'Cancún', destKey: 'cancun', category: 'beach' as const },
  { origin: 'JFK', destination: 'SJU', destName: 'San Juan', destKey: 'san-juan', category: 'beach' as const },
  { origin: 'JFK', destination: 'FLL', destName: 'Fort Lauderdale', destKey: 'fort-lauderdale', category: 'beach' as const },
  { origin: 'JFK', destination: 'TPA', destName: 'Tampa', destKey: 'tampa', category: 'beach' as const },
  { origin: 'LAX', destination: 'HNL', destName: 'Honolulu', destKey: 'honolulu', category: 'beach' as const },
  { origin: 'ATL', destination: 'FLL', destName: 'Fort Lauderdale', destKey: 'fort-lauderdale', category: 'beach' as const },
  { origin: 'ATL', destination: 'SAN', destName: 'San Diego', destKey: 'san-diego', category: 'beach' as const },
  { origin: 'BOS', destination: 'MIA', destName: 'Miami', destKey: 'miami', category: 'beach' as const },
  { origin: 'BOS', destination: 'FLL', destName: 'Fort Lauderdale', destKey: 'fort-lauderdale', category: 'beach' as const },
  { origin: 'ORD', destination: 'CUN', destName: 'Cancún', destKey: 'cancun', category: 'beach' as const },
  { origin: 'MIA', destination: 'SJU', destName: 'San Juan', destKey: 'san-juan', category: 'beach' as const },
  { origin: 'MIA', destination: 'CUN', destName: 'Cancún', destKey: 'cancun', category: 'beach' as const },
  { origin: 'SEA', destination: 'HNL', destName: 'Honolulu', destKey: 'honolulu', category: 'beach' as const },
  { origin: 'MSY', destination: 'MIA', destName: 'Miami', destKey: 'miami', category: 'beach' as const },
  { origin: 'MSY', destination: 'CUN', destName: 'Cancún', destKey: 'cancun', category: 'beach' as const },
  // City destinations
  { origin: 'DFW', destination: 'SFO', destName: 'San Francisco', destKey: 'san-francisco', category: 'city' as const },
  { origin: 'SEA', destination: 'LAX', destName: 'Los Angeles', destKey: 'los-angeles', category: 'city' as const },
  { origin: 'MSY', destination: 'ATL', destName: 'Atlanta', destKey: 'atlanta', category: 'city' as const },
  { origin: 'MSY', destination: 'DFW', destName: 'Dallas', destKey: 'dallas', category: 'city' as const },
  { origin: 'ORD', destination: 'SEA', destName: 'Seattle', destKey: 'seattle', category: 'city' as const },
  { origin: 'DFW', destination: 'AUS', destName: 'Austin', destKey: 'austin', category: 'city' as const },
  { origin: 'ATL', destination: 'CLT', destName: 'Charlotte', destKey: 'charlotte', category: 'city' as const },
  { origin: 'BOS', destination: 'DCA', destName: 'Washington DC', destKey: 'washington', category: 'city' as const },
  { origin: 'JFK', destination: 'ORD', destName: 'Chicago', destKey: 'chicago', category: 'city' as const },
  { origin: 'LAX', destination: 'PDX', destName: 'Portland', destKey: 'portland', category: 'city' as const },
  { origin: 'ORD', destination: 'MSP', destName: 'Minneapolis', destKey: 'minneapolis', category: 'city' as const },
  // Nightlife destinations
  { origin: 'LAX', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  { origin: 'DFW', destination: 'BNA', destName: 'Nashville', destKey: 'nashville', category: 'nightlife' as const },
  { origin: 'MSY', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  { origin: 'ATL', destination: 'MSY', destName: 'New Orleans', destKey: 'new-orleans', category: 'nightlife' as const },
  { origin: 'ORD', destination: 'BNA', destName: 'Nashville', destKey: 'nashville', category: 'nightlife' as const },
  { origin: 'ORD', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  // Family destinations
  { origin: 'ORD', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'MSY', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'JFK', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'BOS', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'ATL', destination: 'TPA', destName: 'Tampa', destKey: 'tampa', category: 'family' as const },
  // Adventure destinations
  { origin: 'ORD', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  { origin: 'DEN', destination: 'PHX', destName: 'Phoenix', destKey: 'phoenix', category: 'adventure' as const },
  { origin: 'DEN', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'adventure' as const },
  { origin: 'DFW', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  { origin: 'SEA', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  // Culture destinations
  { origin: 'JFK', destination: 'CDG', destName: 'Paris', destKey: 'paris', category: 'culture' as const },
  { origin: 'JFK', destination: 'BCN', destName: 'Barcelona', destKey: 'barcelona', category: 'culture' as const },
  { origin: 'LAX', destination: 'BOS', destName: 'Boston', destKey: 'boston', category: 'culture' as const },
  { origin: 'MSY', destination: 'CLT', destName: 'Charlotte', destKey: 'charlotte', category: 'culture' as const },
  { origin: 'DEN', destination: 'AUS', destName: 'Austin', destKey: 'austin', category: 'culture' as const },
];

// Average prices for savings calculation
const AVG_PRICES: Record<string, number> = {
  'JFK-MIA': 220, 'JFK-CUN': 380, 'JFK-SJU': 280, 'JFK-FLL': 200, 'JFK-TPA': 210,
  'JFK-MCO': 190, 'JFK-CDG': 650, 'JFK-BCN': 600, 'JFK-ORD': 180,
  'LAX-LAS': 120, 'LAX-HNL': 450, 'LAX-SFO': 140, 'LAX-PDX': 160, 'LAX-SEA': 170, 'LAX-CUN': 400, 'LAX-BOS': 280,
  'ORD-MCO': 200, 'ORD-MIA': 230, 'ORD-DEN': 180, 'ORD-LAS': 200, 'ORD-MSP': 120, 'ORD-BNA': 150, 'ORD-SEA': 240, 'ORD-CUN': 350,
  'ATL-SAN': 280, 'ATL-FLL': 180, 'ATL-TPA': 160, 'ATL-MSY': 140, 'ATL-CUN': 320, 'ATL-CLT': 100,
  'DFW-SFO': 250, 'DFW-MIA': 250, 'DFW-LAS': 180, 'DFW-AUS': 120, 'DFW-DEN': 170, 'DFW-BNA': 160,
  'MSY-MIA': 180, 'MSY-CUN': 320, 'MSY-LAS': 250, 'MSY-MCO': 160, 'MSY-ATL': 130, 'MSY-DFW': 140, 'MSY-CLT': 190,
  'BOS-MIA': 230, 'BOS-FLL': 210, 'BOS-DCA': 140, 'BOS-MCO': 200,
  'SEA-LAX': 170, 'SEA-LAS': 200, 'SEA-HNL': 420, 'SEA-DEN': 210,
  'DEN-PHX': 140, 'DEN-LAS': 130, 'DEN-AUS': 200,
  'MIA-SJU': 180, 'MIA-CUN': 220,
};

async function searchRoute(
  origin: string, destination: string, date: string, apiKey: string
): Promise<{ price: number; airline: string; airlineLogo: string | null; stops: number; duration: string } | null> {
  try {
    const resp = await fetch(`${DUFFEL_API_URL}/air/offer_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date: date }],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
          max_connections: 1,
        }
      }),
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    const offers = json.data?.offers || [];
    if (!offers.length) return null;

    let cheapest = offers[0];
    for (const o of offers) {
      if (parseFloat(o.total_amount) < parseFloat(cheapest.total_amount)) cheapest = o;
    }
    const slice = cheapest.slices?.[0];
    const segments = slice?.segments || [];
    const carrier = cheapest.owner || segments[0]?.operating_carrier || {};
    const totalMin = segments.reduce((a: number, s: { duration?: string }) => {
      if (!s.duration) return a;
      const m = s.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      return m ? a + (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0') : a;
    }, 0);
    return {
      price: parseFloat(cheapest.total_amount),
      airline: carrier.name || 'Airline',
      airlineLogo: carrier.logo_symbol_url || carrier.logo_lockup_url || null,
      stops: Math.max(0, segments.length - 1),
      duration: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
    };
  } catch { return null; }
}

async function getAIEnhancements(deals: SmartDeal[], aiKey: string): Promise<SmartDeal[]> {
  try {
    const dealSummary = deals.map(d =>
      `${d.originCode}->${d.destination}: $${Math.round(d.price)}, ${d.stops === 0 ? 'nonstop' : d.stops + ' stop'}, ${d.duration}, ${d.departureDate}, category: ${d.category}`
    ).join('\n');

    const resp = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a travel deal expert. For each flight deal, provide a short enticing description (max 15 words) and a quick travel tip (max 12 words). Also rate the deal 1-100 and give a short tag like "Best Value", "Lowest Price", "Weekend Getaway", "Last Minute". Return JSON array with objects: {index, description, tip, score, tag}' },
          { role: 'user', content: `Rate and describe these deals:\n${dealSummary}` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'enhance_deals',
            description: 'Provide AI enhancements for travel deals',
            parameters: {
              type: 'object',
              properties: {
                deals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      index: { type: 'number' },
                      description: { type: 'string' },
                      tip: { type: 'string' },
                      score: { type: 'number' },
                      tag: { type: 'string' },
                    },
                    required: ['index', 'description', 'tip', 'score', 'tag'],
                  }
                }
              },
              required: ['deals'],
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'enhance_deals' } },
      }),
    });
    if (!resp.ok) return deals;
    const json = await resp.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return deals;
    const enhanced = JSON.parse(toolCall.function.arguments);
    for (const e of enhanced.deals) {
      if (e.index >= 0 && e.index < deals.length) {
        deals[e.index].aiDescription = e.description;
        deals[e.index].aiTip = e.tip;
        deals[e.index].dealScore = e.score;
        deals[e.index].dealTag = e.tag;
      }
    }
    return deals;
  } catch (err) {
    console.error('AI enhancement error:', err);
    return deals;
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
    const category = body.category as string | undefined;

    const duffelKey = Deno.env.get('DUFFEL_API_KEY');
    const aiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!duffelKey) {
      return new Response(JSON.stringify({ error: 'DUFFEL_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = `smart-deals:${userOrigin || 'all'}:${category || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let routes = SMART_ROUTES;
    if (userOrigin) {
      const filtered = routes.filter(r => r.origin === userOrigin);
      if (filtered.length > 0) routes = filtered;
    }
    if (category) {
      const filtered = routes.filter(r => r.category === category);
      if (filtered.length > 0) routes = filtered;
    }

    // Search dates: 5, 10, 14, 21, 30 days out
    const dates = [5, 10, 14, 21, 30].map(d => {
      const dt = new Date();
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().split('T')[0];
    });

    const selectedRoutes = routes.slice(0, 10);
    const rawDeals: SmartDeal[] = [];
    const seen = new Set<string>();

    const promises = selectedRoutes.flatMap(route =>
      dates.slice(0, 3).map(async (date) => {
        const result = await searchRoute(route.origin, route.destination, date, duffelKey);
        if (!result) return;
        const routeKey = `${route.origin}-${route.destination}`;
        if (seen.has(routeKey)) {
          const existing = rawDeals.find(d => d.originCode === route.origin && d.destinationCode === route.destination);
          if (existing && existing.price <= result.price) return;
          const idx = rawDeals.indexOf(existing!);
          if (idx >= 0) rawDeals.splice(idx, 1);
        }
        seen.add(routeKey);
        const avgPrice = AVG_PRICES[routeKey] || result.price * 1.2;
        const savings = Math.max(0, Math.round(((avgPrice - result.price) / avgPrice) * 100));
        rawDeals.push({
          id: `${route.origin}-${route.destination}-${date}`,
          origin: route.origin, originCode: route.origin,
          destination: route.destName, destinationCode: route.destination, destinationKey: route.destKey,
          price: result.price, departureDate: date, returnDate: null,
          airline: result.airline, airlineLogo: result.airlineLogo,
          stops: result.stops, duration: result.duration,
          aiDescription: `Great deal to ${route.destName}`, aiTip: 'Book soon — prices may increase',
          dealScore: Math.min(100, 50 + savings), dealTag: savings > 20 ? 'Hot Deal' : 'Good Price',
          savingsPercent: savings, category: route.category,
        });
      })
    );

    await Promise.all(promises);
    rawDeals.sort((a, b) => b.savingsPercent - a.savingsPercent || a.price - b.price);

    const topDeals = rawDeals.slice(0, 12);
    const enhanced = aiKey ? await getAIEnhancements(topDeals, aiKey) : topDeals;

    const responseData = { deals: enhanced, generatedAt: new Date().toISOString() };
    cache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Smart Deals error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
