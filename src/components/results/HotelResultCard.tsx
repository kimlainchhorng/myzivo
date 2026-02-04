/**
 * Premium Hotel Result Card
 * Unified design: Image left, details center, price+CTA right
 * Mobile-first with clear visual hierarchy
 */

import { Star, MapPin, Wifi, Car, Coffee, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface HotelCardData {
  id: string;
  name: string;
  area: string;
  imageUrl: string;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  pricePerNight: number;
  totalPrice?: number;
  nights?: number;
  amenities: string[];
  freeCancellation: boolean;
  distanceFromCenter?: number;
  isBestValue?: boolean;
  isMostPopular?: boolean;
}

interface HotelResultCardProps {
  hotel: HotelCardData;
  onViewDeal: (hotel: HotelCardData) => void;
  className?: string;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
};

export function HotelResultCard({ hotel, onViewDeal, className }: HotelResultCardProps) {
  const { format, getDisplay } = useCurrency();
  const ratingLabel = hotel.guestRating >= 9 ? "Exceptional" : 
                      hotel.guestRating >= 8 ? "Excellent" : 
                      hotel.guestRating >= 7 ? "Very Good" : "Good";

  const { formatted: nightlyPrice, wasConverted } = getDisplay(hotel.pricePerNight, "USD");
  const totalFormatted = hotel.totalPrice ? format(hotel.totalPrice, "USD") : null;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/30",
        hotel.isBestValue && "ring-2 ring-emerald-500/50",
        hotel.isMostPopular && !hotel.isBestValue && "ring-2 ring-amber-500/50",
        className
      )}
    >
      {/* Top badges */}
      {(hotel.isBestValue || hotel.isMostPopular) && (
        <div className="flex gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          {hotel.isBestValue && (
            <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
              Best Value
            </Badge>
          )}
          {hotel.isMostPopular && !hotel.isBestValue && (
            <Badge className="bg-amber-500 text-white text-[10px] gap-1">
              <Sparkles className="w-3 h-3" /> Popular Choice
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* LEFT: Image */}
          <div className="relative w-full sm:w-52 h-48 sm:h-auto shrink-0">
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {hotel.freeCancellation && (
              <Badge className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] gap-1">
                <CheckCircle className="w-3 h-3" />
                Free Cancellation
              </Badge>
            )}
          </div>

          {/* CENTER: Details */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1">
              {/* Header with name and rating */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{hotel.name}</h3>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">via Booking Partner</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <div className="flex shrink-0">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs">•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{hotel.area}</span>
                    </span>
                  </div>
                </div>

                {/* Guest Rating */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="font-bold text-amber-500 text-lg">{hotel.guestRating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{ratingLabel}</p>
                  <p className="text-[10px] text-muted-foreground">{hotel.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 3).map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </span>
                  );
                })}
                {hotel.distanceFromCenter && (
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    {hotel.distanceFromCenter} km from center
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Price & CTA */}
          <div className="sm:w-44 p-4 bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-border/50">
            <div className="text-center sm:text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">From</p>
              <p className="text-2xl font-bold text-amber-500">{nightlyPrice}</p>
              <p className="text-xs text-muted-foreground">
                per night*
              </p>
              {totalFormatted && hotel.nights && (
                <p className="text-xs text-muted-foreground mt-1">
                  {totalFormatted} total ({hotel.nights} night{hotel.nights !== 1 ? "s" : ""})
                </p>
              )}
              {wasConverted && (
                <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                  Converted from USD
                </p>
              )}
            </div>
            <Button
              onClick={() => onViewDeal(hotel)}
              className="mt-3 w-full gap-2 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 text-white"
            >
              Book with Provider
              <ExternalLink className="w-4 h-4" />
            </Button>
            {/* Price confirmation micro-copy */}
            <p className="text-[9px] text-muted-foreground mt-2 text-center">
              Continue to Partner
            </p>
          </div>
        </div>

        {/* Redirect notice with booking handled by partner */}
        <div className="px-4 py-2 bg-muted/30 border-t border-border/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            Prices may change until booking is completed with the provider.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
