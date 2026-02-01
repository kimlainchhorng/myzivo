/**
 * Hotel Results Page
 * Displays search results with proper URL params and affiliate tracking
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Hotel, Shield, CheckCircle, ExternalLink, Search as SearchIcon, 
  AlertCircle, ArrowLeft, Filter 
} from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import HotelFiltersComponent, { HotelFilters } from "@/components/hotels/HotelFilters";
import HotelResultCard, { HotelResult } from "@/components/hotels/HotelResultCard";
import HotelResultsSkeleton from "@/components/hotels/HotelResultsSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRealHotelSearch, buildBookingUrl } from "@/hooks/useRealHotelSearch";
import { getCityBySlug, cityNameToSlug, type City } from "@/data/cities";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

// Parse and validate URL parameters
interface ParsedSearchParams {
  citySlug: string;
  cityName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  isValid: boolean;
  errors: string[];
}

function parseSearchParams(searchParams: URLSearchParams): ParsedSearchParams {
  const errors: string[] = [];
  
  // City
  const citySlug = searchParams.get("city") || "";
  const city = getCityBySlug(citySlug);
  const cityName = city?.name || citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  if (!citySlug) {
    errors.push("Destination is required");
  }
  
  // Dates
  const checkIn = searchParams.get("checkin") || "";
  const checkOut = searchParams.get("checkout") || "";
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkIn)) {
    errors.push("Invalid check-in date format");
  }
  if (!dateRegex.test(checkOut)) {
    errors.push("Invalid check-out date format");
  }
  
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      errors.push("Check-out must be after check-in");
    }
  }
  
  // Guests
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  if (isNaN(adults) || adults < 1 || adults > 10) {
    errors.push("Adults must be between 1 and 10");
  }
  
  const rooms = parseInt(searchParams.get("rooms") || "1", 10);
  if (isNaN(rooms) || rooms < 1 || rooms > 5) {
    errors.push("Rooms must be between 1 and 5");
  }
  
  return {
    citySlug,
    cityName,
    checkIn,
    checkOut,
    adults: isNaN(adults) ? 1 : Math.min(10, Math.max(1, adults)),
    rooms: isNaN(rooms) ? 1 : Math.min(5, Math.max(1, rooms)),
    isValid: errors.length === 0,
    errors,
  };
}

const defaultFilters: HotelFilters = {
  priceRange: [0, 1000],
  starRating: [],
  guestRating: null,
  amenities: [],
  propertyType: [],
  distance: null,
};

export default function HotelResultsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<HotelFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  
  const { isLoading, results, search, applyFilters, whitelabelUrl, isRealPrice } = useRealHotelSearch();
  
  // Parse URL params
  const parsed = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const { citySlug, cityName, checkIn, checkOut, adults, rooms, isValid, errors } = parsed;
  
  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      return Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn)));
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);
  
  // Perform search on mount and when params change
  useEffect(() => {
    if (isValid && citySlug && checkIn && checkOut) {
      search({
        citySlug,
        cityName,
        checkIn,
        checkOut,
        adults,
        rooms,
      }, filters);
    }
  }, [citySlug, cityName, checkIn, checkOut, adults, rooms, isValid]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: HotelFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };
  
  // Handle view deal click - redirect through /out
  const handleViewDeal = (hotel: HotelResult) => {
    // Build tracking URL
    const outParams = new URLSearchParams({
      city: citySlug,
      cityName: cityName,
      checkin: checkIn,
      checkout: checkOut,
      adults: String(adults),
      rooms: String(rooms),
      hotelId: hotel.id,
      hotelName: hotel.name,
      price: String(hotel.pricePerNight),
      partner: 'booking',
      product: 'hotels',
      source: 'result_card',
    });
    
    // Add UTM params from current URL
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const creator = searchParams.get('creator');
    
    if (utmSource) outParams.set('utm_source', utmSource);
    if (utmCampaign) outParams.set('utm_campaign', utmCampaign);
    if (creator) outParams.set('creator', creator);
    
    // Track click
    trackAffiliateClick({
      flightId: hotel.id,
      airline: 'Booking.com',
      airlineCode: 'HOTEL',
      origin: 'ZIVO',
      destination: cityName,
      price: hotel.pricePerNight,
      passengers: adults,
      cabinClass: 'standard',
      affiliatePartner: 'booking',
      referralUrl: `/out?${outParams.toString()}`,
      source: 'hotel_result_card',
      ctaType: 'result_card',
      serviceType: 'hotels',
    });
    
    // Open /out redirect
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };
  
  // Handle "View All on Partner" CTA
  const handleViewAllOnPartner = () => {
    const bookingUrl = buildBookingUrl({
      citySlug,
      cityName,
      checkIn,
      checkOut,
      adults,
      rooms,
    });
    
    trackAffiliateClick({
      flightId: `hotels-${citySlug}-all`,
      airline: 'Booking.com',
      airlineCode: 'HOTEL',
      origin: 'ZIVO',
      destination: cityName,
      price: 0,
      passengers: adults,
      cabinClass: 'standard',
      affiliatePartner: 'booking',
      referralUrl: bookingUrl,
      source: 'view_all_cta',
      ctaType: 'top_cta',
      serviceType: 'hotels',
    });
    
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
  };
  
  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };
  
  const pageTitle = cityName 
    ? `Hotels in ${cityName} | From $${results[0]?.pricePerNight || 50}/night | ZIVO`
    : "Hotel Search Results | ZIVO";
  
  const pageDescription = cityName
    ? `Compare ${results.length}+ hotels in ${cityName}. ${checkIn && checkOut ? `${nights} nights, ${formatDisplayDate(checkIn)} - ${formatDisplayDate(checkOut)}.` : ''} Book securely on partner sites.`
    : "Search and compare hotel prices across booking sites.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main className="pt-16">
        {/* Compact Search Header */}
        <section className="bg-gradient-to-b from-amber-950/30 to-background border-b border-border/50 py-6">
          <div className="container mx-auto px-4">
            {/* Back link */}
            <Link 
              to="/hotels"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              New search
            </Link>
            
            {/* Search summary */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">
                Hotels in <span className="text-hotels">{cityName}</span>
              </h1>
              {checkIn && checkOut && (
                <Badge variant="secondary" className="text-sm">
                  {formatDisplayDate(checkIn)} – {formatDisplayDate(checkOut)} ({nights} night{nights !== 1 ? 's' : ''})
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm">
                {adults} guest{adults !== 1 ? 's' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Compact search form (collapsible on mobile) */}
            <details className="group">
              <summary className="text-sm text-hotels font-medium cursor-pointer list-none flex items-center gap-2">
                <SearchIcon className="w-4 h-4" />
                Modify search
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4">
                <HotelSearchForm
                  initialCity={cityName}
                  initialCheckIn={checkIn ? parseISO(checkIn) : undefined}
                  initialCheckOut={checkOut ? parseISO(checkOut) : undefined}
                  initialAdults={adults}
                  initialRooms={rooms}
                  navigateOnSearch={true}
                  className="bg-card/80"
                />
              </div>
            </details>
          </div>
        </section>
        
        {/* Validation Errors */}
        {!isValid && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Invalid search parameters:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  <Link to="/hotels" className="text-hotels underline mt-2 inline-block">
                    Start a new search →
                  </Link>
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}
        
        {/* Results Section */}
        {isValid && (
          <section className="py-6">
            <div className="container mx-auto px-4">
              <div className="flex gap-6">
                {/* Filters Sidebar (Desktop) */}
                <div className="hidden lg:block w-64 shrink-0">
                  <HotelFiltersComponent
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
                
                {/* Results List */}
                <div className="flex-1">
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <div>
                      {!isLoading && (
                        <p className="text-sm text-muted-foreground">
                          {results.length} hotel{results.length !== 1 ? 's' : ''} found
                          {!isRealPrice && " • Indicative prices*"}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Mobile Filter Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setShowFilters(true)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      
                      {/* View on Partner CTA */}
                      <Button
                        onClick={handleViewAllOnPartner}
                        className="bg-hotels hover:bg-hotels/90 text-white gap-2"
                      >
                        View on Booking.com
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Indicative Price Notice */}
                  {!isRealPrice && !isLoading && results.length > 0 && (
                    <Alert className="mb-4 border-hotels/30 bg-hotels/5">
                      <Hotel className="h-4 w-4 text-hotels" />
                      <AlertDescription className="text-sm">
                        Prices shown are indicative and may vary. View real-time prices and availability on partner sites.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Loading State */}
                  {isLoading && <HotelResultsSkeleton />}
                  
                  {/* Results */}
                  {!isLoading && results.length > 0 && (
                    <div className="space-y-4">
                      {results.map((hotel) => (
                        <HotelResultCard
                          key={hotel.id}
                          hotel={hotel}
                          onViewDeal={handleViewDeal}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* No Results */}
                  {!isLoading && results.length === 0 && isValid && (
                    <div className="text-center py-16 bg-muted/30 rounded-xl">
                      <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try different dates or another destination.
                      </p>
                      <Button
                        onClick={handleViewAllOnPartner}
                        className="bg-hotels hover:bg-hotels/90 text-white gap-2"
                      >
                        Search on Booking.com
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Partner Redirect Notice */}
                  {results.length > 0 && (
                    <div className="mt-6 p-4 bg-hotels/5 border border-hotels/20 rounded-xl flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-hotels shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Clicking "View Deal" will redirect you to our trusted travel partner to complete your booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Affiliate Disclaimer */}
        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              *Prices shown are indicative estimates. Final prices are displayed on partner booking sites.
              ZIVO may earn a commission when users book through partner links.
              Bookings are completed on partner websites.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
