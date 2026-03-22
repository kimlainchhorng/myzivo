/**
 * ServicesShowcase - Premium 3D Cinematic bento grid
 * Auto-scrolling service carousel + immersive depth cards
 */
import { Plane, Hotel, CarFront, Car, UtensilsCrossed, ArrowRight, Ticket } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useEffect, useRef } from "react";

import svcFlights from "@/assets/svc-flights-premium.jpg";
import svcHotels from "@/assets/svc-hotels-premium.jpg";
import svcCars from "@/assets/svc-cars-premium.jpg";
import svcRides from "@/assets/svc-rides-premium.jpg";
import svcEats from "@/assets/svc-eats-premium.jpg";
import svcBooking from "@/assets/svc-booking-premium.jpg";

const services = [
  {
    icon: Plane,
    title: "Flights",
    description: "500+ airlines, real-time prices",
    href: "/flights",
    image: svcFlights,
    accentVar: "--flights",
    badge: "Popular",
    span: "sm:col-span-2 lg:col-span-2 lg:row-span-2",
    tall: true,
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Luxury stays worldwide",
    href: "/hotels",
    image: svcHotels,
    accentVar: "--hotels",
    badge: "New",
  },
  {
    icon: CarFront,
    title: "Car Rentals",
    description: "Premium fleet, flexible pickup",
    href: "/rent-car",
    image: svcCars,
    accentVar: "--cars",
  },
  {
    icon: Car,
    title: "Rides",
    description: "Fast pickups, upfront pricing",
    href: "/rides",
    image: svcRides,
    accentVar: "--rides",
  },
  {
    icon: UtensilsCrossed,
    title: "Food Delivery",
    description: "Restaurant-quality, delivered",
    href: "/eats",
    image: svcEats,
    accentVar: "--eats",
  },
];

/* ─── Auto-scrolling highlights strip ─── */
const highlightItems = [
  { text: "✈️ Flights from $49", color: "--flights" },
  { text: "🏨 Hotels up to 60% off", color: "--hotels" },
  { text: "🚗 Car Rentals from $19/day", color: "--cars" },
  { text: "🚕 Rides in 3 minutes", color: "--rides" },
  { text: "🍔 Food delivered in 25 min", color: "--eats" },
  { text: "📱 Book instantly on app", color: "--primary" },
];

function AutoScrollStrip() {
  return (
    <div className="relative overflow-hidden py-4 mb-10">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div
        animate={{ x: [0, -1200] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex gap-6 whitespace-nowrap"
      >
        {[...highlightItems, ...highlightItems, ...highlightItems].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: `hsl(var(${item.color}) / 0.1)`,
              color: `hsl(var(${item.color}))`,
              border: `1px solid hsl(var(${item.color}) / 0.2)`,
            }}
          >
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── 3D Service Card ─── */
function ServiceCard3D({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, style, glareStyle, handleMouseMove, handleMouseLeave } = use3DTilt(10, 1.04);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(service.span)}
    >
      <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className="relative h-full">
        <Link
          to={service.href}
          className="group relative block h-full rounded-3xl overflow-hidden touch-manipulation active:scale-[0.98] transition-shadow duration-300"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: `0 12px 40px -12px hsl(var(${service.accentVar}) / 0.25), 0 4px 12px -4px rgba(0,0,0,0.1)`,
          }}
        >
          {/* Background image with zoom */}
          <img
            src={service.image}
            alt={`${service.title} — ${service.description}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
            loading="lazy"
          />

          {/* Multi-layer overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at bottom, hsl(var(${service.accentVar})), transparent 70%)` }}
          />

          {/* Glare */}
          <div className="absolute inset-0 pointer-events-none z-20 rounded-3xl" style={glareStyle} />

          {/* Animated border on hover */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
            style={{ border: `2px solid hsl(var(${service.accentVar}) / 0.4)` }}
          />

          {/* Badge */}
          {"badge" in service && service.badge && (
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.3 + index * 0.1 }}
              className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-20"
              style={{
                background: `hsl(var(${service.accentVar}))`,
                color: "white",
                boxShadow: `0 4px 12px -2px hsl(var(${service.accentVar}) / 0.5)`,
              }}
            >
              {service.badge}
            </motion.span>
          )}

          {/* Content layer — 3D depth */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                style={{
                  backgroundColor: `hsl(var(${service.accentVar}) / 0.2)`,
                  borderColor: `hsl(var(${service.accentVar}) / 0.3)`,
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 4px 16px -4px hsl(var(${service.accentVar}) / 0.3)`,
                }}
              >
                <service.icon className="w-6 h-6 text-white drop-shadow-md" />
              </motion.div>
              <div>
                <h3 className="font-extrabold text-lg text-white leading-tight drop-shadow-md">{service.title}</h3>
                <p className="text-sm text-white/70">{service.description}</p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 mt-3 text-sm font-bold sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300"
              style={{ color: `hsl(var(${service.accentVar}))`, textShadow: `0 0 16px hsl(var(${service.accentVar}) / 0.4)` }}
            >
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
    <section id="services-showcase" className="section-padding relative" aria-label="ZIVO travel services">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Everything ZIVO</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-3">
            One app.{" "}
            <span className="gradient-text-primary">Endless possibilities.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From flights to food — every service you need, beautifully designed & instantly accessible.
          </p>
        </motion.div>

        {/* Auto-scrolling highlights */}
        <AutoScrollStrip />

        {/* 3D Bento grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
          style={{ gridAutoRows: "220px", perspective: "1200px" }}
        >
          {services.map((service, i) => (
            <ServiceCard3D key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
