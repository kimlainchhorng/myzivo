/**
 * HIZIVO Car Rentals Landing Page (Ads-Optimized)
 * 
 * Compliant landing page for Google Ads & Meta Ads
 * - Real travel images
 * - Clear partner checkout language
 * - Proper disclaimers
 * - Conversion tracking
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, Search, ArrowRight, Shield, ExternalLink, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import LPComplianceFooter from "@/components/lp/LPComplianceFooter";
import { heroPhotos, carCategoryPhotos, additionalHeroPhotos } from "@/config/photos";
import { CAR_DISCLAIMERS } from "@/config/carCompliance";
import { trackPageView, trackSearchSubmitted } from "@/lib/conversionTracking";
import { cn } from "@/lib/utils";

export default function CarsLP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track page view on mount
  useEffect(() => {
    trackPageView({ service: 'cars' });
  }, []);

  // Preserve UTM params when navigating
  const handleSearch = () => {
    trackSearchSubmitted({ service: 'cars' });
    navigate(`/rent-car${location.search}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Compare Car Rentals – ZIVO"
        description="Compare car rental prices from trusted partners. Search, compare, and book securely on partner sites."
        noIndex={true}
      />
      
      {/* Hero Section with Real Image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroPhotos.cars.src}
            alt={heroPhotos.cars.alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/80 via-violet-900/70 to-slate-950/90" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Car className="w-8 h-8 text-white" />
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Compare Car Rentals
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
              Find the best rental car deals from trusted partners worldwide.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                50,000+ Locations
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Trusted Partners
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Free Cancellation
              </span>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={handleSearch}
              size="lg"
              className={cn(
                "h-14 px-10 text-lg font-semibold gap-3",
                "bg-white text-violet-900 hover:bg-white/90",
                "shadow-2xl shadow-black/30",
                "transition-all duration-200 hover:scale-110"
              )}
            >
              <Search className="w-5 h-5" />
              Search Cars
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            {/* Partner Disclosure */}
            <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-lg mx-auto">
              <div className="flex items-start gap-3 text-left">
                <ExternalLink className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">
                  ZIVO compares car rentals from licensed partners. When you're ready to book, 
                  you'll be redirected to our partner's secure checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter your pickup location and dates to find available cars.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Compare</h3>
              <p className="text-sm text-muted-foreground">
                Browse vehicles, check features, and compare prices from our partners.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Book Securely</h3>
              <p className="text-sm text-muted-foreground">
                Complete your booking on our partner's secure checkout page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Vehicle Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {(['economy', 'suv', 'luxury', 'electric'] as const).map((category) => (
              <div 
                key={category}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
                onClick={handleSearch}
              >
                <img
                  src={carCategoryPhotos[category].src}
                  alt={carCategoryPhotos[category].alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-semibold text-lg">{carCategoryPhotos[category].label}</p>
                  <p className="text-sm text-white/70">{carCategoryPhotos[category].passengers} passengers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Road Trip Banner */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div 
            className="relative rounded-3xl overflow-hidden cursor-pointer"
            onClick={handleSearch}
          >
            <img
              src={additionalHeroPhotos.roadTrip.src}
              alt={additionalHeroPhotos.roadTrip.alt}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Plan Your Road Trip</h3>
                <p className="text-white/80 mb-4">Compare rental options for your next adventure</p>
                <Button className="bg-white text-violet-900 hover:bg-white/90">
                  <Search className="w-4 h-4 mr-2" />
                  Search Cars
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Car Rental Disclaimer Banner - LOCKED TEXT */}
      <section className="py-4 bg-violet-500/10 border-y border-violet-500/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-violet-500" /> {CAR_DISCLAIMERS.partnerBooking}
          </p>
        </div>
      </section>

      <LPComplianceFooter />
    </div>
  );
}
