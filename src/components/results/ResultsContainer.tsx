/**
 * Results Container
 * Two-column layout with sidebar filters (desktop) and results list
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
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-36 space-y-6">{filters}</div>
        </aside>
      )}

      {/* Results List */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// Results header with count and sort
interface ResultsHeaderProps {
  count: number;
  itemName: string;
  isLoading?: boolean;
  indicativePrice?: boolean;
  sortElement?: ReactNode;
  filterTrigger?: ReactNode;
  className?: string;
}

export function ResultsHeader({
  count,
  itemName,
  isLoading = false,
  indicativePrice = false,
  sortElement,
  filterTrigger,
  className,
}: ResultsHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
      <div>
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {count} {itemName}
            {count !== 1 ? "s" : ""} found
            {indicativePrice && " • Indicative prices*"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {filterTrigger}
        {sortElement}
      </div>
    </div>
  );
}
