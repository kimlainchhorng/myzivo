/**
 * Flight Detail Sticky CTA
 * Mobile sticky bottom CTA for flight detail pages
 * Uses locked compliance text + consent blocking
 */

import { useState } from "react";
import { Lock, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FlightDetailStickyCTAProps {
  price: number;
  currency?: string;
  passengers?: number;
  onContinue: () => void;
  className?: string;
  isLoading?: boolean;
  consentRequired?: boolean;
}

export default function FlightDetailStickyCTA({
  price,
  currency = "USD",
  passengers = 1,
  onContinue,
  className,
  isLoading = false,
  consentRequired = true,
}: FlightDetailStickyCTAProps) {
  const [consentChecked, setConsentChecked] = useState(false);
  const totalPrice = price * passengers;
  const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const handleContinue = () => {
    if (consentRequired && !consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please agree to share your information with the booking partner.",
        variant: "destructive",
      });
      return;
    }
    onContinue();
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
      "bg-gradient-to-t from-background via-background/98 to-background/90 backdrop-blur-lg",
      "border-t border-border/50 shadow-2xl shadow-black/20",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        {/* Consent Checkbox Row */}
        {consentRequired && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
            <Checkbox
              id="mobile-consent"
              checked={consentChecked}
              onCheckedChange={(val) => setConsentChecked(val === true)}
              className="shrink-0"
            />
            <label 
              htmlFor="mobile-consent" 
              className="text-[11px] text-muted-foreground leading-tight cursor-pointer"
            >
              I agree to share my information with the booking partner.
            </label>
            {consentChecked && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {/* Price Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-sky-500">
                {currencySymbol}{totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {passengers} traveler{passengers > 1 ? "s" : ""} · Final price at checkout
            </p>
          </div>

          {/* CTA Button - Locked compliance text */}
          <Button
            size="lg"
            disabled={isLoading}
            onClick={handleContinue}
            className={cn(
              "gap-2 text-white shadow-lg shadow-sky-500/30 shrink-0",
              "min-h-[52px] px-6 touch-manipulation active:scale-[0.98]",
              "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
              "text-base font-semibold",
              consentRequired && !consentChecked && "opacity-70"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {FLIGHT_CTA_TEXT.mobile}
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Compliance Disclosure */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Lock className="w-3 h-3 text-emerald-500" />
          <p className="text-[9px] text-muted-foreground leading-tight">
            Secure checkout handled by our airline partner
          </p>
        </div>
      </div>
    </div>
  );
}
