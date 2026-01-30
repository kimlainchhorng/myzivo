import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightPriceRequest {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  currency?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRAVELPAYOUTS_API_TOKEN = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    if (!TRAVELPAYOUTS_API_TOKEN) {
      throw new Error('TRAVELPAYOUTS_API_TOKEN is not configured');
    }

    const { origin, destination, departureDate, returnDate, currency = 'USD' }: FlightPriceRequest = await req.json();

    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    // Format dates for API (YYYY-MM-DD or YYYY-MM)
    const departMonth = departureDate ? departureDate.substring(0, 7) : new Date().toISOString().substring(0, 7);

    // Travelpayouts Prices API - Get cheapest tickets
    const apiUrl = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    apiUrl.searchParams.set('origin', origin);
    apiUrl.searchParams.set('destination', destination);
    apiUrl.searchParams.set('departure_at', departureDate || departMonth);
    if (returnDate) {
      apiUrl.searchParams.set('return_at', returnDate);
    }
    apiUrl.searchParams.set('currency', currency);
    apiUrl.searchParams.set('sorting', 'price');
    apiUrl.searchParams.set('direct', 'false');
    apiUrl.searchParams.set('limit', '30');
    apiUrl.searchParams.set('token', TRAVELPAYOUTS_API_TOKEN);

    console.log('Fetching prices from:', apiUrl.toString().replace(TRAVELPAYOUTS_API_TOKEN, '[REDACTED]'));

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Travelpayouts API error:', response.status, errorText);
      throw new Error(`Travelpayouts API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received', data.data?.length || 0, 'price results');

    // Transform data to our format
    const prices = (data.data || []).map((item: any) => ({
      price: item.price,
      airline: item.airline,
      flightNumber: item.flight_number,
      departureAt: item.departure_at,
      returnAt: item.return_at,
      duration: item.duration,
      transfers: item.transfers,
      origin: item.origin,
      destination: item.destination,
      link: `https://www.aviasales.com${item.link}`,
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      prices,
      currency,
      origin,
      destination
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching flight prices:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      prices: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
