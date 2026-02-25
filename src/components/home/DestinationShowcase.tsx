import { Link } from "react-router-dom";
import { Plane, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const destinations = [
  { city: "New York", country: "USA", flag: "🇺🇸", tagline: "The city that never sleeps", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800", from: "$89", trending: true },
  { city: "Paris", country: "France", flag: "🇫🇷", tagline: "Romance and culture", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800", from: "$299", trending: true },
  { city: "Tokyo", country: "Japan", flag: "🇯🇵", tagline: "Where tradition meets future", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800", from: "$449" },
  { city: "Dubai", country: "UAE", flag: "🇦🇪", tagline: "Luxury beyond limits", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800", from: "$379" },
  { city: "Cancún", country: "Mexico", flag: "🇲🇽", tagline: "Paradise beaches await", image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&q=80&w=800", from: "$199" },
  { city: "London", country: "UK", flag: "🇬🇧", tagline: "History and charm", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800", from: "$279" },
];

export default function DestinationShowcase() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
              Popular <span className="text-primary">Destinations</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore the world's most popular cities with flights starting from unbelievably low fares.
            </p>
          </div>
          <Link to="/flights" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all shrink-0">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/flights?to=${encodeURIComponent(dest.city)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-border/30 block shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={dest.image}
                  alt={`${dest.city}, ${dest.country}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                
                {/* Trending badge */}
                {dest.trending && (
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                )}

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-bold text-xl tracking-tight">{dest.city}</h3>
                      <p className="text-white/70 text-sm">{dest.flag} {dest.country} · {dest.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        <Plane className="w-3 h-3" /> Flights from
                      </p>
                      <p className="text-white font-bold text-xl">{dest.from}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
