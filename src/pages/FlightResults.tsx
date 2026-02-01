/**
 * Flight Results Page - Unified Design
 * Uses shared results components for consistent UX
 */

import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Clock,
  TrendingDown,
  Star,
  X,
  Zap,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { generateFlights, type GeneratedFlight } from "@/data/flightGenerator";
import { useAviasalesFlightSearch, buildWhitelabelUrl, type ApiFlightResult } from "@/hooks/useAviasalesFlightSearch";
import { useFlightFilters, defaultFlightFilters } from "@/hooks/useResultsFilters";
import { getAirlineLogo } from "@/data/airlines";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import { trackAffiliateClick, trackPageView } from "@/lib/affiliateTracking";
import { parseFlightSearchParams } from "@/lib/flightSearchParams";
import StickyBookingCTA from "@/components/flight/StickyBookingCTA";
import TopSearchCTA from "@/components/flight/TopSearchCTA";
import CrossSellSection from "@/components/flight/CrossSellSection";
import { EnhanceYourTrip } from "@/components/travel-extras";
import ExitIntentPrompt from "@/components/monetization/ExitIntentPrompt";
import TrendingDealsSection from "@/components/monetization/TrendingDealsSection";
import ContextualCrossSell from "@/components/monetization/ContextualCrossSell";
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
  IndicativePriceAlert,
  RedirectNotice,
  AffiliateDisclaimer,
  ResultsBreadcrumbs,
  ResultsFAQ,
  FlightEditSearchForm,
  DesktopFiltersSidebar,
  FlightFiltersContent,
  ActiveFiltersChips,
} from "@/components/results";
import { FlightSearchFormPro } from "@/components/search";

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

  // Track page view for analytics
  useEffect(() => {
    if (isValid) {
      trackPageView("flight_results", {
        origin: originIata,
        destination: destinationIata,
        departDate: departureDate,
      });
    }
  }, [originIata, destinationIata, departureDate, isValid]);

  // Fetch real flights using Aviasales API
  const { 
    data: apiResponse, 
    isLoading, 
    isError, 
    error 
  } = useAviasalesFlightSearch({
    origin: originIata,
    destination: destinationIata,
    departureDate: departureDate || '',
    returnDate: returnDate || undefined,
    passengers,
    cabinClass,
    tripType,
    enabled: isValid,
  });
  
  // Extract data from API response
  const apiFlights = apiResponse?.flights || [];
  const isRealPrice = apiResponse?.isRealPrice || false;
  const fallbackWhitelabelUrl = apiResponse?.whitelabelUrl || 
    (isValid ? buildWhitelabelUrl({ origin: originIata, destination: destinationIata, departureDate: departureDate || '', returnDate, passengers, cabinClass, tripType }) : '');

  // Generate fallback flights
  const generatedFlights = useMemo(() => {
    if (!isValid) return [];
    return generateFlights(originIata, destinationIata, departDateParsed, 15);
  }, [originIata, destinationIata, departDateParsed, isValid]);

  // Convert API flights to GeneratedFlight format for compatibility
  const convertedApiFlights: GeneratedFlight[] = useMemo(() => {
    return apiFlights.map((f: ApiFlightResult) => ({
      id: f.id,
      airline: f.airline,
      airlineCode: f.airlineCode,
      flightNumber: f.flightNumber,
      departure: f.departure,
      arrival: f.arrival,
      duration: f.duration,
      stops: f.stops,
      stopCities: f.stopCities,
      price: f.pricePerPerson || f.price,
      class: f.cabinClass === 'C' ? 'Business' : f.cabinClass === 'F' ? 'First' : 'Economy',
      amenities: [],
      seatsLeft: f.seatsAvailable || 5,
      category: 'full-service' as const,
      alliance: 'Independent',
      aircraft: 'Various',
      onTimePerformance: 85,
      carbonOffset: 0,
      baggageIncluded: f.baggageIncluded || 'Check with airline',
      refundable: f.isRefundable || false,
      wifi: false,
      entertainment: false,
      meals: false,
      legroom: '31"',
      logo: f.logo || getAirlineLogo(f.airlineCode),
      isRealPrice: isRealPrice,
      currency: f.currency || 'USD',
      agentName: f.agentName,
    }));
  }, [apiFlights, isRealPrice]);
  
  // Combine and filter results
  const flights = useMemo(() => {
    if (!isValid) return [];
    
    const combined: GeneratedFlight[] = [];
    
    // Use API results first if available
    if (convertedApiFlights.length > 0) {
      combined.push(...convertedApiFlights);
    }

    // Add generated flights as fallback only if no real prices
    if (!isRealPrice) {
      const realAirlineCodes = new Set(convertedApiFlights.map((f) => f.airlineCode));
      const uniqueGenerated = generatedFlights.filter((f) => !realAirlineCodes.has(f.airlineCode));
      combined.push(...uniqueGenerated.slice(0, 10 - convertedApiFlights.length));
    }

    // Apply filters from unified hook
    let filtered = combined.filter(f => f.price <= filters.maxPrice);
    
    if (filters.stops.length > 0) {
      filtered = filtered.filter(f => filters.stops.includes(f.stops));
    }

    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airlineCode));
    }

    if (filters.departureTime.length > 0) {
      filtered = filtered.filter(f => {
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
      filtered = filtered.filter(f => {
        const hours = parseInt(f.duration.match(/(\d+)h/)?.[1] || "0");
        return hours <= filters.maxDuration;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          const dA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "0");
          const dB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "0");
          return dA - dB;
        case "departure":
          return a.departure.time.localeCompare(b.departure.time);
        case "best":
          const scoreA = a.price + (parseInt(a.duration.match(/(\d+)h/)?.[1] || "0") * 20);
          const scoreB = b.price + (parseInt(b.duration.match(/(\d+)h/)?.[1] || "0") * 20);
          return scoreA - scoreB;
        default:
          return 0;
      }
    });
  }, [convertedApiFlights, generatedFlights, sortBy, filters, isValid, isRealPrice]);

  // Get unique airlines from unfiltered flights for filter options
  const availableAirlines = useMemo(() => {
    const combined = [...convertedApiFlights, ...generatedFlights];
    const airlineMap = new Map<string, { code: string; name: string; count: number }>();
    
    combined.forEach(f => {
      if (airlineMap.has(f.airlineCode)) {
        const existing = airlineMap.get(f.airlineCode)!;
        existing.count++;
      } else {
        airlineMap.set(f.airlineCode, { code: f.airlineCode, name: f.airline, count: 1 });
      }
    });
    
    return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [convertedApiFlights, generatedFlights]);

  // Format price with currency
  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[currency]}${price.toLocaleString()}`;
  };

  const lowestPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0;
  const fastestFlight = flights.length > 0 ? flights.reduce((a, b) => {
    const dA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "99");
    const dB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "99");
    return dA < dB ? a : b;
  }) : null;

  // Convert to unified card format
  const flightCards: FlightCardData[] = flights.map((flight) => ({
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
    currency: (flight as any).currency || currency,
    cabinClass: flight.class || cabinClass,
    amenities: flight.amenities || [],
    baggageIncluded: flight.baggageIncluded,
    isRealPrice: (flight as any).isRealPrice,
    isBestPrice: flight.price === lowestPrice,
    isFastest: flight === fastestFlight,
  }));

  const handleViewDeal = (flight: FlightCardData) => {
    // Build tracking params for /out redirect
    const outParams = new URLSearchParams({
      origin: originIata,
      destination: destinationIata,
      depart: departureDate || '',
      passengers: String(passengers),
      cabin: cabinClass,
      airline: flight.airlineCode,
      flightId: flight.id,
      price: String(flight.price),
      partner: 'aviasales',
      product: 'flights',
      source: 'result_card',
    });
    
    if (returnDate) {
      outParams.set('return', returnDate);
    }
    
    // Add UTM params from current URL if present
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const creator = searchParams.get('creator');
    
    if (utmSource) outParams.set('utm_source', utmSource);
    if (utmCampaign) outParams.set('utm_campaign', utmCampaign);
    if (creator) outParams.set('creator', creator);
    
    trackAffiliateClick({
      flightId: flight.id,
      airline: flight.airline,
      airlineCode: flight.airlineCode,
      origin: originIata,
      destination: destinationIata,
      price: flight.price,
      passengers,
      cabinClass,
      affiliatePartner: 'aviasales',
      referralUrl: `/out?${outParams.toString()}`,
      source: 'result_card',
      ctaType: 'result_card',
      serviceType: 'flights',
    });
    
    // Open /out redirect which logs and redirects to partner
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  const handleViewAllOnPartner = () => {
    window.open(fallbackWhitelabelUrl, "_blank", "noopener,noreferrer");
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

        {/* Quick Stats */}
        {!isLoading && flights.length > 0 && (
          <section className="border-b border-border/50 py-4 bg-muted/10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Compare trusted partners</span>
                </div>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span>From <strong className="text-sky-500">{formatPrice(lowestPrice)}</strong></span>
                </div>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Fastest: <strong className="text-purple-500">{fastestFlight?.duration.split(" ")[0] || "N/A"}</strong></span>
                </div>
                {flights.some(f => f.isRealPrice) && (
                  <>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <Badge className="bg-sky-500/20 text-sky-500 text-xs gap-1">
                      <Zap className="w-3 h-3" />
                      Live Prices
                    </Badge>
                  </>
                )}
              </div>
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
                    <Button
                      onClick={handleViewAllOnPartner}
                      className="hidden sm:flex bg-sky-500 hover:bg-sky-600 text-white gap-2"
                    >
                      Search All Partners
                      <ExternalLink className="w-4 h-4" />
                    </Button>
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

              {/* Indicative Price Notice */}
              {!isRealPrice && !isLoading && flightCards.length > 0 && (
                <IndicativePriceAlert service="flights" className="mb-4" />
              )}

              {/* Loading State */}
              {isLoading && <ResultsSkeletonList count={6} variant="flight" />}

              {/* Results */}
              {!isLoading && flightCards.length > 0 && (
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

              {/* No Results */}
              {!isLoading && flightCards.length === 0 && isValid && (
                <EmptyResults
                  service="flights"
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  partnerCta={{
                    label: "Search All Partners",
                    onClick: handleViewAllOnPartner,
                  }}
                />
              )}

              {/* Redirect Notice */}
              {flightCards.length > 0 && !isLoading && (
                <RedirectNotice service="flights" className="mt-6" />
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
            </ResultsContainer>
          </div>
        </section>

        {/* FAQ Section */}
        <ResultsFAQ service="flights" />

        {/* Affiliate Disclaimer */}
        <AffiliateDisclaimer />
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
        />
      </FiltersSheet>

      {/* Sticky Mobile CTA */}
      <StickyBookingCTA 
        lowestPrice={lowestPrice}
        flightCount={flights.length}
        origin={originIata}
        destination={destinationIata}
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