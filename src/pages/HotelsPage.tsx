/**
 * Premium Hotels Page
 * Conversion-focused layout with search, filters, and partner CTAs
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Hotel, Shield, CheckCircle, Clock, ExternalLink, Search as SearchIcon, Star, Globe, Users, BadgeDollarSign, Heart, MapPin, Crown, Sparkles, Bell, Award, ChevronRight, DollarSign, Zap, BadgePercent, CalendarDays, Eye } from "lucide-react";
import { format, addDays } from "date-fns";
import { motion } from "framer-motion";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";
import ServiceDisclaimer from "@/components/shared/ServiceDisclaimer";
import HotelFeaturesGrid from "@/components/hotel/HotelFeaturesGrid";
import HotelComplianceFooter from "@/components/hotel/HotelComplianceFooter";

// Scroll animation wrapper
const FadeIn = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const trustBadges = [
  { icon: Shield, text: "Secure booking with partners" },
  { icon: CheckCircle, text: "No booking fees on ZIVO" },
  { icon: Clock, text: "24/7 customer support" },
];

// Hotel Stats Bar
const HotelStatsBar = () => {
  const stats = [
    { icon: Hotel, value: "2M+", label: "Properties", borderColor: "border-t-[hsl(var(--hotels))]", iconBg: "bg-[hsl(var(--hotels-light))]", iconColor: "text-[hsl(var(--hotels))]" },
    { icon: Globe, value: "150+", label: "Countries", borderColor: "border-t-primary", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { icon: Star, value: "4.8", label: "Avg Rating", borderColor: "border-t-amber-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
    { icon: BadgeDollarSign, value: "30%", label: "Avg Savings", borderColor: "border-t-emerald-500", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-6">The world's best hotels at your fingertips</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <div className={`p-6 card-premium border-t-[3px] ${stat.borderColor}`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const defaultFilters: HotelFilters = {
  priceRange: [0, 500],
  starRating: [],
  guestRating: null,
  amenities: [],
  propertyType: [],
  distance: null,
  payAtHotelOnly: false,
  freeCancellation: false,
};

export default function HotelsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialCityParam = searchParams.get("destination") || searchParams.get("city") || "";
  const city = getCityBySlug(initialCityParam) || (initialCityParam ? { 
    slug: cityNameToSlug(initialCityParam), 
    name: initialCityParam 
  } : null);
  
  const [filters, setFilters] = useState<HotelFilters>(defaultFilters);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { isLoading, results, searchParams: currentSearch, search, applyFilters, whitelabelUrl } = useRealHotelSearch();

  // === NEW: Booking.com/Airbnb-inspired state ===
  const [showMapView, setShowMapView] = useState(false);
  const [geniusLevel, setGeniusLevel] = useState(2);
  const [showGeniusBanner, setShowGeniusBanner] = useState(true);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [showLastMinuteDeals, setShowLastMinuteDeals] = useState(false);
  const [priceMatch, setPriceMatch] = useState(false);
  const [showPropertyTypes, setShowPropertyTypes] = useState(false);
  const [showLoyaltyWidget, setShowLoyaltyWidget] = useState(false);
  const [nightsStayed] = useState(12);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showGuestReviews, setShowGuestReviews] = useState(false);
  const [showHostInfo, setShowHostInfo] = useState(false);
  const [flexibleCancellation, setFlexibleCancellation] = useState(true);
  const [payAtHotel, setPayAtHotel] = useState(false);
  const [showSecretDeals, setShowSecretDeals] = useState(false);

  // Property types (Airbnb-style)
  const propertyTypes = [
    { id: "hotel", label: "Hotels", icon: "🏨", count: 1245 },
    { id: "apartment", label: "Apartments", icon: "🏢", count: 876 },
    { id: "villa", label: "Villas", icon: "🏡", count: 342 },
    { id: "resort", label: "Resorts", icon: "🏖️", count: 198 },
    { id: "hostel", label: "Hostels", icon: "🛏️", count: 567 },
    { id: "cabin", label: "Cabins", icon: "🏔️", count: 123 },
    { id: "boutique", label: "Boutique", icon: "✨", count: 234 },
    { id: "bnb", label: "B&Bs", icon: "🏠", count: 456 },
  ];

  // Last-minute deals mock
  const lastMinuteDeals = [
    { name: "The Grand Plaza", city: "New York", originalPrice: 289, dealPrice: 189, discount: 35, stars: 5, rating: 9.2 },
    { name: "Seaside Resort & Spa", city: "Miami", originalPrice: 199, dealPrice: 129, discount: 35, stars: 4, rating: 8.8 },
    { name: "Urban Loft Hotel", city: "Chicago", originalPrice: 159, dealPrice: 99, discount: 38, stars: 3, rating: 8.5 },
  ];

  // Guest review highlights mock
  const reviewHighlights = [
    { category: "Cleanliness", score: 9.4, icon: "🧹" },
    { category: "Location", score: 9.1, icon: "📍" },
    { category: "Value", score: 8.7, icon: "💰" },
    { category: "Service", score: 9.3, icon: "🛎️" },
  ];

  useEffect(() => {
    if (city && !hasSearched) {
      const checkIn = addDays(new Date(), 7);
      const checkOut = addDays(new Date(), 10);
      handleSearch({ citySlug: city.slug, cityName: city.name, checkIn, checkOut, adults: 2, rooms: 1 });
    }
  }, [city?.slug]);

  const handleSearch = async (params: HotelSearchParams) => {
    setHasSearched(true);
    await search({ citySlug: params.citySlug, cityName: params.cityName, checkIn: format(params.checkIn, 'yyyy-MM-dd'), checkOut: format(params.checkOut, 'yyyy-MM-dd'), adults: params.adults, rooms: params.rooms }, filters);
  };

  const handleFilterChange = (newFilters: HotelFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleViewDeal = (hotel: HotelResult) => {
    if (!currentSearch) return;
    const outParams = new URLSearchParams({
      city: currentSearch.citySlug, cityName: currentSearch.cityName, checkin: currentSearch.checkIn, checkout: currentSearch.checkOut, adults: String(currentSearch.adults), rooms: String(currentSearch.rooms), hotelId: hotel.id, hotelName: hotel.name, price: String(hotel.pricePerNight), partner: 'booking', product: 'hotels', source: 'result_card',
    });
    trackAffiliateClick({ flightId: hotel.id, airline: 'Booking.com', airlineCode: 'HOTEL', origin: 'ZIVO', destination: currentSearch.cityName, price: hotel.pricePerNight, passengers: currentSearch.adults, cabinClass: 'standard', affiliatePartner: 'booking', referralUrl: `/out?${outParams.toString()}`, source: 'hotel_result_card', ctaType: 'result_card', serviceType: 'hotels' });
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  };

  const pageTitle = currentSearch?.cityName ? `Hotels in ${currentSearch.cityName} | ZIVO` : "Search & Compare Hotels | ZIVO";
  const pageDescription = "Find hotels worldwide and book securely on partner sites. Compare prices from Booking.com, Expedia, Hotels.com and 500+ partners.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description={pageDescription} />
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=600&fit=crop&q=80&fm=webp" alt="Luxury hotel lobby" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-amber-950/50 to-background" />
          </div>

          <div className="relative z-10 py-16 sm:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hotels/20 border border-hotels/30 text-sm font-medium mb-6">
                  <Hotel className="w-4 h-4 text-hotels" />
                  <span className="text-white/80">Compare hotel prices</span>
                </motion.div>
                
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Compare Hotels Worldwide — <span className="text-hotels">Book Securely with Partners</span>
                </motion.h1>
                
                <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-white/70 mb-8">
                  Search real-time hotel prices and complete booking securely with licensed partners.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap justify-center gap-4 mb-8">
                  {trustBadges.map((badge) => (
                    <div key={badge.text} className="flex items-center gap-2 text-sm text-white/70 shimmer-chip px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <badge.icon className="w-4 h-4 text-hotels" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <HotelSearchFormPro initialCity={city?.slug || ""} initialCityDisplay={city?.name || ""} className="max-w-5xl mx-auto" onSearch={handleSearch} navigateOnSearch={false} />
              </motion.div>
              
              <p className="text-center text-sm text-white/60 mt-4 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Final booking completed on partner site.
              </p>
              <div className="mt-6 max-w-2xl mx-auto">
                <p className="text-center text-xs text-white/50">Hizivo is not the merchant of record. Hotel bookings are completed with licensed third-party providers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* === BOOKING/AIRBNB FEATURES === */}

        {/* Genius Loyalty Banner (Booking.com) */}
        {showGeniusBanner && (
          <section className="py-4 bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-sky-500/20">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      ZIVO Genius Level {geniusLevel}
                      <Badge className="bg-sky-500/20 text-sky-500 border-0 text-[9px]">10% off select stays</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">{nightsStayed} nights stayed · {20 - nightsStayed} more for Level 3</p>
                  </div>
                </div>
                <button onClick={() => setShowGeniusBanner(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
            </div>
          </section>
        )}

        {/* Property Type Filters (Airbnb) */}
        <section className="py-4 border-b border-border/30 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {propertyTypes.map(pt => (
                <button key={pt.id} onClick={() => navigate(`/hotels?type=${pt.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border border-border/40 bg-card hover:border-primary/40 transition-all hover:scale-105">
                  <span className="text-xl">{pt.icon}</span>
                  <span className="text-[10px] font-bold text-foreground">{pt.label}</span>
                  <span className="text-[9px] text-muted-foreground">{pt.count}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Map / List Toggle + Filters */}
        <section className="py-3 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex gap-2">
                <button onClick={() => setShowMapView(false)}
                  className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    !showMapView ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
                  📋 List
                </button>
                <button onClick={() => { setShowMapView(true); toast.info("🗺️ Map view — see hotels on the map"); }}
                  className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    showMapView ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
                  🗺️ Map
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setFlexibleCancellation(!flexibleCancellation); }}
                  className={cn("px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                    flexibleCancellation ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                  ✓ Free Cancellation
                </button>
                <button onClick={() => { setPayAtHotel(!payAtHotel); }}
                  className={cn("px-3 py-2 rounded-xl text-[10px] font-bold transition-all",
                    payAtHotel ? "bg-sky-500/10 text-sky-500 border border-sky-500/30" : "bg-muted/50 text-muted-foreground border border-border/40")}>
                  🏨 Pay at Hotel
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Secret Deals / Last-Minute (Booking.com) */}
        <section className="py-6 border-b border-border/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
          <div className="container mx-auto px-4">
            <button onClick={() => setShowLastMinuteDeals(!showLastMinuteDeals)}
              className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all mb-4">
              <Zap className="w-4 h-4 text-amber-500" /> Last-Minute Deals — Up to 40% Off Tonight
              <Badge className="bg-red-500/10 text-red-500 border-0 text-[9px] animate-pulse">LIVE</Badge>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showLastMinuteDeals && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showLastMinuteDeals && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-4">
                    {lastMinuteDeals.map(deal => (
                      <motion.div key={deal.name} whileHover={{ scale: 1.02 }}
                        className="rounded-2xl bg-card border border-border/40 p-4 hover:border-amber-500/40 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">{Array.from({ length: deal.stars }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</div>
                          <Badge className="bg-red-500/10 text-red-500 border-0 text-[9px]">-{deal.discount}%</Badge>
                        </div>
                        <p className="text-sm font-bold text-foreground">{deal.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{deal.city}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground line-through">${deal.originalPrice}</span>
                          <span className="text-lg font-bold text-emerald-500">${deal.dealPrice}</span>
                          <span className="text-[10px] text-muted-foreground">/night</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-[10px] bg-sky-500/10 text-sky-500 px-1.5 py-0.5 rounded font-bold">{deal.rating}</span>
                          <span className="text-[10px] text-muted-foreground">Excellent</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Guest Review Highlights (Booking.com/Airbnb) */}
        <section className="py-6 border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-500" /> Guest Review Highlights
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reviewHighlights.map(r => (
                  <div key={r.category} className="rounded-xl bg-card border border-border/40 p-3 text-center">
                    <span className="text-lg">{r.icon}</span>
                    <p className="text-sm font-bold text-foreground mt-1">{r.score}</p>
                    <p className="text-[10px] text-muted-foreground">{r.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Price Match Guarantee (Booking.com) */}
        <section className="py-4 border-b border-border/30 bg-emerald-500/5">
          <div className="container mx-auto px-4 text-center">
            <button onClick={() => { setPriceMatch(true); toast.success("✅ Price Match Guarantee activated!"); }}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500">
              <Shield className="w-4 h-4" /> Price Match Guarantee — Find a lower price? We'll match it!
              {priceMatch && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* Stats Bar */}
        <HotelStatsBar />

        {/* Trust Bar */}
        <GlobalTrustBar variant="compact" />

        {/* Results Section */}
        {hasSearched && (
          <section className="py-10">
            <div className="container mx-auto px-4">
              <div className="flex gap-6">
                <HotelFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{currentSearch ? `Hotels in ${currentSearch.cityName}` : "Search Results"}</h2>
                      {!isLoading && <p className="text-sm text-muted-foreground">{results.length} hotels found • Indicative prices*</p>}
                    </div>
                    <div className="lg:hidden"><HotelFiltersComponent filters={filters} onFilterChange={handleFilterChange} /></div>
                  </div>
                  {isLoading && <HotelResultsSkeleton />}
                  {!isLoading && results.length > 0 && (
                    <div className="space-y-4">{results.map((hotel) => <HotelResultCard key={hotel.id} hotel={hotel} onViewDeal={handleViewDeal} />)}</div>
                  )}
                  {!isLoading && results.length === 0 && hasSearched && (
                    <div className="text-center py-16 bg-muted/30 rounded-xl">
                      <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                      <p className="text-muted-foreground mb-4">Try adjusting your filters or search for a different destination.</p>
                    </div>
                  )}
                  {results.length > 0 && (
                    <div className="mt-6 p-4 bg-hotels/5 border border-hotels/20 rounded-xl flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-hotels shrink-0" />
                      <p className="text-sm text-muted-foreground">You will be redirected to our trusted travel partner to complete your booking.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <>
            <FadeIn>
              <section className="py-12 bg-hotels/5">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Tonight's Deals</h2>
                    <p className="text-muted-foreground">Last-minute hotel deals for tonight</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                    {["Boutique", "Resort", "Business", "Budget"].map((cat) => (
                      <button key={cat} onClick={() => navigate(`/hotels?category=${cat.toLowerCase()}`)} className="px-5 py-2.5 rounded-full border border-hotels/30 text-sm font-medium hover:bg-hotels/10 hover:border-hotels/50 transition-all glow-border-hover">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn><PartnerLogosStrip service="hotels" /></FadeIn>
            <FadeIn><HotelFeaturesGrid className="border-b border-border/50 bg-muted/5" /></FadeIn>
            <FadeIn><PhotoDestinationGrid service="hotels" title="Popular Destinations" subtitle="Find hotels in these top cities" limit={8} /></FadeIn>
            <FadeIn><ExperienceGallery service="hotels" title="Hotel Experiences" subtitle="Discover world-class amenities" className="bg-muted/20" /></FadeIn>
            <FadeIn><PopularHotelDestinations /></FadeIn>
          </>
        )}

        <FadeIn><UserTestimonials /></FadeIn>

        <section className="py-10 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4 text-hotels" /><span className="text-sm">Compare options from trusted partners</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="w-4 h-4 text-hotels" /><span className="text-sm">Secure booking on partner sites</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><span className="text-sm">Support: info@hizivo.com</span></div>
            </div>
          </div>
        </section>

        <FadeIn><InternalLinkGrid currentService="hotels" /></FadeIn>
        <FadeIn><TravelFAQ serviceType="hotels" className="bg-muted/20" /></FadeIn>

        <section className="py-8 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">*Prices shown are indicative estimates. Final prices are displayed on partner booking sites. ZIVO may earn a commission when users book through partner links.</p>
          </div>
        </section>

        <ServiceDisclaimer type="travel" />
        <HotelComplianceFooter />
      </main>
      
      <Footer />
    </div>
  );
}
