/**
 * Destination Sponsor Card
 * Featured destination partner placement for city/deals pages
 */

import { ExternalLink, MapPin, Star, Info } from "lucide-react";
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

interface DestinationSponsorProps {
  destinationName: string;
  destinationCode?: string;
  tagline: string;
  description: string;
  imageUrl: string;
  partnerName: string;
  partnerLogo?: string;
  dealHighlight?: string;
  rating?: number;
  ctaText?: string;
  ctaUrl?: string;
  variant?: "card" | "banner" | "hero";
  className?: string;
}

export function DestinationSponsor({
  destinationName,
  destinationCode,
  tagline,
  description,
  imageUrl,
  partnerName,
  partnerLogo,
  dealHighlight,
  rating,
  ctaText = "Explore Deals",
  ctaUrl,
  variant = "card",
  className,
}: DestinationSponsorProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "border border-amber-500/20",
          className
        )}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={destinationName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative p-6 sm:p-8 lg:p-12">
          <div className="max-w-lg">
            {/* Sponsor badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/30"
              >
                Featured Destination Partner
              </Badge>
              {partnerLogo && (
                <img src={partnerLogo} alt={partnerName} className="h-5 object-contain" />
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              {destinationName}
            </h2>
            <p className="text-lg text-primary mb-2">{tagline}</p>
            <p className="text-muted-foreground mb-4">{description}</p>

            {dealHighlight && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <span className="text-sm font-medium text-emerald-600">{dealHighlight}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button size="lg" className="gap-2" asChild={!!ctaUrl}>
                {ctaUrl ? (
                  <a href={ctaUrl} target="_blank" rel="sponsored noopener noreferrer">
                    {ctaText}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <>
                    {ctaText}
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Sponsored
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    {SPONSORED_DISCLOSURE_TEXT.destination}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent",
          className
        )}
      >
        <div className="flex items-center gap-4 p-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 group/img">
            <img src={imageUrl} alt={destinationName} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30">
                Featured
              </Badge>
              <span className="text-xs text-muted-foreground">by {partnerName}</span>
            </div>
            <h4 className="font-semibold truncate">{destinationName}</h4>
            <p className="text-sm text-muted-foreground truncate">{tagline}</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5" asChild={!!ctaUrl}>
            {ctaUrl ? (
              <a href={ctaUrl} target="_blank" rel="sponsored noopener noreferrer">
                {ctaText}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <>
                {ctaText}
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card
      className={cn(
        "overflow-hidden border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* Sponsored indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 z-10" />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden group/img">
        <img
          src={imageUrl}
          alt={destinationName}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-amber-500/90 text-white border-0 text-xs">
            Sponsored
          </Badge>
        </div>

        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        )}

        {/* Destination name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5" />
            {destinationCode && <span>{destinationCode}</span>}
          </div>
          <h3 className="font-bold text-lg text-white">{destinationName}</h3>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-sm font-medium text-primary mb-1">{tagline}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        {dealHighlight && (
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 mb-3">
            <span className="text-xs font-medium text-emerald-600">{dealHighlight}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {partnerLogo && (
              <img src={partnerLogo} alt={partnerName} className="h-4 object-contain" />
            )}
            <span className="text-[10px] text-muted-foreground">by {partnerName}</span>
          </div>

          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" asChild={!!ctaUrl}>
            {ctaUrl ? (
              <a href={ctaUrl} target="_blank" rel="sponsored noopener noreferrer">
                {ctaText}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <>
                {ctaText}
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DestinationSponsor;
