/**
 * ServicesShowcase - 3D Spatial bento grid with depth layers
 */
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { use3DTilt } from "@/hooks/use3DTilt";

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
    accentVar: "--flights",
    badge: "Popular",
    span: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
    tall: true,
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Best rates worldwide",
    href: "/hotels",
    image: imgHotels,
    accentVar: "--hotels",
  },
  {
    icon: CarFront,
    title: "Car Rentals",
    description: "Flexible pickup & return",
    href: "/rent-car",
    image: imgCars,
    accentVar: "--cars",
  },
  {
    icon: Car,
    title: "Rides",
    description: "Fast pickups, upfront pricing",
    href: "/rides",
    image: imgRides,
    accentVar: "--rides",
  },
  {
    icon: UtensilsCrossed,
    title: "Eats",
    description: "Local restaurants delivered",
    href: "/eats",
    image: imgEats,
    accentVar: "--eats",
  },
];

function ServiceCard3D({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, style, glareStyle, handleMouseMove, handleMouseLeave } = use3DTilt(8, 1.03);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(service.span)}
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="relative h-full"
      >
        <Link
          to={service.href}
          className="group relative block h-full rounded-2xl overflow-hidden touch-manipulation active:scale-[0.98] transition-shadow duration-300 hover:shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Background image */}
          <img
            src={service.image}
            alt={`${service.title} — ${service.description}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

          {/* 3D Glare effect */}
          <div
            className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
            style={glareStyle}
          />

          {/* Accent color glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at bottom, hsl(var(${service.accentVar})), transparent 70%)` }}
          />

          {/* Badge */}
          {"badge" in service && service.badge && (
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground z-10">
              {service.badge}
            </span>
          )}

          {/* Content — 3D depth layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                whileHover={{ rotate: -8, scale: 1.15, z: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-11 h-11 rounded-xl backdrop-blur-md flex items-center justify-center border icon-3d-pop"
                style={{
                  backgroundColor: `hsl(var(${service.accentVar}) / 0.15)`,
                  borderColor: `hsl(var(${service.accentVar}) / 0.25)`,
                }}
              >
                <service.icon className="w-5 h-5" style={{ color: `hsl(var(${service.accentVar}))` }} />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-foreground leading-tight">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm font-semibold sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300" style={{ color: `hsl(var(${service.accentVar}))` }}>
              Explore <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesShowcase() {
  return (
    <section id="services-showcase" className="section-padding relative perspective-container" aria-label="ZIVO travel services">
      {/* 3D Background mesh */}
      <div className="absolute inset-0 bg-mesh-3d pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter mb-3">
            Everything you need,{" "}
            <span className="gradient-text-primary">one platform</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From flights to food — ZIVO has you covered for every part of your journey.
          </p>
        </motion.div>

        {/* 3D Bento grid layout */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto preserve-3d"
          style={{ gridAutoRows: "200px" }}
        >
          {services.map((service, i) => (
            <ServiceCard3D key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}