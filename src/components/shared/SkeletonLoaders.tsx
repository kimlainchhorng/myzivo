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

// Hero Image Skeleton - Full-width 16:9
const SkeletonHeroImage = ({ className }: { className?: string }) => {
  return (
    <div 
      className={cn(
        "w-full aspect-video rounded-xl bg-muted/30 animate-pulse relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-transparent to-muted/50" />
    </div>
  );
};

// Service Card Skeleton - 4:3 aspect ratio
const SkeletonServiceCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse", className)}>
      {/* Image placeholder - 4:3 aspect */}
      <div className="aspect-[4/3] bg-muted/50 relative">
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-muted/30" />
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-4 w-24 bg-muted/50 rounded" />
        <div className="h-3 w-full bg-muted/30 rounded" />
        <div className="h-4 w-20 bg-muted/40 rounded" />
      </div>
    </div>
  );
};

// Destination Tile Skeleton - 1:1 square
const SkeletonDestinationTile = ({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-xl overflow-hidden bg-card animate-pulse", className)}>
      {/* Image placeholder - 1:1 aspect */}
      <div className="aspect-square bg-muted/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 space-y-1">
          <div className="h-4 w-20 bg-muted/50 rounded" />
          <div className="h-3 w-14 bg-muted/30 rounded" />
        </div>
      </div>
    </div>
  );
};

// Hero Skeleton (legacy)
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

// Services Grid Skeleton (6 cards in grid)
const SkeletonServicesGrid = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonServiceCard key={index} />
      ))}
    </div>
  );
};

// Destinations Row Skeleton (8 tiles)
const SkeletonDestinationsRow = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonDestinationTile key={index} />
      ))}
    </div>
  );
};

export { 
  SkeletonCard, 
  SkeletonList, 
  SkeletonGrid, 
  SkeletonHero, 
  SkeletonSearchBar,
  SkeletonHeroImage,
  SkeletonServiceCard,
  SkeletonDestinationTile,
  SkeletonServicesGrid,
  SkeletonDestinationsRow,
};
