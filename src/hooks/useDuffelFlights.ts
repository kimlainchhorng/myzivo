/**
 * Duffel Flights API Hook
 * 
 * Provides real flight search using Duffel API
 * ZIVO is the Merchant of Record - Stripe checkout + Duffel ticketing
 * 
 * Includes rate limiting and abuse protection for production safety
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit, RateLimitError } from "@/lib/security/rateLimiter";
import { checkSearchAbuse } from "@/lib/security/searchProtection";
import { transformFlightError } from "@/lib/errors/flightErrors";
import { getSearchSessionId } from "@/config/trackingParams";
import { getAirportAlternate } from "@/data/airports";

export interface DuffelSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface DuffelOffer {
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
  stopDetails: { code: string; city: string; layoverDuration: string }[];
  carriers: { name: string; code: string; isOperating: boolean }[];
  operatedBy: string | null;
  price: number;
  currency: string;
  pricePerPerson: number;
  cabinClass: string;
  fareBrandName: string | null;
  baggageIncluded: string;
  isRefundable: boolean;
  conditions: {
    changeable: boolean;
    refundable: boolean;
    changePenalty: number | null;
    refundPenalty: number | null;
    penaltyCurrency: string;
  };
  baggageDetails: {
    carryOnIncluded: boolean;
    carryOnQuantity: number;
    checkedBagsIncluded: boolean;
    checkedBagQuantity: number;
  };
  segments: DuffelSegment[];
  expiresAt: string;
  passengers: number;
}

export interface DuffelSegment {
  id: string;
  departingAt: string;
  arrivingAt: string;
  origin: {
    code: string;
    name: string;
    city: string;
    terminal?: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    terminal?: string;
  };
  operatingCarrier: string;
  operatingCarrierCode: string;
  marketingCarrier: string;
  marketingCarrierCode: string;
  flightNumber: string;
  aircraft: string;
  duration: string;
  cabinClass: string;
}

export interface DuffelSearchResult {
  offer_request_id: string;
  offers: DuffelOffer[];
  created_at: string;
}

/**
 * Search flights using Duffel API
 */
export function useDuffelFlightSearch(params: DuffelSearchParams & { enabled?: boolean }) {
  const { enabled = true, ...searchParams } = params;

  return useQuery({
    queryKey: ['duffel-flights', searchParams],
    queryFn: async (): Promise<DuffelSearchResult> => {
      // PRODUCTION SAFETY: Check rate limits before search
      const rateLimitResult = await checkRateLimit('flights_search');
      if (!rateLimitResult.allowed) {
        throw new RateLimitError(
          'Too many searches. Please wait a moment and try again.',
          rateLimitResult.retryAfter
        );
      }

      // PRODUCTION SAFETY: Check for abuse patterns
      const sessionId = getSearchSessionId();
      const abuseCheck = checkSearchAbuse(
        searchParams.origin,
        searchParams.destination,
        searchParams.departureDate,
        sessionId
      );

      if (!abuseCheck.allowed) {
        throw new Error(abuseCheck.message || 'Please wait before searching again.');
      }

      // Build passenger list
      const passengers: Array<{ type: 'adult' | 'child' | 'infant_without_seat' }> = [];
      
      for (let i = 0; i < searchParams.passengers.adults; i++) {
        passengers.push({ type: 'adult' });
      }
      for (let i = 0; i < (searchParams.passengers.children || 0); i++) {
        passengers.push({ type: 'child' });
      }
      for (let i = 0; i < (searchParams.passengers.infants || 0); i++) {
        passengers.push({ type: 'infant_without_seat' });
      }

      // Build slices (one-way or round-trip)
      const buildSlices = (origin: string, destination: string) => {
        const s = [
          { origin, destination, departure_date: searchParams.departureDate },
        ];
        if (searchParams.returnDate) {
          s.push({ origin: destination, destination: origin, departure_date: searchParams.returnDate });
        }
        return s;
      };

      const searchDuffel = async (origin: string, destination: string) => {
        const slices = buildSlices(origin, destination);
        const { data, error } = await supabase.functions.invoke('duffel-flights', {
          body: {
            action: 'createOfferRequest',
            slices,
            passengers,
            cabin_class: searchParams.cabinClass,
            max_connections: 2,
          },
        });
        if (error) throw new Error(transformFlightError(error.message || 'Failed to search flights'));
        if (data?.error) throw new Error(transformFlightError(data.error));
        return data as DuffelSearchResult;
      };

      // Primary search
      let result = await searchDuffel(searchParams.origin, searchParams.destination);

      // PNH↔KTI fallback: if no offers, retry with alternate airport code
      if (result.offers.length === 0) {
        const altOrigin = getAirportAlternate(searchParams.origin);
        const altDest = getAirportAlternate(searchParams.destination);

        if (altOrigin) {
          const altResult = await searchDuffel(altOrigin, searchParams.destination);
          if (altResult.offers.length > result.offers.length) result = altResult;
        }
        if (altDest && result.offers.length === 0) {
          const altResult = await searchDuffel(searchParams.origin, altDest);
          if (altResult.offers.length > result.offers.length) result = altResult;
        }
        if (altOrigin && altDest && result.offers.length === 0) {
          const altResult = await searchDuffel(altOrigin, altDest);
          if (altResult.offers.length > result.offers.length) result = altResult;
        }
      }

      return result;
    },
    enabled: enabled && !!searchParams.origin && !!searchParams.destination && !!searchParams.departureDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * Get offers for an existing offer request
 */
export function useDuffelOffers(offerRequestId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['duffel-offers', offerRequestId],
    queryFn: async () => {
      if (!offerRequestId) throw new Error('No offer request ID');

      const { data, error } = await supabase.functions.invoke('duffel-flights', {
        body: {
          action: 'getOffers',
          offer_request_id: offerRequestId,
          sort: 'total_amount',
          max_offers: 50,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return data as { offers: DuffelOffer[]; total: number };
    },
    enabled: !!offerRequestId && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get a single offer by ID
 */
export function useDuffelOffer(offerId: string | null) {
  return useQuery({
    queryKey: ['duffel-offer', offerId],
    queryFn: async () => {
      if (!offerId) throw new Error('No offer ID');

      const { data, error } = await supabase.functions.invoke('duffel-flights', {
        body: {
          action: 'getOffer',
          offer_id: offerId,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return data.offer as DuffelOffer;
    },
    enabled: !!offerId,
    staleTime: 60 * 1000, // 1 minute - offers expire
  });
}

/**
 * Create a booking order (test mode only)
 * In production, use Duffel Links for checkout
 */
export function useDuffelCreateOrder() {
  return useMutation({
    mutationFn: async (params: {
      offerId: string;
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
      metadata?: Record<string, string>;
    }) => {
      const { data, error } = await supabase.functions.invoke('duffel-flights', {
        body: {
          action: 'createOrder',
          offer_id: params.offerId,
          passengers: params.passengers,
          metadata: params.metadata,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return data as {
        order_id: string;
        booking_reference: string;
        created_at: string;
        total_amount: string;
        total_currency: string;
      };
    },
  });
}

/**
 * Available service from Duffel (baggage, seats, etc.)
 */
export interface DuffelAvailableService {
  id: string;
  type: string;
  maximum_quantity: number;
  total_amount: string;
  total_currency: string;
  passenger_ids: string[];
  segment_ids: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Fetch available services (real add-ons) for an offer
 */
export function useDuffelAvailableServices(offerId: string | null) {
  return useQuery({
    queryKey: ['duffel-available-services', offerId],
    queryFn: async () => {
      if (!offerId) throw new Error('No offer ID');

      const { data, error } = await supabase.functions.invoke('duffel-flights', {
        body: {
          action: 'getAvailableServices',
          offer_id: offerId,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return data as {
        services: DuffelAvailableService[];
        grouped: Record<string, DuffelAvailableService[]>;
        total: number;
      };
    },
    enabled: !!offerId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

/**
 */
export function formatDuffelPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get airline logo URL
 */
export function getDuffelAirlineLogo(iataCode: string): string {
  // Use Duffel's airline logo CDN
  return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${iataCode}.svg`;
}
