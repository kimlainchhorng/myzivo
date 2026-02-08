/**
 * ZIVO Pricing Engine
 * Centralized pricing calculations for Rides and Eats
 * 
 * IMPORTANT: quoteRidePrice() is the SINGLE SOURCE OF TRUTH for ride pricing.
 * All UI and server-side code should use this function.
 */

// ==================== RIDE TYPE MULTIPLIERS (Uber-like) ====================

export const RIDE_TYPE_MULTIPLIERS: Record<string, number> = {
  wait_save: 0.92,
  standard: 1.00,
  green: 1.02,
  priority: 1.12,
  pet: 1.15,
  comfort: 1.45,
  xl: 1.45,
  black: 1.65,
  black_suv: 2.10,
  xxl: 2.10,
  premium: 1.65,
  elite: 2.10,
  lux: 3.50,
  sprinter: 2.50,
  secure: 4.00,
};

// ==================== ROUTE LIMITS ====================

export const ROUTE_LIMITS = {
  MAX_DISTANCE_MILES: 300,
  MAX_DURATION_MINUTES: 600,
};

// ==================== LONG-TRIP DISCOUNT ====================

/**
 * Get long-trip discount multiplier
 * > 50 miles: 12% discount (0.88)
 * > 25 miles: 8% discount (0.92)
 */
export function getLongTripMultiplier(distanceMiles: number): number {
  if (distanceMiles > 50) return 0.88;
  if (distanceMiles > 25) return 0.92;
  return 1.0;
}

// ==================== ROUTE VALIDATION ====================

export interface RouteValidation {
  valid: boolean;
  error?: string;
}

export function validateRouteData(
  distanceMiles: number,
  durationMinutes: number
): RouteValidation {
  if (distanceMiles > ROUTE_LIMITS.MAX_DISTANCE_MILES) {
    return { valid: false, error: `Bad route data: distance ${distanceMiles.toFixed(1)} miles exceeds maximum of ${ROUTE_LIMITS.MAX_DISTANCE_MILES}` };
  }
  if (durationMinutes > ROUTE_LIMITS.MAX_DURATION_MINUTES) {
    return { valid: false, error: `Bad route data: duration ${Math.round(durationMinutes)} min exceeds maximum of ${ROUTE_LIMITS.MAX_DURATION_MINUTES}` };
  }
  if (distanceMiles < 0 || durationMinutes < 0) {
    return { valid: false, error: "Bad route data: negative values" };
  }
  return { valid: true };
}

// ==================== TYPES ====================

export interface RideZone {
  id: string;
  city_name: string;
  zone_code: string;
  base_fare: number;
  per_mile_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  booking_fee: number;
  service_fee_percent: number;
  standard_multiplier: number;
  xl_multiplier: number;
  premium_multiplier: number;
  surge_multiplier: number;
  is_active: boolean;
}

export interface EatsZone {
  id: string;
  city_name: string;
  zone_code: string;
  delivery_fee_base: number;
  delivery_fee_per_mile: number;
  service_fee_percent: number;
  small_order_fee: number;
  small_order_threshold: number;
  tax_rate: number;
  is_active: boolean;
}

export type RideType = "standard" | "xl" | "premium";

export interface RidePriceBreakdown {
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  subtotal: number;
  rideTypeMultiplier: number;
  surgeMultiplier: number;
  bookingFee: number;
  serviceFee: number;
  total: number;
  minimumApplied: boolean;
  estimatedMin: number;
  estimatedMax: number;
  zoneCode: string;
}

// Unified ride pricing breakdown (DB-driven)
export interface UnifiedRidePriceBreakdown {
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  rideTypeMultiplier: number;
  surgeMultiplier: number;
  minimumApplied: boolean;
  total: number;
  estimatedMin: number;
  estimatedMax: number;
  // Commission fields (calculated server-side only)
  commissionPercent?: number;
  commissionAmount?: number;
  driverEarning?: number;
  // City info
  city?: string;
}

// City pricing interface (from city_pricing table)
export interface CityPricing {
  city: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
}

// Settings interface for unified ride pricing
export interface UnifiedRidePricingSettings {
  base_fare: number;
  per_mile_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  booking_fee: number;
  service_fee_percent?: number;
}

// Zone pricing rates (from zone_pricing_rates table)
export interface ZonePricingRates {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  multiplier: number; // Zone-specific multiplier
}

// Price quote input settings (simplified)
export interface PriceQuoteSettings {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
}

// Price quote result with full debug info
export interface RidePriceQuote {
  // Core breakdown
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  total: number;
  
  // Single multiplier from zone rates (already includes ride-type adjustment)
  multiplier: number;
  
  // Metadata
  minimumApplied: boolean;
  estimatedMin: number;
  estimatedMax: number;
  zoneName?: string;
  
  // Debug info
  debug: {
    distanceMiles: number;
    durationMinutes: number;
    rideType: string;
  };
}

export interface EatsPriceBreakdown {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  smallOrderFee: number;
  tax: number;
  tip: number;
  total: number;
  zoneCode: string;
}

// ==================== DEFAULT ZONES ====================

export const DEFAULT_RIDE_ZONE: RideZone = {
  id: "default",
  city_name: "Default",
  zone_code: "DEFAULT",
  base_fare: 3.50,
  per_mile_rate: 1.75,
  per_minute_rate: 0.35,
  minimum_fare: 7.00,
  booking_fee: 2.50,
  service_fee_percent: 0,
  standard_multiplier: 1.00,
  xl_multiplier: 1.30,
  premium_multiplier: 1.60,
  surge_multiplier: 1.00,
  is_active: true,
};

export const DEFAULT_EATS_ZONE: EatsZone = {
  id: "default",
  city_name: "Default",
  zone_code: "DEFAULT",
  delivery_fee_base: 2.99,
  delivery_fee_per_mile: 0.50,
  service_fee_percent: 15.00,
  small_order_fee: 2.00,
  small_order_threshold: 15.00,
  tax_rate: 0.0825,
  is_active: true,
};

// ==================== RIDE PRICING ====================

/**
 * Calculate ride fare based on zone pricing
 */
export function calculateRideFare(
  zone: RideZone,
  distanceMiles: number,
  durationMinutes: number,
  rideType: RideType
): RidePriceBreakdown {
  // Get ride type multiplier
  const rideTypeMultiplier = 
    rideType === "xl" ? zone.xl_multiplier :
    rideType === "premium" ? zone.premium_multiplier :
    zone.standard_multiplier;

  // Calculate base components
  const baseFare = zone.base_fare;
  const distanceFee = distanceMiles * zone.per_mile_rate;
  const timeFee = durationMinutes * zone.per_minute_rate;
  
  // Calculate subtotal before multipliers
  let subtotal = baseFare + distanceFee + timeFee;
  
  // Apply ride type multiplier
  subtotal *= rideTypeMultiplier;
  
  // Apply surge multiplier
  subtotal *= zone.surge_multiplier;
  
  // Check minimum fare
  const minimumApplied = subtotal < zone.minimum_fare;
  if (minimumApplied) {
    subtotal = zone.minimum_fare;
  }
  
  // Add booking fee
  const bookingFee = zone.booking_fee;
  
  // Calculate service fee (if any)
  const serviceFee = subtotal * (zone.service_fee_percent / 100);
  
  // Calculate total
  const total = subtotal + bookingFee + serviceFee;
  
  // Calculate estimate range (±10%)
  const estimatedMin = Math.floor(total * 0.9);
  const estimatedMax = Math.ceil(total * 1.1);

  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    subtotal: round(subtotal),
    rideTypeMultiplier,
    surgeMultiplier: zone.surge_multiplier,
    bookingFee: round(bookingFee),
    serviceFee: round(serviceFee),
    total: round(total),
    minimumApplied,
    estimatedMin,
    estimatedMax,
    zoneCode: zone.zone_code,
  };
}

/**
 * Calculate unified ride fare based on DB settings
 * This is the new DB-driven pricing function
 */
export function calculateUnifiedRideFare(
  settings: UnifiedRidePricingSettings,
  distanceMiles: number,
  durationMinutes: number,
  rideTypeMultiplier: number,
  surgeMultiplier: number = 1.0
): UnifiedRidePriceBreakdown {
  // 1. Calculate base components
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile_rate;
  const timeFee = durationMinutes * settings.per_minute_rate;
  const bookingFee = settings.booking_fee;
  
  // 2. Calculate subtotal before multipliers
  let subtotal = baseFare + distanceFee + timeFee;
  
  // 3. Apply multipliers
  subtotal *= rideTypeMultiplier;
  subtotal *= surgeMultiplier;
  
  // 4. Enforce minimum fare
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  // 5. Add booking fee to get total
  const total = subtotal + bookingFee;
  
  // Calculate estimate range (±10%)
  const estimatedMin = Math.floor(total * 0.9);
  const estimatedMax = Math.ceil(total * 1.1);

  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    rideTypeMultiplier,
    surgeMultiplier,
    minimumApplied,
    total: round(total),
    estimatedMin,
    estimatedMax,
  };
}

/**
 * Calculate ride fare using city-specific pricing
 * This is the preferred method when city_pricing data is available
 */
export function calculateCityRideFare(
  cityPricing: CityPricing,
  distanceMiles: number,
  durationMinutes: number,
  surgeMultiplier: number = 1.0
): UnifiedRidePriceBreakdown {
  const baseFare = cityPricing.base_fare;
  const distanceFee = distanceMiles * cityPricing.per_mile;
  const timeFee = durationMinutes * cityPricing.per_minute;
  const bookingFee = cityPricing.booking_fee;
  
  let subtotal = baseFare + distanceFee + timeFee;
  subtotal *= surgeMultiplier;
  
  const minimumApplied = subtotal < cityPricing.minimum_fare;
  if (minimumApplied) {
    subtotal = cityPricing.minimum_fare;
  }
  
  const total = subtotal + bookingFee;
  
  // Calculate estimate range (±10%)
  const estimatedMin = Math.floor(total * 0.9);
  const estimatedMax = Math.ceil(total * 1.1);

  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    rideTypeMultiplier: 1.0, // Already baked into city pricing per ride_type
    surgeMultiplier,
    minimumApplied,
    total: round(total),
    estimatedMin,
    estimatedMax,
    city: cityPricing.city,
  };
}

// ==================== QUOTE RIDE PRICE (SINGLE SOURCE OF TRUTH) ====================

/**
 * SINGLE SOURCE OF TRUTH for ride pricing (simplified zone-based)
 * 
 * Formula:
 *   subtotal = base_fare + (miles * per_mile) + (minutes * per_minute) + booking_fee
 *   subtotal = max(subtotal, minimum_fare)
 *   final = round(subtotal * multiplier, 2)
 * 
 * The `multiplier` from zone_pricing_rates already includes the ride-type adjustment.
 * 
 * @param settings - Base pricing settings (from zone_pricing_rates)
 * @param distanceMiles - Route distance in miles
 * @param durationMinutes - Route duration in minutes
 * @param rideType - Ride type ID (for debug info)
 * @param options - Optional: multiplier from zone rates, zoneName
 */
export function quoteRidePrice(
  settings: PriceQuoteSettings,
  distanceMiles: number,
  durationMinutes: number,
  rideType: string,
  options?: {
    multiplier?: number; // From zone_pricing_rates.multiplier
    surgeMultiplier?: number; // Surge pricing multiplier (1.0 = no surge)
    zoneName?: string;
  }
): RidePriceQuote {
  // Single multiplier from zone_pricing_rates (already includes ride-type adjustment)
  const zoneMultiplier = options?.multiplier ?? 1.0;
  const surgeMultiplier = options?.surgeMultiplier ?? 1.0;
  
  // Combined multiplier: zone rate × surge
  const combinedMultiplier = zoneMultiplier * surgeMultiplier;
  
  // 1. Calculate base components
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile;
  const timeFee = durationMinutes * settings.per_minute;
  const bookingFee = settings.booking_fee;
  
  // 2. Calculate subtotal (before multiplier)
  let subtotal = baseFare + distanceFee + timeFee + bookingFee;
  
  // 3. Enforce minimum fare
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  // 4. Apply combined multiplier (zone × surge) to get final price
  const total = round(subtotal * combinedMultiplier);
  
  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    total,
    multiplier: combinedMultiplier,
    minimumApplied,
    estimatedMin: Math.floor(total * 0.9),
    estimatedMax: Math.ceil(total * 1.1),
    zoneName: options?.zoneName,
    debug: {
      distanceMiles: round(distanceMiles),
      durationMinutes: Math.round(durationMinutes),
      rideType,
    },
  };
}

/**
 * Format ride fare for display
 */
export function formatRideFareRange(breakdown: RidePriceBreakdown): string {
  return `$${breakdown.estimatedMin}-${breakdown.estimatedMax}`;
}

// ==================== EATS PRICING ====================

/**
 * Calculate eats order total based on zone pricing
 */
export function calculateEatsFare(
  zone: EatsZone,
  cartSubtotal: number,
  distanceMiles: number = 0,
  tipAmount: number = 0
): EatsPriceBreakdown {
  // Calculate delivery fee
  const deliveryFee = zone.delivery_fee_base + (distanceMiles * zone.delivery_fee_per_mile);
  
  // Calculate service fee
  const serviceFee = cartSubtotal * (zone.service_fee_percent / 100);
  
  // Check for small order fee
  const smallOrderFee = cartSubtotal < zone.small_order_threshold ? zone.small_order_fee : 0;
  
  // Calculate tax (on subtotal only, not fees)
  const tax = cartSubtotal * zone.tax_rate;
  
  // Calculate total
  const total = cartSubtotal + deliveryFee + serviceFee + smallOrderFee + tax + tipAmount;

  return {
    subtotal: round(cartSubtotal),
    deliveryFee: round(deliveryFee),
    serviceFee: round(serviceFee),
    smallOrderFee: round(smallOrderFee),
    tax: round(tax),
    tip: round(tipAmount),
    total: round(total),
    zoneCode: zone.zone_code,
  };
}

// ==================== UTILITIES ====================

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get ride type display name
 */
export function getRideTypeName(type: RideType): string {
  const names: Record<RideType, string> = {
    standard: "Standard",
    xl: "XL",
    premium: "Premium",
  };
  return names[type] || "Standard";
}

/**
 * Get ride type icon
 */
export function getRideTypeIcon(type: RideType): string {
  const icons: Record<RideType, string> = {
    standard: "🚗",
    xl: "🚙",
    premium: "🚘",
  };
  return icons[type] || "🚗";
}
