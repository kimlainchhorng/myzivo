import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allAirlines, getAirlineLogo, getAirlineByCode, type Airline } from "@/data/airlines";
import { airports } from "@/data/airports";
import type { GeneratedFlight } from "@/data/flightGenerator";

interface TravelpayoutsPrice {
  price: number;
  airline: string;
  flightNumber: string;
  departureAt: string;
  returnAt?: string;
  duration: number; // minutes
  transfers: number;
  origin: string;
  destination: string;
  link: string;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  currency?: string;
  enabled?: boolean;
}

interface FlightPricesResponse {
  success: boolean;
  prices: TravelpayoutsPrice[];
  currency: string;
  origin: string;
  destination: string;
  note?: string;
  error?: string;
}

// Extended airline fallback for codes not in main database
const extendedAirlineInfo: Record<string, { name: string; category: Airline['category']; alliance: string }> = {
  // Russian/CIS
  'SU': { name: 'Aeroflot', category: 'full-service', alliance: 'SkyTeam' },
  'S7': { name: 'S7 Airlines', category: 'full-service', alliance: 'Oneworld' },
  'DP': { name: 'Pobeda', category: 'low-cost', alliance: 'Independent' },
  'U6': { name: 'Ural Airlines', category: 'full-service', alliance: 'Independent' },
  'FV': { name: 'Rossiya Airlines', category: 'full-service', alliance: 'Independent' },
  'UT': { name: 'UTair', category: 'full-service', alliance: 'Independent' },
  'N4': { name: 'Nordwind Airlines', category: 'full-service', alliance: 'Independent' },
  // Middle East & Africa
  'WY': { name: 'Oman Air', category: 'full-service', alliance: 'Independent' },
  'GF': { name: 'Gulf Air', category: 'full-service', alliance: 'Independent' },
  'SV': { name: 'Saudia', category: 'full-service', alliance: 'SkyTeam' },
  'MS': { name: 'EgyptAir', category: 'full-service', alliance: 'Star Alliance' },
  'ET': { name: 'Ethiopian Airlines', category: 'full-service', alliance: 'Star Alliance' },
  'SA': { name: 'South African Airways', category: 'full-service', alliance: 'Star Alliance' },
  // Asia
  'PG': { name: 'Bangkok Airways', category: 'full-service', alliance: 'Independent' },
  'PR': { name: 'Philippine Airlines', category: 'full-service', alliance: 'Independent' },
  'HU': { name: 'Hainan Airlines', category: 'premium', alliance: 'Independent' },
  'CZ': { name: 'China Southern', category: 'full-service', alliance: 'SkyTeam' },
  'CA': { name: 'Air China', category: 'full-service', alliance: 'Star Alliance' },
  'MU': { name: 'China Eastern', category: 'full-service', alliance: 'SkyTeam' },
  '3U': { name: 'Sichuan Airlines', category: 'full-service', alliance: 'Independent' },
  'HO': { name: 'Juneyao Airlines', category: 'full-service', alliance: 'Star Alliance' },
  '5J': { name: 'Cebu Pacific', category: 'low-cost', alliance: 'Independent' },
  'Z2': { name: 'AirAsia Philippines', category: 'low-cost', alliance: 'Independent' },
  'ZG': { name: 'Zipair Tokyo', category: 'low-cost', alliance: 'Independent' },
  'MM': { name: 'Peach Aviation', category: 'low-cost', alliance: 'Independent' },
  '7C': { name: 'Jeju Air', category: 'low-cost', alliance: 'Independent' },
  'LJ': { name: 'Jin Air', category: 'low-cost', alliance: 'Independent' },
  'TW': { name: 'T\'way Air', category: 'low-cost', alliance: 'Independent' },
  // Oceania
  'SB': { name: 'Aircalin', category: 'full-service', alliance: 'Independent' },
  // South Asia
  'PK': { name: 'Pakistan International', category: 'full-service', alliance: 'Independent' },
  'BG': { name: 'Biman Bangladesh', category: 'full-service', alliance: 'Independent' },
  'WB': { name: 'RwandAir', category: 'full-service', alliance: 'Independent' },
  // Americas
  'G3': { name: 'GOL Linhas Aéreas', category: 'low-cost', alliance: 'Independent' },
  'AD': { name: 'Azul Brazilian Airlines', category: 'full-service', alliance: 'Independent' },
  'H2': { name: 'Sky Airline', category: 'low-cost', alliance: 'Independent' },
  'JA': { name: 'JetSMART', category: 'low-cost', alliance: 'Independent' },
  // Europe
  'VY': { name: 'Vueling', category: 'low-cost', alliance: 'Independent' },
  'HV': { name: 'Transavia', category: 'low-cost', alliance: 'Independent' },
  'DE': { name: 'Condor', category: 'full-service', alliance: 'Independent' },
  'DY': { name: 'Norwegian', category: 'low-cost', alliance: 'Independent' },
  'EI': { name: 'Aer Lingus', category: 'full-service', alliance: 'Independent' },
  'BT': { name: 'airBaltic', category: 'full-service', alliance: 'Independent' },
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

// Convert API response to GeneratedFlight format
const transformToGeneratedFlight = (
  apiPrice: TravelpayoutsPrice,
  index: number,
  fromCode: string,
  toCode: string
): GeneratedFlight => {
  const airlineInfo = getAirlineInfo(apiPrice.airline);
  const fromAirport = airports.find(a => a.code === fromCode);
  const toAirport = airports.find(a => a.code === toCode);
  
  // Parse departure time - handle ISO format with timezone
  const departureTime = new Date(apiPrice.departureAt);
  
  // Format departure time as HH:MM in 24h format
  const depHours = departureTime.getHours().toString().padStart(2, '0');
  const depMinutes = departureTime.getMinutes().toString().padStart(2, '0');
  const depTimeStr = `${depHours}:${depMinutes}`;
  
  // Calculate arrival time from departure + duration (duration is in minutes)
  const arrivalTime = new Date(departureTime.getTime() + apiPrice.duration * 60 * 1000);
  const arrHours = arrivalTime.getHours().toString().padStart(2, '0');
  const arrMinutes = arrivalTime.getMinutes().toString().padStart(2, '0');
  
  // Check if arrival is next day
  const isNextDay = arrivalTime.getDate() !== departureTime.getDate() || 
                    arrivalTime.getMonth() !== departureTime.getMonth();
  const dayDiff = Math.floor((arrivalTime.getTime() - departureTime.getTime()) / (24 * 60 * 60 * 1000));
  const arrTimeStr = isNextDay 
    ? `${arrHours}:${arrMinutes}+${dayDiff > 0 ? dayDiff : 1}` 
    : `${arrHours}:${arrMinutes}`;
  
  // Format duration: convert minutes to Xh Ym format
  const hours = Math.floor(apiPrice.duration / 60);
  const minutes = apiPrice.duration % 60;
  const durationStr = `${hours}h ${minutes}m`;
  
  // Format flight number: AIRLINE-NUMBER format (e.g., "B6-1124")
  const flightNum = apiPrice.flightNumber || String(1000 + index);
  const formattedFlightNumber = `${apiPrice.airline}-${flightNum}`;
  
  // Calculate prices for other classes based on category
  const economyPrice = apiPrice.price;
  const category = airlineInfo.category || 'full-service';
  const businessMultiplier = category === 'premium' ? 4 : category === 'low-cost' ? 2.5 : 3.5;
  const businessPrice = Math.round(economyPrice * businessMultiplier);
  const firstPrice = category === 'premium' ? Math.round(economyPrice * 8) : undefined;
  
  // Amenities based on category
  const amenitiesByCategory = {
    premium: ['wifi', 'entertainment', 'meals', 'power', 'lounge', 'priority'],
    'full-service': ['wifi', 'entertainment', 'meals', 'power'],
    'low-cost': ['snacks']
  };
  
  // Aircraft selection based on route duration
  const isLongHaul = apiPrice.duration > 360; // 6+ hours
  const aircraftByCategory = {
    premium: isLongHaul 
      ? ['Airbus A380-800', 'Airbus A350-1000', 'Boeing 777-300ER', 'Boeing 787-10']
      : ['Airbus A350-900', 'Boeing 787-9', 'Airbus A321neo'],
    'full-service': isLongHaul
      ? ['Boeing 787-9', 'Airbus A330-300', 'Boeing 777-200ER']
      : ['Boeing 737-900', 'Airbus A321neo', 'Boeing 757-200'],
    'low-cost': ['Boeing 737 MAX 8', 'Airbus A320neo', 'Airbus A321neo']
  };
  
  const aircraftList = aircraftByCategory[category];
  
  // Generate consistent but varied data based on flight number for reproducibility
  const flightHash = flightNum.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const terminalOptions = ['1', '2', '3', 'A', 'B', 'C', 'D'];
  const depTerminal = terminalOptions[flightHash % terminalOptions.length];
  const arrTerminal = terminalOptions[(flightHash + 3) % terminalOptions.length];
  
  // On-time performance based on airline category and transfers
  const baseOnTime = category === 'premium' ? 90 : category === 'full-service' ? 82 : 75;
  const transferPenalty = apiPrice.transfers * 3;
  const onTimePerf = Math.max(65, baseOnTime - transferPenalty + (flightHash % 5));
  
  // Carbon offset based on duration
  const carbonOffset = Math.round((apiPrice.duration / 60) * 45 + (flightHash % 20));
  
  return {
    id: `${apiPrice.airline}-${flightNum}-${departureTime.getTime()}-${index}`,
    airline: airlineInfo.name,
    airlineCode: apiPrice.airline,
    flightNumber: formattedFlightNumber,
    departure: {
      time: depTimeStr,
      city: fromAirport?.city || fromCode,
      code: fromCode,
      terminal: depTerminal
    },
    arrival: {
      time: arrTimeStr,
      city: toAirport?.city || toCode,
      code: toCode,
      terminal: arrTerminal
    },
    duration: durationStr,
    stops: apiPrice.transfers,
    stopCities: apiPrice.transfers > 0 ? generateStopCities(apiPrice.transfers, fromCode, toCode) : undefined,
    price: economyPrice,
    premiumEconomyPrice: category !== 'low-cost' ? Math.round(economyPrice * 1.6) : undefined,
    businessPrice: category !== 'low-cost' ? businessPrice : undefined,
    firstPrice,
    class: 'Economy',
    amenities: amenitiesByCategory[category],
    seatsLeft: 2 + (flightHash % 18),
    category,
    alliance: airlineInfo.alliance || 'Independent',
    aircraft: aircraftList[flightHash % aircraftList.length],
    onTimePerformance: onTimePerf,
    carbonOffset,
    baggageIncluded: category === 'low-cost' ? 'Carry-on only' : 
                     category === 'premium' ? '2 × 32kg checked' : '1 × 23kg checked',
    refundable: category === 'premium',
    wifi: category !== 'low-cost',
    entertainment: category !== 'low-cost',
    meals: category !== 'low-cost',
    legroom: category === 'premium' ? '34"' : category === 'low-cost' ? '28"' : '31"',
    logo: getAirlineLogo(apiPrice.airline),
    bookingLink: apiPrice.link,
    isRealPrice: true
  };
};

// Generate realistic stop cities based on route
const generateStopCities = (transfers: number, from: string, to: string): string[] => {
  // Major hub cities for connections
  const hubsByRegion: Record<string, string[]> = {
    us: ['Atlanta', 'Dallas', 'Chicago', 'Denver', 'Charlotte', 'Houston', 'Phoenix'],
    eu: ['London', 'Frankfurt', 'Amsterdam', 'Paris', 'Madrid', 'Munich'],
    me: ['Dubai', 'Doha', 'Istanbul', 'Abu Dhabi'],
    asia: ['Singapore', 'Hong Kong', 'Tokyo', 'Seoul', 'Bangkok'],
  };
  
  // Flatten and filter out origin/destination
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

export function useRealFlightSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  currency = 'USD',
  enabled = true,
}: FlightSearchParams) {
  return useQuery({
    queryKey: ['real-flights', origin, destination, departureDate, returnDate, currency],
    queryFn: async (): Promise<GeneratedFlight[]> => {
      console.log(`[FlightSearch] Fetching prices for ${origin} → ${destination}`);
      
      const { data, error } = await supabase.functions.invoke('get-flight-prices', {
        body: { origin, destination, departureDate, returnDate, currency },
      });

      if (error) {
        console.error('[FlightSearch] Edge function error:', error);
        throw error;
      }

      const response = data as FlightPricesResponse;
      
      // Handle graceful fallback for unsupported routes
      if (!response?.success) {
        console.warn('[FlightSearch] API returned unsuccessful:', response?.error);
        return [];
      }
      
      // Log if route is not in pricing database
      if (response.note) {
        console.log('[FlightSearch]', response.note);
      }

      if (!response?.prices?.length) {
        console.log('[FlightSearch] No real prices available, will use generated flights');
        return [];
      }

      // Transform API data to GeneratedFlight format
      const flights = response.prices.map((price: TravelpayoutsPrice, index: number) => 
        transformToGeneratedFlight(price, index, origin, destination)
      );

      console.log(`[FlightSearch] Loaded ${flights.length} real flights from API`);
      return flights;
    },
    enabled: enabled && !!origin && !!destination && origin.length === 3 && destination.length === 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    retryDelay: 1000,
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
    data: realFlights, 
    isLoading: isLoadingReal,
    isError: isRealError,
    error: realError
  } = useRealFlightSearch({
    origin,
    destination,
    departureDate,
    returnDate,
    enabled,
  });

  return {
    flights: realFlights || [],
    isLoading: isLoadingReal,
    isError: isRealError,
    error: realError,
    hasRealPrices: (realFlights?.length || 0) > 0,
  };
}
