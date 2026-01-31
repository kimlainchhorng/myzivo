/**
 * ZIVO A/B Testing Hooks
 * 
 * React hooks for consuming A/B test variants in UI components.
 * Handles automatic tracking of impressions and clicks.
 */

import { useEffect, useMemo, useCallback } from 'react';
import {
  getUserVariant,
  getExperiment,
  getActiveExperiments,
  trackABEvent,
  type ABVariant,
  type ABExperiment,
  type ServiceType,
} from '@/lib/abTesting';

// ============================================
// CORE HOOK
// ============================================

interface UseABTestOptions {
  trackImpression?: boolean;
}

interface UseABTestResult<T = Record<string, any>> {
  variant: ABVariant | undefined;
  config: T;
  variantId: string | undefined;
  isLoading: boolean;
  trackClick: () => void;
  trackConversion: (metadata?: Record<string, any>) => void;
}

/**
 * Hook to get variant for a specific experiment.
 */
export function useABTest<T = Record<string, any>>(
  experimentId: string,
  options: UseABTestOptions = {}
): UseABTestResult<T> {
  const { trackImpression = true } = options;
  
  const variant = useMemo(() => getUserVariant(experimentId), [experimentId]);
  
  // Track impression on mount
  useEffect(() => {
    if (variant && trackImpression) {
      trackABEvent(experimentId, variant.id, 'impression');
    }
  }, [experimentId, variant, trackImpression]);
  
  const trackClick = useCallback(() => {
    if (variant) {
      trackABEvent(experimentId, variant.id, 'click');
    }
  }, [experimentId, variant]);
  
  const trackConversion = useCallback((metadata?: Record<string, any>) => {
    if (variant) {
      trackABEvent(experimentId, variant.id, 'conversion', metadata);
    }
  }, [experimentId, variant]);
  
  return {
    variant,
    config: (variant?.config || {}) as T,
    variantId: variant?.id,
    isLoading: false,
    trackClick,
    trackConversion,
  };
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

interface CTATextConfig {
  primaryText: string;
  secondaryText: string;
}

/**
 * Hook for CTA text A/B testing.
 */
export function useCTAText(service: ServiceType): CTATextConfig & { trackClick: () => void } {
  const experimentId = `${service}_cta_text`;
  const { config, trackClick } = useABTest<CTATextConfig>(experimentId);
  
  // Defaults
  const defaults: Record<ServiceType, CTATextConfig> = {
    flights: { primaryText: 'View Deal', secondaryText: 'Compare Prices' },
    hotels: { primaryText: 'View Hotel', secondaryText: 'Check Availability' },
    cars: { primaryText: 'Rent a Car', secondaryText: 'Compare Rentals' },
    activities: { primaryText: 'Book Now', secondaryText: 'View Details' },
    transfers: { primaryText: 'Book Transfer', secondaryText: 'Compare Options' },
    esim: { primaryText: 'Get eSIM', secondaryText: 'View Plans' },
  };
  
  return {
    primaryText: config.primaryText || defaults[service].primaryText,
    secondaryText: config.secondaryText || defaults[service].secondaryText,
    trackClick,
  };
}

interface CTAColorConfig {
  className: string;
}

/**
 * Hook for CTA color scheme A/B testing.
 */
export function useCTAColor(service: ServiceType): CTAColorConfig & { trackClick: () => void } {
  const { config, trackClick } = useABTest<{ flights?: string; hotels?: string; cars?: string }>('cta_color_scheme');
  
  // Defaults (primary gradients)
  const defaults: Record<ServiceType, string> = {
    flights: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700',
    hotels: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    cars: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600',
    activities: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
    transfers: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    esim: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
  };
  
  const className = (config as Record<string, string>)[service] || defaults[service];
  
  return { className, trackClick };
}

interface CTAPlacementConfig {
  placement: 'right' | 'bottom';
}

/**
 * Hook for CTA placement A/B testing.
 */
export function useCTAPlacement(): CTAPlacementConfig & { trackClick: () => void } {
  const { config, trackClick } = useABTest<CTAPlacementConfig>('cta_placement');
  
  return {
    placement: config.placement || 'right',
    trackClick,
  };
}

interface StickyCTAConfig {
  isSticky: boolean;
}

/**
 * Hook for sticky CTA A/B testing (mobile).
 */
export function useStickyCTA(): StickyCTAConfig & { trackClick: () => void } {
  const { config, trackClick } = useABTest<StickyCTAConfig>('sticky_cta_mobile');
  
  return {
    isSticky: config.isSticky !== false, // Default to sticky
    trackClick,
  };
}

interface ResultSortingConfig {
  sortBy: 'price' | 'value' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

/**
 * Hook for result sorting A/B testing.
 */
export function useResultSorting(): ResultSortingConfig & { trackClick: () => void } {
  const { config, trackClick } = useABTest<ResultSortingConfig>('result_sorting');
  
  return {
    sortBy: config.sortBy || 'price',
    sortOrder: config.sortOrder || 'asc',
    trackClick,
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get all active experiments for a service.
 */
export function useActiveExperiments(service?: ServiceType): ABExperiment[] {
  return useMemo(() => getActiveExperiments(service), [service]);
}

/**
 * Hook to check if user is in a specific experiment variant.
 */
export function useIsVariant(experimentId: string, variantId: string): boolean {
  const variant = useMemo(() => getUserVariant(experimentId), [experimentId]);
  return variant?.id === variantId;
}
