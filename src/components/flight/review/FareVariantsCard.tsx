/**
 * Fare Variants Card — Ultra-Premium 3D Spatial UI
 * Deep glassmorphic cards with floating watermark icons, animated shine,
 * perspective transforms, scroll progress dots, and tactile depth
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ChevronLeft, ChevronRight, Ticket, X,
  Briefcase, ShieldCheck, ArrowLeftRight, Luggage,
  Sparkles, Crown, Gem, Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";
import { getAllInPrice } from "@/utils/flightPricing";

import cabinEconomy from "@/assets/cabin-economy.jpg";
import cabinPremiumEconomy from "@/assets/cabin-premium-economy.jpg";
import cabinBusiness from "@/assets/cabin-business.jpg";
import cabinFirst from "@/assets/cabin-first.jpg";

type FareVariant = NonNullable<DuffelOffer["fareVariants"]>[number];

interface FareVariantsCardProps {
  offer: DuffelOffer;
  onSelectVariant: (variant: FareVariant) => void;
}

/* ── Cabin class 3D theme system ────────────────────── */
const CABIN_THEMES: Record<string, {
  gradient: string; accent: string; label: string;
  icon: typeof Ticket; glow: string; watermarkOpacity: string;
  chipActive: string; badgeBorder: string; cabinImage: string;
}> = {
  economy: {
    gradient: "from-slate-400/6 to-slate-300/3",
    accent: "hsl(var(--foreground))",
    label: "Economy",
    icon: Briefcase,
    glow: "hsl(var(--foreground)/0.05)",
    watermarkOpacity: "opacity-[0.03]",
    chipActive: "border-[hsl(var(--flights))]/30 text-[hsl(var(--flights))]",
    badgeBorder: "border-border/30",
    cabinImage: cabinEconomy,
  },
  premium_economy: {
    gradient: "from-amber-400/8 to-orange-300/4",
    accent: "hsl(38 92% 50%)",
    label: "Premium Economy",
    icon: Sparkles,
    glow: "hsl(38 92% 50%/0.12)",
    watermarkOpacity: "opacity-[0.04]",
    chipActive: "border-amber-400/40 text-amber-600 dark:text-amber-400",
    badgeBorder: "border-amber-400/25",
    cabinImage: cabinPremiumEconomy,
  },
  business: {
    gradient: "from-indigo-400/10 to-violet-300/5",
    accent: "hsl(230 75% 58%)",
    label: "Business",
    icon: Crown,
    glow: "hsl(230 75% 58%/0.14)",
    watermarkOpacity: "opacity-[0.04]",
    chipActive: "border-indigo-400/40 text-indigo-600 dark:text-indigo-400",
    badgeBorder: "border-indigo-400/25",
    cabinImage: cabinBusiness,
  },
  first: {
    gradient: "from-yellow-400/10 to-amber-300/5",
    accent: "hsl(45 93% 47%)",
    label: "First",
    icon: Gem,
    glow: "hsl(45 93% 47%/0.14)",
    watermarkOpacity: "opacity-[0.05]",
    chipActive: "border-yellow-400/40 text-yellow-600 dark:text-yellow-400",
    badgeBorder: "border-yellow-400/25",
    cabinImage: cabinFirst,
  },
};

function getTheme(cabinClass: string) {
  return CABIN_THEMES[cabinClass] ?? CABIN_THEMES.economy;
}

function formatFareName(name: string | null, cabinClass: string): string {
  if (!name) return getTheme(cabinClass).label;
  if (name.includes("_")) return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return name;
}

function getFareSortRank(variant: FareVariant): number {
  const label = formatFareName(variant.fareBrandName, variant.cabinClass).trim().toLowerCase();

  if (label === "economy" || label.includes("standard") || label.includes("main")) return 0;
  if (label === "basic" || label.includes("basic economy")) return 1;
  if (label.includes("flex") || label.includes("plus") || label.includes("extra")) return 2;
  return 3;
}

/* ── Helpers ────────────────────────────────────────── */
function getCarryOnLabel(v: FareVariant): string {
  const b = v.baggageDetails;
  if (!b.carryOnIncluded) return "No carry-on bag";
  const qty = b.carryOnQuantity > 0 ? `${b.carryOnQuantity} carry-on bag${b.carryOnQuantity > 1 ? "s" : ""}` : "Carry-on bag";
  const w = b.carryOnWeightKg ? ` · ${b.carryOnWeightKg}kg` : b.carryOnWeightLb ? ` · ${b.carryOnWeightLb}lb` : "";
  return `${qty}${w}`;
}
function getCheckedBagLabel(v: FareVariant): string {
  const b = v.baggageDetails;
  if (!b.checkedBagsIncluded) return "No checked bag";
  const qty = b.checkedBagQuantity > 0 ? `${b.checkedBagQuantity} checked bag${b.checkedBagQuantity > 1 ? "s" : ""}` : "Checked bag";
  const w = b.checkedBagWeightKg ? ` · ${b.checkedBagWeightKg}kg` : b.checkedBagWeightLb ? ` · ${b.checkedBagWeightLb}lb` : "";
  return `${qty}${w}`;
}
function getChangeLabel(v: FareVariant): string {
  const c = v.conditions;
  if (!c.changeable) return "Not changeable";
  if (!c.changePenalty || c.changePenalty === 0) return "Changeable";
  return `Change fee ${c.penaltyCurrency} ${c.changePenalty}`;
}
function getRefundLabel(v: FareVariant): string {
  const c = v.conditions;
  if (!c.refundable) return "Not refundable";
  if (!c.refundPenalty || c.refundPenalty === 0) return "Refundable";
  return `Refund fee ${c.penaltyCurrency} ${c.refundPenalty}`;
}

/* ── 3D Feature Row ─────────────────────────────────── */
function FeatureRow({ included, label }: { included: boolean; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-2.5"
      initial={false}
      animate={{ opacity: 1 }}
    >
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-xl shrink-0",
          included ? "bg-[hsl(var(--flights))]/10" : "bg-muted/20"
        )}
        style={{
          boxShadow: included
            ? "0 3px 8px -3px hsl(var(--flights)/0.15), inset 0 1px 0 hsl(var(--background)/0.6)"
            : "inset 0 1px 2px hsl(var(--foreground)/0.04)",
        }}
      >
        {included ? (
          <Check className="h-3.5 w-3.5 text-[hsl(var(--flights))]" />
        ) : (
          <X className="h-3.5 w-3.5 text-muted-foreground/30" />
        )}
      </div>
      <span className={cn(
        "text-[11px] font-medium leading-tight",
        included ? "text-foreground" : "text-muted-foreground/50 line-through decoration-muted-foreground/15"
      )}>
        {label}
      </span>
    </motion.div>
  );
}

/* ── Floating 3D Icon ───────────────────────────────── */
function FloatingIcon3D({ icon: Icon, className, glow, size = "md" }: {
  icon: typeof Ticket; className?: string; glow?: string; size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-8 w-8 rounded-xl", md: "h-11 w-11 rounded-2xl", lg: "h-14 w-14 rounded-2xl" };
  const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };
  return (
    <div
      className={cn("relative flex items-center justify-center", sizes[size], className)}
      style={{
        transform: "perspective(200px) rotateX(6deg) rotateY(-3deg) translateZ(4px)",
        boxShadow: `0 10px 24px -8px ${glow || "hsl(var(--foreground)/0.08)"},
                     0 4px 8px -4px hsl(var(--foreground)/0.05),
                     inset 0 1.5px 0 hsl(var(--background)/0.7),
                     inset 0 -0.5px 0 hsl(var(--foreground)/0.06)`,
      }}
    >
      <Icon className={iconSizes[size]} />
      {/* Inner shine */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export function FareVariantsCard({ offer, onSelectVariant }: FareVariantsCardProps) {
  const variants = offer.fareVariants;
  const [selectedId, setSelectedId] = useState<string>(offer.id);
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const cabinClasses = useMemo(() => [...new Set(variants?.map((v) => v.cabinClass) ?? [])], [variants]);
  const hasMultipleCabins = cabinClasses.length > 1;

  const filteredVariants = useMemo(
    () => ((cabinFilter ? variants?.filter((v) => v.cabinClass === cabinFilter) : variants) ?? [])
      .slice()
      .sort((a, b) => {
        const rankDiff = getFareSortRank(a) - getFareSortRank(b);
        if (rankDiff !== 0) return rankDiff;

        const priceDiff = (a.pricePerPerson ?? a.price) - (b.pricePerPerson ?? b.price);
        if (priceDiff !== 0) return priceDiff;
        return formatFareName(a.fareBrandName, a.cabinClass).localeCompare(formatFareName(b.fareBrandName, b.cabinClass));
      }),
    [variants, cabinFilter]
  );

  const cheapestPrice = useMemo(
    () => (filteredVariants.length ? Math.min(...filteredVariants.map((v) => v.pricePerPerson ?? v.price)) : 0),
    [filteredVariants]
  );

  useEffect(() => { setSelectedId(offer.id); }, [offer.id]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setCanScrollLeft(node.scrollLeft > 4);
      setCanScrollRight(node.scrollLeft < max - 4);
      // Track active card index for dots
      const cardWidth = node.scrollWidth / (filteredVariants.length || 1);
      setActiveIndex(Math.round(node.scrollLeft / cardWidth));
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { node.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [filteredVariants]);

  if (!variants || variants.length === 0) return null;

  const handleSelect = (variant: FareVariant) => {
    setSelectedId(variant.id);
    onSelectVariant(variant);
  };

  const scrollByCards = (dir: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: dir === "left" ? -Math.max(node.clientWidth * 0.78, 220) : Math.max(node.clientWidth * 0.78, 220), behavior: "smooth" });
  };

  return (
    <section aria-label="Fare options" className="relative">
      {/* ── Header with deep 3D icon ───────────────── */}
      <div className="mb-4 flex items-center gap-3">
        <FloatingIcon3D
          icon={Ticket}
          className="bg-gradient-to-br from-[hsl(var(--flights))]/15 to-[hsl(var(--flights))]/5 text-[hsl(var(--flights))]"
          glow="hsl(var(--flights)/0.25)"
        />
        <div className="flex-1">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[hsl(var(--flights))]">
            Fare Options
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium">
            Compare and select your cabin
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 rounded-2xl border border-[hsl(var(--flights))]/15 px-3 py-1.5"
          style={{
            background: "linear-gradient(135deg, hsl(var(--flights)/0.06), transparent)",
            boxShadow: "0 4px 12px -4px hsl(var(--flights)/0.12), inset 0 1px 0 hsl(var(--background)/0.5)",
            transform: "perspective(300px) rotateX(3deg)",
          }}
        >
          <Plane className="h-3 w-3 text-[hsl(var(--flights))]/70" />
          <span className="text-[11px] font-black text-[hsl(var(--flights))] tabular-nums">{variants.length}</span>
          <span className="text-[9px] text-[hsl(var(--flights))]/50 font-medium">available</span>
        </motion.div>
      </div>

      {/* ── 3D Cabin filter chips ──────────────────── */}
      {hasMultipleCabins && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[{ key: null, label: `All (${variants.length})`, icon: Ticket }, ...cabinClasses.map((c) => ({
            key: c,
            label: `${getTheme(c).label} (${variants.filter((v) => v.cabinClass === c).length})`,
            icon: getTheme(c).icon,
          }))].map(({ key, label, icon: ChipIcon }) => {
            const isActive = cabinFilter === key;
            const theme = key ? getTheme(key) : null;
            return (
              <motion.button
                key={key ?? "all"}
                type="button"
                whileTap={{ scale: 0.93 }}
                onClick={() => setCabinFilter(key === cabinFilter ? null : key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-[10px] font-bold transition-all duration-200",
                  isActive
                    ? (theme?.chipActive ?? "border-[hsl(var(--flights))]/30 text-[hsl(var(--flights))]")
                    : "border-border/15 bg-background text-muted-foreground/70 hover:border-border/30"
                )}
                style={{
                  background: isActive
                    ? `linear-gradient(145deg, ${theme?.glow ?? "hsl(var(--flights)/0.08)"}, transparent 70%)`
                    : undefined,
                  boxShadow: isActive
                    ? `0 6px 16px -6px ${theme?.glow ?? "hsl(var(--flights)/0.15)"},
                       inset 0 1px 0 hsl(var(--background)/0.6)`
                    : "0 2px 6px -3px hsl(var(--foreground)/0.06), inset 0 1px 0 hsl(var(--background)/0.4)",
                  transform: "perspective(400px) rotateX(3deg)",
                }}
              >
                <ChipIcon className="h-3 w-3" />
                {label}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Scrollable 3D fare cards ───────────────── */}
      <div
        ref={scrollerRef}
        className="flex gap-3.5 overflow-x-auto pb-4 pr-4 snap-x snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {filteredVariants.map((variant, index) => {
          const isSelected = variant.id === selectedId;
          const fareName = formatFareName(variant.fareBrandName, variant.cabinClass);
          const perPerson = variant.pricePerPerson ?? variant.price;
          const allInPerPerson = getAllInPrice(perPerson);
          const cheapestAllIn = filteredVariants.length
            ? Math.min(...filteredVariants.map((v) => getAllInPrice(v.pricePerPerson ?? v.price)))
            : 0;
          const priceDelta = allInPerPerson - cheapestAllIn;
          const theme = getTheme(variant.cabinClass);
          const CabinIcon = theme.icon;

          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: index * 0.09, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="w-[78vw] min-w-[240px] max-w-[276px] snap-center flex-none"
            >
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden rounded-3xl border-[1.5px] transition-all duration-300",
                  isSelected
                    ? "border-[hsl(var(--flights))]/40"
                    : "border-border/20 hover:border-border/40"
                )}
                onClick={() => handleSelect(variant)}
                style={{
                  boxShadow: isSelected
                    ? `0 24px 48px -16px ${theme.glow},
                       0 12px 20px -8px hsl(var(--foreground)/0.05),
                       0 0 0 1px hsl(var(--flights)/0.08),
                       inset 0 1.5px 0 hsl(var(--background)/0.8),
                       inset 0 -1px 0 hsl(var(--foreground)/0.03)`
                    : `0 16px 32px -18px hsl(var(--foreground)/0.1),
                       0 4px 8px -4px hsl(var(--foreground)/0.03),
                       inset 0 1.5px 0 hsl(var(--background)/0.7)`,
                  transform: isSelected
                    ? "perspective(600px) rotateX(0deg) translateY(-3px)"
                    : "perspective(600px) rotateX(1.5deg)",
                }}
              >
                {/* ── Background layers ─────────────── */}
                <div className="absolute inset-0 bg-background" />

                {/* Cabin seat photo strip */}
                <div className="absolute inset-x-0 top-0 h-24 overflow-hidden">
                  <img
                    src={theme.cabinImage}
                    alt={`${theme.label} cabin`}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Gradient fade to card background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
                  {/* Subtle vignette for depth */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
                </div>

                <div className={cn("absolute inset-0 bg-gradient-to-br", theme.gradient)} />
                <div className={cn("absolute -right-4 -top-4 pointer-events-none", theme.watermarkOpacity)}>
                  <CabinIcon className="h-28 w-28 text-foreground" strokeWidth={0.5} />
                </div>

                {/* Animated shine on selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ x: "-120%", opacity: 0 }}
                      animate={{ x: "200%", opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute inset-0 pointer-events-none z-[2]"
                      style={{
                        background: "linear-gradient(105deg, transparent 30%, hsl(var(--background)/0.3) 45%, hsl(var(--background)/0.5) 50%, hsl(var(--background)/0.3) 55%, transparent 70%)",
                        width: "50%",
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Selection top glow bar */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-3 right-3 top-0 h-[2.5px] rounded-full origin-center z-[3]"
                      style={{
                        background: `linear-gradient(90deg, transparent, hsl(var(--flights)), transparent)`,
                        boxShadow: "0 0 12px 2px hsl(var(--flights)/0.3)",
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* ── Card content ──────────────────── */}
                <div className="relative z-10 flex h-full flex-col p-4 pt-[5.5rem]">
                  {/* Header row */}
                  <div className="mb-4 flex items-start gap-3">
                    <FloatingIcon3D
                      icon={CabinIcon}
                      size="sm"
                      className={cn(
                        "bg-gradient-to-br from-background to-muted/50",
                        variant.cabinClass === "business" && "text-indigo-500",
                        variant.cabinClass === "first" && "text-yellow-500",
                        variant.cabinClass === "premium_economy" && "text-amber-500",
                        variant.cabinClass === "economy" && "text-foreground/70",
                      )}
                      glow={theme.glow}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "inline-block rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] border mb-1.5",
                          theme.badgeBorder,
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${theme.glow}, transparent)`,
                          color: theme.accent,
                        }}
                      >
                        {theme.label}
                      </div>
                      <p className="text-[15px] font-extrabold leading-tight tracking-tight text-foreground truncate">
                        {fareName}
                      </p>
                    </div>

                    {/* Selection check */}
                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, rotate: -120 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 120 }}
                          transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--flights))]"
                          style={{
                            boxShadow: "0 6px 16px -4px hsl(var(--flights)/0.4), inset 0 1px 0 hsl(var(--background)/0.2)",
                          }}
                        >
                          <Check className="h-3.5 w-3.5 text-[hsl(var(--background))]" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Divider */}
                  <div className="mb-3 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

                  {/* Feature rows */}
                  <div className="flex-1 space-y-2.5">
                    <FeatureRow included={variant.conditions.changeable} label={getChangeLabel(variant)} />
                    <FeatureRow included={variant.conditions.refundable} label={getRefundLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.carryOnIncluded} label={getCarryOnLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.checkedBagsIncluded} label={getCheckedBagLabel(variant)} />
                  </div>

                  {/* 3D Baggage summary recessed panel */}
                  <div
                    className="mt-4 rounded-2xl border border-border/15 px-3 py-2.5"
                    style={{
                      background: "linear-gradient(145deg, hsl(var(--muted)/0.3), hsl(var(--muted)/0.1))",
                      boxShadow: `inset 0 2px 4px -1px hsl(var(--foreground)/0.04),
                                   inset 0 -1px 0 hsl(var(--background)/0.5),
                                   0 1px 2px -1px hsl(var(--foreground)/0.02)`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Luggage className="h-3 w-3 text-muted-foreground/50" />
                      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">
                        Duffel baggage summary
                      </p>
                    </div>
                    <p className="text-[11px] font-medium leading-snug text-foreground/80">
                      {variant.baggageIncluded || "Baggage allowance varies by carrier."}
                    </p>
                  </div>

                  {/* 3D Price section */}
                  <div className="mt-4 pt-3 border-t border-border/10">
                    <p className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">
                      per person · all-in
                    </p>
                    <div className="mt-1.5 flex items-end justify-between gap-2">
                      <motion.p
                        key={allInPerPerson}
                        initial={{ scale: 0.95, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "text-[1.7rem] font-black leading-none tabular-nums tracking-tight",
                          isSelected ? "text-[hsl(var(--flights))]" : "text-foreground"
                        )}
                        style={{
                          textShadow: isSelected ? "0 3px 16px hsl(var(--flights)/0.25)" : undefined,
                        }}
                      >
                        US${allInPerPerson.toFixed(2)}
                      </motion.p>
                      {priceDelta > 0 ? (
                        <span
                          className="mb-1 rounded-xl border border-border/15 px-2.5 py-1 text-[9px] font-bold text-muted-foreground tabular-nums"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--muted)/0.3), transparent)",
                            boxShadow: "0 2px 6px -3px hsl(var(--foreground)/0.06)",
                          }}
                        >
                          +US${priceDelta.toFixed(2)}
                        </span>
                      ) : (
                        <span
                          className="mb-1 rounded-xl border border-[hsl(var(--flights))]/15 px-2.5 py-1 text-[9px] font-bold text-[hsl(var(--flights))]"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--flights)/0.08), transparent)",
                            boxShadow: "0 3px 10px -4px hsl(var(--flights)/0.2)",
                          }}
                        >
                          Lowest fare
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground/70 tabular-nums">
                      Base fare US${perPerson.toFixed(2)} before taxes & fees
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Scroll progress dots + arrows ──────────── */}
      {filteredVariants.length > 1 && (
      <div className="mt-1 flex items-center justify-between">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {filteredVariants.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeIndex ? 16 : 5,
                opacity: i === activeIndex ? 1 : 0.3,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "h-[5px] rounded-full",
                i === activeIndex
                  ? "bg-[hsl(var(--flights))]"
                  : "bg-foreground/20"
              )}
              style={{
                boxShadow: i === activeIndex ? "0 2px 6px -1px hsl(var(--flights)/0.3)" : undefined,
              }}
            />
          ))}
        </div>

        {/* 3D Arrow buttons */}
        <div className="flex items-center gap-2">
          {[
            { dir: "left" as const, disabled: !canScrollLeft, icon: ChevronLeft },
            { dir: "right" as const, disabled: !canScrollRight, icon: ChevronRight },
          ].map(({ dir, disabled, icon: ArrowIcon }) => (
            <motion.button
              key={dir}
              type="button"
              whileTap={{ scale: 0.88 }}
              aria-label={`Scroll ${dir}`}
              onClick={() => scrollByCards(dir)}
              disabled={disabled}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl border-[1.5px] transition-all duration-200",
                disabled
                  ? "border-border/10 text-muted-foreground/20 cursor-not-allowed"
                  : "border-border/25 bg-background text-foreground/60 hover:text-foreground/90"
              )}
              style={{
                boxShadow: disabled
                  ? "none"
                  : `0 6px 14px -6px hsl(var(--foreground)/0.08),
                     inset 0 1.5px 0 hsl(var(--background)/0.7),
                     inset 0 -0.5px 0 hsl(var(--foreground)/0.04)`,
                transform: disabled ? undefined : "perspective(300px) rotateX(4deg)",
              }}
            >
              <ArrowIcon className="h-4 w-4" />
            </motion.button>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
