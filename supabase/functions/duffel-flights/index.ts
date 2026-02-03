import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Duffel Flights API Edge Function
 * 
 * Implements real flight search and booking using the Duffel API
 * Supports: offer requests, offer retrieval, order creation
 * 
 * ZIVO is the Merchant of Record - Stripe checkout, then Duffel order
 * 
 * Includes search logging for admin debugging
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DUFFEL_API_URL = 'https://api.duffel.com';

// Supabase client for logging
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get current environment
const DUFFEL_ENV = Deno.env.get('DUFFEL_ENV') || 'sandbox';

/**
 * Log search request and response to database for debugging
 */
async function logSearch(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  requestId?: string;
  statusCode: number;
  error?: string;
  offersCount: number;
  responseTimeMs: number;
}) {
  try {
    await supabase.from('flight_search_logs').insert({
      origin_iata: params.origin,
      destination_iata: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate || null,
      passengers: params.passengers,
      cabin_class: params.cabinClass,
      duffel_request_id: params.requestId || null,
      duffel_status_code: params.statusCode,
      duffel_error: params.error || null,
      offers_count: params.offersCount,
      response_time_ms: params.responseTimeMs,
      environment: DUFFEL_ENV,
    });
  } catch (err) {
    console.error('[Logging] Failed to log search:', err);
    // Don't throw - logging failure shouldn't break the search
  }
}

interface DuffelPassenger {
  type: 'adult' | 'child' | 'infant_without_seat';
}

interface DuffelSlice {
  origin: string;
  destination: string;
  departure_date: string;
}

interface CreateOfferRequestParams {
  slices: DuffelSlice[];
  passengers: DuffelPassenger[];
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first';
  max_connections?: number;
}

interface GetOffersParams {
  offer_request_id: string;
  sort?: 'total_amount' | 'total_duration';
  max_offers?: number;
}

interface GetOfferParams {
  offer_id: string;
}

interface CreateOrderParams {
  offer_id: string;
  passengers: Array<{
    id: string;
    title: string;
    gender: string;
    given_name: string;
    family_name: string;
    born_on: string;
    email: string;
    phone_number: string;
  }>;
  payments?: Array<{
    type: 'balance';
    amount: string;
    currency: string;
  }>;
  metadata?: Record<string, string>;
}

// Helper to make Duffel API requests
async function duffelRequest(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<{ data?: unknown; error?: string; status: number }> {
  const apiKey = Deno.env.get('DUFFEL_API_KEY');
  
  if (!apiKey) {
    return { error: 'DUFFEL_API_KEY not configured', status: 500 };
  }

  const url = `${DUFFEL_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Duffel] API error:', data);
      return { 
        error: data.errors?.[0]?.message || 'Duffel API error', 
        status: response.status 
      };
    }

    return { data: data.data, status: response.status };
  } catch (err) {
    console.error('[Duffel] Request failed:', err);
    return { error: 'Failed to connect to Duffel API', status: 500 };
  }
}

// Create an offer request (start a search) with logging
async function createOfferRequest(params: CreateOfferRequestParams) {
  console.log('[Duffel] Creating offer request:', JSON.stringify(params));
  const startTime = Date.now();
  
  // Extract search params for logging
  const firstSlice = params.slices[0];
  const returnSlice = params.slices[1];
  const origin = firstSlice?.origin || '';
  const destination = firstSlice?.destination || '';
  const departureDate = firstSlice?.departure_date || '';
  const returnDate = returnSlice?.departure_date;
  const passengerCount = params.passengers?.length || 1;
  const cabinClass = params.cabin_class || 'economy';
  
  const result = await duffelRequest('/air/offer_requests', 'POST', {
    data: {
      slices: params.slices,
      passengers: params.passengers,
      cabin_class: cabinClass,
      max_connections: params.max_connections ?? 2,
    }
  });

  const responseTimeMs = Date.now() - startTime;

  if (result.error) {
    // Log failed search
    await logSearch({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: passengerCount,
      cabinClass,
      statusCode: result.status,
      error: result.error,
      offersCount: 0,
      responseTimeMs,
    });
    return { error: result.error };
  }

  const offerRequest = result.data as { 
    id: string; 
    offers: unknown[];
    slices: unknown[];
    passengers: unknown[];
    created_at: string;
  };

  const offersCount = offerRequest.offers?.length || 0;
  console.log('[Duffel] Offer request created:', offerRequest.id, 'with', offersCount, 'initial offers');

  // Log successful search
  await logSearch({
    origin,
    destination,
    departureDate,
    returnDate,
    passengers: passengerCount,
    cabinClass,
    requestId: offerRequest.id,
    statusCode: result.status,
    offersCount,
    responseTimeMs,
  });

  return {
    offer_request_id: offerRequest.id,
    offers: transformOffers(offerRequest.offers || []),
    created_at: offerRequest.created_at,
    environment: DUFFEL_ENV,
  };
}

// Get offers for an existing offer request
async function getOffers(params: GetOffersParams) {
  console.log('[Duffel] Getting offers for request:', params.offer_request_id);
  
  const queryParams = new URLSearchParams({
    offer_request_id: params.offer_request_id,
    ...(params.sort && { sort: params.sort }),
    ...(params.max_offers && { limit: String(params.max_offers) }),
  });

  const result = await duffelRequest(`/air/offers?${queryParams.toString()}`);

  if (result.error) {
    return { error: result.error };
  }

  const offers = result.data as unknown[];
  console.log('[Duffel] Retrieved', offers.length, 'offers');

  return {
    offers: transformOffers(offers),
    total: offers.length,
  };
}

// Get a single offer by ID
async function getOffer(params: GetOfferParams) {
  console.log('[Duffel] Getting offer:', params.offer_id);
  
  const result = await duffelRequest(`/air/offers/${params.offer_id}`);

  if (result.error) {
    return { error: result.error };
  }

  return {
    offer: transformOffer(result.data),
  };
}

// Create an order (booking) - for test mode only, returns order details
async function createOrder(params: CreateOrderParams) {
  console.log('[Duffel] Creating order for offer:', params.offer_id);
  
  // In test mode, Duffel allows creating orders without real payment
  // In production, use Duffel Links or Payment Intents for checkout
  const result = await duffelRequest('/air/orders', 'POST', {
    data: {
      type: 'instant',
      selected_offers: [params.offer_id],
      passengers: params.passengers,
      payments: params.payments || [],
      metadata: params.metadata || {},
    }
  });

  if (result.error) {
    return { error: result.error };
  }

  const order = result.data as {
    id: string;
    booking_reference: string;
    created_at: string;
    total_amount: string;
    total_currency: string;
    passengers: unknown[];
    slices: unknown[];
  };

  console.log('[Duffel] Order created:', order.id, 'ref:', order.booking_reference);

  return {
    order_id: order.id,
    booking_reference: order.booking_reference,
    created_at: order.created_at,
    total_amount: order.total_amount,
    total_currency: order.total_currency,
  };
}

// Transform Duffel offer to our format
function transformOffer(offer: unknown): DuffelOfferTransformed | null {
  if (!offer || typeof offer !== 'object') return null;
  
  const o = offer as Record<string, unknown>;
  const slices = (o.slices || []) as Array<Record<string, unknown>>;
  const passengers = (o.passengers || []) as Array<Record<string, unknown>>;
  
  // Get first slice for outbound info
  const firstSlice = slices[0];
  if (!firstSlice) return null;
  
  const segments = (firstSlice.segments || []) as Array<Record<string, unknown>>;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  if (!firstSegment || !lastSegment) return null;

  // Extract carrier info
  const operatingCarrier = firstSegment.operating_carrier as Record<string, string> | undefined;
  const marketingCarrier = firstSegment.marketing_carrier as Record<string, string> | undefined;
  const carrier = operatingCarrier || marketingCarrier;

  // Extract airports
  const origin = firstSegment.origin as Record<string, string> | undefined;
  const destination = lastSegment.destination as Record<string, string> | undefined;

  // Calculate duration
  const duration = firstSlice.duration as string || '';
  const durationMatch = duration.match(/PT(\d+)H(\d+)?M?/);
  const hours = durationMatch?.[1] || '0';
  const mins = durationMatch?.[2] || '0';
  const durationFormatted = `${hours}h ${mins}m`;

  // Get stops
  const stops = Math.max(0, segments.length - 1);
  const stopCities = segments.slice(0, -1).map(seg => {
    const dest = seg.destination as Record<string, string> | undefined;
    return dest?.iata_code || '';
  }).filter(Boolean);

  // Baggage info
  const baggageInfo = (o.passenger_identity_documents_required === false) ? 'Personal item' : 'Varies by fare';

  // Conditions (cancellation, change)
  const conditions = o.conditions as Record<string, unknown> | undefined;
  const isRefundable = conditions?.refund_before_departure !== null;

  return {
    id: o.id as string,
    airline: carrier?.name || 'Unknown Airline',
    airlineCode: carrier?.iata_code || 'XX',
    flightNumber: `${marketingCarrier?.iata_code || ''}${firstSegment.marketing_carrier_flight_number || ''}`,
    departure: {
      time: formatTime(firstSegment.departing_at as string),
      date: formatDate(firstSegment.departing_at as string),
      city: origin?.city_name || origin?.name || '',
      code: origin?.iata_code || '',
      terminal: firstSegment.origin_terminal as string | undefined,
    },
    arrival: {
      time: formatTime(lastSegment.arriving_at as string),
      date: formatDate(lastSegment.arriving_at as string),
      city: destination?.city_name || destination?.name || '',
      code: destination?.iata_code || '',
      terminal: lastSegment.destination_terminal as string | undefined,
    },
    duration: durationFormatted,
    durationMinutes: parseInt(hours) * 60 + parseInt(mins),
    stops,
    stopCities,
    price: parseFloat(o.total_amount as string) || 0,
    currency: o.total_currency as string || 'USD',
    pricePerPerson: parseFloat(o.total_amount as string) / Math.max(passengers.length, 1),
    cabinClass: o.cabin_class as string || 'economy',
    baggageIncluded: baggageInfo,
    isRefundable,
    conditions: {
      changeBeforeDeparture: conditions?.change_before_departure as boolean | null,
      refundBeforeDeparture: conditions?.refund_before_departure as boolean | null,
    },
    segments: segments.map(seg => transformSegment(seg)),
    owner: carrier,
    expiresAt: o.expires_at as string,
    passengers: passengers.length,
  };
}

function transformSegment(segment: Record<string, unknown>) {
  const operatingCarrier = segment.operating_carrier as Record<string, string> | undefined;
  const marketingCarrier = segment.marketing_carrier as Record<string, string> | undefined;
  const origin = segment.origin as Record<string, string> | undefined;
  const destination = segment.destination as Record<string, string> | undefined;
  const aircraft = segment.aircraft as Record<string, string> | undefined;

  const duration = segment.duration as string || '';
  const durationMatch = duration.match(/PT(\d+)H(\d+)?M?/);
  const hours = durationMatch?.[1] || '0';
  const mins = durationMatch?.[2] || '0';

  return {
    id: segment.id as string,
    departingAt: segment.departing_at as string,
    arrivingAt: segment.arriving_at as string,
    origin: {
      code: origin?.iata_code || '',
      name: origin?.name || '',
      city: origin?.city_name || '',
      terminal: segment.origin_terminal as string | undefined,
    },
    destination: {
      code: destination?.iata_code || '',
      name: destination?.name || '',
      city: destination?.city_name || '',
      terminal: segment.destination_terminal as string | undefined,
    },
    operatingCarrier: operatingCarrier?.name || '',
    operatingCarrierCode: operatingCarrier?.iata_code || '',
    marketingCarrier: marketingCarrier?.name || '',
    marketingCarrierCode: marketingCarrier?.iata_code || '',
    flightNumber: `${marketingCarrier?.iata_code || ''}${segment.marketing_carrier_flight_number || ''}`,
    aircraft: aircraft?.name || 'Unknown',
    duration: `${hours}h ${mins}m`,
    cabinClass: (segment.passengers as Array<Record<string, string>> | undefined)?.[0]?.cabin_class || 'economy',
  };
}

function transformOffers(offers: unknown[]): DuffelOfferTransformed[] {
  return offers
    .map(o => transformOffer(o))
    .filter((o): o is DuffelOfferTransformed => o !== null);
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '--:--';
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

interface DuffelOfferTransformed {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: {
    time: string;
    date: string;
    city: string;
    code: string;
    terminal?: string;
  };
  arrival: {
    time: string;
    date: string;
    city: string;
    code: string;
    terminal?: string;
  };
  duration: string;
  durationMinutes: number;
  stops: number;
  stopCities: string[];
  price: number;
  currency: string;
  pricePerPerson: number;
  cabinClass: string;
  baggageIncluded: string;
  isRefundable: boolean;
  conditions: {
    changeBeforeDeparture: boolean | null;
    refundBeforeDeparture: boolean | null;
  };
  segments: unknown[];
  owner: Record<string, string> | undefined;
  expiresAt: string;
  passengers: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    console.log('[Duffel] Action:', action);

    let result;

    switch (action) {
      case 'createOfferRequest':
        result = await createOfferRequest(params as CreateOfferRequestParams);
        break;

      case 'getOffers':
        result = await getOffers(params as GetOffersParams);
        break;

      case 'getOffer':
        result = await getOffer(params as GetOfferParams);
        break;

      case 'createOrder':
        result = await createOrder(params as CreateOrderParams);
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[Duffel] Handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
