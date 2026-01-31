/**
 * ZIVO Multi-Partner Affiliate System
 * 
 * PRODUCTION-READY AFFILIATE INFRASTRUCTURE
 * Supports multiple affiliate networks with dynamic deep links
 * 
 * Primary Networks:
 * - Travelpayouts (Flights, Hotels, Cars, Activities)
 * - Secondary partners configurable for future expansion
 * 
 * IMPORTANT: Do not modify SubIDs without Business Operations approval.
 * 
 * Last Updated: 2026-01-31
 */

// ============================================
// CORE TYPES
// ============================================

export interface AffiliatePartner {
  id: string;
  name: string;
  network: 'travelpayouts' | 'direct' | 'cj' | 'awin' | 'skyscanner' | 'other';
  baseUrl: string;
  trackingUrl: string;
  subId: string;
  commissionRate: string;
  features: string[];
  logo: string;
  isActive: boolean;
  priority: number; // Higher = preferred
  supportedRegions?: string[];
}

export interface FlightDeepLinkParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway' | 'multicity';
  currency?: string;
  locale?: string;
}

export interface HotelDeepLinkParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  currency?: string;
  locale?: string;
}

export interface CarDeepLinkParams {
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  driverAge?: number;
  vehicleType?: 'economy' | 'compact' | 'midsize' | 'suv' | 'luxury' | 'van';
  currency?: string;
}

export interface ActivityDeepLinkParams {
  destination: string;
  date?: string;
  category?: string;
  currency?: string;
}

// ============================================
// TRAVELPAYOUTS CONFIGURATION (Primary Network)
// ============================================

const TRAVELPAYOUTS_MARKER = '589611';

export const TRAVELPAYOUTS_CONFIG = {
  marker: TRAVELPAYOUTS_MARKER,
  networks: {
    flights: {
      name: 'Aviasales/Searadar',
      trackingDomain: 'searadar.tpo.li',
      campaignId: 'iAbLlX9i',
      subId: 'zivo_flights',
    },
    hotels: {
      name: 'Hotellook',
      trackingDomain: 'hotellook.tpo.li',
      campaignId: '',
      subId: 'zivo_hotels',
    },
    cars: {
      name: 'EconomyBookings',
      trackingDomain: 'economybookings.tpo.li',
      campaignId: '',
      subId: 'zivo_cars',
    },
    activities: {
      name: 'Klook',
      trackingDomain: 'klook.tpo.li',
      campaignId: 'ToVcOax7',
      subId: 'zivo_activities',
    },
  },
} as const;

// ============================================
// MULTI-PARTNER REGISTRIES
// ============================================

export const FLIGHT_PARTNERS: AffiliatePartner[] = [
  {
    id: 'searadar',
    name: 'Searadar (Aviasales)',
    network: 'travelpayouts',
    baseUrl: 'https://www.aviasales.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.flights.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.flights.campaignId}`,
    subId: 'zivo_flights',
    commissionRate: '0.5-3%',
    features: ['728 airlines', 'Real-time prices', 'Multi-city search', 'Price calendar'],
    logo: '✈️',
    isActive: true,
    priority: 100,
  },
  // Future: Skyscanner when approved
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    network: 'skyscanner',
    baseUrl: 'https://www.skyscanner.com',
    trackingUrl: 'https://www.skyscanner.com', // Replace with actual tracking URL when approved
    subId: 'zivo_flights_sky',
    commissionRate: '0.5-2%',
    features: ['Price alerts', 'Flexible dates', 'Everywhere search'],
    logo: '🔍',
    isActive: false, // Enable when approved
    priority: 90,
  },
];

export const HOTEL_PARTNERS: AffiliatePartner[] = [
  {
    id: 'hotellook',
    name: 'Hotellook',
    network: 'travelpayouts',
    baseUrl: 'https://www.hotellook.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.hotels.trackingDomain}`,
    subId: 'zivo_hotels',
    commissionRate: '4-8%',
    features: ['2M+ hotels', 'Price comparison', 'No booking fees', 'Free cancellation'],
    logo: '🏨',
    isActive: true,
    priority: 100,
  },
  // Booking.com via Travelpayouts network
  {
    id: 'booking_tp',
    name: 'Booking.com',
    network: 'travelpayouts',
    baseUrl: 'https://www.booking.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.hotels.trackingDomain}`,
    subId: 'zivo_hotels_bdc',
    commissionRate: '4-6%',
    features: ['Free cancellation', 'Genius discounts', 'Best price guarantee'],
    logo: '🔵',
    isActive: true,
    priority: 95,
  },
];

export const CAR_PARTNERS: AffiliatePartner[] = [
  {
    id: 'economybookings',
    name: 'EconomyBookings',
    network: 'travelpayouts',
    baseUrl: 'https://www.economybookings.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.cars.trackingDomain}`,
    subId: 'zivo_cars',
    commissionRate: '4-6%',
    features: ['500+ providers', 'No hidden fees', 'Free cancellation', 'Best price guarantee'],
    logo: '🚗',
    isActive: true,
    priority: 100,
  },
  // DiscoverCars via Travelpayouts
  {
    id: 'discovercars',
    name: 'DiscoverCars',
    network: 'travelpayouts',
    baseUrl: 'https://www.discovercars.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.cars.trackingDomain}`,
    subId: 'zivo_cars_dc',
    commissionRate: '4-8%',
    features: ['Price match', 'Full insurance options', '24/7 support'],
    logo: '🚙',
    isActive: true,
    priority: 90,
  },
];

export const ACTIVITY_PARTNERS: AffiliatePartner[] = [
  {
    id: 'klook',
    name: 'Klook',
    network: 'travelpayouts',
    baseUrl: 'https://www.klook.com',
    trackingUrl: `https://${TRAVELPAYOUTS_CONFIG.networks.activities.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.activities.campaignId}`,
    subId: 'zivo_activities',
    commissionRate: '2-5%',
    features: ['100K+ activities', 'Instant confirmation', 'Best price guarantee', 'Mobile voucher'],
    logo: '🎯',
    isActive: true,
    priority: 100,
  },
];

// ============================================
// DEEP LINK BUILDERS
// ============================================

/**
 * Build flight deep link with full search parameters
 */
export function buildFlightDeepLink(params: FlightDeepLinkParams, partnerId?: string): string {
  const { origin, destination, departDate, returnDate, passengers, cabinClass, tripType, currency = 'USD', locale = 'en' } = params;
  
  // Get partner (default to highest priority active partner)
  const partner = partnerId 
    ? FLIGHT_PARTNERS.find(p => p.id === partnerId && p.isActive)
    : getActivePartners('flights')[0];
  
  if (!partner) {
    console.warn('[Affiliate] No active flight partner found');
    return AFFILIATE_LINKS.flights.url;
  }
  
  // Format dates for Aviasales (DDMM)
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}${month}`;
  };
  
  const depart = formatDate(departDate);
  const returnFormatted = returnDate ? formatDate(returnDate) : '';
  
  // Cabin class mapping
  const cabinMap = {
    economy: 'Y',
    premium_economy: 'W',
    business: 'C',
    first: 'F',
  };
  
  const queryParams = new URLSearchParams({
    subid: partner.subId,
    origin_iata: origin,
    destination_iata: destination,
    depart_date: departDate,
    return_date: returnDate || '',
    adults: String(passengers),
    cabin: cabinMap[cabinClass],
    one_way: tripType === 'oneway' ? 'true' : 'false',
    currency,
    locale,
  });
  
  return `${partner.trackingUrl}?${queryParams.toString()}`;
}

/**
 * Build hotel deep link with full search parameters
 */
export function buildHotelDeepLink(params: HotelDeepLinkParams, partnerId?: string): string {
  const { destination, checkIn, checkOut, guests, rooms, currency = 'USD', locale = 'en' } = params;
  
  const partner = partnerId 
    ? HOTEL_PARTNERS.find(p => p.id === partnerId && p.isActive)
    : getActivePartners('hotels')[0];
  
  if (!partner) {
    console.warn('[Affiliate] No active hotel partner found');
    return AFFILIATE_LINKS.hotels.url;
  }
  
  const queryParams = new URLSearchParams({
    subid: partner.subId,
    destination,
    checkIn,
    checkOut,
    adults: String(guests),
    rooms: String(rooms),
    currency,
    locale,
  });
  
  return `${partner.trackingUrl}?${queryParams.toString()}`;
}

/**
 * Build car rental deep link with full search parameters
 */
export function buildCarDeepLink(params: CarDeepLinkParams, partnerId?: string): string {
  const { pickupLocation, pickupDate, returnDate, pickupTime, returnTime, driverAge = 30, vehicleType, currency = 'USD' } = params;
  
  const partner = partnerId 
    ? CAR_PARTNERS.find(p => p.id === partnerId && p.isActive)
    : getActivePartners('cars')[0];
  
  if (!partner) {
    console.warn('[Affiliate] No active car partner found');
    return AFFILIATE_LINKS.cars.url;
  }
  
  const queryParams = new URLSearchParams({
    subid: partner.subId,
    pickup: pickupLocation,
    pickupDate,
    returnDate,
    currency,
  });
  
  if (pickupTime) queryParams.set('pickupTime', pickupTime);
  if (returnTime) queryParams.set('returnTime', returnTime);
  if (driverAge) queryParams.set('driverAge', String(driverAge));
  if (vehicleType) queryParams.set('vehicleType', vehicleType);
  
  return `${partner.trackingUrl}?${queryParams.toString()}`;
}

/**
 * Build activity deep link with search parameters
 */
export function buildActivityDeepLink(params: ActivityDeepLinkParams, partnerId?: string): string {
  const { destination, date, category, currency = 'USD' } = params;
  
  const partner = partnerId 
    ? ACTIVITY_PARTNERS.find(p => p.id === partnerId && p.isActive)
    : getActivePartners('activities')[0];
  
  if (!partner) {
    console.warn('[Affiliate] No active activity partner found');
    return AFFILIATE_LINKS.activities.url;
  }
  
  const queryParams = new URLSearchParams({
    subid: partner.subId,
    city: destination,
    currency,
  });
  
  if (date) queryParams.set('date', date);
  if (category) queryParams.set('category', category);
  
  return `${partner.trackingUrl}?${queryParams.toString()}`;
}

// ============================================
// SIMPLE AFFILIATE LINKS (Fallbacks)
// ============================================

export interface AffiliateLink {
  url: string;
  name: string;
  description: string;
  subId: string;
  fallbackUrl?: string;
}

export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  flights: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.flights.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.flights.campaignId}?subid=${TRAVELPAYOUTS_CONFIG.networks.flights.subId}`,
    name: "Searadar",
    description: "Search and compare flight prices from 728 airlines",
    subId: TRAVELPAYOUTS_CONFIG.networks.flights.subId,
    fallbackUrl: "https://www.aviasales.com",
  },
  hotels: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.hotels.trackingDomain}?subid=${TRAVELPAYOUTS_CONFIG.networks.hotels.subId}`,
    name: "Hotellook",
    description: "Compare hotel prices across booking sites",
    subId: TRAVELPAYOUTS_CONFIG.networks.hotels.subId,
    fallbackUrl: "https://www.hotellook.com",
  },
  cars: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.cars.trackingDomain}?subid=${TRAVELPAYOUTS_CONFIG.networks.cars.subId}`,
    name: "EconomyBookings",
    description: "Compare car rental prices from 500+ providers",
    subId: TRAVELPAYOUTS_CONFIG.networks.cars.subId,
    fallbackUrl: "https://www.economybookings.com",
  },
  activities: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.activities.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.activities.campaignId}?subid=${TRAVELPAYOUTS_CONFIG.networks.activities.subId}`,
    name: "Klook",
    description: "Book tours, activities, and attractions worldwide",
    subId: TRAVELPAYOUTS_CONFIG.networks.activities.subId,
    fallbackUrl: "https://www.klook.com",
  },
} as const;

// ============================================
// PARTNER HELPER FUNCTIONS
// ============================================

type ServiceType = 'flights' | 'hotels' | 'cars' | 'activities';

/**
 * Get all active partners for a service, sorted by priority
 */
export function getActivePartners(serviceType: ServiceType): AffiliatePartner[] {
  const partnerMap = {
    flights: FLIGHT_PARTNERS,
    hotels: HOTEL_PARTNERS,
    cars: CAR_PARTNERS,
    activities: ACTIVITY_PARTNERS,
  };
  
  return partnerMap[serviceType]
    .filter(p => p.isActive)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get primary (highest priority active) partner
 */
export function getPrimaryPartner(serviceType: ServiceType): AffiliatePartner | null {
  const active = getActivePartners(serviceType);
  return active[0] || null;
}

/**
 * Get partner by ID
 */
export function getPartnerById(serviceType: ServiceType, partnerId: string): AffiliatePartner | null {
  const partnerMap = {
    flights: FLIGHT_PARTNERS,
    hotels: HOTEL_PARTNERS,
    cars: CAR_PARTNERS,
    activities: ACTIVITY_PARTNERS,
  };
  
  return partnerMap[serviceType].find(p => p.id === partnerId) || null;
}

/**
 * Select best partner based on context (region, time, A/B test, etc.)
 * For now, returns highest priority. Can be extended for smarter selection.
 */
export function selectBestPartner(
  serviceType: ServiceType, 
  _context?: { region?: string; testGroup?: string }
): AffiliatePartner | null {
  // Future: Add logic for region-based selection, A/B testing, etc.
  return getPrimaryPartner(serviceType);
}

// ============================================
// COMPLIANCE TEXT
// ============================================

export const AFFILIATE_DISCLOSURE_TEXT = {
  short: "You will be redirected to our trusted travel partner to complete your booking.",
  full: "ZIVO may earn a commission when you book through our partner links at no extra cost to you.",
  detailed: "ZIVO acts as a search and comparison platform. When you click a booking link, you will be redirected to our trusted travel partner to complete your booking. ZIVO may earn a commission at no additional cost to you.",
  payment: "All bookings, payments, refunds, and changes are handled directly by our travel partners.",
  price: "Prices shown are indicative and may change. Final price will be confirmed on partner site.",
  legal: "ZIVO is not responsible for the content, accuracy, or practices of partner websites.",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function openAffiliateLink(type: keyof typeof AFFILIATE_LINKS): void {
  const link = AFFILIATE_LINKS[type];
  if (!link) {
    console.warn(`[Affiliate] Unknown link type: ${type}`);
    return;
  }
  
  try {
    window.open(link.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    if (link.fallbackUrl) {
      console.warn(`[Affiliate] Primary link failed, using fallback for ${type}`);
      window.open(link.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }
}

export function getAffiliateUrl(type: keyof typeof AFFILIATE_LINKS): string {
  const link = AFFILIATE_LINKS[type];
  return link?.url || link?.fallbackUrl || "#";
}

export function getAffiliateLinkHealth(): Record<string, boolean> {
  const health: Record<string, boolean> = {};
  for (const [key, link] of Object.entries(AFFILIATE_LINKS)) {
    health[key] = Boolean(link.url);
  }
  return health;
}
