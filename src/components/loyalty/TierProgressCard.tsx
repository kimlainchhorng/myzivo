/**
 * TIER PROGRESS CARD
 * 
 * Visual display of Explorer → Traveler → Elite tier progression
 */

import { Sparkles, CheckCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ZIVO_TIERS, 
  getTierFromPoints,
  type ZivoTier 
} from "@/config/zivoPoints";
import { cn } from "@/lib/utils";

interface TierProgressCardProps {
  className?: string;
  lifetimePoints?: number;
  currentTier?: ZivoTier;
}

const TIER_ORDER: ZivoTier[] = ['explorer', 'traveler', 'elite'];

export default function TierProgressCard({
  className,
  lifetimePoints = 0,
  currentTier,
}: TierProgressCardProps) {
  const tier = currentTier || getTierFromPoints(lifetimePoints);
  const tierIndex = TIER_ORDER.indexOf(tier);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Your Tier Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tier Timeline */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-1 bg-muted rounded-full" />
          <div 
            className="absolute top-5 left-5 h-1 bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all"
            style={{ width: `${tierIndex === 0 ? 0 : tierIndex === 1 ? 50 : 100}%` }}
          />
          
          {/* Tier nodes */}
          <div className="relative flex justify-between">
            {TIER_ORDER.map((t, i) => {
              const config = ZIVO_TIERS[t];
              const isActive = i <= tierIndex;
              const isCurrent = t === tier;
              
              return (
                <div key={t} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCurrent 
                      ? cn(config.bgColor, config.borderColor, "ring-2 ring-offset-2 ring-primary/30")
                      : isActive
                        ? "bg-primary/20 border-primary"
                        : "bg-muted border-muted-foreground/30"
                  )}>
                    {isActive ? (
                      <span className="text-lg">{config.icon}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className={cn(
                    "mt-2 text-sm font-medium",
                    isCurrent ? config.color : isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {config.displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {config.minPoints.toLocaleString()}+ pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Tier Details */}
        <div className={cn(
          "p-4 rounded-xl border",
          ZIVO_TIERS[tier].bgColor,
          ZIVO_TIERS[tier].borderColor
        )}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{ZIVO_TIERS[tier].icon}</span>
            <div>
              <h4 className="font-bold">{ZIVO_TIERS[tier].displayName}</h4>
              <p className="text-sm text-muted-foreground">
                {lifetimePoints.toLocaleString()} lifetime points
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {ZIVO_TIERS[tier].benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Tier Preview */}
        {tierIndex < TIER_ORDER.length - 1 && (
          <div className="p-4 rounded-xl border border-dashed bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ZIVO_TIERS[TIER_ORDER[tierIndex + 1]].icon}</span>
                <span className="font-medium">
                  Unlock {ZIVO_TIERS[TIER_ORDER[tierIndex + 1]].displayName}
                </span>
              </div>
              <Badge variant="outline">
                {(ZIVO_TIERS[TIER_ORDER[tierIndex + 1]].minPoints - lifetimePoints).toLocaleString()} pts away
              </Badge>
            </div>
            <Progress 
              value={(lifetimePoints / ZIVO_TIERS[TIER_ORDER[tierIndex + 1]].minPoints) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
