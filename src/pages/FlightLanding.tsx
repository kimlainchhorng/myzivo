/**
 * Flight Search Page — /flights
 * 3D Spatial UI with parallax scroll, tilt cards, and smooth reveals
 */

import { useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plane, Shield, Star, TrendingUp, ArrowRight, Sparkles,
  Globe, Clock, Headphones, CreditCard, Loader2
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";

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
    el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
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
  const tilt = use3DTilt(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 800 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onClick={() => onRouteClick(route.from, route.to)}
        className="relative rounded-2xl overflow-hidden border border-border/30 hover:border-primary/40 cursor-pointer text-left active:scale-[0.97] touch-manipulation transition-[border-color,box-shadow] duration-300 hover:shadow-xl hover:shadow-primary/10"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        {/* Destination image with 3D parallax */}
        <div className="relative h-28 overflow-hidden">
          <motion.img
            src={route.image}
            alt={route.toCity}
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-card/10" />

          {/* Floating route badge — 3D lifted */}
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-background/85 backdrop-blur-md rounded-full px-2.5 py-1 border border-border/40 shadow-lg"
            style={{ transform: "translateZ(20px)" }}
          >
            <span className="font-bold text-[11px] text-foreground">{route.from}</span>
            <Plane className="w-3 h-3 text-primary rotate-45" />
            <span className="font-bold text-[11px] text-foreground">{route.to}</span>
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <p className="text-[10px] text-muted-foreground truncate">
            {route.fromCity} → {route.toCity}
          </p>
          {route.price ? (
            <p className="text-sm font-bold text-primary mt-0.5">
              from {route.price}*
            </p>
          ) : (
            <div className="h-4 w-16 mt-0.5 rounded bg-muted/50 animate-pulse" />
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
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="flex items-center gap-2 mb-4">
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
      </div>
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
    </motion.div>
  );
}

/* ─── 3D Why ZIVO Card ─── */
function WhyCard3D({ item, index }: { item: typeof whyZivo[0]; index: number }) {
  const tilt = use3DTilt(12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 600 }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="bg-card/70 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center transition-[box-shadow] duration-300 hover:shadow-lg hover:shadow-primary/5"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out" }}
      >
        <div
          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2.5"
          style={{ transform: "translateZ(16px)" }}
        >
          <item.icon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-xs font-semibold" style={{ transform: "translateZ(8px)" }}>{item.title}</p>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed hidden sm:block">{item.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Trust / Why ZIVO Section ─── */
function WhyZivoSection({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <h2 className="text-sm font-bold mb-4 text-center sm:text-left">Why book with ZIVO?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {whyZivo.map((item, i) => (
          <WhyCard3D key={item.title} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Trust Strip ─── */
function TrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground"
    >
      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> 500+ Airlines</span>
      <span className="w-0.5 h-0.5 rounded-full bg-border" />
      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
      <span className="w-0.5 h-0.5 rounded-full bg-border" />
      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Best Price</span>
    </motion.div>
  );
}

/* ─── Mobile Flight Search with 3D scroll ─── */
function MobileFlightSearch() {
  const { fromCity, toCity } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });

  return (
    <div ref={scrollRef} className="flex flex-col gap-6 px-4 pb-8 pt-1 overflow-y-auto" style={{ perspective: "1000px" }}>
      {/* Search form — 3D entrance */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-lg shadow-primary/8 rounded-2xl"
        />
      </motion.div>

      <TrustStrip />
      <PopularRoutesSection />
      <WhyZivoSection />
    </div>
  );
}

/* ─── Desktop Flight Search ─── */
function DesktopFlightSearch() {
  const { fromCity, toCity } = useParams();

  return (
    <div style={{ perspective: "1200px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto flex items-center gap-3.5 pt-2 sm:pt-4 pb-4"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotateY: -20 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
        >
          <Plane className="w-5.5 h-5.5 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Search Flights</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Compare 500+ airlines · Real-time prices from trusted partners</p>
        </div>
      </motion.div>

      {/* Search Form — 3D floating card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto"
        style={{ transformStyle: "preserve-3d" }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-xl shadow-primary/8 rounded-2xl"
        />
      </motion.div>

      <div className="max-w-3xl mx-auto mt-5">
        <TrustStrip />
      </div>

      {/* Content sections with 3D scroll reveals */}
      <div className="max-w-3xl mx-auto mt-10 space-y-10">
        <PopularRoutesSection />
        <WhyZivoSection />
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
        <AppLayout title="Flights">
          <div className="relative overflow-hidden">
            {/* Ambient 3D glow orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/8 blur-3xl"
              />
              <motion.div
                animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
              />
            </div>
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
      {/* Ambient glow orbs with float animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/8 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
        />
      </div>
      <Header />
      <main className="pt-16 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <DesktopFlightSearch />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FlightLanding;
