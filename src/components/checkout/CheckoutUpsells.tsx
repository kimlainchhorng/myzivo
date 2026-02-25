/**
 * CheckoutUpsells Component
 * Block displaying available add-ons during checkout
 */

import { Sparkles, Info } from "lucide-react";
import { UpsellItem } from "./UpsellItem";
import { FLIGHT_UPSELLS, HOTEL_UPSELLS, CAR_UPSELLS, type UpsellProduct } from "@/config/checkoutUpsells";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ServiceType = "flights" | "hotels" | "cars";

interface CheckoutUpsellsProps {
  serviceType: ServiceType;
  selectedIds: string[];
  onToggle: (product: UpsellProduct) => void;
  passengerCount?: number;
  className?: string;
}

const upsellsByService: Record<ServiceType, UpsellProduct[]> = {
  flights: FLIGHT_UPSELLS,
  hotels: HOTEL_UPSELLS,
  cars: CAR_UPSELLS,
};

export function CheckoutUpsells({
  serviceType,
  selectedIds,
  onToggle,
  passengerCount = 1,
  className,
}: CheckoutUpsellsProps) {
  const products = upsellsByService[serviceType] || [];

  if (products.length === 0) return null;

  // Check if any product has insurance disclaimer
  const hasInsuranceDisclaimer = products.some((p) => p.disclaimer?.includes("insurer"));

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 transition-all duration-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold">Enhance Your Trip</h3>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              These optional add-ons are provided by our travel partners. 
              Prices may vary based on your itinerary.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Upsell Items */}
      <div className="space-y-3">
        {products.map((product) => (
          <UpsellItem
            key={product.id}
            product={product}
            isSelected={selectedIds.includes(product.id)}
            onToggle={() => onToggle(product)}
            passengerCount={passengerCount}
          />
        ))}
      </div>

      {/* Compliance Disclaimer */}
      {hasInsuranceDisclaimer && (
        <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
          Insurance is provided by third-party partners. ZIVO is not an insurer. 
          Coverage terms and conditions apply. Please review the full policy before purchase.
        </p>
      )}
    </div>
  );
}
