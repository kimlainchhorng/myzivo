/**
 * Result Badges Component
 * Smart badges for search results: Best Value, Most Popular, Flexible Fare, etc.
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Star,
  TrendingDown,
  Clock,
  Users,
  RefreshCw,
  Plane,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RESULT_BADGES } from "@/config/aiPersonalization";

export type BadgeType = keyof typeof RESULT_BADGES;

interface ResultBadgesProps {
  badges: BadgeType[];
  showTooltip?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const BADGE_ICONS: Record<BadgeType, React.ElementType> = {
  bestValue: Star,
  cheapest: TrendingDown,
  fastest: Clock,
  mostPopular: Users,
  flexibleFare: RefreshCw,
  directFlight: Plane,
};

export function ResultBadges({
  badges,
  showTooltip = true,
  size = "sm",
  className,
}: ResultBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {badges.map((badgeType) => {
        const config = RESULT_BADGES[badgeType];
        const Icon = BADGE_ICONS[badgeType] || Sparkles;

        const badge = (
          <Badge
            key={badgeType}
            variant="outline"
            className={cn(
              "font-medium gap-1 cursor-default",
              config.color,
              size === "sm" && "text-[10px] px-1.5 py-0",
              size === "md" && "text-xs px-2 py-0.5"
            )}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );

        if (!showTooltip) return badge;

        return (
          <TooltipProvider key={badgeType}>
            <Tooltip>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {config.tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

// Helper to determine badges for a flight/hotel/car result
export function calculateResultBadges(result: {
  price?: number;
  avgPrice?: number;
  duration?: number;
  avgDuration?: number;
  bookings?: number;
  isFlexible?: boolean;
  isDirect?: boolean;
  isPopular?: boolean;
}): BadgeType[] {
  const badges: BadgeType[] = [];

  // Best Value: Good price + reasonable duration
  if (
    result.price &&
    result.avgPrice &&
    result.duration &&
    result.avgDuration
  ) {
    const priceScore = (result.avgPrice - result.price) / result.avgPrice;
    const durationScore = (result.avgDuration - result.duration) / result.avgDuration;
    if (priceScore > 0.1 && durationScore > -0.2) {
      badges.push("bestValue");
    }
  }

  // Cheapest
  if (result.price && result.avgPrice && result.price < result.avgPrice * 0.9) {
    badges.push("cheapest");
  }

  // Fastest
  if (result.duration && result.avgDuration && result.duration < result.avgDuration * 0.8) {
    badges.push("fastest");
  }

  // Most Popular
  if (result.isPopular || (result.bookings && result.bookings > 100)) {
    badges.push("mostPopular");
  }

  // Flexible Fare
  if (result.isFlexible) {
    badges.push("flexibleFare");
  }

  // Direct Flight
  if (result.isDirect) {
    badges.push("directFlight");
  }

  return badges;
}

export default ResultBadges;
