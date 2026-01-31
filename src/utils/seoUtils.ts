/**
 * SEO utility functions for dynamic page generation
 */

// City code to full name mapping
const cityNames: Record<string, string> = {
  // US Cities
  "jfk": "New York",
  "lax": "Los Angeles",
  "sfo": "San Francisco",
  "ord": "Chicago",
  "mia": "Miami",
  "bos": "Boston",
  "sea": "Seattle",
  "dfw": "Dallas",
  "atl": "Atlanta",
  "den": "Denver",
  "las": "Las Vegas",
  "phx": "Phoenix",
  "hnl": "Honolulu",
  "ewr": "Newark",
  "iad": "Washington DC",
  
  // Europe
  "lhr": "London",
  "cdg": "Paris",
  "fra": "Frankfurt",
  "ams": "Amsterdam",
  "mad": "Madrid",
  "bcn": "Barcelona",
  "fcо": "Rome",
  "muc": "Munich",
  "dub": "Dublin",
  "lis": "Lisbon",
  "vie": "Vienna",
  "zrh": "Zurich",
  
  // Asia
  "nrt": "Tokyo",
  "hnd": "Tokyo Haneda",
  "hkg": "Hong Kong",
  "sin": "Singapore",
  "icn": "Seoul",
  "bkk": "Bangkok",
  "dxb": "Dubai",
  "del": "Delhi",
  "bom": "Mumbai",
  "pek": "Beijing",
  "pvg": "Shanghai",
  
  // Americas
  "yyz": "Toronto",
  "yvr": "Vancouver",
  "mex": "Mexico City",
  "cun": "Cancún",
  "gru": "São Paulo",
  "eze": "Buenos Aires",
  "bog": "Bogotá",
  "lim": "Lima",
  
  // Australia/Oceania
  "syd": "Sydney",
  "mel": "Melbourne",
  "akl": "Auckland",
};

/**
 * Get city name from airport code
 */
export function getCityFromCode(code: string): string {
  const normalizedCode = code.toLowerCase().trim();
  return cityNames[normalizedCode] || code.toUpperCase();
}

/**
 * Format a city name for URL slug
 */
export function formatCitySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Parse city from URL slug
 */
export function parseCitySlug(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate SEO title, description, and H1 for flight routes
 */
export function formatRouteTitle(from: string, to: string): {
  title: string;
  description: string;
  h1: string;
} {
  const fromFormatted = from ? parseCitySlug(from) : "";
  const toFormatted = to ? parseCitySlug(to) : "";

  if (fromFormatted && toFormatted) {
    return {
      title: `Flights from ${fromFormatted} to ${toFormatted} | Compare & Book | ZIVO`,
      description: `Compare cheap flights from ${fromFormatted} to ${toFormatted}. Search 500+ airlines, find the best deals, and book with trusted travel partners. No booking fees.`,
      h1: `Flights from ${fromFormatted} to ${toFormatted}`,
    };
  }

  if (fromFormatted) {
    return {
      title: `Cheap Flights from ${fromFormatted} | Compare Prices | ZIVO`,
      description: `Find cheap flights departing from ${fromFormatted}. Compare prices across 500+ airlines and book with trusted travel partners.`,
      h1: `Cheap Flights from ${fromFormatted}`,
    };
  }

  if (toFormatted) {
    return {
      title: `Flights to ${toFormatted} | Search & Compare | ZIVO`,
      description: `Search flights to ${toFormatted} from any city. Compare 500+ airlines and find the best deals for your trip.`,
      h1: `Flights to ${toFormatted}`,
    };
  }

  return {
    title: "ZIVO Flights – Search & Compare Flights Worldwide",
    description: "Search and compare flights from 500+ airlines worldwide. Find the best deals and book with trusted travel partners. No booking fees.",
    h1: "Compare prices from 500+ airlines",
  };
}

/**
 * Generate popular route combinations for SEO
 */
export const popularSEORoutes = [
  { from: "new-york", to: "los-angeles", code: { from: "JFK", to: "LAX" } },
  { from: "los-angeles", to: "london", code: { from: "LAX", to: "LHR" } },
  { from: "new-york", to: "london", code: { from: "JFK", to: "LHR" } },
  { from: "san-francisco", to: "tokyo", code: { from: "SFO", to: "NRT" } },
  { from: "chicago", to: "paris", code: { from: "ORD", to: "CDG" } },
  { from: "miami", to: "cancun", code: { from: "MIA", to: "CUN" } },
  { from: "boston", to: "dublin", code: { from: "BOS", to: "DUB" } },
  { from: "seattle", to: "honolulu", code: { from: "SEA", to: "HNL" } },
  { from: "dallas", to: "las-vegas", code: { from: "DFW", to: "LAS" } },
  { from: "new-york", to: "paris", code: { from: "JFK", to: "CDG" } },
  { from: "los-angeles", to: "tokyo", code: { from: "LAX", to: "NRT" } },
  { from: "miami", to: "new-york", code: { from: "MIA", to: "JFK" } },
];

/**
 * Generate popular destination cities for SEO
 */
export const popularDestinations = [
  { city: "London", code: "LHR", country: "United Kingdom", image: "🇬🇧" },
  { city: "Paris", code: "CDG", country: "France", image: "🇫🇷" },
  { city: "Tokyo", code: "NRT", country: "Japan", image: "🇯🇵" },
  { city: "Dubai", code: "DXB", country: "UAE", image: "🇦🇪" },
  { city: "Cancún", code: "CUN", country: "Mexico", image: "🇲🇽" },
  { city: "Barcelona", code: "BCN", country: "Spain", image: "🇪🇸" },
  { city: "Los Angeles", code: "LAX", country: "USA", image: "🇺🇸" },
  { city: "Singapore", code: "SIN", country: "Singapore", image: "🇸🇬" },
];
