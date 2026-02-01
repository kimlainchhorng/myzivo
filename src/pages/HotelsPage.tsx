/**
 * Premium Hotels Page
 * Conversion-focused layout with search, filters, and partner CTAs
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Hotel, Shield, CheckCircle, Clock, ExternalLink, Search as SearchIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { HotelSearchFormPro, type HotelSearchParams } from "@/components/search";
import HotelFiltersComponent, { HotelFilters } from "@/components/hotels/HotelFilters";
import HotelResultCard, { HotelResult } from "@/components/hotels/HotelResultCard";
import HotelResultsSkeleton from "@/components/hotels/HotelResultsSkeleton";
import PopularHotelDestinations from "@/components/hotels/PopularHotelDestinations";
import TravelFAQ from "@/components/shared/TravelFAQ";
import UserTestimonials from "@/components/shared/UserTestimonials";
import PhotoDestinationGrid from "@/components/shared/PhotoDestinationGrid";
import PartnerLogosStrip from "@/components/shared/PartnerLogosStrip";
import ExperienceGallery from "@/components/shared/ExperienceGallery";
import GlobalTrustBar from "@/components/shared/GlobalTrustBar";
import { InternalLinkGrid } from "@/components/seo";
import { useRealHotelSearch, buildBookingUrl } from "@/hooks/useRealHotelSearch";
import { getCityBySlug, cityNameToSlug } from "@/data/cities";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

const trustBadges = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: CheckCircle, text: "No booking fees on ZIVO" },
  { icon: Clock, text: "24/7 customer support" },
];

const defaultFilters: HotelFilters = {
  priceRange: [0, 500],
  starRating: [],
  guestRating: null,
  amenities: [],
  propertyType: [],
  distance: null,
};

export default function HotelsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial city from URL if present
  const initialCityParam = searchParams.get("destination") || searchParams.get("city") || "";
  const city = getCityBySlug(initialCityParam) || (initialCityParam ? { 
    slug: cityNameToSlug(initialCityParam), 
    name: initialCityParam 
  } : null);
  
  const [filters, setFilters] = useState<HotelFilters>(defaultFilters);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { isLoading, results, searchParams: currentSearch, search, applyFilters, whitelabelUrl } = useRealHotelSearch();

  // Auto-search if city is in URL
  useEffect(() => {
    if (city && !hasSearched) {
      const checkIn = addDays(new Date(), 7);
      const checkOut = addDays(new Date(), 10);
      
      handleSearch({
        citySlug: city.slug,
        cityName: city.name,
        checkIn,
        checkOut,
        adults: 2,
        rooms: 1,
      });
    }
  }, [city?.slug]);

  const handleSearch = async (params: HotelSearchParams) => {
    setHasSearched(true);
    await search({
      citySlug: params.citySlug,
      cityName: params.cityName,
      checkIn: format(params.checkIn, 'yyyy-MM-dd'),
      checkOut: format(params.checkOut, 'yyyy-MM-dd'),
      adults: params.adults,
      rooms: params.rooms,
    }, filters);
  };

  const handleFilterChange = (newFilters: HotelFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleViewDeal = (hotel: HotelResult) => {
    if (!currentSearch) return;
    
    // Build tracking URL through /out
    const outParams = new URLSearchParams({
      city: currentSearch.citySlug,
      cityName: currentSearch.cityName,
      checkin: currentSearch.checkIn,
      checkout: currentSearch.checkOut,
      adults: String(currentSearch.adults),
      rooms: String(currentSearch.rooms),
      hotelId: hotel.id,
      hotelName: hotel.name,
      price: String(hotel.pricePerNight),
      partner: 'booking',
      product: 'hotels',
      source: 'result_card',
    });
    
    trackAffiliateClick({
      flightId: hotel.id,
      airline: 'Booking.com',
      airlineCode: 'HOTEL',
      origin: 'ZIVO',
      destination: currentSearch.cityName,
      price: hotel.pricePerNight,
      passengers: currentSearch.adults,
      cabinClass: 'standard',
      affiliatePartner: 'booking',
      referralUrl: `/out?${outParams.toString()}`,
      source: 'hotel_result_card',
      ctaType: 'result_card',
      serviceType: 'hotels',
    });
    
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  const pageTitle = currentSearch?.cityName 
    ? `Hotels in ${currentSearch.cityName} | ZIVO`
    : "Search & Compare Hotels | ZIVO";
  
  const pageDescription = "Find hotels worldwide and book securely on partner sites. Compare prices from Booking.com, Expedia, Hotels.com and 500+ partners.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=600&fit=crop&q=80&fm=webp"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-amber-950/50 to-background" />
          </div>

          <div className="relative z-10 py-16 sm:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hotels/20 border border-hotels/30 text-sm font-medium mb-6">
                  <Hotel className="w-4 h-4 text-hotels" />
                  <span className="text-white/80">Compare hotel prices</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Search & Compare <span className="text-hotels">Hotels</span>
                </h1>
                
                <p className="text-lg text-white/70 mb-8">
                  Find hotels worldwide and book securely on partner sites.
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {trustBadges.map((badge) => (
                    <div key={badge.text} className="flex items-center gap-2 text-sm text-white/70">
                      <badge.icon className="w-4 h-4 text-hotels" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Form */}
              <HotelSearchFormPro
                initialCity={city?.slug || ""}
                initialCityDisplay={city?.name || ""}
                className="max-w-5xl mx-auto"
                onSearch={handleSearch}
                navigateOnSearch={false}
              />
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Results Section */}
        {hasSearched && (
          <section className="py-10">
            <div className="container mx-auto px-4">
              <div className="flex gap-6">
                {/* Filters (Desktop Sidebar) */}
                <HotelFiltersComponent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />

                {/* Results */}
                <div className="flex-1">
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">
                        {currentSearch ? `Hotels in ${currentSearch.cityName}` : "Search Results"}
                      </h2>
                      {!isLoading && (
                        <p className="text-sm text-muted-foreground">
                          {results.length} hotels found • Indicative prices*
                        </p>
                      )}
                    </div>
                    
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden">
                      <HotelFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                      />
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoading && <HotelResultsSkeleton />}

                  {/* Results List */}
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
                  {!isLoading && results.length === 0 && hasSearched && (
                    <div className="text-center py-16 bg-muted/30 rounded-xl">
                      <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search for a different destination.
                      </p>
                    </div>
                  )}

                  {/* Partner Redirect Notice */}
                  {results.length > 0 && (
                    <div className="mt-6 p-4 bg-hotels/5 border border-hotels/20 rounded-xl flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-hotels shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        You will be redirected to our trusted travel partner to complete your booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State - Show Popular Destinations */}
        {!hasSearched && (
          <>
            {/* Partner Logos */}
            <PartnerLogosStrip service="hotels" />

            {/* Popular Destinations with Photos */}
            <PhotoDestinationGrid
              service="hotels"
              title="Popular Destinations"
              subtitle="Find hotels in these top cities"
              limit={8}
            />

            {/* Experience Gallery */}
            <ExperienceGallery 
              service="hotels"
              title="Hotel Experiences"
              subtitle="Discover world-class amenities"
              className="bg-muted/20"
            />

            {/* Popular Destinations List */}
            <PopularHotelDestinations />
          </>
        )}

        {/* Testimonials */}
        <UserTestimonials />

        {/* Trust Section */}
        <section className="py-10 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-hotels" />
                <span className="text-sm">Compare options from trusted partners</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-hotels" />
                <span className="text-sm">Secure booking on partner sites</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Support: info@hizivo.com</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-sell */}
        <InternalLinkGrid currentService="hotels" />

        {/* FAQ */}
        <TravelFAQ serviceType="hotels" className="bg-muted/20" />

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
