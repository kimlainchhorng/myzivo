/**
 * Skeleton loader for hotel results
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HotelResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-border/50 bg-card/50">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Image Skeleton */}
              <Skeleton className="w-full sm:w-48 h-48 rounded-none" />

              {/* Content Skeleton */}
              <div className="flex-1 p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-16" />
                </div>
                
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-border/50">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
