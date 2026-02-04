/**
 * GroupBookingBanner Component
 * Shows when booking for large groups
 */

import { Users, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface GroupBookingBannerProps {
  passengerCount?: number;
  threshold?: number;
  className?: string;
  seatsAvailable?: number;
}

export function GroupBookingBanner({
  passengerCount = 0,
  threshold = 6,
  className,
  seatsAvailable,
}: GroupBookingBannerProps) {
  // Only show if passenger count exceeds threshold
  if (passengerCount < threshold) return null;

  const isLimitedSeats = seatsAvailable && seatsAvailable < passengerCount + 2;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10",
        "border border-violet-500/20 p-5",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl" />
      
      <div className="relative flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-violet-500" />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-semibold text-lg">Booking for a group?</h3>
          <p className="text-sm text-muted-foreground">
            Get special rates and dedicated support for groups of {threshold}+ travelers.
          </p>
          {isLimitedSeats && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Limited seats available at this price
            </p>
          )}
        </div>
        
        <Button asChild className="gap-2 bg-violet-500 hover:bg-violet-600">
          <Link to="/contact?subject=group-booking">
            Request Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Group fare notice */}
      <div className="mt-4 pt-3 border-t border-violet-500/20">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Group fares may have special rules and conditions. Contact us for details.
        </p>
      </div>
    </div>
  );
}

// Compact version for inline use
export function GroupBookingNotice({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Users className="w-4 h-4" />
      <span>
        Booking for 10+ travelers?{" "}
        <Link to="/contact?subject=group-booking" className="text-primary hover:underline">
          Get group rates
        </Link>
      </span>
    </div>
  );
}
