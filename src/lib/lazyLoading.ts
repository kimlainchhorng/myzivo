/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    LAZY LOADING UTILITIES                                  ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Performance optimization for non-critical UI components.                  ║
 * ║  Ensures affiliate redirect links load FIRST, extras load AFTER.           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Priority loading order for travel pages:
 * 
 * CRITICAL (load immediately):
 * - Header/Navigation
 * - Search form (hero)
 * - Primary CTA buttons
 * - Affiliate disclosure
 * 
 * HIGH (load after critical):
 * - Search results
 * - Partner selector
 * - Sticky booking CTA
 * 
 * LOW (lazy load):
 * - Cross-sell sections
 * - FAQ sections
 * - Trust indicators
 * - Popular destinations
 * - Promotional content
 */
export const LOAD_PRIORITY = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

/**
 * Components that should be lazy loaded (non-critical)
 */
export const LAZY_LOAD_COMPONENTS = [
  'CrossSellBanner',
  'FAQSection',
  'PopularDestinations',
  'TrustIndicators',
  'PriceCalendar',
  'SeasonalDeals',
  'BookingTips',
  'TravelGuides',
] as const;

/**
 * Components that must NEVER be lazy loaded (critical for revenue)
 */
export const NEVER_LAZY_COMPONENTS = [
  'SearchForm',
  'BookingCTA',
  'StickyBookingCTA',
  'ResultCard',
  'PartnerSelector',
  'AffiliateDisclosure',
  'ViewDealButton',
] as const;

/**
 * Check if a component should be lazy loaded
 */
export function shouldLazyLoad(componentName: string): boolean {
  if (NEVER_LAZY_COMPONENTS.includes(componentName as any)) {
    return false;
  }
  return LAZY_LOAD_COMPONENTS.includes(componentName as any);
}
