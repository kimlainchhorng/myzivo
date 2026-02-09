/**
 * Promo Badge Overlay — renders up to 2 promo badges on restaurant cards
 */

import type { PromoBadge } from "@/hooks/useRestaurantPromotions";
import { cn } from "@/lib/utils";

interface PromoBadgeOverlayProps {
  badges: PromoBadge[];
  className?: string;
}

const badgeStyles: Record<PromoBadge["type"], string> = {
  free_delivery: "bg-emerald-500/90 text-white",
  discount: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
  limited: "bg-violet-500/90 text-white",
};

export function PromoBadgeOverlay({ badges, className }: PromoBadgeOverlayProps) {
  if (badges.length === 0) return null;

  return (
    <div className={cn("absolute bottom-3 left-3 flex flex-col gap-1.5", className)}>
      {badges.slice(0, 2).map((badge, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg backdrop-blur-sm",
            badgeStyles[badge.type]
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
