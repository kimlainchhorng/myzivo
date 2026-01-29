// Comprehensive airline data for ZIVO Flights

export interface Airline {
  code: string;
  name: string;
  logo: string;
  category: 'premium' | 'full-service' | 'low-cost';
  alliance?: 'Star Alliance' | 'Oneworld' | 'SkyTeam' | 'Independent';
}

export const premiumAirlines: Airline[] = [
  { code: 'SQ', name: 'Singapore Airlines', logo: '🇸🇬', category: 'premium', alliance: 'Star Alliance' },
  { code: 'EK', name: 'Emirates', logo: '🇦🇪', category: 'premium', alliance: 'Independent' },
  { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦', category: 'premium', alliance: 'Oneworld' },
  { code: 'CX', name: 'Cathay Pacific', logo: '🇭🇰', category: 'premium', alliance: 'Oneworld' },
  { code: 'NH', name: 'ANA', logo: '🇯🇵', category: 'premium', alliance: 'Star Alliance' },
  { code: 'JL', name: 'Japan Airlines', logo: '🇯🇵', category: 'premium', alliance: 'Oneworld' },
  { code: 'EY', name: 'Etihad Airways', logo: '🇦🇪', category: 'premium', alliance: 'Independent' },
  { code: 'NZ', name: 'Air New Zealand', logo: '🇳🇿', category: 'premium', alliance: 'Star Alliance' },
  { code: 'QF', name: 'Qantas', logo: '🇦🇺', category: 'premium', alliance: 'Oneworld' },
  { code: 'KE', name: 'Korean Air', logo: '🇰🇷', category: 'premium', alliance: 'SkyTeam' },
  { code: 'TK', name: 'Turkish Airlines', logo: '🇹🇷', category: 'premium', alliance: 'Star Alliance' },
  { code: 'BR', name: 'EVA Air', logo: '🇹🇼', category: 'premium', alliance: 'Star Alliance' },
  { code: 'VS', name: 'Virgin Atlantic', logo: '🇬🇧', category: 'premium', alliance: 'SkyTeam' },
  { code: 'JX', name: 'STARLUX Airlines', logo: '🇹🇼', category: 'premium', alliance: 'Independent' },
];

export const fullServiceAirlines: Airline[] = [
  { code: 'DL', name: 'Delta Airlines', logo: '🇺🇸', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'UA', name: 'United Airlines', logo: '🇺🇸', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'AA', name: 'American Airlines', logo: '🇺🇸', category: 'full-service', alliance: 'Oneworld' },
  { code: 'BA', name: 'British Airways', logo: '🇬🇧', category: 'full-service', alliance: 'Oneworld' },
  { code: 'LH', name: 'Lufthansa', logo: '🇩🇪', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'AF', name: 'Air France', logo: '🇫🇷', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'KL', name: 'KLM', logo: '🇳🇱', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'AC', name: 'Air Canada', logo: '🇨🇦', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'LX', name: 'SWISS', logo: '🇨🇭', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'IB', name: 'Iberia', logo: '🇪🇸', category: 'full-service', alliance: 'Oneworld' },
  { code: 'AY', name: 'Finnair', logo: '🇫🇮', category: 'full-service', alliance: 'Oneworld' },
  { code: 'OS', name: 'Austrian Airlines', logo: '🇦🇹', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'SK', name: 'SAS', logo: '🇸🇪', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'AZ', name: 'ITA Airways', logo: '🇮🇹', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'LO', name: 'LOT Polish Airlines', logo: '🇵🇱', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'TP', name: 'TAP Portugal', logo: '🇵🇹', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'AS', name: 'Alaska Airlines', logo: '🇺🇸', category: 'full-service', alliance: 'Oneworld' },
  { code: 'HA', name: 'Hawaiian Airlines', logo: '🇺🇸', category: 'full-service', alliance: 'Independent' },
  { code: 'AV', name: 'Avianca', logo: '🇨🇴', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'B6', name: 'JetBlue', logo: '🇺🇸', category: 'full-service', alliance: 'Independent' },
  { code: 'WS', name: 'WestJet', logo: '🇨🇦', category: 'full-service', alliance: 'Independent' },
  { code: 'VA', name: 'Virgin Australia', logo: '🇦🇺', category: 'full-service', alliance: 'Independent' },
  { code: 'TG', name: 'Thai Airways', logo: '🇹🇭', category: 'full-service', alliance: 'Star Alliance' },
  { code: 'VN', name: 'Vietnam Airlines', logo: '🇻🇳', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'UL', name: 'Sri Lankan Airlines', logo: '🇱🇰', category: 'full-service', alliance: 'Oneworld' },
  { code: 'GA', name: 'Garuda Indonesia', logo: '🇮🇩', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'MK', name: 'Air Mauritius', logo: '🇲🇺', category: 'full-service', alliance: 'Independent' },
  { code: 'SB', name: 'Air Calin', logo: '🇳🇨', category: 'full-service', alliance: 'Independent' },
  { code: 'FJ', name: 'Fiji Airways', logo: '🇫🇯', category: 'full-service', alliance: 'Oneworld' },
  { code: 'AM', name: 'Aero Mexico', logo: '🇲🇽', category: 'full-service', alliance: 'SkyTeam' },
  { code: 'TX', name: 'Air Caraibes', logo: '🇫🇷', category: 'full-service', alliance: 'Independent' },
];

export const lowCostAirlines: Airline[] = [
  { code: 'AK', name: 'AirAsia', logo: '🇲🇾', category: 'low-cost', alliance: 'Independent' },
  { code: 'JQ', name: 'Jetstar', logo: '🇦🇺', category: 'low-cost', alliance: 'Independent' },
  { code: 'BT', name: 'airBaltic', logo: '🇱🇻', category: 'low-cost', alliance: 'Independent' },
  { code: 'UO', name: 'HK Express', logo: '🇭🇰', category: 'low-cost', alliance: 'Independent' },
  { code: 'U2', name: 'easyJet', logo: '🇬🇧', category: 'low-cost', alliance: 'Independent' },
  { code: 'FZ', name: 'flydubai', logo: '🇦🇪', category: 'low-cost', alliance: 'Independent' },
  { code: 'FR', name: 'Ryanair', logo: '🇮🇪', category: 'low-cost', alliance: 'Independent' },
  { code: 'TR', name: 'Scoot', logo: '🇸🇬', category: 'low-cost', alliance: 'Independent' },
  { code: 'MX', name: 'Breeze Airways', logo: '🇺🇸', category: 'low-cost', alliance: 'Independent' },
  { code: 'WN', name: 'Southwest', logo: '🇺🇸', category: 'low-cost', alliance: 'Independent' },
  { code: 'H2', name: 'SKY Airline', logo: '🇨🇱', category: 'low-cost', alliance: 'Independent' },
  { code: 'XY', name: 'flynas', logo: '🇸🇦', category: 'low-cost', alliance: 'Independent' },
  { code: 'BY', name: 'TUI Airways', logo: '🇬🇧', category: 'low-cost', alliance: 'Independent' },
  { code: 'DY', name: 'Norwegian', logo: '🇳🇴', category: 'low-cost', alliance: 'Independent' },
  { code: '6E', name: 'IndiGo', logo: '🇮🇳', category: 'low-cost', alliance: 'Independent' },
  { code: 'G9', name: 'Air Arabia', logo: '🇦🇪', category: 'low-cost', alliance: 'Independent' },
  { code: 'Y4', name: 'Volaris', logo: '🇲🇽', category: 'low-cost', alliance: 'Independent' },
  { code: 'LS', name: 'Jet2', logo: '🇬🇧', category: 'low-cost', alliance: 'Independent' },
  { code: 'W6', name: 'Wizz Air', logo: '🇭🇺', category: 'low-cost', alliance: 'Independent' },
  { code: 'VY', name: 'Vueling', logo: '🇪🇸', category: 'low-cost', alliance: 'Independent' },
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
