/**
 * Sponsored Banner Ad
 * In-page banner for results pages - clearly labeled
 */

import { X, ExternalLink, Info } from "lucide-react";
import { useState } from "react";
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

interface SponsoredBannerProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  partnerName: string;
  variant?: "default" | "compact" | "wide";
  dismissible?: boolean;
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

export function SponsoredBanner({
  title,
  description,
  ctaText = "Learn More",
  ctaUrl,
  imageUrl,
  partnerName,
  variant = "default",
  dismissible = true,
  onDismiss,
  onClick,
  className,
}: SponsoredBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-lg",
          "border border-amber-500/20 bg-amber-500/5",
          className
        )}
      >
        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30">
          Ad
        </Badge>
        <p className="text-sm flex-1 truncate">{title}</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-amber-600 hover:text-amber-700"
          onClick={onClick}
        >
          {ctaText}
        </Button>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={handleDismiss}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent",
        variant === "wide" ? "p-4 sm:p-6" : "p-4",
        className
      )}
    >
      {/* Sponsored indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400" />

      {/* Dismiss button */}
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-7 h-7 p-0 opacity-60 hover:opacity-100"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <div className={cn(
        "flex gap-4",
        variant === "wide" ? "flex-row items-center" : "flex-col sm:flex-row"
      )}>
        {/* Image */}
        {imageUrl && (
          <div className={cn(
            "rounded-lg overflow-hidden shrink-0",
            variant === "wide" ? "w-32 h-24" : "w-full sm:w-24 h-32 sm:h-24"
          )}>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30"
            >
              Sponsored
            </Badge>
            <span className="text-xs text-muted-foreground">by {partnerName}</span>
          </div>

          <h4 className="font-semibold text-sm sm:text-base mb-1">{title}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          <div className="flex items-center justify-between mt-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                    <Info className="w-3 h-3" />
                    Why this ad?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {SPONSORED_DISCLOSURE_TEXT.results}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={onClick}
              asChild={!!ctaUrl}
            >
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
      </div>
    </div>
  );
}

export default SponsoredBanner;
