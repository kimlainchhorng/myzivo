/**
 * Flight Sticky Header
 * Persistent header showing route, date, passengers, cabin with modify link
 */

import { Plane, Calendar, Users, Armchair, ChevronDown, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface FlightStickyHeaderProps {
  origin: string;
  originCity?: string;
  destination: string;
  destinationCity?: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  onChangeFlight?: () => void;
  className?: string;
}

export default function FlightStickyHeader({
  origin,
  originCity,
  destination,
  destinationCity,
  departDate,
  returnDate,
  passengers,
  cabinClass,
  onChangeFlight,
  className,
}: FlightStickyHeaderProps) {
  const cabinLabel = 
    cabinClass === "first" ? "First" :
    cabinClass === "business" ? "Business" :
    cabinClass === "premium" || cabinClass === "premium_economy" ? "Premium" : "Economy";

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn(
      "sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Route Info */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Route */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Plane className="w-4 h-4 text-sky-500" />
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <span>{origin}</span>
                <span className="text-muted-foreground">→</span>
                <span>{destination}</span>
              </div>
              {returnDate && (
                <Badge variant="outline" className="text-xs">Round Trip</Badge>
              )}
            </div>

            {/* Divider */}
            <span className="hidden sm:inline text-border">|</span>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(departDate)}</span>
              {returnDate && (
                <>
                  <span>-</span>
                  <span>{formatDate(returnDate)}</span>
                </>
              )}
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{passengers} traveler{passengers > 1 ? "s" : ""}</span>
            </div>

            {/* Cabin */}
            <Badge variant="secondary" className="text-xs gap-1">
              <Armchair className="w-3 h-3" />
              {cabinLabel}
            </Badge>
          </div>

          {/* Change Flight Link */}
          {onChangeFlight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeFlight}
              className="gap-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-500/10"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Change flight</span>
              <span className="sm:hidden">Change</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
