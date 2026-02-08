/**
 * ZIVO Pricing Engine
 * Centralized pricing calculations for Rides and Eats
 */

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
