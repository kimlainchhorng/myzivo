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
  
  // Common city name variations
  const variations: Record<string, string> = {
    'baton rouge': 'Baton Rouge',
    'new orleans': 'New Orleans',
    'metairie': 'New Orleans', // Suburb treated as New Orleans
    'kenner': 'New Orleans',
    'harvey': 'New Orleans',
    'gretna': 'New Orleans',
    'denham springs': 'Baton Rouge', // Suburb treated as Baton Rouge
    'gonzales': 'Baton Rouge',
    'prairieville': 'Baton Rouge',
    'zachary': 'Baton Rouge',
  };
  
  const lowerCity = city.toLowerCase().trim();
  return variations[lowerCity] || city;
}
