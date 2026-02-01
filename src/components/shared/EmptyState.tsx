import { Plane, Hotel, Car, CarTaxiFront, UtensilsCrossed, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateType = "flights" | "hotels" | "cars" | "rides" | "eats" | "search";

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<EmptyStateType, React.ElementType> = {
  flights: Plane,
  hotels: Hotel,
  cars: Car,
  rides: CarTaxiFront,
  eats: UtensilsCrossed,
  search: Search,
};

const colorMap: Record<EmptyStateType, { bg: string; icon: string }> = {
  flights: { bg: "bg-flights/10", icon: "text-flights" },
  hotels: { bg: "bg-hotels/10", icon: "text-hotels" },
  cars: { bg: "bg-cars/10", icon: "text-cars" },
  rides: { bg: "bg-rides/10", icon: "text-rides" },
  eats: { bg: "bg-eats/10", icon: "text-eats" },
  search: { bg: "bg-primary/10", icon: "text-primary" },
};

/**
 * EmptyState - Clean illustration for empty search results and initial states.
 * Uses consistent service-themed icons rather than random illustrations.
 * 
 * @example
 * <EmptyState
 *   type="flights"
 *   title="Search flights to see live prices"
 *   description="Enter your route and dates to compare prices from 500+ airlines."
 *   actionLabel="Start Searching"
 *   onAction={() => focusSearchInput()}
 * />
 */
export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "w-20 h-20 rounded-3xl flex items-center justify-center mb-6",
          colors.bg
        )}
        aria-hidden="true"
      >
        <Icon className={cn("w-10 h-10", colors.icon)} />
      </div>

      {/* Text Content */}
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}

      {/* Decorative dots */}
      <div className="flex items-center gap-1.5 mt-8" aria-hidden="true">
        <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
        <div className={cn("w-2 h-2 rounded-full", colors.bg, "opacity-60")} />
        <div className={cn("w-2 h-2 rounded-full", colors.bg, "opacity-30")} />
      </div>
    </div>
  );
}

export default EmptyState;
