// Comprehensive airline data for ZIVO Flights

export interface Airline {
  code: string;
  name: string;
  category: 'premium' | 'full-service' | 'low-cost';
  alliance?: 'Star Alliance' | 'Oneworld' | 'SkyTeam' | 'Independent';
  country: string;
  hub: string;
}

// Get real airline logo from AVS CDN (free, no auth required)
// Format: https://pics.avs.io/{SIZE}/{SIZE}/{CODE}.png
export const getAirlineLogo = (code: string, size: number = 64) => {
  // AVS CDN provides free airline logos without authentication
  return `https://pics.avs.io/${size}/${size}/${code}.png`;
};

// Legacy AVS CDN (kept for backward compatibility)
export const getAirlineLogoLegacy = (code: string, size: number = 100) => 
  `https://pics.avs.io/${size}/${size}/${code}.png`;

export const premiumAirlines: Airline[] = [
  { code: 'SQ', name: 'Singapore Airlines', category: 'premium', alliance: 'Star Alliance', country: 'Singapore', hub: 'SIN' },
  { code: 'EK', name: 'Emirates', category: 'premium', alliance: 'Independent', country: 'UAE', hub: 'DXB' },
  { code: 'QR', name: 'Qatar Airways', category: 'premium', alliance: 'Oneworld', country: 'Qatar', hub: 'DOH' },
  { code: 'CX', name: 'Cathay Pacific', category: 'premium', alliance: 'Oneworld', country: 'Hong Kong', hub: 'HKG' },
  { code: 'NH', name: 'ANA', category: 'premium', alliance: 'Star Alliance', country: 'Japan', hub: 'NRT' },
  { code: 'JL', name: 'Japan Airlines', category: 'premium', alliance: 'Oneworld', country: 'Japan', hub: 'HND' },
  { code: 'EY', name: 'Etihad Airways', category: 'premium', alliance: 'Independent', country: 'UAE', hub: 'AUH' },
  { code: 'NZ', name: 'Air New Zealand', category: 'premium', alliance: 'Star Alliance', country: 'New Zealand', hub: 'AKL' },
  { code: 'QF', name: 'Qantas', category: 'premium', alliance: 'Oneworld', country: 'Australia', hub: 'SYD' },
  { code: 'KE', name: 'Korean Air', category: 'premium', alliance: 'SkyTeam', country: 'South Korea', hub: 'ICN' },
  { code: 'TK', name: 'Turkish Airlines', category: 'premium', alliance: 'Star Alliance', country: 'Turkey', hub: 'IST' },
  { code: 'BR', name: 'EVA Air', category: 'premium', alliance: 'Star Alliance', country: 'Taiwan', hub: 'TPE' },
  { code: 'VS', name: 'Virgin Atlantic', category: 'premium', alliance: 'SkyTeam', country: 'UK', hub: 'LHR' },
  { code: 'JX', name: 'STARLUX Airlines', category: 'premium', alliance: 'Independent', country: 'Taiwan', hub: 'TPE' },
];

export const fullServiceAirlines: Airline[] = [
  { code: 'DL', name: 'Delta Air Lines', category: 'full-service', alliance: 'SkyTeam', country: 'USA', hub: 'ATL' },
  { code: 'UA', name: 'United Airlines', category: 'full-service', alliance: 'Star Alliance', country: 'USA', hub: 'ORD' },
  { code: 'AA', name: 'American Airlines', category: 'full-service', alliance: 'Oneworld', country: 'USA', hub: 'DFW' },
  { code: 'BA', name: 'British Airways', category: 'full-service', alliance: 'Oneworld', country: 'UK', hub: 'LHR' },
  { code: 'LH', name: 'Lufthansa', category: 'full-service', alliance: 'Star Alliance', country: 'Germany', hub: 'FRA' },
  { code: 'AF', name: 'Air France', category: 'full-service', alliance: 'SkyTeam', country: 'France', hub: 'CDG' },
  { code: 'KL', name: 'KLM', category: 'full-service', alliance: 'SkyTeam', country: 'Netherlands', hub: 'AMS' },
  { code: 'AC', name: 'Air Canada', category: 'full-service', alliance: 'Star Alliance', country: 'Canada', hub: 'YYZ' },
  { code: 'LX', name: 'SWISS', category: 'full-service', alliance: 'Star Alliance', country: 'Switzerland', hub: 'ZRH' },
  { code: 'IB', name: 'Iberia', category: 'full-service', alliance: 'Oneworld', country: 'Spain', hub: 'MAD' },
  { code: 'AY', name: 'Finnair', category: 'full-service', alliance: 'Oneworld', country: 'Finland', hub: 'HEL' },
  { code: 'OS', name: 'Austrian Airlines', category: 'full-service', alliance: 'Star Alliance', country: 'Austria', hub: 'VIE' },
  { code: 'SK', name: 'SAS', category: 'full-service', alliance: 'SkyTeam', country: 'Sweden', hub: 'ARN' },
  { code: 'AZ', name: 'ITA Airways', category: 'full-service', alliance: 'SkyTeam', country: 'Italy', hub: 'FCO' },
  { code: 'LO', name: 'LOT Polish Airlines', category: 'full-service', alliance: 'Star Alliance', country: 'Poland', hub: 'WAW' },
  { code: 'TP', name: 'TAP Portugal', category: 'full-service', alliance: 'Star Alliance', country: 'Portugal', hub: 'LIS' },
  { code: 'AS', name: 'Alaska Airlines', category: 'full-service', alliance: 'Oneworld', country: 'USA', hub: 'SEA' },
  { code: 'HA', name: 'Hawaiian Airlines', category: 'full-service', alliance: 'Independent', country: 'USA', hub: 'HNL' },
  { code: 'AV', name: 'Avianca', category: 'full-service', alliance: 'Star Alliance', country: 'Colombia', hub: 'BOG' },
  { code: 'B6', name: 'JetBlue', category: 'full-service', alliance: 'Independent', country: 'USA', hub: 'JFK' },
  { code: 'WS', name: 'WestJet', category: 'full-service', alliance: 'Independent', country: 'Canada', hub: 'YYC' },
  { code: 'VA', name: 'Virgin Australia', category: 'full-service', alliance: 'Independent', country: 'Australia', hub: 'BNE' },
  { code: 'TG', name: 'Thai Airways', category: 'full-service', alliance: 'Star Alliance', country: 'Thailand', hub: 'BKK' },
  { code: 'VN', name: 'Vietnam Airlines', category: 'full-service', alliance: 'SkyTeam', country: 'Vietnam', hub: 'SGN' },
  { code: 'UL', name: 'Sri Lankan Airlines', category: 'full-service', alliance: 'Oneworld', country: 'Sri Lanka', hub: 'CMB' },
  { code: 'GA', name: 'Garuda Indonesia', category: 'full-service', alliance: 'SkyTeam', country: 'Indonesia', hub: 'CGK' },
  { code: 'MH', name: 'Malaysia Airlines', category: 'full-service', alliance: 'Oneworld', country: 'Malaysia', hub: 'KUL' },
  { code: 'CI', name: 'China Airlines', category: 'full-service', alliance: 'SkyTeam', country: 'Taiwan', hub: 'TPE' },
  { code: 'OZ', name: 'Asiana Airlines', category: 'full-service', alliance: 'Star Alliance', country: 'South Korea', hub: 'ICN' },
  { code: 'AI', name: 'Air India', category: 'full-service', alliance: 'Star Alliance', country: 'India', hub: 'DEL' },
  { code: 'FJ', name: 'Fiji Airways', category: 'full-service', alliance: 'Oneworld', country: 'Fiji', hub: 'NAN' },
  { code: 'AM', name: 'Aeromexico', category: 'full-service', alliance: 'SkyTeam', country: 'Mexico', hub: 'MEX' },
  { code: 'LA', name: 'LATAM Airlines', category: 'full-service', alliance: 'Independent', country: 'Chile', hub: 'SCL' },
  { code: 'CM', name: 'Copa Airlines', category: 'full-service', alliance: 'Star Alliance', country: 'Panama', hub: 'PTY' },
];

export const lowCostAirlines: Airline[] = [
  { code: 'AK', name: 'AirAsia', category: 'low-cost', alliance: 'Independent', country: 'Malaysia', hub: 'KUL' },
  { code: 'JQ', name: 'Jetstar', category: 'low-cost', alliance: 'Independent', country: 'Australia', hub: 'MEL' },
  { code: 'U2', name: 'easyJet', category: 'low-cost', alliance: 'Independent', country: 'UK', hub: 'LGW' },
  { code: 'FZ', name: 'flydubai', category: 'low-cost', alliance: 'Independent', country: 'UAE', hub: 'DXB' },
  { code: 'FR', name: 'Ryanair', category: 'low-cost', alliance: 'Independent', country: 'Ireland', hub: 'DUB' },
  { code: 'TR', name: 'Scoot', category: 'low-cost', alliance: 'Independent', country: 'Singapore', hub: 'SIN' },
  { code: 'WN', name: 'Southwest Airlines', category: 'low-cost', alliance: 'Independent', country: 'USA', hub: 'DAL' },
  { code: 'NK', name: 'Spirit Airlines', category: 'low-cost', alliance: 'Independent', country: 'USA', hub: 'FLL' },
  { code: 'F9', name: 'Frontier Airlines', category: 'low-cost', alliance: 'Independent', country: 'USA', hub: 'DEN' },
  { code: '6E', name: 'IndiGo', category: 'low-cost', alliance: 'Independent', country: 'India', hub: 'DEL' },
  { code: 'G9', name: 'Air Arabia', category: 'low-cost', alliance: 'Independent', country: 'UAE', hub: 'SHJ' },
  { code: 'Y4', name: 'Volaris', category: 'low-cost', alliance: 'Independent', country: 'Mexico', hub: 'TLC' },
  { code: 'W6', name: 'Wizz Air', category: 'low-cost', alliance: 'Independent', country: 'Hungary', hub: 'BUD' },
  { code: 'VY', name: 'Vueling', category: 'low-cost', alliance: 'Independent', country: 'Spain', hub: 'BCN' },
  { code: 'G8', name: 'Go First', category: 'low-cost', alliance: 'Independent', country: 'India', hub: 'BOM' },
  { code: 'XJ', name: 'Thai AirAsia X', category: 'low-cost', alliance: 'Independent', country: 'Thailand', hub: 'DMK' },
  { code: 'PC', name: 'Pegasus Airlines', category: 'low-cost', alliance: 'Independent', country: 'Turkey', hub: 'SAW' },
  { code: 'ZZ', name: 'Buzz', category: 'low-cost', alliance: 'Independent', country: 'Poland', hub: 'WAW' },
];

export const allAirlines = [...premiumAirlines, ...fullServiceAirlines, ...lowCostAirlines];

export const getAirlineByCode = (code: string): Airline | undefined => {
  return allAirlines.find(a => a.code === code);
};

export const getAirlinesByCategory = (category: Airline['category']): Airline[] => {
  return allAirlines.filter(a => a.category === category);
};

export const getAirlinesByAlliance = (alliance: Airline['alliance']): Airline[] => {
  return allAirlines.filter(a => a.alliance === alliance);
};

// Featured airlines for homepage display
export const featuredAirlines = [
  premiumAirlines[0], // Singapore Airlines
  premiumAirlines[1], // Emirates  
  premiumAirlines[2], // Qatar Airways
  premiumAirlines[4], // ANA
  fullServiceAirlines[0], // Delta
  fullServiceAirlines[3], // British Airways
  fullServiceAirlines[4], // Lufthansa
  fullServiceAirlines[6], // KLM
];
