/**
 * Hotel Results Page - Unified Design
 * Uses shared results components for consistent UX
 */

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Hotel, AlertCircle, ExternalLink } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import HotelFiltersComponent, { HotelFilters } from "@/components/hotels/HotelFilters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  StickySearchSummary,
  FiltersSheet,
  FiltersTrigger,
  SortSelect,
  hotelSortOptions,
  ResultsContainer,
  ResultsHeader,
  ResultsSkeletonList,
  EmptyResults,
  HotelResultCard,
  type HotelCardData,
  IndicativePriceAlert,
  RedirectNotice,
  AffiliateDisclaimer,
} from "@/components/results";
import { useRealHotelSearch, buildBookingUrl } from "@/hooks/useRealHotelSearch";
import { getCityBySlug } from "@/data/cities";
import { trackAffiliateClick } from "@/lib/affiliateTracking";

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

  const citySlug = searchParams.get("city") || "";
  const city = getCityBySlug(citySlug);
  const cityName = city?.name || citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!citySlug) errors.push("Destination is required");

  const checkIn = searchParams.get("checkin") || "";
  const checkOut = searchParams.get("checkout") || "";

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(checkIn)) errors.push("Invalid check-in date format");
  if (!dateRegex.test(checkOut)) errors.push("Invalid check-out date format");

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) errors.push("Check-out must be after check-in");
  }

  const adults = parseInt(searchParams.get("adults") || "1", 10);
  if (isNaN(adults) || adults < 1 || adults > 10) errors.push("Adults must be between 1 and 10");

  const rooms = parseInt(searchParams.get("rooms") || "1", 10);
  if (isNaN(rooms) || rooms < 1 || rooms > 5) errors.push("Rooms must be between 1 and 5");

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
  const [sortBy, setSortBy] = useState("price");

  const { isLoading, results, search, applyFilters, isRealPrice } = useRealHotelSearch();

  const parsed = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const { citySlug, cityName, checkIn, checkOut, adults, rooms, isValid, errors } = parsed;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    try {
      return Math.max(1, differenceInDays(parseISO(checkOut), parseISO(checkIn)));
    } catch {
      return 0;
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (isValid && citySlug && checkIn && checkOut) {
      search({ citySlug, cityName, checkIn, checkOut, adults, rooms }, filters);
    }
  }, [citySlug, cityName, checkIn, checkOut, adults, rooms, isValid]);

  const handleFilterChange = (newFilters: HotelFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Sort results
  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.guestRating - a.guestRating);
      case "stars":
        return sorted.sort((a, b) => b.starRating - a.starRating);
      case "distance":
        return sorted.sort((a, b) => (a.distanceFromCenter || 99) - (b.distanceFromCenter || 99));
      case "price":
      default:
        return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    }
  }, [results, sortBy]);

  // Convert to unified card format
  const hotelCards: HotelCardData[] = sortedResults.map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    area: hotel.area,
    imageUrl: hotel.imageUrl,
    starRating: hotel.starRating,
    guestRating: hotel.guestRating,
    reviewCount: hotel.reviewCount,
    pricePerNight: hotel.pricePerNight,
    totalPrice: hotel.pricePerNight * nights,
    nights,
    amenities: hotel.amenities,
    freeCancellation: hotel.freeCancellation,
    distanceFromCenter: hotel.distanceFromCenter,
  }));

  const handleViewDeal = (hotel: HotelCardData) => {
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
      partner: "booking",
      product: "hotels",
      source: "result_card",
    });

    const utmSource = searchParams.get("utm_source");
    const utmCampaign = searchParams.get("utm_campaign");
    const creator = searchParams.get("creator");

    if (utmSource) outParams.set("utm_source", utmSource);
    if (utmCampaign) outParams.set("utm_campaign", utmCampaign);
    if (creator) outParams.set("creator", creator);

    trackAffiliateClick({
      flightId: hotel.id,
      airline: "Booking.com",
      airlineCode: "HOTEL",
      origin: "ZIVO",
      destination: cityName,
      price: hotel.pricePerNight,
      passengers: adults,
      cabinClass: "standard",
      affiliatePartner: "booking",
      referralUrl: `/out?${outParams.toString()}`,
      source: "hotel_result_card",
      ctaType: "result_card",
      serviceType: "hotels",
    });

    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  const handleViewAllOnPartner = () => {
    const bookingUrl = buildBookingUrl({ citySlug, cityName, checkIn, checkOut, adults, rooms });
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };

  const activeFilterCount =
    filters.starRating.length +
    filters.amenities.length +
    (filters.guestRating ? 1 : 0) +
    (filters.distance ? 1 : 0);

  const pageTitle = cityName
    ? `Hotels in ${cityName} | From $${hotelCards[0]?.pricePerNight || 50}/night | ZIVO`
    : "Hotel Search Results | ZIVO";

  const pageDescription = cityName
    ? `Compare ${results.length}+ hotels in ${cityName}. ${checkIn && checkOut ? `${nights} nights, ${formatDisplayDate(checkIn)} - ${formatDisplayDate(checkOut)}.` : ""} Book securely on partner sites.`
    : "Search and compare hotel prices across booking sites.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />

      <main className="pt-16">
        {/* Sticky Search Summary */}
        <StickySearchSummary
          service="hotels"
          backLink="/hotels"
          title={
            <>
              Hotels in <span className="text-amber-500">{cityName}</span>
            </>
          }
          badges={[
            { label: `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)} (${nights} night${nights !== 1 ? "s" : ""})` },
            { label: `${adults} guest${adults !== 1 ? "s" : ""}, ${rooms} room${rooms !== 1 ? "s" : ""}` },
          ]}
          searchForm={
            <HotelSearchForm
              initialCity={cityName}
              initialCheckIn={checkIn ? parseISO(checkIn) : undefined}
              initialCheckOut={checkOut ? parseISO(checkOut) : undefined}
              initialAdults={adults}
              initialRooms={rooms}
              navigateOnSearch={true}
            />
          }
        />

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
                  <Link to="/hotels" className="text-amber-500 underline mt-2 inline-block">
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
              <ResultsContainer
                filters={
                  <HotelFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
                }
              >
                {/* Results Header */}
                <ResultsHeader
                  count={hotelCards.length}
                  itemName="hotel"
                  isLoading={isLoading}
                  indicativePrice={!isRealPrice}
                  filterTrigger={
                    <FiltersTrigger onClick={() => setShowFilters(true)} activeCount={activeFilterCount} />
                  }
                  sortElement={
                    <div className="flex items-center gap-2">
                      <SortSelect value={sortBy} onValueChange={setSortBy} options={hotelSortOptions} />
                      <Button
                        onClick={handleViewAllOnPartner}
                        className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-white gap-2"
                      >
                        View on Booking.com
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                />

                {/* Indicative Price Notice */}
                {!isRealPrice && !isLoading && hotelCards.length > 0 && (
                  <IndicativePriceAlert service="hotels" className="mb-4" />
                )}

                {/* Loading State */}
                {isLoading && <ResultsSkeletonList count={5} variant="hotel" />}

                {/* Results */}
                {!isLoading && hotelCards.length > 0 && (
                  <div className="space-y-4">
                    {hotelCards.map((hotel) => (
                      <HotelResultCard key={hotel.id} hotel={hotel} onViewDeal={handleViewDeal} />
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!isLoading && hotelCards.length === 0 && isValid && (
                  <EmptyResults
                    service="hotels"
                    partnerCta={{ label: "Search on Booking.com", onClick: handleViewAllOnPartner }}
                  />
                )}

                {/* Redirect Notice */}
                {hotelCards.length > 0 && !isLoading && <RedirectNotice service="hotels" className="mt-6" />}
              </ResultsContainer>
            </div>
          </section>
        )}

        {/* Affiliate Disclaimer */}
        <AffiliateDisclaimer />
      </main>

      {/* Mobile Filters Sheet */}
      <FiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        onApply={() => {}}
        onReset={() => setFilters(defaultFilters)}
        hasActiveFilters={activeFilterCount > 0}
        service="hotels"
      >
        <HotelFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
      </FiltersSheet>

      <Footer />
    </div>
  );
}
