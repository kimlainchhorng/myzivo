/**
 * TrustScoreBadges - Visual trust indicators for booking flow
 */

import { Shield, Clock, CheckCircle2, BadgeCheck, Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BadgeType = "realtime" | "verified_partner" | "no_hidden_fees" | "price_checked" | "secure" | "transparent";

interface TrustBadgeConfig {
  icon: typeof Shield;
  label: string;
  description: string;
  colorClass: string;
}

const badgeConfigs: Record<BadgeType, TrustBadgeConfig> = {
  realtime: {
    icon: Clock,
    label: "Real-time prices",
    description: "Prices refreshed live from providers",
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  },
  verified_partner: {
    icon: BadgeCheck,
    label: "Verified Partner",
    description: "Licensed and trusted travel provider",
    colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  },
  no_hidden_fees: {
    icon: Eye,
    label: "No Hidden Fees",
    description: "What you see is what you pay",
    colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
  },
  price_checked: {
    icon: CheckCircle2,
    label: "Price Checked",
    description: "Verified against provider rates",
    colorClass: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800",
  },
  secure: {
    icon: Lock,
    label: "Secure Booking",
    description: "256-bit SSL encryption",
    colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  transparent: {
    icon: Shield,
    label: "Transparent Pricing",
    description: "All fees shown upfront",
    colorClass: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
  },
};

interface TrustScoreBadgeProps {
  type: BadgeType;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrustScoreBadge({
  type,
  showDescription = false,
  size = "md",
  className,
}: TrustScoreBadgeProps) {
  const config = badgeConfigs[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        variant="outline"
        className={cn(
          "font-medium border gap-1.5",
          config.colorClass,
          sizeClasses[size]
        )}
      >
        <Icon className={iconSizes[size]} />
        {config.label}
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground">{config.description}</span>
      )}
    </div>
  );
}

interface TrustScoreBadgesProps {
  badges?: BadgeType[];
  size?: "sm" | "md" | "lg";
  layout?: "inline" | "grid" | "stack";
  className?: string;
}

export function TrustScoreBadges({
  badges = ["realtime", "verified_partner", "no_hidden_fees"],
  size = "sm",
  layout = "inline",
  className,
}: TrustScoreBadgesProps) {
  const layoutClasses = {
    inline: "flex flex-wrap items-center gap-2",
    grid: "grid grid-cols-2 sm:grid-cols-3 gap-2",
    stack: "flex flex-col gap-2",
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {badges.map((badge) => (
        <TrustScoreBadge key={badge} type={badge} size={size} />
      ))}
    </div>
  );
}

// Timestamp badge for price freshness
export function PriceCheckedBadge({
  timestamp,
  className,
}: {
  timestamp?: Date;
  className?: string;
}) {
  const getTimeAgo = () => {
    if (!timestamp) return "just now";
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 120) return "1 min ago";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      <span>Price checked {getTimeAgo()}</span>
    </div>
  );
}

export default TrustScoreBadges;
