/**
 * Timing Suggestion Badge Component
 * Displays contextual time-based labels like "Popular for lunch"
 */
import { Clock, Sun, Moon, Coffee, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

type MealPeriod = "breakfast" | "lunch" | "dinner" | "late_night";

interface TimingSuggestionBadgeProps {
  period: MealPeriod;
  className?: string;
  variant?: "default" | "compact";
}

const periodConfig: Record<
  MealPeriod,
  { label: string; icon: typeof Clock; bgColor: string; textColor: string }
> = {
  breakfast: {
    label: "Great for breakfast",
    icon: Coffee,
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
  },
  lunch: {
    label: "Popular for lunch",
    icon: Sun,
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
  },
  dinner: {
    label: "Popular tonight",
    icon: Utensils,
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
  },
  late_night: {
    label: "Late night craving?",
    icon: Moon,
    bgColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
  },
};

export function TimingSuggestionBadge({
  period,
  className,
  variant = "default",
}: TimingSuggestionBadgeProps) {
  const config = periodConfig[period];
  const Icon = config.icon;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
          config.bgColor,
          className
        )}
      >
        <Icon className={cn("w-3 h-3", config.textColor)} />
        <span className={cn("text-[10px] font-bold", config.textColor)}>
          {period === "breakfast" && "Breakfast"}
          {period === "lunch" && "Lunch"}
          {period === "dinner" && "Dinner"}
          {period === "late_night" && "Late Night"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border",
        config.bgColor,
        config.textColor,
        "border-current/20",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">{config.label}</span>
    </div>
  );
}

/**
 * Get timing badge for a restaurant based on its cuisine
 */
export function getTimingBadgeForCuisine(
  cuisineType: string | null
): MealPeriod | null {
  if (!cuisineType) return null;

  const lowerCuisine = cuisineType.toLowerCase();
  const hour = new Date().getHours();

  // Only show badges during relevant hours
  if (hour >= 6 && hour < 11) {
    // Breakfast hours
    if (["coffee", "bakery", "brunch", "breakfast", "cafe"].some((c) => lowerCuisine.includes(c))) {
      return "breakfast";
    }
  } else if (hour >= 11 && hour < 15) {
    // Lunch hours
    if (
      ["fast food", "healthy", "asian", "american", "sandwich", "salad"].some((c) =>
        lowerCuisine.includes(c)
      )
    ) {
      return "lunch";
    }
  } else if (hour >= 17 && hour < 21) {
    // Dinner hours
    if (
      ["italian", "fine dining", "steakhouse", "indian", "thai", "japanese"].some((c) =>
        lowerCuisine.includes(c)
      )
    ) {
      return "dinner";
    }
  } else if (hour >= 21 || hour < 2) {
    // Late night
    if (["fast food", "pizza", "mexican", "burger", "wings"].some((c) => lowerCuisine.includes(c))) {
      return "late_night";
    }
  }

  return null;
}
