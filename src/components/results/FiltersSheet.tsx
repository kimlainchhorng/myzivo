/**
 * Mobile Filters Bottom Sheet
 * Consistent filter UX across all results pages
 */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
  hasActiveFilters?: boolean;
  service?: "flights" | "hotels" | "cars";
}

const serviceColors = {
  flights: "bg-sky-500 hover:bg-sky-600",
  hotels: "bg-amber-500 hover:bg-amber-600",
  cars: "bg-violet-500 hover:bg-violet-600",
};

export function FiltersSheet({
  open,
  onOpenChange,
  children,
  onApply,
  onReset,
  hasActiveFilters = false,
  service = "flights",
}: FiltersSheetProps) {
  const applyColor = serviceColors[service];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </SheetTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">{children}</div>

        <SheetFooter className="border-t border-border/50 pt-4 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}
            className={cn("flex-1 text-white", applyColor)}
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Filter button trigger for mobile
interface FiltersTriggerProps {
  onClick: () => void;
  activeCount?: number;
  className?: string;
}

export function FiltersTrigger({ onClick, activeCount = 0, className }: FiltersTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("lg:hidden gap-2 relative", className)}
    >
      <Filter className="w-4 h-4" />
      Filters
      {activeCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
