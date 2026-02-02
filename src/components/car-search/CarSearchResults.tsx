/**
 * Car Search Results Component
 * Grid display of vehicle results with loading and empty states
 */

import { Car, Loader2, SearchX } from "lucide-react";
import { CarInventoryItem } from "@/types/carInventory";
import { CarInventoryCard } from "./CarInventoryCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CarSearchResultsProps {
  results: CarInventoryItem[];
  loading: boolean;
  hasSearched: boolean;
}

export function CarSearchResults({ 
  results, 
  loading, 
  hasSearched 
}: CarSearchResultsProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching vehicles...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Initial state - before any search
  if (!hasSearched) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Car className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Search for Vehicles</h3>
          <p className="text-muted-foreground mt-1">
            Use the filters above to find your perfect car
          </p>
        </div>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <SearchX className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">No Results Found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your filters or broadening your search
          </p>
        </div>
      </div>
    );
  }

  // Results grid
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found <span className="font-semibold text-foreground">{results.length}</span> vehicles
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((vehicle) => (
          <CarInventoryCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
