/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    ZIVO AFFILIATE REGISTRY (CENTRAL)                       ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  ALL affiliate links for ZIVO travel services are managed HERE.            ║
 * ║  DO NOT hardcode affiliate URLs in components.                             ║
 * ║  DO NOT modify SubIDs without Business Operations approval.                ║
 * ║                                                                            ║
 * ║  See: src/docs/AFFILIATE_ARCHITECTURE.md for full documentation           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ServiceType = 'flights' | 'hotels' | 'cars' | 'activities';

export interface AffiliatePartner {
  id: string;
  name: string;
  logo: string;
  priority: number; // Higher = preferred (100 = primary)
  isActive: boolean;
  healthCheckUrl?: string;
  lastHealthCheck?: Date;
  isHealthy: boolean;
}

export interface AffiliateConfig {
  serviceType: ServiceType;
  subId: string;
  partners: AffiliatePartner[];
  urlBuilder: (partnerId: string, params: Record<string, any>) => string;
  fallbackMessage: string;
}

// ============================================================================
// PARTNER REGISTRY (SOURCE OF TRUTH)
// ============================================================================

/**
 * LOCKED SubIDs - DO NOT CHANGE without approval
 * - zivo_flights: Flight bookings (Searadar primary)
 * - zivo_hotels: Hotel bookings (Booking.com primary)
 * - zivo_cars: Car rentals (Rentalcars primary)
 * - zivo_activities: Tours & activities (Klook primary)
 */
export const SUBID_REGISTRY = {
  flights: 'zivo_flights',
  hotels: 'zivo_hotels',
  cars: 'zivo_cars',
  activities: 'zivo_activities',
} as const;

// Flight Partners (Priority order)
const FLIGHT_PARTNERS: AffiliatePartner[] = [
  { id: 'searadar', name: 'Searadar', logo: '✈️', priority: 100, isActive: true, isHealthy: true },
  { id: 'skyscanner', name: 'Skyscanner', logo: '🔍', priority: 90, isActive: true, isHealthy: true },
  { id: 'kayak', name: 'Kayak', logo: '🛫', priority: 80, isActive: true, isHealthy: true },
  { id: 'google_flights', name: 'Google Flights', logo: '🌐', priority: 70, isActive: true, isHealthy: true },
];

// Hotel Partners (Priority order)
const HOTEL_PARTNERS: AffiliatePartner[] = [
  { id: 'booking', name: 'Booking.com', logo: '🏨', priority: 100, isActive: true, isHealthy: true },
  { id: 'hotels', name: 'Hotels.com', logo: '🛏️', priority: 95, isActive: true, isHealthy: true },
  { id: 'expedia', name: 'Expedia', logo: '🌐', priority: 90, isActive: true, isHealthy: true },
  { id: 'agoda', name: 'Agoda', logo: '🔴', priority: 85, isActive: true, isHealthy: true },
  { id: 'priceline', name: 'Priceline', logo: '💰', priority: 80, isActive: true, isHealthy: true },
];

// Car Rental Partners (Priority order)
const CAR_PARTNERS: AffiliatePartner[] = [
  { id: 'rentalcars', name: 'Rentalcars.com', logo: '🚗', priority: 100, isActive: true, isHealthy: true },
  { id: 'kayak_cars', name: 'Kayak Cars', logo: '🚙', priority: 90, isActive: true, isHealthy: true },
  { id: 'expedia_cars', name: 'Expedia Cars', logo: '🚐', priority: 85, isActive: true, isHealthy: true },
  { id: 'priceline_cars', name: 'Priceline Cars', logo: '🏎️', priority: 80, isActive: true, isHealthy: true },
];

// Activities Partners (Priority order)
const ACTIVITY_PARTNERS: AffiliatePartner[] = [
  { id: 'klook', name: 'Klook', logo: '🎟️', priority: 100, isActive: true, isHealthy: true },
  { id: 'viator', name: 'Viator', logo: '🎭', priority: 90, isActive: true, isHealthy: true },
  { id: 'getyourguide', name: 'GetYourGuide', logo: '🗺️', priority: 85, isActive: true, isHealthy: true },
];

// ============================================================================
// URL BUILDERS (Centralized URL generation)
// ============================================================================

function buildFlightUrl(partnerId: string, params: Record<string, any>): string {
  const { origin, destination, departDate, returnDate, passengers = 1, cabinClass = 'economy' } = params;
  const subId = SUBID_REGISTRY.flights;
  
  switch (partnerId) {
    case 'searadar':
      return `https://searadar.tpo.li/iAbLlX9i?subid=${subId}`;
    case 'skyscanner':
      const dateFormatted = departDate?.replace(/-/g, '').substring(2) || '';
      let url = `https://www.skyscanner.com/transport/flights/${origin?.toLowerCase()}/${destination?.toLowerCase()}/${dateFormatted}/`;
      if (returnDate) url += `${returnDate.replace(/-/g, '').substring(2)}/`;
      return `${url}?adultsv2=${passengers}&cabinclass=${cabinClass}&utm_source=zivo&utm_medium=affiliate`;
    case 'kayak':
      return `https://www.kayak.com/flights/${origin}-${destination}/${departDate || ''}${returnDate ? `/${returnDate}` : ''}/${passengers}adults?sort=bestflight_a&utm_source=zivo`;
    case 'google_flights':
      return `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}%20on%20${departDate}&curr=USD`;
    default:
      return `https://searadar.tpo.li/iAbLlX9i?subid=${subId}`;
  }
}

function buildHotelUrl(partnerId: string, params: Record<string, any>): string {
  const { destination, checkIn, checkOut, guests = 2, rooms = 1 } = params;
  
  switch (partnerId) {
    case 'booking':
      const bookingParams = new URLSearchParams();
      bookingParams.set('ss', destination || '');
      if (checkIn) bookingParams.set('checkin', checkIn);
      if (checkOut) bookingParams.set('checkout', checkOut);
      bookingParams.set('group_adults', String(guests));
      bookingParams.set('no_rooms', String(rooms));
      return `https://www.booking.com/searchresults.html?${bookingParams.toString()}`;
    case 'hotels':
      const hotelsParams = new URLSearchParams();
      hotelsParams.set('q-destination', destination || '');
      if (checkIn) hotelsParams.set('q-check-in', checkIn);
      if (checkOut) hotelsParams.set('q-check-out', checkOut);
      hotelsParams.set('q-room-0-adults', String(guests));
      return `https://www.hotels.com/search.do?${hotelsParams.toString()}`;
    case 'expedia':
      const expediaParams = new URLSearchParams();
      expediaParams.set('destination', destination || '');
      if (checkIn) expediaParams.set('startDate', checkIn);
      if (checkOut) expediaParams.set('endDate', checkOut);
      expediaParams.set('adults', String(guests));
      expediaParams.set('rooms', String(rooms));
      return `https://www.expedia.com/Hotel-Search?${expediaParams.toString()}`;
    default:
      const defaultParams = new URLSearchParams();
      defaultParams.set('ss', destination || '');
      return `https://www.booking.com/searchresults.html?${defaultParams.toString()}`;
  }
}

function buildCarUrl(partnerId: string, params: Record<string, any>): string {
  const { pickupLocation, pickupDate, returnDate, pickupTime = '10:00', returnTime = '10:00', driverAge = 25 } = params;
  
  switch (partnerId) {
    case 'rentalcars':
      const rcParams = new URLSearchParams();
      rcParams.set('location', pickupLocation || '');
      if (pickupDate) rcParams.set('puDate', pickupDate);
      if (returnDate) rcParams.set('doDate', returnDate);
      rcParams.set('puTime', pickupTime);
      rcParams.set('doTime', returnTime);
      rcParams.set('driverAge', String(driverAge));
      return `https://www.rentalcars.com/search?${rcParams.toString()}`;
    case 'kayak_cars':
      return `https://www.kayak.com/cars/${encodeURIComponent(pickupLocation || '')}/${pickupDate || ''}/${returnDate || ''}?sort=price_a&utm_source=zivo`;
    case 'expedia_cars':
      const expParams = new URLSearchParams();
      expParams.set('pickupLocation', pickupLocation || '');
      if (pickupDate) expParams.set('pickupDate', pickupDate);
      if (returnDate) expParams.set('dropoffDate', returnDate);
      return `https://www.expedia.com/Cars?${expParams.toString()}`;
    default:
      return `https://www.rentalcars.com/search?location=${encodeURIComponent(pickupLocation || '')}`;
  }
}

function buildActivityUrl(partnerId: string, params: Record<string, any>): string {
  const { destination, date } = params;
  const subId = SUBID_REGISTRY.activities;
  
  switch (partnerId) {
    case 'klook':
      return `https://klook.tpo.li/ToVcOax7?subid=${subId}`;
    case 'viator':
      return `https://www.viator.com/search/${encodeURIComponent(destination || '')}?pid=zivo`;
    case 'getyourguide':
      return `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination || '')}&partner_id=zivo`;
    default:
      return `https://klook.tpo.li/ToVcOax7?subid=${subId}`;
  }
}

// ============================================================================
// AFFILIATE REGISTRY (Main export)
// ============================================================================

export const AFFILIATE_REGISTRY: Record<ServiceType, AffiliateConfig> = {
  flights: {
    serviceType: 'flights',
    subId: SUBID_REGISTRY.flights,
    partners: FLIGHT_PARTNERS,
    urlBuilder: buildFlightUrl,
    fallbackMessage: 'Search flights on our partner site',
  },
  hotels: {
    serviceType: 'hotels',
    subId: SUBID_REGISTRY.hotels,
    partners: HOTEL_PARTNERS,
    urlBuilder: buildHotelUrl,
    fallbackMessage: 'Search hotels on our partner site',
  },
  cars: {
    serviceType: 'cars',
    subId: SUBID_REGISTRY.cars,
    partners: CAR_PARTNERS,
    urlBuilder: buildCarUrl,
    fallbackMessage: 'Search car rentals on our partner site',
  },
  activities: {
    serviceType: 'activities',
    subId: SUBID_REGISTRY.activities,
    partners: ACTIVITY_PARTNERS,
    urlBuilder: buildActivityUrl,
    fallbackMessage: 'Search activities on our partner site',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the primary (highest priority, healthy) partner for a service
 */
export function getPrimaryPartner(serviceType: ServiceType): AffiliatePartner {
  const config = AFFILIATE_REGISTRY[serviceType];
  const healthyPartners = config.partners
    .filter(p => p.isActive && p.isHealthy)
    .sort((a, b) => b.priority - a.priority);
  
  return healthyPartners[0] || config.partners[0];
}

/**
 * Get fallback partner (second highest priority)
 */
export function getFallbackPartner(serviceType: ServiceType): AffiliatePartner | null {
  const config = AFFILIATE_REGISTRY[serviceType];
  const healthyPartners = config.partners
    .filter(p => p.isActive && p.isHealthy)
    .sort((a, b) => b.priority - a.priority);
  
  return healthyPartners[1] || null;
}

/**
 * Build affiliate URL with automatic fallback support
 */
export function buildAffiliateUrl(
  serviceType: ServiceType,
  params: Record<string, any>,
  preferredPartnerId?: string
): string {
  const config = AFFILIATE_REGISTRY[serviceType];
  
  // Try preferred partner first
  if (preferredPartnerId) {
    const partner = config.partners.find(p => p.id === preferredPartnerId);
    if (partner?.isActive && partner?.isHealthy) {
      return config.urlBuilder(preferredPartnerId, params);
    }
  }
  
  // Use primary partner
  const primary = getPrimaryPartner(serviceType);
  return config.urlBuilder(primary.id, params);
}

/**
 * Open affiliate link with fallback protection
 * CRITICAL: This is the ONLY function that should open affiliate links
 */
export function openAffiliateLink(
  serviceType: ServiceType,
  params: Record<string, any>,
  preferredPartnerId?: string
): { success: boolean; partnerId: string; url: string } {
  const config = AFFILIATE_REGISTRY[serviceType];
  const primary = getPrimaryPartner(serviceType);
  const partnerId = preferredPartnerId || primary.id;
  
  let url = buildAffiliateUrl(serviceType, params, partnerId);
  
  try {
    // Instant redirect - no blocking scripts
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!win) {
      // Popup blocked - try fallback partner
      const fallback = getFallbackPartner(serviceType);
      if (fallback) {
        url = config.urlBuilder(fallback.id, params);
        window.location.href = url; // Direct navigation as last resort
        return { success: true, partnerId: fallback.id, url };
      }
    }
    
    return { success: true, partnerId, url };
  } catch (error) {
    // Emergency fallback
    const fallback = getFallbackPartner(serviceType);
    if (fallback) {
      url = config.urlBuilder(fallback.id, params);
      window.location.href = url;
      return { success: true, partnerId: fallback.id, url };
    }
    
    console.error('[Affiliate] All redirect attempts failed:', error);
    return { success: false, partnerId, url };
  }
}

/**
 * Get all active partners for a service (for partner selector UI)
 */
export function getActivePartners(serviceType: ServiceType): AffiliatePartner[] {
  return AFFILIATE_REGISTRY[serviceType].partners
    .filter(p => p.isActive)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Check partner health (for monitoring)
 */
export function checkPartnerHealth(): Record<ServiceType, { healthy: number; total: number }> {
  const health: Record<ServiceType, { healthy: number; total: number }> = {} as any;
  
  for (const [service, config] of Object.entries(AFFILIATE_REGISTRY)) {
    const activePartners = config.partners.filter(p => p.isActive);
    const healthyPartners = activePartners.filter(p => p.isHealthy);
    health[service as ServiceType] = {
      healthy: healthyPartners.length,
      total: activePartners.length,
    };
  }
  
  return health;
}
