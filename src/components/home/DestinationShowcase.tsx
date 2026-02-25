import { Link } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    city: "New York",
    country: "USA",
    tagline: "The city that never sleeps",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
    from: "$89",
  },
  {
    city: "Paris",
    country: "France",
    tagline: "Romance and culture",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    from: "$299",
  },
  {
    city: "Tokyo",
    country: "Japan",
    tagline: "Where tradition meets future",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800",
    from: "$449",
  },
  {
    city: "Dubai",
    country: "UAE",
    tagline: "Luxury beyond limits",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    from: "$379",
  },
  {
    city: "Cancún",
    country: "Mexico",
    tagline: "Paradise beaches await",
    image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&q=80&w=800",
    from: "$199",
  },
  {
    city: "London",
    country: "UK",
    tagline: "History and charm",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
    from: "$279",
  },
];

export default function DestinationShowcase() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Top Destinations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dream destinations, real prices</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Explore the world's most popular cities with flights starting from unbelievably low fares.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.city}
              to={`/flights?to=${encodeURIComponent(dest.city)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-border/30 glow-border-hover"
            >
              <img
                src={dest.image}
                alt={`${dest.city}, ${dest.country}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Glass overlay on hover */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="px-3 py-1.5 rounded-full glass-chip text-xs font-medium text-white">
                  Explore →
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-bold text-xl">{dest.city}</h3>
                    <p className="text-white/70 text-sm">{dest.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-xs flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      from
                    </p>
                    <p className="text-white font-bold text-lg">{dest.from}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/flights">
            <Button variant="outline" className="rounded-xl gap-2 hover:border-primary/40 transition-all duration-200">
              Explore All Destinations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
