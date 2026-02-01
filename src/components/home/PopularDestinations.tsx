import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { destinationPhotos, DestinationCity } from "@/config/photos";

const destinationOrder: DestinationCity[] = [
  "new-york",
  "los-angeles",
  "miami",
  "las-vegas",
  "paris",
  "tokyo",
  "london",
  "dubai",
];

export default function PopularDestinations() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Popular Destinations
          </h2>
          <p className="text-muted-foreground text-sm">
            Explore hotels in top cities worldwide
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-8">
          {destinationOrder.map((cityKey) => {
            const destination = destinationPhotos[cityKey];
            return (
              <Link
                key={cityKey}
                to={`/hotels?destination=${encodeURIComponent(destination.city)}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <img
                  src={destination.src}
                  alt={destination.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* City Label */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <h3 className="text-white font-semibold text-xs sm:text-sm truncate">
                    {destination.city}
                  </h3>
                  <p className="text-white/70 text-[10px] sm:text-xs truncate">
                    {destination.country}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/hotels">
            <Button variant="outline" className="rounded-xl gap-2">
              Explore Hotels
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
