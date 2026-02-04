/**
 * ROOM BADGE
 * 
 * Social proof badges for hotel rooms
 * Most Booked, Best Value, etc.
 */

import { Users, Star, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROOM_BADGES } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  'most-booked': Users,
  'best-value': Star,
  'recommended': ThumbsUp,
};

interface RoomBadgeProps {
  type: 'most-booked' | 'best-value' | 'recommended';
  className?: string;
}

export default function RoomBadge({ type, className }: RoomBadgeProps) {
  const config = ROOM_BADGES[type];
  if (!config) return null;
  
  const Icon = ICON_MAP[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold inline-flex items-center gap-1 text-xs",
        config.color,
        config.bgColor,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
