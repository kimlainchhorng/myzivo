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

  // ── Phase 2: New Cities ──

  // Boston
  "1 Faneuil Hall Sq, Boston, MA",
  "4 Jersey St, Boston, MA",
  // Detroit
  "2100 Woodward Ave, Detroit, MI",
  "300 Renaissance Center, Detroit, MI",
  // Minneapolis
  "600 1st Ave N, Minneapolis, MN",
  "401 Chicago Ave, Minneapolis, MN",
  // Nashville
  "300 Broadway, Nashville, TN",
  "2804 Opryland Dr, Nashville, TN",
  // Charlotte
  "800 S Mint St, Charlotte, NC",
  "200 E Trade St, Charlotte, NC",
  // Portland
  "701 SW 6th Ave, Portland, OR",
  "1000 NW Glisan St, Portland, OR",
  // San Diego
  "868 5th Ave, San Diego, CA",
  "1549 El Prado, San Diego, CA",
  // Orlando
  "8001 International Dr, Orlando, FL",
  "9800 International Dr, Orlando, FL",
  // Indianapolis
  "1 Monument Cir, Indianapolis, IN",
  "500 S Capitol Ave, Indianapolis, IN",
  // Columbus
  "1 Capitol Square, Columbus, OH",
  "200 W Nationwide Blvd, Columbus, OH",
  // Kansas City
  "30 W Pershing Rd, Kansas City, MO",
  "4706 Broadway Blvd, Kansas City, MO",
  // Milwaukee
  "1111 Vel R Phillips Ave, Milwaukee, WI",
  "700 N Art Museum Dr, Milwaukee, WI",
  // Sacramento
  "1315 10th St, Sacramento, CA",
  "500 David J Stern Walk, Sacramento, CA",
  // Raleigh
  "1 E Edenton St, Raleigh, NC",
  "1400 Edwards Mill Rd, Raleigh, NC",
  // Salt Lake City
  "50 N Temple, Salt Lake City, UT",
  "301 S Temple, Salt Lake City, UT",

  // ── Major Airports ──
  "JFK International Airport, Queens, NY",
  "1 World Way, Los Angeles, CA",
  "10000 W Balmoral Ave, Chicago, IL",
  "6000 N Terminal Pkwy, Atlanta, GA",
  "2400 Aviation Dr, Dallas, TX",
  "8500 Peña Blvd, Denver, CO",
  "SFO International Airport, San Francisco, CA",
  "17801 International Blvd, Seattle, WA",
  "2100 NW 42nd Ave, Miami, FL",
  "1 Harborside Dr, Boston, MA",
];

// Coordinates for each mock address (same order as MOCK_ADDRESSES)
export const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
  // Phase 1 (existing)
  "mock-1":  { lat: 40.7484, lng: -73.9857 },
  "mock-2":  { lat: 40.7127, lng: -74.0134 },
  "mock-3":  { lat: 40.7587, lng: -73.9787 },
  "mock-4":  { lat: 40.7812, lng: -73.9740 },
  "mock-5":  { lat: 34.0094, lng: -118.4973 },
  "mock-6":  { lat: 34.1015, lng: -118.3391 },
  "mock-7":  { lat: 34.0619, lng: -118.3089 },
  "mock-8":  { lat: 34.0430, lng: -118.2673 },
  "mock-9":  { lat: 41.8789, lng: -87.6359 },
  "mock-10": { lat: 41.8900, lng: -87.6245 },
  "mock-11": { lat: 41.8988, lng: -87.6233 },
  "mock-12": { lat: 38.8977, lng: -77.0365 },
  "mock-13": { lat: 37.3318, lng: -122.0312 },
  "mock-14": { lat: 25.7751, lng: -80.1868 },
  "mock-15": { lat: 28.0322, lng: -82.4215 },
  "mock-16": { lat: 29.9584, lng: -90.0654 },
  "mock-17": { lat: 21.2907, lng: -157.8440 },
  "mock-18": { lat: 33.6407, lng: -84.4277 },
  "mock-19": { lat: 33.7590, lng: -84.3880 },
  "mock-20": { lat: 33.7356, lng: -84.4133 },
  "mock-21": { lat: 30.2747, lng: -97.7404 },
  "mock-22": { lat: 30.2780, lng: -97.7404 },
  "mock-23": { lat: 29.5519, lng: -95.0981 },
  "mock-24": { lat: 29.7530, lng: -95.3571 },
  "mock-25": { lat: 32.7876, lng: -96.7985 },
  "mock-26": { lat: 29.4260, lng: -98.4861 },
  "mock-27": { lat: 39.9543, lng: -75.1683 },
  "mock-28": { lat: 39.9566, lng: -75.1630 },
  "mock-29": { lat: 39.2861, lng: -76.6113 },
  "mock-30": { lat: 39.2861, lng: -76.6097 },
  "mock-31": { lat: 38.6226, lng: -90.1928 },
  "mock-32": { lat: 39.7487, lng: -105.0077 },
  "mock-33": { lat: 39.7536, lng: -104.9892 },
  "mock-34": { lat: 47.6205, lng: -122.3493 },
  "mock-35": { lat: 47.6062, lng: -122.3321 },
  "mock-36": { lat: 33.4484, lng: -112.0740 },
  "mock-37": { lat: 33.5088, lng: -111.9710 },
  "mock-38": { lat: 33.7619, lng: -118.1960 },
  "mock-39": { lat: 36.1041, lng: -115.1724 },
  "mock-40": { lat: 36.1162, lng: -115.1745 },

  // Phase 2: New Cities
  "mock-41": { lat: 42.3601, lng: -71.0549 },  // Faneuil Hall, Boston
  "mock-42": { lat: 42.3467, lng: -71.0972 },  // Fenway Park, Boston
  "mock-43": { lat: 42.3390, lng: -83.0485 },  // Comerica Park, Detroit
  "mock-44": { lat: 42.3293, lng: -83.0398 },  // Renaissance Center, Detroit
  "mock-45": { lat: 44.9795, lng: -93.2760 },  // Target Center, Minneapolis
  "mock-46": { lat: 44.9736, lng: -93.2575 },  // US Bank Stadium, Minneapolis
  "mock-47": { lat: 36.1627, lng: -86.7816 },  // Broadway, Nashville
  "mock-48": { lat: 36.2054, lng: -86.6924 },  // Grand Ole Opry, Nashville
  "mock-49": { lat: 35.2258, lng: -80.8528 },  // Bank of America Stadium, Charlotte
  "mock-50": { lat: 35.2271, lng: -80.8431 },  // Uptown, Charlotte
  "mock-51": { lat: 45.5189, lng: -122.6790 }, // Pioneer Sq, Portland
  "mock-52": { lat: 45.5311, lng: -122.6836 }, // Pearl District, Portland
  "mock-53": { lat: 32.7114, lng: -117.1601 }, // Gaslamp, San Diego
  "mock-54": { lat: 32.7341, lng: -117.1446 }, // Balboa Park, San Diego
  "mock-55": { lat: 28.4260, lng: -81.4692 },  // International Dr, Orlando
  "mock-56": { lat: 28.4281, lng: -81.4707 },  // Convention Center, Orlando
  "mock-57": { lat: 39.7684, lng: -86.1581 },  // Monument Circle, Indianapolis
  "mock-58": { lat: 39.7601, lng: -86.1639 },  // Lucas Oil Stadium, Indianapolis
  "mock-59": { lat: 39.9612, lng: -82.9988 },  // Ohio Statehouse, Columbus
  "mock-60": { lat: 39.9694, lng: -83.0060 },  // Nationwide Arena, Columbus
  "mock-61": { lat: 39.0847, lng: -94.5858 },  // Union Station, Kansas City
  "mock-62": { lat: 39.0355, lng: -94.5934 },  // Country Club Plaza, Kansas City
  "mock-63": { lat: 43.0451, lng: -87.9174 },  // Fiserv Forum, Milwaukee
  "mock-64": { lat: 43.0402, lng: -87.8974 },  // Art Museum, Milwaukee
  "mock-65": { lat: 38.5766, lng: -121.4934 }, // State Capitol, Sacramento
  "mock-66": { lat: 38.5802, lng: -121.4998 }, // Golden 1 Center, Sacramento
  "mock-67": { lat: 35.7796, lng: -78.6382 },  // NC State Capitol, Raleigh
  "mock-68": { lat: 35.8032, lng: -78.7220 },  // PNC Arena, Raleigh
  "mock-69": { lat: 40.7703, lng: -111.8918 }, // Temple Square, Salt Lake City
  "mock-70": { lat: 40.7683, lng: -111.9011 }, // Vivint Arena, Salt Lake City

  // Major Airports
  "mock-71": { lat: 40.6413, lng: -73.7781 },  // JFK
  "mock-72": { lat: 33.9425, lng: -118.4081 }, // LAX
  "mock-73": { lat: 41.9742, lng: -87.9073 },  // ORD
  "mock-74": { lat: 33.6407, lng: -84.4277 },  // ATL
  "mock-75": { lat: 32.8998, lng: -97.0403 },  // DFW
  "mock-76": { lat: 39.8561, lng: -104.6737 }, // DEN
  "mock-77": { lat: 37.6213, lng: -122.3790 }, // SFO
  "mock-78": { lat: 47.4502, lng: -122.3088 }, // SEA
  "mock-79": { lat: 25.7959, lng: -80.2870 },  // MIA
  "mock-80": { lat: 42.3656, lng: -71.0096 },  // BOS
};

// PlaceSuggestion-compatible mock data for useServerGeocode
export const MOCK_PLACE_SUGGESTIONS = MOCK_ADDRESSES.map((address, i) => ({
  description: address,
  place_id: `mock-${i + 1}`,
  main_text: address.split(",")[0],
}));

// Simple string array for useGoogleMapsGeocode / useMapboxGeocode
export const MOCK_ADDRESS_STRINGS = MOCK_ADDRESSES;
