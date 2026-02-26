/**
 * EatsLanding - Food delivery hub page
 * Premium glassmorphism style matching the ZIVO super-app
 */
import { useState } from "react";
import { Star, Clock, ArrowRight, Truck, ShoppingCart, Search, MapPin, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const categories = ["All", "American", "Italian", "Asian", "Mexican", "Healthy", "Desserts"];

const restaurants = [
  { id: "joes-grill", name: "Joe's Grill", cuisine: "American", price: "$", rating: 4.7, time: "20-30 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400", featured: "Classic Burger · $12.99" },
  { id: "bella-napoli", name: "Bella Napoli", cuisine: "Italian", price: "$$", rating: 4.9, time: "25-35 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400", featured: "Margherita Pizza · $14.99" },
  { id: "thai-palace", name: "Thai Palace", cuisine: "Asian", price: "$$", rating: 4.6, time: "20-30 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=400", featured: "Pad Thai · $13.50" },
  { id: "el-azteca", name: "El Azteca", cuisine: "Mexican", price: "$", rating: 4.8, time: "15-25 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400", featured: "Chicken Tacos · $10.99" },
  { id: "green-bowl", name: "Green Bowl", cuisine: "Healthy", price: "$$", rating: 4.5, time: "15-25 min", freeDelivery: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400", featured: "Acai Bowl · $11.99" },
  { id: "sakura-sushi", name: "Sakura Sushi", cuisine: "Asian", price: "$$$", rating: 4.9, time: "30-40 min", freeDelivery: false, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400", featured: "Dragon Roll · $16.99" },
];

export default function EatsLanding() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? restaurants : restaurants.filter((r) => r.cuisine === active);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
              ZIVO <span className="text-primary">Eats</span>
            </h1>
            <p className="text-muted-foreground text-lg">Delicious food from local restaurants, delivered fast.</p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Enter your delivery address" className="pl-10 h-12 rounded-xl bg-card border-border/50" />
              </div>
              <Button className="h-12 rounded-xl font-semibold gap-2 px-6">
                <Search className="w-4 h-4" /> Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories + Restaurant Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Category filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  active === c ? "chip-active" : "chip-inactive",
                  "whitespace-nowrap hover:-translate-y-0.5 active:scale-95 transition-all touch-manipulation min-h-[36px]"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Restaurant cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={`/eats/restaurant/${restaurant.id}`}
                  className="group block card-premium overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-200 touch-manipulation active:scale-[0.99]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500" />
                    {restaurant.freeDelivery && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Free Delivery
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.success(`Added to cart!`); }}
                      className="absolute bottom-3 right-3 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg touch-manipulation"
                      aria-label="Quick order"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base">{restaurant.name}</h3>
                      <span className="text-xs text-muted-foreground">{restaurant.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{restaurant.cuisine} · {restaurant.featured}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {restaurant.rating}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.time}</span>
                      </div>
                      <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Order <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
