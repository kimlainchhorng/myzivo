import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, Search, TrendingDown } from "lucide-react";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";
import { isFlightsOTAMode, logBlockedAffiliateAttempt } from "@/config/flightBookingMode";

interface SmartBookingCTAProps {
  flightId?: string;
  airline?: string;
  airlineCode?: string;
  origin: string;
  destination: string;
  price?: number;
  passengers?: number;
  cabinClass?: string;
  variant?: "primary" | "secondary" | "compact";
  source?: string;
  className?: string;
}

/**
 * Smart CTA component that handles affiliate redirects with fallback logic
 * Primary CTA: Main affiliate (Travelpayouts/Searadar)
 * Secondary CTA: Backup option (opens same reliable link)
 */
export default function SmartBookingCTA({
  flightId = "",
  airline = "Multiple",
  airlineCode = "ALL",
  origin,
  destination,
  price = 0,
  passengers = 1,
  cabinClass = "economy",
  variant = "primary",
  source = "smart_cta",
  className,
}: SmartBookingCTAProps) {
  const handlePrimaryClick = () => {
    // OTA Mode: Block flight affiliate redirects - ZIVO is Merchant of Record
    if (isFlightsOTAMode()) {
      logBlockedAffiliateAttempt('SmartBookingCTA', 'flight redirect');
      console.warn('[OTA_MODE] SmartBookingCTA is disabled for flights. Use internal booking flow.');
      return;
    }

    trackAffiliateClick({
      flightId: flightId || `${source}-${origin}-${destination}`,
      airline,
      airlineCode,
      origin,
      destination,
      price,
      passengers,
      cabinClass,
      affiliatePartner: "searadar",
      referralUrl: AFFILIATE_LINKS.flights.url,
      source,
      ctaType: variant === "primary" ? "result_card" : "compare_prices",
      serviceType: "flights",
    });

    // Open affiliate link - uses centralized config for consistency
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  // OTA Mode: Don't render for flights - use internal booking flow instead
  if (isFlightsOTAMode() && (origin || destination)) {
    return null;
  }

  if (variant === "compact") {
    return (
      <Button
        size="sm"
        className={cn(
          "gap-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20",
          className
        )}
        onClick={handlePrimaryClick}
      >
        View Deal
        <ExternalLink className="w-3 h-3" />
      </Button>
    );
  }

  if (variant === "secondary") {
    return (
      <Button
        variant="outline"
        className={cn("gap-2 border-sky-500/30 hover:bg-sky-500/10", className)}
        onClick={handlePrimaryClick}
      >
        <Search className="w-4 h-4" />
        Compare More Prices
        <ExternalLink className="w-4 h-4" />
      </Button>
    );
  }

  // Primary variant (default)
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        size="lg"
        className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 min-h-[48px] touch-manipulation active:scale-[0.98]"
        onClick={handlePrimaryClick}
      >
        <Sparkles className="w-4 h-4" />
        View Deal
        <ExternalLink className="w-4 h-4" />
      </Button>
      <p className="text-[9px] text-muted-foreground text-center">
        Opens partner site in new tab
      </p>
    </div>
  );
}

/**
 * Fallback CTA shown when primary data is unavailable
 * Always works - directs to general search on affiliate partner
 */
export function FallbackBookingCTA({
  origin = "",
  destination = "",
  className,
}: {
  origin?: string;
  destination?: string;
  className?: string;
}) {
  // OTA Mode: Fallback affiliate CTA is disabled for flights
  // If Duffel returns no results, show "No flights available" UI instead
  if (isFlightsOTAMode()) {
    logBlockedAffiliateAttempt('FallbackBookingCTA', 'fallback redirect');
    return null;
  }

  const handleClick = () => {
    trackAffiliateClick({
      flightId: `fallback-${origin}-${destination}`,
      airline: "Multiple",
      airlineCode: "ALL",
      origin,
      destination,
      price: 0,
      passengers: 1,
      cabinClass: "economy",
      affiliatePartner: "searadar",
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: "fallback_cta",
      ctaType: "no_results_fallback",
      serviceType: "flights",
    });

    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      size="lg"
      className={cn(
        "gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30",
        className
      )}
      onClick={handleClick}
    >
      <TrendingDown className="w-4 h-4" />
      View Deals with Our Travel Partner
      <ExternalLink className="w-4 h-4" />
    </Button>
  );
}
