import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingUp, Zap, RefreshCw } from "lucide-react";
import { useTrendingDestinations } from "@/hooks/useTrendingFlights";

interface TrendingDestinationsSectionProps {
  onSelectDestination: (city: string, code: string) => void;
}

export function TrendingDestinationsSection({ onSelectDestination }: TrendingDestinationsSectionProps) {
  const { destinations, isLoading, hasRealPrices, refetch } = useTrendingDestinations();

  return (
    <section className="py-12 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Popular Destinations</h2>
          <div className="flex items-center gap-2">
            {hasRealPrices && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Live Prices
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.slice(0, 9).map((dest, index) => (
            <div
              key={dest.code}
              onClick={() => onSelectDestination(dest.city, dest.code)}
              className="cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 touch-manipulation active:scale-[0.98]"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <Card
                className={`glass-card hover:border-sky-500/50 transition-all group overflow-hidden relative ${
                  dest.isRealPrice ? "border-emerald-500/20" : ""
                }`}
              >
                {dest.trending && (
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                      <span className="text-3xl">{dest.image}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    </div>
                    <div className="flex-1 p-4">
                      <h3 className="font-display font-semibold text-lg">{dest.city}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dest.country} • {dest.code}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {dest.isLoading ? (
                          <Skeleton className="h-5 w-16" />
                        ) : (
                          <>
                            <p className="text-sky-400 font-bold">From ${dest.price}</p>
                            {dest.isRealPrice && <Zap className="w-3 h-3 text-emerald-400" />}
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">round trip</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mr-4 group-hover:text-sky-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingDestinationsSection;
