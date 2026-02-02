/**
 * Flight Empty State Component
 * Shown when no results match current search/filters
 * Suggests alternate dates and nearby airports
 */

import { Plane, Calendar, MapPin, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FlightEmptyStateProps {
  origin?: string;
  destination?: string;
  className?: string;
  onClearFilters?: () => void;
  onNewSearch?: () => void;
  hasActiveFilters?: boolean;
}

// Nearby airport suggestions (simplified - in production would be dynamic)
const getNearbyAirports = (iata: string): { code: string; name: string }[] => {
  const nearby: Record<string, { code: string; name: string }[]> = {
    'JFK': [
      { code: 'LGA', name: 'LaGuardia' },
      { code: 'EWR', name: 'Newark' },
    ],
    'LAX': [
      { code: 'SNA', name: 'John Wayne' },
      { code: 'BUR', name: 'Burbank' },
      { code: 'LGB', name: 'Long Beach' },
    ],
    'ORD': [
      { code: 'MDW', name: 'Midway' },
    ],
    'SFO': [
      { code: 'OAK', name: 'Oakland' },
      { code: 'SJC', name: 'San Jose' },
    ],
  };
  return nearby[iata] || [];
};

// Alternate date suggestions
const getAlternateDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  // Suggest +/- 1, 2, 3 days
  [-3, -2, -1, 1, 2, 3].forEach(offset => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    if (date > today) {
      dates.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
  });
  
  return dates.slice(0, 4);
};

export default function FlightEmptyState({
  origin = '',
  destination = '',
  className,
  onClearFilters,
  onNewSearch,
  hasActiveFilters = false,
}: FlightEmptyStateProps) {
  const nearbyOrigin = getNearbyAirports(origin);
  const nearbyDestination = getNearbyAirports(destination);
  const alternateDates = getAlternateDates();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <Plane className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No flights found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {hasActiveFilters 
              ? "No flights match your current filters. Try adjusting your filters or search criteria."
              : "We couldn't find any flights for your search. Try nearby airports or different dates."}
          </p>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && onClearFilters && (
          <div className="flex justify-center mb-6">
            <Button variant="outline" onClick={onClearFilters} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Clear all filters
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Try alternate dates */}
          {alternateDates.length > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-sm">Try alternate dates</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {alternateDates.map((date) => (
                  <Badge 
                    key={date}
                    variant="outline" 
                    className="cursor-pointer hover:bg-sky-500/10 hover:border-sky-500/50 transition-colors"
                  >
                    {date}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Try nearby airports */}
          {(nearbyOrigin.length > 0 || nearbyDestination.length > 0) && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-sm">Try nearby airports</h3>
              </div>
              <div className="space-y-2">
                {nearbyOrigin.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">From:</span>
                    {nearbyOrigin.map((apt) => (
                      <Badge 
                        key={apt.code}
                        variant="outline" 
                        className="cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/50"
                      >
                        {apt.code} ({apt.name})
                      </Badge>
                    ))}
                  </div>
                )}
                {nearbyDestination.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">To:</span>
                    {nearbyDestination.map((apt) => (
                      <Badge 
                        key={apt.code}
                        variant="outline" 
                        className="cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/50"
                      >
                        {apt.code} ({apt.name})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* New search CTA */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={onNewSearch}
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Plane className="w-4 h-4" />
            New Search
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
