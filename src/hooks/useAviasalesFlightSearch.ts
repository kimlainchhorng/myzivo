import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAirlineByCode, getAirlineLogo } from "@/data/airlines";
import { getAirportByCode } from "@/data/airports";

/**
 * Real-time flight search using Aviasales API
 * Server-side calls via edge function with caching and rate limiting
 */

export interface FlightSearchParams {
  origin: string;         // IATA code (e.g., "MSY")
  destination: string;    // IATA code (e.g., "PNH")
  departureDate: string;  // YYYY-MM-DD
  returnDate?: string;    // YYYY-MM-DD (optional)
  passengers: number;     // 1-9
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
  enabled?: boolean;
}

export interface ApiFlightResult {
  id: string;
  proposalId?: string;  // For booking link generation
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
  // Client-side enriched fields
  logo?: string;
  isRealPrice?: boolean;
}

export interface FlightSearchResponse {
  flights: ApiFlightResult[];
  airlines: Record<string, { iata: string; name: string; isLowcost: boolean }>;
  isRealPrice: boolean;
  searchId?: string;
  resultsUrl?: string;
  currency: string;
  cached?: boolean;
  fallback?: boolean;
  whitelabelUrl?: string;
  message?: string;
  rateLimitRemaining?: number;
}

// Get user's IP address for rate limiting
async function getUserIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}

// Build white label URL for fallback
export function buildWhitelabelUrl(params: FlightSearchParams): string {
  const marker = '618730';
  const base = 'https://search.jetradar.com/flights';
  
  const cabinMap: Record<string, string> = {
    'economy': 'Y',
    'premium': 'W',
    'business': 'C',
    'first': 'F'
  };
  
  const urlParams = new URLSearchParams({
    origin_iata: params.origin,
    destination_iata: params.destination,
    depart_date: params.departureDate,
    adults: String(params.passengers),
    trip_class: cabinMap[params.cabinClass] || 'Y',
    marker,
    with_request: 'true'
  });
  
  if (params.returnDate && params.tripType === 'roundtrip') {
    urlParams.set('return_date', params.returnDate);
  }
  
  return `${base}?${urlParams.toString()}`;
}

// Enrich flight results with logos and airport data
function enrichFlightResults(flights: ApiFlightResult[], isRealPrice: boolean): ApiFlightResult[] {
  return flights.map(flight => {
    // Add airline logo
    const logo = getAirlineLogo(flight.airlineCode);
    
    // Get full airport names for display
    const originAirport = getAirportByCode(flight.departure.code);
    const destAirport = getAirportByCode(flight.arrival.code);
    
    return {
      ...flight,
      logo,
      isRealPrice,
      departure: {
        ...flight.departure,
        city: originAirport?.city || flight.departure.city,
      },
      arrival: {
        ...flight.arrival,
        city: destAirport?.city || flight.arrival.city,
      }
    };
  });
}

/**
 * Main hook for real-time flight search
 */
export function useAviasalesFlightSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
  cabinClass = 'economy',
  tripType = 'roundtrip',
  enabled = true
}: FlightSearchParams) {
  return useQuery({
    queryKey: ['aviasales-flights', origin, destination, departureDate, returnDate, passengers, cabinClass, tripType],
    queryFn: async (): Promise<FlightSearchResponse> => {
      console.log(`[FlightSearch] Searching ${origin} → ${destination}`);
      
      // Validate inputs
      if (!origin || !destination || origin.length !== 3 || destination.length !== 3) {
        throw new Error('Invalid airport codes');
      }
      
      if (!departureDate) {
        throw new Error('Departure date required');
      }
      
      // Get user IP for rate limiting
      const userIp = await getUserIp();
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('search-flights', {
        body: {
          searchParams: {
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            departureDate,
            returnDate,
            passengers,
            cabinClass,
            tripType
          }
        },
        headers: {
          'x-user-ip': userIp
        }
      });
      
      if (error) {
        console.error('[FlightSearch] Edge function error:', error);
        // Return fallback response
        return {
          flights: [],
          airlines: {},
          isRealPrice: false,
          currency: 'USD',
          fallback: true,
          message: 'Live prices are loading from our partner...',
          whitelabelUrl: buildWhitelabelUrl({ origin, destination, departureDate, returnDate, passengers, cabinClass, tripType })
        };
      }
      
      // Handle rate limiting
      if (data?.error === 'Rate limit exceeded') {
        console.warn('[FlightSearch] Rate limit exceeded');
        return {
          flights: [],
          airlines: {},
          isRealPrice: false,
          currency: 'USD',
          fallback: true,
          message: 'Too many requests. Please try again later.',
          whitelabelUrl: buildWhitelabelUrl({ origin, destination, departureDate, returnDate, passengers, cabinClass, tripType })
        };
      }
      
      // Check for fallback response
      if (data?.fallback) {
        console.log('[FlightSearch] Using fallback/whitelabel');
        return {
          flights: [],
          airlines: data.airlines || {},
          isRealPrice: false,
          currency: 'USD',
          fallback: true,
          message: data.message || 'Live prices are loading from our partner...',
          whitelabelUrl: data.whitelabelUrl || buildWhitelabelUrl({ origin, destination, departureDate, returnDate, passengers, cabinClass, tripType })
        };
      }
      
      // Enrich flight results with client-side data
      const enrichedFlights = enrichFlightResults(data.flights || [], data.isRealPrice);
      
      console.log(`[FlightSearch] Got ${enrichedFlights.length} flights (real: ${data.isRealPrice})`);
      
      return {
        ...data,
        flights: enrichedFlights
      };
    },
    enabled: enabled && !!origin && !!destination && !!departureDate && 
             origin.length === 3 && destination.length === 3,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
    retry: 1,
    retryDelay: 2000
  });
}

// Hook to generate booking deep link with affiliate tracking
export function useBookingDeepLink() {
  const generateLink = (
    flight: ApiFlightResult,
    searchParams: FlightSearchParams,
    trackingParams?: {
      utmSource?: string;
      utmCampaign?: string;
      creator?: string;
      subid?: string;
    }
  ): string => {
    // Build tracked redirect URL through our /out endpoint
    const outParams = new URLSearchParams();
    
    // Flight details
    outParams.set('origin', searchParams.origin);
    outParams.set('destination', searchParams.destination);
    outParams.set('depart', searchParams.departureDate);
    if (searchParams.returnDate) {
      outParams.set('return', searchParams.returnDate);
    }
    outParams.set('passengers', String(searchParams.passengers));
    outParams.set('cabin', searchParams.cabinClass);
    outParams.set('airline', flight.airlineCode);
    outParams.set('flightId', flight.id);
    
    // Tracking params
    if (trackingParams?.utmSource) {
      outParams.set('utm_source', trackingParams.utmSource);
    }
    if (trackingParams?.utmCampaign) {
      outParams.set('utm_campaign', trackingParams.utmCampaign);
    }
    if (trackingParams?.creator) {
      outParams.set('creator', trackingParams.creator);
    }
    if (trackingParams?.subid) {
      outParams.set('subid', trackingParams.subid);
    }
    
    outParams.set('partner', 'aviasales');
    outParams.set('product', 'flights');
    
    return `/out?${outParams.toString()}`;
  };
  
  return { generateLink };
}

/**
 * Hook to get fresh booking link via clicks endpoint (reprice on click)
 * Returns partner booking URL with live pricing
 */
export function useBookingLink() {
  const [isLoading, setIsLoading] = useState(false);
  
  const getBookingLink = async (
    searchId: string,
    resultsUrl: string,
    proposalId: string
  ): Promise<{ url: string | null; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-flights', {
        body: {
          action: 'getBookingLink',
          searchId,
          resultsUrl,
          proposalId
        }
      });
      
      if (error) {
        console.error('[BookingLink] Error:', error);
        return { url: null, error: 'Failed to get booking link' };
      }
      
      if (data?.url) {
        return { url: data.url };
      }
      
      return { url: null, error: 'No booking URL returned' };
    } catch (err) {
      console.error('[BookingLink] Error:', err);
      return { url: null, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };
  
  return { getBookingLink, isLoading };
}
