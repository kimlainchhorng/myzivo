/**
 * FeaturedCarsSection - Car rental cards with filter chips
 */
import { useState } from "react";
import Star from "lucide-react/dist/esm/icons/star";
import Users from "lucide-react/dist/esm/icons/users";
import Fuel from "lucide-react/dist/esm/icons/fuel";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import DoorOpen from "lucide-react/dist/esm/icons/door-open";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const filters = ["All", "SUV", "Sedan", "Economy", "Luxury"];

const cars = [
  { name: "Toyota RAV4", type: "SUV", passengers: 5, fuel: "Hybrid", doors: 4, price: 45, rating: 4.8, cheapest: false, image: "https://images.unsplash.com/photo-1568844293986-8d0400f085b0?auto=format&fit=crop&q=80&w=400" },
  { name: "Honda Civic", type: "Sedan", passengers: 5, fuel: "Gas", doors: 4, price: 32, rating: 4.6, cheapest: false, image: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=400" },
  { name: "Nissan Versa", type: "Economy", passengers: 5, fuel: "Gas", doors: 4, price: 24, rating: 4.4, cheapest: true, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0ffe?auto=format&fit=crop&q=80&w=400" },
  { name: "BMW X5", type: "Luxury", passengers: 5, fuel: "Gas", doors: 4, price: 89, rating: 4.9, cheapest: false, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400" },
];

export default function FeaturedCarsSection() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? cars : cars.filter((c) => c.type === active);

  return (
    <section className="py-16 sm:py-20 bg-muted/30" aria-label="Featured car rentals">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(var(--cars))" }}>Best deals</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Popular <span className="text-primary">Car Rentals</span>
            </h2>
            <p className="text-muted-foreground">Find the perfect rental for your trip.</p>
          </div>
          <Link to="/rent-car" className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(active === f ? "chip-active" : "chip-inactive", "whitespace-nowrap hover:-translate-y-0.5 active:scale-95 transition-all touch-manipulation min-h-[36px]")}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((car, i) => (
            <motion.div
              key={car.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to="/rent-car"
                className="group block rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 touch-manipulation active:scale-[0.99]"
              >
                <div className="relative aspect-video overflow-hidden bg-muted/50">
                  <img src={car.image} alt={`${car.name} — ${car.type}, ${car.passengers} passengers`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500" />
                  {car.cheapest && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm">
                      Best Price
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base">{car.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[hsl(var(--hotels))] fill-current" />
                      <span className="text-xs font-semibold text-foreground">{car.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {car.passengers}</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" /> {car.fuel}</span>
                    <span className="flex items-center gap-1"><DoorOpen className="w-3.5 h-3.5" /> {car.doors}dr</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{car.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                      <span className="gradient-text-primary">${car.price}</span>
                      <span className="text-sm font-normal text-muted-foreground">/day</span>
                    </p>
                    <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Rent Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
