/**
 * UpsellItem Component
 * Individual add-on item with checkbox selection
 */

import { Check, Shield, Luggage, Armchair, RefreshCw, Car, Clock, ShieldCheck, Navigation, Users, Baby } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { UpsellProduct } from "@/config/checkoutUpsells";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Luggage,
  Armchair,
  RefreshCw,
  Car,
  Clock,
  ShieldCheck,
  Navigation,
  Users,
  Baby,
};

interface UpsellItemProps {
  product: UpsellProduct;
  isSelected: boolean;
  onToggle: () => void;
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
  passengerCount?: number;
}

export function UpsellItem({
  product,
  isSelected,
  onToggle,
  quantity = 1,
  passengerCount = 1,
}: UpsellItemProps) {
  const IconComponent = iconMap[product.icon] || Shield;
  const totalPrice = product.price * (product.id.includes("baggage") || product.id.includes("seat") ? passengerCount : 1);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      )}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle()}
        className="mt-0.5"
      />
      
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{product.name}</span>
          {product.badge && (
            <Badge
              variant={product.badge === "popular" ? "default" : "secondary"}
              className={cn(
                "text-[10px] px-1.5 py-0",
                product.badge === "popular" && "bg-amber-500 hover:bg-amber-500",
                product.badge === "recommended" && "bg-sky-500 hover:bg-sky-500 text-white"
              )}
            >
              {product.badge === "popular" && "Most travelers choose this"}
              {product.badge === "best-value" && "Best Value"}
              {product.badge === "recommended" && "Recommended"}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
      </div>
      
      <div className="text-right shrink-0">
        <span className="font-semibold text-sm">
          +${totalPrice}
        </span>
        {(product.id.includes("baggage") || product.id.includes("seat")) && passengerCount > 1 && (
          <p className="text-[10px] text-muted-foreground">per person</p>
        )}
      </div>
    </div>
  );
}
