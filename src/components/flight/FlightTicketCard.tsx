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
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightTicketCardProps {
  flight: {
    id: number;
    airline: string;
    airlineLogo?: string;
    airlineCode?: string;
    flightNumber: string;
    departure: { time: string; city: string; code: string };
    arrival: { time: string; city: string; code: string };
    duration: string;
    stops: number;
    stopCity?: string;
    price: number;
    class: string;
    amenities: string[];
    seatsLeft?: number;
    isLowest?: boolean;
    isFastest?: boolean;
    co2?: string;
    category?: 'premium' | 'full-service' | 'low-cost';
    alliance?: string;
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

const FlightTicketCard = ({ flight, onSelect, isSelected }: FlightTicketCardProps) => {
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
        "group relative overflow-hidden rounded-2xl border transition-all duration-500",
        isSelected 
          ? "border-sky-500 bg-sky-500/5 shadow-lg shadow-sky-500/20" 
          : "border-border/50 bg-card/50 backdrop-blur-xl hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10"
      )}
    >
      {/* Ticket perforated edge effect */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-background" />
        ))}
      </div>

      <div className="pl-6 pr-4 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          {/* Airline Info */}
          <div className="flex items-center gap-4 lg:w-48">
            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-2xl ring-2",
                isPremiumAirline 
                  ? "bg-gradient-to-br from-amber-500/20 to-yellow-600/30 ring-amber-500/30" 
                  : "bg-gradient-to-br from-sky-500/20 to-blue-600/30 ring-sky-500/20"
              )}>
                {flight.airlineLogo || "✈️"}
              </div>
              {isPremiumAirline && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
              {flight.isLowest && !isPremiumAirline && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-base">{flight.airline}</p>
              <p className="text-xs text-muted-foreground font-mono">{flight.flightNumber}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{isPremiumAirline ? '4.9' : '4.5'}</span>
                </div>
                {flight.alliance && flight.alliance !== 'Independent' && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                    {flight.alliance}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex-1 flex items-center gap-4 sm:gap-6">
            {/* Departure */}
            <div className="text-center min-w-[70px]">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{flight.departure.time}</p>
              <p className="text-xs font-semibold text-sky-500">{flight.departure.code}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[80px]">{flight.departure.city}</p>
            </div>

            {/* Flight Path Visual */}
            <div className="flex-1 flex flex-col items-center relative px-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{flight.duration}</span>
              </div>
              
              <div className="w-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500 relative">
                  {/* Animated plane */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:animate-pulse">
                    <Plane className="w-4 h-4 text-sky-500 transform" />
                  </div>
                  {/* Stop indicator */}
                  {flight.stops > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 border-2 border-background" />
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
              
              <p className="text-xs mt-1.5">
                {flight.stops === 0 ? (
                  <span className="text-green-500 font-semibold">Direct Flight</span>
                ) : (
                  <span className="text-amber-500 font-medium">
                    {flight.stops} stop{flight.stops > 1 ? "s" : ""} 
                    {flight.stopCity && <span className="text-muted-foreground"> • {flight.stopCity}</span>}
                  </span>
                )}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center min-w-[70px]">
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{flight.arrival.time}</p>
              <p className="text-xs font-semibold text-sky-500">{flight.arrival.code}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[80px]">{flight.arrival.city}</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="hidden lg:flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              {flight.amenities.slice(0, 4).map((amenity, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-default"
                  title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                >
                  {getAmenityIcon(amenity)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Free cancel</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="lg:w-40 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-dashed border-border/50 lg:pl-6">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-1.5 mb-1">
                {flight.isLowest && (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px] px-1.5">
                    Best Price
                  </Badge>
                )}
                {flight.isFastest && (
                  <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/30 text-[10px] px-1.5">
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    Fastest
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-sky-400">${flight.price}</span>
                <span className="text-xs text-muted-foreground">/person</span>
              </div>
              
              <p className="text-xs text-muted-foreground">{flight.class}</p>
              
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <p className="text-xs text-orange-500 font-medium mt-0.5 animate-pulse">
                  🔥 Only {flight.seatsLeft} seats left
                </p>
              )}
            </div>

            <Button 
              onClick={onSelect}
              className={cn(
                "w-full lg:w-auto px-6 font-semibold transition-all duration-300",
                isSelected
                  ? "bg-sky-500 text-white"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 hover:scale-[1.02]"
              )}
            >
              {isSelected ? "Selected" : "Select"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Bottom info row - Mobile amenities + CO2 */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-dashed border-border/30 text-xs text-muted-foreground lg:hidden">
          <div className="flex items-center gap-2">
            {flight.amenities.map((amenity, i) => (
              <span key={i} className="capitalize flex items-center gap-1">
                {getAmenityIcon(amenity)}
                {amenity}
              </span>
            ))}
          </div>
          {flight.co2 && (
            <span className="flex items-center gap-1 text-green-500">
              🌱 {flight.co2} CO₂
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightTicketCard;
