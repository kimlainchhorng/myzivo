/**
 * Mobile Filters Bottom Sheet
 * Consistent filter UX across all results pages
 * Premium design with service-specific accent colors
 */

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
  hasActiveFilters?: boolean;
  service?: "flights" | "hotels" | "cars";
  resultsCount?: number;
  isLoading?: boolean;
}

const serviceColors = {
  flights: {
    button: "bg-sky-500 hover:bg-sky-600",
    badge: "bg-sky-500",
    accent: "text-sky-500",
  },
  hotels: {
    button: "bg-amber-500 hover:bg-amber-600",
    badge: "bg-amber-500",
    accent: "text-amber-500",
  },
  cars: {
    button: "bg-violet-500 hover:bg-violet-600",
    badge: "bg-violet-500",
    accent: "text-violet-500",
  },
};

export function FiltersSheet({
  open,
  onOpenChange,
  children,
  onApply,
  onReset,
  hasActiveFilters = false,
  service = "flights",
  resultsCount,
  isLoading = false,
}: FiltersSheetProps) {
  const colors = serviceColors[service];

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col rounded-t-3xl">
        <SheetHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <SlidersHorizontal className={cn("w-5 h-5", colors.accent)} />
              Filters
            </SheetTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Reset All
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-5 -mx-6 px-6">
          {children}
        </ScrollArea>

        <SheetFooter className="border-t border-border/50 pt-4 gap-3 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isLoading}
            className={cn("flex-1 text-white font-semibold", colors.button)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating…
              </>
            ) : resultsCount !== undefined ? (
              `Show ${resultsCount} Result${resultsCount !== 1 ? "s" : ""}`
            ) : (
              "Show Results"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Sticky filter/sort row for mobile
interface FiltersTriggerProps {
  onClick: () => void;
  activeCount?: number;
  service?: "flights" | "hotels" | "cars";
  className?: string;
}

export function FiltersTrigger({ onClick, activeCount = 0, service = "flights", className }: FiltersTriggerProps) {
  const colors = serviceColors[service];

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("lg:hidden gap-2", className)}
    >
      <SlidersHorizontal className="w-4 h-4" />
      Filters
      {activeCount > 0 && (
        <Badge className={cn("ml-1 h-5 px-1.5 text-xs text-white", colors.badge)}>
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
