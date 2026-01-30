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

// Map airline code to full airline info
const getAirlineInfo = (code: string) => {
  const airline = allAirlines.find(a => a.code === code);
  return airline || {
    code,
    name: code,
    category: 'full-service' as const,
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
  
  // Calculate prices for other classes
  const economyPrice = apiPrice.price;
  const businessPrice = Math.round(economyPrice * 3.5);
  const firstPrice = airlineInfo.category === 'premium' ? Math.round(economyPrice * 8) : undefined;
  
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
  
  const category = airlineInfo.category || 'full-service';
  const aircraftList = aircraftByCategory[category];
  
  return {
    id: `${apiPrice.airline}-${Date.now()}-${index}`,
    airline: airlineInfo.name,
    airlineCode: apiPrice.airline,
    flightNumber: `${apiPrice.airline}-${apiPrice.flightNumber}`,
    departure: {
      time: depTimeStr,
      city: fromAirport?.city || fromCode,
      code: fromCode,
      terminal: ['1', '2', '3', 'A', 'B', 'C'][Math.floor(Math.random() * 6)]
    },
    arrival: {
      time: arrTimeStr,
      city: toAirport?.city || toCode,
      code: toCode,
      terminal: ['1', '2', '3', 'A', 'B', 'C'][Math.floor(Math.random() * 6)]
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
    bookingLink: `https://www.aviasales.com${apiPrice.link}`,
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
      const { data, error } = await supabase.functions.invoke('get-flight-prices', {
        body: { origin, destination, departureDate, returnDate, currency },
      });

      if (error) {
        console.error('Error fetching real flights:', error);
        throw error;
      }

      if (!data?.success || !data?.prices?.length) {
        console.log('No real prices available, will use generated flights');
        return [];
      }

      // Transform API data to GeneratedFlight format
      const flights = data.prices.map((price: TravelpayoutsPrice, index: number) => 
        transformToGeneratedFlight(price, index, origin, destination)
      );

      console.log(`Loaded ${flights.length} real flights from API`);
      return flights;
    },
    enabled: enabled && !!origin && !!destination && origin.length === 3 && destination.length === 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
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
    isError: isRealError 
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
    hasRealPrices: (realFlights?.length || 0) > 0,
  };
}
