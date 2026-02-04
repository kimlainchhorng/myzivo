/**
 * Airline Trust Section
 * Premium horizontal scroll carousel with airline logos
 */

import { cn } from "@/lib/utils";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import { Crown, Shield, Globe } from "lucide-react";
import { allAirlines, premiumAirlines, fullServiceAirlines } from "@/data/airlines";

// Get a diverse mix of airlines for the carousel
const carouselAirlines = [
  ...premiumAirlines.slice(0, 8),
  ...fullServiceAirlines.slice(0, 12),
];

// Duplicate for seamless looping
const doubledAirlines = [...carouselAirlines, ...carouselAirlines];

export default function AirlineTrustSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Trusted Worldwide
          </div>
          <h2 className="text-heading-lg mb-3">
            <span className="text-foreground">{allAirlines.length}+</span>{' '}
            <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
              Airline Partners
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Compare prices across all major carriers and alliances
          </p>
        </div>
      </div>

      {/* Alliance Pills */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap px-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
          <Crown className="w-3.5 h-3.5" />
          Star Alliance
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-sm font-medium">
          <Shield className="w-3.5 h-3.5" />
          SkyTeam
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
          <Globe className="w-3.5 h-3.5" />
          Oneworld
        </div>
      </div>

      {/* Infinite Scroll Carousel */}
      <div className="relative group">
        {/* Fade gradients on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-marquee-left will-change-transform">
          {doubledAirlines.map((airline, index) => (
            <div
              key={`${airline.code}-${index}`}
              className={cn(
                "flex-shrink-0 mx-2 sm:mx-3",
                "flex flex-col items-center gap-2 px-4 py-3 rounded-xl",
                "bg-card/80 backdrop-blur-sm border border-border/50",
                "hover:border-primary/40 hover:shadow-md transition-all duration-300",
                "min-w-[100px] sm:min-w-[120px]",
                airline.category === 'premium' && "ring-1 ring-amber-500/20"
              )}
            >
              {/* Premium indicator */}
              {airline.category === 'premium' && (
                <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              )}
              
              {/* Logo */}
              <div className="relative">
                <AirlineLogo
                  iataCode={airline.code}
                  airlineName={airline.name}
                  size={40}
                  className="rounded-lg bg-white"
                />
              </div>
              
              {/* Name */}
              <span className="text-xs sm:text-sm font-medium text-foreground/80 text-center leading-tight truncate max-w-full">
                {airline.name}
              </span>
              
              {/* Alliance badge */}
              {airline.alliance && airline.alliance !== 'Independent' && (
                <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                  {airline.alliance}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto px-4">
        ZIVO searches across {allAirlines.length}+ airlines to find you the best prices. Prices shown are estimates; final terms confirmed at checkout.
      </p>
    </section>
  );
}
