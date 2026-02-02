/**
 * Results Page Skeleton
 * Full page skeleton for results loading state
 */
import ResultCardSkeleton from "./ResultCardSkeleton";

interface ResultsPageSkeletonProps {
  variant?: "flights" | "hotels" | "cars";
  count?: number;
}

const ResultsPageSkeleton = ({ 
  variant = "flights",
  count = 5 
}: ResultsPageSkeletonProps) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search Summary Skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-48 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-20 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Filter Bar Skeleton (Desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-10 w-24 bg-muted/50 rounded-xl animate-pulse"
          />
        ))}
        <div className="flex-1" />
        <div className="h-10 w-32 bg-muted/50 rounded-xl animate-pulse" />
      </div>

      {/* Results Count */}
      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />

      {/* Result Cards */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <ResultCardSkeleton 
            key={i} 
            variant={variant}
            className="animate-in fade-in duration-300"
            style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsPageSkeleton;
