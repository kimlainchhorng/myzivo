import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plane,
  Search,
  CalendarIcon,
  Users,
  ArrowRight,
  Clock,
  Luggage,
  Wifi,
  Coffee,
  Tv,
  ArrowLeftRight,
  Shield,
  Star,
  Sparkles,
  Globe,
  Zap,
  MapPin,
  TrendingUp,
  Leaf,
  Crown,
  Award,
  CalendarDays,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStepIndicator, BookingSummaryCard, CheckoutModal, BookingConfirmation } from "@/components/booking";
import { toast } from "sonner";
import FlightTicketCard from "@/components/flight/FlightTicketCard";
import AirlineLogosCarousel from "@/components/flight/AirlineLogosCarousel";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";
import PriceCalendar from "@/components/flight/PriceCalendar";
import FareClassSelector from "@/components/flight/FareClassSelector";
import PopularRoutes from "@/components/flight/PopularRoutes";
import FlexibleDatesCalendar from "@/components/flight/FlexibleDatesCalendar";
import flightHeroImage from "@/assets/flight-hero.jpg";
import airplaneCloudsImage from "@/assets/airplane-clouds.jpg";
import businessClassImage from "@/assets/flight-business-class.jpg";
import { premiumAirlines, fullServiceAirlines, lowCostAirlines, getAirlineLogo } from "@/data/airlines";
import { airports, searchAirports, getPopularAirports, formatAirportDisplay, popularRoutes, type Airport } from "@/data/airports";
import { generateFlights, getTrendingDestinations, fareClasses, type GeneratedFlight } from "@/data/flightGenerator";
import { useRealFlightSearch } from "@/hooks/useRealFlightSearch";

// Enhanced popular destinations with real airport data
const popularDestinations = [
  { city: "New York", code: "JFK", country: "USA", region: "North America", price: 299, trending: true, image: "🗽" },
  { city: "London", code: "LHR", country: "United Kingdom", region: "Europe", price: 449, trending: true, image: "🇬🇧" },
  { city: "Tokyo", code: "NRT", country: "Japan", region: "Asia", price: 699, trending: true, image: "🗼" },
  { city: "Paris", code: "CDG", country: "France", region: "Europe", price: 399, trending: true, image: "🗼" },
  { city: "Dubai", code: "DXB", country: "UAE", region: "Middle East", price: 549, trending: true, image: "🏙️" },
  { city: "Sydney", code: "SYD", country: "Australia", region: "Oceania", price: 899, trending: false, image: "🌉" },
  { city: "Singapore", code: "SIN", country: "Singapore", region: "Asia", price: 749, trending: true, image: "🏛️" },
  { city: "Barcelona", code: "BCN", country: "Spain", region: "Europe", price: 379, trending: false, image: "⛪" },
  { city: "Bali", code: "DPS", country: "Indonesia", region: "Asia", price: 649, trending: true, image: "🏝️" },
  { city: "Seoul", code: "ICN", country: "South Korea", region: "Asia", price: 599, trending: true, image: "🏯" },
  { city: "Miami", code: "MIA", country: "USA", region: "North America", price: 199, trending: false, image: "🌴" },
  { city: "Rome", code: "FCO", country: "Italy", region: "Europe", price: 429, trending: true, image: "🏛️" },
];

// Use real airline data
const featuredAirlines = [
  ...premiumAirlines.slice(0, 5),
  ...fullServiceAirlines.slice(0, 5),
];

// Trending destinations from generator
const trendingDestinations = getTrendingDestinations();

// Extended sample flights with comprehensive real data
const sampleFlights = [
  {
    id: 1,
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    flightNumber: "SQ-26",
    departure: { time: "08:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "16:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 459,
    businessPrice: 2450,
    firstPrice: 8900,
    class: "Economy",
    amenities: ["wifi", "entertainment", "meals", "power", "lounge"],
    seatsLeft: 5,
    category: "premium" as const,
    alliance: "Star Alliance",
    aircraft: "Airbus A380-800",
    onTimePerformance: 92,
    carbonOffset: 184,
  },
  {
    id: 2,
    airline: "Emirates",
    airlineCode: "EK",
    flightNumber: "EK-202",
    departure: { time: "10:15", city: "Los Angeles", code: "LAX" },
    arrival: { time: "19:00", city: "New York", code: "JFK" },
    duration: "5h 45m",
    stops: 0,
    price: 549,
    businessPrice: 3200,
    firstPrice: 12500,
    class: "Business",
    amenities: ["wifi", "entertainment", "meals", "lounge", "shower", "bar"],
    seatsLeft: 3,
    category: "premium" as const,
    alliance: "Independent",
    aircraft: "Boeing 777-300ER",
    onTimePerformance: 89,
    carbonOffset: 195,
  },
  {
    id: 3,
    airline: "Delta Air Lines",
    airlineCode: "DL",
    flightNumber: "DL-890",
    departure: { time: "06:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "14:15", city: "New York", code: "JFK" },
    duration: "5h 15m",
    stops: 0,
    price: 299,
    businessPrice: 1450,
    class: "Economy",
    amenities: ["wifi", "entertainment", "meals"],
    seatsLeft: 12,
    category: "full-service" as const,
    alliance: "SkyTeam",
    aircraft: "Boeing 757-200",
    onTimePerformance: 86,
    carbonOffset: 165,
  },
  {
    id: 4,
    airline: "Qatar Airways",
    airlineCode: "QR",
    flightNumber: "QR-7731",
    departure: { time: "23:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "07:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 529,
    businessPrice: 2890,
    class: "Business",
    amenities: ["wifi", "entertainment", "meals", "lounge", "bar"],
    seatsLeft: 4,
    category: "premium" as const,
    alliance: "Oneworld",
    aircraft: "Airbus A350-1000",
    onTimePerformance: 91,
    carbonOffset: 178,
  },
  {
    id: 5,
    airline: "JetBlue Airways",
    airlineCode: "B6",
    flightNumber: "B6-422",
    departure: { time: "11:30", city: "Los Angeles", code: "LAX" },
    arrival: { time: "19:50", city: "New York", code: "JFK" },
    duration: "5h 20m",
    stops: 0,
    price: 189,
    businessPrice: 899,
    class: "Economy",
    amenities: ["wifi", "entertainment", "snacks"],
    seatsLeft: 24,
    category: "full-service" as const,
    alliance: "Independent",
    aircraft: "Airbus A321LR",
    onTimePerformance: 80,
    carbonOffset: 155,
  },
  {
    id: 6,
    airline: "ANA",
    airlineCode: "NH",
    flightNumber: "NH-105",
    departure: { time: "23:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "06:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 529,
    businessPrice: 2650,
    firstPrice: 9500,
    class: "Premium Economy",
    amenities: ["wifi", "entertainment", "meals", "power"],
    seatsLeft: 6,
    category: "premium" as const,
    alliance: "Star Alliance",
    aircraft: "Boeing 787-9 Dreamliner",
    onTimePerformance: 94,
    carbonOffset: 172,
  },
  {
    id: 7,
    airline: "American Airlines",
    airlineCode: "AA",
    flightNumber: "AA-1123",
    departure: { time: "07:30", city: "Los Angeles", code: "LAX" },
    arrival: { time: "15:50", city: "New York", code: "JFK" },
    duration: "5h 20m",
    stops: 0,
    price: 279,
    businessPrice: 1380,
    class: "Economy",
    amenities: ["wifi", "entertainment", "power"],
    seatsLeft: 18,
    category: "full-service" as const,
    alliance: "Oneworld",
    aircraft: "Airbus A321neo",
    onTimePerformance: 82,
    carbonOffset: 158,
  },
  {
    id: 8,
    airline: "United Airlines",
    airlineCode: "UA",
    flightNumber: "UA-2456",
    departure: { time: "09:45", city: "Los Angeles", code: "LAX" },
    arrival: { time: "18:05", city: "New York", code: "JFK" },
    duration: "5h 20m",
    stops: 0,
    price: 289,
    businessPrice: 1520,
    class: "Economy",
    amenities: ["wifi", "entertainment", "meals", "power"],
    seatsLeft: 9,
    category: "full-service" as const,
    alliance: "Star Alliance",
    aircraft: "Boeing 787-9",
    onTimePerformance: 84,
    carbonOffset: 172,
  },
  {
    id: 9,
    airline: "Alaska Airlines",
    airlineCode: "AS",
    flightNumber: "AS-1089",
    departure: { time: "14:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "22:25", city: "New York", code: "JFK" },
    duration: "5h 25m",
    stops: 0,
    price: 229,
    businessPrice: 1150,
    class: "Economy",
    amenities: ["wifi", "entertainment", "snacks", "power"],
    seatsLeft: 15,
    category: "full-service" as const,
    alliance: "Oneworld",
    aircraft: "Boeing 737 MAX 9",
    onTimePerformance: 88,
    carbonOffset: 148,
  },
  {
    id: 10,
    airline: "Delta Air Lines",
    airlineCode: "DL",
    flightNumber: "DL-1567",
    departure: { time: "05:30", city: "Los Angeles", code: "LAX" },
    arrival: { time: "16:45", city: "New York", code: "JFK" },
    duration: "8h 15m",
    stops: 1,
    stopCities: ["Atlanta"],
    price: 199,
    businessPrice: 980,
    class: "Economy",
    amenities: ["wifi", "entertainment"],
    seatsLeft: 28,
    category: "full-service" as const,
    alliance: "SkyTeam",
    aircraft: "Boeing 737-900",
    onTimePerformance: 78,
    carbonOffset: 210,
  },
  {
    id: 11,
    airline: "Southwest Airlines",
    airlineCode: "WN",
    flightNumber: "WN-2341",
    departure: { time: "16:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "00:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 149,
    class: "Economy",
    amenities: ["snacks"],
    seatsLeft: 42,
    category: "low-cost" as const,
    alliance: "Independent",
    aircraft: "Boeing 737 MAX 8",
    onTimePerformance: 75,
    carbonOffset: 152,
  },
  {
    id: 12,
    airline: "Cathay Pacific",
    airlineCode: "CX",
    flightNumber: "CX-880",
    departure: { time: "20:00", city: "Los Angeles", code: "LAX" },
    arrival: { time: "04:30", city: "New York", code: "JFK" },
    duration: "5h 30m",
    stops: 0,
    price: 489,
    businessPrice: 2750,
    firstPrice: 9200,
    class: "Premium Economy",
    amenities: ["wifi", "entertainment", "meals", "power", "lounge"],
    seatsLeft: 7,
    category: "premium" as const,
    alliance: "Oneworld",
    aircraft: "Airbus A350-900",
    onTimePerformance: 90,
    carbonOffset: 176,
  },
];

type BookingStep = "search" | "select" | "details" | "confirmation";

type Flight = GeneratedFlight | typeof sampleFlights[0];
const FlightBooking = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [fromCity, setFromCity] = useState("Los Angeles (LAX)");
  const [toCity, setToCity] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [searchResults, setSearchResults] = useState<GeneratedFlight[] | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<GeneratedFlight | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>("search");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [recentSearches] = useState<string[]>(["New York (JFK)", "London (LHR)", "Tokyo (NRT)"]);
  const [isSearching, setIsSearching] = useState(false);

  // Extract airport codes for price calendar
  const fromMatch = fromCity.match(/\(([A-Z]{3})\)/);
  const toMatch = toCity.match(/\(([A-Z]{3})\)/);
  const fromCode = fromMatch ? fromMatch[1] : 'LAX';
  const toCode = toMatch ? toMatch[1] : 'JFK';

  // Real flight search hook
  const { 
    data: realFlights, 
    isLoading: isLoadingRealFlights,
    refetch: refetchRealFlights 
  } = useRealFlightSearch({
    origin: fromCode,
    destination: toCode,
    departureDate: departDate ? format(departDate, 'yyyy-MM-dd') : undefined,
    returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
    enabled: false, // Manual trigger
  });

  const bookingSteps = [
    { id: "search", label: "Search" },
    { id: "select", label: "Select" },
    { id: "details", label: "Book" },
  ];

  const getCurrentStepIndex = () => {
    switch (bookingStep) {
      case "search": return 0;
      case "select": return 1;
      case "details": return 2;
      default: return 0;
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Extract airport codes from input
    const fromMatchLocal = fromCity.match(/\(([A-Z]{3})\)/);
    const toMatchLocal = toCity.match(/\(([A-Z]{3})\)/);
    
    const searchFromCode = fromMatchLocal ? fromMatchLocal[1] : 'LAX';
    const searchToCode = toMatchLocal ? toMatchLocal[1] : 'JFK';
    
    try {
      // Try to fetch real flights first
      const result = await refetchRealFlights();
      
      if (result.data && result.data.length > 0) {
        // Use real flight data from API
        setSearchResults(result.data);
        toast.success(`Found ${result.data.length} flights with real prices`);
      } else {
        // Fallback to generated flights
        const flights = generateFlights(searchFromCode, searchToCode, departDate, 18);
        
        if (flights.length > 0) {
          setSearchResults(flights);
          toast.info('Showing estimated prices for this route');
        } else {
          // Fallback to sample flights
          setSearchResults(sampleFlights.map(f => ({
            ...f,
            id: String(f.id),
            logo: getAirlineLogo(f.airlineCode),
            baggageIncluded: '1 × 23kg checked',
            refundable: false,
            wifi: f.amenities.includes('wifi'),
            entertainment: f.amenities.includes('entertainment'),
            meals: f.amenities.includes('meals'),
            legroom: '31"'
          })) as GeneratedFlight[]);
        }
      }
      
      setBookingStep("select");
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to generated flights on error
      const flights = generateFlights(searchFromCode, searchToCode, departDate, 18);
      setSearchResults(flights.length > 0 ? flights : null);
      setBookingStep("select");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFlight = (flight: GeneratedFlight) => {
    setSelectedFlight(flight);
    setBookingStep("details");
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setConfirmationNumber(`ZV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setBookingStep("confirmation");
  };

  const handleReset = () => {
    setSearchResults(null);
    setSelectedFlight(null);
    setBookingStep("search");
    navigate("/book-flight");
  };

  const totalPrice = selectedFlight ? selectedFlight.price * parseInt(passengers) : 0;
  const taxes = totalPrice * 0.12;
  const grandTotal = totalPrice + taxes;

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "entertainment": return <Tv className="w-4 h-4" />;
      case "meals": return <Coffee className="w-4 h-4" />;
      case "lounge": return <Luggage className="w-4 h-4" />;
      default: return null;
    }
  };

  // Show confirmation screen
  if (bookingStep === "confirmation" && selectedFlight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BookingConfirmation
          confirmationNumber={confirmationNumber}
          title="Your flight is booked!"
          subtitle={`${selectedFlight.departure.city} → ${selectedFlight.arrival.city}`}
          details={[
            { label: "Flight", value: `${selectedFlight.airline} ${selectedFlight.flightNumber}`, icon: <Plane className="w-4 h-4" /> },
            { label: "Date", value: departDate ? format(departDate, "MMM d, yyyy") : "Selected date", icon: <CalendarIcon className="w-4 h-4" /> },
            { label: "Passengers", value: `${passengers} passenger${parseInt(passengers) > 1 ? 's' : ''}`, icon: <Users className="w-4 h-4" /> },
            { label: "Class", value: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1), icon: <Luggage className="w-4 h-4" /> },
          ]}
          totalAmount={grandTotal}
          onGoHome={handleReset}
          accentColor="sky"
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />
      
      <main className="pt-16 pb-20">
        {/* Hero Section with Professional Image */}
        <section className="relative min-h-[85vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={flightHeroImage} 
              alt="Airplane window view at sunset" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
          </div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-24 right-10 hidden lg:block animate-float">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center">
              <Plane className="w-8 h-8 text-sky-400" />
            </div>
          </div>
          <div className="absolute top-40 right-32 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-sky-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                ZIVO Flights — Premium Air Travel
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                Your journey to
                <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  anywhere starts here
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Compare prices from 500+ airlines worldwide. Book premium flights at the best prices with our exclusive deals.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[
                  { icon: Shield, text: "Free Cancellation" },
                  { icon: Star, text: "Best Price Guarantee" },
                  { icon: Clock, text: "24/7 Support" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-xl border border-border/50">
                    <item.icon className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Card */}
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.2s" }}>
              <Card className="overflow-hidden border-0 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-black/20">
                {/* Top accent line */}
                <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
                <CardContent className="p-6 sm:p-8">
                  {/* Trip Type Toggle */}
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setTripType("roundtrip")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tripType === "roundtrip"
                          ? "bg-sky-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Round Trip
                    </button>
                    <button
                      onClick={() => setTripType("oneway")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        tripType === "oneway"
                          ? "bg-sky-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      One Way
                    </button>
                  </div>

                  {/* Search Fields */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* From */}
                    <div className="relative">
                      <AirportAutocomplete
                        value={fromCity}
                        onChange={setFromCity}
                        label="From"
                        placeholder="City or airport"
                        recentSearches={recentSearches}
                        excludeCode={toCode}
                      />
                    </div>

                    {/* Swap Button */}
                    <button
                      onClick={swapCities}
                      className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors z-10"
                    >
                      <ArrowLeftRight className="w-5 h-5" />
                    </button>

                    {/* To */}
                    <div>
                      <AirportAutocomplete
                        value={toCity}
                        onChange={setToCity}
                        label="To"
                        placeholder="Where to?"
                        recentSearches={recentSearches}
                        excludeCode={fromCode}
                      />
                    </div>

                    {/* Departure Date */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Departure</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={departDate}
                            onSelect={setDepartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Return Date */}
                    {tripType === "roundtrip" && (
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Return</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-start bg-background/50">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {returnDate ? format(returnDate, "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={returnDate}
                              onSelect={setReturnDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  {/* Passengers & Class */}
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Passengers</label>
                      <Select value={passengers} onValueChange={setPassengers}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Users className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4 Passengers</SelectItem>
                          <SelectItem value="5">5+ Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <label className="text-sm text-muted-foreground mb-1 block">Class</label>
                      <Select value={cabinClass} onValueChange={setCabinClass}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="h-12 px-8 bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Search Flights
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Price Calendar Toggle */}
                  {toCity && (
                    <div className="pt-4 border-t border-border/30">
                      <button
                        onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                        className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-400 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4" />
                        {showPriceCalendar ? 'Hide' : 'View'} Price Calendar
                        <Badge variant="outline" className="text-[10px] border-sky-500/40 text-sky-400">
                          <Sparkles className="w-2.5 h-2.5 mr-1" />
                          Find lowest fares
                        </Badge>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Calendar */}
              {showPriceCalendar && toCity && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <PriceCalendar
                    basePrice={299}
                    selectedDate={departDate}
                    onSelectDate={(date) => {
                      setDepartDate(date);
                      setShowPriceCalendar(false);
                    }}
                    fromCode={fromCode}
                    toCode={toCode}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search Results */}
        {searchResults && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    {searchResults.length} flights found
                    {searchResults[0]?.bookingLink && (
                      <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Real Prices
                      </Badge>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {fromCity.split(' (')[0]} → {toCity.split(' (')[0]} • {departDate ? format(departDate, 'MMM d, yyyy') : 'Select date'}
                  </p>
                </div>
                <Select defaultValue="price">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="duration">Shortest Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                    <SelectItem value="rating">Best Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fare Class Quick Filter */}
              <div className="mb-6">
                <FareClassSelector
                  selectedFare={cabinClass}
                  onSelectFare={setCabinClass}
                  basePrice={searchResults[0]?.price || 299}
                  compact
                />
              </div>

              <div className="space-y-4">
                {searchResults.map((flight, index) => (
                  <div
                    key={flight.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <FlightTicketCard
                      flight={{
                        ...flight,
                        id: String(flight.id),
                        flightNumber: flight.flightNumber,
                        isLowest: index === 0,
                        isFastest: flight.stops === 0 && parseFloat(flight.duration) < 5.5,
                        co2: flight.carbonOffset ? `${flight.carbonOffset}kg` : `${120 + index * 15}kg`,
                      }}
                      onSelect={() => handleSelectFlight(flight)}
                      isSelected={selectedFlight?.id === flight.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Routes with Live Pricing */}
        {!searchResults && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <PopularRoutes
                onSelectRoute={(from, to, price) => {
                  const fromAirport = airports.find(a => a.code === from);
                  const toAirport = airports.find(a => a.code === to);
                  setFromCity(fromAirport ? `${fromAirport.city} (${fromAirport.code})` : `${from}`);
                  setToCity(toAirport ? `${toAirport.city} (${toAirport.code})` : `${to}`);
                  if (price) {
                    toast.success(`Selected route with live price: $${price}`);
                  }
                }}
              />
            </div>
          </section>
        )}

        {/* Flexible Dates Calendar */}
        {!searchResults && fromCity && toCity && (
          <section className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4">
              <FlexibleDatesCalendar
                origin={fromCode}
                destination={toCode}
                basePrice={299}
                onSelectDate={(date, price) => {
                  setDepartDate(date);
                  toast.success(`Selected ${format(date, 'MMM d')} - $${price} fare`);
                }}
                className="max-w-3xl mx-auto"
              />
            </div>
          </section>
        )}

        {/* Popular Destinations */}
        {!searchResults && (
          <section className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Popular Destinations</h2>
                <Badge variant="outline" className="text-sky-400 border-sky-400/50">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Prices
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularDestinations.map((dest, index) => (
                  <div
                    key={dest.code}
                    onClick={() => setToCity(`${dest.city} (${dest.code})`)}
                    className="cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 touch-manipulation active:scale-[0.98]"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <Card className="glass-card hover:border-sky-500/50 transition-all group overflow-hidden relative">
                      {dest.trending && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                            <MapPin className="w-8 h-8 text-sky-400" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-display font-semibold text-lg">{dest.city}</h3>
                            <p className="text-sm text-muted-foreground">{dest.country} • {dest.code}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sky-400 font-bold">From ${dest.price}</p>
                              <span className="text-xs text-muted-foreground">round trip</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground mr-4 group-hover:text-sky-400 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Airline Partners Carousel */}
        {!searchResults && (
          <section className="py-12 border-t border-border/50">
            <div className="container mx-auto px-4">
              <AirlineLogosCarousel />
            </div>
          </section>
        )}
      </main>

      {/* Selected Flight Summary Sidebar */}
      {selectedFlight && bookingStep === "details" && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <BookingSummaryCard
            title={`${selectedFlight.departure.code} → ${selectedFlight.arrival.code}`}
            subtitle={`${selectedFlight.airline} • ${selectedFlight.flightNumber}`}
            icon={<Plane className="w-5 h-5" />}
            items={[
              { label: `${passengers} × Flight Ticket`, amount: totalPrice },
              { label: "Taxes & Fees", amount: taxes },
              { label: "Total", amount: grandTotal, isTotal: true },
            ]}
            ctaLabel={`Book for $${grandTotal.toFixed(0)}`}
            onConfirm={() => setIsCheckoutOpen(true)}
            accentColor="sky"
            features={["Free Cancellation", "Seat Selection"]}
            estimatedTime={`${selectedFlight.duration} flight`}
          />
          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={() => {
              setSelectedFlight(null);
              setBookingStep("select");
            }}
          >
            Choose Different Flight
          </Button>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        amount={grandTotal}
        serviceName={`${selectedFlight?.airline} ${selectedFlight?.flightNumber}`}
        serviceDetails={`${selectedFlight?.departure.city} → ${selectedFlight?.arrival.city} • ${passengers} passenger${parseInt(passengers) > 1 ? 's' : ''}`}
        onConfirm={handleConfirmBooking}
        isProcessing={isProcessing}
        accentColor="sky"
      />

      <Footer />
    </div>
  );
};


export default FlightBooking;
