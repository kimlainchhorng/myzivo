/**
 * TIER COMPARISON TABLE
 * Side-by-side comparison of Explorer → Traveler → Elite tiers
 */

import { CheckCircle, Lock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZIVO_TIERS, type ZivoTier } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

const TIER_ORDER: ZivoTier[] = ["explorer", "traveler", "elite"];

interface TierComparisonTableProps {
  className?: string;
  currentTier?: ZivoTier;
}

const PERK_ROWS = [
  { label: "Points multiplier", getValue: (t: ZivoTier) => `${ZIVO_TIERS[t].perks.bonusPointsMultiplier}x points` },
  { label: "Order discount", getValue: (t: ZivoTier) => ZIVO_TIERS[t].perks.discountPercent > 0 ? `${ZIVO_TIERS[t].perks.discountPercent}% off` : "—" },
  { label: "Free delivery", getValue: (t: ZivoTier) => ZIVO_TIERS[t].perks.freeDelivery ? "✓" : "—" },
  { label: "Priority support", getValue: (t: ZivoTier) => ZIVO_TIERS[t].perks.prioritySupport ? "✓" : "—" },
  { label: "Earning bonus", getValue: (t: ZivoTier) => ZIVO_TIERS[t].earningBonus > 0 ? `+${ZIVO_TIERS[t].earningBonus * 100}%` : "—" },
];

export default function TierComparisonTable({ className, currentTier = "explorer" }: TierComparisonTableProps) {
  const currentIndex = TIER_ORDER.indexOf(currentTier);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Compare Tiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tier Headers */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {TIER_ORDER.map((tier, i) => {
            const config = ZIVO_TIERS[tier];
            const isCurrent = tier === currentTier;
            const isLocked = i > currentIndex;

            return (
              <div
                key={tier}
                className={cn(
                  "text-center p-3 rounded-xl border-2 transition-all",
                  isCurrent
                    ? cn(config.bgColor, config.borderColor, "ring-2 ring-offset-2 ring-primary/20")
                    : isLocked
                      ? "border-border/30 opacity-60"
                      : "border-border/50"
                )}
              >
                <span className="text-2xl block mb-1">{config.icon}</span>
                <p className={cn("font-bold text-sm", isCurrent ? config.color : "text-foreground")}>
                  {config.displayName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {config.minPoints.toLocaleString()}+ pts
                </p>
                {isCurrent && (
                  <Badge variant="outline" className="mt-1.5 text-[10px] border-primary/40 text-primary">
                    Current
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Perk Rows */}
        <div className="space-y-0">
          {PERK_ROWS.map((row, ri) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[1fr_1fr_1fr] gap-3 py-3",
                ri < PERK_ROWS.length - 1 && "border-b border-border/30"
              )}
            >
              {TIER_ORDER.map((tier) => {
                const value = row.getValue(tier);
                const isActive = value !== "—";

                return (
                  <div key={tier} className="text-center">
                    {ri === 0 ? null : null}
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground/50"
                    )}>
                      {value === "✓" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : value === "—" ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />
                      ) : (
                        value
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Row Labels (shown on left as caption) */}
        <div className="mt-4 space-y-1">
          {PERK_ROWS.map((row) => (
            <p key={row.label} className="text-[10px] text-muted-foreground">
              • {row.label}
            </p>
          ))}
        </div>

        {/* Benefits list per tier */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          {TIER_ORDER.map((tier) => {
            const config = ZIVO_TIERS[tier];
            const isCurrent = tier === currentTier;

            return (
              <div
                key={tier}
                className={cn(
                  "p-3 rounded-xl border",
                  isCurrent ? cn(config.bgColor, config.borderColor) : "border-border/30"
                )}
              >
                <p className={cn("font-semibold text-sm mb-2 flex items-center gap-2", config.color)}>
                  <span>{config.icon}</span> {config.displayName} Benefits
                </p>
                <ul className="space-y-1.5">
                  {config.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
