// Comprehensive global airports database for ZIVO Flights

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  timezone: string;
  lat: number;
  lng: number;
  type: 'international' | 'domestic' | 'regional';
  popularity: number; // 1-10 scale for search ranking
}

// Major international hubs
export const airports: Airport[] = [
  // North America
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', region: 'North America', timezone: 'EST', lat: 40.6413, lng: -73.7781, type: 'international', popularity: 10 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', region: 'North America', timezone: 'PST', lat: 33.9425, lng: -118.4081, type: 'international', popularity: 10 },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', region: 'North America', timezone: 'CST', lat: 41.9742, lng: -87.9073, type: 'international', popularity: 9 },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', region: 'North America', timezone: 'PST', lat: 37.6213, lng: -122.3790, type: 'international', popularity: 9 },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', region: 'North America', timezone: 'EST', lat: 25.7959, lng: -80.2870, type: 'international', popularity: 9 },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', region: 'North America', timezone: 'EST', lat: 33.6407, lng: -84.4277, type: 'international', popularity: 10 },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', region: 'North America', timezone: 'CST', lat: 32.8998, lng: -97.0403, type: 'international', popularity: 9 },
  { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', region: 'North America', timezone: 'MST', lat: 39.8561, lng: -104.6737, type: 'international', popularity: 8 },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', region: 'North America', timezone: 'PST', lat: 47.4502, lng: -122.3088, type: 'international', popularity: 8 },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA', region: 'North America', timezone: 'EST', lat: 42.3656, lng: -71.0096, type: 'international', popularity: 8 },
  { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', region: 'North America', timezone: 'PST', lat: 36.0840, lng: -115.1537, type: 'international', popularity: 8 },
  { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA', region: 'North America', timezone: 'MST', lat: 33.4373, lng: -112.0078, type: 'international', popularity: 7 },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', region: 'North America', timezone: 'CST', lat: 29.9902, lng: -95.3368, type: 'international', popularity: 8 },
  { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA', region: 'North America', timezone: 'EST', lat: 40.6895, lng: -74.1745, type: 'international', popularity: 9 },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', region: 'North America', timezone: 'EST', lat: 43.6777, lng: -79.6248, type: 'international', popularity: 9 },
  { code: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada', region: 'North America', timezone: 'PST', lat: 49.1967, lng: -123.1815, type: 'international', popularity: 8 },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada', region: 'North America', timezone: 'EST', lat: 45.4706, lng: -73.7408, type: 'international', popularity: 7 },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', region: 'North America', timezone: 'CST', lat: 19.4363, lng: -99.0721, type: 'international', popularity: 8 },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', region: 'North America', timezone: 'EST', lat: 21.0365, lng: -86.8771, type: 'international', popularity: 8 },

  // Europe
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.4700, lng: -0.4543, type: 'international', popularity: 10 },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.1537, lng: -0.1821, type: 'international', popularity: 8 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', region: 'Europe', timezone: 'CET', lat: 49.0097, lng: 2.5479, type: 'international', popularity: 10 },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France', region: 'Europe', timezone: 'CET', lat: 48.7262, lng: 2.3652, type: 'international', popularity: 7 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 50.0379, lng: 8.5622, type: 'international', popularity: 10 },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 48.3537, lng: 11.7750, type: 'international', popularity: 8 },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', timezone: 'CET', lat: 52.3105, lng: 4.7683, type: 'international', popularity: 10 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 40.4983, lng: -3.5676, type: 'international', popularity: 9 },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat', city: 'Barcelona', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 41.2974, lng: 2.0833, type: 'international', popularity: 9 },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 41.8003, lng: 12.2389, type: 'international', popularity: 9 },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 45.6306, lng: 8.7281, type: 'international', popularity: 8 },
  { code: 'ZRH', name: 'Zürich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', timezone: 'CET', lat: 47.4647, lng: 8.5492, type: 'international', popularity: 8 },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', region: 'Europe', timezone: 'CET', lat: 48.1103, lng: 16.5697, type: 'international', popularity: 8 },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'Europe', timezone: 'CET', lat: 55.6180, lng: 12.6508, type: 'international', popularity: 7 },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', region: 'Europe', timezone: 'CET', lat: 60.1976, lng: 11.1004, type: 'international', popularity: 7 },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', region: 'Europe', timezone: 'CET', lat: 59.6498, lng: 17.9238, type: 'international', popularity: 7 },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', region: 'Europe', timezone: 'EET', lat: 60.3172, lng: 24.9633, type: 'international', popularity: 7 },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', region: 'Europe', timezone: 'GMT', lat: 53.4264, lng: -6.2499, type: 'international', popularity: 8 },
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'Portugal', region: 'Europe', timezone: 'WET', lat: 38.7742, lng: -9.1342, type: 'international', popularity: 8 },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 37.9364, lng: 23.9475, type: 'international', popularity: 8 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 41.2753, lng: 28.7519, type: 'international', popularity: 10 },
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland', region: 'Europe', timezone: 'CET', lat: 52.1657, lng: 20.9671, type: 'international', popularity: 7 },
  { code: 'PRG', name: 'Václav Havel Prague', city: 'Prague', country: 'Czech Republic', region: 'Europe', timezone: 'CET', lat: 50.1008, lng: 14.2600, type: 'international', popularity: 8 },
  { code: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungary', region: 'Europe', timezone: 'CET', lat: 47.4369, lng: 19.2556, type: 'international', popularity: 7 },

  // Asia
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 35.7720, lng: 140.3929, type: 'international', popularity: 10 },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 35.5494, lng: 139.7798, type: 'international', popularity: 10 },
  { code: 'KIX', name: 'Kansai International', city: 'Osaka', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 34.4320, lng: 135.2304, type: 'international', popularity: 8 },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', region: 'Asia', timezone: 'KST', lat: 37.4602, lng: 126.4407, type: 'international', popularity: 10 },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', region: 'Asia', timezone: 'CST', lat: 40.0799, lng: 116.6031, type: 'international', popularity: 10 },
  { code: 'PKX', name: 'Beijing Daxing International', city: 'Beijing', country: 'China', region: 'Asia', timezone: 'CST', lat: 39.5098, lng: 116.4105, type: 'international', popularity: 8 },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', region: 'Asia', timezone: 'CST', lat: 31.1443, lng: 121.8083, type: 'international', popularity: 10 },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', timezone: 'HKT', lat: 22.3080, lng: 113.9185, type: 'international', popularity: 10 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', region: 'Asia', timezone: 'SGT', lat: 1.3644, lng: 103.9915, type: 'international', popularity: 10 },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 13.6900, lng: 100.7501, type: 'international', popularity: 10 },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', timezone: 'MYT', lat: 2.7456, lng: 101.7072, type: 'international', popularity: 9 },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', region: 'Asia', timezone: 'WIB', lat: -6.1256, lng: 106.6559, type: 'international', popularity: 8 },
  { code: 'DPS', name: 'Ngurah Rai International', city: 'Bali', country: 'Indonesia', region: 'Asia', timezone: 'WITA', lat: -8.7482, lng: 115.1671, type: 'international', popularity: 9 },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', region: 'Asia', timezone: 'PHT', lat: 14.5086, lng: 121.0194, type: 'international', popularity: 8 },
  { code: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam', region: 'Asia', timezone: 'ICT', lat: 10.8188, lng: 106.6520, type: 'international', popularity: 8 },
  { code: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam', region: 'Asia', timezone: 'ICT', lat: 21.2212, lng: 105.8072, type: 'international', popularity: 7 },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', region: 'Asia', timezone: 'IST', lat: 28.5562, lng: 77.1000, type: 'international', popularity: 10 },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', region: 'Asia', timezone: 'IST', lat: 19.0896, lng: 72.8656, type: 'international', popularity: 9 },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India', region: 'Asia', timezone: 'IST', lat: 13.1986, lng: 77.7066, type: 'international', popularity: 8 },
  { code: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan', region: 'Asia', timezone: 'CST', lat: 25.0797, lng: 121.2342, type: 'international', popularity: 9 },

  // Middle East
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 25.2532, lng: 55.3657, type: 'international', popularity: 10 },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 24.4330, lng: 54.6511, type: 'international', popularity: 8 },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', region: 'Middle East', timezone: 'AST', lat: 25.2609, lng: 51.6138, type: 'international', popularity: 10 },
  { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST', lat: 24.9576, lng: 46.6988, type: 'international', popularity: 8 },
  { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST', lat: 21.6796, lng: 39.1565, type: 'international', popularity: 8 },
  { code: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv', country: 'Israel', region: 'Middle East', timezone: 'IST', lat: 32.0055, lng: 34.8854, type: 'international', popularity: 8 },
  { code: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan', region: 'Middle East', timezone: 'EET', lat: 31.7226, lng: 35.9932, type: 'international', popularity: 7 },
  { code: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain', region: 'Middle East', timezone: 'AST', lat: 26.2708, lng: 50.6336, type: 'international', popularity: 7 },
  { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman', region: 'Middle East', timezone: 'GST', lat: 23.5933, lng: 58.2844, type: 'international', popularity: 7 },
  { code: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait', region: 'Middle East', timezone: 'AST', lat: 29.2266, lng: 47.9689, type: 'international', popularity: 7 },

  // Oceania
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', region: 'Oceania', timezone: 'AEST', lat: -33.9399, lng: 151.1753, type: 'international', popularity: 10 },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania', timezone: 'AEST', lat: -37.6690, lng: 144.8410, type: 'international', popularity: 9 },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', region: 'Oceania', timezone: 'AEST', lat: -27.3842, lng: 153.1175, type: 'international', popularity: 8 },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', region: 'Oceania', timezone: 'AWST', lat: -31.9403, lng: 115.9670, type: 'international', popularity: 7 },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Oceania', timezone: 'NZST', lat: -37.0082, lng: 174.7850, type: 'international', popularity: 8 },
  { code: 'CHC', name: 'Christchurch International', city: 'Christchurch', country: 'New Zealand', region: 'Oceania', timezone: 'NZST', lat: -43.4894, lng: 172.5322, type: 'international', popularity: 6 },
  { code: 'NAN', name: 'Nadi International', city: 'Nadi', country: 'Fiji', region: 'Oceania', timezone: 'FJT', lat: -17.7554, lng: 177.4431, type: 'international', popularity: 7 },

  // Africa
  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', region: 'Africa', timezone: 'SAST', lat: -26.1392, lng: 28.2460, type: 'international', popularity: 8 },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', region: 'Africa', timezone: 'SAST', lat: -33.9715, lng: 18.6021, type: 'international', popularity: 8 },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 30.1219, lng: 31.4056, type: 'international', popularity: 8 },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', region: 'Africa', timezone: 'WET', lat: 33.3675, lng: -7.5900, type: 'international', popularity: 7 },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', region: 'Africa', timezone: 'EAT', lat: -1.3192, lng: 36.9278, type: 'international', popularity: 7 },
  { code: 'ADD', name: 'Bole International', city: 'Addis Ababa', country: 'Ethiopia', region: 'Africa', timezone: 'EAT', lat: 8.9779, lng: 38.7993, type: 'international', popularity: 7 },
  { code: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria', region: 'Africa', timezone: 'WAT', lat: 6.5774, lng: 3.3212, type: 'international', popularity: 7 },

  // South America
  { code: 'GRU', name: 'São Paulo–Guarulhos International', city: 'São Paulo', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -23.4356, lng: -46.4731, type: 'international', popularity: 9 },
  { code: 'GIG', name: 'Rio de Janeiro–Galeão International', city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -22.8090, lng: -43.2436, type: 'international', popularity: 8 },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -34.8222, lng: -58.5358, type: 'international', popularity: 8 },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', region: 'South America', timezone: 'CLT', lat: -33.3930, lng: -70.7858, type: 'international', popularity: 8 },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', region: 'South America', timezone: 'PET', lat: -12.0219, lng: -77.1143, type: 'international', popularity: 8 },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', region: 'South America', timezone: 'COT', lat: 4.7016, lng: -74.1469, type: 'international', popularity: 8 },
  { code: 'PTY', name: 'Tocumen International', city: 'Panama City', country: 'Panama', region: 'Central America', timezone: 'EST', lat: 9.0714, lng: -79.3835, type: 'international', popularity: 8 },

  // Caribbean
  { code: 'SJU', name: 'Luis Muñoz Marín International', city: 'San Juan', country: 'Puerto Rico', region: 'Caribbean', timezone: 'AST', lat: 18.4394, lng: -66.0018, type: 'international', popularity: 7 },
  { code: 'NAS', name: 'Lynden Pindling International', city: 'Nassau', country: 'Bahamas', region: 'Caribbean', timezone: 'EST', lat: 25.0390, lng: -77.4662, type: 'international', popularity: 7 },
  { code: 'MBJ', name: 'Sangster International', city: 'Montego Bay', country: 'Jamaica', region: 'Caribbean', timezone: 'EST', lat: 18.5037, lng: -77.9134, type: 'international', popularity: 7 },
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic', region: 'Caribbean', timezone: 'AST', lat: 18.5674, lng: -68.3634, type: 'international', popularity: 8 },
  { code: 'AUA', name: 'Queen Beatrix International', city: 'Oranjestad', country: 'Aruba', region: 'Caribbean', timezone: 'AST', lat: 12.5014, lng: -70.0152, type: 'international', popularity: 7 },
];

// Helper functions
export const getAirportByCode = (code: string): Airport | undefined => {
  return airports.find(a => a.code === code);
};

export const searchAirports = (query: string): Airport[] => {
  const lowerQuery = query.toLowerCase();
  return airports
    .filter(a => 
      a.code.toLowerCase().includes(lowerQuery) ||
      a.city.toLowerCase().includes(lowerQuery) ||
      a.name.toLowerCase().includes(lowerQuery) ||
      a.country.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);
};

export const getAirportsByRegion = (region: string): Airport[] => {
  return airports.filter(a => a.region === region).sort((a, b) => b.popularity - a.popularity);
};

export const getPopularAirports = (limit: number = 20): Airport[] => {
  return [...airports].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
};

export const formatAirportDisplay = (airport: Airport): string => {
  return `${airport.city} (${airport.code})`;
};

export const formatAirportFullDisplay = (airport: Airport): string => {
  return `${airport.city}, ${airport.country} (${airport.code}) - ${airport.name}`;
};

// Popular routes for suggestions
export interface PopularRoute {
  from: string;
  to: string;
  avgPrice: number;
  flightTime: string;
  popularity: number;
}

export const popularRoutes: PopularRoute[] = [
  { from: 'JFK', to: 'LAX', avgPrice: 249, flightTime: '5h 30m', popularity: 10 },
  { from: 'JFK', to: 'LHR', avgPrice: 549, flightTime: '7h 00m', popularity: 10 },
  { from: 'LAX', to: 'NRT', avgPrice: 799, flightTime: '11h 30m', popularity: 9 },
  { from: 'SFO', to: 'SIN', avgPrice: 899, flightTime: '17h 30m', popularity: 8 },
  { from: 'JFK', to: 'CDG', avgPrice: 499, flightTime: '7h 30m', popularity: 9 },
  { from: 'LAX', to: 'DXB', avgPrice: 749, flightTime: '16h 00m', popularity: 8 },
  { from: 'ORD', to: 'FRA', avgPrice: 599, flightTime: '8h 30m', popularity: 8 },
  { from: 'MIA', to: 'GRU', avgPrice: 649, flightTime: '8h 45m', popularity: 7 },
  { from: 'SEA', to: 'ICN', avgPrice: 799, flightTime: '11h 00m', popularity: 7 },
  { from: 'BOS', to: 'DUB', avgPrice: 449, flightTime: '6h 30m', popularity: 8 },
  { from: 'ATL', to: 'AMS', avgPrice: 549, flightTime: '8h 15m', popularity: 7 },
  { from: 'DFW', to: 'LHR', avgPrice: 599, flightTime: '9h 30m', popularity: 8 },
  { from: 'LHR', to: 'SIN', avgPrice: 699, flightTime: '13h 00m', popularity: 9 },
  { from: 'CDG', to: 'HND', avgPrice: 849, flightTime: '12h 30m', popularity: 8 },
  { from: 'SYD', to: 'LAX', avgPrice: 999, flightTime: '14h 00m', popularity: 8 },
  { from: 'HKG', to: 'LHR', avgPrice: 749, flightTime: '13h 00m', popularity: 8 },
  { from: 'DXB', to: 'JFK', avgPrice: 699, flightTime: '14h 00m', popularity: 9 },
  { from: 'DOH', to: 'LAX', avgPrice: 799, flightTime: '16h 30m', popularity: 8 },
];

// Get route suggestions based on origin
export const getRoutesSuggestions = (fromCode: string): PopularRoute[] => {
  return popularRoutes.filter(r => r.from === fromCode).sort((a, b) => b.popularity - a.popularity);
};
