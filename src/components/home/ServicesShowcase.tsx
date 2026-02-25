/**
 * ServicesShowcase - 5 premium service cards for the ZIVO super app
 */
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Plane,
    title: "Flights",
    description: "Compare hundreds of airlines and find the best fares for your next trip.",
    href: "/flights",
    iconBg: "bg-gradient-to-br from-[hsl(var(--flights-light))] to-[hsl(var(--flights)/0.15)]",
    iconColor: "text-[hsl(var(--flights))]",
    badge: "Popular",
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Book rooms at the best hotels worldwide with instant confirmation.",
    href: "/hotels",
    iconBg: "bg-gradient-to-br from-[hsl(var(--hotels-light))] to-[hsl(var(--hotels)/0.15)]",
    iconColor: "text-[hsl(var(--hotels))]",
  },
  {
    icon: CarFront,
    title: "Car Rentals",
    description: "Rent cars from top providers with flexible pickup and return options.",
    href: "/rent-car",
    iconBg: "bg-gradient-to-br from-[hsl(var(--cars-light))] to-[hsl(var(--cars)/0.15)]",
    iconColor: "text-[hsl(var(--cars))]",
  },
  {
    icon: Car,
    title: "Rides",
    description: "Get a ride anywhere, anytime. Fast pickups and upfront pricing.",
    href: "/rides",
    iconBg: "bg-gradient-to-br from-[hsl(var(--rides-light))] to-[hsl(var(--rides)/0.15)]",
    iconColor: "text-[hsl(var(--rides))]",
  },
  {
    icon: UtensilsCrossed,
    title: "Eats",
    description: "Order food from your favorite restaurants delivered to your door.",
    href: "/eats",
    iconBg: "bg-gradient-to-br from-[hsl(var(--eats-light))] to-[hsl(var(--eats)/0.15)]",
    iconColor: "text-[hsl(var(--eats))]",
  },
];

export default function ServicesShowcase() {
  return (
    <section id="services-showcase" className="section-padding relative">
      {/* Subtle dot pattern bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Everything you need,{" "}
            <span className="text-primary">one platform</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From flights to food — ZIVO has you covered for every part of your journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={service.href}
                className="group block p-6 sm:p-7 card-premium text-center h-full relative hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Badge */}
                {'badge' in service && service.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {service.badge}
                  </span>
                )}

                <div className={cn(
                  "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4",
                  service.iconBg,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <service.icon className={cn("w-7 h-7", service.iconColor)} />
                </div>
                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Book Now <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
