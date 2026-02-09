/**
 * LoyaltyLevelBadge — Reusable tier badge for headers, profile, etc.
 */

import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ZIVO_TIERS, type ZivoTier } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

interface LoyaltyLevelBadgeProps {
  tier: ZivoTier;
  variant?: "inline" | "card";
  className?: string;
  lifetimePoints?: number;
}

export function LoyaltyLevelBadge({
  tier,
  variant = "inline",
  className,
  lifetimePoints,
}: LoyaltyLevelBadgeProps) {
  const config = ZIVO_TIERS[tier];

  if (variant === "inline") {
    return (
      <Badge
        className={cn(
          "gap-1 border",
          config.bgColor,
          config.borderColor,
          config.color,
          className
        )}
      >
        <span className="text-xs">{config.icon}</span>
        {config.displayName}
      </Badge>
    );
  }

  // Card variant
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-background/50">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-bold text-sm", config.color)}>{config.displayName}</p>
        {lifetimePoints !== undefined && (
          <p className="text-xs text-muted-foreground">
            {lifetimePoints.toLocaleString()} lifetime points
          </p>
        )}
      </div>
      <Crown className={cn("w-4 h-4 shrink-0", config.color)} />
    </div>
  );
}

export default LoyaltyLevelBadge;
