/**
 * City Utilities
 * Extract city name from formatted addresses
 */

/**
 * Extract city name from a formatted address
 * Handles formats like:
 * - "123 Main St, Baton Rouge, LA 70801"
 * - "875 Florida Blvd, Baton Rouge, LA"
 * - "New Orleans International Airport, New Orleans, LA"
 */
export function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  
  // Split by comma and look for city pattern
  const parts = address.split(',').map(p => p.trim());
  
  // Usually: [street, city, state+zip] or [place, street, city, state+zip]
  // City is typically the second-to-last segment before state
  if (parts.length >= 2) {
    // Check second-to-last part (before state/zip)
    const potentialCity = parts[parts.length - 2];
    // Remove any numbers (zip codes that may be attached) and state abbreviations
    const cleaned = potentialCity
      .replace(/\d+/g, '') // Remove numbers
      .replace(/\b[A-Z]{2}\b/g, '') // Remove 2-letter state codes
      .trim();
    
    if (cleaned && cleaned.length > 1) {
      return cleaned;
    }
  }
  
  return null;
}

/**
 * Normalize city name for database lookup
 * Handles common variations and case differences
 */
export function normalizeCityName(city: string | null): string | null {
  if (!city) return null;
  
  // Common city name variations and suburb mappings
  const variations: Record<string, string> = {
    // New York
    'new york': 'New York',
    'manhattan': 'New York',
    'brooklyn': 'New York',
    'queens': 'New York',
    'bronx': 'New York',
    'staten island': 'New York',
    // Los Angeles
    'los angeles': 'Los Angeles',
    'santa monica': 'Los Angeles',
    'hollywood': 'Los Angeles',
    'beverly hills': 'Los Angeles',
    'burbank': 'Los Angeles',
    'long beach': 'Los Angeles',
    // Chicago
    'chicago': 'Chicago',
    'evanston': 'Chicago',
    'oak park': 'Chicago',
    // Miami
    'miami': 'Miami',
    'miami beach': 'Miami',
    'coral gables': 'Miami',
    'hialeah': 'Miami',
    // Washington DC
    'washington': 'Washington',
    'arlington': 'Washington',
    'alexandria': 'Washington',
    // San Francisco Bay Area
    'san francisco': 'San Francisco',
    'cupertino': 'San Francisco',
    'san jose': 'San Francisco',
    'palo alto': 'San Francisco',
    // New Orleans
    'new orleans': 'New Orleans',
    'metairie': 'New Orleans',
    'kenner': 'New Orleans',
    'harvey': 'New Orleans',
    'gretna': 'New Orleans',
    // Honolulu
    'honolulu': 'Honolulu',
    // Atlanta
    'atlanta': 'Atlanta',
    'decatur': 'Atlanta',
    'marietta': 'Atlanta',
    'sandy springs': 'Atlanta',
    'roswell': 'Atlanta',
    // Austin
    'austin': 'Austin',
    'round rock': 'Austin',
    'cedar park': 'Austin',
    // Houston
    'houston': 'Houston',
    'pasadena': 'Houston',
    'sugar land': 'Houston',
    'the woodlands': 'Houston',
    // Dallas
    'dallas': 'Dallas',
    'fort worth': 'Dallas',
    'plano': 'Dallas',
    'irving': 'Dallas',
    'arlington tx': 'Dallas',
    // San Antonio
    'san antonio': 'San Antonio',
    // Philadelphia
    'philadelphia': 'Philadelphia',
    'camden': 'Philadelphia',
    // Baltimore
    'baltimore': 'Baltimore',
    'towson': 'Baltimore',
    // St. Louis
    'st. louis': 'St. Louis',
    'st louis': 'St. Louis',
    'saint louis': 'St. Louis',
    // Denver
    'denver': 'Denver',
    'aurora': 'Denver',
    'lakewood': 'Denver',
    // Seattle
    'seattle': 'Seattle',
    'bellevue': 'Seattle',
    'tacoma': 'Seattle',
    'redmond': 'Seattle',
    // Phoenix
    'phoenix': 'Phoenix',
    'scottsdale': 'Phoenix',
    'tempe': 'Phoenix',
    'mesa': 'Phoenix',
    // Las Vegas
    'las vegas': 'Las Vegas',
    'henderson': 'Las Vegas',
    'north las vegas': 'Las Vegas',
    // Tampa
    'tampa': 'Tampa',
    'st. petersburg': 'Tampa',
    'clearwater': 'Tampa',
    // Legacy
    'baton rouge': 'Baton Rouge',
    'denham springs': 'Baton Rouge',
    'gonzales': 'Baton Rouge',
    'prairieville': 'Baton Rouge',
    'zachary': 'Baton Rouge',
  };
  
  const lowerCity = city.toLowerCase().trim();
  return variations[lowerCity] || city;
}
