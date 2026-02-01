/**
 * Affiliate Notice Components
 * Partner redirect notices and disclaimers
 */

import { ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface RedirectNoticeProps {
  service: "flights" | "hotels" | "cars";
  className?: string;
}

const serviceConfig = {
  flights: {
    color: "text-sky-500",
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
  },
  hotels: {
    color: "text-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
  },
  cars: {
    color: "text-violet-500",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
  },
};

export function RedirectNotice({ service, className }: RedirectNoticeProps) {
  const config = serviceConfig[service];

  return (
    <div
      className={cn(
        "p-4 rounded-xl flex items-center gap-3",
        config.bg,
        config.border,
        "border",
        className
      )}
    >
      <ExternalLink className={cn("w-5 h-5 shrink-0", config.color)} />
      <p className="text-sm text-muted-foreground">
        Clicking "View Deal" will redirect you to our trusted travel partner to complete your booking.
      </p>
    </div>
  );
}

// Indicative price alert
interface IndicativePriceAlertProps {
  service: "flights" | "hotels" | "cars";
  className?: string;
}

export function IndicativePriceAlert({ service, className }: IndicativePriceAlertProps) {
  const config = serviceConfig[service];
  const serviceLabel = service === "flights" ? "flight" : service === "hotels" ? "hotel" : "rental";

  return (
    <Alert className={cn(config.border, config.bg, className)}>
      <AlertCircle className={cn("h-4 w-4", config.color)} />
      <AlertDescription className="text-sm">
        Prices shown are indicative estimates. View real-time {serviceLabel} prices on partner sites.
      </AlertDescription>
    </Alert>
  );
}

// Footer disclaimer
interface AffiliateDisclaimerProps {
  className?: string;
}

export function AffiliateDisclaimer({ className }: AffiliateDisclaimerProps) {
  return (
    <section className={cn("py-8 border-t border-border/50", className)}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          *Prices shown are indicative estimates. Final prices are displayed on partner booking sites.
          ZIVO may earn a commission when users book through partner links.
          Bookings are completed on partner websites.
        </p>
      </div>
    </section>
  );
}
