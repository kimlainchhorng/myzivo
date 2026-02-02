/**
 * Mobile Results Footer
 * Shows Filter and Sort buttons for results pages
 */
import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import MobileStickyFooter from "./MobileStickyFooter";

interface SortOption {
  value: string;
  label: string;
}

interface FilterOption {
  id: string;
  label: string;
  checked?: boolean;
}

interface MobileResultsFooterProps {
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (value: string) => void;
  filterGroups?: {
    title: string;
    options: FilterOption[];
  }[];
  onFilterChange?: (filterId: string, checked: boolean) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  filterCount?: number;
  show?: boolean;
}

const MobileResultsFooter = ({
  sortOptions = [
    { value: "price_asc", label: "Cheapest first" },
    { value: "price_desc", label: "Most expensive first" },
    { value: "duration", label: "Shortest duration" },
    { value: "rating", label: "Best rated" },
  ],
  currentSort = "price_asc",
  onSortChange,
  filterGroups = [],
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  filterCount = 0,
  show = true,
}: MobileResultsFooterProps) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <MobileStickyFooter show={show}>
      {/* Filter Button */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl gap-2 font-semibold relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <SheetTitle>Filters</SheetTitle>
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    onClearFilters?.();
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="overflow-y-auto h-full pb-24 pt-4">
            {filterGroups.map((group, index) => (
              <div key={index} className="mb-6">
                <h4 className="font-semibold text-sm mb-3">{group.title}</h4>
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <button
                      key={option.id}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                        option.checked
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      )}
                      onClick={() => onFilterChange?.(option.id, !option.checked)}
                    >
                      <span className="text-sm">{option.label}</span>
                      {option.checked && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Apply Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 pb-safe">
            <Button
              className="w-full h-12 rounded-xl font-bold"
              onClick={() => {
                onApplyFilters?.();
                setFilterOpen(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sort Button */}
      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl gap-2 font-semibold"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Sort by</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-2 pb-safe">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                  currentSort === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                )}
                onClick={() => {
                  onSortChange?.(option.value);
                  setSortOpen(false);
                }}
              >
                <span className="font-medium">{option.label}</span>
                {currentSort === option.value && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </MobileStickyFooter>
  );
};

export default MobileResultsFooter;
