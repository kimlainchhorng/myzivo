/**
 * Multi-Stop Delivery Fee Calculator
 * Calculates dynamic delivery fees based on distance and number of stops
 */

// Pricing constants
const BASE_FEE = 3.99;
const PER_ADDITIONAL_STOP = 1.50;
const FREE_MILES = 2.0;
const PER_MILE_RATE = 0.50;
export const MAX_STOPS = 5;

export interface DeliveryStop {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  instructions?: string;
  label?: string;
  stopOrder?: number;
  status?: "pending" | "current" | "delivered";
  deliveredAt?: string | null;
}

export interface MultiStopFeeResult {
  baseFee: number;
  additionalStopFee: number;
  distanceFee: number;
  totalFee: number;
  totalDistance: number;
  stopCount: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

/**
 * Calculate Haversine distance between two points (miles)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate total route distance from restaurant through all stops
 */
export function calculateRouteDistance(
  stops: { lat: number; lng: number }[],
  restaurantLocation: { lat: number; lng: number }
): number {
  if (stops.length === 0) return 0;
  
  let totalDistance = 0;
  let currentPoint = restaurantLocation;
  
  for (const stop of stops) {
    totalDistance += haversineDistance(
      currentPoint.lat,
      currentPoint.lng,
      stop.lat,
      stop.lng
    );
    currentPoint = stop;
  }
  
  return totalDistance;
}

/**
 * Calculate delivery fee for multiple stops
 */
export function calculateMultiStopDeliveryFee(
  stops: { lat: number | null; lng: number | null }[],
  restaurantLocation: { lat: number; lng: number } | null
): MultiStopFeeResult {
  // Filter stops with valid coordinates
  const validStops = stops.filter(
    (s): s is { lat: number; lng: number } => s.lat != null && s.lng != null
  );
  
  const stopCount = Math.max(validStops.length, 1);
  const additionalStops = Math.max(0, stopCount - 1);
  
  // Calculate total route distance
  let totalDistance = 0;
  if (restaurantLocation && validStops.length > 0) {
    totalDistance = calculateRouteDistance(validStops, restaurantLocation);
  }
  
  // Calculate fees
  const baseFee = BASE_FEE;
  const additionalStopFee = additionalStops * PER_ADDITIONAL_STOP;
  const extraMiles = Math.max(0, totalDistance - FREE_MILES);
  const distanceFee = extraMiles * PER_MILE_RATE;
  const totalFee = baseFee + additionalStopFee + distanceFee;
  
  // Build breakdown for display
  const breakdown: { label: string; amount: number }[] = [
    { label: "Base delivery", amount: baseFee },
  ];
  
  if (additionalStops > 0) {
    breakdown.push({
      label: `Additional stop${additionalStops > 1 ? "s" : ""} (${additionalStops})`,
      amount: additionalStopFee,
    });
  }
  
  if (distanceFee > 0) {
    breakdown.push({
      label: `Distance (${extraMiles.toFixed(1)} mi over ${FREE_MILES} mi)`,
      amount: distanceFee,
    });
  }
  
  return {
    baseFee,
    additionalStopFee,
    distanceFee,
    totalFee: Math.round(totalFee * 100) / 100, // Round to cents
    totalDistance: Math.round(totalDistance * 10) / 10, // Round to 0.1 mi
    stopCount,
    breakdown,
  };
}

/**
 * Validate a single stop
 */
export function validateStop(stop: DeliveryStop): {
  valid: boolean;
  error?: string;
} {
  if (!stop.address || stop.address.trim().length < 5) {
    return { valid: false, error: "Address is too short" };
  }
  
  if (stop.lat == null || stop.lng == null) {
    return { valid: false, error: "Address must be geocoded" };
  }
  
  if (stop.instructions && stop.instructions.length > 200) {
    return { valid: false, error: "Instructions too long (max 200 chars)" };
  }
  
  return { valid: true };
}

/**
 * Validate all stops
 */
export function validateStops(
  stops: DeliveryStop[],
  restaurantLocation?: { lat: number; lng: number }
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (stops.length === 0) {
    errors.push("At least one delivery address is required");
    return { valid: false, errors, warnings };
  }
  
  if (stops.length > MAX_STOPS) {
    errors.push(`Maximum ${MAX_STOPS} stops allowed`);
    return { valid: false, errors, warnings };
  }
  
  // Validate each stop
  stops.forEach((stop, index) => {
    const result = validateStop(stop);
    if (!result.valid) {
      errors.push(`Stop ${index + 1}: ${result.error}`);
    }
  });
  
  // Check for duplicate addresses
  const addresses = stops.map((s) => s.address.toLowerCase().trim());
  const duplicates = addresses.filter((a, i) => addresses.indexOf(a) !== i);
  if (duplicates.length > 0) {
    warnings.push("Some addresses appear multiple times");
  }
  
  // Check distances between stops (max 15 mi between consecutive)
  const validStops = stops.filter(
    (s): s is DeliveryStop & { lat: number; lng: number } =>
      s.lat != null && s.lng != null
  );
  
  if (restaurantLocation && validStops.length > 0) {
    let prevPoint = restaurantLocation;
    for (let i = 0; i < validStops.length; i++) {
      const dist = haversineDistance(
        prevPoint.lat,
        prevPoint.lng,
        validStops[i].lat,
        validStops[i].lng
      );
      
      if (dist > 15) {
        warnings.push(
          `Stop ${i + 1} is ${dist.toFixed(1)} mi from previous point (extended fee applies)`
        );
      }
      
      prevPoint = validStops[i];
    }
    
    // Total route distance check
    const totalDist = calculateRouteDistance(validStops, restaurantLocation);
    if (totalDist > 30) {
      errors.push("Total route exceeds 30 miles maximum");
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
