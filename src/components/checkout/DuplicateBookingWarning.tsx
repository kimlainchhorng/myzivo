/**
 * Duplicate Booking Warning
 * Warns users when they may be creating a duplicate booking
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface DuplicateBookingWarningProps {
  className?: string;
  onContinue?: () => void;
  onDismiss?: () => void;
  routeInfo?: string;
  dateInfo?: string;
}

const DuplicateBookingWarning = ({
  className,
  onContinue,
  onDismiss,
  routeInfo = "NYC → LAX",
  dateInfo = "Similar dates",
}: DuplicateBookingWarningProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleContinue = () => {
    setIsDismissed(true);
    onContinue?.();
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-amber-500/10 border border-amber-500/30 p-4",
      className
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-xl hover:bg-amber-500/20 transition-all duration-200 active:scale-[0.90] touch-manipulation"
        aria-label="Dismiss warning"
      >
        <X className="w-4 h-4 text-amber-600" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 pr-6">
          <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-1">
            Possible Duplicate Booking
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            It looks like you may have already booked a similar trip:
          </p>
          <div className="p-3 rounded-xl bg-background/50 border border-amber-500/20 mb-4">
            <p className="text-sm font-medium">{routeInfo}</p>
            <p className="text-xs text-muted-foreground">{dateInfo}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-amber-500/30 hover:bg-amber-500/10"
            >
              <Link to="/my-trips" className="gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                View My Bookings
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContinue}
              className="text-muted-foreground hover:text-foreground"
            >
              Continue Anyway
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateBookingWarning;
