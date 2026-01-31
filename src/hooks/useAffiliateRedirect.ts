/**
 * ZIVO Affiliate Redirect Hook
 * 
 * Provides easy-to-use affiliate redirect functions for components
 * Handles tracking and deep link generation automatically
 */

import { useCallback } from 'react';
import {
  redirectToFlightPartner,
  redirectToHotelPartner,
  redirectToCarPartner,
  redirectToActivityPartner,
  redirectToPartner,
} from '@/lib/affiliateRedirect';
import type {
  FlightDeepLinkParams,
  HotelDeepLinkParams,
  CarDeepLinkParams,
  ActivityDeepLinkParams,
} from '@/config/affiliateLinks';

type CTAType = 'top_cta' | 'result_card' | 'sticky_cta' | 'compare_prices' | 'no_results_fallback' | 'partner_selector' | 'exit_intent' | 'cross_sell' | 'popular_route' | 'trending_deal';

interface UseAffiliateRedirectOptions {
  source: string;
  ctaType?: CTAType;
}

export function useAffiliateRedirect(options: UseAffiliateRedirectOptions) {
  const { source, ctaType } = options;

  /**
   * Redirect to flight partner with search params
   */
  const redirectToFlights = useCallback((params: FlightDeepLinkParams) => {
    return redirectToFlightPartner(params, { source, ctaType });
  }, [source, ctaType]);

  /**
   * Redirect to hotel partner with search params
   */
  const redirectToHotels = useCallback((params: HotelDeepLinkParams) => {
    return redirectToHotelPartner(params, { source, ctaType });
  }, [source, ctaType]);

  /**
   * Redirect to car rental partner with search params
   */
  const redirectToCars = useCallback((params: CarDeepLinkParams) => {
    return redirectToCarPartner(params, { source, ctaType });
  }, [source, ctaType]);

  /**
   * Redirect to activity partner with search params
   */
  const redirectToActivities = useCallback((params: ActivityDeepLinkParams) => {
    return redirectToActivityPartner(params, { source, ctaType });
  }, [source, ctaType]);

  /**
   * Simple redirect without deep link params
   */
  const redirectSimple = useCallback((serviceType: 'flights' | 'hotels' | 'cars' | 'activities') => {
    return redirectToPartner(serviceType, { source, ctaType });
  }, [source, ctaType]);

  return {
    redirectToFlights,
    redirectToHotels,
    redirectToCars,
    redirectToActivities,
    redirectSimple,
  };
}

/**
 * Shorthand hooks for specific services
 */
export function useFlightRedirect(source: string, ctaType?: CTAType) {
  const { redirectToFlights, redirectSimple } = useAffiliateRedirect({ source, ctaType });
  
  return {
    redirectWithParams: redirectToFlights,
    redirectSimple: () => redirectSimple('flights'),
  };
}

export function useHotelRedirect(source: string, ctaType?: CTAType) {
  const { redirectToHotels, redirectSimple } = useAffiliateRedirect({ source, ctaType });
  
  return {
    redirectWithParams: redirectToHotels,
    redirectSimple: () => redirectSimple('hotels'),
  };
}

export function useCarRedirect(source: string, ctaType?: CTAType) {
  const { redirectToCars, redirectSimple } = useAffiliateRedirect({ source, ctaType });
  
  return {
    redirectWithParams: redirectToCars,
    redirectSimple: () => redirectSimple('cars'),
  };
}

export function useActivityRedirect(source: string, ctaType?: CTAType) {
  const { redirectToActivities, redirectSimple } = useAffiliateRedirect({ source, ctaType });
  
  return {
    redirectWithParams: redirectToActivities,
    redirectSimple: () => redirectSimple('activities'),
  };
}
