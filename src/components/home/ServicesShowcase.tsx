/**
 * ServicesShowcase - Premium service cards with image backgrounds
 */
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import imgFlights from "@/assets/service-flights.jpg";
import imgHotels from "@/assets/service-hotels.jpg";
import imgCars from "@/assets/service-cars.jpg";
import imgRides from "@/assets/service-rides.jpg";
import imgEats from "@/assets/service-eats.jpg";

const services = [
  {
    icon: Plane,
    title: "Flights",
    description: "500+ airlines, real-time prices",
    href: "/flights",
    image: imgFlights,
    accent: "from-[hsl(var(--flights))]",
    badge: "Popular",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Best rates worldwide",
    href: "/hotels",
    image: imgHotels,
    accent: "from-[hsl(var(--hotels))]",
  },
  {
    icon: CarFront,
    title: "Car Rentals",
    description: "Flexible pickup & return",
    href: "/rent-car",
    image: imgCars,
    accent: "from-[hsl(var(--cars))]",
  },
  {
    icon: Car,
    title: "Rides",
    description: "Fast pickups, upfront pricing",
    href: "/rides",
    image: imgRides,
    accent: "from-[hsl(var(--rides))]",
  },
  {
    icon: UtensilsCrossed,
    title: "Eats",
    description: "Local restaurants delivered",
    href: "/eats",
    image: imgEats,
    accent: "from-[hsl(var(--eats))]",
  },
];

export default function ServicesShowcase() {
  return (
    <section id="services-showcase" className="section-padding relative">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter mb-3">
            Everything you need,{" "}
            <span className="gradient-text-primary">one platform</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From flights to food — ZIVO has you covered for every part of your journey.
          </p>
        </motion.div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" style={{ gridAutoRows: "220px" }}>
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(service.span)}
            >
              <Link
                to={service.href}
                className="group relative block h-full rounded-2xl overflow-hidden touch-manipulation active:scale-[0.98] transition-transform duration-200"
              >
                {/* Background image */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Dark gradient overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Badge */}
                {"badge" in service && service.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground z-10">
                    {service.badge}
                  </span>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center border border-foreground/10">
                      <service.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-tight">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore <ArrowRight className="w-4 h-4" />
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
