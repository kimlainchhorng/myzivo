import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { toast } from "sonner";
import FlightSearchHero from "@/components/flight/FlightSearchHero";
import FlightResultsSection from "@/components/flight/FlightResultsSection";
import FlightDiscoverySections from "@/components/flight/FlightDiscoverySections";
import { TrendingDestinationsSection } from "@/components/flight/TrendingDestinationsSection";
import FlightStatsBar from "@/components/flight/FlightStatsBar";
import FlightPromoSection from "@/components/flight/FlightPromoSection";
import FlightTestimonialsSection from "@/components/flight/FlightTestimonialsSection";
import FlightFeaturedDestinations from "@/components/flight/FlightFeaturedDestinations";
import FlightTrustIndicators from "@/components/flight/FlightTrustIndicators";
import FlightPremiumExperience from "@/components/flight/FlightPremiumExperience";
import FlightAlertsPromo from "@/components/flight/FlightAlertsPromo";
import FlightDealsCarousel from "@/components/flight/FlightDealsCarousel";
import FlightAirlinePartners from "@/components/flight/FlightAirlinePartners";
import FlightPopularRoutes from "@/components/flight/FlightPopularRoutes";
import FlightMobileAppPromo from "@/components/flight/FlightMobileAppPromo";
import FlightNewsletterSection from "@/components/flight/FlightNewsletterSection";
import FlightFAQSection from "@/components/flight/FlightFAQSection";
import FlightPriceCalendar from "@/components/flight/FlightPriceCalendar";
import FlightSavingsStats from "@/components/flight/FlightSavingsStats";
import FlightLoyaltyProgram from "@/components/flight/FlightLoyaltyProgram";
import FlightSocialProof from "@/components/flight/FlightSocialProof";
import FlightPriceGuarantee from "@/components/flight/FlightPriceGuarantee";
import FlightCompareWidget from "@/components/flight/FlightCompareWidget";
import FlightSeasonalDeals from "@/components/flight/FlightSeasonalDeals";
import FlightBaggageGuide from "@/components/flight/FlightBaggageGuide";
import FlightAirportGuide from "@/components/flight/FlightAirportGuide";
import FlightClassComparison from "@/components/flight/FlightClassComparison";
import FlightBookingTips from "@/components/flight/FlightBookingTips";
import FlightDestinationInspiration from "@/components/flight/FlightDestinationInspiration";
import FlightBundleDeals from "@/components/flight/FlightBundleDeals";
import FlightCustomerSupport from "@/components/flight/FlightCustomerSupport";
import FlightCorporateSection from "@/components/flight/FlightCorporateSection";
import FlightAccessibility from "@/components/flight/FlightAccessibility";
import FlightCarbonOffset from "@/components/flight/FlightCarbonOffset";
import FlightFlashSale from "@/components/flight/FlightFlashSale";
import FlightSeatMap from "@/components/flight/FlightSeatMap";
import FlightBaggageOptions from "@/components/flight/FlightBaggageOptions";
import FlightMealPreorder from "@/components/flight/FlightMealPreorder";
import FlightInsuranceUpsell from "@/components/flight/FlightInsuranceUpsell";
import FlightTravelTips from "@/components/flight/FlightTravelTips";
import FlightPriceHistory from "@/components/flight/FlightPriceHistory";
import FlightAirportInfo from "@/components/flight/FlightAirportInfo";
import FlightDelayPredictor from "@/components/flight/FlightDelayPredictor";
import FlightLoungeAccess from "@/components/flight/FlightLoungeAccess";
import FlightVisaChecker from "@/components/flight/FlightVisaChecker";
import LiveChatWidget from "@/components/shared/LiveChatWidget";
import LocalExperiences from "@/components/shared/LocalExperiences";
import MobileAppBanner from "@/components/shared/MobileAppBanner";
import PromoCodeBanner from "@/components/shared/PromoCodeBanner";
import TravelBlog from "@/components/shared/TravelBlog";
import DestinationGuides from "@/components/shared/DestinationGuides";
import TravelCalendar from "@/components/shared/TravelCalendar";
import UserTestimonials from "@/components/shared/UserTestimonials";
import AppFeatures from "@/components/shared/AppFeatures";
import WeatherWidget from "@/components/shared/WeatherWidget";
import PackingList from "@/components/shared/PackingList";
import TripPlanner from "@/components/shared/TripPlanner";
import EmergencyContacts from "@/components/shared/EmergencyContacts";
import CurrencyConverter from "@/components/shared/CurrencyConverter";
import TimeZoneConverter from "@/components/shared/TimeZoneConverter";
import TravelInsuranceCompare from "@/components/shared/TravelInsuranceCompare";
import FlightSocialShare from "@/components/flight/FlightSocialShare";
import FlightReviewsWidget from "@/components/flight/FlightReviewsWidget";
import SocialProofTicker from "@/components/shared/SocialProofTicker";
import FAQAccordion from "@/components/shared/FAQAccordion";
import RewardsProgress from "@/components/shared/RewardsProgress";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import TripFlowConnector from "@/components/shared/TripFlowConnector";
import ServiceRecommendations from "@/components/shared/ServiceRecommendations";
import CrossSellBanner from "@/components/shared/CrossSellBanner";
import SmartSuggestions from "@/components/shared/SmartSuggestions";
import ServiceFlowHub from "@/components/shared/ServiceFlowHub";

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
            {/* Trip Flow Connector - Workflow */}
            <section className="py-8 border-t border-border/50">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <div className="lg:col-span-2">
                    <SmartSuggestions context="flight" />
                  </div>
                  <TripFlowConnector 
                    destination={toCity.split(" (")[0] || undefined} 
                    currentStep="flight" 
                  />
                </div>
              </div>
            </section>

            {/* Cross-Sell Banner */}
            <section className="py-4">
              <div className="container mx-auto px-4 max-w-4xl">
                <CrossSellBanner currentService="flight" destination={toCity.split(" (")[0] || undefined} />
              </div>
            </section>

            {/* Stats Bar - Social Proof */}
            <FlightStatsBar />

            {/* Flash Sale - Urgency */}
            <FlightFlashSale />

            {/* Featured Destinations - Discovery */}
            <FlightFeaturedDestinations
              onSelectDestination={(city, code) => setToCity(`${city} (${code})`)}
            />

            {/* Promo Codes - Conversion */}
            <PromoCodeBanner />

            {/* Flash Deals Carousel */}
            <FlightDealsCarousel
              onSelect={(from, to) => {
                setFromCity(`(${from})`);
                setToCity(`(${to})`);
              }}
            />

            {/* Discovery Sections */}
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

            {/* Bundle Deals - Upsell */}
            <FlightBundleDeals />

            {/* Trending Destinations */}
            <TrendingDestinationsSection
              onSelectDestination={(city, code) => setToCity(`${city} (${code})`)}
            />

            {/* Popular Routes */}
            <FlightPopularRoutes
              onSelect={(from, to) => {
                setFromCity(`(${from})`);
                setToCity(`(${to})`);
              }}
            />

            {/* Seasonal Deals */}
            <FlightSeasonalDeals />

            {/* Price Calendar */}
            <FlightPriceCalendar 
              onSelectDate={(date) => {
                const parsedDate = new Date(date);
                setDepartDate(parsedDate);
                toast.success(`Selected ${format(parsedDate, "MMM d, yyyy")}`);
              }}
            />

            {/* Airline Partners */}
            <FlightAirlinePartners />

            {/* Loyalty Program */}
            <FlightLoyaltyProgram />

            {/* Social Proof */}
            <FlightSocialProof />

            {/* Savings Stats */}
            <FlightSavingsStats />

            {/* Carbon Offset - Sustainability */}
            <FlightCarbonOffset />

            {/* Premium Experience */}
            <FlightPremiumExperience />

            {/* Class Comparison */}
            <FlightClassComparison />

            {/* Price Guarantee */}
            <FlightPriceGuarantee />

            {/* Promo Section */}
            <FlightPromoSection 
              onPromoClick={(code) => {
                toast.success(`Promo code ${code} copied to clipboard!`);
              }}
            />

            {/* Compare Widget */}
            <FlightCompareWidget />

            {/* Seat Map Preview */}
            <FlightSeatMap />

            {/* Baggage Options */}
            <FlightBaggageOptions />

            {/* Meal Pre-order */}
            <FlightMealPreorder />

            {/* Insurance Upsell */}
            <FlightInsuranceUpsell />

            {/* Baggage Guide */}
            <FlightBaggageGuide />

            {/* Airport Guide */}
            <FlightAirportGuide />

            {/* Airport Info */}
            <FlightAirportInfo />

            {/* Price History */}
            <FlightPriceHistory />

            {/* Delay Predictor */}
            <FlightDelayPredictor />

            {/* Lounge Access */}
            <FlightLoungeAccess />

            {/* Visa Checker */}
            <FlightVisaChecker />

            {/* Currency Converter */}
            <CurrencyConverter />

            {/* Time Zone Converter */}
            <TimeZoneConverter />

            {/* Travel Insurance Compare */}
            <TravelInsuranceCompare />

            {/* Weather Widget */}
            <WeatherWidget />

            {/* Booking Tips */}
            <FlightBookingTips />

            {/* Travel Tips */}
            <FlightTravelTips />

            {/* Trip Planner */}
            <TripPlanner />

            {/* Packing List */}
            <PackingList />

            {/* Emergency Contacts */}
            <EmergencyContacts />

            {/* Travel Calendar */}
            <TravelCalendar />

            {/* Destination Guides */}
            <DestinationGuides />

            {/* Destination Inspiration */}
            <FlightDestinationInspiration />

            {/* Local Experiences */}
            <LocalExperiences />

            {/* Travel Blog */}
            <TravelBlog />

            {/* Social Share */}
            <FlightSocialShare />

            {/* Reviews Widget */}
            <FlightReviewsWidget />

            {/* Rewards Progress */}
            <RewardsProgress />

            {/* Accessibility */}
            <FlightAccessibility />

            {/* Service Flow Hub - Complete Journey */}
            <section className="py-12 border-t border-border/50">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  <ServiceFlowHub currentService="flight" />
                  <ServiceRecommendations context="flight" destination={toCity.split(" (")[0] || undefined} />
                </div>
              </div>
            </section>

            {/* Corporate Section */}
            <FlightCorporateSection />

            {/* Customer Support */}
            <FlightCustomerSupport />

            {/* Price Alerts Promo */}
            <FlightAlertsPromo onSetAlert={() => toast.success("Price alert feature coming soon!")} />

            {/* App Features */}
            <AppFeatures />

            {/* Mobile App Banner */}
            <MobileAppBanner />

            {/* Newsletter Section */}
            <FlightNewsletterSection />

            {/* FAQ Section */}
            <FlightFAQSection />

            {/* User Testimonials */}
            <UserTestimonials />

            {/* Mobile App Promo */}
            <FlightMobileAppPromo />

            {/* Testimonials Section */}
            <FlightTestimonialsSection />

            {/* Trust Indicators */}
            <FlightTrustIndicators />
          </>
        )}

        {/* Live Chat Widget */}
        <LiveChatWidget />
        
        {/* Social Proof Ticker */}
        <SocialProofTicker />
        
        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </main>

      <Footer />
    </div>
  );
};

export default FlightBooking;
