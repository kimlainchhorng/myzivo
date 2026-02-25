/**
 * Reusable Skeleton Cards for loading states
 * Flight, Hotel, Car variants
 */
import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-muted/60", className)} />
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-border/50 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-20" />
        <Shimmer className="h-5 w-16" />
      </div>
      <div className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
        <Shimmer className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <Shimmer className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <Shimmer className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-5 w-1/2" />
        <div className="flex gap-2">
          <Shimmer className="h-6 w-14 rounded-full" />
          <Shimmer className="h-6 w-14 rounded-full" />
          <Shimmer className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Shimmer className="h-6 w-24" />
          <Shimmer className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ResultsListSkeleton({ count = 3, variant = "flight" }: { count?: number; variant?: "flight" | "hotel" | "car" }) {
  const Card = variant === "hotel" ? HotelCardSkeleton : variant === "car" ? CarCardSkeleton : FlightCardSkeleton;
  return (
    <div className={cn(variant === "flight" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4")}>
      {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
    </div>
  );
}
