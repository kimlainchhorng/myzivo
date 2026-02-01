/**
 * Premium Hotel Result Card
 * Mobile-first, consistent design with clear CTA
 */

import { Star, MapPin, Wifi, Car, Coffee, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const ratingLabel = hotel.guestRating >= 9 ? "Exceptional" : 
                      hotel.guestRating >= 8 ? "Excellent" : 
                      hotel.guestRating >= 7 ? "Very Good" : "Good";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-500/30",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
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

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-tight truncate">{hotel.name}</h3>
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

                {/* Rating */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="font-bold text-amber-500">{hotel.guestRating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{ratingLabel}</p>
                  <p className="text-[10px] text-muted-foreground">{hotel.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mt-3">
                {hotel.amenities.slice(0, 3).map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                    >
                      {Icon && <Icon className="w-3 h-3" />}
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

            {/* Price & CTA */}
            <div className="flex items-end justify-between mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">From</p>
                <p className="text-2xl font-bold text-amber-500">${hotel.pricePerNight}</p>
                <p className="text-xs text-muted-foreground">
                  per night*
                  {hotel.totalPrice && hotel.nights && (
                    <span className="block">${hotel.totalPrice} total ({hotel.nights} nights)</span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => onViewDeal(hotel)}
                className="gap-2 font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 text-white"
              >
                View Deal
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
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
