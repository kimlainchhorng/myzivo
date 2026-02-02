import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Clock, 
  ExternalLink,
  Wifi,
  Monitor,
  Utensils,
  Luggage,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PROFESSIONAL FLIGHT RESULT CARD
 * Google Flights quality design
 * Clear hierarchy: Time → Duration → Price → CTA
 */

interface FlightResultCardProProps {
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: number;
  stopLocations?: string[];
  price: number;
  cabinClass: string;
  amenities?: string[];
  isSelected?: boolean;
  onSelect?: () => void;
  onBook?: () => void;
}

export default function FlightResultCardPro({
  airline,
  airlineCode,
  airlineLogo,
  flightNumber,
  departureTime,
  arrivalTime,
  departureAirport,
  arrivalAirport,
  duration,
  stops,
  stopLocations,
  price,
  cabinClass,
  amenities = [],
  isSelected,
  onSelect,
  onBook,
}: FlightResultCardProProps) {
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3.5 h-3.5" />;
    if (lower.includes('entertainment') || lower.includes('screen')) return <Monitor className="w-3.5 h-3.5" />;
    if (lower.includes('meal') || lower.includes('food')) return <Utensils className="w-3.5 h-3.5" />;
    if (lower.includes('bag') || lower.includes('luggage')) return <Luggage className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg hover:shadow-sky-500/5 hover:border-sky-500/30",
        isSelected && "ring-2 ring-sky-500 border-sky-500/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Flight Info Section */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start gap-4">
              {/* Airline Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                {airlineLogo ? (
                  <img src={airlineLogo} alt={airline} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-xs font-bold text-sky-500">{airlineCode}</span>
                )}
              </div>

              {/* Flight Details */}
              <div className="flex-1 min-w-0">
                {/* Route Row */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Departure */}
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">{departureTime}</p>
                    <p className="text-xs text-muted-foreground font-medium">{departureAirport}</p>
                  </div>

                  {/* Duration Line */}
                  <div className="flex-1 relative px-2">
                    <div className="h-[2px] bg-gradient-to-r from-sky-500/50 via-sky-500 to-sky-500/50" />
                    <div className="absolute inset-x-0 -top-2.5 flex justify-center">
                      <span className="text-xs text-muted-foreground bg-card px-2">
                        {duration}
                      </span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                      <Plane className="w-3.5 h-3.5 text-sky-500 rotate-90" />
                    </div>
                    {stops > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] py-0 px-1.5",
                            stops === 0 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"
                          )}
                        >
                          {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">{arrivalTime}</p>
                    <p className="text-xs text-muted-foreground font-medium">{arrivalAirport}</p>
                  </div>
                </div>

                {/* Airline & Flight Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{airline}</span>
                  <span>•</span>
                  <span>{flightNumber}</span>
                  <span>•</span>
                  <span className="capitalize">{cabinClass}</span>
                  {stopLocations && stopLocations.length > 0 && (
                    <>
                      <span>•</span>
                      <span>via {stopLocations.join(', ')}</span>
                    </>
                  )}
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    {amenities.slice(0, 4).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-muted-foreground">
                        {getAmenityIcon(amenity)}
                        <span className="text-[10px]">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price & CTA Section */}
          <div className="lg:w-48 p-4 sm:p-5 bg-muted/30 lg:bg-transparent lg:border-l border-t lg:border-t-0 border-border/50 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3">
            <div className="text-left lg:text-right">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                ${price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per person</p>
              <p className="text-[9px] text-emerald-600 mt-1">
                Final price confirmed by partner
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onBook?.();
              }}
              className={cn(
                "gap-2 font-semibold min-h-[48px] touch-manipulation active:scale-[0.98]",
                "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
                "shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40",
                "transition-all duration-200"
              )}
            >
              View Deal
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            {/* Compliance micro-copy - Required for Duffel/CJ */}
            <p className="text-[9px] text-muted-foreground text-center lg:text-right leading-relaxed max-w-[180px]">
              Indicative prices shown. Final price, availability, and booking terms confirmed on partner's secure checkout.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
