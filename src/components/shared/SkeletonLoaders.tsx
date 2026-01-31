import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  variant?: "flight" | "hotel" | "car" | "default";
  className?: string;
}

const SkeletonCard = ({ variant = "default", className }: SkeletonCardProps) => {
  return (
    <div className={cn(
      "p-5 rounded-2xl bg-card/50 border border-border/50 animate-pulse",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted/50 rounded" />
            <div className="h-3 w-24 bg-muted/30 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted/50 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="h-3 w-full bg-muted/30 rounded" />
        <div className="h-3 w-3/4 bg-muted/30 rounded" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="h-4 w-20 bg-muted/50 rounded" />
        <div className="h-8 w-24 bg-muted/50 rounded-lg" />
      </div>
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  variant?: "flight" | "hotel" | "car" | "default";
}

const SkeletonList = ({ count = 3, variant = "default" }: SkeletonListProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
};

interface SkeletonGridProps {
  count?: number;
  columns?: number;
  variant?: "flight" | "hotel" | "car" | "default";
}

const SkeletonGrid = ({ count = 6, columns = 3, variant = "default" }: SkeletonGridProps) => {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
};

// Hero Skeleton
const SkeletonHero = () => {
  return (
    <div className="w-full h-[400px] rounded-3xl bg-muted/30 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-transparent to-muted/50" />
      <div className="absolute bottom-8 left-8 space-y-4">
        <div className="h-6 w-24 bg-muted/50 rounded-full" />
        <div className="h-10 w-64 bg-muted/50 rounded" />
        <div className="h-4 w-48 bg-muted/30 rounded" />
        <div className="h-12 w-40 bg-muted/50 rounded-xl" />
      </div>
    </div>
  );
};

// Search Bar Skeleton
const SkeletonSearchBar = () => {
  return (
    <div className="w-full p-6 rounded-2xl bg-card/50 border border-border/50 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 bg-muted/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

export { SkeletonCard, SkeletonList, SkeletonGrid, SkeletonHero, SkeletonSearchBar };
