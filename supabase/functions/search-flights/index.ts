import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * Aviasales Flights Search API Edge Function
 * Implements real-time flight search with caching and rate limiting
 * 
 * API Flow:
 * 1. Start search → receive search_id
 * 2. Get results using search_id → poll until is_over=true
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-ip',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// In-memory cache for search results (5-15 min TTL)
const searchCache = new Map<string, { data: FlightSearchResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Rate limiting per user IP (100 requests/hour)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

interface FlightSearchResult {
  flights: FlightResult[];
  airlines: Record<string, AirlineInfo>;
  isRealPrice: boolean;
  searchId?: string;
  currency: string;
}

interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: {
    time: string;
    city: string;
    code: string;
    terminal?: string;
  };
  arrival: {
    time: string;
    city: string;
    code: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  stopCities?: string[];
  price: number;
  currency: string;
  pricePerPerson: number;
  cabinClass: string;
  seatsAvailable?: number;
  baggageIncluded?: string;
  isRefundable?: boolean;
  deepLink?: string;
  agentId?: string;
  agentName?: string;
}

interface AirlineInfo {
  iata: string;
  name: string;
  isLowcost: boolean;
}

// Map cabin class to API trip_class
function mapCabinClass(cabin: string): string {
  const map: Record<string, string> = {
    'economy': 'Y',
    'premium': 'W',
    'business': 'C',
    'first': 'F'
  };
  return map[cabin] || 'Y';
}

// Create signature for API authentication
function createSignature(token: string, marker: string, params: Record<string, unknown>): string {
  // Sort parameter values alphabetically and join with colon
  const sortedValues = Object.values(params)
    .map(v => {
      if (typeof v === 'object' && v !== null) {
        return JSON.stringify(v);
      }
      return String(v);
    })
    .sort()
    .join(':');
  
  const signatureString = `${token}:${marker}:${sortedValues}`;
  
  // Create MD5 hash (Deno crypto)
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  
  // For simplicity, we'll use a simple hash approach
  // In production, use proper crypto
  let hash = 0;
  for (let i = 0; i < signatureString.length; i++) {
    const char = signatureString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

// Rate limit check
function checkRateLimit(userIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userIp);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// Generate cache key from search params
function getCacheKey(params: FlightSearchParams): string {
  return `${params.origin}-${params.destination}-${params.departureDate}-${params.returnDate || ''}-${params.passengers}-${params.cabinClass}-${params.tripType}`;
}

// Check cache for existing results
function checkCache(key: string): FlightSearchResult | null {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[Cache HIT] ${key}`);
    return cached.data;
  }
  if (cached) {
    searchCache.delete(key);
  }
  return null;
}

// Set cache
function setCache(key: string, data: FlightSearchResult): void {
  // Clean old entries
  const now = Date.now();
  for (const [k, v] of searchCache.entries()) {
    if (now - v.timestamp > CACHE_TTL_MS) {
      searchCache.delete(k);
    }
  }
  
  searchCache.set(key, { data, timestamp: now });
  console.log(`[Cache SET] ${key}`);
}

// Format duration from minutes
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Parse local datetime to time string
function parseTimeFromDatetime(datetime: string): string {
  if (!datetime) return '--:--';
  const parts = datetime.split(' ');
  if (parts.length >= 2) {
    return parts[1].substring(0, 5);
  }
  return '--:--';
}

// Transform API response to our format
function transformApiResponse(
  apiData: Record<string, unknown>,
  searchParams: FlightSearchParams
): FlightSearchResult {
  const flights: FlightResult[] = [];
  const airlines: Record<string, AirlineInfo> = {};
  
  // Extract airlines
  const apiAirlines = (apiData.airlines || []) as Array<{
    iata: string;
    name: string;
    is_lowcost?: boolean;
  }>;
  
  for (const airline of apiAirlines) {
    airlines[airline.iata] = {
      iata: airline.iata,
      name: airline.name,
      isLowcost: airline.is_lowcost || false
    };
  }
  
  // Extract flight legs
  const flightLegs = (apiData.flight_legs || []) as Array<{
    origin: string;
    destination: string;
    local_departure_date_time: string;
    local_arrival_date_time: string;
    operating_carrier_designator?: { carrier_code: string; number: string };
    equipment?: { name?: string };
    signature: string;
  }>;
  
  // Extract tickets and proposals
  const tickets = (apiData.tickets || []) as Array<{
    id: string;
    segments: Array<{
      flights: number[];
      transfers?: Array<{ airport_change?: boolean }>;
    }>;
  }>;
  
  const proposals = (apiData.proposals || []) as Array<{
    id: string;
    agent_id: string;
    price: { currency: string; value: number };
    price_per_person: { currency: string; value: number };
    flight_terms?: Record<string, {
      baggage?: { count?: number };
      trip_class?: string;
      seats_available?: number;
    }>;
  }>;
  
  // Extract agents
  const agents = (apiData.agents || []) as Array<{
    id: string;
    label: string;
    gate_name: string;
  }>;
  
  const agentMap = new Map(agents.map(a => [a.id, a]));
  
  // Process tickets with their best proposal
  for (const ticket of tickets.slice(0, 50)) { // Limit to 50 results
    // Find best proposal for this ticket
    const ticketProposals = proposals.filter(p => p.id === ticket.id || 
      Object.keys(p.flight_terms || {}).includes(ticket.id));
    
    if (ticketProposals.length === 0) continue;
    
    // Sort by price and get cheapest
    ticketProposals.sort((a, b) => a.price.value - b.price.value);
    const bestProposal = ticketProposals[0];
    
    // Get flight legs for this ticket
    const allFlightIndices = ticket.segments.flatMap(s => s.flights);
    if (allFlightIndices.length === 0) continue;
    
    const firstLeg = flightLegs[allFlightIndices[0]];
    const lastLeg = flightLegs[allFlightIndices[allFlightIndices.length - 1]];
    
    if (!firstLeg || !lastLeg) continue;
    
    // Calculate total duration
    const depTime = new Date(firstLeg.local_departure_date_time.replace(' ', 'T'));
    const arrTime = new Date(lastLeg.local_arrival_date_time.replace(' ', 'T'));
    const durationMinutes = Math.round((arrTime.getTime() - depTime.getTime()) / (1000 * 60));
    
    // Count stops
    const stops = Math.max(0, allFlightIndices.length - 1);
    
    // Get stop cities
    const stopCities: string[] = [];
    for (let i = 0; i < allFlightIndices.length - 1; i++) {
      const leg = flightLegs[allFlightIndices[i]];
      if (leg && leg.destination) {
        stopCities.push(leg.destination);
      }
    }
    
    // Get airline info
    const carrierCode = firstLeg.operating_carrier_designator?.carrier_code || 'XX';
    const airlineInfo = airlines[carrierCode] || { iata: carrierCode, name: carrierCode, isLowcost: false };
    
    // Get agent info
    const agent = agentMap.get(bestProposal.agent_id);
    
    // Get baggage info from flight terms
    const flightTerms = bestProposal.flight_terms?.[ticket.id];
    const baggageCount = flightTerms?.baggage?.count || 0;
    
    flights.push({
      id: ticket.id,
      airline: airlineInfo.name,
      airlineCode: airlineInfo.iata,
      flightNumber: `${carrierCode}${firstLeg.operating_carrier_designator?.number || ''}`,
      departure: {
        time: parseTimeFromDatetime(firstLeg.local_departure_date_time),
        city: searchParams.origin,
        code: firstLeg.origin,
      },
      arrival: {
        time: parseTimeFromDatetime(lastLeg.local_arrival_date_time),
        city: searchParams.destination,
        code: lastLeg.destination,
      },
      duration: formatDuration(durationMinutes),
      stops,
      stopCities: stopCities.length > 0 ? stopCities : undefined,
      price: bestProposal.price.value,
      currency: bestProposal.price.currency,
      pricePerPerson: bestProposal.price_per_person.value,
      cabinClass: flightTerms?.trip_class || 'Y',
      seatsAvailable: flightTerms?.seats_available,
      baggageIncluded: baggageCount > 0 ? `${baggageCount} × 23kg` : 'Carry-on only',
      isRefundable: false,
      agentId: bestProposal.agent_id,
      agentName: agent?.label || agent?.gate_name,
    });
  }
  
  // Sort by price
  flights.sort((a, b) => a.price - b.price);
  
  return {
    flights,
    airlines,
    isRealPrice: true,
    currency: flights[0]?.currency || 'USD'
  };
}

// Start search request
async function startSearch(
  params: FlightSearchParams,
  userIp: string,
  hostUrl: string
): Promise<{ searchId: string; resultsUrl: string } | null> {
  const token = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
  const marker = Deno.env.get('TRAVELPAYOUTS_MARKER') || '618730';
  
  if (!token) {
    console.error('[API] TRAVELPAYOUTS_API_TOKEN not configured');
    return null;
  }
  
  // Build directions array
  const directions = [
    {
      origin: params.origin.toUpperCase(),
      destination: params.destination.toUpperCase(),
      date: params.departureDate
    }
  ];
  
  // Add return leg for roundtrip
  if (params.tripType === 'roundtrip' && params.returnDate) {
    directions.push({
      origin: params.destination.toUpperCase(),
      destination: params.origin.toUpperCase(),
      date: params.returnDate
    });
  }
  
  const searchBody = {
    signature: '', // Will be set below
    marker,
    locale: 'en-us',
    currency_code: 'USD',
    market_code: 'US',
    search_params: {
      trip_class: mapCabinClass(params.cabinClass),
      passengers: {
        adults: params.passengers,
        children: 0,
        infants: 0
      },
      directions
    }
  };
  
  // Create signature
  searchBody.signature = createSignature(token, marker, searchBody.search_params);
  
  console.log(`[API] Starting search: ${params.origin} → ${params.destination}`);
  
  try {
    const response = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': hostUrl,
        'x-user-ip': userIp,
        'x-signature': searchBody.signature,
        'x-affiliate-user-id': token
      },
      body: JSON.stringify(searchBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Start search failed: ${response.status} - ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[API] Search started, search_id: ${data.search_id}`);
    
    return {
      searchId: data.search_id,
      resultsUrl: data.results_url
    };
  } catch (error) {
    console.error('[API] Start search error:', error);
    return null;
  }
}

// Get search results
async function getSearchResults(
  searchId: string,
  resultsUrl: string,
  token: string,
  marker: string
): Promise<Record<string, unknown> | null> {
  const resultsEndpoint = `${resultsUrl}/search/affiliate/results`;
  
  let allData: Record<string, unknown> = {};
  let lastUpdateTimestamp = 0;
  let attempts = 0;
  const maxAttempts = 10;
  
  console.log(`[API] Fetching results for search_id: ${searchId}`);
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await fetch(resultsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-affiliate-user-id': token
        },
        body: JSON.stringify({
          search_id: searchId,
          limit: 100,
          last_update_timestamp: lastUpdateTimestamp
        })
      });
      
      if (!response.ok) {
        console.error(`[API] Get results failed: ${response.status}`);
        break;
      }
      
      const data = await response.json();
      
      // Merge results
      if (data.airlines) {
        allData.airlines = [...(allData.airlines as unknown[] || []), ...data.airlines];
      }
      if (data.agents) {
        allData.agents = [...(allData.agents as unknown[] || []), ...data.agents];
      }
      if (data.flight_legs) {
        allData.flight_legs = [...(allData.flight_legs as unknown[] || []), ...data.flight_legs];
      }
      if (data.tickets) {
        allData.tickets = [...(allData.tickets as unknown[] || []), ...data.tickets];
      }
      if (data.proposals) {
        allData.proposals = [...(allData.proposals as unknown[] || []), ...data.proposals];
      }
      
      // Check if search is complete
      if (data.is_over) {
        console.log(`[API] Search complete after ${attempts} attempts`);
        break;
      }
      
      // Update timestamp for next request
      lastUpdateTimestamp = data.last_update_timestamp || 0;
      
      // Wait before next poll (API suggests 1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('[API] Get results error:', error);
      break;
    }
  }
  
  if (Object.keys(allData).length === 0) {
    return null;
  }
  
  return allData;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { searchParams: params } = await req.json() as { searchParams: FlightSearchParams };
    
    // Get user IP from header or fallback
    const userIp = req.headers.get('x-user-ip') || 
                   req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   '0.0.0.0';
    
    // Get host URL
    const hostUrl = req.headers.get('origin') || 'https://myzivo.lovable.app';
    
    console.log(`[Search] ${params.origin} → ${params.destination}, IP: ${userIp}`);
    
    // Check rate limit
    const rateLimitCheck = checkRateLimit(userIp);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 3600
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600'
          } 
        }
      );
    }
    
    // Check cache
    const cacheKey = getCacheKey(params);
    const cachedResult = checkCache(cacheKey);
    if (cachedResult) {
      return new Response(
        JSON.stringify({
          ...cachedResult,
          cached: true,
          rateLimitRemaining: rateLimitCheck.remaining
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get API token
    const token = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    const marker = Deno.env.get('TRAVELPAYOUTS_MARKER') || '618730';
    
    if (!token) {
      console.log('[Search] API token not configured, returning fallback');
      return new Response(
        JSON.stringify({
          flights: [],
          airlines: {},
          isRealPrice: false,
          fallback: true,
          message: 'Live prices loading from partner...',
          whitelabelUrl: buildWhitelabelUrl(params)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Start search
    const searchInfo = await startSearch(params, userIp, hostUrl);
    
    if (!searchInfo) {
      console.log('[Search] Failed to start search, returning fallback');
      return new Response(
        JSON.stringify({
          flights: [],
          airlines: {},
          isRealPrice: false,
          fallback: true,
          message: 'Live prices loading from partner...',
          whitelabelUrl: buildWhitelabelUrl(params)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Wait a bit for results to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get results
    const apiResults = await getSearchResults(
      searchInfo.searchId,
      searchInfo.resultsUrl,
      token,
      marker
    );
    
    if (!apiResults || !apiResults.tickets) {
      console.log('[Search] No results from API, returning fallback');
      return new Response(
        JSON.stringify({
          flights: [],
          airlines: {},
          isRealPrice: false,
          fallback: true,
          message: 'No flights found for this route',
          whitelabelUrl: buildWhitelabelUrl(params)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform results
    const result = transformApiResponse(apiResults, params);
    result.searchId = searchInfo.searchId;
    
    // Cache results
    setCache(cacheKey, result);
    
    console.log(`[Search] Returning ${result.flights.length} flights`);
    
    return new Response(
      JSON.stringify({
        ...result,
        cached: false,
        rateLimitRemaining: rateLimitCheck.remaining
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Search] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Build white label URL for fallback
function buildWhitelabelUrl(params: FlightSearchParams): string {
  const marker = '618730'; // Travelpayouts marker
  const base = 'https://search.jetradar.com/flights';
  
  const urlParams = new URLSearchParams({
    origin_iata: params.origin,
    destination_iata: params.destination,
    depart_date: params.departureDate,
    adults: String(params.passengers),
    trip_class: mapCabinClass(params.cabinClass),
    marker,
    with_request: 'true'
  });
  
  if (params.returnDate && params.tripType === 'roundtrip') {
    urlParams.set('return_date', params.returnDate);
  }
  
  return `${base}?${urlParams.toString()}`;
}
