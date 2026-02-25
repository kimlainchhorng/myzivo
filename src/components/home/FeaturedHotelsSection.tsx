/**
 * FeaturedHotelsSection - Hotel room cards with premium features
 */
import { Star, MapPin, ArrowRight, Heart, Wifi, Waves, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const hotels = [
  { name: "The Grand Plaza", location: "New York, USA", price: 189, rating: 4.8, freeCancellation: true, amenities: ["wifi", "gym"], image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=500" },
  { name: "Ocean Breeze Resort", location: "Cancún, Mexico", price: 145, rating: 4.7, freeCancellation: true, amenities: ["wifi", "pool"], image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=500" },
  { name: "Sakura Garden Hotel", location: "Tokyo, Japan", price: 210, rating: 4.9, freeCancellation: false, amenities: ["wifi", "gym"], image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=500" },
  { name: "Le Château Royal", location: "Paris, France", price: 275, rating: 4.8, freeCancellation: true, amenities: ["wifi", "pool", "gym"], image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=500" },
];

const amenityIcons: Record<string, typeof Wifi> = { wifi: Wifi, pool: Waves, gym: Dumbbell };

export default function FeaturedHotelsSection() {
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
                className="group block card-premium overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
                    ${hotel.price}<span className="text-xs font-normal opacity-80">/night</span>
                  </div>
                  {/* Save icon on hover */}
                  <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-card" aria-label="Save hotel">
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>
                  {hotel.freeCancellation && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/90 text-white shadow-sm">
                      Free Cancellation
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1.5">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {hotel.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(hotel.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs font-semibold ml-1">{hotel.rating}</span>
                    </div>
                    {/* Amenity icons */}
                    <div className="flex items-center gap-1.5">
                      {hotel.amenities.map((a) => {
                        const Icon = amenityIcons[a];
                        return Icon ? <Icon key={a} className="w-3.5 h-3.5 text-muted-foreground/50" /> : null;
                      })}
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
