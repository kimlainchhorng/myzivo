import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Car, ShieldCheck } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";
import HeroTrustBar from "./HeroTrustBar";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] hero-glow-bg">
      {/* Mobile: Stacked layout */}
      <div className="lg:hidden">
        {/* Video at top */}
        <div className="relative h-[35vh] overflow-hidden">
          <video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
        </div>

        {/* Content below */}
        <div className="px-4 py-6 bg-background relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
            Book Flights, Hotels, and Car Rentals — All in One Place
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-5">
            ZIVO helps you book travel with secure checkout and instant confirmation.
          </p>

          {/* Primary CTA - Flights */}
          <Link to="/flights" className="block mb-3">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-green-btn"
            >
              <Plane className="w-5 h-5" />
              Book Flights
            </Button>
          </Link>

          {/* Secondary CTA row */}
          <div className="flex gap-2 mb-3">
            <Link to="/hotels" className="flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5">
                <Hotel className="w-4 h-4" />
                Book Hotels
              </Button>
            </Link>
            <Link to="/rent-car" className="flex-1">
              <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5">
                <CarFront className="w-4 h-4" />
                Car Rentals
              </Button>
            </Link>
          </div>

          {/* Book Rides */}
          <Link to="/rides" className="block mb-3">
            <Button variant="outline" size="lg" className="w-full h-12 text-sm font-medium rounded-xl gap-1.5">
              <Car className="w-4 h-4" />
              Book Rides
            </Button>
          </Link>

          {/* Price alerts link */}
          <Link to="/price-alerts" className="block mb-5">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Track prices and get alerts
            </Button>
          </Link>

          <HeroTrustBar />

          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">
            Prices are final at checkout unless otherwise stated.
          </p>
        </div>
      </div>

      {/* Desktop: Split layout */}
      <div className="hidden lg:grid lg:grid-cols-2 min-h-[85vh]">
        {/* Left: Content */}
        <div className="flex items-center px-8 xl:px-16 py-12 bg-background relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">
              Book Flights, Hotels, and Car Rentals — All in One Place
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              ZIVO helps you book travel with secure checkout and instant confirmation.
            </p>

            {/* CTA Buttons row */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Link to="/flights">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold rounded-xl gap-3 bg-primary hover:bg-primary/90 text-primary-foreground glow-green-btn hover:scale-[1.03] transition-all duration-200"
                >
                  <Plane className="w-6 h-6" />
                  Book Flights
                </Button>
              </Link>
              <Link to="/hotels">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-xl gap-2 hover:scale-[1.03] transition-all duration-200">
                  <Hotel className="w-5 h-5" />
                  Book Hotels
                </Button>
              </Link>
              <Link to="/rent-car">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-xl gap-2 hover:scale-[1.03] transition-all duration-200">
                  <CarFront className="w-5 h-5" />
                  Car Rentals
                </Button>
              </Link>
              <Link to="/rides">
                <Button variant="outline" size="lg" className="h-14 px-6 text-base font-medium rounded-xl gap-2 hover:scale-[1.03] transition-all duration-200">
                  <Car className="w-5 h-5" />
                  Book Rides
                </Button>
              </Link>
            </div>

            {/* Price alerts link */}
            <Link to="/price-alerts" className="inline-block mb-8">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground gap-2">
                <ShieldCheck className="w-4 h-4" />
                Track prices and get alerts
              </Button>
            </Link>

            <HeroTrustBar />

            <p className="text-xs text-muted-foreground/70 mt-5 max-w-md">
              Prices are final at checkout unless otherwise stated.
            </p>
          </div>
        </div>

        {/* Right: Video */}
        <div className="relative overflow-hidden">
          <video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
          {/* Subtle green glow accent */}
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(142_71%_45%/0.1)_0%,transparent_70%)] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
