/**
 * POINTS CHECKOUT REMINDER
 * 
 * Compact widget shown at checkout reminding users they'll earn points
 */

import { Sparkles, ChevronRight, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ZIVO_TIERS, 
  POINTS_COMPLIANCE,
  getTierFromPoints,
  type ZivoTier 
} from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

interface PointsCheckoutReminderProps {
  className?: string;
  /** Base points to earn (before tier bonus) */
  basePointsEarned?: number;
  /** User's current tier */
  tier?: ZivoTier;
  /** User's lifetime points (to calculate tier if not provided) */
  lifetimePoints?: number;
}

export default function PointsCheckoutReminder({
  className,
  basePointsEarned = 200,
  tier,
  lifetimePoints = 0,
}: PointsCheckoutReminderProps) {
  const currentTier = tier || getTierFromPoints(lifetimePoints);
  const tierConfig = ZIVO_TIERS[currentTier];
  const bonusMultiplier = tierConfig.earningBonus;
  const bonusPoints = Math.floor(basePointsEarned * bonusMultiplier);
  const totalPoints = basePointsEarned + bonusPoints;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-xl border",
      "bg-gradient-to-r from-primary/5 to-amber-500/5 border-primary/20",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", tierConfig.bgColor)}>
          <Sparkles className={cn("w-4 h-4", tierConfig.color)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              You'll earn <span className="text-primary font-bold">{totalPoints.toLocaleString()}</span> points
            </p>
            {bonusPoints > 0 && (
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                +{bonusPoints} bonus
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-0.5">
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{POINTS_COMPLIANCE.checkoutNote}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            {tierConfig.icon} {tierConfig.displayName} member
          </p>
        </div>
      </div>
      
      <Link 
        to="/rewards" 
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        View rewards
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
