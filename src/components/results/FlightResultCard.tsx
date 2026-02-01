/**
 * Premium Flight Result Card
 * Unified design: Airline left, times center, price+CTA right
 * Mobile-first with clear visual hierarchy
 */

import { Plane, Clock, ExternalLink, Wifi, Utensils, Monitor, Luggage, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface FlightCardData {
  id: string;
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
  currency?: string;
  cabinClass: string;
  amenities?: string[];
  baggageIncluded?: string;
  isRealPrice?: boolean;
  isBestPrice?: boolean;
  isFastest?: boolean;
}

interface FlightResultCardProps {
  flight: FlightCardData;
  onViewDeal: (flight: FlightCardData) => void;
  className?: string;
}

export function FlightResultCard({ flight, onViewDeal, className }: FlightResultCardProps) {
  const { format, getDisplay } = useCurrency();
  const baseCurrency = flight.currency || "USD";
  const { formatted: formattedPrice, wasConverted } = getDisplay(flight.price, baseCurrency);
  
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5" />;
    if (lower.includes("meal") || lower.includes("food")) return <Utensils className="w-3.5 h-3.5" />;
    if (lower.includes("entertainment") || lower.includes("screen")) return <Monitor className="w-3.5 h-3.5" />;
    if (lower.includes("bag")) return <Luggage className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/30",
        flight.isBestPrice && "ring-2 ring-emerald-500/50",
        flight.isFastest && !flight.isBestPrice && "ring-2 ring-purple-500/50",
        className
      )}
    >
      {/* Top badges row */}
      {(flight.isBestPrice || flight.isFastest || flight.isRealPrice) && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          {flight.isBestPrice && (
            <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
              Best Price
            </Badge>
          )}
          {flight.isFastest && !flight.isBestPrice && (
            <Badge className="bg-purple-500 text-white text-[10px] gap-1">
              <Clock className="w-3 h-3" /> Fastest
            </Badge>
          )}
          {flight.isRealPrice && (
            <Badge className="bg-sky-500/20 text-sky-500 text-[10px] gap-1">
              <Zap className="w-3 h-3" /> Live Price
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Airline Section */}
          <div className="p-4 flex items-center gap-3 lg:w-52 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              {flight.airlineLogo ? (
                <img
                  src={flight.airlineLogo}
                  alt={flight.airline}
                  className="w-8 h-8 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=0ea5e9&color=fff&size=32`;
                  }}
                />
              ) : (
                <span className="text-sm font-bold text-sky-500">{flight.airlineCode}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate text-sm">{flight.airline}</p>
              <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{flight.cabinClass}</p>
            </div>
          </div>

          {/* CENTER: Flight Times & Duration */}
          <div className="flex-1 p-4 lg:py-5 lg:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Departure */}
              <div className="text-center shrink-0">
                <p className="text-xl sm:text-2xl font-bold">{flight.departureTime}</p>
                <p className="text-xs text-muted-foreground font-medium">{flight.departureAirport}</p>
              </div>

              {/* Duration Line */}
              <div className="flex-1 relative px-1 min-w-[70px]">
                <div className="h-[2px] bg-gradient-to-r from-sky-500/30 via-sky-500 to-sky-500/30 rounded-full" />
                <Plane className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-500 rotate-90" />
                
                {/* Duration label - centered above line */}
                <div className="absolute inset-x-0 -top-4 flex justify-center">
                  <span className="text-[10px] text-muted-foreground bg-card px-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {flight.duration}
                  </span>
                </div>
                
                {/* Stops badge - below line */}
                <div className="flex justify-center mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0 px-2 h-5",
                      flight.stops === 0
                        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                        : "text-amber-500 border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </Badge>
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center shrink-0">
                <p className="text-xl sm:text-2xl font-bold">{flight.arrivalTime}</p>
                <p className="text-xs text-muted-foreground font-medium">{flight.arrivalAirport}</p>
              </div>
            </div>

            {/* Layover info */}
            {flight.stopLocations && flight.stopLocations.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                via {flight.stopLocations.join(", ")}
              </p>
            )}

            {/* Amenities row */}
            {flight.amenities && flight.amenities.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-3 text-muted-foreground">
                {flight.amenities.slice(0, 4).map((amenity, idx) => {
                  const icon = getAmenityIcon(amenity);
                  if (!icon) return null;
                  return (
                    <div key={idx} className="flex items-center gap-1" title={amenity}>
                      {icon}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Price & CTA Section */}
          <div className="p-4 lg:py-5 lg:px-5 lg:w-44 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="text-left lg:text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">From</p>
              <p className="text-2xl sm:text-3xl font-bold text-sky-500">
                {formattedPrice}
              </p>
              <p className="text-[10px] text-muted-foreground">per person*</p>
              {wasConverted && (
                <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                  Converted from {baseCurrency}
                </p>
              )}
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewDeal(flight);
              }}
              className="gap-2 font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all w-full lg:w-auto text-white"
            >
              View Deal
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Redirect notice */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            Redirects to partner site to complete booking
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
