/**
 * Flight Search Page — /flights
 * Mobile: native app feel with AppLayout
 * Desktop: website layout with Header/Footer
 * Uses FlightSearchFormPro as unified search form
 */

import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plane, Shield, Star, TrendingUp, ArrowRight, Sparkles,
  Globe, Clock, Headphones, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlightSearchFormPro } from "@/components/search";

/* ─── Popular Routes ─── */
const popularRoutes = [
  { from: "JFK", to: "MIA", fromCity: "New York", toCity: "Miami", price: "$89" },
  { from: "LAX", to: "SFO", fromCity: "Los Angeles", toCity: "San Francisco", price: "$59" },
  { from: "ORD", to: "ATL", fromCity: "Chicago", toCity: "Atlanta", price: "$75" },
  { from: "DFW", to: "DEN", fromCity: "Dallas", toCity: "Denver", price: "$68" },
  { from: "SEA", to: "LAS", fromCity: "Seattle", toCity: "Las Vegas", price: "$72" },
  { from: "BOS", to: "FLL", fromCity: "Boston", toCity: "Fort Lauderdale", price: "$95" },
];

const whyZivo = [
  { icon: Globe, title: "500+ Airlines", desc: "Compare prices across all major and low-cost carriers worldwide" },
  { icon: Shield, title: "Trusted Partners", desc: "Book securely through licensed travel partners" },
  { icon: Clock, title: "Real-Time Prices", desc: "Live fares from Duffel API, always up to date" },
  { icon: Headphones, title: "24/7 Support", desc: "Get help with your booking anytime" },
];

/* ─── Popular Routes Grid ─── */
function PopularRoutesSection({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className={className}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[hsl(var(--flights))]" />
        <h2 className="text-sm font-bold">Popular Routes</h2>
        <Badge variant="outline" className="text-[9px] border-[hsl(var(--flights))]/30 text-[hsl(var(--flights))] ml-auto">
          <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Live
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {popularRoutes.map((route) => (
          <div
            key={`${route.from}-${route.to}`}
            className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-3 hover:border-[hsl(var(--flights))]/30 transition-all group"
          >
            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <span>{route.from}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-[hsl(var(--flights))] transition-colors" />
              <span>{route.to}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {route.fromCity} → {route.toCity}
            </p>
            <p className="text-xs font-bold text-[hsl(var(--flights))] mt-1">
              from {route.price}*
            </p>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-2 text-center">
        *Prices are indicative and may vary. Final price confirmed at partner checkout.
      </p>
    </motion.div>
  );
}

/* ─── Trust / Why ZIVO Section ─── */
function WhyZivoSection({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      className={className}
    >
      <h2 className="text-sm font-bold mb-3 text-center sm:text-left">Why book with ZIVO?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {whyZivo.map((item) => (
          <div
            key={item.title}
            className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-3 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--flights))]/10 border border-[hsl(var(--flights))]/20 flex items-center justify-center mx-auto mb-2">
              <item.icon className="w-4 h-4 text-[hsl(var(--flights))]" />
            </div>
            <p className="text-xs font-semibold">{item.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Trust Strip ─── */
function TrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
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

/* ─── Mobile Flight Search ─── */
function MobileFlightSearch() {
  const { fromCity, toCity } = useParams();

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-1">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-lg shadow-[hsl(var(--flights))]/5"
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
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-3xl mx-auto flex items-center gap-3.5 pt-2 sm:pt-4 pb-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-11 h-11 rounded-xl bg-[hsl(var(--flights))]/10 border border-[hsl(var(--flights))]/20 flex items-center justify-center shrink-0"
        >
          <Plane className="w-5.5 h-5.5 text-[hsl(var(--flights))]" />
        </motion.div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Search Flights</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Compare 500+ airlines · Real-time prices from trusted partners</p>
        </div>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-3xl mx-auto"
      >
        <FlightSearchFormPro
          initialFrom={fromCity ? decodeURIComponent(fromCity) : ""}
          initialTo={toCity ? decodeURIComponent(toCity) : ""}
          className="shadow-xl shadow-[hsl(var(--flights))]/5"
        />
      </motion.div>

      <div className="max-w-3xl mx-auto mt-4">
        <TrustStrip />
      </div>

      {/* Content sections */}
      <div className="max-w-3xl mx-auto mt-8 space-y-8">
        <PopularRoutesSection />
        <WhyZivoSection />
      </div>
    </>
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
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/8 blur-3xl" />
              <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/8 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
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
