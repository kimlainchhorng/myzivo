/**
 * Flight Search Page — /flights
 * Full immersive 3D spatial UI — scroll parallax, tilt cards, depth layers, animated backgrounds
 */

import { useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plane, Shield, Star, TrendingUp, ArrowRight, Sparkles,
  Globe, Clock, Headphones, Loader2
} from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import Header from "@/components/Header";
import Flight3DSkyHeader from "@/components/flight/Flight3DSkyHeader";

import miamiImg from "@/assets/destinations/miami.jpg";
import sfImg from "@/assets/destinations/san-francisco.jpg";
import atlantaImg from "@/assets/destinations/atlanta.jpg";
import denverImg from "@/assets/destinations/denver.jpg";
import vegasImg from "@/assets/destinations/las-vegas.jpg";
import fllImg from "@/assets/destinations/fort-lauderdale.jpg";
import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlightSearchFormPro } from "@/components/search";
import { usePopularRoutePrices } from "@/hooks/usePopularRoutePrices";

/* ─── Shared easing ─── */
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

/* ─── Scroll-linked 3D Section wrapper ─── */
function ScrollReveal3D({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -30]);
  const rotateX = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [8, 0, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.95, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.6]);

  return (
    <motion.div
      ref={ref}
      style={{ y, rotateX, scale, opacity, perspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated 3D Background ─── */
function Animated3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Floating orbs with 3D depth */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-[80px]"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -left-40 w-[28rem] h-[28rem] rounded-full bg-accent/4 blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 12, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-primary/4 blur-[60px]"
      />
      
      {/* 3D floating planes */}
      <motion.div
        animate={{
          x: ["-10%", "110%"],
          y: [60, 20, 80],
          rotateZ: [0, 5, -3, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-24"
      >
        <Plane className="w-5 h-5 text-primary/10 rotate-45" />
      </motion.div>
      <motion.div
        animate={{
          x: ["110%", "-10%"],
          y: [200, 160, 220],
          rotateZ: [0, -5, 3, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute top-48"
      >
        <Plane className="w-4 h-4 text-primary/8 -rotate-[135deg]" />
      </motion.div>

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center top",
        }}
      />
    </div>
  );
}

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
  { icon: Globe, title: "500+ Airlines", desc: "Compare prices across all major and low-cost carriers worldwide" },
  { icon: Shield, title: "Trusted Partners", desc: "Book securely through licensed travel partners" },
  { icon: Clock, title: "Real-Time Prices", desc: "Live fares from Duffel API, always up to date" },
  { icon: Headphones, title: "24/7 Support", desc: "Get help with your booking anytime" },
];

/* ─── 3D Route Card ─── */
function RouteCard3D({ route, index, onRouteClick }: { route: any; index: number; onRouteClick: (from: string, to: string) => void }) {
  const tilt = use3DTilt(12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 18, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        delay: index * 0.08,
        duration: 0.65,
        ease: ease3D,
      }}
      style={{ perspective: 800 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onClick={() => onRouteClick(route.from, route.to)}
        className="relative rounded-2xl overflow-hidden border border-border/20 cursor-pointer text-left active:scale-[0.96] touch-manipulation transition-[border-color,box-shadow] duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
        }}
      >
        {/* Destination image with parallax zoom */}
        <div className="relative h-32 overflow-hidden">
          <motion.img
            src={route.image}
            alt={route.toCity}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.12 }}
            transition={{ duration: 0.8, ease: ease3D }}
          />
          {/* Cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          
          {/* Sheen / light reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Floating route badge — 3D lifted */}
          <motion.div
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-xl rounded-full px-3 py-1.5 border border-border/30"
            style={{ transform: "translateZ(24px)" }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-bold text-[11px] text-foreground">{route.from}</span>
            <Plane className="w-3 h-3 text-primary rotate-45" />
            <span className="font-bold text-[11px] text-foreground">{route.to}</span>
          </motion.div>
        </div>

        {/* Info — 3D lifted text */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3" style={{ transform: "translateZ(12px)" }}>
          <p className="text-[10px] text-muted-foreground truncate">
            {route.fromCity} → {route.toCity}
          </p>
          {route.price ? (
            <p className="text-sm font-bold text-primary mt-0.5 drop-shadow-sm">
              from {route.price}*
            </p>
          ) : (
            <div className="h-4 w-16 mt-0.5 rounded-lg bg-muted/40 animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Popular Routes Grid ─── */
function PopularRoutesSection({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data: liveRoutes, isLoading } = usePopularRoutePrices();

  const handleRouteClick = (from: string, to: string) => {
    const today = new Date();
    const departureDate = new Date(today);
    departureDate.setDate(today.getDate() + 7);
    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + 14);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    navigate(
      `/flights/results?origin=${from}&destination=${to}&departureDate=${formatDate(departureDate)}&returnDate=${formatDate(returnDate)}&adults=1&cabinClass=economy`
    );
  };

  const routes = fallbackRoutes.map((fr) => {
    const live = liveRoutes?.find(
      (lr) => lr.origin_code === fr.from && lr.destination_code === fr.to
    );
    return {
      ...fr,
      price: live ? `$${Math.round(live.lowest_price)}` : null,
      airline: live?.airline_name || null,
    };
  });

  const hasLivePrices = routes.some((r) => r.price !== null);

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: ease3D }}
        className="flex items-center gap-2 mb-4"
      >
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold">Popular Routes</h2>
        <Badge variant="outline" className={cn(
          "text-[9px] ml-auto",
          hasLivePrices
            ? "border-emerald-500/30 text-emerald-600"
            : "border-primary/30 text-primary"
        )}>
          {isLoading ? (
            <><Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin" /> Loading</>
          ) : hasLivePrices ? (
            <><Sparkles className="w-2.5 h-2.5 mr-0.5" /> Live</>
          ) : (
            <><Sparkles className="w-2.5 h-2.5 mr-0.5" /> Updating</>
          )}
        </Badge>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {routes.map((route, i) => (
          <RouteCard3D
            key={`${route.from}-${route.to}`}
            route={route}
            index={i}
            onRouteClick={handleRouteClick}
          />
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-3 text-center">
        {hasLivePrices
          ? "*Live prices from Duffel. Final price confirmed at partner checkout."
          : "*Prices loading. Final price confirmed at partner checkout."}
      </p>
    </div>
  );
}

/* ─── 3D Why ZIVO Card ─── */
function WhyCard3D({ item, index }: { item: typeof whyZivo[0]; index: number }) {
  const tilt = use3DTilt(14);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 12, filter: "blur(3px)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: ease3D }}
      style={{ perspective: 600 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="bg-card/60 backdrop-blur-lg border border-border/20 rounded-2xl p-4 text-center transition-[box-shadow] duration-300 hover:shadow-xl hover:shadow-primary/8"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        <motion.div
          className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2.5"
          style={{ transform: "translateZ(20px)" }}
          whileHover={{ rotateY: 15, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <item.icon className="w-5 h-5 text-primary" />
        </motion.div>
        <p className="text-xs font-semibold" style={{ transform: "translateZ(10px)" }}>{item.title}</p>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed hidden sm:block" style={{ transform: "translateZ(5px)" }}>{item.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Trust / Why ZIVO Section ─── */
function WhyZivoSection({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.h2
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-sm font-bold mb-4 text-center sm:text-left"
      >
        Why book with ZIVO?
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {whyZivo.map((item, i) => (
          <WhyCard3D key={item.title} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Trust Strip with 3D float ─── */
function TrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: ease3D }}
      className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground"
      style={{ perspective: 400 }}
    >
      {[
        { icon: Sparkles, label: "500+ Airlines" },
        { icon: Shield, label: "Secure" },
        { icon: Star, label: "Best Price" },
      ].map((item, i) => (
        <motion.span
          key={item.label}
          className="flex items-center gap-1"
          whileHover={{ scale: 1.08, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-border mr-3" />}
          <item.icon className="w-3 h-3" /> {item.label}
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ─── Mobile Flight Search — full 3D ─── */
function MobileFlightSearch() {
  const { fromCity, toCity } = useParams();

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-1" style={{ perspective: "1200px" }}>
      {/* Search form — 3D swooping entrance */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.65, ease: ease3D }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-xl shadow-primary/10 rounded-2xl border border-border/30"
        />
      </motion.div>

      <TrustStrip />

      <ScrollReveal3D>
        <PopularRoutesSection />
      </ScrollReveal3D>

      <ScrollReveal3D>
        <WhyZivoSection />
      </ScrollReveal3D>
    </div>
  );
}

/* ─── Desktop Flight Search ─── */
function DesktopFlightSearch() {
  const { fromCity, toCity } = useParams();

  return (
    <div style={{ perspective: "1400px" }}>
      {/* Header — 3D depth entrance */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: ease3D }}
        className="max-w-3xl mx-auto flex items-center gap-3.5 pt-2 sm:pt-4 pb-4"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: ease3D }}
          whileHover={{ rotateY: 15, scale: 1.05 }}
          className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Plane className="w-6 h-6 text-primary" style={{ transform: "translateZ(8px)" }} />
        </motion.div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Search Flights</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Compare 500+ airlines · Real-time prices from trusted partners</p>
        </div>
      </motion.div>

      {/* Search Form — 3D floating card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.65, delay: 0.12, ease: ease3D }}
        className="max-w-3xl mx-auto"
        style={{ transformStyle: "preserve-3d" }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-2xl shadow-primary/10 rounded-2xl border border-border/30"
        />
      </motion.div>

      <div className="max-w-3xl mx-auto mt-6">
        <TrustStrip />
      </div>

      {/* Scroll-linked 3D sections */}
      <div className="max-w-3xl mx-auto mt-12 space-y-12">
        <ScrollReveal3D>
          <PopularRoutesSection />
        </ScrollReveal3D>
        <ScrollReveal3D>
          <WhyZivoSection />
        </ScrollReveal3D>
      </div>
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
          {/* 3D Sky scene below header */}
          <Flight3DSkyHeader className="-mt-1" />
          <div className="relative overflow-hidden">
            <Animated3DBackground />
            <div className="relative z-10">
              <MobileFlightSearch />
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Search Flights – ZIVO" description="Search and compare flights from 500+ airlines. Find the best deals." />
      <Animated3DBackground />
      <Header />
      {/* 3D Sky scene below desktop header */}
      <div className="pt-16 sm:pt-20">
        <Flight3DSkyHeader className="h-36" />
      </div>
      <main className="pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <DesktopFlightSearch />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlightLanding;
