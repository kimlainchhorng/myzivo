/**
 * POINTS BALANCE CARD
 * 
 * Displays user's ZIVO Points balance, tier, and progress
 * Includes required compliance disclaimer
 */

import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, ChevronRight, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ZIVO_TIERS, 
  POINTS_COMPLIANCE,
  getTierFromPoints,
  getPointsToNextTier,
  type ZivoTier 
} from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

interface PointsBalanceCardProps {
  className?: string;
  balance?: number;
  lifetimePoints?: number;
  tier?: ZivoTier;
  compact?: boolean;
  showActions?: boolean;
}

export default function PointsBalanceCard({
  className,
  balance = 0,
  lifetimePoints = 0,
  tier,
  compact = false,
  showActions = true,
}: PointsBalanceCardProps) {
  const currentTier = tier || getTierFromPoints(lifetimePoints);
  const tierConfig = ZIVO_TIERS[currentTier];
  const { nextTier, pointsNeeded } = getPointsToNextTier(lifetimePoints);
  
  // Calculate progress to next tier
  const progress = nextTier 
    ? ((lifetimePoints - tierConfig.minPoints) / (ZIVO_TIERS[nextTier].minPoints - tierConfig.minPoints)) * 100
    : 100;

  if (compact) {
    return (
      <Link to="/rewards" className="block">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl border bg-gradient-to-r from-primary/5 to-amber-500/5 hover:border-primary/50 hover:shadow-sm transition-all duration-200 touch-manipulation active:scale-[0.98]",
          className
        )}>
          <div className={cn("p-2 rounded-lg", tierConfig.bgColor)}>
            <Sparkles className={cn("w-4 h-4", tierConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {balance.toLocaleString()} Points
            </p>
            <p className="text-xs text-muted-foreground">
              {tierConfig.icon} {tierConfig.displayName}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-br from-primary/10 via-background to-amber-500/10",
      "border-primary/20",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      
      <CardContent className="p-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", tierConfig.bgColor)}>
              <Sparkles className={cn("w-6 h-6", tierConfig.color)} />
            </div>
            <div>
              <h3 className="font-bold text-lg">ZIVO Points</h3>
              <Badge variant="outline" className={cn("text-xs", tierConfig.color, tierConfig.borderColor)}>
                {tierConfig.icon} {tierConfig.displayName}
              </Badge>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-muted/50">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{POINTS_COMPLIANCE.primaryDisclaimer}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-3xl font-bold mb-1">
            {balance.toLocaleString()}
            <span className="text-lg font-normal text-muted-foreground ml-1">pts</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Available to redeem
          </p>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to {ZIVO_TIERS[nextTier].displayName}</span>
              <span className="font-medium">{pointsNeeded.toLocaleString()} pts to go</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Tier Bonus */}
        {tierConfig.earningBonus > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm">
              <span className="font-medium text-emerald-500">+{tierConfig.earningBonus * 100}%</span>
              <span className="text-muted-foreground"> bonus on all earned points</span>
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl touch-manipulation active:scale-[0.98] min-h-[40px]">
              <Link to="/rewards">View Rewards</Link>
            </Button>
            <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-amber-500 rounded-xl touch-manipulation active:scale-[0.98] min-h-[40px]">
              <Link to="/rewards/redeem">Redeem</Link>
            </Button>
          </div>
        )}

        {/* Compliance note */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          {POINTS_COMPLIANCE.footerNote}
        </p>
      </CardContent>
    </Card>
  );
}
