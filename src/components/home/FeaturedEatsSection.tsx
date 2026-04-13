/**
 * FeaturedEatsSection - Food delivery cards with quick order
 */
import { useState } from "react";
import Star from "lucide-react/dist/esm/icons/star";
import Clock from "lucide-react/dist/esm/icons/clock";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Truck from "lucide-react/dist/esm/icons/truck";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = ["All", "American", "Italian", "Asian", "Mexican"];

const foods = [
  { name: "Classic Burger", restaurant: "Joe's Grill", price: 12.99, rating: 4.7, time: "20-30 min", category: "American", freeDelivery: true, deliveryFee: 0, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
  { name: "Margherita Pizza", restaurant: "Bella Napoli", price: 14.99, rating: 4.9, time: "25-35 min", category: "Italian", freeDelivery: false, deliveryFee: 2.99, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400" },
  { name: "Pad Thai", restaurant: "Thai Palace", price: 13.50, rating: 4.6, time: "20-30 min", category: "Asian", freeDelivery: true, deliveryFee: 0, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=400" },
  { name: "Chicken Tacos", restaurant: "El Azteca", price: 10.99, rating: 4.8, time: "15-25 min", category: "Mexican", freeDelivery: false, deliveryFee: 1.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400" },
];

export default function FeaturedEatsSection() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? foods : foods.filter((f) => f.category === active);

  const handleQuickOrder = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${name} added to cart!`, { duration: 2000 });
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/30" aria-label="Featured food delivery">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--eats))" }}>Local favorites</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Order <span className="text-primary">Food Delivery</span>
            </h2>
            <p className="text-muted-foreground">Delicious food from local restaurants, delivered fast.</p>
          </div>
          <Link to="/eats" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(active === c ? "chip-active" : "chip-inactive", "whitespace-nowrap hover:-translate-y-0.5 active:scale-95 transition-all touch-manipulation min-h-[36px]")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((food, i) => (
            <motion.div
              key={food.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to="/eats"
                className="group block rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 touch-manipulation active:scale-[0.99]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={food.image} alt={`${food.name} from ${food.restaurant}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500" />
                  {food.freeDelivery && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Free Delivery
                    </span>
                  )}
                  <button
                    onClick={(e) => handleQuickOrder(e, food.name)}
                    className="absolute bottom-3 right-3 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-primary text-primary-foreground flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 shadow-lg touch-manipulation"
                    aria-label={`Quick order ${food.name}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1">{food.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{food.restaurant}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[hsl(var(--hotels))] fill-current" /> {food.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {food.time}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base">${food.price}</p>
                      {!food.freeDelivery && (
                        <p className="text-[10px] text-muted-foreground">+${food.deliveryFee} delivery</p>
                      )}
                    </div>
                  </div>
                  <span className="mt-3 text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Order Now <ArrowRight className="w-3.5 h-3.5" />
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
