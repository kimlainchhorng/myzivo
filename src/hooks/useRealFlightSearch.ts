import { useQuery } from "@tanstack/react-query";
import { allAirlines, getAirlineLogo, getAirlineByCode, type Airline } from "@/data/airlines";
import { airports } from "@/data/airports";
import type { GeneratedFlight } from "@/data/flightGenerator";

/**
 * AFFILIATE-ONLY MODEL:
 * This hook generates indicative flight data for display purposes only.
 * All actual prices are shown on partner sites after redirect.
 * We do NOT call any external APIs for pricing data.
 */

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  currency?: string;
  enabled?: boolean;
}

// Extended airline fallback for codes not in main database
const extendedAirlineInfo: Record<string, { name: string; category: Airline['category']; alliance: string }> = {
  // Major US Airlines
  'AA': { name: 'American Airlines', category: 'full-service', alliance: 'Oneworld' },
  'DL': { name: 'Delta Air Lines', category: 'full-service', alliance: 'SkyTeam' },
  'UA': { name: 'United Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'WN': { name: 'Southwest Airlines', category: 'low-cost', alliance: 'Independent' },
  'B6': { name: 'JetBlue Airways', category: 'full-service', alliance: 'Independent' },
  'AS': { name: 'Alaska Airlines', category: 'full-service', alliance: 'Oneworld' },
  'NK': { name: 'Spirit Airlines', category: 'low-cost', alliance: 'Independent' },
  'F9': { name: 'Frontier Airlines', category: 'low-cost', alliance: 'Independent' },
  // European
  'BA': { name: 'British Airways', category: 'full-service', alliance: 'Oneworld' },
  'AF': { name: 'Air France', category: 'full-service', alliance: 'SkyTeam' },
  'LH': { name: 'Lufthansa', category: 'full-service', alliance: 'Star Alliance' },
  'KL': { name: 'KLM Royal Dutch', category: 'full-service', alliance: 'SkyTeam' },
  'IB': { name: 'Iberia', category: 'full-service', alliance: 'Oneworld' },
  'AZ': { name: 'ITA Airways', category: 'full-service', alliance: 'SkyTeam' },
  'SK': { name: 'SAS Scandinavian', category: 'full-service', alliance: 'SkyTeam' },
  'LX': { name: 'Swiss International', category: 'full-service', alliance: 'Star Alliance' },
  'OS': { name: 'Austrian Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'SN': { name: 'Brussels Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'TP': { name: 'TAP Air Portugal', category: 'full-service', alliance: 'Star Alliance' },
  'AY': { name: 'Finnair', category: 'full-service', alliance: 'Oneworld' },
  'EI': { name: 'Aer Lingus', category: 'full-service', alliance: 'Independent' },
  'U2': { name: 'easyJet', category: 'low-cost', alliance: 'Independent' },
  'FR': { name: 'Ryanair', category: 'low-cost', alliance: 'Independent' },
  'VY': { name: 'Vueling', category: 'low-cost', alliance: 'Independent' },
  'W6': { name: 'Wizz Air', category: 'low-cost', alliance: 'Independent' },
  'DY': { name: 'Norwegian', category: 'low-cost', alliance: 'Independent' },
  // Middle East
  'EK': { name: 'Emirates', category: 'premium', alliance: 'Independent' },
  'QR': { name: 'Qatar Airways', category: 'premium', alliance: 'Oneworld' },
  'EY': { name: 'Etihad Airways', category: 'premium', alliance: 'Independent' },
  'TK': { name: 'Turkish Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'MS': { name: 'EgyptAir', category: 'full-service', alliance: 'Star Alliance' },
  // Asia Pacific
  'CX': { name: 'Cathay Pacific', category: 'premium', alliance: 'Oneworld' },
  'JL': { name: 'Japan Airlines', category: 'full-service', alliance: 'Oneworld' },
  'NH': { name: 'All Nippon Airways', category: 'full-service', alliance: 'Star Alliance' },
  'KE': { name: 'Korean Air', category: 'full-service', alliance: 'SkyTeam' },
  'OZ': { name: 'Asiana Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'TG': { name: 'Thai Airways', category: 'full-service', alliance: 'Star Alliance' },
  'MH': { name: 'Malaysia Airlines', category: 'full-service', alliance: 'Oneworld' },
  'SQ': { name: 'Singapore Airlines', category: 'premium', alliance: 'Star Alliance' },
  'QF': { name: 'Qantas', category: 'full-service', alliance: 'Oneworld' },
  'NZ': { name: 'Air New Zealand', category: 'full-service', alliance: 'Star Alliance' },
  'VA': { name: 'Virgin Australia', category: 'full-service', alliance: 'Independent' },
  // Low-cost Asia
  'AK': { name: 'AirAsia', category: 'low-cost', alliance: 'Independent' },
  'TR': { name: 'Scoot', category: 'low-cost', alliance: 'Independent' },
  '5J': { name: 'Cebu Pacific', category: 'low-cost', alliance: 'Independent' },
  // Americas
  'AC': { name: 'Air Canada', category: 'full-service', alliance: 'Star Alliance' },
  'AM': { name: 'Aeromexico', category: 'full-service', alliance: 'SkyTeam' },
  'LA': { name: 'LATAM Airlines', category: 'full-service', alliance: 'Independent' },
  'AV': { name: 'Avianca', category: 'full-service', alliance: 'Star Alliance' },
  'CM': { name: 'Copa Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'G3': { name: 'GOL Linhas Aéreas', category: 'low-cost', alliance: 'Independent' },
};

// Map airline code to full airline info from our database with fallback
const getAirlineInfo = (code: string): { name: string; category: Airline['category']; alliance: string; code: string } => {
  // First try our main airline database
  const airline = getAirlineByCode(code);
  if (airline) {
    return {
      code: airline.code,
      name: airline.name,
      category: airline.category,
      alliance: airline.alliance || 'Independent'
    };
  }
  
  // Then try extended fallback database
  const extended = extendedAirlineInfo[code];
  if (extended) {
    return {
      code,
      name: extended.name,
      category: extended.category,
      alliance: extended.alliance
    };
  }
  
  // Default fallback - use code as name
  return {
    code,
    name: code,
    category: 'full-service',
    alliance: 'Independent'
  };
};

// Route-based indicative pricing (not real prices - for display only)
const getIndicativePricing = (fromCode: string, toCode: string): { minPrice: number; maxPrice: number } => {
  // Approximate distance-based pricing
  const domesticRoutes = ['JFK-LAX', 'LAX-JFK', 'ORD-MIA', 'MIA-ORD', 'DFW-LAS', 'LAS-DFW', 'SFO-SEA', 'SEA-SFO'];
  const transatlanticRoutes = ['JFK-LHR', 'LHR-JFK', 'LAX-LHR', 'JFK-CDG', 'ORD-FRA', 'MIA-MAD'];
  const transpacificRoutes = ['LAX-NRT', 'SFO-HKG', 'JFK-HND', 'SEA-ICN'];
  
  const route = `${fromCode}-${toCode}`;
  const reverseRoute = `${toCode}-${fromCode}`;
  
  if (domesticRoutes.includes(route) || domesticRoutes.includes(reverseRoute)) {
    return { minPrice: 89, maxPrice: 299 };
  }
  if (transatlanticRoutes.includes(route) || transatlanticRoutes.includes(reverseRoute)) {
    return { minPrice: 299, maxPrice: 899 };
  }
  if (transpacificRoutes.includes(route) || transpacificRoutes.includes(reverseRoute)) {
    return { minPrice: 449, maxPrice: 1299 };
  }
  
  // Default international pricing
  return { minPrice: 199, maxPrice: 799 };
};

// Generate indicative flights for display (affiliate redirect for real prices)
const generateIndicativeFlights = (
  fromCode: string,
  toCode: string,
  departureDate?: string
): GeneratedFlight[] => {
  const fromAirport = airports.find(a => a.code === fromCode);
  const toAirport = airports.find(a => a.code === toCode);
  const pricing = getIndicativePricing(fromCode, toCode);
  
  // Airlines that commonly fly various routes
  const airlineCodes = ['AA', 'DL', 'UA', 'BA', 'AF', 'LH', 'EK', 'B6', 'AS'];
  const flights: GeneratedFlight[] = [];
  
  // Generate 6-8 indicative flight options
  const numFlights = 6 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numFlights; i++) {
    const airlineCode = airlineCodes[i % airlineCodes.length];
    const airlineInfo = getAirlineInfo(airlineCode);
    
    // Varied departure times
    const depHour = 6 + (i * 2) % 16; // 6am to 10pm
    const depMinutes = [0, 15, 30, 45][i % 4];
    const depTimeStr = `${depHour.toString().padStart(2, '0')}:${depMinutes.toString().padStart(2, '0')}`;
    
    // Flight duration based on route type
    const baseDuration = pricing.maxPrice > 500 ? 480 : pricing.maxPrice > 300 ? 360 : 180;
    const duration = baseDuration + (i * 15) % 60;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const durationStr = `${hours}h ${minutes}m`;
    
    // Calculate arrival time
    const arrHour = (depHour + hours) % 24;
    const arrMinutes = (depMinutes + minutes) % 60;
    const isNextDay = depHour + hours >= 24;
    const arrTimeStr = isNextDay 
      ? `${arrHour.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}+1`
      : `${arrHour.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
    
    // Indicative price (varies by airline category)
    const priceMultiplier = airlineInfo.category === 'premium' ? 1.4 : airlineInfo.category === 'low-cost' ? 0.7 : 1;
    const basePrice = pricing.minPrice + (i * (pricing.maxPrice - pricing.minPrice) / numFlights);
    const indicativePrice = Math.round(basePrice * priceMultiplier);
    
    const stops = i < 3 ? 0 : i < 6 ? 1 : 2;
    
    flights.push({
      id: `indicative-${airlineCode}-${i}-${Date.now()}`,
      airline: airlineInfo.name,
      airlineCode,
      flightNumber: `${airlineCode}-${1000 + i * 100}`,
      departure: {
        time: depTimeStr,
        city: fromAirport?.city || fromCode,
        code: fromCode,
        terminal: ['A', 'B', 'C', 'D'][i % 4]
      },
      arrival: {
        time: arrTimeStr,
        city: toAirport?.city || toCode,
        code: toCode,
        terminal: ['1', '2', '3'][i % 3]
      },
      duration: durationStr,
      stops,
      stopCities: stops > 0 ? generateStopCities(stops, fromCode, toCode) : undefined,
      price: indicativePrice,
      premiumEconomyPrice: airlineInfo.category !== 'low-cost' ? Math.round(indicativePrice * 1.6) : undefined,
      businessPrice: airlineInfo.category !== 'low-cost' ? Math.round(indicativePrice * 3.5) : undefined,
      firstPrice: airlineInfo.category === 'premium' ? Math.round(indicativePrice * 8) : undefined,
      class: 'Economy',
      amenities: airlineInfo.category === 'premium' 
        ? ['wifi', 'entertainment', 'meals', 'power', 'lounge'] 
        : airlineInfo.category === 'low-cost' 
          ? ['snacks'] 
          : ['wifi', 'entertainment', 'meals', 'power'],
      seatsLeft: 2 + (i % 10),
      category: airlineInfo.category,
      alliance: airlineInfo.alliance,
      aircraft: 'Boeing 737 MAX / Airbus A320neo',
      onTimePerformance: 75 + (i % 15),
      carbonOffset: Math.round(duration * 0.5),
      baggageIncluded: airlineInfo.category === 'low-cost' ? 'Carry-on only' : '1 × 23kg checked',
      refundable: airlineInfo.category === 'premium',
      wifi: airlineInfo.category !== 'low-cost',
      entertainment: airlineInfo.category !== 'low-cost',
      meals: airlineInfo.category !== 'low-cost',
      legroom: airlineInfo.category === 'premium' ? '34"' : airlineInfo.category === 'low-cost' ? '28"' : '31"',
      logo: getAirlineLogo(airlineCode),
      bookingLink: undefined, // Will be generated on redirect
      isRealPrice: false, // Indicative pricing only
    });
  }
  
  // Sort by price
  return flights.sort((a, b) => a.price - b.price);
};

// Generate realistic stop cities based on route
const generateStopCities = (transfers: number, from: string, to: string): string[] => {
  const hubsByRegion: Record<string, string[]> = {
    us: ['Atlanta', 'Dallas', 'Chicago', 'Denver', 'Charlotte', 'Houston', 'Phoenix'],
    eu: ['London', 'Frankfurt', 'Amsterdam', 'Paris', 'Madrid', 'Munich'],
    me: ['Dubai', 'Doha', 'Istanbul', 'Abu Dhabi'],
    asia: ['Singapore', 'Hong Kong', 'Tokyo', 'Seoul', 'Bangkok'],
  };
  
  const allHubs = Object.values(hubsByRegion).flat();
  const filtered = allHubs.filter(h => 
    !h.toLowerCase().includes(from.toLowerCase()) && 
    !h.toLowerCase().includes(to.toLowerCase())
  );
  
  const stops: string[] = [];
  for (let i = 0; i < transfers && i < filtered.length; i++) {
    const idx = (from.charCodeAt(0) + to.charCodeAt(0) + i) % filtered.length;
    if (!stops.includes(filtered[idx])) {
      stops.push(filtered[idx]);
    }
  }
  
  return stops.length > 0 ? stops : ['Connection'];
};

/**
 * Hook that returns indicative flight data for display.
 * All actual pricing comes from affiliate partner sites on redirect.
 * NO external API calls are made.
 */
export function useRealFlightSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  currency = 'USD',
  enabled = true,
}: FlightSearchParams) {
  return useQuery({
    queryKey: ['indicative-flights', origin, destination, departureDate, returnDate],
    queryFn: async (): Promise<GeneratedFlight[]> => {
      console.log(`[FlightSearch] Generating indicative flights for ${origin} → ${destination}`);
      
      // Generate indicative flight data (no API calls)
      const flights = generateIndicativeFlights(origin, destination, departureDate);
      
      console.log(`[FlightSearch] Generated ${flights.length} indicative flight options`);
      return flights;
    },
    enabled: enabled && !!origin && !!destination && origin.length === 3 && destination.length === 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to get combined real + generated flights
export function useCombinedFlights({
  origin,
  destination,
  departureDate,
  returnDate,
  enabled = true,
}: Omit<FlightSearchParams, 'currency'>) {
  const { 
    data: flights, 
    isLoading,
    isError,
    error
  } = useRealFlightSearch({
    origin,
    destination,
    departureDate,
    returnDate,
    enabled,
  });

  return {
    flights: flights || [],
    isLoading,
    isError,
    error,
    hasRealPrices: false, // All prices are indicative
  };
}
