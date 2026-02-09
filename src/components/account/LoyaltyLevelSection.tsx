/**
 * LoyaltyLevelSection — "My Loyalty Level" card for the Account page
 */

import { Crown, Check, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOrderBasedTier } from "@/hooks/useOrderBasedTier";
import { cn } from "@/lib/utils";

export function LoyaltyLevelSection() {
  const { tier, orderCount, progress, ordersToNext, nextTierName, isLoading } =
    useOrderBasedTier();

  if (isLoading) {
    return (
      <div className="px-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-2 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 mb-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold">My Loyalty Level</h3>
            </div>
            <Badge
              className={cn(
                "gap-1 border",
                tier.bgColor,
                tier.borderColor,
                tier.textColor
              )}
            >
              <span className="text-xs">{tier.icon}</span>
              {tier.name}
            </Badge>
          </div>

          {/* Order count + progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {orderCount} completed order{orderCount !== 1 ? "s" : ""}
              </span>
              {ordersToNext !== null && nextTierName && (
                <span className="font-medium">
                  {ordersToNext} to {nextTierName}
                </span>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Benefits */}
          <div className="space-y-1.5">
            {tier.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Benefits are automatically applied at checkout
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoyaltyLevelSection;
