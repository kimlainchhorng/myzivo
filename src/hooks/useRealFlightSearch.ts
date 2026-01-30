import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allAirlines, getAirlineLogo } from "@/data/airlines";
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

// Map airline code to full airline info with fallback
const getAirlineInfo = (code: string) => {
  const airline = allAirlines.find(a => a.code === code);
  if (airline) return airline;
  
  // Common airline codes not in our database
  const fallbackAirlines: Record<string, { name: string; category: 'premium' | 'full-service' | 'low-cost'; alliance: string }> = {
    'SU': { name: 'Aeroflot', category: 'full-service', alliance: 'SkyTeam' },
    'S7': { name: 'S7 Airlines', category: 'full-service', alliance: 'oneworld' },
    'DP': { name: 'Pobeda', category: 'low-cost', alliance: 'Independent' },
    'U6': { name: 'Ural Airlines', category: 'full-service', alliance: 'Independent' },
    'FV': { name: 'Rossiya Airlines', category: 'full-service', alliance: 'Independent' },
    'UT': { name: 'UTair', category: 'full-service', alliance: 'Independent' },
    'N4': { name: 'Nordwind Airlines', category: 'full-service', alliance: 'Independent' },
    'AY': { name: 'Finnair', category: 'full-service', alliance: 'oneworld' },
    'SK': { name: 'SAS', category: 'full-service', alliance: 'Star Alliance' },
    'LO': { name: 'LOT Polish Airlines', category: 'full-service', alliance: 'Star Alliance' },
    'OS': { name: 'Austrian Airlines', category: 'full-service', alliance: 'Star Alliance' },
    'LX': { name: 'Swiss', category: 'premium', alliance: 'Star Alliance' },
    'TK': { name: 'Turkish Airlines', category: 'full-service', alliance: 'Star Alliance' },
    'EY': { name: 'Etihad Airways', category: 'premium', alliance: 'Independent' },
    'WY': { name: 'Oman Air', category: 'full-service', alliance: 'Independent' },
    'GF': { name: 'Gulf Air', category: 'full-service', alliance: 'Independent' },
  };
  
  const fallback = fallbackAirlines[code];
  return {
    code,
    name: fallback?.name || code,
    category: fallback?.category || ('full-service' as const),
    alliance: fallback?.alliance || 'Independent'
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
  
  // Parse departure time
  const departureTime = new Date(apiPrice.departureAt);
  const depTimeStr = departureTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  // Calculate arrival time
  const arrivalTime = new Date(departureTime.getTime() + apiPrice.duration * 60 * 1000);
  const arrTimeStr = arrivalTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  // Format duration
  const hours = Math.floor(apiPrice.duration / 60);
  const minutes = apiPrice.duration % 60;
  const durationStr = `${hours}h ${minutes}m`;
  
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
  
  // Aircraft selection
  const aircraftByCategory = {
    premium: ['Airbus A380-800', 'Airbus A350-1000', 'Boeing 777-300ER', 'Boeing 787-9'],
    'full-service': ['Boeing 787-9', 'Airbus A330-300', 'Boeing 767-400ER', 'Airbus A321neo'],
    'low-cost': ['Boeing 737 MAX 8', 'Airbus A320neo', 'Airbus A321neo']
  };
  
  const aircraftList = aircraftByCategory[category];
  
  // Generate consistent but varied data based on index
  const terminalOptions = ['1', '2', '3', 'A', 'B', 'C'];
  const depTerminal = terminalOptions[index % terminalOptions.length];
  const arrTerminal = terminalOptions[(index + 3) % terminalOptions.length];
  
  return {
    id: `${apiPrice.airline}-${apiPrice.flightNumber}-${departureTime.getTime()}-${index}`,
    airline: airlineInfo.name,
    airlineCode: apiPrice.airline,
    flightNumber: `${apiPrice.airline}${apiPrice.flightNumber || (1000 + index)}`,
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
    stopCities: apiPrice.transfers > 0 ? ['Connection'] : undefined,
    price: economyPrice,
    premiumEconomyPrice: category !== 'low-cost' ? Math.round(economyPrice * 1.6) : undefined,
    businessPrice: category !== 'low-cost' ? businessPrice : undefined,
    firstPrice,
    class: 'Economy',
    amenities: amenitiesByCategory[category],
    seatsLeft: Math.floor(Math.random() * 15) + 2,
    category,
    alliance: airlineInfo.alliance || 'Independent',
    aircraft: aircraftList[Math.floor(Math.random() * aircraftList.length)],
    onTimePerformance: Math.floor(75 + Math.random() * 20),
    carbonOffset: Math.round((apiPrice.duration / 60) * 50 + Math.random() * 30),
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
