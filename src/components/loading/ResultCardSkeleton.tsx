/**
 * Result Card Skeleton
 * Loading placeholder for travel result cards
 */
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface ResultCardSkeletonProps {
  variant?: "flights" | "hotels" | "cars";
  className?: string;
  style?: CSSProperties;
}

const ResultCardSkeleton = ({ 
  variant = "flights",
  className,
  style
}: ResultCardSkeletonProps) => {
  return (
    <div 
      className={cn(
        "bg-card rounded-2xl border border-border/50 p-4 animate-pulse",
        className
      )}
      style={style}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-16 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-5 w-20 bg-muted rounded mb-1" />
          <div className="h-3 w-14 bg-muted/60 rounded" />
        </div>
      </div>

      {/* Content - varies by type */}
      {variant === "flights" && (
        <div className="flex items-center justify-between py-3 border-t border-border/30">
          <div className="text-center">
            <div className="h-5 w-12 bg-muted rounded mx-auto mb-1" />
            <div className="h-3 w-8 bg-muted/60 rounded mx-auto" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-0.5 bg-muted rounded-full" />
            <div className="h-3 w-16 bg-muted/60 rounded mx-auto mt-2" />
          </div>
          <div className="text-center">
            <div className="h-5 w-12 bg-muted rounded mx-auto mb-1" />
            <div className="h-3 w-8 bg-muted/60 rounded mx-auto" />
          </div>
        </div>
      )}

      {variant === "hotels" && (
        <div className="py-3 border-t border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <div className="h-3 w-24 bg-muted/60 rounded" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-muted/40 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {variant === "cars" && (
        <div className="py-3 border-t border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-20 h-12 bg-muted rounded-lg" />
            <div className="flex-1">
              <div className="h-4 w-28 bg-muted rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-3 w-12 bg-muted/60 rounded" />
                <div className="h-3 w-12 bg-muted/60 rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-3">
        <div className="flex gap-2">
          <div className="h-6 w-14 bg-muted/40 rounded-lg" />
          <div className="h-6 w-14 bg-muted/40 rounded-lg" />
        </div>
        <div className="h-10 w-24 bg-muted rounded-xl" />
      </div>
    </div>
  );
};

export default ResultCardSkeleton;
