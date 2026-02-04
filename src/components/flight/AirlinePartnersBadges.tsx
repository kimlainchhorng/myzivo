/**
 * Airline Partners Badges Component
 * Compact and full variants for displaying airline logos
 */

import { premiumAirlines, fullServiceAirlines, type Airline } from "@/data/airlines";
import { Star, Shield, Award } from "lucide-react";
import { AirlineLogo } from "./AirlineLogo";
import { AirlineLogoCard } from "./AirlineLogoCard";

interface AirlinePartnersBadgesProps {
  variant?: 'compact' | 'full';
  showAlliance?: boolean;
}

const topAirlines = [
  ...premiumAirlines.slice(0, 8),
  ...fullServiceAirlines.slice(0, 12),
];

export default function AirlinePartnersBadges({ variant = 'full', showAlliance = true }: AirlinePartnersBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Trusted by:</span>
        <div className="flex -space-x-2">
          {topAirlines.slice(0, 8).map((airline) => (
            <div
              key={airline.code}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-background flex items-center justify-center overflow-hidden"
              title={airline.name}
            >
              <AirlineLogo 
                iataCode={airline.code}
                airlineName={airline.name}
                size={24}
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">+{topAirlines.length - 8} more</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Skytrax Partner</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">IATA Verified</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Award className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Best Price Guarantee</span>
        </div>
      </div>

      {/* Airlines grid using new card component */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {topAirlines.map((airline) => (
          <AirlineLogoCard
            key={airline.code}
            airline={airline}
            size="sm"
            showAlliance={showAlliance && airline.alliance !== 'Independent'}
            showCategory={false}
          />
        ))}
      </div>
    </div>
  );
}
