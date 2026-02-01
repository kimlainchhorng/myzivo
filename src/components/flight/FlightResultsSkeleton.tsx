import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for flight results page
 * Shows while fetching flight data
 */

export function FlightResultsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-muted/30 border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Flight Cards Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Airline Info Skeleton */}
              <div className="p-4 lg:p-6 flex items-center gap-4 lg:w-56 border-b lg:border-b-0 lg:border-r border-border/50">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Flight Times Skeleton */}
              <div className="flex-1 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  {/* Departure */}
                  <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-10 mx-auto" />
                  </div>

                  {/* Duration */}
                  <div className="flex-1 px-4 lg:px-8">
                    <Skeleton className="h-0.5 w-full rounded-full" />
                    <div className="flex justify-center mt-2 gap-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center space-y-2">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-10 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Price Skeleton */}
              <div className="p-4 lg:p-6 lg:w-56 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-muted/20">
                <div className="space-y-2 text-center">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-10 w-20 mx-auto" />
                  <Skeleton className="h-2 w-16 mx-auto" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FlightResultsHeaderSkeleton() {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
