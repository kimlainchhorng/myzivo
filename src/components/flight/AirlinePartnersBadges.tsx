import { premiumAirlines, fullServiceAirlines, getAirlineLogo, type Airline } from "@/data/airlines";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Award } from "lucide-react";

interface AirlinePartnersBadgesProps {
  variant?: 'compact' | 'full';
  showAlliance?: boolean;
}

const topAirlines = [
  ...premiumAirlines.slice(0, 8),
  ...fullServiceAirlines.slice(0, 6),
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
              <img 
                src={getAirlineLogo(airline.code, 32)} 
                alt={airline.name}
                className="w-6 h-6 object-contain"
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">+50 more</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium text-amber-500">Skytrax Partner</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">IATA Verified</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Award className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">Best Price Guarantee</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {topAirlines.map((airline) => (
          <div
            key={airline.code}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <img 
              src={getAirlineLogo(airline.code, 40)} 
              alt={airline.name}
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{airline.name}</span>
              {showAlliance && airline.alliance && airline.alliance !== 'Independent' && (
                <span className="text-[10px] text-muted-foreground">{airline.alliance}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
