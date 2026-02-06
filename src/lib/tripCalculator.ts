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

// Pricing constants
const BASE_FARE = 2.00;
const PER_MILE_RATE = 1.25;
const PER_MINUTE_RATE = 0.20;

// Ride multipliers by ID
export const RIDE_MULTIPLIERS: Record<string, number> = {
  "wait-save": 0.85,
  "standard": 1.0,
  "extra-comfort": 1.2,
  "zivo-black": 1.4,
  "executive": 1.8,
  "zivo-lux": 2.0,
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
 */
export function calculateRidePrice(
  rideId: string, 
  distance: number, 
  duration: number
): number {
  const basePrice = calculateBasePrice(distance, duration);
  const multiplier = RIDE_MULTIPLIERS[rideId] || 1.0;
  return Math.round(basePrice * multiplier * 100) / 100;
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
