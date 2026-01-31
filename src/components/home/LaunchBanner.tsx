import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OFFICIAL LAUNCH BANNER
 * Premium announcement banner for ZIVO launch
 */

export default function LaunchBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-teal-500 to-cyan-500">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.1)_0%,_transparent_60%)]" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-[10%] w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-8 right-[20%] w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-6 left-[30%] w-1 h-1 bg-white/25 rounded-full animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-5 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          {/* Left: Announcement */}
          <div className="flex items-center gap-3 text-center lg:text-left">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg sm:text-xl leading-tight">
                ZIVO is Live — Search & Compare Travel Worldwide
              </h2>
              <p className="text-white/80 text-sm mt-0.5 hidden sm:block">
                Compare flights, hotels, and car rentals from trusted travel partners. No booking fees on ZIVO.
              </p>
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link to="/book-flight">
              <Button 
                size="sm" 
                className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 h-9 px-4 rounded-lg shadow-lg"
              >
                <Plane className="w-4 h-4" />
                <span className="hidden xs:inline">Search</span> Flights
              </Button>
            </Link>
            <Link to="/book-hotel">
              <Button 
                size="sm" 
                className="bg-white/15 text-white hover:bg-white/25 border border-white/30 font-semibold gap-2 h-9 px-4 rounded-lg"
              >
                <Hotel className="w-4 h-4" />
                <span className="hidden xs:inline">Search</span> Hotels
              </Button>
            </Link>
            <Link to="/rent-car">
              <Button 
                size="sm" 
                className="bg-white/15 text-white hover:bg-white/25 border border-white/30 font-semibold gap-2 h-9 px-4 rounded-lg"
              >
                <CarFront className="w-4 h-4" />
                Rent a Car
              </Button>
            </Link>
          </div>
        </div>

        {/* Partner note */}
        <div className="flex items-center justify-center gap-1.5 mt-3 text-white/60 text-xs">
          <ExternalLink className="w-3 h-3" />
          <span>Booking completed on partner sites</span>
        </div>
      </div>
    </section>
  );
}
