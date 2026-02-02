/**
 * P2P Discovery Banner
 * Promotes P2P car rentals on traditional car rental pages
 */

import { Link } from "react-router-dom";
import { Car, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useP2PVehicleCount } from "@/hooks/useP2PBooking";

interface P2PDiscoveryBannerProps {
  city?: string;
  className?: string;
}

export default function P2PDiscoveryBanner({ city, className }: P2PDiscoveryBannerProps) {
  const { data: vehicleCount, isLoading } = useP2PVehicleCount(city);

  // Build search URL with city if available
  const searchUrl = city 
    ? `/p2p/search?city=${encodeURIComponent(city)}`
    : "/p2p/search";

  return (
    <section className={className}>
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 border border-primary/20 p-6 sm:p-8">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div className="relative">
                <Car className="w-8 h-8 text-primary" />
                <Users className="w-4 h-4 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  P2P Rentals
                </span>
                {!isLoading && vehicleCount && vehicleCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {vehicleCount} car{vehicleCount !== 1 ? "s" : ""} available
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                Rent from Local Owners
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg">
                Skip the rental counter. Book unique cars directly from people in your area — often at better prices.
              </p>
            </div>

            {/* CTA */}
            <Button asChild size="lg" className="gap-2 shrink-0">
              <Link to={searchUrl}>
                Browse P2P Rentals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
