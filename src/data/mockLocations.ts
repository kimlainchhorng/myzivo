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
  // New York
  "350 Fifth Avenue, New York, NY",
  "1 World Trade Center, New York, NY",
  "30 Rockefeller Plaza, New York, NY",
  "100 Central Park West, New York, NY",
  // Los Angeles
  "200 Santa Monica Pier, Santa Monica, CA",
  "6801 Hollywood Blvd, Los Angeles, CA",
  "3700 Wilshire Blvd, Los Angeles, CA",
  "1111 S Figueroa St, Los Angeles, CA",
  // Chicago
  "233 S Wacker Dr, Chicago, IL",
  "500 N Michigan Ave, Chicago, IL",
  "875 N Michigan Ave, Chicago, IL",
  // Washington DC
  "1600 Pennsylvania Ave NW, Washington, DC",
  // San Francisco / Bay Area
  "1 Infinite Loop, Cupertino, CA",
  // Miami / Florida
  "401 Biscayne Blvd, Miami, FL",
  "1 Busch Gardens Blvd, Tampa, FL",
  // New Orleans
  "600 Bourbon St, New Orleans, LA",
  // Honolulu
  "1000 Ala Moana Blvd, Honolulu, HI",
  // Atlanta
  "1 Hartsfield Center Pkwy, Atlanta, GA",
  "225 Peachtree St NE, Atlanta, GA",
  "2600 Benjamin Mays Dr SW, Atlanta, GA",
  // Texas
  "600 Congress Ave, Austin, TX",
  "1100 Congress Ave, Austin, TX",
  "2101 NASA Pkwy, Houston, TX",
  "1001 Avenida de las Americas, Houston, TX",
  "1901 Main St, Dallas, TX",
  "300 Alamo Plaza, San Antonio, TX",
  // Philadelphia
  "1600 Arch St, Philadelphia, PA",
  "1 N Broad St, Philadelphia, PA",
  // Baltimore
  "200 E Pratt St, Baltimore, MD",
  "300 E Pratt St, Baltimore, MD",
  // St. Louis
  "700 Clark Ave, St. Louis, MO",
  // Denver
  "1000 Chopper Cir, Denver, CO",
  "1701 Bryant St, Denver, CO",
  // Seattle
  "400 Broad St, Seattle, WA",
  "1000 4th Ave, Seattle, WA",
  // Phoenix
  "750 E Pratt St, Phoenix, AZ",
  "2701 E Camelback Rd, Phoenix, AZ",
  // Long Beach
  "100 Aquarium Way, Long Beach, CA",
  // Las Vegas
  "3799 Las Vegas Blvd S, Las Vegas, NV",
  "1 Caesars Palace Dr, Las Vegas, NV",
];

// Coordinates for each mock address (same order as MOCK_ADDRESSES)
export const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
  "mock-1":  { lat: 40.7484, lng: -73.9857 },  // Empire State Building
  "mock-2":  { lat: 40.7127, lng: -74.0134 },  // One World Trade Center
  "mock-3":  { lat: 40.7587, lng: -73.9787 },  // Rockefeller Plaza
  "mock-4":  { lat: 40.7812, lng: -73.9740 },  // Central Park West
  "mock-5":  { lat: 34.0094, lng: -118.4973 }, // Santa Monica Pier
  "mock-6":  { lat: 34.1015, lng: -118.3391 }, // Hollywood Blvd
  "mock-7":  { lat: 34.0619, lng: -118.3089 }, // Wilshire Blvd
  "mock-8":  { lat: 34.0430, lng: -118.2673 }, // Figueroa St
  "mock-9":  { lat: 41.8789, lng: -87.6359 },  // Willis Tower
  "mock-10": { lat: 41.8900, lng: -87.6245 },  // Michigan Ave (500)
  "mock-11": { lat: 41.8988, lng: -87.6233 },  // Michigan Ave (875)
  "mock-12": { lat: 38.8977, lng: -77.0365 },  // White House
  "mock-13": { lat: 37.3318, lng: -122.0312 }, // Apple HQ
  "mock-14": { lat: 25.7751, lng: -80.1868 },  // Miami
  "mock-15": { lat: 28.0322, lng: -82.4215 },  // Tampa
  "mock-16": { lat: 29.9584, lng: -90.0654 },  // Bourbon St
  "mock-17": { lat: 21.2907, lng: -157.8440 }, // Honolulu
  "mock-18": { lat: 33.6407, lng: -84.4277 },  // Hartsfield Airport
  "mock-19": { lat: 33.7590, lng: -84.3880 },  // Peachtree St
  "mock-20": { lat: 33.7356, lng: -84.4133 },  // Benjamin Mays Dr
  "mock-21": { lat: 30.2747, lng: -97.7404 },  // Austin Congress (600)
  "mock-22": { lat: 30.2780, lng: -97.7404 },  // Austin Congress (1100)
  "mock-23": { lat: 29.5519, lng: -95.0981 },  // NASA Pkwy
  "mock-24": { lat: 29.7530, lng: -95.3571 },  // Houston downtown
  "mock-25": { lat: 32.7876, lng: -96.7985 },  // Dallas Main St
  "mock-26": { lat: 29.4260, lng: -98.4861 },  // Alamo Plaza
  "mock-27": { lat: 39.9543, lng: -75.1683 },  // Philadelphia Arch St
  "mock-28": { lat: 39.9566, lng: -75.1630 },  // Philadelphia Broad St
  "mock-29": { lat: 39.2861, lng: -76.6113 },  // Baltimore (200 E Pratt)
  "mock-30": { lat: 39.2861, lng: -76.6097 },  // Baltimore (300 E Pratt)
  "mock-31": { lat: 38.6226, lng: -90.1928 },  // St. Louis
  "mock-32": { lat: 39.7487, lng: -105.0077 }, // Denver (Chopper Cir)
  "mock-33": { lat: 39.7536, lng: -104.9892 }, // Denver (Bryant St)
  "mock-34": { lat: 47.6205, lng: -122.3493 }, // Seattle Space Needle
  "mock-35": { lat: 47.6062, lng: -122.3321 }, // Seattle downtown
  "mock-36": { lat: 33.4484, lng: -112.0740 }, // Phoenix
  "mock-37": { lat: 33.5088, lng: -111.9710 }, // Camelback Rd
  "mock-38": { lat: 33.7619, lng: -118.1960 }, // Long Beach Aquarium
  "mock-39": { lat: 36.1041, lng: -115.1724 }, // Las Vegas Strip
  "mock-40": { lat: 36.1162, lng: -115.1745 }, // Caesars Palace
};

// PlaceSuggestion-compatible mock data for useServerGeocode
export const MOCK_PLACE_SUGGESTIONS = MOCK_ADDRESSES.map((address, i) => ({
  description: address,
  place_id: `mock-${i + 1}`,
  main_text: address.split(",")[0],
}));

// Simple string array for useGoogleMapsGeocode / useMapboxGeocode
export const MOCK_ADDRESS_STRINGS = MOCK_ADDRESSES;
