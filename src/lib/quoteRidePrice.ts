/**
 * Unified Supabase Pricing Engine
 * 
 * This is the SINGLE SOURCE OF TRUTH for all ride pricing.
 * It fetches rates from Supabase and applies all multipliers:
 * - Time of day
 * - Weather (when API available)
 * - Surge (demand/supply)
 * - Event zones
 * - Long trip discounts
 * 
 * Formula:
 * subtotal = max(base_fare + (miles * per_mile) + (minutes * per_minute) + booking_fee, minimum_fare)
 * final = (subtotal * rideTypeMult * timeMult * weatherMult * surgeMult * eventMult * longTripMult) + insurance
 */

import { supabase } from "@/integrations/supabase/client";

// ============= Types =============

export interface RideQuoteResult {
  zoneName: string;
  zoneId: string;
  miles: number;
  minutes: number;
  subtotal: number;
  multipliers: {
    rideType: number;
    time: number;
    weather: number;
    surge: number;
    event: number;
    longTrip: number;
    combined: number;
  };
  insurance_fee: number;
  booking_fee: number;
  final: number;
}

export interface QuoteInput {
  rideType: string;
  pickupLat: number;
  pickupLng: number;
  miles: number;
  minutes: number;
  // Optional: pre-fetched data to avoid extra queries
  zoneId?: string;
  zoneName?: string;
}

interface PricingZone {
  id: string;
  name: string;
  priority: number;
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
}

interface ZoneRate {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  ride_type_multiplier: number;
}

interface TimeMultiplier {
  start_hour: number;
  end_hour: number;
  day_mask: number;
  multiplier: number;
}

interface EventZone {
  center_lat: number;
  center_lng: number;
  radius_km: number;
  multiplier: number;
}

// ============= Constants =============

// Maximum total multiplier cap to stay cheaper than competitors
const MAX_TOTAL_MULTIPLIER = 1.60;

// Default rate card (fallback if no zone match)
const DEFAULT_RATE: ZoneRate = {
  base_fare: 2.00,
  per_mile: 1.10,
  per_minute: 0.18,
  booking_fee: 0.99,
  minimum_fare: 5.99,
  ride_type_multiplier: 1.0,
};

// ============= Zone Lookup =============

/**
 * Find the best pricing zone for given coordinates
 * Priority order: highest priority > smallest bbox area
 */
export async function findPricingZone(
  lat: number,
  lng: number
): Promise<PricingZone | null> {
  const { data: zones, error } = await supabase
    .from("pricing_zones")
    .select("id, name, priority, min_lat, max_lat, min_lng, max_lng")
    .eq("is_active", true)
    .gte("max_lat", lat)
    .lte("min_lat", lat)
    .gte("max_lng", lng)
    .lte("min_lng", lng);

  if (error || !zones || zones.length === 0) {
    // Fallback to USA Default
    const { data: defaultZone } = await supabase
      .from("pricing_zones")
      .select("id, name, priority, min_lat, max_lat, min_lng, max_lng")
      .eq("name", "USA Default Pricing")
      .single();
    
    return defaultZone || null;
  }

  // Sort by priority desc, then by bbox area asc (smallest = most specific)
  const sorted = zones.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    const areaA = (a.max_lat - a.min_lat) * (a.max_lng - a.min_lng);
    const areaB = (b.max_lat - b.min_lat) * (b.max_lng - b.min_lng);
    return areaA - areaB;
  });

  return sorted[0];
}

// ============= Rate Card Lookup =============

/**
 * Fetch rate card for a zone and ride type
 */
export async function fetchZoneRate(
  zoneId: string,
  rideType: string
): Promise<ZoneRate> {
  const { data, error } = await supabase
    .from("zone_pricing_rates")
    .select("base_fare, per_mile, per_minute, booking_fee, minimum_fare, multiplier")
    .eq("zone_id", zoneId)
    .eq("ride_type", rideType)
    .single();

  if (error || !data) {
    console.warn(`[quoteRidePrice] No rate found for zone ${zoneId}, ride ${rideType}`);
    return DEFAULT_RATE;
  }

  return {
    base_fare: Number(data.base_fare) || DEFAULT_RATE.base_fare,
    per_mile: Number(data.per_mile) || DEFAULT_RATE.per_mile,
    per_minute: Number(data.per_minute) || DEFAULT_RATE.per_minute,
    booking_fee: Number(data.booking_fee) || DEFAULT_RATE.booking_fee,
    minimum_fare: Number(data.minimum_fare) || DEFAULT_RATE.minimum_fare,
    ride_type_multiplier: Number(data.multiplier) || DEFAULT_RATE.ride_type_multiplier,
  };
}

// ============= Multiplier Calculations =============

/**
 * Get time-of-day multiplier for a zone
 * Handles wrap-around hours (e.g., 20->2 means 20:00 to 02:00)
 */
export async function getTimeMultiplier(zoneId: string): Promise<number> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0=Sun, 6=Sat
  const dayBit = 1 << currentDay;

  const { data: multipliers, error } = await supabase
    .from("time_multipliers")
    .select("start_hour, end_hour, day_mask, multiplier")
    .eq("zone_id", zoneId);

  if (error || !multipliers || multipliers.length === 0) {
    return 1.0;
  }

  for (const m of multipliers as TimeMultiplier[]) {
    // Check if current day is in the day mask
    if ((m.day_mask & dayBit) === 0) continue;

    // Handle wrap-around hours (e.g., 20 to 2)
    const isWrap = m.start_hour > m.end_hour;
    const inRange = isWrap
      ? currentHour >= m.start_hour || currentHour < m.end_hour
      : currentHour >= m.start_hour && currentHour < m.end_hour;

    if (inRange) {
      return Number(m.multiplier) || 1.0;
    }
  }

  return 1.0;
}

/**
 * Get weather multiplier (placeholder - returns 1.0 until weather API is integrated)
 */
export async function getWeatherMultiplier(_zoneId: string): Promise<number> {
  // TODO: Integrate weather API (e.g., OpenWeatherMap)
  // For now, always return 1.0 (clear weather)
  return 1.0;
}

/**
 * Calculate surge multiplier based on demand/supply ratio
 * CAPPED at 1.35x to stay cheaper than competitors
 */
export async function getSurgeMultiplier(): Promise<number> {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000);

  // Count active rides in last 5 minutes
  const { count: requestedCount } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .in("status", ["requested", "accepted", "en_route"])
    .gte("created_at", fiveMinAgo.toISOString());

  // Count online drivers active in last 2 minutes
  const { count: driversCount } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .eq("is_online", true)
    .eq("status", "verified")
    .gte("updated_at", twoMinAgo.toISOString());

  const rides = requestedCount || 0;
  const drivers = driversCount || 0;

  // Surge rules (capped at 1.35x to stay cheaper than Uber/Lyft)
  if (drivers <= 0) return 1.35;
  
  const ratio = rides / Math.max(1, drivers);
  
  if (ratio >= 2.0) return 1.35;
  if (ratio >= 1.5) return 1.25;
  if (ratio >= 1.0) return 1.12;
  
  return 1.0;
}

/**
 * Check if pickup is within any active event zone
 */
export async function getEventMultiplier(
  pickupLat: number,
  pickupLng: number
): Promise<number> {
  const now = new Date().toISOString();

  const { data: events, error } = await supabase
    .from("event_zones")
    .select("center_lat, center_lng, radius_km, multiplier")
    .eq("is_active", true)
    .lte("start_time", now)
    .gte("end_time", now);

  if (error || !events || events.length === 0) {
    return 1.0;
  }

  let maxMultiplier = 1.0;

  for (const event of events as EventZone[]) {
    // Calculate distance from pickup to event center (Haversine approximation)
    const distance = haversineDistance(
      pickupLat,
      pickupLng,
      Number(event.center_lat),
      Number(event.center_lng)
    );

    if (distance <= Number(event.radius_km)) {
      maxMultiplier = Math.max(maxMultiplier, Number(event.multiplier) || 1.0);
    }
  }

  return maxMultiplier;
}

/**
 * Calculate long trip discount
 */
export function getLongTripDiscount(miles: number): number {
  if (miles > 50) return 0.88; // 12% off
  if (miles > 25) return 0.92; // 8% off
  return 1.0;
}

/**
 * Calculate dynamic insurance fee
 * Base: max(1.00, minutes × 0.06)
 * Risk adjustment: 1 + ((weatherMult - 1) × 0.6) + ((surgeMult - 1) × 0.5)
 * Cap at $6.00
 */
export function calculateInsurance(
  minutes: number,
  weatherMult: number,
  surgeMult: number
): number {
  const base = Math.max(1.0, minutes * 0.06);
  const risk = 1 + ((weatherMult - 1) * 0.6) + ((surgeMult - 1) * 0.5);
  const insurance = Math.min(6.0, base * risk);
  return Math.round(insurance * 100) / 100;
}

// ============= Main Quote Function =============

/**
 * Generate a complete ride quote with all multipliers applied
 * This is the SINGLE SOURCE OF TRUTH for pricing
 */
export async function quoteRidePrice(input: QuoteInput): Promise<RideQuoteResult> {
  const { rideType, pickupLat, pickupLng, miles, minutes } = input;

  // 1. Find pricing zone
  let zoneId = input.zoneId;
  let zoneName = input.zoneName;

  if (!zoneId) {
    const zone = await findPricingZone(pickupLat, pickupLng);
    zoneId = zone?.id || "";
    zoneName = zone?.name || "USA Default Pricing";
  }

  // 2. Fetch rate card
  const rate = zoneId 
    ? await fetchZoneRate(zoneId, rideType)
    : DEFAULT_RATE;

  // 3. Get all multipliers (parallel)
  const [timeMult, weatherMult, surgeMult, eventMult] = await Promise.all([
    zoneId ? getTimeMultiplier(zoneId) : 1.0,
    zoneId ? getWeatherMultiplier(zoneId) : 1.0,
    getSurgeMultiplier(),
    getEventMultiplier(pickupLat, pickupLng),
  ]);

  const longTripMult = getLongTripDiscount(miles);

  // 4. Calculate subtotal
  const rawSubtotal = rate.base_fare + (miles * rate.per_mile) + (minutes * rate.per_minute);
  const subtotal = Math.max(rawSubtotal, rate.minimum_fare);

  // 5. Calculate combined multiplier (capped at MAX_TOTAL_MULTIPLIER)
  let combinedMult = rate.ride_type_multiplier * timeMult * weatherMult * surgeMult * eventMult * longTripMult;
  if (combinedMult > MAX_TOTAL_MULTIPLIER) {
    combinedMult = MAX_TOTAL_MULTIPLIER;
  }

  // 6. Calculate insurance
  const insurance = calculateInsurance(minutes, weatherMult, surgeMult);

  // 7. Calculate final price
  const final = (subtotal * combinedMult) + rate.booking_fee + insurance;
  const roundedFinal = Math.round(final * 100) / 100;

  return {
    zoneName: zoneName || "USA Default Pricing",
    zoneId: zoneId || "",
    miles,
    minutes,
    subtotal: Math.round(subtotal * 100) / 100,
    multipliers: {
      rideType: rate.ride_type_multiplier,
      time: timeMult,
      weather: weatherMult,
      surge: surgeMult,
      event: eventMult,
      longTrip: longTripMult,
      combined: Math.round(combinedMult * 100) / 100,
    },
    insurance_fee: insurance,
    booking_fee: rate.booking_fee,
    final: roundedFinal,
  };
}

// ============= Utility Functions =============

/**
 * Haversine formula for distance between two points
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Save quote to database for audit/debugging
 */
export async function saveQuoteToDb(
  quote: RideQuoteResult,
  input: QuoteInput,
  userId?: string
): Promise<void> {
  try {
    await supabase.from("ride_quotes").insert({
      user_id: userId || null,
      pickup_lat: input.pickupLat,
      pickup_lng: input.pickupLng,
      dest_lat: null, // Not tracking destination coords in quote
      dest_lng: null,
      ride_type: input.rideType,
      miles: quote.miles,
      minutes: quote.minutes,
      subtotal: quote.subtotal,
      multipliers: quote.multipliers,
      insurance_fee: quote.insurance_fee,
      final_price: quote.final,
      zone_name: quote.zoneName,
    });
  } catch (err) {
    console.warn("[quoteRidePrice] Failed to save quote:", err);
  }
}
