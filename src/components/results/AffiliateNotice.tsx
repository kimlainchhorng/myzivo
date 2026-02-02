/**
 * Affiliate Notice Components
 * Partner redirect notices and disclaimers
 * Compliance-focused design
 */

import { ExternalLink, AlertCircle, Info } from "lucide-react";
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
    partner: "travel partner",
  },
  hotels: {
    color: "text-amber-500",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    partner: "hotel booking partner",
  },
  cars: {
    color: "text-violet-500",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    partner: "car rental partner",
  },
};

export function RedirectNotice({ service, className }: RedirectNoticeProps) {
  const config = serviceConfig[service];

  return (
    <div
      className={cn(
        "p-4 rounded-xl flex items-start gap-3",
        config.bg,
        config.border,
        "border",
        className
      )}
    >
      <ExternalLink className={cn("w-5 h-5 shrink-0 mt-0.5", config.color)} />
      <div className="text-sm text-muted-foreground">
        <p>
          Clicking "View Deal" will redirect you to our trusted {config.partner} to complete your booking.
        </p>
        <p className="mt-1 text-xs opacity-75">
          Prices may vary. Final price shown on partner site.
        </p>
        {service === "flights" && (
          <p className="mt-2 text-xs font-medium text-foreground/80">
            Hizivo does not issue airline tickets. Booking completed with airline partner.
          </p>
        )}
      </div>
    </div>
  );
}

// Indicative price alert - more prominent
interface IndicativePriceAlertProps {
  service: "flights" | "hotels" | "cars";
  className?: string;
}

export function IndicativePriceAlert({ service, className }: IndicativePriceAlertProps) {
  const config = serviceConfig[service];
  const serviceLabel = service === "flights" ? "flight" : service === "hotels" ? "hotel" : "rental";

  return (
    <Alert className={cn(config.border, config.bg, className)}>
      <Info className={cn("h-4 w-4", config.color)} />
      <AlertDescription className="text-sm">
        <strong>Indicative prices</strong> – Prices are estimates and may change. 
        Final price shown on partner site. View real-time {serviceLabel} prices by clicking "View Deal".
      </AlertDescription>
    </Alert>
  );
}

// Footer disclaimer - compliance
interface AffiliateDisclaimerProps {
  className?: string;
}

export function AffiliateDisclaimer({ className }: AffiliateDisclaimerProps) {
  return (
    <section className={cn("py-8 border-t border-border/50 bg-muted/20", className)}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          *Prices shown are indicative estimates only and may change due to real-time availability, 
          taxes, fees, and supplier pricing. Final prices are displayed on partner booking sites.
          ZIVO is a meta-search travel comparison platform – we do not sell tickets or handle payments. 
          All bookings are completed directly with our trusted travel partners.
          ZIVO may earn a commission when users book through partner links.
        </p>
      </div>
    </section>
  );
}
