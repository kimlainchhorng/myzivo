/**
 * OrderCardSkeleton Component
 * 
 * Loading skeleton for order cards in mobile views.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OrderCardSkeletonProps {
  className?: string;
}

const OrderCardSkeleton: React.FC<OrderCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)}>
      {/* Header with status badge */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Address lines */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      </div>
      
      {/* Footer with price and time */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
};

export const OrderCardSkeletonList: React.FC<{ count?: number; className?: string }> = ({ 
  count = 3,
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default OrderCardSkeleton;
