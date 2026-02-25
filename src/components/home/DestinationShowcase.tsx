import { Link } from "react-router-dom";
import { Plane, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const destinations = [
  {
    city: "New York",
    country: "USA",
    tagline: "The city that never sleeps",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
    from: "$89",
    gradient: "from-sky-500/80 to-blue-600/80",
  },
  {
    city: "Paris",
    country: "France",
    tagline: "Romance and culture",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    from: "$299",
    gradient: "from-rose-500/80 to-pink-600/80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    tagline: "Where tradition meets future",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800",
    from: "$449",
    gradient: "from-violet-500/80 to-purple-600/80",
  },
  {
    city: "Dubai",
    country: "UAE",
    tagline: "Luxury beyond limits",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    from: "$379",
    gradient: "from-amber-500/80 to-orange-600/80",
  },
  {
    city: "Cancún",
    country: "Mexico",
    tagline: "Paradise beaches await",
    image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&q=80&w=800",
    from: "$199",
    gradient: "from-emerald-500/80 to-teal-600/80",
  },
  {
    city: "London",
    country: "UK",
    tagline: "History and charm",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
    from: "$279",
    gradient: "from-slate-500/80 to-gray-600/80",
  },
];

export default function DestinationShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5 shimmer-chip">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Top Destinations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            Dream destinations,{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">real prices</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Explore the world's most popular cities with flights starting from unbelievably low fares.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/flights?to=${encodeURIComponent(dest.city)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] border border-border/30 glow-border-hover block"
              >
                <img
                  src={dest.image}
                  alt={`${dest.city}, ${dest.country}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Hover color overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${dest.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Explore pill on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="px-4 py-2 rounded-full glass-chip text-xs font-semibold text-white flex items-center gap-1.5">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl tracking-tight">{dest.city}</h3>
                      <p className="text-white/70 text-sm">{dest.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        from
                      </p>
                      <p className="text-white font-bold text-xl">{dest.from}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/flights">
            <Button variant="outline" size="lg" className="rounded-2xl gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 font-semibold">
              Explore All Destinations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
