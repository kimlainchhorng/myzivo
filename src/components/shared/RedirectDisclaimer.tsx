import { ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ZIVO REDIRECT DISCLAIMER
 * Required affiliate compliance component
 * Must appear near all booking CTAs
 */

interface RedirectDisclaimerProps {
  variant?: "inline" | "banner" | "footer";
  className?: string;
}

export function RedirectDisclaimer({ 
  variant = "inline",
  className 
}: RedirectDisclaimerProps) {
  if (variant === "banner") {
    return (
      <div className={cn(
        "flex items-center justify-center gap-2 p-3 rounded-xl",
        "bg-muted/30 border border-border/50",
        "text-xs sm:text-sm text-muted-foreground",
        className
      )}>
        <ExternalLink className="w-4 h-4 shrink-0" />
        <span>You will be redirected to our trusted travel partner to complete your booking</span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn(
        "text-center py-4 border-t border-border/50",
        className
      )}>
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          ZIVO compares prices from licensed travel partners. Bookings are completed on partner websites. 
          Prices may change until booking is confirmed. ZIVO may earn a commission when you book through partner links.
        </p>
      </div>
    );
  }

  // Default inline
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs text-muted-foreground",
      className
    )}>
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>Redirects to partner site for booking</span>
    </div>
  );
}

// Price disclaimer component
interface PriceDisclaimerProps {
  className?: string;
}

export function PriceDisclaimer({ className }: PriceDisclaimerProps) {
  return (
    <p className={cn(
      "text-xs text-muted-foreground text-center",
      className
    )}>
      *Prices may change until booking is completed with the provider.
    </p>
  );
}
