import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, ArrowRight, ExternalLink } from "lucide-react";
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
            alt="Compare flights from 500+ airlines"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            Compare Flights from 500+ Airlines — Book Securely with Partners
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Find real-time prices, compare options, and complete your booking securely with licensed travel partners.
          </p>

          {/* Primary CTA - Flights */}
          <Link to="/flights" className="block mb-3">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-xl gap-2 bg-flights hover:bg-flights/90 text-white shadow-lg"
            >
              <Plane className="w-5 h-5" />
              Search Flights
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          {/* Secondary CTA - Hotels & Cars */}
          <div className="flex gap-2 mb-4">
            <Link to="/hotels" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-sm font-medium rounded-xl gap-1.5 border-hotels/40 text-hotels hover:bg-hotels/10"
              >
                <Hotel className="w-4 h-4" />
                Hotels
              </Button>
            </Link>
            <Link to="/rent-car" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-sm font-medium rounded-xl gap-1.5 border-cars/40 text-cars hover:bg-cars/10"
              >
                <CarFront className="w-4 h-4" />
                Cars
              </Button>
            </Link>
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Final booking completed on partner site.</span>
          </div>
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[85vh]">
        {/* Left: Content */}
        <div className="flex items-center px-8 xl:px-16 py-16 bg-background">
          <div className="max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">
              Compare Flights from 500+ Airlines — Book Securely with Partners
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find real-time prices, compare options, and complete your booking securely with licensed travel partners.
            </p>

            {/* Primary CTA - Flights */}
            <Link to="/flights">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold rounded-xl gap-3 bg-flights hover:bg-flights/90 text-white shadow-xl mb-4"
              >
                <Plane className="w-6 h-6" />
                Search Flights
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            {/* Secondary CTA - Hotels & Cars */}
            <div className="flex gap-3 mb-6">
              <Link to="/hotels">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-5 text-base font-medium rounded-xl gap-2 border-hotels/40 text-hotels hover:bg-hotels/10"
                >
                  <Hotel className="w-5 h-5" />
                  Compare Hotels
                </Button>
              </Link>
              <Link to="/rent-car">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-5 text-base font-medium rounded-xl gap-2 border-cars/40 text-cars hover:bg-cars/10"
                >
                  <CarFront className="w-5 h-5" />
                  Find Rental Cars
                </Button>
              </Link>
            </div>

            {/* Helper Text */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4" />
              <span>Final booking completed on partner site.</span>
            </div>
          </div>
        </div>

        {/* Right: Photo */}
        <div className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="Compare flights from 500+ airlines - ZIVO travel search"
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
