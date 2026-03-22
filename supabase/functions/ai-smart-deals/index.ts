import { serve } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * AI Smart Deal Finder v2 — Real-Time Duffel-Powered Deal Engine
 * • Searches multiple flexible dates for cheapest real fares
 * • Returns real airline logos, cabin info, and baggage data
 * • AI enrichment with deal scoring, descriptions, and travel tips
 * • Real-time timestamps so UI can show freshness
 */

const DUFFEL_API_URL = 'https://api.duffel.com';
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 90 * 60 * 1000; // 90 min for fresher deals

interface DuffelSegment {
  origin?: { iata_code?: string; name?: string; city_name?: string };
  destination?: { iata_code?: string; name?: string; city_name?: string };
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  operating_carrier?: { name?: string; logo_symbol_url?: string; logo_lockup_url?: string; iata_code?: string };
  marketing_carrier?: { name?: string; iata_code?: string };
  marketing_carrier_flight_number?: string;
}

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
  airlineCode: string;
  airlineLogo: string | null;
  flightNumber: string;
  stops: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  cabin: string;
  baggageIncluded: boolean;
  offersCount: number;
  aiDescription: string;
  aiTip: string;
  dealScore: number;
  dealTag: string;
  savingsPercent: number;
  category: 'beach' | 'city' | 'adventure' | 'culture' | 'nightlife' | 'family';
  fetchedAt: string;
  expiresAt: string;
}

// Routes with categories
const SMART_ROUTES = [
  // Beach
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
  // City
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
  // Nightlife
  { origin: 'LAX', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  { origin: 'DFW', destination: 'BNA', destName: 'Nashville', destKey: 'nashville', category: 'nightlife' as const },
  { origin: 'MSY', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  { origin: 'ATL', destination: 'MSY', destName: 'New Orleans', destKey: 'new-orleans', category: 'nightlife' as const },
  { origin: 'ORD', destination: 'BNA', destName: 'Nashville', destKey: 'nashville', category: 'nightlife' as const },
  { origin: 'ORD', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'nightlife' as const },
  // Family
  { origin: 'ORD', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'MSY', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'JFK', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'BOS', destination: 'MCO', destName: 'Orlando', destKey: 'orlando', category: 'family' as const },
  { origin: 'ATL', destination: 'TPA', destName: 'Tampa', destKey: 'tampa', category: 'family' as const },
  // Adventure
  { origin: 'ORD', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  { origin: 'DEN', destination: 'PHX', destName: 'Phoenix', destKey: 'phoenix', category: 'adventure' as const },
  { origin: 'DEN', destination: 'LAS', destName: 'Las Vegas', destKey: 'las-vegas', category: 'adventure' as const },
  { origin: 'DFW', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  { origin: 'SEA', destination: 'DEN', destName: 'Denver', destKey: 'denver', category: 'adventure' as const },
  // Culture
  { origin: 'JFK', destination: 'CDG', destName: 'Paris', destKey: 'paris', category: 'culture' as const },
  { origin: 'JFK', destination: 'BCN', destName: 'Barcelona', destKey: 'barcelona', category: 'culture' as const },
  { origin: 'LAX', destination: 'BOS', destName: 'Boston', destKey: 'boston', category: 'culture' as const },
  { origin: 'MSY', destination: 'CLT', destName: 'Charlotte', destKey: 'charlotte', category: 'culture' as const },
  { origin: 'DEN', destination: 'AUS', destName: 'Austin', destKey: 'austin', category: 'culture' as const },
  // Asia
  { origin: 'PNH', destination: 'REP', destName: 'Siem Reap', destKey: 'siem-reap', category: 'culture' as const },
  { origin: 'PNH', destination: 'BKK', destName: 'Bangkok', destKey: 'bangkok', category: 'city' as const },
  { origin: 'PNH', destination: 'SGN', destName: 'Ho Chi Minh City', destKey: 'ho-chi-minh', category: 'city' as const },
  { origin: 'PNH', destination: 'KOS', destName: 'Sihanoukville', destKey: 'sihanoukville', category: 'beach' as const },
  { origin: 'REP', destination: 'BKK', destName: 'Bangkok', destKey: 'bangkok', category: 'city' as const },
  { origin: 'BKK', destination: 'REP', destName: 'Siem Reap', destKey: 'siem-reap', category: 'culture' as const },
  { origin: 'BKK', destination: 'PNH', destName: 'Phnom Penh', destKey: 'phnom-penh', category: 'city' as const },
];

// Historical average prices for savings %
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
  'PNH-REP': 80, 'PNH-BKK': 120, 'PNH-SGN': 90, 'PNH-KOS': 70,
  'REP-BKK': 110, 'BKK-REP': 110, 'BKK-PNH': 120,
};

interface SearchResult {
  price: number;
  airline: string;
  airlineCode: string;
  airlineLogo: string | null;
  flightNumber: string;
  stops: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  cabin: string;
  baggageIncluded: boolean;
  offersCount: number;
  expiresAt: string;
}

async function searchRoute(
  origin: string, destination: string, date: string, apiKey: string
): Promise<SearchResult | null> {
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

    // Find cheapest offer
    let cheapest = offers[0];
    for (const o of offers) {
      if (parseFloat(o.total_amount) < parseFloat(cheapest.total_amount)) cheapest = o;
    }

    const slice = cheapest.slices?.[0];
    const segments: DuffelSegment[] = slice?.segments || [];
    const carrier = cheapest.owner || segments[0]?.operating_carrier || {};
    const firstSeg = segments[0] || {};
    const lastSeg = segments[segments.length - 1] || {};

    // Duration calculation
    const totalMin = segments.reduce((a: number, s: DuffelSegment) => {
      if (!s.duration) return a;
      const m = s.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      return m ? a + (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0') : a;
    }, 0);

    // Flight number from first segment
    const flightNum = firstSeg.marketing_carrier?.iata_code && firstSeg.marketing_carrier_flight_number
      ? `${firstSeg.marketing_carrier.iata_code}${firstSeg.marketing_carrier_flight_number}`
      : '';

    // Departure/arrival times
    const depTime = firstSeg.departing_at ? new Date(firstSeg.departing_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
    const arrTime = lastSeg.arriving_at ? new Date(lastSeg.arriving_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

    // Cabin class from offer
    const cabin = cheapest.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class_marketing_name || 'Economy';

    // Check baggage — look for checked bags
    const paxBaggage = cheapest.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages || [];
    const hasCheckedBag = paxBaggage.some((b: { type: string; quantity: number }) => b.type === 'checked' && b.quantity > 0);

    return {
      price: parseFloat(cheapest.total_amount),
      airline: carrier.name || 'Airline',
      airlineCode: carrier.iata_code || firstSeg.operating_carrier?.iata_code || '',
      airlineLogo: carrier.logo_symbol_url || carrier.logo_lockup_url || null,
      flightNumber: flightNum,
      stops: Math.max(0, segments.length - 1),
      duration: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
      departureTime: depTime,
      arrivalTime: arrTime,
      cabin,
      baggageIncluded: hasCheckedBag,
      offersCount: offers.length,
      expiresAt: cheapest.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  } catch { return null; }
}

async function getAIEnhancements(deals: SmartDeal[], aiKey: string): Promise<SmartDeal[]> {
  try {
    const dealSummary = deals.map(d =>
      `${d.originCode}->${d.destination}: $${Math.round(d.price)}, ${d.airline} ${d.flightNumber}, ${d.stops === 0 ? 'nonstop' : d.stops + ' stop'}, ${d.duration}, departs ${d.departureTime} on ${d.departureDate}, ${d.cabin}, ${d.baggageIncluded ? 'checked bag included' : 'carry-on only'}, ${d.offersCount} options available, category: ${d.category}, savings: ${d.savingsPercent}%`
    ).join('\n');

    const resp = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a travel deal analyst. For each flight deal, provide: 1) A punchy enticing description (max 15 words, mention specific value like price/timing/route), 2) A practical travel tip (max 15 words, specific to this deal — e.g. "Book by Friday — fares jump 20% on weekends"), 3) A deal score 1-100 based on savings %, route popularity, timing, and value, 4) A catchy tag. Return JSON array: {index, description, tip, score, tag}'
          },
          { role: 'user', content: `Analyze and rate these live flight deals:\n${dealSummary}` }
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
        deals[e.index].dealScore = Math.min(100, Math.max(1, e.score));
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

    const cacheKey = `smart-v2:${userOrigin || 'all'}:${category || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let routes = SMART_ROUTES;
    let searchDatesCount = 3; // dates per route to search

    if (userOrigin) {
      const filtered = routes.filter(r => r.origin === userOrigin);
      if (filtered.length > 0) routes = filtered;
    }
    if (category) {
      const filtered = routes.filter(r => r.category === category);
      if (filtered.length > 0) routes = filtered;
    } else {
      // "All Deals": pick 2 routes per category to keep API calls manageable
      const byCategory = new Map<string, typeof routes>();
      for (const r of routes) {
        if (!byCategory.has(r.category)) byCategory.set(r.category, []);
        byCategory.get(r.category)!.push(r);
      }
      const sampled: typeof routes = [];
      for (const [, catRoutes] of byCategory) {
        // Shuffle and pick 2
        const shuffled = catRoutes.sort(() => Math.random() - 0.5);
        sampled.push(...shuffled.slice(0, 2));
      }
      routes = sampled;
      searchDatesCount = 2; // fewer dates for "all" to reduce calls
    }

    // Search flexible dates: 3, 7, 14, 21, 30 days out
    const dates = [3, 7, 14, 21, 30].map(d => {
      const dt = new Date();
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().split('T')[0];
    });

    const now = new Date().toISOString();
    const selectedRoutes = routes.slice(0, 12);
    const rawDeals: SmartDeal[] = [];
    const seen = new Set<string>();

    // Batch search with controlled concurrency (max 6 at a time)
    const searchTasks = selectedRoutes.flatMap(route =>
      dates.slice(0, searchDatesCount).map(date => ({ route, date }))
    );

    const batchSize = 6;
    for (let i = 0; i < searchTasks.length; i += batchSize) {
      const batch = searchTasks.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async ({ route, date }) => {
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
          airline: result.airline, airlineCode: result.airlineCode, airlineLogo: result.airlineLogo,
          flightNumber: result.flightNumber,
          stops: result.stops, duration: result.duration,
          departureTime: result.departureTime, arrivalTime: result.arrivalTime,
          cabin: result.cabin, baggageIncluded: result.baggageIncluded,
          offersCount: result.offersCount,
          aiDescription: `Great deal to ${route.destName}`,
          aiTip: 'Book soon — prices may increase',
          dealScore: Math.min(100, 50 + savings),
          dealTag: savings > 20 ? 'Hot Deal' : savings > 10 ? 'Good Price' : 'Available',
          savingsPercent: savings, category: route.category,
          fetchedAt: now, expiresAt: result.expiresAt,
        });
        return { route, date, result };
      }));

      for (const { route, date, result } of results) {
        if (!result) continue;
        const routeKey = `${route.origin}-${route.destination}`;
        if (seen.has(routeKey)) {
          const existing = rawDeals.find(d => d.originCode === route.origin && d.destinationCode === route.destination);
          if (existing && existing.price <= result.price) continue;
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
          airline: result.airline, airlineCode: result.airlineCode, airlineLogo: result.airlineLogo,
          flightNumber: result.flightNumber,
          stops: result.stops, duration: result.duration,
          departureTime: result.departureTime, arrivalTime: result.arrivalTime,
          cabin: result.cabin, baggageIncluded: result.baggageIncluded,
          offersCount: result.offersCount,
          aiDescription: `Great deal to ${route.destName}`,
          aiTip: 'Book soon — prices may increase',
          dealScore: Math.min(100, 50 + savings),
          dealTag: savings > 20 ? 'Hot Deal' : savings > 10 ? 'Good Price' : 'Available',
          savingsPercent: savings, category: route.category,
          fetchedAt: now, expiresAt: result.expiresAt,
        });
      }
    }
    rawDeals.sort((a, b) => b.savingsPercent - a.savingsPercent || a.price - b.price);

    const topDeals = rawDeals.slice(0, 12);
    const enhanced = aiKey ? await getAIEnhancements(topDeals, aiKey) : topDeals;

    const responseData = {
      deals: enhanced,
      generatedAt: now,
      totalRoutesSearched: selectedRoutes.length,
      totalDealsFound: rawDeals.length,
    };
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
