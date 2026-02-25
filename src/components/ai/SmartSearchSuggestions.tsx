/**
 * Smart Search Suggestions
 * Nearby airports, flexible dates, alternative routes
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar,
  TrendingDown,
  ChevronRight,
  X,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DAY_OF_WEEK_SAVINGS,
  FLEXIBLE_DATE_SAVINGS,
  AI_DISCLAIMERS,
} from "@/config/aiPersonalization";

interface NearbyAirport {
  code: string;
  name: string;
  distance: number;
  priceDiff: number;
}

interface DateSuggestion {
  date: Date;
  savings: number;
  label: string;
}

interface AlternativeRoute {
  origin: string;
  destination: string;
  savings: number;
  label: string;
}

interface SmartSearchSuggestionsProps {
  origin?: string;
  destination?: string;
  departDate?: Date;
  returnDate?: Date;
  currentPrice?: number;
  nearbyAirports?: NearbyAirport[];
  alternativeRoutes?: AlternativeRoute[];
  onSelectAirport?: (code: string) => void;
  onSelectDate?: (date: Date) => void;
  onSelectRoute?: (origin: string, destination: string) => void;
  className?: string;
}

export function SmartSearchSuggestions({
  origin,
  destination,
  departDate,
  returnDate,
  currentPrice,
  nearbyAirports = [],
  alternativeRoutes = [],
  onSelectAirport,
  onSelectDate,
  onSelectRoute,
  className,
}: SmartSearchSuggestionsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Generate date suggestions based on day of week
  const dateSuggestions: DateSuggestion[] = [];
  if (departDate && currentPrice) {
    const dayOfWeek = departDate.getDay() as keyof typeof DAY_OF_WEEK_SAVINGS;
    const currentDaySavings = DAY_OF_WEEK_SAVINGS[dayOfWeek].avgSavings;

    // Find better days
    FLEXIBLE_DATE_SAVINGS.forEach((flex) => {
      const newDate = new Date(departDate);
      newDate.setDate(newDate.getDate() + flex.dayShift);
      const newDayOfWeek = newDate.getDay() as keyof typeof DAY_OF_WEEK_SAVINGS;
      const newDaySavings = DAY_OF_WEEK_SAVINGS[newDayOfWeek].avgSavings;

      if (newDaySavings > currentDaySavings) {
        dateSuggestions.push({
          date: newDate,
          savings: Math.round(currentPrice * ((newDaySavings - currentDaySavings) / 100)),
          label: `${flex.label} (${DAY_OF_WEEK_SAVINGS[newDayOfWeek].name})`,
        });
      }
    });
  }

  // Best day suggestion
  const bestDayMessage = departDate
    ? (() => {
        const dayOfWeek = departDate.getDay() as keyof typeof DAY_OF_WEEK_SAVINGS;
        const currentDay = DAY_OF_WEEK_SAVINGS[dayOfWeek];
        if (currentDay.avgSavings < 15) {
          return `Flying on ${DAY_OF_WEEK_SAVINGS[2].name} could save up to $${currentPrice ? Math.round(currentPrice * 0.25) : 120}`;
        }
        return null;
      })()
    : null;

  const hasSuggestions =
    nearbyAirports.length > 0 ||
    dateSuggestions.length > 0 ||
    alternativeRoutes.length > 0 ||
    bestDayMessage;

  if (!hasSuggestions) return null;

  const dismissSuggestion = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-purple-500/5",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h4 className="font-semibold flex items-center gap-2">
              Smart Suggestions
              <Badge className="bg-violet-500/20 text-violet-400 text-xs">AI</Badge>
            </h4>
            <p className="text-xs text-muted-foreground">Ways to save on your trip</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Best Day Suggestion */}
          {bestDayMessage && !dismissed.includes("best_day") && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissSuggestion("best_day")}
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-600">{bestDayMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on historical pricing patterns
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Date Suggestions */}
          {dateSuggestions.length > 0 && !dismissed.includes("dates") && (
            <div className="p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Flexible Dates</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dateSuggestions.slice(0, 3).map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 border-violet-500/30 hover:bg-violet-500/10"
                    onClick={() => onSelectDate?.(suggestion.date)}
                  >
                    {suggestion.label}
                    <Badge className="ml-2 bg-emerald-500/20 text-emerald-500 text-[10px]">
                      -${suggestion.savings}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Airports */}
          {nearbyAirports.length > 0 && !dismissed.includes("airports") && (
            <div className="p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Nearby Airports</span>
              </div>
              <div className="space-y-2">
                {nearbyAirports.slice(0, 2).map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => onSelectAirport?.(airport.code)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {airport.code} - {airport.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({airport.distance} mi)
                      </span>
                    </div>
                    {airport.priceDiff < 0 && (
                      <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                        Save ${Math.abs(airport.priceDiff)}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Routes */}
          {alternativeRoutes.length > 0 && !dismissed.includes("routes") && (
            <div className="p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">Alternative Routes</span>
              </div>
              <div className="space-y-2">
                {alternativeRoutes.slice(0, 2).map((route, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectRoute?.(route.origin, route.destination)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-sm">{route.label}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                        Save ${route.savings}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center pt-3 mt-3 border-t border-border/50">
          {AI_DISCLAIMERS.general}
        </p>
      </CardContent>
    </Card>
  );
}

export default SmartSearchSuggestions;
