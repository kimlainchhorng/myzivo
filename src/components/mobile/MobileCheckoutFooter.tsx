/**
 * Mobile Checkout Footer
 * Shows price summary and CTA for details/checkout pages
 */
import { ExternalLink, Shield, Loader2, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MobileStickyFooter from "./MobileStickyFooter";
import { CHECKOUT_PRICE } from "@/config/checkoutCompliance";

interface MobileCheckoutFooterProps {
  price?: number | string;
  priceLabel?: string;
  currency?: string;
  ctaText?: string;
  ctaIcon?: "external" | "shield" | "lock" | "none";
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "flights" | "hotels" | "cars" | "default";
  show?: boolean;
  showNoHiddenFees?: boolean;
}

const MobileCheckoutFooter = ({
  price,
  priceLabel = "Total",
  currency = "$",
  ctaText = "Continue to secure checkout",
  ctaIcon = "lock",
  onClick,
  isLoading = false,
  disabled = false,
  variant = "default",
  show = true,
  showNoHiddenFees = false,
}: MobileCheckoutFooterProps) => {
  const variantColors = {
    flights: "bg-flights hover:bg-flights/90",
    hotels: "bg-hotels hover:bg-hotels/90",
    cars: "bg-cars hover:bg-cars/90",
    default: "bg-primary hover:bg-primary/90",
  };

  return (
    <MobileStickyFooter show={show}>
      {/* Price Summary */}
      {price && (
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground">{priceLabel}</p>
          <p className="text-lg font-bold">
            {currency}
            {typeof price === "number" ? price.toLocaleString() : price}
          </p>
          {showNoHiddenFees && (
            <p className="text-[10px] text-emerald-600 flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" />
              No hidden fees
            </p>
          )}
        </div>
      )}

      {/* CTA Button */}
      <Button
        className={cn(
          "flex-1 h-12 rounded-xl font-bold gap-2 text-white touch-manipulation active:scale-[0.98] transition-all duration-150",
          variantColors[variant]
        )}
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {ctaIcon === "shield" && <Shield className="w-4 h-4" />}
            {ctaIcon === "lock" && <Lock className="w-4 h-4" />}
            {ctaText}
            {ctaIcon === "external" && <ExternalLink className="w-4 h-4" />}
          </>
        )}
      </Button>
    </MobileStickyFooter>
  );
};

export default MobileCheckoutFooter;
