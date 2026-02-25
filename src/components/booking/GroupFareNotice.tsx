/**
 * GroupFareNotice - Notice for group booking rules and conditions
 */

import { Users, Info, Phone, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface GroupFareNoticeProps {
  passengerCount: number;
  showForThreshold?: number; // Minimum passengers to show notice
  variant?: "inline" | "card" | "alert";
  className?: string;
}

export function GroupFareNotice({
  passengerCount,
  showForThreshold = 6,
  variant = "card",
  className,
}: GroupFareNoticeProps) {
  // Only show if passenger count meets threshold
  if (passengerCount < showForThreshold) return null;

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Users className="w-4 h-4 text-violet-500" />
        <span>
          Group fares may have special rules and conditions.{" "}
          <Link to="/contact?subject=group-booking" className="text-primary hover:underline">
            Contact us for details
          </Link>
        </span>
      </div>
    );
  }

  if (variant === "alert") {
    return (
      <Alert className={cn("border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30", className)}>
        <Users className="h-4 w-4 text-violet-600" />
        <AlertTitle className="text-violet-800 dark:text-violet-200">Group Booking ({passengerCount}+ travelers)</AlertTitle>
        <AlertDescription className="text-violet-700 dark:text-violet-300">
          Group fares may have special rules and conditions. For the best rates and personalized service, 
          contact our group booking team.
        </AlertDescription>
      </Alert>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
        "border border-violet-200 dark:border-violet-800",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-violet-900 dark:text-violet-100 mb-1">
            Group Booking • {passengerCount} Travelers
          </h4>
          <p className="text-sm text-violet-700 dark:text-violet-300 mb-3">
            Group fares may have special rules and conditions. Our team can help you get:
          </p>
          <ul className="text-sm text-violet-600 dark:text-violet-400 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Negotiated group discounts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Flexible payment options
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Dedicated support for your group
            </li>
          </ul>
          <Button asChild size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Link to="/contact?subject=group-booking">
              <Phone className="w-4 h-4" />
              Request Group Quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Compact seat availability notice
export function SeatAvailabilityNotice({
  seatsAvailable,
  passengerCount,
  className,
}: {
  seatsAvailable?: number;
  passengerCount: number;
  className?: string;
}) {
  if (!seatsAvailable) return null;
  
  const isLimited = seatsAvailable < passengerCount + 2;
  const isInsufficient = seatsAvailable < passengerCount;

  if (isInsufficient) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm px-3 py-2 rounded-xl",
        "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
        className
      )}>
        <AlertCircle className="w-4 h-4" />
        <span>Only {seatsAvailable} seats available at this price</span>
      </div>
    );
  }

  if (isLimited) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm px-3 py-2 rounded-xl",
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        className
      )}>
        <Info className="w-4 h-4" />
        <span>Limited seats at this price ({seatsAvailable} remaining)</span>
      </div>
    );
  }

  return null;
}

export default GroupFareNotice;
