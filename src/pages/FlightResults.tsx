/**
 * Flight Results Page - Duffel MoR Integration
 * Uses Duffel API for real flight search with exact pricing
 * ZIVO is Merchant of Record - no affiliate redirects
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useDuffelFlightSearch, type DuffelOffer } from "@/hooks/useDuffelFlights";
import { useFlightFilters, defaultFlightFilters } from "@/hooks/useResultsFilters";
import { getAirlineLogo } from "@/data/airlines";
// Page view tracking (analytics only - no affiliate tracking)
import { parseFlightSearchParams } from "@/lib/flightSearchParams";
import StickyBookingCTA from "@/components/flight/StickyBookingCTA";
import TopSearchCTA from "@/components/flight/TopSearchCTA";
import CrossSellSection from "@/components/flight/CrossSellSection";
import { QuickStatsBar, HowBookingWorks, FlightTrustBadgesBar, FlightMobileResultsBar } from "@/components/flight";
import { EnhanceYourTrip } from "@/components/travel-extras";
import ExitIntentPrompt from "@/components/monetization/ExitIntentPrompt";
import TrendingDealsSection from "@/components/monetization/TrendingDealsSection";
import { FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import ContextualCrossSell from "@/components/monetization/ContextualCrossSell";
import DriverCrossSell from "@/components/cross-sell/DriverCrossSell";
import {
  StickySearchSummary,
  FiltersSheet,
  FiltersTrigger,
  SortSelect,
  flightSortOptions,
  ResultsContainer,
  ResultsHeader,
  ResultsSkeletonList,
  EmptyResults,
  FlightResultCard,
  type FlightCardData,
  ResultsBreadcrumbs,
  ResultsFAQ,
  FlightEditSearchForm,
  DesktopFiltersSidebar,
  FlightFiltersContent,
  ActiveFiltersChips,
} from "@/components/results";
import FlightsMoRFooter from "@/components/flight/FlightsMoRFooter";
import { FlightSearchFormPro } from "@/components/search";
import { toast } from "@/hooks/use-toast";

const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>("price");
  const [showFilters, setShowFilters] = useState(false);
  const [currency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  // Use unified filter hook with URL sync
  const {
    filters,
    setFilters: updateFilters,
    chips: filterChips,
    activeCount: activeFilterCount,
    hasActiveFilters,
    removeFilter,
    clearFilters,
  } = useFlightFilters();

  // Parse and validate URL parameters using IATA codes
  const parsedParams = useMemo(() => parseFlightSearchParams(searchParams), [searchParams]);
  
  const {
    originIata,
    destinationIata,
    originAirport,
    destinationAirport,
    originDisplay,
    destinationDisplay,
    departureDate,
    returnDate,
    passengers,
    cabinClass,
    tripType,
    isValid,
    errors,
  } = parsedParams;

  // Parse departure date for calendar display
  const departDateParsed = departureDate ? parseISO(departureDate) : undefined;

  // Page view tracking removed - OTA mode, no affiliate analytics needed

  // Fetch real flights using Duffel API (MoR model - exact pricing)
  const { 
    data: duffelResult, 
    isLoading, 
    isError, 
    error 
  } = useDuffelFlightSearch({
    origin: originIata,
    destination: destinationIata,
    departureDate: departureDate || '',
    returnDate: returnDate || undefined,
    passengers: { adults: passengers },
    cabinClass: cabinClass as 'economy' | 'premium_economy' | 'business' | 'first',
    enabled: isValid,
  });
  
  // Extract offers from Duffel response
  const duffelOffers = duffelResult?.offers || [];
  const isRealPrice = duffelOffers.length > 0; // Duffel always returns exact prices

  // Convert Duffel offers to display format
  const convertedOffers = useMemo(() => {
    return duffelOffers.map((offer: DuffelOffer) => ({
      id: offer.id,
      airline: offer.airline,
      airlineCode: offer.airlineCode,
      flightNumber: offer.flightNumber,
      departure: offer.departure,
      arrival: offer.arrival,
      duration: offer.duration,
      durationMinutes: offer.durationMinutes,
      stops: offer.stops,
      stopCities: offer.stopCities,
      price: offer.pricePerPerson,
      totalPrice: offer.price,
      class: offer.cabinClass,
      baggageIncluded: offer.baggageIncluded,
      isRefundable: offer.isRefundable,
      conditions: offer.conditions,
      segments: offer.segments,
      expiresAt: offer.expiresAt,
      passengers: offer.passengers,
      currency: offer.currency,
      logo: getAirlineLogo(offer.airlineCode),
      isRealPrice: true,
    }));
  }, [duffelOffers]);
  
  // Filter and sort Duffel offers
  const flights = useMemo(() => {
    if (!isValid || convertedOffers.length === 0) return [];

    // Apply filters
    let filtered = convertedOffers.filter((f: any) => f.price <= filters.maxPrice);
    
    if (filters.stops.length > 0) {
      filtered = filtered.filter((f: any) => filters.stops.includes(f.stops));
    }

    if (filters.airlines.length > 0) {
      filtered = filtered.filter((f: any) => filters.airlines.includes(f.airlineCode));
    }

    if (filters.departureTime.length > 0) {
      filtered = filtered.filter((f: any) => {
        const hour = parseInt(f.departure.time.split(":")[0]);
        if (filters.departureTime.includes("morning") && hour >= 5 && hour < 12) return true;
        if (filters.departureTime.includes("afternoon") && hour >= 12 && hour < 17) return true;
        if (filters.departureTime.includes("evening") && hour >= 17 && hour < 21) return true;
        if (filters.departureTime.includes("night") && (hour >= 21 || hour < 5)) return true;
        return false;
      });
    }

    // Filter by duration
    if (filters.maxDuration < 24) {
      filtered = filtered.filter((f: any) => {
        const minutes = f.durationMinutes || parseInt(f.duration.match(/(\d+)h/)?.[1] || "0") * 60;
        return minutes <= filters.maxDuration * 60;
      });
    }

    // Sort
    return filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          const dA = a.durationMinutes || parseInt(a.duration.match(/(\d+)h/)?.[1] || "0") * 60;
          const dB = b.durationMinutes || parseInt(b.duration.match(/(\d+)h/)?.[1] || "0") * 60;
          return dA - dB;
        case "departure":
          return a.departure.time.localeCompare(b.departure.time);
        case "best":
          const scoreA = a.price + ((a.durationMinutes || 0) * 0.5);
          const scoreB = b.price + ((b.durationMinutes || 0) * 0.5);
          return scoreA - scoreB;
        default:
          return 0;
      }
    });
  }, [convertedOffers, sortBy, filters, isValid]);

  // Get unique airlines for filter options
  const availableAirlines = useMemo(() => {
    const airlineMap = new Map<string, { code: string; name: string; count: number }>();
    
    convertedOffers.forEach((f: any) => {
      if (airlineMap.has(f.airlineCode)) {
        const existing = airlineMap.get(f.airlineCode)!;
        existing.count++;
      } else {
        airlineMap.set(f.airlineCode, { code: f.airlineCode, name: f.airline, count: 1 });
      }
    });
    
    return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [convertedOffers]);
  // Format price with currency
  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency]}${price.toLocaleString()}`;
  };

  const lowestPrice = flights.length > 0 ? Math.min(...flights.map((f: any) => f.price)) : 0;
  const cheapestFlight = flights.length > 0 ? flights.find((f: any) => f.price === lowestPrice) : null;
  
  const fastestFlight = flights.length > 0 ? flights.reduce((a: any, b: any) => {
    const dA = a.durationMinutes || parseInt(a.duration.match(/(\d+)h/)?.[1] || "99") * 60;
    const dB = b.durationMinutes || parseInt(b.duration.match(/(\d+)h/)?.[1] || "99") * 60;
    return dA < dB ? a : b;
  }) : null;

  // Calculate best value flight
  const bestValueFlight = useMemo(() => {
    if (flights.length === 0) return null;
    return flights.reduce((best: any, flight: any) => {
      const minutes = flight.durationMinutes || parseInt(flight.duration.match(/(\d+)h/)?.[1] || "0") * 60;
      const bestMinutes = best.durationMinutes || parseInt(best.duration.match(/(\d+)h/)?.[1] || "0") * 60;
      const score = flight.price + (minutes * 0.5);
      const bestScore = best.price + (bestMinutes * 0.5);
      return score < bestScore ? flight : best;
    });
  }, [flights]);

  // Convert to unified card format with badges
  const flightCards: FlightCardData[] = flights.map((flight: any) => ({
    id: flight.id,
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    airlineLogo: flight.logo || getAirlineLogo(flight.airlineCode),
    flightNumber: flight.flightNumber,
    departureTime: flight.departure.time,
    arrivalTime: flight.arrival.time,
    departureAirport: flight.departure.code,
    arrivalAirport: flight.arrival.code,
    duration: flight.duration,
    stops: flight.stops,
    stopLocations: flight.stopCities,
    price: flight.price,
    currency: flight.currency || currency,
    cabinClass: flight.class || cabinClass,
    amenities: [],
    baggageIncluded: flight.baggageIncluded,
    isRealPrice: true, // Duffel always returns exact prices
    isBestPrice: flight.price === lowestPrice,
    isFastest: flight === fastestFlight,
    isBestValue: flight === bestValueFlight && flight !== cheapestFlight && flight !== fastestFlight,
  }));

  // Handle flight selection - navigate to details page (MoR flow)
  const handleViewDeal = async (flight: FlightCardData) => {
    // Store flight data for details page
    const selectedOffer = duffelOffers.find((o: DuffelOffer) => o.id === flight.id);
    
    if (selectedOffer) {
      sessionStorage.setItem('selectedFlight', JSON.stringify({
        ...selectedOffer,
        logo: getAirlineLogo(selectedOffer.airlineCode),
      }));
      sessionStorage.setItem('flightSearchParams', JSON.stringify({
        originIata,
        destinationIata,
        originDisplay,
        destinationDisplay,
        departDate: departureDate,
        returnDate,
        passengers,
        cabinClass,
        tripType,
      }));
      
      toast({
        title: "Flight selected",
        description: "Reviewing your selection...",
        duration: 2000,
      });
      
      // Navigate to flight details page
      navigate(`/flights/details/${flight.id}`);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };

  // Render validation error state
  if (!isValid && errors.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Invalid Search – ZIVO Flights"
          description="Please check your flight search parameters."
        />
        <Header />
        
        <main className="pt-20 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto mt-12">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold mb-2">Invalid Search Parameters</h1>
                <p className="text-muted-foreground mb-6">
                  We couldn't process your flight search. Please check the following:
                </p>
                <ul className="text-left space-y-2 mb-6">
                  {errors.map((err, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      {err}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => navigate("/flights")}
                  className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600"
                >
                  <Plane className="w-4 h-4" />
                  New Search
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const pageTitle = `Flights ${originIata} to ${destinationIata} – Compare Prices | ZIVO`;
  const pageDescription = `Compare flight prices from ${originDisplay} to ${destinationDisplay}. Search ${flights.length}+ options from trusted airlines and book with our travel partners.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />

      <main className="pt-16 pb-24 lg:pb-8">
        {/* Breadcrumbs */}
        <ResultsBreadcrumbs service="flights" />

        {/* Sticky Search Summary */}
        <StickySearchSummary
          service="flights"
          backLink="/flights"
          title={
            <>
              {originAirport?.city || originIata}{" "}
              <Plane className="inline w-4 h-4 text-sky-500 -rotate-45 mx-1" />
              {" "}{destinationAirport?.city || destinationIata}
            </>
          }
          badges={[
            { label: departureDate ? formatDisplayDate(departureDate) + (returnDate ? ` – ${formatDisplayDate(returnDate)}` : " (One Way)") : "" },
            { label: `${passengers} traveler${passengers > 1 ? "s" : ""}` },
            { label: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1) },
          ]}
          searchForm={
            <FlightEditSearchForm
              onSearch={() => {}}
              onCancel={() => {}}
            />
          }
        />

        {/* Trust Banner - MoR Model */}
        <section className="border-b border-border/50 py-4 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-500/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                Book directly on ZIVO • Tickets issued instantly
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Secure ZIVO checkout
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="text-emerald-600 font-medium">Prices include all taxes & fees</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Comparison Bar - Only show when we have real API prices */}
        {!isLoading && isRealPrice && flights.length > 0 && (
          <section className="py-4">
            <div className="container mx-auto px-4">
              <QuickStatsBar
                cheapest={{
                  price: lowestPrice,
                  partner: (cheapestFlight as any)?.agentName || "Aviasales",
                }}
                fastest={{
                  price: fastestFlight?.price || lowestPrice,
                  partner: (fastestFlight as any)?.agentName || "JetRadar",
                  duration: fastestFlight?.duration?.split(" ")[0] || "",
                }}
                bestValue={{
                  price: bestValueFlight?.price || lowestPrice,
                  partner: (bestValueFlight as any)?.agentName || "Kiwi",
                }}
                currency={currency}
              />
            </div>
          </section>
        )}

        {/* Results Section */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <ResultsContainer
              filters={
                <DesktopFiltersSidebar
                  activeCount={activeFilterCount}
                  onClearAll={clearFilters}
                  service="flights"
                >
                  <FlightFiltersContent
                    filters={filters}
                    onFilterChange={updateFilters}
                    availableAirlines={availableAirlines}
                    currency={currency}
                    onClearAll={clearFilters}
                  />
                </DesktopFiltersSidebar>
              }
            >
              {/* Results Header */}
              <ResultsHeader
                count={flightCards.length}
                itemName="flight"
                isLoading={isLoading}
                indicativePrice={!isRealPrice}
                filterTrigger={
                  <FiltersTrigger 
                    onClick={() => setShowFilters(true)} 
                    activeCount={activeFilterCount}
                    service="flights"
                  />
                }
                sortElement={
                  <div className="flex items-center gap-2">
                    <SortSelect value={sortBy} onValueChange={setSortBy} options={flightSortOptions} />
                  </div>
                }
                filterChips={
                  <ActiveFiltersChips
                    filters={filterChips}
                    onRemove={removeFilter}
                    onClearAll={clearFilters}
                    service="flights"
                    resultsCount={flightCards.length}
                  />
                }
              />

              {/* Top Search CTA */}
              {!isLoading && flights.length > 0 && (
                <TopSearchCTA 
                  flightCount={flights.length}
                  lowestPrice={lowestPrice}
                  origin={originIata}
                  destination={destinationIata}
                  className="mb-4"
                />
              )}

              {/* Loading State */}
              {isLoading && <ResultsSkeletonList count={6} variant="flight" />}

              {/* No Results State */}
              {!isLoading && flightCards.length === 0 && isValid && (
                <EmptyResults 
                  service="flights"
                  message="No flights found for these dates. Try different dates or nearby airports."
                />
              )}

              {/* Results - Only show if we have real API prices */}
              {!isLoading && isRealPrice && flightCards.length > 0 && (
                <div className="space-y-4">
                  {flightCards.map((flight) => (
                    <FlightResultCard 
                      key={flight.id} 
                      flight={flight} 
                      onViewDeal={handleViewDeal}
                    />
                  ))}
                </div>
              )}

              {/* MoR Footer */}
              {flightCards.length > 0 && !isLoading && (
                <FlightsMoRFooter variant="compact" className="mt-6" />
              )}

              {/* Cross-Sell Banner */}
              {flights.length > 0 && !isLoading && (
                <div className="mt-8">
                  <ContextualCrossSell
                    destination={destinationAirport?.city || destinationIata}
                    origin={originAirport?.city || originIata}
                    checkIn={departureDate || ""}
                    checkOut={returnDate || ""}
                    variant="banner"
                  />
                </div>
              )}

              {/* Cross-Sell Section - Hotels, Cars, Activities */}
              {flights.length > 0 && !isLoading && (
                <div className="mt-10">
                  <CrossSellSection 
                    destination={destinationAirport?.city || destinationIata}
                    origin={originAirport?.city || originIata}
                    checkIn={departureDate || ""}
                    checkOut={returnDate || ""}
                  />
                </div>
              )}

              {/* Trending Deals */}
              {flights.length > 0 && !isLoading && (
                <TrendingDealsSection 
                  title="More Popular Routes"
                  subtitle="Deals travelers are booking now"
                  maxDeals={6}
                  className="mt-8"
                />
              )}

              {/* Enhance Your Trip */}
              {flights.length > 0 && !isLoading && (
                <EnhanceYourTrip 
                  currentService="flights"
                  destination={destinationAirport?.city || destinationIata}
                  className="mt-8"
                />
              )}

              {/* Driver Cross-Sell - Airport Rides & Delivery */}
              {flights.length > 0 && !isLoading && (
                <DriverCrossSell source="flights" variant="full" className="mt-8" />
              )}
            </ResultsContainer>
          </div>
        </section>

        {/* How Booking Works - Trust Section */}
        <HowBookingWorks />

        {/* Trust Badges */}
        <FlightTrustBadgesBar />

        {/* FAQ Section */}
        <ResultsFAQ service="flights" />

        {/* MoR Disclaimer Footer */}
        <FlightsMoRFooter />
      </main>

      {/* Mobile Filters Sheet */}
      <FiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        onApply={() => {}}
        onReset={clearFilters}
        hasActiveFilters={hasActiveFilters}
        service="flights"
        resultsCount={flightCards.length}
      >
        <FlightFiltersContent
          filters={filters}
          onFilterChange={updateFilters}
          availableAirlines={availableAirlines}
          currency={currency}
          onClearAll={clearFilters}
        />
      </FiltersSheet>

      {/* Mobile Sticky Filter + Sort Bar */}
      <FlightMobileResultsBar
        currentSort={sortBy}
        onSortChange={setSortBy}
        onOpenFilters={() => setShowFilters(true)}
        filterCount={activeFilterCount}
        show={!isLoading && flights.length > 0}
      />

      {/* Exit Intent Prompt (Desktop Only) */}
      <ExitIntentPrompt
        origin={originIata}
        destination={destinationIata}
        lowestPrice={lowestPrice}
      />

      <Footer />
    </div>
  );
};

export default FlightResults;