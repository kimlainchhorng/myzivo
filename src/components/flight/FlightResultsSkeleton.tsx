/**
 * Flight Results Skeleton
 * Shimmer loading state matching flight card layout
 */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FlightResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-muted/10 border-border/20">
            <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flight cards skeleton */}
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Airline info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              {/* Route */}
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="space-y-1.5 text-center">
                  <Skeleton className="h-5 w-12 mx-auto" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="w-16 sm:w-24 h-px" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
                <div className="space-y-1.5 text-center">
                  <Skeleton className="h-5 w-12 mx-auto" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
              </div>
              {/* Price */}
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-7 w-20 ml-auto" />
                <Skeleton className="h-2.5 w-14 ml-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
