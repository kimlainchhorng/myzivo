import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRAVELPAYOUTS_API_TOKEN = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    if (!TRAVELPAYOUTS_API_TOKEN) {
      throw new Error('TRAVELPAYOUTS_API_TOKEN is not configured');
    }

    const TRAVELPAYOUTS_MARKER = Deno.env.get('TRAVELPAYOUTS_MARKER');

    const { origin, destination, depart_date, return_date, currency } = await req.json();

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ success: false, error: 'origin and destination are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the v3 prices_for_dates endpoint (recommended replacement for v1/v2)
    const params = new URLSearchParams({
      origin,
      destination,
      currency: currency || 'usd',
      sorting: 'price',
      direct: 'false',
      limit: '10',
      page: '1',
      token: TRAVELPAYOUTS_API_TOKEN,
    });

    if (depart_date) params.set('departure_at', depart_date);
    if (return_date && depart_date) {
      const diffMs = new Date(return_date).getTime() - new Date(depart_date).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 30) {
        params.set('return_at', return_date);
      } else {
        console.log(`[travelpayouts-prices] Skipping return_date (${diffDays} days > 30 day limit)`);
      }
    } else if (return_date) {
      params.set('return_at', return_date);
    }
    if (TRAVELPAYOUTS_MARKER) params.set('marker', TRAVELPAYOUTS_MARKER);

    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`;

    console.log(`[travelpayouts-prices] Fetching: ${origin} → ${destination}, depart: ${depart_date || 'any'}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[travelpayouts-prices] API error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: 'Travelpayouts API error', details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform results into a clean format
    const prices = (data.data || []).map((ticket: any) => ({
      origin: ticket.origin,
      destination: ticket.destination,
      originAirport: ticket.origin_airport,
      destinationAirport: ticket.destination_airport,
      price: ticket.price,
      airline: ticket.airline,
      flightNumber: ticket.flight_number,
      departureAt: ticket.departure_at,
      returnAt: ticket.return_at,
      transfers: ticket.transfers, // number of stops
      duration: ticket.duration, // in minutes
      durationTo: ticket.duration_to,
      durationBack: ticket.duration_back,
      link: ticket.link, // Aviasales deep link code
    }));

    console.log(`[travelpayouts-prices] Found ${prices.length} prices for ${origin} → ${destination}`);

    return new Response(
      JSON.stringify({ success: true, data: prices, currency: currency || 'usd' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[travelpayouts-prices] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
