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
  { code: 'BGI', name: 'Grantley Adams International', city: 'Bridgetown', country: 'Barbados', region: 'Caribbean', timezone: 'AST', lat: 13.0746, lng: -59.4925, type: 'international', popularity: 6 },
  { code: 'GCM', name: 'Owen Roberts International', city: 'George Town', country: 'Cayman Islands', region: 'Caribbean', timezone: 'EST', lat: 19.2928, lng: -81.3577, type: 'international', popularity: 6 },
  { code: 'SXM', name: 'Princess Juliana International', city: 'Philipsburg', country: 'Sint Maarten', region: 'Caribbean', timezone: 'AST', lat: 18.0410, lng: -63.1089, type: 'international', popularity: 6 },

  // Additional Asia-Pacific
  { code: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 42.7752, lng: 141.6925, type: 'international', popularity: 7 },
  { code: 'NGO', name: 'Chubu Centrair International', city: 'Nagoya', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 34.8584, lng: 136.8054, type: 'international', popularity: 7 },
  { code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan', region: 'Asia', timezone: 'JST', lat: 33.5859, lng: 130.4511, type: 'international', popularity: 6 },
  { code: 'PUS', name: 'Gimhae International', city: 'Busan', country: 'South Korea', region: 'Asia', timezone: 'KST', lat: 35.1796, lng: 128.9382, type: 'international', popularity: 7 },
  { code: 'CAN', name: 'Guangzhou Baiyun International', city: 'Guangzhou', country: 'China', region: 'Asia', timezone: 'CST', lat: 23.3924, lng: 113.2988, type: 'international', popularity: 9 },
  { code: 'SZX', name: 'Shenzhen Bao\'an International', city: 'Shenzhen', country: 'China', region: 'Asia', timezone: 'CST', lat: 22.6393, lng: 113.8107, type: 'international', popularity: 8 },
  { code: 'CTU', name: 'Chengdu Tianfu International', city: 'Chengdu', country: 'China', region: 'Asia', timezone: 'CST', lat: 30.3126, lng: 104.4419, type: 'international', popularity: 8 },
  { code: 'HGH', name: 'Hangzhou Xiaoshan International', city: 'Hangzhou', country: 'China', region: 'Asia', timezone: 'CST', lat: 30.2295, lng: 120.4343, type: 'international', popularity: 7 },
  { code: 'XMN', name: 'Xiamen Gaoqi International', city: 'Xiamen', country: 'China', region: 'Asia', timezone: 'CST', lat: 24.5440, lng: 118.1278, type: 'international', popularity: 7 },
  { code: 'REP', name: 'Siem Reap International', city: 'Siem Reap', country: 'Cambodia', region: 'Asia', timezone: 'ICT', lat: 13.4107, lng: 103.8132, type: 'international', popularity: 6 },
  { code: 'RGN', name: 'Yangon International', city: 'Yangon', country: 'Myanmar', region: 'Asia', timezone: 'MMT', lat: 16.9073, lng: 96.1322, type: 'international', popularity: 6 },
  { code: 'DAD', name: 'Da Nang International', city: 'Da Nang', country: 'Vietnam', region: 'Asia', timezone: 'ICT', lat: 16.0439, lng: 108.1994, type: 'international', popularity: 7 },
  { code: 'PNH', name: 'Phnom Penh International', city: 'Phnom Penh', country: 'Cambodia', region: 'Asia', timezone: 'ICT', lat: 11.5466, lng: 104.8442, type: 'international', popularity: 6 },
  { code: 'CMB', name: 'Bandaranaike International', city: 'Colombo', country: 'Sri Lanka', region: 'Asia', timezone: 'IST', lat: 7.1808, lng: 79.8841, type: 'international', popularity: 7 },
  { code: 'MLE', name: 'Velana International', city: 'Malé', country: 'Maldives', region: 'Asia', timezone: 'MVT', lat: 4.1918, lng: 73.5290, type: 'international', popularity: 8 },
  { code: 'KTM', name: 'Tribhuvan International', city: 'Kathmandu', country: 'Nepal', region: 'Asia', timezone: 'NPT', lat: 27.6966, lng: 85.3591, type: 'international', popularity: 6 },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India', region: 'Asia', timezone: 'IST', lat: 12.9941, lng: 80.1709, type: 'international', popularity: 8 },
  { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India', region: 'Asia', timezone: 'IST', lat: 17.2403, lng: 78.4294, type: 'international', popularity: 8 },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', country: 'India', region: 'Asia', timezone: 'IST', lat: 22.6547, lng: 88.4467, type: 'international', popularity: 7 },

  // Additional Europe
  { code: 'STN', name: 'London Stansted', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.8850, lng: 0.2350, type: 'international', popularity: 7 },
  { code: 'LTN', name: 'London Luton', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.8747, lng: -0.3683, type: 'international', popularity: 6 },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 53.3537, lng: -2.2750, type: 'international', popularity: 7 },
  { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 55.9500, lng: -3.3725, type: 'international', popularity: 7 },
  { code: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 51.2895, lng: 6.7668, type: 'international', popularity: 7 },
  { code: 'HAM', name: 'Hamburg Airport', city: 'Hamburg', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 53.6304, lng: 9.9882, type: 'international', popularity: 6 },
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 52.3667, lng: 13.5033, type: 'international', popularity: 8 },
  { code: 'VCE', name: 'Venice Marco Polo', city: 'Venice', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 45.5053, lng: 12.3519, type: 'international', popularity: 7 },
  { code: 'NAP', name: 'Naples International', city: 'Naples', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 40.8860, lng: 14.2908, type: 'international', popularity: 6 },
  { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 39.5517, lng: 2.7388, type: 'international', popularity: 8 },
  { code: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 36.6749, lng: -4.4991, type: 'international', popularity: 7 },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', region: 'Europe', timezone: 'CET', lat: 46.2370, lng: 6.1092, type: 'international', popularity: 7 },
  { code: 'BSL', name: 'EuroAirport Basel-Mulhouse-Freiburg', city: 'Basel', country: 'Switzerland', region: 'Europe', timezone: 'CET', lat: 47.5896, lng: 7.5299, type: 'international', popularity: 6 },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', region: 'Europe', timezone: 'CET', lat: 50.9014, lng: 4.4844, type: 'international', popularity: 8 },
  { code: 'OPO', name: 'Francisco Sá Carneiro', city: 'Porto', country: 'Portugal', region: 'Europe', timezone: 'WET', lat: 41.2481, lng: -8.6814, type: 'international', popularity: 7 },
  { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', region: 'Europe', timezone: 'CET', lat: 43.6584, lng: 7.2159, type: 'international', popularity: 7 },
  { code: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', region: 'Europe', timezone: 'CET', lat: 45.7256, lng: 5.0811, type: 'international', popularity: 6 },
  { code: 'MRS', name: 'Marseille Provence', city: 'Marseille', country: 'France', region: 'Europe', timezone: 'CET', lat: 43.4393, lng: 5.2214, type: 'international', popularity: 6 },
  { code: 'TXL', name: 'Berlin Tegel', city: 'Berlin', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 52.5597, lng: 13.2877, type: 'international', popularity: 5 },

  // Additional US Airports
  { code: 'MSP', name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', country: 'USA', region: 'North America', timezone: 'CST', lat: 44.8820, lng: -93.2218, type: 'international', popularity: 7 },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit', country: 'USA', region: 'North America', timezone: 'EST', lat: 42.2124, lng: -83.3534, type: 'international', popularity: 7 },
  { code: 'CLT', name: 'Charlotte Douglas International', city: 'Charlotte', country: 'USA', region: 'North America', timezone: 'EST', lat: 35.2140, lng: -80.9431, type: 'international', popularity: 8 },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.8721, lng: -75.2411, type: 'international', popularity: 8 },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International', city: 'Fort Lauderdale', country: 'USA', region: 'North America', timezone: 'EST', lat: 26.0726, lng: -80.1527, type: 'international', popularity: 8 },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA', region: 'North America', timezone: 'PST', lat: 32.7336, lng: -117.1897, type: 'international', popularity: 7 },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA', region: 'North America', timezone: 'EST', lat: 27.9755, lng: -82.5332, type: 'international', popularity: 7 },
  { code: 'PDX', name: 'Portland International', city: 'Portland', country: 'USA', region: 'North America', timezone: 'PST', lat: 45.5898, lng: -122.5951, type: 'international', popularity: 7 },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'USA', region: 'North America', timezone: 'MST', lat: 40.7884, lng: -111.9778, type: 'international', popularity: 7 },
  { code: 'BWI', name: 'Baltimore/Washington International', city: 'Baltimore', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.1754, lng: -76.6682, type: 'international', popularity: 7 },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington D.C.', country: 'USA', region: 'North America', timezone: 'EST', lat: 38.8512, lng: -77.0402, type: 'international', popularity: 8 },
  { code: 'IAD', name: 'Washington Dulles International', city: 'Washington D.C.', country: 'USA', region: 'North America', timezone: 'EST', lat: 38.9531, lng: -77.4565, type: 'international', popularity: 8 },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA', region: 'North America', timezone: 'HST', lat: 21.3187, lng: -157.9225, type: 'international', popularity: 9 },
  { code: 'ANC', name: 'Ted Stevens Anchorage International', city: 'Anchorage', country: 'USA', region: 'North America', timezone: 'AKST', lat: 61.1743, lng: -149.9962, type: 'international', popularity: 6 },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA', region: 'North America', timezone: 'HST', lat: 20.8986, lng: -156.4305, type: 'international', popularity: 8 },
  { code: 'RSW', name: 'Southwest Florida International', city: 'Fort Myers', country: 'USA', region: 'North America', timezone: 'EST', lat: 26.5362, lng: -81.7552, type: 'international', popularity: 7 },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', region: 'North America', timezone: 'EST', lat: 28.4312, lng: -81.3081, type: 'international', popularity: 9 },
  { code: 'AUS', name: 'Austin-Bergstrom International', city: 'Austin', country: 'USA', region: 'North America', timezone: 'CST', lat: 30.1975, lng: -97.6664, type: 'international', popularity: 7 },
  { code: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', country: 'USA', region: 'North America', timezone: 'EST', lat: 35.8776, lng: -78.7875, type: 'international', popularity: 6 },
  { code: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'USA', region: 'North America', timezone: 'PST', lat: 38.6954, lng: -121.5908, type: 'international', popularity: 6 },
  { code: 'SJC', name: 'San Jose International', city: 'San Jose', country: 'USA', region: 'North America', timezone: 'PST', lat: 37.3626, lng: -121.9291, type: 'international', popularity: 7 },
  { code: 'OAK', name: 'Oakland International', city: 'Oakland', country: 'USA', region: 'North America', timezone: 'PST', lat: 37.7213, lng: -122.2208, type: 'international', popularity: 6 },
  { code: 'BNA', name: 'Nashville International', city: 'Nashville', country: 'USA', region: 'North America', timezone: 'CST', lat: 36.1263, lng: -86.6774, type: 'international', popularity: 7 },
  { code: 'STL', name: 'St. Louis Lambert International', city: 'St. Louis', country: 'USA', region: 'North America', timezone: 'CST', lat: 38.7487, lng: -90.3700, type: 'international', popularity: 6 },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'USA', region: 'North America', timezone: 'CST', lat: 39.2976, lng: -94.7139, type: 'international', popularity: 6 },
  { code: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.7173, lng: -86.2944, type: 'international', popularity: 6 },
  { code: 'CLE', name: 'Cleveland Hopkins International', city: 'Cleveland', country: 'USA', region: 'North America', timezone: 'EST', lat: 41.4117, lng: -81.8498, type: 'international', popularity: 6 },
  { code: 'CMH', name: 'John Glenn Columbus International', city: 'Columbus', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.9980, lng: -82.8919, type: 'international', popularity: 6 },
  { code: 'PIT', name: 'Pittsburgh International', city: 'Pittsburgh', country: 'USA', region: 'North America', timezone: 'EST', lat: 40.4915, lng: -80.2329, type: 'international', popularity: 6 },

  // Additional Canada
  { code: 'YYC', name: 'Calgary International', city: 'Calgary', country: 'Canada', region: 'North America', timezone: 'MST', lat: 51.1215, lng: -114.0076, type: 'international', popularity: 7 },
  { code: 'YEG', name: 'Edmonton International', city: 'Edmonton', country: 'Canada', region: 'North America', timezone: 'MST', lat: 53.3097, lng: -113.5800, type: 'international', popularity: 6 },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier International', city: 'Ottawa', country: 'Canada', region: 'North America', timezone: 'EST', lat: 45.3225, lng: -75.6692, type: 'international', popularity: 6 },
  { code: 'YWG', name: 'Winnipeg James Armstrong Richardson International', city: 'Winnipeg', country: 'Canada', region: 'North America', timezone: 'CST', lat: 49.9100, lng: -97.2399, type: 'international', popularity: 5 },
  { code: 'YHZ', name: 'Halifax Stanfield International', city: 'Halifax', country: 'Canada', region: 'North America', timezone: 'AST', lat: 44.8808, lng: -63.5086, type: 'international', popularity: 5 },

  // Additional Mexico & Central America
  { code: 'GDL', name: 'Guadalajara International', city: 'Guadalajara', country: 'Mexico', region: 'North America', timezone: 'CST', lat: 20.5218, lng: -103.3111, type: 'international', popularity: 7 },
  { code: 'MTY', name: 'Monterrey International', city: 'Monterrey', country: 'Mexico', region: 'North America', timezone: 'CST', lat: 25.7785, lng: -100.1070, type: 'international', popularity: 6 },
  { code: 'SJO', name: 'Juan Santamaría International', city: 'San José', country: 'Costa Rica', region: 'Central America', timezone: 'CST', lat: 9.9939, lng: -84.2088, type: 'international', popularity: 7 },
  { code: 'GUA', name: 'La Aurora International', city: 'Guatemala City', country: 'Guatemala', region: 'Central America', timezone: 'CST', lat: 14.5833, lng: -90.5275, type: 'international', popularity: 6 },
  { code: 'SAL', name: 'Óscar Arnulfo Romero International', city: 'San Salvador', country: 'El Salvador', region: 'Central America', timezone: 'CST', lat: 13.4409, lng: -89.0557, type: 'international', popularity: 5 },

  // Additional South America
  { code: 'MDE', name: 'José María Córdova International', city: 'Medellín', country: 'Colombia', region: 'South America', timezone: 'COT', lat: 6.1645, lng: -75.4231, type: 'international', popularity: 7 },
  { code: 'CTG', name: 'Rafael Núñez International', city: 'Cartagena', country: 'Colombia', region: 'South America', timezone: 'COT', lat: 10.4424, lng: -75.5130, type: 'international', popularity: 6 },
  { code: 'UIO', name: 'Mariscal Sucre International', city: 'Quito', country: 'Ecuador', region: 'South America', timezone: 'ECT', lat: -0.1292, lng: -78.3575, type: 'international', popularity: 6 },
  { code: 'GYE', name: 'José Joaquín de Olmedo International', city: 'Guayaquil', country: 'Ecuador', region: 'South America', timezone: 'ECT', lat: -2.1574, lng: -79.8837, type: 'international', popularity: 5 },
  { code: 'CCS', name: 'Simón Bolívar International', city: 'Caracas', country: 'Venezuela', region: 'South America', timezone: 'VET', lat: 10.6012, lng: -66.9912, type: 'international', popularity: 6 },
  { code: 'MVD', name: 'Carrasco International', city: 'Montevideo', country: 'Uruguay', region: 'South America', timezone: 'UYT', lat: -34.8384, lng: -56.0308, type: 'international', popularity: 6 },
  { code: 'ASU', name: 'Silvio Pettirossi International', city: 'Asunción', country: 'Paraguay', region: 'South America', timezone: 'PYT', lat: -25.2400, lng: -57.5200, type: 'international', popularity: 5 },
  { code: 'LPB', name: 'El Alto International', city: 'La Paz', country: 'Bolivia', region: 'South America', timezone: 'BOT', lat: -16.5133, lng: -68.1922, type: 'international', popularity: 5 },
  { code: 'CUZ', name: 'Alejandro Velasco Astete International', city: 'Cusco', country: 'Peru', region: 'South America', timezone: 'PET', lat: -13.5357, lng: -71.9388, type: 'international', popularity: 7 },

  // Additional Caribbean
  { code: 'SDQ', name: 'Las Américas International', city: 'Santo Domingo', country: 'Dominican Republic', region: 'Caribbean', timezone: 'AST', lat: 18.4297, lng: -69.6689, type: 'international', popularity: 7 },
  { code: 'HAV', name: 'José Martí International', city: 'Havana', country: 'Cuba', region: 'Caribbean', timezone: 'CST', lat: 22.9892, lng: -82.4091, type: 'international', popularity: 6 },
  { code: 'KIN', name: 'Norman Manley International', city: 'Kingston', country: 'Jamaica', region: 'Caribbean', timezone: 'EST', lat: 17.9357, lng: -76.7875, type: 'international', popularity: 6 },
  { code: 'CUR', name: 'Hato International', city: 'Willemstad', country: 'Curaçao', region: 'Caribbean', timezone: 'AST', lat: 12.1889, lng: -68.9598, type: 'international', popularity: 5 },
  { code: 'POS', name: 'Piarco International', city: 'Port of Spain', country: 'Trinidad and Tobago', region: 'Caribbean', timezone: 'AST', lat: 10.5954, lng: -61.3372, type: 'international', popularity: 5 },

  // Additional Africa
  { code: 'DUR', name: 'King Shaka International', city: 'Durban', country: 'South Africa', region: 'Africa', timezone: 'SAST', lat: -29.6144, lng: 31.1197, type: 'international', popularity: 6 },
  { code: 'ACC', name: 'Kotoka International', city: 'Accra', country: 'Ghana', region: 'Africa', timezone: 'GMT', lat: 5.6052, lng: -0.1668, type: 'international', popularity: 6 },
  { code: 'DAR', name: 'Julius Nyerere International', city: 'Dar es Salaam', country: 'Tanzania', region: 'Africa', timezone: 'EAT', lat: -6.8781, lng: 39.2026, type: 'international', popularity: 6 },
  { code: 'ABJ', name: 'Félix-Houphouët-Boigny International', city: 'Abidjan', country: "Côte d'Ivoire", region: 'Africa', timezone: 'GMT', lat: 5.2614, lng: -3.9263, type: 'international', popularity: 5 },
  { code: 'DKR', name: 'Blaise Diagne International', city: 'Dakar', country: 'Senegal', region: 'Africa', timezone: 'GMT', lat: 14.6700, lng: -17.0733, type: 'international', popularity: 6 },
  { code: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'Algeria', region: 'Africa', timezone: 'CET', lat: 36.6910, lng: 3.2154, type: 'international', popularity: 6 },
  { code: 'TUN', name: 'Tunis-Carthage International', city: 'Tunis', country: 'Tunisia', region: 'Africa', timezone: 'CET', lat: 36.8510, lng: 10.2272, type: 'international', popularity: 6 },
  { code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech', country: 'Morocco', region: 'Africa', timezone: 'WET', lat: 31.6069, lng: -8.0363, type: 'international', popularity: 7 },
  { code: 'SSH', name: 'Sharm el-Sheikh International', city: 'Sharm el-Sheikh', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 27.9773, lng: 34.3950, type: 'international', popularity: 7 },
  { code: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 27.1783, lng: 33.7994, type: 'international', popularity: 7 },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam International', city: 'Mauritius', country: 'Mauritius', region: 'Africa', timezone: 'MUT', lat: -20.4302, lng: 57.6836, type: 'international', popularity: 7 },
  { code: 'SEZ', name: 'Seychelles International', city: 'Mahé', country: 'Seychelles', region: 'Africa', timezone: 'SCT', lat: -4.6743, lng: 55.5218, type: 'international', popularity: 7 },

  // Additional Middle East
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', region: 'Middle East', timezone: 'EET', lat: 30.1219, lng: 31.4056, type: 'international', popularity: 8 },
  { code: 'BGW', name: 'Baghdad International', city: 'Baghdad', country: 'Iraq', region: 'Middle East', timezone: 'AST', lat: 33.2625, lng: 44.2346, type: 'international', popularity: 5 },
  { code: 'IKA', name: 'Imam Khomeini International', city: 'Tehran', country: 'Iran', region: 'Middle East', timezone: 'IRST', lat: 35.4161, lng: 51.1522, type: 'international', popularity: 6 },
  { code: 'DMM', name: 'King Fahd International', city: 'Dammam', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST', lat: 26.4712, lng: 49.7979, type: 'international', popularity: 7 },
  { code: 'SHJ', name: 'Sharjah International', city: 'Sharjah', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 25.3286, lng: 55.5172, type: 'international', popularity: 6 },
  { code: 'DWC', name: 'Al Maktoum International', city: 'Dubai', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 24.8966, lng: 55.1614, type: 'international', popularity: 7 },
  { code: 'LCA', name: 'Larnaca International', city: 'Larnaca', country: 'Cyprus', region: 'Middle East', timezone: 'EET', lat: 34.8754, lng: 33.6249, type: 'international', popularity: 7 },

  // Additional Asia-Pacific & Oceania
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide', country: 'Australia', region: 'Oceania', timezone: 'ACST', lat: -34.9450, lng: 138.5306, type: 'international', popularity: 6 },
  { code: 'CNS', name: 'Cairns Airport', city: 'Cairns', country: 'Australia', region: 'Oceania', timezone: 'AEST', lat: -16.8858, lng: 145.7552, type: 'international', popularity: 7 },
  { code: 'OOL', name: 'Gold Coast Airport', city: 'Gold Coast', country: 'Australia', region: 'Oceania', timezone: 'AEST', lat: -28.1644, lng: 153.5047, type: 'international', popularity: 6 },
  { code: 'WLG', name: 'Wellington International', city: 'Wellington', country: 'New Zealand', region: 'Oceania', timezone: 'NZST', lat: -41.3272, lng: 174.8052, type: 'international', popularity: 6 },
  { code: 'ZQN', name: 'Queenstown Airport', city: 'Queenstown', country: 'New Zealand', region: 'Oceania', timezone: 'NZST', lat: -45.0211, lng: 168.7392, type: 'international', popularity: 7 },
  { code: 'PPT', name: "Fa'a'ā International", city: 'Papeete', country: 'French Polynesia', region: 'Oceania', timezone: 'TAHT', lat: -17.5537, lng: -149.6069, type: 'international', popularity: 6 },
  { code: 'GUM', name: 'Antonio B. Won Pat International', city: 'Guam', country: 'Guam', region: 'Oceania', timezone: 'ChST', lat: 13.4834, lng: 144.7959, type: 'international', popularity: 6 },
  { code: 'CEB', name: 'Mactan-Cebu International', city: 'Cebu', country: 'Philippines', region: 'Asia', timezone: 'PHT', lat: 10.3076, lng: 123.9792, type: 'international', popularity: 7 },
  { code: 'PEN', name: 'Penang International', city: 'Penang', country: 'Malaysia', region: 'Asia', timezone: 'MYT', lat: 5.2971, lng: 100.2767, type: 'international', popularity: 6 },
  { code: 'LGK', name: 'Langkawi International', city: 'Langkawi', country: 'Malaysia', region: 'Asia', timezone: 'MYT', lat: 6.3297, lng: 99.7287, type: 'international', popularity: 6 },
  { code: 'HKT', name: 'Phuket International', city: 'Phuket', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 8.1132, lng: 98.3169, type: 'international', popularity: 9 },
  { code: 'CNX', name: 'Chiang Mai International', city: 'Chiang Mai', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 18.7668, lng: 98.9627, type: 'international', popularity: 7 },
  { code: 'USM', name: 'Samui Airport', city: 'Koh Samui', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 9.5478, lng: 100.0623, type: 'international', popularity: 6 },
  { code: 'KBV', name: 'Krabi International', city: 'Krabi', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 8.0986, lng: 98.9862, type: 'international', popularity: 6 },
  { code: 'VTE', name: 'Wattay International', city: 'Vientiane', country: 'Laos', region: 'Asia', timezone: 'ICT', lat: 17.9883, lng: 102.5633, type: 'international', popularity: 5 },
  { code: 'UBP', name: 'Ubon Ratchathani Airport', city: 'Ubon Ratchathani', country: 'Thailand', region: 'Asia', timezone: 'ICT', lat: 15.2513, lng: 104.8703, type: 'domestic', popularity: 4 },
  { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India', region: 'Asia', timezone: 'IST', lat: 10.1520, lng: 76.4019, type: 'international', popularity: 7 },
  { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India', region: 'Asia', timezone: 'IST', lat: 15.3808, lng: 73.8314, type: 'international', popularity: 7 },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India', region: 'Asia', timezone: 'IST', lat: 23.0772, lng: 72.6347, type: 'international', popularity: 6 },
  { code: 'PNQ', name: 'Pune International', city: 'Pune', country: 'India', region: 'Asia', timezone: 'IST', lat: 18.5822, lng: 73.9197, type: 'international', popularity: 6 },
  { code: 'JAI', name: 'Jaipur International', city: 'Jaipur', country: 'India', region: 'Asia', timezone: 'IST', lat: 26.8242, lng: 75.8122, type: 'international', popularity: 6 },
  { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan', region: 'Asia', timezone: 'PKT', lat: 33.5605, lng: 72.8526, type: 'international', popularity: 6 },
  { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan', region: 'Asia', timezone: 'PKT', lat: 24.9065, lng: 67.1609, type: 'international', popularity: 7 },
  { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan', region: 'Asia', timezone: 'PKT', lat: 31.5216, lng: 74.4036, type: 'international', popularity: 6 },
  { code: 'DAC', name: 'Hazrat Shahjalal International', city: 'Dhaka', country: 'Bangladesh', region: 'Asia', timezone: 'BST', lat: 23.8433, lng: 90.3978, type: 'international', popularity: 7 },
  { code: 'ULN', name: 'Chinggis Khaan International', city: 'Ulaanbaatar', country: 'Mongolia', region: 'Asia', timezone: 'ULAT', lat: 47.8431, lng: 106.7666, type: 'international', popularity: 5 },
  { code: 'TSA', name: 'Taipei Songshan', city: 'Taipei', country: 'Taiwan', region: 'Asia', timezone: 'CST', lat: 25.0694, lng: 121.5525, type: 'domestic', popularity: 7 },
  { code: 'KHH', name: 'Kaohsiung International', city: 'Kaohsiung', country: 'Taiwan', region: 'Asia', timezone: 'CST', lat: 22.5771, lng: 120.3500, type: 'international', popularity: 6 },
  { code: 'MFM', name: 'Macau International', city: 'Macau', country: 'Macau', region: 'Asia', timezone: 'CST', lat: 22.1496, lng: 113.5914, type: 'international', popularity: 7 },
  { code: 'SHA', name: 'Shanghai Hongqiao International', city: 'Shanghai', country: 'China', region: 'Asia', timezone: 'CST', lat: 31.1979, lng: 121.3363, type: 'international', popularity: 9 },
  { code: 'WUH', name: 'Wuhan Tianhe International', city: 'Wuhan', country: 'China', region: 'Asia', timezone: 'CST', lat: 30.7838, lng: 114.2081, type: 'international', popularity: 7 },
  { code: 'XIY', name: "Xi'an Xianyang International", city: "Xi'an", country: 'China', region: 'Asia', timezone: 'CST', lat: 34.4471, lng: 108.7516, type: 'international', popularity: 7 },
  { code: 'NKG', name: 'Nanjing Lukou International', city: 'Nanjing', country: 'China', region: 'Asia', timezone: 'CST', lat: 31.7420, lng: 118.8620, type: 'international', popularity: 7 },
  { code: 'CKG', name: 'Chongqing Jiangbei International', city: 'Chongqing', country: 'China', region: 'Asia', timezone: 'CST', lat: 29.7192, lng: 106.6417, type: 'international', popularity: 7 },
  { code: 'TAO', name: 'Qingdao Jiaodong International', city: 'Qingdao', country: 'China', region: 'Asia', timezone: 'CST', lat: 36.3661, lng: 120.0945, type: 'international', popularity: 6 },
  { code: 'DLC', name: 'Dalian Zhoushuizi International', city: 'Dalian', country: 'China', region: 'Asia', timezone: 'CST', lat: 38.9657, lng: 121.5386, type: 'international', popularity: 6 },

  // Additional Europe - Eastern & Nordic
  { code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg', country: 'Russia', region: 'Europe', timezone: 'MSK', lat: 59.8003, lng: 30.2625, type: 'international', popularity: 7 },
  { code: 'SVO', name: 'Sheremetyevo International', city: 'Moscow', country: 'Russia', region: 'Europe', timezone: 'MSK', lat: 55.9726, lng: 37.4146, type: 'international', popularity: 9 },
  { code: 'DME', name: 'Domodedovo International', city: 'Moscow', country: 'Russia', region: 'Europe', timezone: 'MSK', lat: 55.4088, lng: 37.9063, type: 'international', popularity: 8 },
  { code: 'KBP', name: 'Boryspil International', city: 'Kyiv', country: 'Ukraine', region: 'Europe', timezone: 'EET', lat: 50.3450, lng: 30.8947, type: 'international', popularity: 6 },
  { code: 'OTP', name: 'Henri Coandă International', city: 'Bucharest', country: 'Romania', region: 'Europe', timezone: 'EET', lat: 44.5711, lng: 26.0850, type: 'international', popularity: 6 },
  { code: 'SOF', name: 'Sofia Airport', city: 'Sofia', country: 'Bulgaria', region: 'Europe', timezone: 'EET', lat: 42.6952, lng: 23.4062, type: 'international', popularity: 6 },
  { code: 'BEG', name: 'Belgrade Nikola Tesla', city: 'Belgrade', country: 'Serbia', region: 'Europe', timezone: 'CET', lat: 44.8184, lng: 20.3091, type: 'international', popularity: 6 },
  { code: 'ZAG', name: 'Franjo Tuđman Airport', city: 'Zagreb', country: 'Croatia', region: 'Europe', timezone: 'CET', lat: 45.7429, lng: 16.0688, type: 'international', popularity: 6 },
  { code: 'DBV', name: 'Dubrovnik Airport', city: 'Dubrovnik', country: 'Croatia', region: 'Europe', timezone: 'CET', lat: 42.5614, lng: 18.2682, type: 'international', popularity: 7 },
  { code: 'SPU', name: 'Split Airport', city: 'Split', country: 'Croatia', region: 'Europe', timezone: 'CET', lat: 43.5389, lng: 16.2980, type: 'international', popularity: 6 },
  { code: 'LJU', name: 'Ljubljana Jože Pučnik', city: 'Ljubljana', country: 'Slovenia', region: 'Europe', timezone: 'CET', lat: 46.2237, lng: 14.4576, type: 'international', popularity: 5 },
  { code: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 40.5197, lng: 22.9709, type: 'international', popularity: 6 },
  { code: 'HER', name: 'Heraklion International', city: 'Heraklion', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 35.3397, lng: 25.1803, type: 'international', popularity: 7 },
  { code: 'RHO', name: 'Rhodes International', city: 'Rhodes', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 36.4054, lng: 28.0862, type: 'international', popularity: 6 },
  { code: 'JTR', name: 'Santorini Airport', city: 'Santorini', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 36.3992, lng: 25.4793, type: 'international', popularity: 7 },
  { code: 'MYK', name: 'Mykonos Airport', city: 'Mykonos', country: 'Greece', region: 'Europe', timezone: 'EET', lat: 37.4351, lng: 25.3481, type: 'international', popularity: 7 },
  { code: 'SAW', name: 'Sabiha Gökçen International', city: 'Istanbul', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 40.8986, lng: 29.3092, type: 'international', popularity: 8 },
  { code: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 36.8987, lng: 30.8005, type: 'international', popularity: 8 },
  { code: 'DLM', name: 'Dalaman Airport', city: 'Dalaman', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 36.7131, lng: 28.7925, type: 'international', popularity: 6 },
  { code: 'BJV', name: 'Milas-Bodrum Airport', city: 'Bodrum', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 37.2506, lng: 27.6643, type: 'international', popularity: 6 },
  { code: 'ADB', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Turkey', region: 'Europe', timezone: 'TRT', lat: 38.2924, lng: 27.1570, type: 'international', popularity: 6 },
  { code: 'BGY', name: 'Milan Bergamo Airport', city: 'Bergamo', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 45.6739, lng: 9.7042, type: 'international', popularity: 7 },
  { code: 'PSA', name: 'Pisa International', city: 'Pisa', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 43.6839, lng: 10.3927, type: 'international', popularity: 6 },
  { code: 'FLR', name: 'Florence Airport', city: 'Florence', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 43.8100, lng: 11.2051, type: 'international', popularity: 6 },
  { code: 'BLQ', name: 'Bologna Guglielmo Marconi', city: 'Bologna', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 44.5354, lng: 11.2887, type: 'international', popularity: 6 },
  { code: 'CTA', name: 'Catania Fontanarossa', city: 'Catania', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 37.4668, lng: 15.0664, type: 'international', popularity: 6 },
  { code: 'PMO', name: 'Palermo Falcone-Borsellino', city: 'Palermo', country: 'Italy', region: 'Europe', timezone: 'CET', lat: 38.1810, lng: 13.0999, type: 'international', popularity: 6 },
  { code: 'TFS', name: 'Tenerife South Airport', city: 'Tenerife', country: 'Spain', region: 'Europe', timezone: 'WET', lat: 28.0445, lng: -16.5725, type: 'international', popularity: 7 },
  { code: 'LPA', name: 'Gran Canaria Airport', city: 'Las Palmas', country: 'Spain', region: 'Europe', timezone: 'WET', lat: 27.9319, lng: -15.3866, type: 'international', popularity: 7 },
  { code: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 38.8729, lng: 1.3731, type: 'international', popularity: 7 },
  { code: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 39.4893, lng: -0.4816, type: 'international', popularity: 6 },
  { code: 'SVQ', name: 'Seville Airport', city: 'Seville', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 37.4180, lng: -5.8931, type: 'international', popularity: 6 },
  { code: 'BIO', name: 'Bilbao Airport', city: 'Bilbao', country: 'Spain', region: 'Europe', timezone: 'CET', lat: 43.3011, lng: -2.9106, type: 'international', popularity: 6 },
  { code: 'FNC', name: 'Madeira Airport', city: 'Funchal', country: 'Portugal', region: 'Europe', timezone: 'WET', lat: 32.6979, lng: -16.7745, type: 'international', popularity: 6 },
  { code: 'PDL', name: 'Ponta Delgada Airport', city: 'Ponta Delgada', country: 'Portugal', region: 'Europe', timezone: 'AZOT', lat: 37.7412, lng: -25.6979, type: 'international', popularity: 5 },
  { code: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal', region: 'Europe', timezone: 'WET', lat: 37.0144, lng: -7.9659, type: 'international', popularity: 7 },
  { code: 'KEF', name: 'Keflavík International', city: 'Reykjavik', country: 'Iceland', region: 'Europe', timezone: 'GMT', lat: 63.9850, lng: -22.6056, type: 'international', popularity: 8 },
  { code: 'TRD', name: 'Trondheim Airport', city: 'Trondheim', country: 'Norway', region: 'Europe', timezone: 'CET', lat: 63.4578, lng: 10.9240, type: 'international', popularity: 5 },
  { code: 'BGO', name: 'Bergen Airport', city: 'Bergen', country: 'Norway', region: 'Europe', timezone: 'CET', lat: 60.2934, lng: 5.2181, type: 'international', popularity: 6 },
  { code: 'GOT', name: 'Gothenburg Landvetter', city: 'Gothenburg', country: 'Sweden', region: 'Europe', timezone: 'CET', lat: 57.6628, lng: 12.2798, type: 'international', popularity: 6 },
  { code: 'AAL', name: 'Aalborg Airport', city: 'Aalborg', country: 'Denmark', region: 'Europe', timezone: 'CET', lat: 57.0928, lng: 9.8492, type: 'domestic', popularity: 4 },
  { code: 'RIX', name: 'Riga International', city: 'Riga', country: 'Latvia', region: 'Europe', timezone: 'EET', lat: 56.9236, lng: 23.9711, type: 'international', popularity: 6 },
  { code: 'VNO', name: 'Vilnius International', city: 'Vilnius', country: 'Lithuania', region: 'Europe', timezone: 'EET', lat: 54.6341, lng: 25.2858, type: 'international', popularity: 6 },
  { code: 'TLL', name: 'Tallinn Airport', city: 'Tallinn', country: 'Estonia', region: 'Europe', timezone: 'EET', lat: 59.4133, lng: 24.8328, type: 'international', popularity: 6 },
  { code: 'KRK', name: 'John Paul II International', city: 'Krakow', country: 'Poland', region: 'Europe', timezone: 'CET', lat: 50.0777, lng: 19.7848, type: 'international', popularity: 7 },
  { code: 'GDN', name: 'Gdańsk Lech Wałęsa', city: 'Gdańsk', country: 'Poland', region: 'Europe', timezone: 'CET', lat: 54.3776, lng: 18.4662, type: 'international', popularity: 6 },
  { code: 'WRO', name: 'Wrocław Nicolaus Copernicus', city: 'Wrocław', country: 'Poland', region: 'Europe', timezone: 'CET', lat: 51.1027, lng: 16.8858, type: 'international', popularity: 5 },
  { code: 'BTS', name: 'Bratislava Airport', city: 'Bratislava', country: 'Slovakia', region: 'Europe', timezone: 'CET', lat: 48.1702, lng: 17.2127, type: 'international', popularity: 5 },
  { code: 'LUX', name: 'Luxembourg Airport', city: 'Luxembourg', country: 'Luxembourg', region: 'Europe', timezone: 'CET', lat: 49.6233, lng: 6.2044, type: 'international', popularity: 6 },
  { code: 'SNN', name: 'Shannon Airport', city: 'Shannon', country: 'Ireland', region: 'Europe', timezone: 'GMT', lat: 52.7020, lng: -8.9248, type: 'international', popularity: 5 },
  { code: 'ORK', name: 'Cork Airport', city: 'Cork', country: 'Ireland', region: 'Europe', timezone: 'GMT', lat: 51.8413, lng: -8.4911, type: 'international', popularity: 5 },
  { code: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 55.8719, lng: -4.4331, type: 'international', popularity: 7 },
  { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 52.4539, lng: -1.7480, type: 'international', popularity: 6 },
  { code: 'BRS', name: 'Bristol Airport', city: 'Bristol', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.3827, lng: -2.7190, type: 'international', popularity: 6 },
  { code: 'LCY', name: 'London City Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 51.5053, lng: 0.0553, type: 'international', popularity: 7 },
  { code: 'NCL', name: 'Newcastle Airport', city: 'Newcastle', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 55.0375, lng: -1.6917, type: 'international', popularity: 5 },
  { code: 'BFS', name: 'Belfast International', city: 'Belfast', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 54.6575, lng: -6.2158, type: 'international', popularity: 6 },
  { code: 'JER', name: 'Jersey Airport', city: 'Jersey', country: 'United Kingdom', region: 'Europe', timezone: 'GMT', lat: 49.2080, lng: -2.1955, type: 'regional', popularity: 4 },
  { code: 'TLS', name: 'Toulouse-Blagnac', city: 'Toulouse', country: 'France', region: 'Europe', timezone: 'CET', lat: 43.6291, lng: 1.3638, type: 'international', popularity: 6 },
  { code: 'BOD', name: 'Bordeaux-Mérignac', city: 'Bordeaux', country: 'France', region: 'Europe', timezone: 'CET', lat: 44.8283, lng: -0.7156, type: 'international', popularity: 6 },
  { code: 'NTE', name: 'Nantes Atlantique', city: 'Nantes', country: 'France', region: 'Europe', timezone: 'CET', lat: 47.1532, lng: -1.6107, type: 'international', popularity: 5 },
  { code: 'STR', name: 'Stuttgart Airport', city: 'Stuttgart', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 48.6899, lng: 9.2220, type: 'international', popularity: 6 },
  { code: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 50.8659, lng: 7.1427, type: 'international', popularity: 7 },
  { code: 'HAJ', name: 'Hannover Airport', city: 'Hannover', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 52.4611, lng: 9.6850, type: 'international', popularity: 5 },
  { code: 'NUE', name: 'Nuremberg Airport', city: 'Nuremberg', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 49.4987, lng: 11.0669, type: 'international', popularity: 5 },
  { code: 'LEJ', name: 'Leipzig/Halle Airport', city: 'Leipzig', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 51.4324, lng: 12.2416, type: 'international', popularity: 5 },
  { code: 'DRS', name: 'Dresden Airport', city: 'Dresden', country: 'Germany', region: 'Europe', timezone: 'CET', lat: 51.1328, lng: 13.7672, type: 'international', popularity: 4 },
  { code: 'SZG', name: 'Salzburg Airport', city: 'Salzburg', country: 'Austria', region: 'Europe', timezone: 'CET', lat: 47.7933, lng: 13.0043, type: 'international', popularity: 6 },
  { code: 'INN', name: 'Innsbruck Airport', city: 'Innsbruck', country: 'Austria', region: 'Europe', timezone: 'CET', lat: 47.2602, lng: 11.3439, type: 'international', popularity: 5 },
  { code: 'EIN', name: 'Eindhoven Airport', city: 'Eindhoven', country: 'Netherlands', region: 'Europe', timezone: 'CET', lat: 51.4501, lng: 5.3745, type: 'international', popularity: 6 },
  { code: 'RTM', name: 'Rotterdam The Hague', city: 'Rotterdam', country: 'Netherlands', region: 'Europe', timezone: 'CET', lat: 51.9569, lng: 4.4372, type: 'international', popularity: 5 },
  { code: 'CRL', name: 'Brussels South Charleroi', city: 'Charleroi', country: 'Belgium', region: 'Europe', timezone: 'CET', lat: 50.4592, lng: 4.4538, type: 'international', popularity: 6 },
  { code: 'ANR', name: 'Antwerp International', city: 'Antwerp', country: 'Belgium', region: 'Europe', timezone: 'CET', lat: 51.1894, lng: 4.4603, type: 'regional', popularity: 4 },

  // Additional Caribbean & Central America
  { code: 'AUA', name: 'Queen Beatrix International', city: 'Oranjestad', country: 'Aruba', region: 'Caribbean', timezone: 'AST', lat: 12.5014, lng: -70.0152, type: 'international', popularity: 7 },
  { code: 'CUR', name: 'Curaçao International', city: 'Willemstad', country: 'Curaçao', region: 'Caribbean', timezone: 'AST', lat: 12.1889, lng: -68.9598, type: 'international', popularity: 6 },
  { code: 'SXM', name: 'Princess Juliana International', city: 'St. Maarten', country: 'Sint Maarten', region: 'Caribbean', timezone: 'AST', lat: 18.0410, lng: -63.1089, type: 'international', popularity: 7 },
  { code: 'POS', name: 'Piarco International', city: 'Port of Spain', country: 'Trinidad and Tobago', region: 'Caribbean', timezone: 'AST', lat: 10.5954, lng: -61.3372, type: 'international', popularity: 6 },
  { code: 'BGI', name: 'Grantley Adams International', city: 'Bridgetown', country: 'Barbados', region: 'Caribbean', timezone: 'AST', lat: 13.0746, lng: -59.4925, type: 'international', popularity: 7 },
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic', region: 'Caribbean', timezone: 'AST', lat: 18.5674, lng: -68.3634, type: 'international', popularity: 8 },
  { code: 'SDQ', name: 'Las Américas International', city: 'Santo Domingo', country: 'Dominican Republic', region: 'Caribbean', timezone: 'AST', lat: 18.4297, lng: -69.6689, type: 'international', popularity: 7 },
  { code: 'HAV', name: 'José Martí International', city: 'Havana', country: 'Cuba', region: 'Caribbean', timezone: 'CST', lat: 22.9892, lng: -82.4091, type: 'international', popularity: 7 },
  { code: 'VRA', name: 'Juan Gualberto Gómez', city: 'Varadero', country: 'Cuba', region: 'Caribbean', timezone: 'CST', lat: 23.0344, lng: -81.4353, type: 'international', popularity: 6 },
  { code: 'KIN', name: 'Norman Manley International', city: 'Kingston', country: 'Jamaica', region: 'Caribbean', timezone: 'EST', lat: 17.9356, lng: -76.7875, type: 'international', popularity: 6 },
  { code: 'GCM', name: 'Owen Roberts International', city: 'Grand Cayman', country: 'Cayman Islands', region: 'Caribbean', timezone: 'EST', lat: 19.2928, lng: -81.3577, type: 'international', popularity: 7 },
  { code: 'STT', name: 'Cyril E. King Airport', city: 'St. Thomas', country: 'US Virgin Islands', region: 'Caribbean', timezone: 'AST', lat: 18.3373, lng: -64.9733, type: 'international', popularity: 6 },
  { code: 'STX', name: 'Henry E. Rohlsen Airport', city: 'St. Croix', country: 'US Virgin Islands', region: 'Caribbean', timezone: 'AST', lat: 17.7019, lng: -64.7986, type: 'international', popularity: 5 },
  { code: 'EIS', name: 'Terrance B. Lettsome', city: 'Tortola', country: 'British Virgin Islands', region: 'Caribbean', timezone: 'AST', lat: 18.4448, lng: -64.5430, type: 'regional', popularity: 5 },
  { code: 'ANU', name: 'V.C. Bird International', city: 'St. Johns', country: 'Antigua and Barbuda', region: 'Caribbean', timezone: 'AST', lat: 17.1367, lng: -61.7926, type: 'international', popularity: 6 },
  { code: 'SLU', name: 'George F.L. Charles', city: 'Castries', country: 'Saint Lucia', region: 'Caribbean', timezone: 'AST', lat: 14.0202, lng: -60.9929, type: 'regional', popularity: 5 },
  { code: 'UVF', name: 'Hewanorra International', city: 'Vieux Fort', country: 'Saint Lucia', region: 'Caribbean', timezone: 'AST', lat: 13.7332, lng: -60.9526, type: 'international', popularity: 6 },
  { code: 'SVD', name: 'Argyle International', city: 'Kingstown', country: 'St. Vincent and the Grenadines', region: 'Caribbean', timezone: 'AST', lat: 13.1567, lng: -61.1500, type: 'international', popularity: 5 },
  { code: 'GND', name: 'Maurice Bishop International', city: 'St. Georges', country: 'Grenada', region: 'Caribbean', timezone: 'AST', lat: 12.0042, lng: -61.7862, type: 'international', popularity: 6 },
  { code: 'TAB', name: 'A.N.R. Robinson International', city: 'Tobago', country: 'Trinidad and Tobago', region: 'Caribbean', timezone: 'AST', lat: 11.1497, lng: -60.8322, type: 'international', popularity: 5 },
  { code: 'DOM', name: 'Douglas-Charles Airport', city: 'Dominica', country: 'Dominica', region: 'Caribbean', timezone: 'AST', lat: 15.5470, lng: -61.3000, type: 'international', popularity: 4 },
  { code: 'FDF', name: 'Martinique Aimé Césaire', city: 'Fort-de-France', country: 'Martinique', region: 'Caribbean', timezone: 'AST', lat: 14.5910, lng: -61.0032, type: 'international', popularity: 6 },
  { code: 'PTP', name: 'Pointe-à-Pitre Le Raizet', city: 'Pointe-à-Pitre', country: 'Guadeloupe', region: 'Caribbean', timezone: 'AST', lat: 16.2653, lng: -61.5318, type: 'international', popularity: 6 },
  { code: 'BDA', name: 'L.F. Wade International', city: 'Hamilton', country: 'Bermuda', region: 'Caribbean', timezone: 'AST', lat: 32.3640, lng: -64.6787, type: 'international', popularity: 6 },
  { code: 'TGU', name: 'Toncontín International', city: 'Tegucigalpa', country: 'Honduras', region: 'Central America', timezone: 'CST', lat: 14.0609, lng: -87.2172, type: 'international', popularity: 5 },
  { code: 'RTB', name: 'Juan Manuel Gálvez', city: 'Roatán', country: 'Honduras', region: 'Central America', timezone: 'CST', lat: 16.3168, lng: -86.5230, type: 'international', popularity: 6 },
  { code: 'SAL', name: 'Monseñor Óscar Arnulfo Romero', city: 'San Salvador', country: 'El Salvador', region: 'Central America', timezone: 'CST', lat: 13.4409, lng: -89.0557, type: 'international', popularity: 6 },
  { code: 'MGA', name: 'Augusto C. Sandino', city: 'Managua', country: 'Nicaragua', region: 'Central America', timezone: 'CST', lat: 12.1415, lng: -86.1682, type: 'international', popularity: 5 },
  { code: 'BZE', name: 'Philip S.W. Goldson', city: 'Belize City', country: 'Belize', region: 'Central America', timezone: 'CST', lat: 17.5391, lng: -88.3082, type: 'international', popularity: 6 },

  // Additional Pacific Islands
  { code: 'PPT', name: 'Faa\'a International', city: 'Papeete', country: 'French Polynesia', region: 'Oceania', timezone: 'TAHT', lat: -17.5537, lng: -149.6073, type: 'international', popularity: 7 },
  { code: 'BOB', name: 'Bora Bora Airport', city: 'Bora Bora', country: 'French Polynesia', region: 'Oceania', timezone: 'TAHT', lat: -16.4444, lng: -151.7516, type: 'regional', popularity: 7 },
  { code: 'RAR', name: 'Rarotonga International', city: 'Rarotonga', country: 'Cook Islands', region: 'Oceania', timezone: 'CKT', lat: -21.2027, lng: -159.8066, type: 'international', popularity: 6 },
  { code: 'APW', name: 'Faleolo International', city: 'Apia', country: 'Samoa', region: 'Oceania', timezone: 'WST', lat: -13.8297, lng: -172.0080, type: 'international', popularity: 5 },
  { code: 'TBU', name: 'Fuaʻamotu International', city: 'Nukuʻalofa', country: 'Tonga', region: 'Oceania', timezone: 'TOT', lat: -21.2412, lng: -175.1497, type: 'international', popularity: 5 },
  { code: 'VLI', name: 'Bauerfield International', city: 'Port Vila', country: 'Vanuatu', region: 'Oceania', timezone: 'VUT', lat: -17.6993, lng: 168.3199, type: 'international', popularity: 5 },
  { code: 'NOU', name: 'La Tontouta International', city: 'Nouméa', country: 'New Caledonia', region: 'Oceania', timezone: 'NCT', lat: -22.0146, lng: 166.2129, type: 'international', popularity: 6 },
  { code: 'SUV', name: 'Nausori International', city: 'Suva', country: 'Fiji', region: 'Oceania', timezone: 'FJT', lat: -18.0433, lng: 178.5592, type: 'international', popularity: 5 },
  { code: 'HNL', name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'USA', region: 'Oceania', timezone: 'HST', lat: 21.3187, lng: -157.9225, type: 'international', popularity: 9 },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA', region: 'Oceania', timezone: 'HST', lat: 20.8986, lng: -156.4305, type: 'international', popularity: 8 },
  { code: 'KOA', name: 'Ellison Onizuka Kona', city: 'Kona', country: 'USA', region: 'Oceania', timezone: 'HST', lat: 19.7388, lng: -156.0456, type: 'international', popularity: 7 },
  { code: 'LIH', name: 'Lihue Airport', city: 'Kauai', country: 'USA', region: 'Oceania', timezone: 'HST', lat: 21.9760, lng: -159.3390, type: 'international', popularity: 7 },
  { code: 'GUM', name: 'Antonio B. Won Pat International', city: 'Guam', country: 'Guam', region: 'Oceania', timezone: 'ChST', lat: 13.4834, lng: 144.7959, type: 'international', popularity: 7 },
  { code: 'SPN', name: 'Francisco C. Ada/Saipan', city: 'Saipan', country: 'Northern Mariana Islands', region: 'Oceania', timezone: 'ChST', lat: 15.1190, lng: 145.7294, type: 'international', popularity: 5 },
  { code: 'POM', name: 'Jacksons International', city: 'Port Moresby', country: 'Papua New Guinea', region: 'Oceania', timezone: 'PGT', lat: -9.4434, lng: 147.2200, type: 'international', popularity: 5 },

  // Additional Africa
  { code: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 27.1783, lng: 33.7994, type: 'international', popularity: 7 },
  { code: 'SSH', name: 'Sharm El Sheikh International', city: 'Sharm El Sheikh', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 27.9773, lng: 34.3950, type: 'international', popularity: 7 },
  { code: 'LXR', name: 'Luxor International', city: 'Luxor', country: 'Egypt', region: 'Africa', timezone: 'EET', lat: 25.6710, lng: 32.7066, type: 'international', popularity: 6 },
  { code: 'TUN', name: 'Tunis-Carthage International', city: 'Tunis', country: 'Tunisia', region: 'Africa', timezone: 'CET', lat: 36.8510, lng: 10.2272, type: 'international', popularity: 7 },
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria', region: 'Africa', timezone: 'CET', lat: 36.6910, lng: 3.2155, type: 'international', popularity: 6 },
  { code: 'AGP', name: 'Abidjan Felix Houphouet-Boigny', city: 'Abidjan', country: 'Ivory Coast', region: 'Africa', timezone: 'GMT', lat: 5.2614, lng: -3.9262, type: 'international', popularity: 6 },
  { code: 'DKR', name: 'Blaise Diagne International', city: 'Dakar', country: 'Senegal', region: 'Africa', timezone: 'GMT', lat: 14.6708, lng: -17.0733, type: 'international', popularity: 7 },
  { code: 'MBA', name: 'Moi International', city: 'Mombasa', country: 'Kenya', region: 'Africa', timezone: 'EAT', lat: -4.0348, lng: 39.5942, type: 'international', popularity: 6 },
  { code: 'DAR', name: 'Julius Nyerere International', city: 'Dar es Salaam', country: 'Tanzania', region: 'Africa', timezone: 'EAT', lat: -6.8781, lng: 39.2026, type: 'international', popularity: 6 },
  { code: 'JRO', name: 'Kilimanjaro International', city: 'Kilimanjaro', country: 'Tanzania', region: 'Africa', timezone: 'EAT', lat: -3.4294, lng: 37.0745, type: 'international', popularity: 7 },
  { code: 'ZNZ', name: 'Abeid Amani Karume', city: 'Zanzibar', country: 'Tanzania', region: 'Africa', timezone: 'EAT', lat: -6.2220, lng: 39.2249, type: 'international', popularity: 7 },
  { code: 'EBB', name: 'Entebbe International', city: 'Entebbe', country: 'Uganda', region: 'Africa', timezone: 'EAT', lat: 0.0424, lng: 32.4435, type: 'international', popularity: 6 },
  { code: 'KGL', name: 'Kigali International', city: 'Kigali', country: 'Rwanda', region: 'Africa', timezone: 'CAT', lat: -1.9686, lng: 30.1395, type: 'international', popularity: 6 },
  { code: 'SEZ', name: 'Seychelles International', city: 'Mahé', country: 'Seychelles', region: 'Africa', timezone: 'SCT', lat: -4.6743, lng: 55.5218, type: 'international', popularity: 7 },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam', city: 'Port Louis', country: 'Mauritius', region: 'Africa', timezone: 'MUT', lat: -20.4302, lng: 57.6836, type: 'international', popularity: 7 },
  { code: 'RUN', name: 'Roland Garros Airport', city: 'Saint-Denis', country: 'Réunion', region: 'Africa', timezone: 'RET', lat: -20.8871, lng: 55.5103, type: 'international', popularity: 5 },
  { code: 'TNR', name: 'Ivato International', city: 'Antananarivo', country: 'Madagascar', region: 'Africa', timezone: 'EAT', lat: -18.7969, lng: 47.4788, type: 'international', popularity: 5 },
  { code: 'WDH', name: 'Hosea Kutako International', city: 'Windhoek', country: 'Namibia', region: 'Africa', timezone: 'CAT', lat: -22.4799, lng: 17.4709, type: 'international', popularity: 6 },
  { code: 'VFA', name: 'Victoria Falls Airport', city: 'Victoria Falls', country: 'Zimbabwe', region: 'Africa', timezone: 'CAT', lat: -18.0959, lng: 25.8390, type: 'international', popularity: 7 },
  { code: 'HRE', name: 'Robert Gabriel Mugabe', city: 'Harare', country: 'Zimbabwe', region: 'Africa', timezone: 'CAT', lat: -17.9318, lng: 31.0928, type: 'international', popularity: 5 },
  { code: 'LUN', name: 'Kenneth Kaunda International', city: 'Lusaka', country: 'Zambia', region: 'Africa', timezone: 'CAT', lat: -15.3308, lng: 28.4526, type: 'international', popularity: 5 },
  { code: 'GBE', name: 'Sir Seretse Khama', city: 'Gaborone', country: 'Botswana', region: 'Africa', timezone: 'CAT', lat: -24.5552, lng: 25.9182, type: 'international', popularity: 5 },
  { code: 'MQP', name: 'Kruger Mpumalanga International', city: 'Nelspruit', country: 'South Africa', region: 'Africa', timezone: 'SAST', lat: -25.3832, lng: 31.1056, type: 'international', popularity: 6 },
  { code: 'DUR', name: 'King Shaka International', city: 'Durban', country: 'South Africa', region: 'Africa', timezone: 'SAST', lat: -29.6144, lng: 31.1197, type: 'international', popularity: 7 },

  // Additional USA Regional
  { code: 'MSP', name: 'Minneapolis-Saint Paul', city: 'Minneapolis', country: 'USA', region: 'North America', timezone: 'CST', lat: 44.8848, lng: -93.2223, type: 'international', popularity: 8 },
  { code: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA', region: 'North America', timezone: 'EST', lat: 42.2125, lng: -83.3534, type: 'international', popularity: 8 },
  { code: 'CLT', name: 'Charlotte Douglas', city: 'Charlotte', country: 'USA', region: 'North America', timezone: 'EST', lat: 35.2140, lng: -80.9431, type: 'international', popularity: 8 },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', region: 'North America', timezone: 'EST', lat: 28.4294, lng: -81.3089, type: 'international', popularity: 9 },
  { code: 'TPA', name: 'Tampa International', city: 'Tampa', country: 'USA', region: 'North America', timezone: 'EST', lat: 27.9756, lng: -82.5333, type: 'international', popularity: 7 },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale', country: 'USA', region: 'North America', timezone: 'EST', lat: 26.0726, lng: -80.1527, type: 'international', popularity: 8 },
  { code: 'PHL', name: 'Philadelphia International', city: 'Philadelphia', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.8744, lng: -75.2424, type: 'international', popularity: 8 },
  { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.1754, lng: -76.6684, type: 'international', popularity: 7 },
  { code: 'DCA', name: 'Ronald Reagan Washington', city: 'Washington D.C.', country: 'USA', region: 'North America', timezone: 'EST', lat: 38.8521, lng: -77.0377, type: 'international', popularity: 8 },
  { code: 'IAD', name: 'Washington Dulles', city: 'Washington D.C.', country: 'USA', region: 'North America', timezone: 'EST', lat: 38.9531, lng: -77.4565, type: 'international', popularity: 8 },
  { code: 'SLC', name: 'Salt Lake City International', city: 'Salt Lake City', country: 'USA', region: 'North America', timezone: 'MST', lat: 40.7899, lng: -111.9791, type: 'international', popularity: 7 },
  { code: 'PDX', name: 'Portland International', city: 'Portland', country: 'USA', region: 'North America', timezone: 'PST', lat: 45.5898, lng: -122.5951, type: 'international', popularity: 7 },
  { code: 'SAN', name: 'San Diego International', city: 'San Diego', country: 'USA', region: 'North America', timezone: 'PST', lat: 32.7336, lng: -117.1897, type: 'international', popularity: 7 },
  { code: 'SJC', name: 'San Jose International', city: 'San Jose', country: 'USA', region: 'North America', timezone: 'PST', lat: 37.3626, lng: -121.9291, type: 'international', popularity: 7 },
  { code: 'OAK', name: 'Oakland International', city: 'Oakland', country: 'USA', region: 'North America', timezone: 'PST', lat: 37.7126, lng: -122.2197, type: 'international', popularity: 6 },
  { code: 'SMF', name: 'Sacramento International', city: 'Sacramento', country: 'USA', region: 'North America', timezone: 'PST', lat: 38.6954, lng: -121.5908, type: 'international', popularity: 6 },
  { code: 'AUS', name: 'Austin-Bergstrom', city: 'Austin', country: 'USA', region: 'North America', timezone: 'CST', lat: 30.1945, lng: -97.6699, type: 'international', popularity: 7 },
  { code: 'SAT', name: 'San Antonio International', city: 'San Antonio', country: 'USA', region: 'North America', timezone: 'CST', lat: 29.5337, lng: -98.4698, type: 'international', popularity: 6 },
  { code: 'HOU', name: 'William P. Hobby', city: 'Houston', country: 'USA', region: 'North America', timezone: 'CST', lat: 29.6454, lng: -95.2789, type: 'international', popularity: 7 },
  { code: 'MSY', name: 'Louis Armstrong New Orleans', city: 'New Orleans', country: 'USA', region: 'North America', timezone: 'CST', lat: 29.9934, lng: -90.2580, type: 'international', popularity: 7 },
  { code: 'RDU', name: 'Raleigh-Durham International', city: 'Raleigh', country: 'USA', region: 'North America', timezone: 'EST', lat: 35.8776, lng: -78.7875, type: 'international', popularity: 6 },
  { code: 'BNA', name: 'Nashville International', city: 'Nashville', country: 'USA', region: 'North America', timezone: 'CST', lat: 36.1246, lng: -86.6782, type: 'international', popularity: 7 },
  { code: 'MCI', name: 'Kansas City International', city: 'Kansas City', country: 'USA', region: 'North America', timezone: 'CST', lat: 39.2976, lng: -94.7139, type: 'international', popularity: 6 },
  { code: 'STL', name: 'St. Louis Lambert', city: 'St. Louis', country: 'USA', region: 'North America', timezone: 'CST', lat: 38.7487, lng: -90.3700, type: 'international', popularity: 6 },
  { code: 'CLE', name: 'Cleveland Hopkins', city: 'Cleveland', country: 'USA', region: 'North America', timezone: 'EST', lat: 41.4117, lng: -81.8498, type: 'international', popularity: 6 },
  { code: 'PIT', name: 'Pittsburgh International', city: 'Pittsburgh', country: 'USA', region: 'North America', timezone: 'EST', lat: 40.4915, lng: -80.2329, type: 'international', popularity: 6 },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky', city: 'Cincinnati', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.0488, lng: -84.6678, type: 'international', popularity: 6 },
  { code: 'IND', name: 'Indianapolis International', city: 'Indianapolis', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.7173, lng: -86.2944, type: 'international', popularity: 6 },
  { code: 'CMH', name: 'John Glenn Columbus', city: 'Columbus', country: 'USA', region: 'North America', timezone: 'EST', lat: 39.9980, lng: -82.8919, type: 'international', popularity: 6 },
  { code: 'JAX', name: 'Jacksonville International', city: 'Jacksonville', country: 'USA', region: 'North America', timezone: 'EST', lat: 30.4941, lng: -81.6879, type: 'international', popularity: 6 },
  { code: 'RSW', name: 'Southwest Florida', city: 'Fort Myers', country: 'USA', region: 'North America', timezone: 'EST', lat: 26.5362, lng: -81.7552, type: 'international', popularity: 6 },
  { code: 'PBI', name: 'Palm Beach International', city: 'West Palm Beach', country: 'USA', region: 'North America', timezone: 'EST', lat: 26.6832, lng: -80.0956, type: 'international', popularity: 6 },
  { code: 'ABQ', name: 'Albuquerque International', city: 'Albuquerque', country: 'USA', region: 'North America', timezone: 'MST', lat: 35.0402, lng: -106.6095, type: 'international', popularity: 5 },
  { code: 'TUS', name: 'Tucson International', city: 'Tucson', country: 'USA', region: 'North America', timezone: 'MST', lat: 32.1161, lng: -110.9410, type: 'international', popularity: 5 },
  { code: 'ANC', name: 'Ted Stevens Anchorage', city: 'Anchorage', country: 'USA', region: 'North America', timezone: 'AKST', lat: 61.1743, lng: -149.9962, type: 'international', popularity: 7 },
  { code: 'FAI', name: 'Fairbanks International', city: 'Fairbanks', country: 'USA', region: 'North America', timezone: 'AKST', lat: 64.8151, lng: -147.8561, type: 'international', popularity: 5 },

  // Additional Canada
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier', city: 'Ottawa', country: 'Canada', region: 'North America', timezone: 'EST', lat: 45.3225, lng: -75.6692, type: 'international', popularity: 6 },
  { code: 'YHZ', name: 'Halifax Stanfield International', city: 'Halifax', country: 'Canada', region: 'North America', timezone: 'AST', lat: 44.8808, lng: -63.5086, type: 'international', popularity: 6 },
  { code: 'YWG', name: 'Winnipeg James Armstrong', city: 'Winnipeg', country: 'Canada', region: 'North America', timezone: 'CST', lat: 49.9100, lng: -97.2399, type: 'international', popularity: 5 },
  { code: 'YQB', name: 'Québec City Jean Lesage', city: 'Quebec City', country: 'Canada', region: 'North America', timezone: 'EST', lat: 46.7912, lng: -71.3933, type: 'international', popularity: 6 },
  { code: 'YYJ', name: 'Victoria International', city: 'Victoria', country: 'Canada', region: 'North America', timezone: 'PST', lat: 48.6469, lng: -123.4258, type: 'international', popularity: 5 },
  { code: 'YXE', name: 'Saskatoon John G. Diefenbaker', city: 'Saskatoon', country: 'Canada', region: 'North America', timezone: 'CST', lat: 52.1708, lng: -106.6997, type: 'international', popularity: 4 },
  { code: 'YQR', name: 'Regina International', city: 'Regina', country: 'Canada', region: 'North America', timezone: 'CST', lat: 50.4319, lng: -104.6656, type: 'international', popularity: 4 },
  { code: 'YYT', name: 'St. Johns International', city: 'St. Johns', country: 'Canada', region: 'North America', timezone: 'NST', lat: 47.6186, lng: -52.7519, type: 'international', popularity: 5 },
  { code: 'YKA', name: 'Kamloops Airport', city: 'Kamloops', country: 'Canada', region: 'North America', timezone: 'PST', lat: 50.7022, lng: -120.4444, type: 'domestic', popularity: 3 },
  { code: 'YLW', name: 'Kelowna International', city: 'Kelowna', country: 'Canada', region: 'North America', timezone: 'PST', lat: 49.9561, lng: -119.3778, type: 'international', popularity: 5 },

  // Additional South America
  { code: 'UIO', name: 'Mariscal Sucre International', city: 'Quito', country: 'Ecuador', region: 'South America', timezone: 'ECT', lat: -0.1292, lng: -78.3575, type: 'international', popularity: 7 },
  { code: 'GYE', name: 'José Joaquín de Olmedo', city: 'Guayaquil', country: 'Ecuador', region: 'South America', timezone: 'ECT', lat: -2.1574, lng: -79.8837, type: 'international', popularity: 6 },
  { code: 'GPS', name: 'Seymour Airport', city: 'Galápagos', country: 'Ecuador', region: 'South America', timezone: 'GALT', lat: -0.4537, lng: -90.2659, type: 'international', popularity: 7 },
  { code: 'CCS', name: 'Simón Bolívar International', city: 'Caracas', country: 'Venezuela', region: 'South America', timezone: 'VET', lat: 10.6012, lng: -66.9912, type: 'international', popularity: 5 },
  { code: 'BSB', name: 'Presidente Juscelino Kubitschek', city: 'Brasília', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -15.8711, lng: -47.9186, type: 'international', popularity: 7 },
  { code: 'CNF', name: 'Tancredo Neves International', city: 'Belo Horizonte', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -19.6244, lng: -43.9719, type: 'international', popularity: 6 },
  { code: 'POA', name: 'Salgado Filho International', city: 'Porto Alegre', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -29.9944, lng: -51.1714, type: 'international', popularity: 6 },
  { code: 'REC', name: 'Recife/Guararapes', city: 'Recife', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -8.1265, lng: -34.9236, type: 'international', popularity: 6 },
  { code: 'SSA', name: 'Deputado Luís Eduardo Magalhães', city: 'Salvador', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -12.9086, lng: -38.3225, type: 'international', popularity: 6 },
  { code: 'FOR', name: 'Pinto Martins International', city: 'Fortaleza', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -3.7763, lng: -38.5326, type: 'international', popularity: 6 },
  { code: 'FLN', name: 'Hercílio Luz International', city: 'Florianópolis', country: 'Brazil', region: 'South America', timezone: 'BRT', lat: -27.6703, lng: -48.5525, type: 'international', popularity: 5 },
  { code: 'AEP', name: 'Jorge Newbery Airpark', city: 'Buenos Aires', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -34.5592, lng: -58.4156, type: 'domestic', popularity: 7 },
  { code: 'COR', name: 'Ingeniero Aeronáutico Taravella', city: 'Córdoba', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -31.3236, lng: -64.2081, type: 'international', popularity: 5 },
  { code: 'MDZ', name: 'Gobernador Francisco Gabrielli', city: 'Mendoza', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -32.8317, lng: -68.7929, type: 'international', popularity: 5 },
  { code: 'BRC', name: 'San Carlos de Bariloche', city: 'Bariloche', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -41.1512, lng: -71.1575, type: 'international', popularity: 6 },
  { code: 'USH', name: 'Malvinas Argentinas', city: 'Ushuaia', country: 'Argentina', region: 'South America', timezone: 'ART', lat: -54.8433, lng: -68.2958, type: 'international', popularity: 6 },
  { code: 'ASU', name: 'Silvio Pettirossi International', city: 'Asunción', country: 'Paraguay', region: 'South America', timezone: 'PYT', lat: -25.2400, lng: -57.5200, type: 'international', popularity: 5 },
  { code: 'VVI', name: 'Viru Viru International', city: 'Santa Cruz', country: 'Bolivia', region: 'South America', timezone: 'BOT', lat: -17.6448, lng: -63.1354, type: 'international', popularity: 5 },
  { code: 'LPB', name: 'El Alto International', city: 'La Paz', country: 'Bolivia', region: 'South America', timezone: 'BOT', lat: -16.5133, lng: -68.1923, type: 'international', popularity: 5 },

  // Additional Central Asia & Caucasus
  { code: 'TBS', name: 'Tbilisi International', city: 'Tbilisi', country: 'Georgia', region: 'Asia', timezone: 'GET', lat: 41.6692, lng: 44.9547, type: 'international', popularity: 6 },
  { code: 'GYD', name: 'Heydar Aliyev International', city: 'Baku', country: 'Azerbaijan', region: 'Asia', timezone: 'AZT', lat: 40.4675, lng: 50.0467, type: 'international', popularity: 6 },
  { code: 'EVN', name: 'Zvartnots International', city: 'Yerevan', country: 'Armenia', region: 'Asia', timezone: 'AMT', lat: 40.1473, lng: 44.3959, type: 'international', popularity: 5 },
  { code: 'ALA', name: 'Almaty International', city: 'Almaty', country: 'Kazakhstan', region: 'Asia', timezone: 'ALMT', lat: 43.3521, lng: 77.0405, type: 'international', popularity: 6 },
  { code: 'NQZ', name: 'Nursultan Nazarbayev', city: 'Astana', country: 'Kazakhstan', region: 'Asia', timezone: 'ALMT', lat: 51.0222, lng: 71.4669, type: 'international', popularity: 5 },
  { code: 'TAS', name: 'Tashkent International', city: 'Tashkent', country: 'Uzbekistan', region: 'Asia', timezone: 'UZT', lat: 41.2579, lng: 69.2813, type: 'international', popularity: 5 },
  { code: 'SKD', name: 'Samarkand International', city: 'Samarkand', country: 'Uzbekistan', region: 'Asia', timezone: 'UZT', lat: 39.7005, lng: 66.9838, type: 'international', popularity: 4 },
  { code: 'FRU', name: 'Manas International', city: 'Bishkek', country: 'Kyrgyzstan', region: 'Asia', timezone: 'KGT', lat: 43.0613, lng: 74.4776, type: 'international', popularity: 4 },
  { code: 'DYU', name: 'Dushanbe International', city: 'Dushanbe', country: 'Tajikistan', region: 'Asia', timezone: 'TJT', lat: 38.5433, lng: 68.8250, type: 'international', popularity: 3 },
  { code: 'ASB', name: 'Ashgabat International', city: 'Ashgabat', country: 'Turkmenistan', region: 'Asia', timezone: 'TMT', lat: 37.9868, lng: 58.3610, type: 'international', popularity: 3 },

  // Additional Middle East
  { code: 'BEY', name: 'Beirut–Rafic Hariri', city: 'Beirut', country: 'Lebanon', region: 'Middle East', timezone: 'EET', lat: 33.8209, lng: 35.4884, type: 'international', popularity: 6 },
  { code: 'DMM', name: 'King Fahd International', city: 'Dammam', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST', lat: 26.4712, lng: 49.7979, type: 'international', popularity: 6 },
  { code: 'MED', name: 'Prince Mohammad bin Abdulaziz', city: 'Medina', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST', lat: 24.5534, lng: 39.7051, type: 'international', popularity: 7 },
  { code: 'SHJ', name: 'Sharjah International', city: 'Sharjah', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 25.3286, lng: 55.5172, type: 'international', popularity: 5 },
  { code: 'DWC', name: 'Al Maktoum International', city: 'Dubai', country: 'UAE', region: 'Middle East', timezone: 'GST', lat: 24.8962, lng: 55.1614, type: 'international', popularity: 6 },
  { code: 'BGW', name: 'Baghdad International', city: 'Baghdad', country: 'Iraq', region: 'Middle East', timezone: 'AST', lat: 33.2625, lng: 44.2346, type: 'international', popularity: 4 },
  { code: 'IKA', name: 'Imam Khomeini International', city: 'Tehran', country: 'Iran', region: 'Middle East', timezone: 'IRST', lat: 35.4161, lng: 51.1522, type: 'international', popularity: 6 },
  { code: 'SLL', name: 'Salalah Airport', city: 'Salalah', country: 'Oman', region: 'Middle East', timezone: 'GST', lat: 17.0387, lng: 54.0914, type: 'international', popularity: 5 },
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
