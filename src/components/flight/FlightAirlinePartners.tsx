/**
 * Flight Airline Partners Section
 * Modern grid display with alliance filtering
 */

import { Badge } from "@/components/ui/badge";
import { Globe, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AirlineLogoCard } from "./AirlineLogoCard";
import { topAirlines, allAirlines } from "@/data/airlines";

const FlightAirlinePartners = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-blue-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Global Partners
          </div>
          <h2 className="text-heading-lg mb-4">
            <span className="text-foreground">{allAirlines.length}+</span>{' '}
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Airline Partners
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare prices across all major airlines worldwide
          </p>
        </div>

        {/* Airlines Grid using new card component */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {topAirlines.slice(0, 18).map((airline, index) => (
            <div
              key={airline.code}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <AirlineLogoCard
                airline={airline}
                size="md"
                showAlliance={true}
                showCategory={false}
              />
            </div>
          ))}
        </div>

        {/* Alliance badges */}
        <div className="flex justify-center gap-3 sm:gap-4 mt-8 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            <Star className="w-3 h-3 text-amber-500" />
            Star Alliance
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            <Globe className="w-3 h-3 text-sky-500" />
            SkyTeam
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            <Crown className="w-3 h-3 text-rose-500" />
            Oneworld
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default FlightAirlinePartners;
