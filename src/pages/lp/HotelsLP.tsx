/**
 * HIZIVO Hotels Landing Page (Ads-Optimized)
 * 
 * Compliant landing page for Google Ads & Meta Ads
 * - Real travel images
 * - Clear partner checkout language
 * - Proper disclaimers
 * - Conversion tracking
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Hotel, Search, ArrowRight, Shield, ExternalLink, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import LPComplianceFooter from "@/components/lp/LPComplianceFooter";
import { heroPhotos, destinationPhotos, additionalHeroPhotos } from "@/config/photos";
import { HOTEL_DISCLAIMERS } from "@/config/hotelCompliance";
import { trackPageView, trackSearchSubmitted } from "@/lib/conversionTracking";
import { cn } from "@/lib/utils";

export default function HotelsLP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track page view on mount
  useEffect(() => {
    trackPageView({ service: 'hotels' });
  }, []);

  // Preserve UTM params when navigating
  const handleSearch = () => {
    trackSearchSubmitted({ service: 'hotels' });
    navigate(`/hotels${location.search}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Search & Compare Hotels – ZIVO"
        description="Compare hotel prices from trusted travel partners. Search, compare, and book securely on partner sites."
        noIndex={true}
      />
      
      {/* Hero Section with Real Image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroPhotos.hotels.src}
            alt={heroPhotos.hotels.alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/80 via-amber-900/70 to-slate-950/90" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Hotel className="w-8 h-8 text-white" />
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Search & Compare Hotels
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
              Find the perfect stay from trusted accommodation partners worldwide.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                1M+ Hotels
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Trusted Partners
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                Best Rates
              </span>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={handleSearch}
              size="lg"
              className={cn(
                "h-14 px-10 text-lg font-semibold gap-3",
                "bg-white text-amber-900 hover:bg-white/90",
                "shadow-2xl shadow-black/30",
                "transition-all duration-300 hover:scale-105"
              )}
            >
              <Search className="w-5 h-5" />
              Search Hotels
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            {/* Partner Disclosure */}
            <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 max-w-lg mx-auto">
              <div className="flex items-start gap-3 text-left">
                <ExternalLink className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">
                  ZIVO compares hotels from licensed partners. When you're ready to book, 
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
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter your destination and dates to find available hotels.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Compare</h3>
              <p className="text-sm text-muted-foreground">
                Browse hotels, check amenities, and compare prices from our partners.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Book Securely</h3>
              <p className="text-sm text-muted-foreground">
                Complete your booking on our partner's secure checkout page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Featured Stays</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer"
              onClick={handleSearch}
            >
              <img
                src={additionalHeroPhotos.beachResort.src}
                alt={additionalHeroPhotos.beachResort.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-lg">Beach Resorts</p>
                <p className="text-sm text-white/70">Tropical getaways</p>
              </div>
            </div>
            
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer"
              onClick={handleSearch}
            >
              <img
                src={additionalHeroPhotos.hotelRoom.src}
                alt={additionalHeroPhotos.hotelRoom.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-semibold text-lg">Luxury Hotels</p>
                <p className="text-sm text-white/70">Premium stays worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Disclaimer Banner - LOCKED TEXT */}
      <section className="py-4 bg-amber-500/10 border-y border-amber-500/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground font-medium">
            ⚠️ {HOTEL_DISCLAIMERS.partnerBooking}
          </p>
        </div>
      </section>

      <LPComplianceFooter />
    </div>
  );
}
