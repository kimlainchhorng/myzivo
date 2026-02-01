/**
 * Active Filters Chips
 * Shows applied filters as removable chips
 */

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterChip {
  id: string;
  label: string;
  category: string;
}

interface ActiveFiltersChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  service?: "flights" | "hotels" | "cars";
  className?: string;
}

const chipColors = {
  flights: "bg-sky-500/10 text-sky-500 border-sky-500/30 hover:bg-sky-500/20",
  hotels: "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20",
  cars: "bg-violet-500/10 text-violet-500 border-violet-500/30 hover:bg-violet-500/20",
};

export function ActiveFiltersChips({
  filters,
  onRemove,
  onClearAll,
  service = "flights",
  className,
}: ActiveFiltersChipsProps) {
  if (filters.length === 0) return null;

  const chipColor = chipColors[service];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="outline"
          className={cn(
            "gap-1.5 pr-1 cursor-pointer transition-colors",
            chipColor
          )}
          onClick={() => onRemove(filter.id)}
        >
          <span className="text-xs opacity-70">{filter.category}:</span>
          {filter.label}
          <X className="w-3 h-3 opacity-50 hover:opacity-100" />
        </Badge>
      ))}
      
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
