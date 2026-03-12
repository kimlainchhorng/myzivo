/**
 * GroceryStoreSkeleton — skeleton loading state for grocery marketplace
 */
import { Skeleton } from "@/components/ui/skeleton";

export function GroceryHeroSkeleton() {
  return (
    <div className="mx-4 mt-4 p-4 rounded-[20px] border border-border/20">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-border/10">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function GroceryGridSkeleton() {
  return (
    <div className="px-4 grid grid-cols-2 gap-2.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5 p-4 pt-5 rounded-[20px] border border-border/20">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-1.5 w-full flex flex-col items-center">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroceryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="px-4 space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-[18px] border border-border/20">
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
