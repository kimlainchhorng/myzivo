import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingDown, 
  Zap, 
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlightPrices } from "@/hooks/useFlightPrices";
import { getAirlineLogo } from "@/data/airlines";

interface PopularRoutesProps {
  onSelectRoute: (from: string, to: string, price?: number) => void;
  className?: string;
}

interface RouteData {
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  basePrice: number;
  airline: string;
}

// Popular international and domestic routes with featured airlines
const popularRoutes: RouteData[] = [
  { from: "JFK", to: "LAX", fromCity: "New York", toCity: "Los Angeles", basePrice: 189, airline: "AA" },
  { from: "LAX", to: "LHR", fromCity: "Los Angeles", toCity: "London", basePrice: 549, airline: "BA" },
  { from: "SFO", to: "NRT", fromCity: "San Francisco", toCity: "Tokyo", basePrice: 789, airline: "UA" },
  { from: "ORD", to: "CDG", fromCity: "Chicago", toCity: "Paris", basePrice: 589, airline: "AF" },
  { from: "MIA", to: "CUN", fromCity: "Miami", toCity: "Cancún", basePrice: 199, airline: "AA" },
  { from: "BOS", to: "DUB", fromCity: "Boston", toCity: "Dublin", basePrice: 429, airline: "EI" },
  { from: "SEA", to: "HNL", fromCity: "Seattle", toCity: "Honolulu", basePrice: 329, airline: "AS" },
  { from: "DFW", to: "LAS", fromCity: "Dallas", toCity: "Las Vegas", basePrice: 129, airline: "WN" },
];

function RouteCard({ route, onSelect }: { route: RouteData; onSelect: (price?: number) => void }) {
  const { data, isLoading } = useFlightPrices({
    origin: route.from,
    destination: route.to,
    enabled: true,
  });

  const hasRealPrice = data?.prices && data.prices.length > 0;
  const realPrice = hasRealPrice ? Math.min(...data.prices.map(p => p.price)) : null;
  const displayPrice = realPrice ?? route.basePrice;
  const savings = realPrice && realPrice < route.basePrice 
    ? Math.round(((route.basePrice - realPrice) / route.basePrice) * 100)
    : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer overflow-hidden transition-all duration-200 border-border/50 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10",
          hasRealPrice && "border-emerald-500/30"
        )}
        onClick={() => onSelect(realPrice ?? undefined)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Route Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={getAirlineLogo(route.airline, 32)}
                  alt="Airline logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{route.from}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-bold">{route.to}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {route.fromCity} → {route.toCity}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <span className="text-xl font-bold">${displayPrice}</span>
                    {hasRealPrice && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                        <Zap className="w-3 h-3 mr-0.5" />
                        Live
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {savings && savings > 5 && (
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  <span>{savings}% below avg</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PopularRoutes({ onSelectRoute, className }: PopularRoutesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-lg">Popular Routes</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Live pricing available
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {popularRoutes.map((route) => (
          <RouteCard
            key={`${route.from}-${route.to}`}
            route={route}
            onSelect={(price) => onSelectRoute(route.from, route.to, price)}
          />
        ))}
      </div>
    </div>
  );
}
