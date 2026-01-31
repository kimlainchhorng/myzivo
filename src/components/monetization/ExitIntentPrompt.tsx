import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plane, Sparkles, ExternalLink, TrendingDown } from "lucide-react";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

interface ExitIntentPromptProps {
  origin?: string;
  destination?: string;
  lowestPrice?: number;
  className?: string;
}

export default function ExitIntentPrompt({
  origin = "",
  destination = "",
  lowestPrice,
  className,
}: ExitIntentPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Handle mouse leave (exit intent on desktop)
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger if leaving through the top of the viewport
    if (e.clientY <= 5 && !hasShown) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [hasShown]);

  // Handle visibility change (tab switching)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !hasShown) {
      // Don't show immediately on tab switch, just mark for potential later
    }
  }, [hasShown]);

  useEffect(() => {
    // Only enable on desktop
    if (window.innerWidth >= 1024) {
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleMouseLeave, handleVisibilityChange]);

  const handleCompareClick = () => {
    trackAffiliateClick({
      flightId: `exit-intent-${origin}-${destination}`,
      airline: "Multiple",
      airlineCode: "ALL",
      origin,
      destination,
      price: lowestPrice || 0,
      passengers: 1,
      cabinClass: "economy",
      affiliatePartner: "searadar",
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: "exit_intent_prompt",
      ctaType: "exit_intent",
      serviceType: "flights",
    });

    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center pt-20 px-4",
        "bg-background/80 backdrop-blur-sm animate-in fade-in duration-300",
        className
      )}
      onClick={handleDismiss}
    >
      <Card 
        className="max-w-md w-full shadow-2xl border-sky-500/30 animate-in slide-in-from-top-4 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-sky-500" />
            </div>

            <Badge className="mb-3 bg-sky-500/20 text-sky-400 border-sky-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Before you go...
            </Badge>

            <h3 className="text-xl font-bold mb-2">
              Compare prices with our travel partner
            </h3>

            {lowestPrice && origin && destination && (
              <p className="text-muted-foreground mb-4">
                We found prices from <span className="text-sky-500 font-bold">${lowestPrice}</span> for {origin} → {destination}
              </p>
            )}

            {!lowestPrice && (
              <p className="text-muted-foreground mb-4">
                Search 500+ airlines and find the best deals for your trip
              </p>
            )}

            <Button
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 mb-3"
              onClick={handleCompareClick}
            >
              <TrendingDown className="w-4 h-4" />
              View All Deals
              <ExternalLink className="w-4 h-4" />
            </Button>

            <button
              onClick={handleDismiss}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, I'll continue browsing
            </button>

            <p className="text-[9px] text-muted-foreground mt-4">
              {AFFILIATE_DISCLOSURE_TEXT.short}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
