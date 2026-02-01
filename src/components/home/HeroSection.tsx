import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, CarFront, Search } from "lucide-react";
import heroImage from "@/assets/hero-homepage.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Travel destinations worldwide"
          className="w-full h-full object-cover"
        />
        {/* Clean Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-display-lg text-white mb-6">
            Search & Compare{" "}
            <span className="text-primary">Travel Worldwide</span>
          </h1>
          
          <p className="text-body-lg text-white/80 mb-10 max-w-xl mx-auto">
            Find the best deals on flights, hotels, and car rentals from trusted partners. No booking fees on ZIVO.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/book-flight">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold rounded-xl gap-3 bg-flights hover:bg-flights/90 text-white shadow-lg"
              >
                <Plane className="w-5 h-5" />
                Search Flights
              </Button>
            </Link>
            
            <Link to="/book-hotel">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold rounded-xl gap-3 bg-hotels hover:bg-hotels/90 text-white shadow-lg"
              >
                <Hotel className="w-5 h-5" />
                Search Hotels
              </Button>
            </Link>
            
            <Link to="/rent-car">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold rounded-xl gap-3 bg-cars hover:bg-cars/90 text-white shadow-lg"
              >
                <CarFront className="w-5 h-5" />
                Rent a Car
              </Button>
            </Link>
          </div>

          {/* Partner Note */}
          <p className="text-sm text-white/60">
            Compare prices from 500+ airlines, hotels, and car rental companies
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
