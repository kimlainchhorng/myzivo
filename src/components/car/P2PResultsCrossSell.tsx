/**
 * P2P Results Cross-Sell
 * Shows P2P vehicle options on traditional car rental results page
 */

import { Link } from "react-router-dom";
import { Car, Users, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useP2PVehicleCount } from "@/hooks/useP2PBooking";

interface P2PResultsCrossSellProps {
  city?: string;
  className?: string;
}

export default function P2PResultsCrossSell({ city, className }: P2PResultsCrossSellProps) {
  const { data: vehicleCount, isLoading } = useP2PVehicleCount(city);

  // Don't show if no vehicles available or still loading
  if (isLoading || !vehicleCount || vehicleCount === 0) {
    return null;
  }

  // Build search URL with city if available
  const searchUrl = city 
    ? `/p2p/search?city=${encodeURIComponent(city)}`
    : "/p2p/search";

  return (
    <div className={className}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <div className="relative">
                <Car className="w-5 h-5 text-primary" />
                <Users className="w-3 h-3 text-primary absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Rent from Local Owners</h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  <Sparkles className="w-2.5 h-2.5" />
                  P2P
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Skip the rental counter. Unique cars at better prices.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{vehicleCount} car{vehicleCount !== 1 ? "s" : ""} available{city && ` in ${city}`}</span>
            </div>
          </div>

          {/* CTA */}
          <Button asChild variant="outline" className="w-full gap-2 border-primary/30 hover:bg-primary/5">
            <Link to={searchUrl}>
              Browse P2P Options
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
