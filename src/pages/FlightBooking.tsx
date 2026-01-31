import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { toast } from "sonner";
import FlightSearchHero from "@/components/flight/FlightSearchHero";
import FlightResultsSection from "@/components/flight/FlightResultsSection";
import FlightDiscoverySections from "@/components/flight/FlightDiscoverySections";
import TravelBundleCard from "@/components/flight/TravelBundleCard";
import { TrendingDestinationsSection } from "@/components/flight/TrendingDestinationsSection";
import FlightStatsBar from "@/components/flight/FlightStatsBar";
import FlightPromoSection from "@/components/flight/FlightPromoSection";
import FlightTestimonialsSection from "@/components/flight/FlightTestimonialsSection";
import FlightFeaturedDestinations from "@/components/flight/FlightFeaturedDestinations";
import FlightQuickActions from "@/components/flight/FlightQuickActions";
import FlightTrustIndicators from "@/components/flight/FlightTrustIndicators";
import FlightPremiumExperience from "@/components/flight/FlightPremiumExperience";
import FlightAlertsPromo from "@/components/flight/FlightAlertsPromo";

import { generateFlights, type GeneratedFlight } from "@/data/flightGenerator";
import { useRealFlightSearch } from "@/hooks/useRealFlightSearch";

type BookingStep = "search" | "select";

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
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLoyaltyProgram, setSelectedLoyaltyProgram] = useState<string | null>(null);
  const [recentSearches] = useState<string[]>(["New York (JFK)", "London (LHR)", "Tokyo (NRT)"]);

  // Extract airport codes
  const fromMatch = fromCity.match(/\(([A-Z]{3})\)/);
  const toMatch = toCity.match(/\(([A-Z]{3})\)/);
  const fromCode = fromMatch ? fromMatch[1] : "LAX";
  const toCode = toMatch ? toMatch[1] : "JFK";

  // Real flight search hook
  const { refetch: refetchRealFlights } = useRealFlightSearch({
    origin: fromCode,
    destination: toCode,
    departureDate: departDate ? format(departDate, "yyyy-MM-dd") : undefined,
    returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
    enabled: false,
  });

  const handleSearch = async () => {
    setIsSearching(true);
    const searchFromCode = fromCode;
    const searchToCode = toCode;

    try {
      const result = await refetchRealFlights();
      const realFlightsData = result.data || [];
      const generatedFlights = generateFlights(searchFromCode, searchToCode, departDate, 12);

      const combinedFlights: GeneratedFlight[] = [];

      if (realFlightsData.length > 0) {
        combinedFlights.push(...realFlightsData);
      }

      const realAirlineCodes = new Set(realFlightsData.map((f: GeneratedFlight) => f.airlineCode));
      const uniqueGenerated = generatedFlights.filter((f) => !realAirlineCodes.has(f.airlineCode));

      if (uniqueGenerated.length > 0) {
        combinedFlights.push(...uniqueGenerated);
      }

      combinedFlights.sort((a, b) => a.price - b.price);

      if (combinedFlights.length > 0) {
        setSearchResults(combinedFlights);
        const realCount = realFlightsData.length;
        if (realCount > 0) {
          toast.success(`Found ${combinedFlights.length} flights (${realCount} with live prices)`);
        } else {
          toast.info(`Showing ${combinedFlights.length} estimated flights for this route`);
        }
      } else {
        const fallback = generateFlights(searchFromCode, searchToCode, departDate, 18);
        setSearchResults(fallback.length > 0 ? fallback : null);
        toast.info("Showing sample flights for this route");
      }

      setBookingStep("select");
    } catch (error) {
      console.error("Search error:", error);
      const flights = generateFlights(searchFromCode, searchToCode, departDate, 18);
      setSearchResults(flights.length > 0 ? flights : null);
      setBookingStep("select");
      toast.error("Could not fetch live prices. Showing estimated flights.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFlight = (flight: GeneratedFlight) => {
    // User selected a flight - they will be redirected via the modal
    setSelectedFlight(flight);
    // Track affiliate click (would normally send to analytics)
    console.log('Affiliate click tracked for flight:', flight.airline, flight.flightNumber);
  };

  const handleReset = () => {
    setSearchResults(null);
    setSelectedFlight(null);
    setBookingStep("search");
    navigate("/book-flight");
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />

      <main className="pt-16 pb-20">
        {/* Hero Section with Search */}
        <FlightSearchHero
          tripType={tripType}
          setTripType={setTripType}
          fromCity={fromCity}
          setFromCity={setFromCity}
          toCity={toCity}
          setToCity={setToCity}
          departDate={departDate}
          setDepartDate={setDepartDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          passengers={passengers}
          setPassengers={setPassengers}
          cabinClass={cabinClass}
          setCabinClass={setCabinClass}
          onSearch={handleSearch}
          isSearching={isSearching}
          recentSearches={recentSearches}
        />

        {/* Search Results */}
        {searchResults && (
          <FlightResultsSection
            searchResults={searchResults}
            fromCity={fromCity}
            toCity={toCity}
            fromCode={fromCode}
            toCode={toCode}
            departDate={departDate}
            passengers={passengers}
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
            onSelectFlight={handleSelectFlight}
            selectedFlight={selectedFlight}
          />
        )}

        {/* Discovery Sections (shown when no search results) */}
        {!searchResults && (
          <>
            {/* Stats Bar */}
            <FlightStatsBar />

            {/* Featured Destinations */}
            <FlightFeaturedDestinations
              onSelectDestination={(city, code) => setToCity(`${city} (${code})`)}
            />

            {/* Promo Section */}
            <FlightPromoSection 
              onPromoClick={(code) => {
                toast.success(`Promo code ${code} copied to clipboard!`);
              }}
            />


            <FlightDiscoverySections
              fromCity={fromCity}
              toCity={toCity}
              fromCode={fromCode}
              toCode={toCode}
              departDate={departDate}
              returnDate={returnDate}
              passengers={passengers}
              setFromCity={setFromCity}
              setToCity={setToCity}
              setDepartDate={setDepartDate}
              setPassengers={setPassengers}
              setSelectedLoyaltyProgram={setSelectedLoyaltyProgram}
            />

            {/* Trending Destinations */}
            <TrendingDestinationsSection
              onSelectDestination={(city, code) => setToCity(`${city} (${code})`)}
            />

            {/* Premium Experience */}
            <FlightPremiumExperience />

            {/* Price Alerts Promo */}
            <FlightAlertsPromo onSetAlert={() => toast.success("Price alert feature coming soon!")} />

            {/* Testimonials Section */}
            <FlightTestimonialsSection />

            {/* Trust Indicators */}
            <FlightTrustIndicators />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FlightBooking;
