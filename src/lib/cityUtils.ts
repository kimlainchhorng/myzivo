/**
 * City Utilities
 * Extract city name from formatted addresses
 */

export function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const potentialCity = parts[parts.length - 2];
    const cleaned = potentialCity.replace(/\d+/g, '').replace(/\b[A-Z]{2}\b/g, '').trim();
    if (cleaned && cleaned.length > 1) return cleaned;
  }
  return null;
}

export function normalizeCityName(city: string | null): string | null {
  if (!city) return null;

  const variations: Record<string, string> = {
    // New York
    'new york': 'New York', 'manhattan': 'New York', 'brooklyn': 'New York',
    'queens': 'New York', 'bronx': 'New York', 'staten island': 'New York',
    'east rutherford': 'New York',
    // Los Angeles
    'los angeles': 'Los Angeles', 'santa monica': 'Los Angeles', 'hollywood': 'Los Angeles',
    'beverly hills': 'Los Angeles', 'burbank': 'Los Angeles', 'long beach': 'Los Angeles',
    'universal city': 'Los Angeles', 'anaheim': 'Los Angeles', 'glendale': 'Los Angeles',
    // San Francisco Bay Area
    'san francisco': 'San Francisco', 'cupertino': 'San Francisco', 'san jose': 'San Francisco',
    'palo alto': 'San Francisco', 'mountain view': 'San Francisco', 'menlo park': 'San Francisco',
    'sunnyvale': 'San Francisco', 'fremont': 'San Francisco', 'oakland': 'San Francisco',
    // Chicago
    'chicago': 'Chicago', 'evanston': 'Chicago', 'oak park': 'Chicago',
    'naperville': 'Chicago', 'schaumburg': 'Chicago',
    // Miami
    'miami': 'Miami', 'miami beach': 'Miami', 'coral gables': 'Miami',
    'hialeah': 'Miami', 'miami gardens': 'Miami', 'fort lauderdale': 'Miami',
    // Washington DC
    'washington': 'Washington', 'arlington': 'Washington', 'alexandria': 'Washington',
    'bethesda': 'Washington', 'silver spring': 'Washington',
    // New Orleans
    'new orleans': 'New Orleans', 'metairie': 'New Orleans', 'kenner': 'New Orleans',
    'harvey': 'New Orleans', 'gretna': 'New Orleans',
    // Honolulu
    'honolulu': 'Honolulu',
    // Atlanta
    'atlanta': 'Atlanta', 'decatur': 'Atlanta', 'marietta': 'Atlanta',
    'sandy springs': 'Atlanta', 'roswell': 'Atlanta',
    // Savannah
    'savannah': 'Savannah',
    // Austin
    'austin': 'Austin', 'round rock': 'Austin', 'cedar park': 'Austin',
    // Houston
    'houston': 'Houston', 'pasadena': 'Houston', 'sugar land': 'Houston',
    'the woodlands': 'Houston',
    // Dallas
    'dallas': 'Dallas', 'fort worth': 'Dallas', 'plano': 'Dallas',
    'irving': 'Dallas', 'arlington tx': 'Dallas',
    // San Antonio
    'san antonio': 'San Antonio',
    // El Paso
    'el paso': 'El Paso',
    // Philadelphia
    'philadelphia': 'Philadelphia', 'camden': 'Philadelphia',
    // Pittsburgh
    'pittsburgh': 'Pittsburgh',
    // Baltimore
    'baltimore': 'Baltimore', 'towson': 'Baltimore',
    // St. Louis
    'st. louis': 'St. Louis', 'st louis': 'St. Louis', 'saint louis': 'St. Louis',
    // Kansas City
    'kansas city': 'Kansas City', 'overland park': 'Kansas City', 'olathe': 'Kansas City',
    // Denver
    'denver': 'Denver', 'aurora': 'Denver', 'lakewood': 'Denver',
    // Colorado Springs
    'colorado springs': 'Colorado Springs',
    // Seattle
    'seattle': 'Seattle', 'bellevue': 'Seattle', 'tacoma': 'Seattle', 'redmond': 'Seattle',
    // Phoenix
    'phoenix': 'Phoenix', 'scottsdale': 'Phoenix', 'tempe': 'Phoenix', 'mesa': 'Phoenix',
    // Tucson
    'tucson': 'Tucson',
    // Las Vegas
    'las vegas': 'Las Vegas', 'henderson': 'Las Vegas', 'north las vegas': 'Las Vegas',
    // Reno
    'reno': 'Reno',
    // Tampa
    'tampa': 'Tampa', 'st. petersburg': 'Tampa', 'clearwater': 'Tampa',
    // Orlando
    'orlando': 'Orlando', 'kissimmee': 'Orlando', 'lake buena vista': 'Orlando',
    'winter park': 'Orlando',
    // Jacksonville
    'jacksonville': 'Jacksonville',
    // Baton Rouge
    'baton rouge': 'Baton Rouge', 'denham springs': 'Baton Rouge',
    'gonzales': 'Baton Rouge', 'prairieville': 'Baton Rouge', 'zachary': 'Baton Rouge',
    // Boston
    'boston': 'Boston', 'cambridge': 'Boston', 'somerville': 'Boston',
    'brookline': 'Boston', 'quincy': 'Boston', 'foxborough': 'Boston',
    // Detroit
    'detroit': 'Detroit', 'dearborn': 'Detroit', 'warren': 'Detroit',
    'livonia': 'Detroit', 'ann arbor': 'Detroit',
    // Minneapolis
    'minneapolis': 'Minneapolis', 'st. paul': 'Minneapolis', 'saint paul': 'Minneapolis',
    'bloomington mn': 'Minneapolis',
    // Nashville
    'nashville': 'Nashville', 'franklin tn': 'Nashville', 'murfreesboro': 'Nashville',
    // Memphis
    'memphis': 'Memphis',
    // Charlotte
    'charlotte': 'Charlotte', 'concord nc': 'Charlotte', 'gastonia': 'Charlotte',
    // Raleigh
    'raleigh': 'Raleigh', 'durham': 'Raleigh', 'cary': 'Raleigh', 'chapel hill': 'Raleigh',
    // Portland OR
    'portland': 'Portland', 'beaverton': 'Portland', 'hillsboro': 'Portland',
    // San Diego
    'san diego': 'San Diego', 'chula vista': 'San Diego', 'oceanside': 'San Diego',
    'carlsbad': 'San Diego',
    // Indianapolis
    'indianapolis': 'Indianapolis', 'carmel in': 'Indianapolis', 'fishers': 'Indianapolis',
    // Columbus
    'columbus': 'Columbus', 'dublin oh': 'Columbus', 'westerville': 'Columbus',
    // Cleveland
    'cleveland': 'Cleveland',
    // Cincinnati
    'cincinnati': 'Cincinnati',
    // Milwaukee
    'milwaukee': 'Milwaukee', 'wauwatosa': 'Milwaukee', 'waukesha': 'Milwaukee',
    // Madison
    'madison': 'Madison',
    // Salt Lake City
    'salt lake city': 'Salt Lake City', 'west valley city': 'Salt Lake City',
    'provo': 'Salt Lake City', 'sandy ut': 'Salt Lake City',
    // Hartford
    'hartford': 'Hartford',
    // New Haven
    'new haven': 'New Haven',
    // Charleston SC
    'charleston': 'Charleston', 'north charleston': 'Charleston',
    // Montgomery
    'montgomery': 'Montgomery',
    // Birmingham
    'birmingham': 'Birmingham',
    // Louisville
    'louisville': 'Louisville',
    // Lexington
    'lexington': 'Lexington',
    // Des Moines
    'des moines': 'Des Moines',
    // Cedar Rapids
    'cedar rapids': 'Cedar Rapids',
    // Topeka
    'topeka': 'Topeka',
    // Little Rock
    'little rock': 'Little Rock',
    // Jackson MS
    'jackson': 'Jackson',
    // Oklahoma City
    'oklahoma city': 'Oklahoma City',
    // Tulsa
    'tulsa': 'Tulsa',
    // Omaha
    'omaha': 'Omaha',
    // Lincoln
    'lincoln': 'Lincoln',
    // Albuquerque
    'albuquerque': 'Albuquerque',
    // Santa Fe
    'santa fe': 'Santa Fe',
    // Boise
    'boise': 'Boise',
    // Anchorage
    'anchorage': 'Anchorage',
    // Juneau
    'juneau': 'Juneau',
    // Atlantic City
    'atlantic city': 'Atlantic City',
    // Princeton
    'princeton': 'Princeton',
    // Newark
    'newark': 'Newark',
    // Burlington VT
    'burlington': 'Burlington',
    // Providence
    'providence': 'Providence',
    // Wilmington DE
    'wilmington': 'Wilmington',
    // Sioux Falls
    'sioux falls': 'Sioux Falls',
    // Bozeman
    'bozeman': 'Bozeman',
    // Helena
    'helena': 'Helena',
    // Cheyenne
    'cheyenne': 'Cheyenne',
    // Bismarck
    'bismarck': 'Bismarck',
    // Concord NH
    'concord': 'Concord',
    // Manchester NH
    'manchester': 'Manchester',
    // Montpelier
    'montpelier': 'Montpelier',
    // Dover DE
    'dover': 'Dover',
    // Portland ME
    'portland me': 'Portland',
  };

  const lowerCity = city.toLowerCase().trim();
  return variations[lowerCity] || city;
}
