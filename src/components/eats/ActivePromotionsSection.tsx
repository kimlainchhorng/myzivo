/**
 * Active Promotions Section — horizontal scrollable promo cards for restaurant menu page
 */

import { Tag, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RestaurantPromo } from "@/hooks/useRestaurantPromotions";

interface ActivePromotionsSectionProps {
  promos: RestaurantPromo[];
  className?: string;
}

function getDiscountLabel(p: RestaurantPromo): string {
  if (p.discount_type === "free_delivery") return "Free Delivery";
  if (p.discount_type === "percent") return `${p.discount_value}% OFF`;
  if (p.discount_type === "fixed") return `$${p.discount_value} OFF`;
  return `${p.discount_value} OFF`;
}

function getCountdown(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff < 0 || diff > 48 * 60 * 60 * 1000) return null;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours < 1) return "Ends in < 1 hour";
  return `Ends in ${hours}h`;
}

export function ActivePromotionsSection({ promos, className }: ActivePromotionsSectionProps) {
  if (promos.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied!`);
  };

  return (
    <div className={cn("mb-8", className)}>
      <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
        Active Promotions
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {promos.map((promo) => {
          const countdown = getCountdown(promo.ends_at);
          return (
            <div
              key={promo.id}
              className="snap-start shrink-0 w-64 rounded-2xl border border-border/50 bg-muted/50 p-4 space-y-3 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{promo.name}</p>
                  {promo.description && (
                    <p className="text-xs text-muted-foreground truncate">{promo.description}</p>
                  )}
                </div>
              </div>

              <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {getDiscountLabel(promo)}
              </p>

              {promo.min_order_amount && promo.min_order_amount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Min. order ${promo.min_order_amount.toFixed(2)}
                </p>
              )}

              {countdown && (
                <div className="flex items-center gap-1 text-xs text-violet-500 font-medium">
                  <Clock className="w-3 h-3" />
                  {countdown}
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 text-xs h-8 rounded-xl"
                onClick={() => handleCopy(promo.code)}
              >
                <Copy className="w-3 h-3" />
                Copy Code: {promo.code}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
