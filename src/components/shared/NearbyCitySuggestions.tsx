/**
 * NearbyCitySuggestions - Suggest nearby cities for hotels/activities
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Train, ArrowRight, X, Building2, ChevronRight, Bus, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyCity {
  name: string;
  distance: string;
  transitTime: string;
  transitType: "subway" | "train" | "bus" | "drive";
  savings: number;
  avgPrice: number;
}

interface NearbyCitySuggestionsProps {
  currentCity: string;
  currentAvgPrice: number;
  nearbyCities?: NearbyCity[];
  onSelectCity?: (city: string) => void;
  serviceType?: "hotel" | "activity";
  className?: string;
}

// Mock nearby cities data
const getMockNearbyCities = (city: string, avgPrice: number): NearbyCity[] => {
  const cityGroups: Record<string, NearbyCity[]> = {
    "New York": [
      { name: "Jersey City", distance: "3 mi", transitTime: "15 min", transitType: "subway", savings: 35, avgPrice: avgPrice * 0.65 },
      { name: "Newark", distance: "10 mi", transitTime: "25 min", transitType: "train", savings: 45, avgPrice: avgPrice * 0.55 },
      { name: "Hoboken", distance: "2 mi", transitTime: "12 min", transitType: "subway", savings: 25, avgPrice: avgPrice * 0.75 },
    ],
    "Manhattan": [
      { name: "Brooklyn", distance: "5 mi", transitTime: "20 min", transitType: "subway", savings: 30, avgPrice: avgPrice * 0.70 },
      { name: "Long Island City", distance: "3 mi", transitTime: "15 min", transitType: "subway", savings: 40, avgPrice: avgPrice * 0.60 },
    ],
    "San Francisco": [
      { name: "Oakland", distance: "8 mi", transitTime: "20 min", transitType: "train", savings: 35, avgPrice: avgPrice * 0.65 },
      { name: "Berkeley", distance: "12 mi", transitTime: "25 min", transitType: "train", savings: 30, avgPrice: avgPrice * 0.70 },
    ],
    "Los Angeles": [
      { name: "Pasadena", distance: "10 mi", transitTime: "20 min", transitType: "drive", savings: 25, avgPrice: avgPrice * 0.75 },
      { name: "Burbank", distance: "12 mi", transitTime: "25 min", transitType: "drive", savings: 30, avgPrice: avgPrice * 0.70 },
    ],
  };

  return cityGroups[city] || [];
};

export function NearbyCitySuggestions({
  currentCity,
  currentAvgPrice,
  nearbyCities: providedCities,
  onSelectCity,
  serviceType = "hotel",
  className,
}: NearbyCitySuggestionsProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const nearbyCities = providedCities || getMockNearbyCities(currentCity, currentAvgPrice);
  
  if (isDismissed || nearbyCities.length === 0) return null;

  const bestAlternative = nearbyCities.reduce((best, current) => 
    current.savings > best.savings ? current : best
  );

  const transitIcons: Record<string, typeof Train> = {
    subway: Train,
    train: Train,
    bus: Bus,
    drive: Car,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={className}
      >
        <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Consider staying nearby to save
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bestAlternative.name} offers {bestAlternative.savings}% savings with {bestAlternative.transitTime} {bestAlternative.transitType} access
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="w-6 h-6 p-0 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Nearby Cities List */}
            <div className="space-y-2">
              {nearbyCities.slice(0, 3).map((city) => (
                <div
                  key={city.name}
                  onClick={() => onSelectCity?.(city.name)}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {(() => { const TransitIcon = transitIcons[city.transitType] || Train; return <TransitIcon className="w-5 h-5 text-emerald-400" />; })()}
                    <div>
                      <p className="text-sm font-medium group-hover:text-emerald-400 transition-colors">
                        {city.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {city.distance} • {city.transitTime} by {city.transitType}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs mb-0.5">
                        Save {city.savings}%
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        ~${Math.round(city.avgPrice)}/night
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Prices are estimates. Transit times based on typical conditions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default NearbyCitySuggestions;
