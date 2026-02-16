/**
 * Centralized Mock Locations
 * Single source of truth for all fallback/demo addresses and coordinates.
 * Used when location services, geocoding, or map APIs are unavailable.
 */

// Default map center: New York City
export const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };

// Default pickup coordinates (Empire State Building, NYC)
export const DEFAULT_PICKUP_COORDS = { lat: 40.7484, lng: -73.9857 };

// Default dropoff coordinates (One World Trade Center, NYC)
export const DEFAULT_DROPOFF_COORDS = { lat: 40.7127, lng: -74.0134 };

// Default driver start position (slightly offset from pickup)
export const DEFAULT_DRIVER_START_COORDS = { lat: 40.7584, lng: -73.9957 };

// Mock address suggestions covering major US cities
export const MOCK_ADDRESSES = [
  "350 Fifth Avenue, New York, NY",
  "1 World Trade Center, New York, NY",
  "200 Santa Monica Pier, Santa Monica, CA",
  "6801 Hollywood Blvd, Los Angeles, CA",
  "1600 Pennsylvania Ave NW, Washington, DC",
  "233 S Wacker Dr, Chicago, IL",
  "1 Infinite Loop, Cupertino, CA",
  "401 Biscayne Blvd, Miami, FL",
  "600 Bourbon St, New Orleans, LA",
  "1000 Ala Moana Blvd, Honolulu, HI",
];

// Coordinates for each mock address (same order as MOCK_ADDRESSES)
export const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
  "mock-1": { lat: 40.7484, lng: -73.9857 },  // Empire State Building
  "mock-2": { lat: 40.7127, lng: -74.0134 },  // One World Trade Center
  "mock-3": { lat: 34.0094, lng: -118.4973 }, // Santa Monica Pier
  "mock-4": { lat: 34.1015, lng: -118.3391 }, // Hollywood Blvd
  "mock-5": { lat: 38.8977, lng: -77.0365 },  // White House
  "mock-6": { lat: 41.8789, lng: -87.6359 },  // Willis Tower
  "mock-7": { lat: 37.3318, lng: -122.0312 }, // Apple HQ
  "mock-8": { lat: 25.7751, lng: -80.1868 },  // Miami
  "mock-9": { lat: 29.9584, lng: -90.0654 },  // Bourbon St
  "mock-10": { lat: 21.2907, lng: -157.8440 }, // Honolulu
};

// PlaceSuggestion-compatible mock data for useServerGeocode
export const MOCK_PLACE_SUGGESTIONS = MOCK_ADDRESSES.map((address, i) => ({
  description: address,
  place_id: `mock-${i + 1}`,
  main_text: address.split(",")[0],
}));

// Simple string array for useGoogleMapsGeocode / useMapboxGeocode
export const MOCK_ADDRESS_STRINGS = MOCK_ADDRESSES;
