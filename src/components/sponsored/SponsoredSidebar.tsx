/**
 * Sponsored Sidebar Ads
 * Desktop sidebar ad placements - clearly labeled
 */

import { ExternalLink, Info, X } from "lucide-react";
import { useState } from "react";
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

interface SidebarAd {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  partnerName: string;
  partnerLogo?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface SponsoredSidebarProps {
  ads: SidebarAd[];
  title?: string;
  maxAds?: number;
  className?: string;
}

export function SponsoredSidebar({
  ads,
  title = "Sponsored",
  maxAds = 3,
  className,
}: SponsoredSidebarProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleAds = ads
    .filter((ad) => !dismissedIds.includes(ad.id))
    .slice(0, maxAds);

  if (visibleAds.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {SPONSORED_DISCLOSURE_TEXT.results}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Ads */}
      <div className="space-y-3">
        {visibleAds.map((ad) => (
          <Card
            key={ad.id}
            className="relative overflow-hidden border-amber-500/20 bg-amber-500/5"
          >
            {/* Dismiss */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 w-6 h-6 p-0 opacity-60 hover:opacity-100 z-10"
              onClick={() => setDismissedIds([...dismissedIds, ad.id])}
            >
              <X className="w-3 h-3" />
            </Button>

            {/* Image */}
            {ad.imageUrl && (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30"
                >
                  Ad
                </Badge>
                {ad.partnerLogo ? (
                  <img
                    src={ad.partnerLogo}
                    alt={ad.partnerName}
                    className="h-3 object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    {ad.partnerName}
                  </span>
                )}
              </div>

              <h4 className="font-medium text-sm mb-1 line-clamp-2">{ad.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {ad.description}
              </p>

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 h-8 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                asChild={!!ad.ctaUrl}
              >
                {ad.ctaUrl ? (
                  <a
                    href={ad.ctaUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                  >
                    {ad.ctaText || "Learn More"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <>
                    {ad.ctaText || "Learn More"}
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer disclosure */}
      <p className="text-[10px] text-muted-foreground text-center">
        {SPONSORED_DISCLOSURE_TEXT.general}
      </p>
    </div>
  );
}

export default SponsoredSidebar;
