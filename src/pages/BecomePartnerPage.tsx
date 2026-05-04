/**
 * BecomePartnerPage — branded entry point for any partner type to join ZIVO.
 * Splits into four onboarding paths (Driver, Restaurant, Hotel, Property) and
 * forwards into the existing /partner-with-zivo?type=... dispatcher.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Car from "lucide-react/dist/esm/icons/car";
import UtensilsCrossed from "lucide-react/dist/esm/icons/utensils-crossed";
import BedDouble from "lucide-react/dist/esm/icons/bed-double";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import type { LucideIcon } from "lucide-react";

interface PartnerOption {
  type: string;
  label: string;
  hook: string;
  benefits: string[];
  icon: LucideIcon;
  iconClass: string;
}

const OPTIONS: PartnerOption[] = [
  {
    type: "driver",
    label: "Drive with ZIVO",
    hook: "Earn weekly. Set your own hours.",
    benefits: ["Instant payouts", "Surge pricing alerts", "Eats deliveries too"],
    icon: Car,
    iconClass: "text-emerald-500",
  },
  {
    type: "restaurant",
    label: "List your restaurant",
    hook: "Take delivery + table reservations from day one.",
    benefits: ["Reservations", "Pickup & delivery", "Restaurant dashboard"],
    icon: UtensilsCrossed,
    iconClass: "text-orange-500",
  },
  {
    type: "lodging",
    label: "List your hotel",
    hook: "Reach travelers booking flights + cars in one place.",
    benefits: ["Channel manager", "Direct bookings", "Cross-sell to flights"],
    icon: BedDouble,
    iconClass: "text-violet-500",
  },
  {
    type: "property",
    label: "Rent out a property",
    hook: "Short-term stays, long-term tenants — your choice.",
    benefits: ["Smart pricing", "Verified guests", "ID + payment trust"],
    icon: Building2,
    iconClass: "text-foreground",
  },
];

const PILLARS = [
  { icon: TrendingUp, label: "Built-in audience", body: "Plug into the millions of riders, eaters & travelers already on ZIVO." },
  { icon: ShieldCheck, label: "Verified & secure", body: "ID checks, fraud detection, and dispute support handled for you." },
  { icon: Sparkles, label: "Cross-sell everywhere", body: "A flight booking can recommend your hotel. A reservation can recommend your ride." },
];

export default function BecomePartnerPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[100dvh] bg-background pb-16">
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <div className="max-w-screen-md mx-auto px-5 pt-12 pb-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
            <Sparkles className="w-3 h-3" /> Become a partner
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 leading-tight">
            Grow with the only super-app that ties them all together.
          </h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Drivers, restaurants, hotels, and property owners share one platform. One account, one
            dashboard, one network of customers across rides, eats, flights, and stays.
          </p>
        </div>
      </section>

      {/* Options */}
      <section className="max-w-screen-md mx-auto px-4 pt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Pick your path
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.type}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/partner-with-zivo?type=${opt.type}`)}
                className="relative overflow-hidden rounded-3xl p-5 text-left bg-card border border-border hover:border-foreground/30 transition-colors touch-manipulation"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${opt.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold tracking-tight leading-tight text-foreground">{opt.label}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{opt.hook}</div>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {opt.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-1.5 text-[12px] text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1.5 text-[12px] font-bold">
                  Get started <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Why ZIVO pillars */}
      <section className="max-w-screen-md mx-auto px-4 mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Why partners choose ZIVO
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-foreground">{p.label}</div>
                <div className="text-[12px] text-muted-foreground mt-1">{p.body}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-screen-md mx-auto px-4 mt-10">
        <div className="rounded-3xl bg-secondary border border-border p-5">
          <div className="text-base font-bold tracking-tight text-foreground">Not sure which fits?</div>
          <div className="text-[12px] text-muted-foreground mt-1">
            Talk to our partnerships team — we'll help you pick the right entry point.
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="mt-3 inline-flex items-center gap-1 rounded-xl bg-foreground text-background font-bold px-4 py-2 text-sm active:scale-[0.98] transition-transform"
          >
            Contact sales <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
