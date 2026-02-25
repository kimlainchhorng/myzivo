/**
 * Sponsored Hotel Card
 * Featured hotel placement with clear sponsored labeling
 */

import { ExternalLink, MapPin, Star, Info, Wifi, Car, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SPONSORED_DISCLOSURE_TEXT } from "@/config/sponsoredAds";
import { cn } from "@/lib/utils";

interface SponsoredHotelCardProps {
  name: string;
  location: string;
  rating: number;
  reviewCount?: number;
  pricePerNight: number;
  originalPrice?: number;
  currency?: string;
  imageUrl: string;
  partnerName: string;
  partnerLogo?: string;
  amenities?: string[];
  dealHighlight?: string;
  ctaUrl?: string;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  parking: Car,
  restaurant: UtensilsCrossed,
};

export function SponsoredHotelCard({
  name,
  location,
  rating,
  reviewCount,
  pricePerNight,
  originalPrice,
  currency = "USD",
  imageUrl,
  partnerName,
  partnerLogo,
  amenities = [],
  dealHighlight,
  ctaUrl,
  variant = "default",
  className,
}: SponsoredHotelCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const discount = originalPrice
    ? Math.round(((originalPrice - pricePerNight) / originalPrice) * 100)
    : 0;

  if (variant === "featured") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border-amber-500/20",
          "bg-gradient-to-br from-amber-500/5 via-transparent to-transparent",
          className
        )}
      >
        {/* Sponsored strip */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 z-10" />

        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="relative lg:w-2/5 aspect-[16/9] lg:aspect-auto overflow-hidden group/img">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge className="bg-amber-500/90 text-white border-0">
                Sponsored
              </Badge>
              {dealHighlight && (
                <Badge className="bg-emerald-500/90 text-white border-0">
                  {dealHighlight}
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-5 lg:p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{rating}</span>
                  {reviewCount && (
                    <span className="text-xs text-muted-foreground">
                      ({reviewCount})
                    </span>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {amenities.slice(0, 4).map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity.toLowerCase()] || Info;
                    return (
                      <span
                        key={amenity}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded bg-muted/50"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {partnerLogo && (
                      <img
                        src={partnerLogo}
                        alt={partnerName}
                        className="h-4 object-contain"
                      />
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      via {partnerName}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mt-1">
                          <Info className="w-3 h-3" />
                          Why this ad?
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        {SPONSORED_DISCLOSURE_TEXT.hotel}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="text-right">
                  {originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-600 text-xs">
                        -{discount}%
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-amber-600">
                      {formatPrice(pricePerNight)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /night
                    </span>
                  </div>
                  <Button
                    className="mt-2 gap-1.5 bg-amber-500 hover:bg-amber-600"
                    asChild={!!ctaUrl}
                  >
                    {ctaUrl ? (
                      <a
                        href={ctaUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                      >
                        View Deal
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <>
                        View Deal
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Default card variant
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-amber-500/20",
        "hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Sponsored strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 z-10" />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden group/img">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <Badge className="bg-amber-500/90 text-white border-0 text-xs">
            Sponsored
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-medium">{rating}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h4 className="font-semibold text-sm mb-1 truncate">{name}</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through mr-2">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-amber-600">
              {formatPrice(pricePerNight)}
            </span>
            <span className="text-xs text-muted-foreground">/night</span>
          </div>
          <Button
            size="sm"
            className="gap-1 bg-amber-500 hover:bg-amber-600"
            asChild={!!ctaUrl}
          >
            {ctaUrl ? (
              <a href={ctaUrl} target="_blank" rel="sponsored noopener noreferrer">
                View
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <>
                View
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SponsoredHotelCard;
