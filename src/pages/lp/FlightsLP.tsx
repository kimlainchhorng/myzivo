/**
 * HIZIVO Flights Landing Page (Ads-Optimized)
 * 
 * Compliant landing page for Google Ads & Meta Ads
 * - Real travel images
 * - Clear partner checkout language
 * - Proper disclaimers
 * - Conversion tracking
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plane, Search, ArrowRight, Shield, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import LPComplianceFooter from "@/components/lp/LPComplianceFooter";
import { heroPhotos, lifestylePhotos, destinationPhotos } from "@/config/photos";
import { FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { trackPageView, trackSearchSubmitted } from "@/lib/conversionTracking";
import { cn } from "@/lib/utils";

export default function FlightsLP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track page view on mount
  useEffect(() => {
    trackPageView({ service: 'flights' });
  }, []);

  // Preserve UTM params when navigating
  const handleSearch = () => {
    trackSearchSubmitted({ service: 'flights' });
    navigate(`/flights${location.search}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search Flights – ZIVO"
        description="Search flight prices from global airlines. Book securely on ZIVO with instant e-tickets."
        noIndex={true}
      />
      
      {/* Hero Section with Real Image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroPhotos.flights.src}
            alt={heroPhotos.flights.alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/80 via-sky-900/70 to-slate-950/90" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Plane className="w-8 h-8 text-white" />
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Compare Flight Prices
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
              Search real-time prices from global airlines. Book securely with trusted partners.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                500+ Airlines
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Trusted Partners
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Secure Booking
              </span>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={handleSearch}
              size="lg"
              className={cn(
                "h-14 px-10 text-lg font-semibold gap-3",
                "bg-white text-sky-900 hover:bg-white/90",
                "shadow-2xl shadow-black/30",
                "transition-all duration-300 hover:scale-105"
              )}
            >
              <Search className="w-5 h-5" />
              Search Flights
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            {/* Partner Disclosure */}
            <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-lg mx-auto">
              <div className="flex items-start gap-3 text-left">
                <ExternalLink className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">
                  ZIVO helps you find flights from trusted travel partners. 
                  Complete your booking securely on our partner's checkout.
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
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter your travel details and browse real-time options from global airlines.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Select</h3>
              <p className="text-sm text-muted-foreground">
                View final prices, baggage, and fare rules before booking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Book Securely</h3>
              <p className="text-sm text-muted-foreground">
                Complete your booking on our partner's secure checkout page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Popular Destinations</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {(['new-york', 'london', 'paris', 'tokyo'] as const).map((city) => (
              <div 
                key={city}
                className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                onClick={handleSearch}
              >
                <img
                  src={destinationPhotos[city].src}
                  alt={destinationPhotos[city].alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-semibold text-lg">{destinationPhotos[city].city}</p>
                  <p className="text-sm text-white/70">{destinationPhotos[city].country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flight Disclaimer Banner - LOCKED TEXT */}
      <section className="py-4 bg-amber-500/10 border-y border-amber-500/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground font-medium">
            ⚠️ {FLIGHT_DISCLAIMERS.ticketing}
          </p>
        </div>
      </section>

      <LPComplianceFooter />
    </div>
  );
}
