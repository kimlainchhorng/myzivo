/**
 * City Utilities
 * Extract city name from formatted addresses
 */

/**
 * Extract city name from a formatted address
 */
export function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const potentialCity = parts[parts.length - 2];
    const cleaned = potentialCity
      .replace(/\d+/g, '')
      .replace(/\b[A-Z]{2}\b/g, '')
      .trim();
    if (cleaned && cleaned.length > 1) {
      return cleaned;
    }
  }
  return null;
}

/**
 * Normalize city name for database lookup
 */
export function normalizeCityName(city: string | null): string | null {
  if (!city) return null;

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
    // Baton Rouge
    'baton rouge': 'Baton Rouge',
    'denham springs': 'Baton Rouge',
    'gonzales': 'Baton Rouge',
    'prairieville': 'Baton Rouge',
    'zachary': 'Baton Rouge',

    // ── Phase 2: New metro areas ──

    // Boston
    'boston': 'Boston',
    'cambridge': 'Boston',
    'somerville': 'Boston',
    'brookline': 'Boston',
    'quincy': 'Boston',
    // Detroit
    'detroit': 'Detroit',
    'dearborn': 'Detroit',
    'warren': 'Detroit',
    'livonia': 'Detroit',
    // Minneapolis
    'minneapolis': 'Minneapolis',
    'st. paul': 'Minneapolis',
    'saint paul': 'Minneapolis',
    'bloomington mn': 'Minneapolis',
    // Nashville
    'nashville': 'Nashville',
    'franklin tn': 'Nashville',
    'murfreesboro': 'Nashville',
    // Charlotte
    'charlotte': 'Charlotte',
    'concord nc': 'Charlotte',
    'gastonia': 'Charlotte',
    // Portland
    'portland': 'Portland',
    'beaverton': 'Portland',
    'hillsboro': 'Portland',
    // San Diego
    'san diego': 'San Diego',
    'chula vista': 'San Diego',
    'oceanside': 'San Diego',
    'carlsbad': 'San Diego',
    // Orlando
    'orlando': 'Orlando',
    'kissimmee': 'Orlando',
    'lake buena vista': 'Orlando',
    'winter park': 'Orlando',
    // Indianapolis
    'indianapolis': 'Indianapolis',
    'carmel in': 'Indianapolis',
    'fishers': 'Indianapolis',
    // Columbus
    'columbus': 'Columbus',
    'dublin oh': 'Columbus',
    'westerville': 'Columbus',
    // Kansas City
    'kansas city': 'Kansas City',
    'overland park': 'Kansas City',
    'olathe': 'Kansas City',
    // Milwaukee
    'milwaukee': 'Milwaukee',
    'wauwatosa': 'Milwaukee',
    'waukesha': 'Milwaukee',
    // Sacramento
    'sacramento': 'Sacramento',
    'elk grove': 'Sacramento',
    'folsom': 'Sacramento',
    // Raleigh
    'raleigh': 'Raleigh',
    'durham': 'Raleigh',
    'cary': 'Raleigh',
    'chapel hill': 'Raleigh',
    // Salt Lake City
    'salt lake city': 'Salt Lake City',
    'west valley city': 'Salt Lake City',
    'provo': 'Salt Lake City',
    'sandy ut': 'Salt Lake City',
  };

  const lowerCity = city.toLowerCase().trim();
  return variations[lowerCity] || city;
}
