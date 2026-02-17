/**
 * AirportSavingsAlert - Auto-show savings from nearby airports
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plane, ArrowRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyAirport {
  code: string;
  name: string;
  city: string;
  price: number;
  savings: number;
  distance?: string;
}

interface AirportSavingsAlertProps {
  currentAirport: string;
  currentPrice: number;
  nearbyAirports?: NearbyAirport[];
  onSwitchAirport?: (code: string) => void;
  minSavingsThreshold?: number;
  className?: string;
}

// Nearby airports will come from real API — no hardcoded data

export function AirportSavingsAlert({
  currentAirport,
  currentPrice,
  nearbyAirports: providedAirports,
  onSwitchAirport,
  minSavingsThreshold = 50,
  className,
}: AirportSavingsAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const nearbyAirports = providedAirports || [];
  const significantSavings = nearbyAirports.filter(a => a.savings >= minSavingsThreshold);
  
  if (isDismissed || significantSavings.length === 0) return null;

  const bestAlternative = significantSavings.reduce((best, current) => 
    current.savings > best.savings ? current : best
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-sky-500/10 border border-sky-500/20 rounded-xl overflow-hidden",
          className
        )}
      >
        {/* Main Alert */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-sky-400" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  <span className="text-sky-400">Savings Alert:</span>{" "}
                  Flying from {bestAlternative.name} ({bestAlternative.code}) instead of {currentAirport} 
                  may save you <span className="text-emerald-400 font-bold">${bestAlternative.savings}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {bestAlternative.distance} away • Similar flight times available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => onSwitchAirport?.(bestAlternative.code)}
                className="bg-sky-500 hover:bg-sky-600 gap-1.5"
              >
                <Plane className="w-3.5 h-3.5" />
                Compare
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Expand Toggle */}
          {significantSavings.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              {isExpanded ? "Hide" : "Show"} {significantSavings.length} nearby airports
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>

        {/* Expanded Airport List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-sky-500/20 bg-card/30"
            >
              <div className="p-4 space-y-2">
                {significantSavings.map((airport) => (
                  <div
                    key={airport.code}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-sky-400">{airport.code}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{airport.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {airport.city} • {airport.distance}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">${airport.price}</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
                          Save ${airport.savings}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSwitchAirport?.(airport.code)}
                        className="gap-1"
                      >
                        Select
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default AirportSavingsAlert;
