import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, Package } from "lucide-react";
import heroImage from "@/assets/hero-homepage.jpg";
import { useImagePreload } from "@/hooks/useImagePreload";

export default function HeroSection() {
  // Preload hero image for LCP optimization
  useImagePreload({ src: heroImage, enabled: true });

  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh]">
      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        {/* Photo at top */}
        <div className="relative h-[40vh] overflow-hidden">
          <img
            src={heroImage}
            alt="ZIVO - One Platform for Travel & Mobility"
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
        </div>

        {/* Content below */}
        <div className="px-4 py-8 bg-background">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            One Platform for Travel & Mobility
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Flights, Hotels, Cars, Rides, Eats & Moving — all from one place.
          </p>

          {/* Primary CTAs - Travel */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Link to="/flights">
              <Button
                size="lg"
                className="w-full h-12 text-xs font-semibold rounded-xl gap-1.5 bg-flights hover:bg-flights/90 text-white"
              >
                <Plane className="w-4 h-4" />
                Flights
              </Button>
            </Link>
            <Link to="/hotels">
              <Button
                size="lg"
                className="w-full h-12 text-xs font-semibold rounded-xl gap-1.5 bg-hotels hover:bg-hotels/90 text-white"
              >
                <Hotel className="w-4 h-4" />
                Hotels
              </Button>
            </Link>
            <Link to="/rent-car">
              <Button
                size="lg"
                className="w-full h-12 text-xs font-semibold rounded-xl gap-1.5 bg-cars hover:bg-cars/90 text-white"
              >
                <CarFront className="w-4 h-4" />
                Cars
              </Button>
            </Link>
          </div>

          {/* Secondary CTAs - Mobility */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Link to="/rides">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-xs font-medium rounded-xl gap-1.5 border-rides/30 text-rides hover:bg-rides/10"
              >
                <Car className="w-3.5 h-3.5" />
                Rides
              </Button>
            </Link>
            <Link to="/eats">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-xs font-medium rounded-xl gap-1.5 border-eats/30 text-eats hover:bg-eats/10"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Eats
              </Button>
            </Link>
            <Link to="/move">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-xs font-medium rounded-xl gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Package className="w-3.5 h-3.5" />
                Move
              </Button>
            </Link>
          </div>

          {/* Trust Line */}
          <p className="text-xs text-muted-foreground text-center">
            Travel bookings completed on partner sites. Mobility services via ZIVO Driver.
          </p>
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[85vh]">
        {/* Left: Content */}
        <div className="flex items-center px-8 xl:px-16 py-16 bg-background">
          <div className="max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">
              One Platform for Travel & Mobility
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Flights, Hotels, Cars, Rides, Eats & Moving — search, compare, and book all from one platform.
            </p>

            {/* Primary CTAs - Travel */}
            <div className="flex gap-3 mb-4">
              <Link to="/flights">
                <Button
                  size="lg"
                  className="h-12 px-5 text-base font-semibold rounded-xl gap-2 bg-flights hover:bg-flights/90 text-white shadow-lg"
                >
                  <Plane className="w-5 h-5" />
                  Flights
                </Button>
              </Link>
              <Link to="/hotels">
                <Button
                  size="lg"
                  className="h-12 px-5 text-base font-semibold rounded-xl gap-2 bg-hotels hover:bg-hotels/90 text-white shadow-lg"
                >
                  <Hotel className="w-5 h-5" />
                  Hotels
                </Button>
              </Link>
              <Link to="/rent-car">
                <Button
                  size="lg"
                  className="h-12 px-5 text-base font-semibold rounded-xl gap-2 bg-cars hover:bg-cars/90 text-white shadow-lg"
                >
                  <CarFront className="w-5 h-5" />
                  Cars
                </Button>
              </Link>
            </div>

            {/* Secondary CTAs - Mobility */}
            <div className="flex gap-3 mb-8">
              <Link to="/rides">
                <Button
                  variant="outline"
                  className="h-11 px-4 text-sm font-medium rounded-xl gap-2 border-rides/30 text-rides hover:bg-rides/10"
                >
                  <Car className="w-4 h-4" />
                  Rides
                </Button>
              </Link>
              <Link to="/eats">
                <Button
                  variant="outline"
                  className="h-11 px-4 text-sm font-medium rounded-xl gap-2 border-eats/30 text-eats hover:bg-eats/10"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Eats
                </Button>
              </Link>
              <Link to="/move">
                <Button
                  variant="outline"
                  className="h-11 px-4 text-sm font-medium rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Package className="w-4 h-4" />
                  Move
                </Button>
              </Link>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-muted-foreground">
              Travel bookings completed on partner sites. Mobility services via ZIVO Driver.
            </p>
          </div>
        </div>

        {/* Right: Photo */}
        <div className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="ZIVO - Modern airport terminal, premium travel marketplace"
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        </div>
      </div>
    </section>
  );
}
