/**
 * Sponsored Result Card
 * Clearly labeled sponsored listing for flights, hotels, cars
 */

import { ExternalLink, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SponsoredBadge from "@/components/shared/SponsoredBadge";
import { SPONSORED_DISCLOSURE_TEXT } from "@/config/sponsoredAds";
import { cn } from "@/lib/utils";

interface SponsoredResultCardProps {
  type: "flight" | "hotel" | "car";
  title: string;
  subtitle?: string;
  price: number;
  currency?: string;
  partnerName: string;
  partnerLogo?: string;
  imageUrl?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SponsoredResultCard({
  type,
  title,
  subtitle,
  price,
  currency = "USD",
  partnerName,
  partnerLogo,
  imageUrl,
  ctaText = "View Deal",
  onCtaClick,
  className,
  children,
}: SponsoredResultCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent",
        "hover:border-amber-500/40 transition-all",
        className
      )}
    >
      {/* Sponsored indicator strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400" />

      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image (if provided) */}
          {imageUrl && (
            <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SponsoredBadge variant="default" size="sm" />
                  {partnerLogo && (
                    <img
                      src={partnerLogo}
                      alt={partnerName}
                      className="h-4 object-contain"
                    />
                  )}
                </div>
                <h4 className="font-semibold text-base truncate">{title}</h4>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-amber-600">
                  {formatPrice(price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {type === "hotel" ? "per night" : type === "car" ? "per day" : "total"}
                </p>
              </div>
            </div>

            {/* Custom content slot */}
            {children}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Info className="w-3.5 h-3.5" />
                        <span>Why this ad?</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs">{SPONSORED_DISCLOSURE_TEXT.results}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Button
                size="sm"
                className="gap-1.5 bg-amber-500 hover:bg-amber-600"
                onClick={onCtaClick}
              >
                {ctaText}
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SponsoredResultCard;
