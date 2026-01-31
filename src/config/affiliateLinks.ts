/**
 * ZIVO Affiliate Link Configuration
 * 
 * PRODUCTION AFFILIATE SYSTEM
 * Supports multiple affiliate networks with dynamic deep links
 * 
 * Primary Partner: Travelpayouts
 * - Flights: Aviasales/Searadar
 * - Hotels: Hotellook
 * - Activities: Klook
 * - Cars: EconomyBookings/DiscoverCars
 * 
 * IMPORTANT: Do not modify SubIDs without Business Operations approval.
 * See src/docs/AFFILIATE_SUBID_MAPPING.md for full documentation.
 * 
 * Last Updated: 2026-01-31
 */

// ============================================
// AFFILIATE PARTNER TYPES
// ============================================

export interface AffiliatePartner {
  id: string;
  name: string;
  network: 'travelpayouts' | 'direct' | 'cj' | 'awin' | 'other';
  baseUrl: string;
  trackingUrl: string;
  subId: string;
  commissionRate: string;
  features: string[];
  logo: string;
  isActive: boolean;
  priority: number;
}

export interface FlightDeepLinkParams {
  origin: string;         // IATA code (e.g., "JFK")
  destination: string;    // IATA code (e.g., "LAX")
  departDate: string;     // YYYY-MM-DD
  returnDate?: string;    // YYYY-MM-DD (optional for one-way)
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway' | 'multicity';
}

export interface HotelDeepLinkParams {
  destination: string;    // City name or hotel name
  checkIn: string;        // YYYY-MM-DD
  checkOut: string;       // YYYY-MM-DD
  guests: number;
  rooms: number;
}

export interface CarDeepLinkParams {
  pickupLocation: string; // City or airport code
  pickupDate: string;     // YYYY-MM-DD
  returnDate: string;     // YYYY-MM-DD
  pickupTime?: string;    // HH:MM
  returnTime?: string;    // HH:MM
  driverAge?: number;
}

export interface ActivityDeepLinkParams {
  destination: string;    // City name
  date?: string;          // YYYY-MM-DD (optional)
  category?: string;      // tours, attractions, experiences
}

// ============================================
// TRAVELPAYOUTS CONFIGURATION
// ============================================

const TRAVELPAYOUTS_MARKER = '589611'; // Your Travelpayouts affiliate ID

export const TRAVELPAYOUTS_CONFIG = {
  marker: TRAVELPAYOUTS_MARKER,
  networks: {
    flights: {
      name: 'Aviasales/Searadar',
      trackingDomain: 'searadar.tpo.li',
      campaignId: 'iAbLlX9i',
    },
    hotels: {
      name: 'Hotellook',
      trackingDomain: 'hotellook.tpo.li',
      campaignId: '',
    },
    cars: {
      name: 'EconomyBookings',
      trackingDomain: 'economybookings.tpo.li',
      campaignId: '',
    },
    activities: {
      name: 'Klook',
      trackingDomain: 'klook.tpo.li',
      campaignId: 'ToVcOax7',
    },
  },
} as const;

// ============================================
// AFFILIATE LINK BUILDERS
// ============================================

/**
 * Build Travelpayouts flight deep link with search parameters
 */
export function buildFlightDeepLink(params: FlightDeepLinkParams): string {
  const { origin, destination, departDate, returnDate, passengers, cabinClass, tripType } = params;
  
  // Convert date format for Aviasales (DDMM)
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
  
  // Build the search URL path
  const searchPath = returnDate 
    ? `${origin}${depart}${destination}${returnFormatted}${passengers}`
    : `${origin}${depart}${destination}${passengers}`;
  
  const baseUrl = `https://${TRAVELPAYOUTS_CONFIG.networks.flights.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.flights.campaignId}`;
  
  const queryParams = new URLSearchParams({
    subid: 'zivo_flights',
    origin_iata: origin,
    destination_iata: destination,
    depart_date: departDate,
    return_date: returnDate || '',
    adults: String(passengers),
    cabin: cabinMap[cabinClass],
    one_way: tripType === 'oneway' ? 'true' : 'false',
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Build Travelpayouts hotel deep link with search parameters
 */
export function buildHotelDeepLink(params: HotelDeepLinkParams): string {
  const { destination, checkIn, checkOut, guests, rooms } = params;
  
  const baseUrl = `https://${TRAVELPAYOUTS_CONFIG.networks.hotels.trackingDomain}`;
  
  const queryParams = new URLSearchParams({
    subid: 'zivo_hotels',
    destination: destination,
    checkIn: checkIn,
    checkOut: checkOut,
    adults: String(guests),
    rooms: String(rooms),
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Build Travelpayouts car rental deep link with search parameters
 */
export function buildCarDeepLink(params: CarDeepLinkParams): string {
  const { pickupLocation, pickupDate, returnDate, pickupTime, returnTime, driverAge } = params;
  
  const baseUrl = `https://${TRAVELPAYOUTS_CONFIG.networks.cars.trackingDomain}`;
  
  const queryParams = new URLSearchParams({
    subid: 'zivo_cars',
    pickup: pickupLocation,
    pickupDate: pickupDate,
    returnDate: returnDate,
  });
  
  if (pickupTime) queryParams.set('pickupTime', pickupTime);
  if (returnTime) queryParams.set('returnTime', returnTime);
  if (driverAge) queryParams.set('driverAge', String(driverAge));
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Build Klook activity deep link with search parameters
 */
export function buildActivityDeepLink(params: ActivityDeepLinkParams): string {
  const { destination, date, category } = params;
  
  const baseUrl = `https://${TRAVELPAYOUTS_CONFIG.networks.activities.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.activities.campaignId}`;
  
  const queryParams = new URLSearchParams({
    subid: 'zivo_activities',
    city: destination,
  });
  
  if (date) queryParams.set('date', date);
  if (category) queryParams.set('category', category);
  
  return `${baseUrl}?${queryParams.toString()}`;
}

// ============================================
// LEGACY AFFILIATE LINKS (Simple redirects)
// ============================================

export interface AffiliateLink {
  url: string;
  name: string;
  description: string;
  subId: string;
  fallbackUrl?: string;
}

export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  // Searadar - Flight search and booking
  flights: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.flights.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.flights.campaignId}?subid=zivo_flights`,
    name: "Searadar",
    description: "Search and compare flight prices from 728 airlines",
    subId: "zivo_flights",
    fallbackUrl: "https://www.skyscanner.com/?utm_source=zivo",
  },
  
  // Hotels - Hotellook
  hotels: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.hotels.trackingDomain}?subid=zivo_hotels`,
    name: "Hotellook",
    description: "Compare hotel prices across booking sites",
    subId: "zivo_hotels",
    fallbackUrl: "https://www.booking.com/?aid=zivo",
  },
  
  // Car Rentals - EconomyBookings
  cars: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.cars.trackingDomain}?subid=zivo_cars`,
    name: "EconomyBookings",
    description: "Compare car rental prices worldwide",
    subId: "zivo_cars",
    fallbackUrl: "https://www.rentalcars.com/?affiliateCode=zivo",
  },
  
  // Klook - Activities, tours, and attractions
  activities: {
    url: `https://${TRAVELPAYOUTS_CONFIG.networks.activities.trackingDomain}/${TRAVELPAYOUTS_CONFIG.networks.activities.campaignId}?subid=zivo_activities`,
    name: "Klook",
    description: "Book tours, activities, and attractions worldwide",
    subId: "zivo_activities",
    fallbackUrl: "https://www.viator.com/?pid=zivo",
  },
} as const;

// ============================================
// MULTI-PARTNER REGISTRY
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
    features: ['728 airlines', 'Real-time prices', 'Multi-city search'],
    logo: '✈️',
    isActive: true,
    priority: 100,
  },
  // Additional partners can be added here
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
    features: ['2M+ hotels', 'Price comparison', 'Best rate guarantee'],
    logo: '🏨',
    isActive: true,
    priority: 100,
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
    features: ['500+ providers', 'No hidden fees', 'Free cancellation'],
    logo: '🚗',
    isActive: true,
    priority: 100,
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
    features: ['100K+ activities', 'Instant confirmation', 'Best price guarantee'],
    logo: '🎯',
    isActive: true,
    priority: 100,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get primary partner for a service type
 */
export function getPrimaryPartner(serviceType: 'flights' | 'hotels' | 'cars' | 'activities'): AffiliatePartner {
  const partners = {
    flights: FLIGHT_PARTNERS,
    hotels: HOTEL_PARTNERS,
    cars: CAR_PARTNERS,
    activities: ACTIVITY_PARTNERS,
  };
  
  return partners[serviceType].sort((a, b) => b.priority - a.priority)[0];
}

/**
 * Get all active partners for a service type
 */
export function getActivePartners(serviceType: 'flights' | 'hotels' | 'cars' | 'activities'): AffiliatePartner[] {
  const partners = {
    flights: FLIGHT_PARTNERS,
    hotels: HOTEL_PARTNERS,
    cars: CAR_PARTNERS,
    activities: ACTIVITY_PARTNERS,
  };
  
  return partners[serviceType]
    .filter(p => p.isActive)
    .sort((a, b) => b.priority - a.priority);
}

// Compliance text for affiliate redirects
export const AFFILIATE_DISCLOSURE_TEXT = {
  short: "You will be redirected to our trusted travel partner to complete your booking.",
  full: "ZIVO may earn a commission when you book through our partner links at no extra cost to you.",
  detailed: "ZIVO acts as a search and comparison platform. When you click a booking link, you will be redirected to our trusted travel partner to complete your booking. ZIVO may earn a commission at no additional cost to you.",
  payment: "All bookings, payments, refunds, and changes are handled directly by our travel partners.",
  price: "Prices shown are indicative and may change. Final price will be confirmed on partner site.",
};

// Open affiliate link in new tab with fallback support
export function openAffiliateLink(type: keyof typeof AFFILIATE_LINKS) {
  const link = AFFILIATE_LINKS[type];
  if (!link) {
    console.warn(`[Affiliate] Unknown link type: ${type}`);
    return;
  }
  
  try {
    window.open(link.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    // Fallback if primary link fails
    if (link.fallbackUrl) {
      console.warn(`[Affiliate] Primary link failed, using fallback for ${type}`);
      window.open(link.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }
}

// Get affiliate URL with fallback
export function getAffiliateUrl(type: keyof typeof AFFILIATE_LINKS): string {
  const link = AFFILIATE_LINKS[type];
  return link?.url || link?.fallbackUrl || "#";
}

// Check if affiliate link is healthy (for monitoring)
export function getAffiliateLinkHealth(): Record<string, boolean> {
  const health: Record<string, boolean> = {};
  for (const [key, link] of Object.entries(AFFILIATE_LINKS)) {
    health[key] = Boolean(link.url);
  }
  return health;
}
