/**
 * Mock trip calculation utilities for ZIVO Rides
 * Generates deterministic distance/duration from pickup+destination strings
 */

export interface TripDetails {
  distance: number;  // miles
  duration: number;  // minutes
}

export interface RidePrices {
  [rideId: string]: number;
}

// Pricing constants (user's spec)
const BASE_FARE = 2.00;
const PER_MILE_RATE = 1.25;
const PER_MINUTE_RATE = 0.20;

// Ride multipliers by ID (matching Rides.tsx categories)
export const RIDE_MULTIPLIERS: Record<string, number> = {
  // Economy tier
  "wait_save": 0.75,
  "standard": 1.0,
  "green": 1.02,
  "priority": 1.3,
  // Premium tier
  "comfort": 1.55,
  "black": 2.65,
  "black_suv": 3.5,
  "xxl": 3.7,
  // Elite tier
  "lux": 10.0,
  "sprinter": 7.3,
  "secure": 20.0,
  "pet": 3.0,
  // Legacy IDs for backwards compatibility
  "wait-save": 0.75,
  "extra-comfort": 1.55,
  "zivo-black": 2.65,
  "executive": 7.3,
  "zivo-lux": 10.0,
};

/**
 * Generate a deterministic mock distance from pickup+destination strings
 * Returns a value between 2-12 miles
 */
function generateMockDistance(pickup: string, destination: string): number {
  const combined = (pickup + destination).toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  // Map to range 2-12 miles with one decimal
  return Math.round((2 + (Math.abs(hash) % 100) / 10) * 10) / 10;
}

/**
 * Calculate mock trip details from pickup and destination
 */
export function calculateMockTrip(pickup: string, destination: string): TripDetails {
  const distance = generateMockDistance(pickup, destination);
  // Duration = distance × 2.3 minutes (mock average speed ~26 mph with traffic)
  const duration = Math.round(distance * 2.3);
  
  return { distance, duration };
}

/**
 * Calculate base price for a trip
 */
export function calculateBasePrice(distance: number, duration: number): number {
  return BASE_FARE + (distance * PER_MILE_RATE) + (duration * PER_MINUTE_RATE);
}

/**
 * Calculate price for a specific ride type
 * @param surgeMultiplier - Optional surge pricing multiplier (default 1.0)
 */
export function calculateRidePrice(
  rideId: string, 
  distance: number, 
  duration: number,
  surgeMultiplier: number = 1.0
): number {
  const basePrice = calculateBasePrice(distance, duration);
  const rideMultiplier = RIDE_MULTIPLIERS[rideId] || 1.0;
  return Math.round(basePrice * rideMultiplier * surgeMultiplier * 100) / 100;
}

/**
 * Calculate prices for all ride types
 */
export function calculateAllRidePrices(
  distance: number, 
  duration: number
): RidePrices {
  const prices: RidePrices = {};
  
  for (const rideId of Object.keys(RIDE_MULTIPLIERS)) {
    prices[rideId] = calculateRidePrice(rideId, distance, duration);
  }
  
  return prices;
}
