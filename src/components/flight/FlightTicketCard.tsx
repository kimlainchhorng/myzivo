import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Clock, 
  Wifi, 
  Coffee, 
  Tv, 
  Luggage,
  Star,
  Shield,
  Sparkles,
  Zap,
  ChevronRight,
  Crown,
  Check,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getAirlineLogo as getCDNLogo } from "@/data/airlines";

interface FlightTicketCardProps {
  flight: {
    id: string | number;
    airline: string;
    airlineLogo?: string;
    airlineCode?: string;
    flightNumber: string;
    departure: { time: string; city: string; code: string; terminal?: string };
    arrival: { time: string; city: string; code: string; terminal?: string };
    duration: string;
    stops: number;
    stopCity?: string;
    stopCities?: string[];
    price: number;
    premiumEconomyPrice?: number;
    businessPrice?: number;
    firstPrice?: number;
    class: string;
    amenities: string[];
    seatsLeft?: number;
    isLowest?: boolean;
    isFastest?: boolean;
    co2?: string;
    carbonOffset?: number;
    category?: 'premium' | 'full-service' | 'low-cost';
    alliance?: string;
    aircraft?: string;
    onTimePerformance?: number;
    baggageIncluded?: string;
    refundable?: boolean;
    wifi?: boolean;
    entertainment?: boolean;
    meals?: boolean;
    legroom?: string;
    logo?: string;
    bookingLink?: string;
    isRealPrice?: boolean;
  };
  onSelect?: () => void;
  isSelected?: boolean;
}

// Premium airlines that get the crown badge
const premiumAirlineNames = [
  'Singapore Airlines', 'Emirates', 'Qatar Airways', 'Cathay Pacific', 
  'ANA', 'Japan Airlines', 'Etihad Airways', 'Air New Zealand', 
  'Qantas', 'Korean Air', 'Turkish Airlines', 'EVA Air', 'Virgin Atlantic'
];

// Get airline logo from CDN with multiple size options
const getAirlineLogo = (code: string, size: number = 100) => {
  return getCDNLogo(code, size);
};

const FlightTicketCard = ({ flight, onSelect, isSelected }: FlightTicketCardProps) => {
  const [logoError, setLogoError] = useState(false);
  const isPremiumAirline = flight.category === 'premium' || premiumAirlineNames.includes(flight.airline);
  
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-3.5 h-3.5" />;
      case "entertainment": return <Tv className="w-3.5 h-3.5" />;
      case "meals": return <Coffee className="w-3.5 h-3.5" />;
      case "lounge": return <Luggage className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 transition-all duration-500",
        isSelected 
          ? "border-sky-500 bg-gradient-to-r from-sky-500/10 to-blue-500/5 shadow-2xl shadow-sky-500/30 ring-2 ring-sky-500/20" 
          : isPremiumAirline
            ? "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/20"
            : "border-border/50 bg-card/80 backdrop-blur-xl hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/15"
      )}
    >
      {/* Premium glow effect */}
      {isPremiumAirline && !isSelected && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Ticket perforated edge effect */}
      <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-around py-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={cn(
            "w-2.5 h-2.5 rounded-full",
            isSelected ? "bg-sky-500/20" : "bg-background"
          )} />
        ))}
      </div>

      <div className="pl-8 pr-5 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-52">
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center ring-2 overflow-hidden bg-gradient-to-br",
                isPremiumAirline 
                  ? "from-amber-500/30 to-yellow-600/20 ring-amber-500/40 shadow-lg shadow-amber-500/20" 
                  : "from-sky-500/20 to-blue-600/20 ring-sky-500/30 shadow-lg shadow-sky-500/10"
              )}>
                {flight.airlineCode && !logoError ? (
                  <img 
                    src={getAirlineLogo(flight.airlineCode)}
                    alt={flight.airline}
                    className="w-full h-full object-contain p-2"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-3xl">{flight.airlineLogo || "✈️"}</span>
                )}
              </div>
              {isPremiumAirline && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-background">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {flight.isLowest && !isPremiumAirline && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-2 ring-background">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-base">{flight.airline}</p>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">{flight.flightNumber}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-muted-foreground">{isPremiumAirline ? '4.9' : '4.5'}</span>
                </div>
                {flight.alliance && flight.alliance !== 'Independent' && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
                    {flight.alliance}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex-1 flex items-center gap-4 sm:gap-8">
            {/* Departure */}
            <div className="text-center min-w-[80px]">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">{flight.departure.time}</p>
              <p className="text-sm font-bold text-sky-500">{flight.departure.code}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[90px]">{flight.departure.city}</p>
            </div>

            {/* Flight Path Visual */}
            <div className="flex-1 flex flex-col items-center relative px-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold">{flight.duration}</span>
              </div>
              
              <div className="w-full flex items-center relative">
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-lg",
                  isSelected ? "bg-sky-500 shadow-sky-500/50" : "bg-sky-400"
                )} />
                <div className={cn(
                  "flex-1 h-0.5 relative",
                  isSelected 
                    ? "bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500" 
                    : "bg-gradient-to-r from-sky-400/80 via-sky-500 to-sky-400/80"
                )}>
                  {/* Dashed line effect */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsl(var(--background))_8px,hsl(var(--background))_12px)] opacity-30" />
                  
                  {/* Animated plane */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isSelected 
                        ? "bg-sky-500 shadow-lg shadow-sky-500/50" 
                        : "bg-gradient-to-r from-sky-500 to-blue-500 shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform"
                    )}>
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Stop indicator */}
                  {flight.stops > 0 && (
                    <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 border-2 border-background flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">{flight.stops}</span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full shadow-lg",
                  isSelected ? "bg-sky-500 shadow-sky-500/50" : "bg-sky-400"
                )} />
              </div>
              
              <p className="text-xs mt-2 font-medium">
                {flight.stops === 0 ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Direct Flight
                  </span>
                ) : (
                  <span className="text-amber-500">
                    {flight.stops} stop{flight.stops > 1 ? "s" : ""} 
                    {flight.stopCities && flight.stopCities.length > 0 
                      ? <span className="text-muted-foreground"> • {flight.stopCities.join(', ')}</span>
                      : flight.stopCity && <span className="text-muted-foreground"> • {flight.stopCity}</span>
                    }
                  </span>
                )}
              </p>
              {flight.aircraft && (
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{flight.aircraft}</p>
              )}
            </div>

            {/* Arrival */}
            <div className="text-center min-w-[80px]">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">{flight.arrival.time}</p>
              <p className="text-sm font-bold text-sky-500">{flight.arrival.code}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[90px]">{flight.arrival.city}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {flight.amenities.slice(0, 4).map((amenity, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-default",
                    isSelected 
                      ? "bg-sky-500/20 text-sky-400"
                      : "bg-muted/60 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10"
                  )}
                  title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                >
                  {getAmenityIcon(amenity)}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>{flight.refundable ? 'Free cancellation' : 'Non-refundable'}</span>
              </div>
              {flight.onTimePerformance && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{flight.onTimePerformance}% on-time</span>
                </div>
              )}
              {flight.baggageIncluded && (
                <div className="flex items-center gap-1.5">
                  <Luggage className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{flight.baggageIncluded}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="lg:w-44 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l-2 border-dashed border-border/50 lg:pl-6">
            <div className="text-right">
              {/* Badges */}
              <div className="flex items-center justify-end gap-1.5 mb-2">
                {flight.isRealPrice && (
                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/40 text-[10px] px-2 font-semibold shadow-sm">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Real Price
                  </Badge>
                )}
                {flight.isLowest && (
                  <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/40 text-[10px] px-2 font-semibold shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    Best Deal
                  </Badge>
                )}
                {flight.isFastest && (
                  <Badge className="bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-500 border-sky-500/40 text-[10px] px-2 font-semibold shadow-sm">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Fastest
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 justify-end">
                <span className={cn(
                  "text-4xl font-bold",
                  isSelected ? "text-sky-400" : isPremiumAirline ? "text-amber-400" : "text-sky-400"
                )}>${flight.price}</span>
              </div>
              <p className="text-xs text-muted-foreground">per person • {flight.class}</p>
              
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <p className="text-xs text-orange-500 font-semibold mt-1 animate-pulse flex items-center justify-end gap-1">
                  🔥 Only {flight.seatsLeft} seats left
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto">
              <Button 
                onClick={onSelect}
                className={cn(
                  "w-full lg:w-auto px-8 py-5 font-bold transition-all duration-300 rounded-xl",
                  isSelected
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40"
                    : isPremiumAirline
                      ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600 text-white shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Selected
                  </>
                ) : (
                  <>
                    Select
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
              
              {flight.bookingLink && (
                <a 
                  href={flight.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-sky-400 flex items-center justify-center gap-1 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  Book direct
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info row - Mobile amenities + CO2 */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-dashed border-border/40 text-xs text-muted-foreground lg:hidden">
          <div className="flex items-center gap-3">
            {flight.amenities.map((amenity, i) => (
              <span key={i} className="capitalize flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                {getAmenityIcon(amenity)}
                {amenity}
              </span>
            ))}
          </div>
          {flight.co2 && (
            <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
              🌱 {flight.co2} CO₂
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightTicketCard;