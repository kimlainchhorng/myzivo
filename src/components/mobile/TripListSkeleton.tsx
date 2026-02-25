/**
 * TripListSkeleton Component
 * 
 * Loading skeleton for trip/order lists in driver views.
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TripListSkeletonProps {
  count?: number;
  className?: string;
}

const TripListSkeleton: React.FC<TripListSkeletonProps> = ({ 
  count = 5,
  className 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="flex items-center gap-3 p-3 bg-card border rounded-xl"
        >
          {/* Icon placeholder */}
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DriverStatsSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {/* Today's Earnings */}
      <div className="p-4 bg-card border rounded-xl text-center space-y-2">
        <Skeleton className="h-3 w-16 mx-auto" />
        <Skeleton className="h-7 w-20 mx-auto" />
      </div>
      
      {/* Trips Completed */}
      <div className="p-4 bg-card border rounded-xl text-center space-y-2">
        <Skeleton className="h-3 w-12 mx-auto" />
        <Skeleton className="h-7 w-8 mx-auto" />
      </div>
      
      {/* Online Hours */}
      <div className="p-4 bg-card border rounded-xl text-center space-y-2">
        <Skeleton className="h-3 w-14 mx-auto" />
        <Skeleton className="h-7 w-12 mx-auto" />
      </div>
    </div>
  );
};

export const ActiveTripSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      
      {/* Route */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
};

export default TripListSkeleton;
