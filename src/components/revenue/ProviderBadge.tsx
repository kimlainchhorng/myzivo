/**
 * PROVIDER BADGE
 * 
 * Smart badges for highlighting provider attributes
 * Best Deal, Most Flexible, Official Airline, etc.
 */

import { DollarSign, RefreshCw, Plane, Users, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROVIDER_BADGES, type ProviderBadgeType } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  DollarSign,
  RefreshCw,
  Plane,
  Users,
  Star,
  Zap,
};

interface ProviderBadgeProps {
  type: ProviderBadgeType;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
}

export default function ProviderBadge({
  type,
  size = "default",
  showIcon = true,
  className,
}: ProviderBadgeProps) {
  const config = PROVIDER_BADGES[type];
  if (!config) return null;
  
  const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
  
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0",
    default: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold inline-flex items-center gap-1",
        sizeClasses[size],
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
