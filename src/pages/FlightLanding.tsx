/**
 * Flight Search Page — /flights
 * Cinematic 3D/4D immersive flight search experience
 */

import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plane, Shield, Star, TrendingUp, Sparkles,
  Globe, Clock, Headphones, Loader2, Zap, ArrowRight, MapPin
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Flight3DSkyHeader from "@/components/flight/Flight3DSkyHeader";

import miamiImg from "@/assets/destinations/miami.jpg";
import sfImg from "@/assets/destinations/san-francisco.jpg";
import atlantaImg from "@/assets/destinations/atlanta.jpg";
import denverImg from "@/assets/destinations/denver.jpg";
import vegasImg from "@/assets/destinations/las-vegas.jpg";
import fllImg from "@/assets/destinations/fort-lauderdale.jpg";

import heroFlights from "@/assets/svc-flights-premium.jpg";
import heroHotels from "@/assets/svc-hotels-premium.jpg";
import heroCars from "@/assets/svc-cars-premium.jpg";

import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlightSearchFormPro } from "@/components/search";
import { usePopularRoutePrices } from "@/hooks/usePopularRoutePrices";
import { useTravelpayoutsPopularRoutes } from "@/hooks/useTravelpayoutsPopularRoutes";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

const ease3D = [0.16, 1, 0.3, 1] as const;

/* ─── 3D Tilt Hook ─── */
function use3DTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02,1.02,1.02)`;
  }, [maxTilt]);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale3d(1,1,1)";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}

/* ─── Scroll 3D section ─── */
function ScrollReveal3D({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -30]);
  const rotateX = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [8, 0, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.95, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);
  return (
    <motion.div ref={ref} style={{ y, rotateX, scale, opacity, perspective: 1000, transformStyle: "preserve-3d" }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Cinematic hero backgrounds ─── */
const heroSlides = [
  { src: heroFlights, accent: "210 100% 55%", label: "Explore the Skies", sub: "500+ airlines worldwide" },
  { src: heroHotels, accent: "38 90% 55%", label: "Dream Destinations", sub: "Best prices guaranteed" },
  { src: heroCars, accent: "270 70% 55%", label: "Travel Your Way", sub: "Search. Compare. Save." },
];

/* ─── Fallback routes ─── */
const fallbackRoutes = [
  { from: "JFK", to: "MIA", fromCity: "New York", toCity: "Miami", image: miamiImg },
  { from: "LAX", to: "SFO", fromCity: "Los Angeles", toCity: "San Francisco", image: sfImg },
  { from: "ORD", to: "ATL", fromCity: "Chicago", toCity: "Atlanta", image: atlantaImg },
  { from: "DFW", to: "DEN", fromCity: "Dallas", toCity: "Denver", image: denverImg },
  { from: "SEA", to: "LAS", fromCity: "Seattle", toCity: "Las Vegas", image: vegasImg },
  { from: "BOS", to: "FLL", fromCity: "Boston", toCity: "Fort Lauderdale", image: fllImg },
];

const whyZivo = [
  { icon: Globe, title: "500+ Airlines", desc: "Compare all major & low-cost carriers", color: "sky" },
  { icon: Shield, title: "Trusted Partners", desc: "Book through licensed travel partners", color: "emerald" },
  { icon: Clock, title: "Real-Time Prices", desc: "Live fares, always up to date", color: "amber" },
  { icon: Headphones, title: "24/7 Support", desc: "Get help with your booking anytime", color: "purple" },
];

/* ─── 3D Route Card ─── */
function RouteCard3D({ route, index, onRouteClick }: { route: any; index: number; onRouteClick: (from: string, to: string) => void }) {
  const tilt = use3DTilt(12);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.08, duration: 0.65, ease: ease3D }}
      style={{ perspective: 800 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onClick={() => onRouteClick(route.from, route.to)}
        className="group relative rounded-2xl overflow-hidden border border-border/20 cursor-pointer active:scale-[0.96] touch-manipulation transition-[border-color,box-shadow] duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 bg-card"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out, box-shadow 0.3s ease" }}
      >
        <div className="relative h-36 overflow-hidden">
          <motion.img src={route.image} alt={route.toCity} className="w-full h-full object-cover" loading="lazy" whileHover={{ scale: 1.12 }} transition={{ duration: 0.8, ease: ease3D }} />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          {/* Holographic sweep */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* 3D lifted route badge */}
          <motion.div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-xl rounded-full px-3 py-1.5 border border-border/30 shadow-lg" style={{ transform: "translateZ(24px)" }}>
            <span className="font-bold text-[11px] text-foreground">{route.from}</span>
            <Plane className="w-3 h-3 text-primary rotate-45" />
            <span className="font-bold text-[11px] text-foreground">{route.to}</span>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3" style={{ transform: "translateZ(12px)" }}>
          <p className="text-[10px] text-muted-foreground truncate">{route.fromCity} → {route.toCity}</p>
          {route.departureDate && (
            <p className="text-[9px] text-muted-foreground/70 flex items-center gap-0.5 mt-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {format(parseISO(route.departureDate), "MMM d")}
              {route.returnDate && ` – ${format(parseISO(route.returnDate), "MMM d")}`}
              {route.transfers !== null && route.transfers !== undefined && (
                <span className="ml-1">· {route.transfers === 0 ? "Direct" : `${route.transfers} stop${route.transfers > 1 ? "s" : ""}`}</span>
              )}
            </p>
          )}
          {route.price ? (
            <p className="text-sm font-bold text-primary mt-0.5 drop-shadow-sm">from {route.price}*</p>
          ) : (
            <div className="h-4 w-16 mt-0.5 rounded-lg bg-muted/40 animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Popular Routes ─── */
function PopularRoutesSection({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: liveRoutes, isLoading } = usePopularRoutePrices();
  const handleRouteClick = (from: string, to: string) => {
    const today = new Date();
    const dep = new Date(today); dep.setDate(today.getDate() + 7);
    const ret = new Date(today); ret.setDate(today.getDate() + 14);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    navigate(`/flights/results?origin=${from}&destination=${to}&departureDate=${fmt(dep)}&returnDate=${fmt(ret)}&adults=1&cabinClass=economy`);
  };
  const routes = fallbackRoutes.map((fr) => {
    const live = liveRoutes?.find((lr) => lr.origin_code === fr.from && lr.destination_code === fr.to);
    return { ...fr, price: live ? `$${Math.round(live.lowest_price)}` : null, airline: live?.airline_name || null };
  });
  const hasLivePrices = routes.some((r) => r.price !== null);
  return (
    <div className={className}>
      <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Popular Routes</h2>
          <p className="text-xs text-muted-foreground">Trending destinations with live pricing</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] ml-auto", hasLivePrices ? "border-emerald-500/30 text-emerald-600" : "border-primary/30 text-primary")}>
          {isLoading ? <><Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" /> Loading</> : hasLivePrices ? <><Zap className="w-2.5 h-2.5 mr-0.5" /> Live Prices</> : <><Sparkles className="w-2.5 h-2.5 mr-0.5" /> Updating</>}
        </Badge>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {routes.map((route, i) => (
          <RouteCard3D key={`${route.from}-${route.to}`} route={route} index={i} onRouteClick={handleRouteClick} />
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-3 text-center">
        {hasLivePrices ? "*Live prices from Duffel. Final price confirmed at partner checkout." : "*Prices loading. Final price confirmed at partner checkout."}
      </p>
    </div>
  );
}

/* ─── 3D Why ZIVO Card ─── */
function WhyCard3D({ item, index }: { item: typeof whyZivo[0]; index: number }) {
  const tilt = use3DTilt(14);
  const colorMap: Record<string, string> = {
    sky: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-500",
    emerald: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-500",
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-500",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-500",
  };
  const colors = colorMap[item.color] || colorMap.sky;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: ease3D }}
      style={{ perspective: 600 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="group bg-card/80 backdrop-blur-lg border border-border/30 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 relative overflow-hidden"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        {/* Background glow on hover */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", colors.split(" ").slice(0, 2).join(" "))} />
        <motion.div
          className={cn("w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center mx-auto mb-3 relative z-10", colors)}
          style={{ transform: "translateZ(20px)" }}
          whileHover={{ rotateY: 15, scale: 1.1 }}
        >
          <item.icon className="w-5 h-5" />
        </motion.div>
        <p className="text-sm font-bold relative z-10" style={{ transform: "translateZ(10px)" }}>{item.title}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed relative z-10" style={{ transform: "translateZ(5px)" }}>{item.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Why ZIVO Section ─── */
function WhyZivoSection({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Why Book with ZIVO?</h2>
          <p className="text-xs text-muted-foreground">Trusted by travelers worldwide</p>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {whyZivo.map((item, i) => (
          <WhyCard3D key={item.title} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Cinematic Desktop Hero ─── */
function DesktopCinematicHero() {
  const { fromCity, toCity } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const formScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const currentAccent = heroSlides[currentSlide].accent;

  return (
    <div ref={containerRef} className="relative" style={{ perspective: "1400px" }}>
      {/* ── Cinematic Background ── */}
      <div className="absolute inset-0 h-[70vh] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{ opacity: i === currentSlide ? 1 : 0, scale: i === currentSlide ? 1.02 : 1.08 }}
            transition={{ opacity: { duration: 1.6, ease: [0.4, 0, 0.2, 1] }, scale: { duration: 8, ease: "linear" } }}
            style={{ zIndex: i === currentSlide ? 1 : 0 }}
          >
            <motion.img src={slide.src} alt="" className="w-full h-full object-cover" style={{ y: bgY }} />
          </motion.div>
        ))}
        {/* Depth overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/50 z-[2]" />
        {/* Accent color wash */}
        <motion.div
          className="absolute inset-0 z-[3] pointer-events-none"
          animate={{ background: `radial-gradient(ellipse at 30% 40%, hsl(${currentAccent} / 0.12) 0%, transparent 70%)` }}
          transition={{ duration: 1.5 }}
        />
      </div>

      {/* ── Floating 3D Elements ── */}
      <div className="absolute inset-0 h-[70vh] z-[4] pointer-events-none overflow-hidden">
        {/* Animated plane */}
        <motion.div
          animate={{ x: ["-5%", "105%"], y: [80, 50, 90], rotateZ: [0, 3, -2, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-20"
        >
          <Plane className="w-6 h-6 text-primary/20 rotate-45" />
        </motion.div>

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 right-[20%] w-48 h-48 rounded-full blur-[80px]"
          style={{ background: `hsl(${currentAccent} / 0.08)` }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1.1, 0.9, 1.1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[40%] left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-[100px]"
        />

        {/* 3D floating service icons */}
        {[
          { icon: Plane, x: "8%", y: "25%", delay: 0, color: "sky" },
          { icon: Globe, x: "88%", y: "30%", delay: 1.5, color: "cyan" },
          { icon: Star, x: "85%", y: "55%", delay: 3, color: "amber" },
          { icon: MapPin, x: "12%", y: "60%", delay: 2, color: "emerald" },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-11 h-11 rounded-2xl backdrop-blur-xl border flex items-center justify-center shadow-xl",
              item.color === "sky" && "bg-sky-500/15 border-sky-500/25 shadow-sky-500/20",
              item.color === "cyan" && "bg-cyan-500/15 border-cyan-500/25 shadow-cyan-500/20",
              item.color === "amber" && "bg-amber-500/15 border-amber-500/25 shadow-amber-500/20",
              item.color === "emerald" && "bg-emerald-500/15 border-emerald-500/25 shadow-emerald-500/20",
            )}
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [0, -8, 0],
              rotateY: [0, 10, 0],
              rotateX: [0, -5, 0],
            }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
          >
            <item.icon className={cn(
              "w-5 h-5",
              item.color === "sky" && "text-sky-400",
              item.color === "cyan" && "text-cyan-400",
              item.color === "amber" && "text-amber-400",
              item.color === "emerald" && "text-emerald-400",
            )} />
          </motion.div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 pt-20 sm:pt-24">
        <div className="container mx-auto px-4">
          {/* Hero text */}
          <motion.div className="max-w-3xl mx-auto text-center mb-8" style={{ y: textY }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: ease3D }}
            >
              {/* Live badge */}
              <motion.div className="flex justify-center mb-4">
                <Badge className="px-4 py-2 bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-2 text-xs font-medium backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500" />
                  </span>
                  Live Prices • 500+ Airlines
                </Badge>
              </motion.div>

              {/* Dynamic headline synced to slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="font-display text-3xl lg:text-5xl font-bold mb-2 leading-tight">
                    <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                      {heroSlides[currentSlide].label}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">{heroSlides[currentSlide].sub}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === currentSlide ? "w-8 bg-primary" : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Search Form — 3D floating card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: ease3D }}
            style={{ transformStyle: "preserve-3d", scale: formScale }}
            className="max-w-3xl mx-auto relative"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute -inset-2 rounded-3xl blur-xl opacity-40"
              animate={{
                background: [
                  `linear-gradient(135deg, hsl(${currentAccent} / 0.3), hsl(var(--primary) / 0.2))`,
                  `linear-gradient(225deg, hsl(var(--primary) / 0.3), hsl(${currentAccent} / 0.2))`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />

            <div className="relative">
              <FlightSearchFormPro
                initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
                initialTo={toCity ? decodeURIComponent(toCity) : ""}
                className="shadow-2xl shadow-primary/15 rounded-2xl border border-border/30 bg-card/95 backdrop-blur-xl"
              />
            </div>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-6 mt-6 text-[11px] text-muted-foreground"
          >
            {[
              { icon: Sparkles, label: "500+ Airlines" },
              { icon: Shield, label: "Secure Booking" },
              { icon: Star, label: "Best Prices" },
              { icon: Zap, label: "Instant Results" },
            ].map((item, i) => (
              <motion.span
                key={item.label}
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {i > 0 && <span className="w-1 h-1 rounded-full bg-border mr-4" />}
                <item.icon className="w-3.5 h-3.5 text-primary/60" /> {item.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Scroll-linked 3D sections */}
          <div className="max-w-4xl mx-auto mt-16 space-y-16 pb-8">
            <ScrollReveal3D>
              <PopularRoutesSection />
            </ScrollReveal3D>
            <ScrollReveal3D>
              <WhyZivoSection />
            </ScrollReveal3D>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Flight Search ─── */
function MobileFlightSearch() {
  const { fromCity, toCity } = useParams();
  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-1" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.65, ease: ease3D }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-xl shadow-primary/10 rounded-2xl border border-border/30"
        />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        {[{ icon: Sparkles, label: "500+ Airlines" }, { icon: Shield, label: "Secure" }, { icon: Star, label: "Best Price" }].map((item, i) => (
          <span key={item.label} className="flex items-center gap-1">
            {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-border mr-3" />}
            <item.icon className="w-3 h-3" /> {item.label}
          </span>
        ))}
      </motion.div>
      <ScrollReveal3D><PopularRoutesSection /></ScrollReveal3D>
      <ScrollReveal3D><WhyZivoSection /></ScrollReveal3D>
    </div>
  );
}

/* ─── Animated 3D Background (mobile) ─── */
function Animated3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-[80px]" />
      <motion.div animate={{ y: [0, 30, 0], x: [0, -15, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-1/2 -left-40 w-[28rem] h-[28rem] rounded-full bg-accent/4 blur-[100px]" />
      <motion.div animate={{ y: [0, -25, 0], x: [0, 12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-primary/4 blur-[60px]" />
      <motion.div animate={{ x: ["-10%", "110%"], y: [60, 20, 80], rotateZ: [0, 5, -3, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-24">
        <Plane className="w-5 h-5 text-primary/10 rotate-45" />
      </motion.div>
    </div>
  );
}

/* ─── Main Component ─── */
const FlightLanding = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <SEOHead title="Search Flights – ZIVO" description="Search and compare flights from 500+ airlines." />
        <AppLayout title="Flights" headerRightAction={undefined}>
          <Flight3DSkyHeader className="-mt-1" />
          <div className="relative overflow-hidden">
            <Animated3DBackground />
            <div className="relative z-10"><MobileFlightSearch /></div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Search Flights – ZIVO" description="Search and compare flights from 500+ airlines. Find the best deals." />
      <Header />
      <main className="pt-16 sm:pt-20">
        <DesktopCinematicHero />
      </main>
      <Footer />
    </div>
  );
};

export default FlightLanding;
