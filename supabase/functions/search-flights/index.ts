import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

/**
 * Aviasales Flights Search API Edge Function
 * Implements real-time flight search with proper MD5 signature authentication
 * 
 * API Flow:
 * 1. Build signature string (token + sorted values)
 * 2. Calculate MD5 hash
 * 3. Start search → receive search_id
 * 4. Poll results using search_id → until is_over=true
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-ip',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// In-memory cache for search results (5-10 min TTL)
const searchCache = new Map<string, { data: FlightSearchResult; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Rate limiting per user IP (100 requests/hour)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Affiliate marker - must match the token holder's account
const AFFILIATE_MARKER = '700031';

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
  resultsUrl?: string;
  currency: string;
}

interface FlightResult {
  id: string;
  proposalId?: string;
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

/**
 * Create proper MD5 signature for Aviasales API
 * According to docs: MD5(token + ":" + sorted values joined by ":")
 */
async function createMd5Signature(signatureString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = new Uint8Array(hashBuffer);
  return new TextDecoder().decode(encodeHex(hashArray));
}

/**
 * Build signature string according to Aviasales API specification
 * 
 * Order (from docs example):
 * token:currency_code:locale:marker:market_code:[for each direction: date:destination:origin]:adults:children:infants:trip_class
 * 
 * Example from docs:
 * YourToken:USD:en_US:YourMarker:US:2026-09-09:NYC:LAX:2026-09-25:LAX:NYC:1:0:0:Y
 */
function buildSignatureString(
  token: string,
  marker: string,
  params: {
    currency_code: string;
    locale: string;
    market_code: string;
    search_params: {
      trip_class: string;
      passengers: { adults: number; children: number; infants: number };
      directions: Array<{ origin: string; destination: string; date: string }>;
    };
  }
): string {
  const values: string[] = [];
  
  // 1. currency_code
  values.push(params.currency_code);
  
  // 2. locale
  values.push(params.locale);
  
  // 3. marker
  values.push(marker);
  
  // 4. market_code
  values.push(params.market_code);
  
  // 5. Directions - each direction's values sorted alphabetically (date, destination, origin)
  for (const dir of params.search_params.directions) {
    values.push(dir.date);
    values.push(dir.destination);
    values.push(dir.origin);
  }
  
  // 6. Passengers sorted alphabetically: adults, children, infants
  values.push(String(params.search_params.passengers.adults));
  values.push(String(params.search_params.passengers.children));
  values.push(String(params.search_params.passengers.infants));
  
  // 7. Trip class
  values.push(params.search_params.trip_class);
  
  // Final format: token:value1:value2:value3...
  return `${token}:${values.join(':')}`;
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
  searchParams: FlightSearchParams,
  searchId?: string
): FlightSearchResult {
  const flights: FlightResult[] = [];
  const airlinesOutput: Record<string, AirlineInfo> = {};
  
  // Extract airlines - can be object or array
  const apiAirlines = apiData.airlines;
  const airlinesArray = Array.isArray(apiAirlines) 
    ? apiAirlines 
    : (apiAirlines ? Object.values(apiAirlines) : []);
  
  for (const airline of airlinesArray) {
    if (!airline || typeof airline !== 'object') continue;
    const a = airline as Record<string, unknown>;
    const iata = a.iata as string || '';
    // Handle nested name format: { "en-US": { "default": "American Airlines" } }
    let name = iata;
    if (a.name) {
      if (typeof a.name === 'string') {
        name = a.name;
      } else if (typeof a.name === 'object') {
        const nameObj = a.name as Record<string, unknown>;
        const enName = nameObj['en-US'] as Record<string, string>;
        name = enName?.default || iata;
      }
    }
    airlinesOutput[iata] = {
      iata,
      name,
      isLowcost: Boolean(a.is_lowcost || a.isLowcost)
    };
  }
  
  // Extract flight legs
  const flightLegs = (apiData.flight_legs || []) as Array<Record<string, unknown>>;
  
  // Extract tickets
  const tickets = (apiData.tickets || []) as Array<Record<string, unknown>>;
  
  // Extract proposals - may be nested in tickets
  let proposals: Array<Record<string, unknown>> = [];
  if (Array.isArray(apiData.proposals)) {
    proposals = apiData.proposals;
  }
  
  // Extract agents - can be object or array  
  const apiAgents = apiData.agents;
  const agentsArray = Array.isArray(apiAgents)
    ? apiAgents
    : (apiAgents ? Object.values(apiAgents) : []);
  
  const agentMap = new Map<string, Record<string, unknown>>();
  for (const agent of agentsArray) {
    if (agent && typeof agent === 'object') {
      const a = agent as Record<string, unknown>;
      agentMap.set(String(a.id), a);
    }
  }
  
  console.log(`[Transform] Processing ${tickets.length} tickets, ${proposals.length} proposals, ${flightLegs.length} legs`);
  
  // Process tickets with their proposals
  let processedCount = 0;
  for (const ticket of tickets.slice(0, 100)) { // Increase limit for more results
    if (processedCount >= 50) break; // Cap at 50 results
    
    const ticketId = String(ticket.id || '');
    const segments = (ticket.segments || []) as Array<Record<string, unknown>>;
    
    // Get proposals for this ticket - they can be nested in ticket or separate
    let ticketProposals = (ticket.proposals || []) as Array<Record<string, unknown>>;
    
    // Also check global proposals that match this ticket
    if (proposals.length > 0 && ticketProposals.length === 0) {
      ticketProposals = proposals.filter(p => {
        const terms = p.flight_terms as Record<string, unknown>;
        return p.id === ticketId || (terms && Object.keys(terms).includes(ticketId));
      });
    }
    
    if (ticketProposals.length === 0) continue;
    
    // Sort by price and get cheapest
    ticketProposals.sort((a, b) => {
      const priceA = (a.price as Record<string, number>)?.value || 999999;
      const priceB = (b.price as Record<string, number>)?.value || 999999;
      return priceA - priceB;
    });
    const bestProposal = ticketProposals[0];
    
    // Get flight indices from FIRST segment only (outbound journey)
    const firstSegment = segments[0];
    const firstSegFlights = (firstSegment?.flights || []) as number[];
    
    if (firstSegFlights.length === 0) continue;
    
    const firstLeg = flightLegs[firstSegFlights[0]];
    const lastOutboundLeg = flightLegs[firstSegFlights[firstSegFlights.length - 1]];
    
    if (!firstLeg || !lastOutboundLeg) continue;
    
    // Parse dates - only for outbound segment
    const depDateStr = String(firstLeg.local_departure_date_time || '').replace(' ', 'T');
    const arrDateStr = String(lastOutboundLeg.local_arrival_date_time || '').replace(' ', 'T');
    
    if (!depDateStr || !arrDateStr) continue;
    
    const depTime = new Date(depDateStr);
    const arrTime = new Date(arrDateStr);
    const durationMinutes = Math.round((arrTime.getTime() - depTime.getTime()) / (1000 * 60));
    
    if (isNaN(durationMinutes) || durationMinutes < 0 || durationMinutes > 2880) continue; // Max 48 hours
    
    // Count stops for outbound
    const stops = Math.max(0, firstSegFlights.length - 1);
    
    // Get stop cities
    const stopCities: string[] = [];
    for (let i = 0; i < firstSegFlights.length - 1; i++) {
      const leg = flightLegs[firstSegFlights[i]];
      if (leg?.destination) {
        stopCities.push(String(leg.destination));
      }
    }
    
    // Get carrier info - handle different formats
    // API can return: operating_carrier, operating_carrier_designator, or marketing_carrier_designator
    let carrierCode = 'XX';
    let flightNumberStr = '';
    
    // Try operating_carrier first (simple string like "AA")
    if (firstLeg.operating_carrier && typeof firstLeg.operating_carrier === 'string') {
      carrierCode = String(firstLeg.operating_carrier).toUpperCase();
    }
    
    // Try operating_carrier_designator
    const opCarrier = firstLeg.operating_carrier_designator;
    if (carrierCode === 'XX' && opCarrier) {
      if (typeof opCarrier === 'object') {
        const c = opCarrier as Record<string, string>;
        carrierCode = c.carrier_code || c.airline_code || c.carrier || 'XX';
        flightNumberStr = c.number || c.flight_number || '';
      } else if (typeof opCarrier === 'string') {
        // Format might be "AA1234" or just "AA"
        const match = String(opCarrier).match(/^([A-Z0-9]{2})(\d*)/);
        if (match) {
          carrierCode = match[1];
          flightNumberStr = match[2] || '';
        }
      }
    }
    
    // Fallback to marketing_carrier_designator
    const mkCarrier = firstLeg.marketing_carrier_designator;
    if (carrierCode === 'XX' && mkCarrier) {
      if (typeof mkCarrier === 'object') {
        const mc = mkCarrier as Record<string, string>;
        carrierCode = mc.carrier_code || mc.airline_code || mc.carrier || 'XX';
        flightNumberStr = flightNumberStr || mc.number || mc.flight_number || '';
      } else if (typeof mkCarrier === 'string') {
        const match = String(mkCarrier).match(/^([A-Z0-9]{2})(\d*)/);
        if (match) {
          carrierCode = match[1];
          flightNumberStr = flightNumberStr || match[2] || '';
        }
      }
    }
    
    // Final fallback: try airline field
    if (carrierCode === 'XX' && firstLeg.airline) {
      carrierCode = String(firstLeg.airline).toUpperCase().substring(0, 2);
    }
    
    const airlineInfo = airlinesOutput[carrierCode] || { iata: carrierCode, name: carrierCode, isLowcost: false };
    
    // Get price info
    const priceData = bestProposal.price as Record<string, unknown>;
    const pricePerPerson = bestProposal.price_per_person as Record<string, unknown>;
    
    // Get agent info - handle nested label format
    const agentId = String(bestProposal.agent_id || '');
    const agent = agentMap.get(agentId);
    let agentName = '';
    if (agent) {
      const agentLabel = agent.label;
      if (typeof agentLabel === 'string') {
        agentName = agentLabel;
      } else if (agentLabel && typeof agentLabel === 'object') {
        // Format: { "en-US": { "default": "Agency Name" } }
        const labelObj = agentLabel as Record<string, Record<string, string>>;
        agentName = labelObj['en-US']?.default || String(agent.gate_name || agentId);
      } else {
        agentName = String(agent.gate_name || agentId);
      }
    }
    
    // Get baggage info
    const flightTerms = bestProposal.flight_terms as Record<string, Record<string, unknown>> | undefined;
    const termForTicket = flightTerms?.[ticketId];
    const baggage = termForTicket?.baggage as Record<string, number> | undefined;
    const baggageCount = baggage?.count || 0;
    
    flights.push({
      id: ticketId,
      proposalId: String(bestProposal.id || ''),
      airline: airlineInfo.name,
      airlineCode: airlineInfo.iata,
      flightNumber: `${carrierCode}${flightNumberStr}`,
      departure: {
        time: parseTimeFromDatetime(String(firstLeg.local_departure_date_time)),
        city: searchParams.origin,
        code: String(firstLeg.origin || searchParams.origin),
      },
      arrival: {
        time: parseTimeFromDatetime(String(lastOutboundLeg.local_arrival_date_time)),
        city: searchParams.destination,
        code: String(lastOutboundLeg.destination || searchParams.destination),
      },
      duration: formatDuration(durationMinutes),
      stops,
      stopCities: stopCities.length > 0 ? stopCities : undefined,
      price: Number(priceData?.value || 0),
      currency: String(priceData?.currency || 'USD'),
      pricePerPerson: Number(pricePerPerson?.value || priceData?.value || 0),
      cabinClass: String(termForTicket?.trip_class || 'Y'),
      seatsAvailable: termForTicket?.seats_available as number | undefined,
      baggageIncluded: baggageCount > 0 ? `${baggageCount} × 23kg` : 'Carry-on only',
      isRefundable: false,
      agentId,
      agentName,
    });
    
    processedCount++;
  }
  
  console.log(`[Transform] Created ${flights.length} flight results`);
  
  // Sort by price
  flights.sort((a, b) => a.price - b.price);
  
  return {
    flights,
    airlines: airlinesOutput,
    isRealPrice: true,
    searchId,
    currency: flights[0]?.currency || 'USD'
  };
}

// Start search request with proper MD5 signature
async function startSearch(
  params: FlightSearchParams,
  userIp: string,
  hostUrl: string
): Promise<{ searchId: string; resultsUrl: string } | null> {
  const token = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
  const marker = Deno.env.get('TRAVELPAYOUTS_MARKER') || AFFILIATE_MARKER;
  
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
  
  // Build request body structure
  const requestParams = {
    currency_code: 'USD',
    locale: 'en_US',  // Underscore format per API docs
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
  
  // Build signature string and calculate MD5
  const signatureString = buildSignatureString(token, marker, requestParams);
  const signature = await createMd5Signature(signatureString);
  
  // SECURE LOGGING: Never log tokens, signatures, or full request bodies
  console.log(`[API] Starting search: ${params.origin} → ${params.destination}`);
  console.log(`[API] Marker: ***${marker.slice(-3)} | Token: ${token ? 'present' : 'missing'}`);
  
  // Build final request body
  const searchBody = {
    signature,
    marker,
    ...requestParams
  };
  
  try {
    const response = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': hostUrl.replace(/^https?:\/\//, ''),
        'x-user-ip': userIp,
        'x-signature': signature,
        'x-affiliate-user-id': token
      },
      body: JSON.stringify(searchBody)
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`[API] Start search failed: ${response.status}`);
      
      // Specific 403 handling - API access not enabled yet
      if (response.status === 403) {
        console.log('[API] 403 Forbidden - Flight Search API access pending. Contact support@travelpayouts.com');
      }
      
      return null;
    }
    
    const data = JSON.parse(responseText);
    console.log(`[API] Search started successfully, search_id: ${data.search_id}`);
    console.log(`[API] Results URL: ${data.results_url}`);
    
    return {
      searchId: data.search_id,
      resultsUrl: data.results_url
    };
  } catch (error) {
    console.error('[API] Start search error:', error);
    return null;
  }
}

// Get search results with polling
async function getSearchResults(
  searchId: string,
  resultsUrl: string,
  token: string
): Promise<Record<string, unknown> | null> {
  // Ensure URL has protocol
  const baseUrl = resultsUrl.startsWith('http') ? resultsUrl : `https://${resultsUrl}`;
  const resultsEndpoint = `${baseUrl}/search/affiliate/results`;
  
  let allData: Record<string, unknown> = {};
  let lastUpdateTimestamp = 0;
  let attempts = 0;
  const maxAttempts = 15; // Increased for longer searches
  
  console.log(`[API] Fetching results for search_id: ${searchId}`);
  console.log(`[API] Results endpoint: ${resultsEndpoint}`);
  
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
      
      // Handle 304 (no new data) - this is expected during polling
      if (response.status === 304) {
        console.log(`[API] Poll ${attempts}: no new data (304)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Get results failed: ${response.status} - ${errorText}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`[API] Poll ${attempts}: tickets=${(data.tickets || []).length}, is_over=${data.is_over}`);
      
      // Merge results - handle both array and object formats
      // Airlines can be array or object with iata codes as keys
      if (data.airlines) {
        const airlinesArray = Array.isArray(data.airlines) 
          ? data.airlines 
          : Object.values(data.airlines);
        allData.airlines = [...(allData.airlines as unknown[] || []), ...airlinesArray];
      }
      // Agents can be array or object with ids as keys
      if (data.agents) {
        const agentsArray = Array.isArray(data.agents)
          ? data.agents
          : Object.values(data.agents);
        allData.agents = [...(allData.agents as unknown[] || []), ...agentsArray];
      }
      if (data.flight_legs && Array.isArray(data.flight_legs)) {
        allData.flight_legs = [...(allData.flight_legs as unknown[] || []), ...data.flight_legs];
      }
      if (data.tickets && Array.isArray(data.tickets)) {
        allData.tickets = [...(allData.tickets as unknown[] || []), ...data.tickets];
      }
      if (data.proposals && Array.isArray(data.proposals)) {
        allData.proposals = [...(allData.proposals as unknown[] || []), ...data.proposals];
      }
      
      // Check if search is complete
      if (data.is_over) {
        console.log(`[API] Search complete after ${attempts} polls`);
        break;
      }
      
      // Update timestamp for next request
      lastUpdateTimestamp = data.last_update_timestamp || 0;
      
      // Wait before next poll (API suggests 1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('[API] Get results error:', error);
      break;
    }
  }
  
  const ticketCount = (allData.tickets as unknown[] || []).length;
  console.log(`[API] Total tickets collected: ${ticketCount}`);
  
  if (ticketCount === 0) {
    return null;
  }
  
  return allData;
}

/**
 * Get booking link via clicks endpoint
 * This generates a tracked booking URL for a specific flight/proposal
 */
async function getBookingLink(
  searchId: string,
  resultsUrl: string,
  proposalId: string,
  token: string
): Promise<Response> {
  const marker = Deno.env.get('TRAVELPAYOUTS_MARKER') || AFFILIATE_MARKER;
  
  // Ensure URL has protocol
  const baseUrl = resultsUrl.startsWith('http') ? resultsUrl : `https://${resultsUrl}`;
  const clicksUrl = `${baseUrl}/searches/${searchId}/clicks/${proposalId}`;
  
  console.log(`[Clicks] Generating booking link: ${clicksUrl}`);
  
  try {
    const response = await fetch(clicksUrl, {
      method: 'GET',
      headers: {
        'x-affiliate-user-id': token,
        'marker': marker,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Clicks] Failed: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to generate booking link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    console.log(`[Clicks] Success: agent=${data.agent_id}, clickId=${data.str_click_id}`);
    
    return new Response(
      JSON.stringify({
        url: data.url,
        agentId: data.agent_id,
        clickId: data.str_click_id,
        expireAt: data.expire_at_unix_sec
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Clicks] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate booking link' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body = await req.json();
    const { searchParams: params, action, searchId, resultsUrl, proposalId } = body;
    
    // Get API token
    const token = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    
    // Handle getBookingLink action - for reprice on click
    if (action === 'getBookingLink') {
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'API not configured' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!searchId || !resultsUrl || !proposalId) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: searchId, resultsUrl, proposalId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return await getBookingLink(searchId, resultsUrl, proposalId, token);
    }
    
    // Default action: search
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
    
    // Check API token for search
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
    
    // Wait a bit for initial results to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get results with polling
    const apiResults = await getSearchResults(
      searchInfo.searchId,
      searchInfo.resultsUrl,
      token
    );
    
    if (!apiResults || !apiResults.tickets) {
      console.log('[Search] No results from API, returning fallback');
      return new Response(
        JSON.stringify({
          flights: [],
          airlines: {},
          isRealPrice: false,
          fallback: true,
          searchId: searchInfo.searchId,
          resultsUrl: searchInfo.resultsUrl,
          message: 'No flights found for this route',
          whitelabelUrl: buildWhitelabelUrl(params)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform results
    const result = transformApiResponse(apiResults, params, searchInfo.searchId);
    result.resultsUrl = searchInfo.resultsUrl;
    
    // Cache results
    setCache(cacheKey, result);
    
    console.log(`[Search] Returning ${result.flights.length} flights (real prices)`);
    
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
  const marker = AFFILIATE_MARKER;
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
