/**
 * SocialProofBadges - Recently booked, high demand, seats left
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, Flame, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ProofType = "recently_booked" | "high_demand" | "seats_left" | "popular" | "selling_fast";

interface SocialProofBadgeProps {
  type: ProofType;
  count?: number;
  className?: string;
}

const badgeConfigs: Record<ProofType, {
  icon: typeof Users;
  label: (count?: number) => string;
  colorClass: string;
  animate?: boolean;
}> = {
  recently_booked: {
    icon: Users,
    label: (count) => `${count || 12} people booked in the last hour`,
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  },
  high_demand: {
    icon: TrendingUp,
    label: () => "High demand",
    colorClass: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    animate: true,
  },
  seats_left: {
    icon: AlertTriangle,
    label: (count) => `Only ${count || 3} seats left at this price`,
    colorClass: "bg-red-500/10 text-red-500 border-red-500/30",
    animate: true,
  },
  popular: {
    icon: Flame,
    label: () => "Popular route",
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  },
  selling_fast: {
    icon: Clock,
    label: () => "Selling fast",
    colorClass: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    animate: true,
  },
};

export function SocialProofBadge({ type, count, className }: SocialProofBadgeProps) {
  const config = badgeConfigs[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium",
        config.colorClass,
        config.animate && "animate-pulse",
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label(count)}
    </Badge>
  );
}

interface SocialProofBarProps {
  recentBookings?: number;
  seatsLeft?: number;
  isHighDemand?: boolean;
  isPopular?: boolean;
  className?: string;
}

export function SocialProofBar({
  recentBookings,
  seatsLeft,
  isHighDemand,
  isPopular,
  className,
}: SocialProofBarProps) {
  const badges: { type: ProofType; count?: number }[] = [];

  if (seatsLeft && seatsLeft <= 5) {
    badges.push({ type: "seats_left", count: seatsLeft });
  }
  if (isHighDemand) {
    badges.push({ type: "high_demand" });
  }
  if (recentBookings && recentBookings > 5) {
    badges.push({ type: "recently_booked", count: recentBookings });
  }
  if (isPopular && badges.length < 2) {
    badges.push({ type: "popular" });
  }

  if (badges.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {badges.slice(0, 2).map((badge, index) => (
        <SocialProofBadge key={badge.type} type={badge.type} count={badge.count} />
      ))}
    </motion.div>
  );
}

// Full social proof section for results pages
interface SocialProofSectionProps {
  routeStats?: {
    recentBookings: number;
    seatsAtPrice: number;
    isHighDemand: boolean;
  };
  className?: string;
}

export function SocialProofSection({ routeStats, className }: SocialProofSectionProps) {
  if (!routeStats) return null;

  return (
    <div className={cn(
      "p-3 rounded-xl bg-muted/30 border border-border/50",
      className
    )}>
      <div className="flex flex-wrap items-center gap-3">
        {routeStats.recentBookings > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            <span>
              <span className="font-semibold">{routeStats.recentBookings}</span>
              {" "}people booked this route today
            </span>
          </div>
        )}
        
        {routeStats.isHighDemand && (
          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 gap-1">
            <Flame className="w-3 h-3" />
            High demand
          </Badge>
        )}
        
        {routeStats.seatsAtPrice <= 5 && (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30 gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {routeStats.seatsAtPrice} seats left at this price
          </Badge>
        )}
      </div>
      
      <p className="text-[10px] text-muted-foreground mt-2">
        Availability based on partner data. Final availability confirmed at checkout.
      </p>
    </div>
  );
}

export default SocialProofBadge;
