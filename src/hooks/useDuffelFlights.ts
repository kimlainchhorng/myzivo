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
import { transformFlightError } from "@/lib/errors/flightErrors";
import { getAirportAlternate } from "@/data/airports";
...
    queryFn: async (): Promise<DuffelSearchResult> => {
      // Keep lightweight client-side rate limiting, but do not block legitimate repeated
      // flight searches before Duffel/cache can respond.
      const rateLimitResult = await checkRateLimit('flights_search');
      if (!rateLimitResult.allowed) {
        throw new RateLimitError(
          'Too many searches. Please wait a moment and try again.',
          rateLimitResult.retryAfter
        );
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
    staleTime: 2 * 60 * 1000, // 2 minutes - match server cache TTL
    gcTime: 5 * 60 * 1000, // 5 minutes
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

      // If edge function returned an error (400), check if it's a known "expired/not found" case
      if (error) {
        console.warn('[useDuffelOffer] Edge function error:', error.message);
        return null;
      }
      if (data?.error) {
        console.warn('[useDuffelOffer] Duffel error:', data.error);
        return null;
      }

      return data.offer as DuffelOffer;
    },
    enabled: !!offerId,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on "resource not found" / expired offer errors
      const msg = (error as Error)?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || msg.includes('no longer available') || msg.includes('expired')) {
        return false;
      }
      return failureCount < 2;
    },
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

      if (error) {
        console.warn('[useDuffelAvailableServices] Edge function error:', error.message);
        return {
          services: [],
          grouped: {},
          total: 0,
        };
      }
      if (data?.error) {
        console.warn('[useDuffelAvailableServices] Duffel error:', data.error);
        return {
          services: [],
          grouped: {},
          total: 0,
        };
      }

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
