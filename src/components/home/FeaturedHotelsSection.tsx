/**
 * FeaturedHotelsSection - Hotel cards with premium hover effects
 */
import { useState } from "react";
import Star from "lucide-react/dist/esm/icons/star";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Heart from "lucide-react/dist/esm/icons/heart";
import Wifi from "lucide-react/dist/esm/icons/wifi";
import Waves from "lucide-react/dist/esm/icons/waves";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const hotels = [
  { name: "The Grand Plaza", location: "New York, USA", price: 189, rating: 4.8, freeCancellation: true, amenities: ["wifi", "gym"], image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=500" },
  { name: "Ocean Breeze Resort", location: "Cancún, Mexico", price: 145, rating: 4.7, freeCancellation: true, amenities: ["wifi", "pool"], image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=500" },
  { name: "Sakura Garden Hotel", location: "Tokyo, Japan", price: 210, rating: 4.9, freeCancellation: false, amenities: ["wifi", "gym"], image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=500" },
  { name: "Le Château Royal", location: "Paris, France", price: 275, rating: 4.8, freeCancellation: true, amenities: ["wifi", "pool", "gym"], image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=500" },
];

const amenityIcons: Record<string, typeof Wifi> = { wifi: Wifi, pool: Waves, gym: Dumbbell };

export default function FeaturedHotelsSection() {
  const [savedHotels, setSavedHotels] = useState<Set<string>>(new Set());

  const toggleSave = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedHotels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        toast("Removed from saved", { duration: 1500 });
      } else {
        next.add(name);
        toast.success("Saved to favorites!", { duration: 1500 });
      }
      return next;
    });
  };

  return (
    <section className="py-16 sm:py-20" aria-label="Featured hotels">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--hotels))" }}>Handpicked stays</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Featured <span className="text-primary">Hotels</span>
            </h2>
            <p className="text-muted-foreground">Handpicked stays for every budget.</p>
          </div>
          <Link to="/hotels" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hotels.map((hotel, i) => (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to="/hotels"
                className="group block rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 touch-manipulation active:scale-[0.99]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={hotel.image} alt={`${hotel.name} — ${hotel.location}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
                    ${hotel.price}<span className="text-xs font-normal opacity-80">/night</span>
                  </div>
                  <button
                    onClick={(e) => toggleSave(e, hotel.name)}
                    className="absolute top-3 left-3 w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-card active:scale-90 touch-manipulation"
                    aria-label={`Save ${hotel.name}`}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${savedHotels.has(hotel.name) ? "text-destructive fill-current" : "text-foreground"}`} />
                  </button>
                  {hotel.freeCancellation && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground shadow-sm backdrop-blur-sm">
                      Free Cancellation
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1.5">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {hotel.location}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(hotel.rating) ? "text-[hsl(var(--hotels))] fill-current" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs font-semibold ml-1">{hotel.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hotel.amenities.map((a) => {
                        const Icon = amenityIcons[a];
                        return Icon ? <Icon key={a} className="w-3.5 h-3.5 text-muted-foreground/50" /> : null;
                      })}
                    </div>
                  </div>
                  <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
