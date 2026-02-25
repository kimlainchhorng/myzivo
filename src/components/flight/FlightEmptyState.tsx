/**
 * Flight Empty State Component - OTA Version
 * Shown when no results match current search/filters
 * ZIVO is MoR - NO partner fallback, NO affiliate redirects
 */

import { Plane, Calendar, MapPin, RefreshCw, Lightbulb } from "lucide-react";
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
    'MIA': [
      { code: 'FLL', name: 'Fort Lauderdale' },
      { code: 'PBI', name: 'Palm Beach' },
    ],
    'DFW': [
      { code: 'DAL', name: 'Love Field' },
    ],
    'DEN': [
      { code: 'COS', name: 'Colorado Springs' },
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

  // Tips based on filter state
  const tips = hasActiveFilters
    ? [
        "Remove some filters to see more options",
        "Allow 1+ stops instead of nonstop only",
        "Include more departure times",
        "Increase your price range",
      ]
    : [
        "Try nearby airports (e.g., EWR instead of JFK)",
        "Use flexible dates (+/- 3 days)",
        "Consider fewer passengers",
        "Check for alternative routes with connections",
      ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
            <Plane className="w-10 h-10 text-sky-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {hasActiveFilters ? "No flights match your filters" : "No flights available"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your filters to see more results."
              : `No flights found for these dates${origin && destination ? ` from ${origin} to ${destination}` : ""}. Try different dates or nearby airports.`}
          </p>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && onClearFilters && (
          <div className="flex justify-center mb-6">
            <Button onClick={onClearFilters} className="gap-2 bg-sky-500 hover:bg-sky-600">
              <RefreshCw className="w-4 h-4" />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-muted/30 rounded-xl p-5 max-w-lg mx-auto mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm">Tips to find more flights</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-sky-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Try alternate dates */}
          {alternateDates.length > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-sky-500/30 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold text-sm">Try flexible dates</h3>
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
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-emerald-500/30 hover:shadow-sm transition-all duration-200">
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

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button 
            onClick={onNewSearch}
            variant="outline"
            className="gap-2"
          >
            <Plane className="w-4 h-4" />
            Modify Search
          </Button>
        </div>

        {/* OTA disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center mt-6 max-w-md mx-auto">
          ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
        </p>
      </CardContent>
    </Card>
  );
}
