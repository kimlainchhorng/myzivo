import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowRight, TrendingUp, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import imgNewYork from "@/assets/dest-newyork.jpg";
import imgParis from "@/assets/dest-paris.jpg";
import imgTokyo from "@/assets/dest-tokyo.jpg";
import imgDubai from "@/assets/dest-dubai.jpg";
import imgCancun from "@/assets/dest-cancun.jpg";
import imgLondon from "@/assets/dest-london.jpg";

const destinations = [
  { city: "New York", country: "USA", code: "US", tagline: "The city that never sleeps", image: imgNewYork, from: "$89", trending: true },
  { city: "Paris", country: "France", code: "FR", tagline: "Romance and culture", image: imgParis, from: "$299", trending: true },
  { city: "Tokyo", country: "Japan", code: "JP", tagline: "Where tradition meets future", image: imgTokyo, from: "$449" },
  { city: "Dubai", country: "UAE", code: "AE", tagline: "Luxury beyond limits", image: imgDubai, from: "$379" },
  { city: "Cancún", country: "Mexico", code: "MX", tagline: "Paradise beaches await", image: imgCancun, from: "$199" },
  { city: "London", country: "UK", code: "GB", tagline: "History and charm", image: imgLondon, from: "$279" },
];

export default function DestinationShowcase() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSave = (e: React.MouseEvent, city: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
        toast("Removed from saved", { duration: 1500 });
      } else {
        next.add(city);
        toast.success(`${city} saved to wishlist!`, { duration: 1500 });
      }
      return next;
    });
  };

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
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-2">Explore the world</span>
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
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-border/30 block shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 touch-manipulation active:scale-[0.99]"
              >
                <img
                  src={dest.image}
                  alt={`${dest.city}, ${dest.country}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* Trending badge */}
                {dest.trending && (
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                )}

                {/* Save + Explore buttons on hover */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <button
                    onClick={(e) => toggleSave(e, dest.city)}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card active:scale-90 transition-all touch-manipulation"
                    aria-label={`Save ${dest.city}`}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${saved.has(dest.city) ? "text-destructive fill-current" : "text-foreground"}`} />
                  </button>
                  <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-foreground font-bold text-xl tracking-tight">{dest.city}</h3>
                      <p className="text-muted-foreground text-sm">{dest.code} · {dest.country} · {dest.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs flex items-center gap-1">
                        <Plane className="w-3 h-3" /> Flights from
                      </p>
                      <p className="text-foreground font-bold text-xl">{dest.from}</p>
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
