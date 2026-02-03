/**
 * Results Container
 * Two-column layout with sidebar filters (desktop) and results list
 * Premium, consistent design system across Flights, Hotels, Cars
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResultsContainerProps {
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ResultsContainer({ filters, children, className }: ResultsContainerProps) {
  return (
    <div className={cn("flex gap-6", className)}>
      {/* Filters Sidebar (Desktop) */}
      {filters && (
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-36 space-y-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-5">
            {filters}
          </div>
        </aside>
      )}

      {/* Results List */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// Results header with count, sort, filter trigger, and chips slot
interface ResultsHeaderProps {
  count: number;
  itemName: string;
  isLoading?: boolean;
  indicativePrice?: boolean;
  sortElement?: ReactNode;
  filterTrigger?: ReactNode;
  filterChips?: ReactNode;
  className?: string;
}

export function ResultsHeader({
  count,
  itemName,
  isLoading = false,
  indicativePrice = false,
  sortElement,
  filterTrigger,
  filterChips,
  className,
}: ResultsHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {isLoading ? (
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <h2 className="text-lg font-semibold">
                <span className="text-foreground">{count}</span>{" "}
                <span className="text-muted-foreground">
                  {itemName}
                  {count !== 1 ? "s" : ""} found
                </span>
              </h2>
              {indicativePrice && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Final prices shown — tickets issued instantly after payment.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filterTrigger}
          {sortElement}
        </div>
      </div>
      
      {/* Filter chips row */}
      {filterChips}
    </div>
  );
}
