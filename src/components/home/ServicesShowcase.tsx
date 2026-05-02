/**
 * ServicesShowcase — Premium 3D/4D Ad-Style Marketing Cards
 * Cinematic bento grid with auto-scrolling ticker, holographic depth, and floating animations
 */
import Plane from "lucide-react/dist/esm/icons/plane";
import Hotel from "lucide-react/dist/esm/icons/hotel";
import CarFront from "lucide-react/dist/esm/icons/car-front";
import Car from "lucide-react/dist/esm/icons/car";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useState, useEffect } from "react";

import svcFlights from "@/assets/svc-flights-premium.jpg";
import svcHotels from "@/assets/svc-hotels-premium.jpg";
import svcCars from "@/assets/svc-cars-premium.jpg";
import svcRides from "@/assets/svc-rides-premium.jpg";
import svcEats from "@/assets/svc-eats-premium.jpg";

const services = [
  {
    icon: Plane, title: "Flights", subtitle: "500+ Airlines", description: "Compare & book the cheapest flights worldwide",
    href: "/flights", image: svcFlights, accentVar: "--flights", badge: "🔥 Most Popular",
    span: "sm:col-span-2 lg:col-span-2 lg:row-span-2", tall: true,
    promo: "From $49", rating: "4.9",
  },
  {
    icon: Hotel, title: "Hotels", subtitle: "Best Rates", description: "Luxury stays up to 60% off",
    href: "/hotels", image: svcHotels, accentVar: "--hotels", badge: "⭐ Top Rated",
    promo: "60% Off", rating: "4.8",
  },
  {
    icon: CarFront, title: "Car Rentals", subtitle: "Premium Fleet", description: "Drive your adventure",
    href: "/rent-car", image: svcCars, accentVar: "--cars", badge: "🚀 New",
    promo: "$19/day", rating: "4.7",
  },
  {
    icon: Car, title: "Rides", subtitle: "3 Min Pickup", description: "Fast rides, upfront pricing",
    href: "/rides", image: svcRides, accentVar: "--rides",
    promo: "In 3 min", rating: "4.9",
  },
  {
    icon: UtensilsCrossed, title: "Food", subtitle: "25 Min Delivery", description: "Restaurant-quality, delivered",
    href: "/eats", image: svcEats, accentVar: "--eats",
    promo: "Free delivery", rating: "4.8",
  },
];

/* ─── Auto-scrolling Ad Ticker ─── */
const tickerItems = [
  { text: "✈️ Flights from $49", color: "--flights" },
  { text: "🏨 Hotels up to 60% off", color: "--hotels" },
  { text: "🚗 Car Rentals from $19/day", color: "--cars" },
  { text: "🚕 Rides in 3 minutes", color: "--rides" },
  { text: "🍔 Free delivery on food", color: "--eats" },
  { text: "⚡ Book in 30 seconds", color: "--primary" },
  { text: "🌍 190+ Countries", color: "--flights" },
  { text: "💎 Best price guarantee", color: "--hotels" },
];

function AdTicker() {
  return (
    <div className="relative overflow-hidden py-5 mb-12">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      {/* Two rows scrolling opposite directions */}
      <motion.div
        animate={{ x: [0, -1600] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 whitespace-nowrap mb-3"
      >
        {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <span
            key={`a-${i}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
            style={{
              background: `hsl(var(${item.color}) / 0.08)`,
              color: `hsl(var(${item.color}))`,
              border: `1px solid hsl(var(${item.color}) / 0.15)`,
              boxShadow: `0 2px 12px -4px hsl(var(${item.color}) / 0.15)`,
            }}
          >
            {item.text}
          </span>
        ))}
      </motion.div>
      <motion.div
        animate={{ x: [-1600, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="flex gap-4 whitespace-nowrap"
      >
        {[...tickerItems.slice().reverse(), ...tickerItems.slice().reverse(), ...tickerItems.slice().reverse(), ...tickerItems.slice().reverse()].map((item, i) => (
          <span
            key={`b-${i}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
            style={{
              background: `hsl(var(${item.color}) / 0.08)`,
              color: `hsl(var(${item.color}))`,
              border: `1px solid hsl(var(${item.color}) / 0.15)`,
              boxShadow: `0 2px 12px -4px hsl(var(${item.color}) / 0.15)`,
            }}
          >
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Premium 3D Ad Card ─── */
function AdCard3D({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, style, glareStyle, handleMouseMove, handleMouseLeave } = use3DTilt(12, 1.05);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200 + index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(service.span)}
    >
      <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className="relative h-full">
        <Link
          to={service.href}
          className="group relative block h-full rounded-3xl overflow-hidden touch-manipulation active:scale-[0.98]"
          style={{
            transformStyle: "preserve-3d",
            boxShadow: `0 20px 60px -15px hsl(var(${service.accentVar}) / 0.3), 0 8px 20px -8px rgba(0,0,0,0.15)`,
          }}
        >
          {/* Background image with parallax zoom */}
          <motion.img
            src={service.image}
            alt={`${service.title} — ${service.description}`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={isVisible ? { scale: [1, 1.06, 1.03] } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            loading="lazy"
          />

          {/* 4-layer depth overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700"
            style={{ background: `radial-gradient(ellipse at 50% 80%, hsl(var(${service.accentVar})), transparent 70%)` }}
          />
          {/* Ambient light sweep */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0.05) 48%, transparent 55%)",
              backgroundSize: "250% 100%",
              animation: "adSweep 2s ease-in-out infinite",
            }}
          />

          {/* Holographic glare */}
          <div className="absolute inset-0 pointer-events-none z-20 rounded-3xl" style={glareStyle} />

          {/* Animated accent border */}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
            style={{
              border: `2px solid hsl(var(${service.accentVar}) / 0.5)`,
              boxShadow: `inset 0 0 30px -10px hsl(var(${service.accentVar}) / 0.15)`,
            }}
          />

          {/* Top: Badge + Rating */}
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 z-20">
            {service.badge && (
              <motion.span
                initial={{ scale: 0, rotate: -12 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.4 + index * 0.1 }}
                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl backdrop-blur-md"
                style={{
                  background: `hsl(var(${service.accentVar}) / 0.85)`,
                  color: "white",
                  boxShadow: `0 6px 20px -4px hsl(var(${service.accentVar}) / 0.5)`,
                }}
              >
                {service.badge}
              </motion.span>
            )}
            {service.rating && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white backdrop-blur-md"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {service.rating}
              </motion.div>
            )}
          </div>

          {/* Promo price tag — floating 3D */}
          {service.promo && (
            <motion.div
              animate={{ y: [0, -4, 0], rotateZ: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-14 right-4 z-20"
              style={{ transform: "translateZ(40px)" }}
            >
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-black text-white backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, hsl(var(${service.accentVar})), hsl(var(${service.accentVar}) / 0.7))`,
                  boxShadow: `0 8px 24px -6px hsl(var(${service.accentVar}) / 0.5)`,
                }}
              >
                {service.promo}
              </div>
            </motion.div>
          )}

          {/* Bottom content — 3D lifted */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10" style={{ transform: "translateZ(35px)" }}>
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                whileHover={{ rotate: -12, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-xl"
                style={{
                  backgroundColor: `hsl(var(${service.accentVar}) / 0.25)`,
                  borderColor: `hsl(var(${service.accentVar}) / 0.35)`,
                  boxShadow: `0 6px 24px -6px hsl(var(${service.accentVar}) / 0.4), inset 0 1px 1px rgba(255,255,255,0.15)`,
                }}
              >
                <service.icon className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <h3 className="font-black text-xl text-white leading-tight drop-shadow-lg tracking-tight">{service.title}</h3>
                <p className="text-[13px] text-white/60 font-medium">{service.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/50 mb-3 line-clamp-2">{service.description}</p>

            {/* CTA bar */}
            <motion.div
              className="flex items-center justify-between"
              initial={false}
            >
              <div
                className="flex items-center gap-1.5 text-sm font-bold sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-3 sm:group-hover:translate-y-0 transition-all duration-400"
                style={{
                  color: `hsl(var(${service.accentVar}))`,
                  textShadow: `0 0 20px hsl(var(${service.accentVar}) / 0.5)`,
                }}
              >
                Explore Now <ArrowRight className="w-4 h-4" />
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 sm:scale-75 sm:group-hover:scale-100 transition-all duration-400"
                style={{
                  background: `hsl(var(${service.accentVar}) / 0.2)`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesShowcase() {
  return (
    <section id="services-showcase" className="section-padding relative overflow-hidden" aria-label="ZIVO travel services">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 50%, hsl(var(--flights) / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, hsl(var(--hotels) / 0.04) 0%, transparent 50%)",
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              border: "1px solid hsl(var(--primary) / 0.2)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Everything ZIVO</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mb-3">
            One app.{" "}
            <span className="gradient-text-primary">Endless possibilities.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From flights to food — every service you need, beautifully designed & instantly accessible.
          </p>
        </motion.div>

        {/* Double-row auto-scrolling ad ticker */}
        <AdTicker />

        {/* 3D Ad-Style Bento Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
          style={{ gridAutoRows: "240px", perspective: "1400px" }}
        >
          {services.map((service, i) => (
            <AdCard3D key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>

      {/* Ad sweep animation */}
      <style>{`
        @keyframes adSweep {
          0% { background-position: 250% 0; }
          100% { background-position: -250% 0; }
        }
      `}</style>
    </section>
  );
}
