/**
 * Fare Variants Card — Premium 3D Spatial UI for fare brand selection
 * Glassmorphic depth cards with 3D icons, perspective transforms, and tactile interaction
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Ticket, X, Briefcase, ShieldCheck, ArrowLeftRight, Luggage, Sparkles, Crown, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

type FareVariant = NonNullable<DuffelOffer["fareVariants"]>[number];

interface FareVariantsCardProps {
  offer: DuffelOffer;
  onSelectVariant: (variant: FareVariant) => void;
}

/* ── Cabin class styling with 3D depth ──────────────── */
const CABIN_STYLES: Record<string, {
  gradient: string; text: string; border: string; label: string;
  badgeGradient: string; icon: typeof Ticket; glow: string; bgPattern: string;
}> = {
  economy: {
    gradient: "from-slate-500/8 via-slate-400/4 to-transparent",
    text: "text-foreground",
    border: "border-border/40",
    label: "Economy",
    badgeGradient: "from-slate-500/15 to-slate-400/10",
    icon: Briefcase,
    glow: "hsl(var(--foreground)/0.06)",
    bgPattern: "radial-gradient(circle at 85% 15%, hsl(var(--foreground)/0.03) 0%, transparent 50%)",
  },
  premium_economy: {
    gradient: "from-amber-500/12 via-orange-400/6 to-transparent",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-400/30",
    label: "Premium Economy",
    badgeGradient: "from-amber-500/20 to-orange-400/10",
    icon: Sparkles,
    glow: "hsl(40 90% 50%/0.12)",
    bgPattern: "radial-gradient(circle at 85% 15%, hsl(40 90% 50%/0.06) 0%, transparent 50%)",
  },
  business: {
    gradient: "from-indigo-500/12 via-blue-400/6 to-transparent",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-400/30",
    label: "Business",
    badgeGradient: "from-indigo-500/20 to-blue-400/10",
    icon: Crown,
    glow: "hsl(230 80% 60%/0.15)",
    bgPattern: "radial-gradient(circle at 85% 15%, hsl(230 80% 60%/0.06) 0%, transparent 50%)",
  },
  first: {
    gradient: "from-yellow-500/12 via-amber-400/6 to-transparent",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30",
    label: "First",
    badgeGradient: "from-yellow-500/20 to-amber-400/10",
    icon: Gem,
    glow: "hsl(45 95% 50%/0.15)",
    bgPattern: "radial-gradient(circle at 85% 15%, hsl(45 95% 50%/0.06) 0%, transparent 50%)",
  },
};

function getCabinStyle(cabinClass: string) {
  return CABIN_STYLES[cabinClass] ?? CABIN_STYLES.economy;
}

function formatCabinClass(cabinClass: string): string {
  return getCabinStyle(cabinClass).label;
}

function formatFareName(name: string | null, cabinClass: string): string {
  if (!name) return formatCabinClass(cabinClass);
  if (name.includes("_")) {
    return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return name;
}

/* ── Baggage / condition helpers ────────────────────── */
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

/* ── 3D Feature row with icon ──────────────────────── */
function FeatureRow({ included, label, icon: Icon }: { included: boolean; label: string; icon?: typeof Check }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] leading-tight">
      <div className={cn(
        "flex h-6 w-6 items-center justify-center rounded-lg shrink-0 transition-colors",
        included
          ? "bg-[hsl(var(--flights))]/10"
          : "bg-muted/30"
      )}>
        {included ? (
          <Check className="h-3 w-3 text-[hsl(var(--flights))]" />
        ) : (
          <X className="h-3 w-3 text-muted-foreground/40" />
        )}
      </div>
      <span className={cn(
        "font-medium",
        included ? "text-foreground" : "text-muted-foreground/60 line-through decoration-muted-foreground/20"
      )}>
        {label}
      </span>
    </div>
  );
}

/* ── 3D Icon Component ─────────────────────────────── */
function Icon3D({ icon: Icon, className, glow }: { icon: typeof Ticket; className?: string; glow?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-2xl",
        className
      )}
      style={{
        transform: "perspective(200px) rotateX(4deg) rotateY(-4deg)",
        boxShadow: `0 8px 20px -6px ${glow || "hsl(var(--foreground)/0.1)"},
                     0 2px 6px -2px hsl(var(--foreground)/0.06),
                     inset 0 1px 0 hsl(var(--background)/0.5)`,
      }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export function FareVariantsCard({ offer, onSelectVariant }: FareVariantsCardProps) {
  const variants = offer.fareVariants;
  const [selectedId, setSelectedId] = useState<string>(offer.id);
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const cabinClasses = useMemo(
    () => [...new Set(variants?.map((v) => v.cabinClass) ?? [])],
    [variants]
  );
  const hasMultipleCabins = cabinClasses.length > 1;

  const filteredVariants = useMemo(
    () => (cabinFilter ? variants?.filter((v) => v.cabinClass === cabinFilter) : variants) ?? [],
    [variants, cabinFilter]
  );

  const cheapestPrice = useMemo(
    () => (filteredVariants.length ? Math.min(...filteredVariants.map((v) => v.price)) : 0),
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
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { node.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [filteredVariants]);

  if (!variants || variants.length <= 1) return null;

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
    <section aria-label="Fare options">
      {/* ── 3D Header ──────────────────────────────── */}
      <div className="mb-3 flex items-center gap-3">
        <Icon3D
          icon={Ticket}
          className="bg-gradient-to-br from-[hsl(var(--flights))]/15 to-[hsl(var(--flights))]/5 text-[hsl(var(--flights))]"
          glow="hsl(var(--flights)/0.2)"
        />
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[hsl(var(--flights))]">
            Fare Options
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">Compare and select your cabin</p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--flights))]/20 bg-[hsl(var(--flights))]/5 px-2.5 py-1"
          style={{
            boxShadow: "0 2px 8px -2px hsl(var(--flights)/0.15), inset 0 1px 0 hsl(var(--background)/0.4)",
          }}
        >
          <span className="text-[10px] font-bold text-[hsl(var(--flights))] tabular-nums">{variants.length}</span>
          <span className="text-[9px] text-[hsl(var(--flights))]/70">available</span>
        </div>
      </div>

      {/* ── 3D Cabin filter chips ──────────────────── */}
      {hasMultipleCabins && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCabinFilter(null)}
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-1.5 text-[10px] font-bold transition-all duration-200",
              !cabinFilter
                ? "border-[hsl(var(--flights))]/30 bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]"
                : "border-border/20 bg-background text-muted-foreground hover:border-border/40"
            )}
            style={{
              boxShadow: !cabinFilter
                ? "0 4px 12px -4px hsl(var(--flights)/0.2), inset 0 1px 0 hsl(var(--background)/0.5)"
                : "0 2px 6px -3px hsl(var(--foreground)/0.08)",
              transform: "perspective(400px) rotateX(2deg)",
            }}
          >
            All ({variants.length})
          </motion.button>
          {cabinClasses.map((cabin) => {
            const style = getCabinStyle(cabin);
            const count = variants.filter((v) => v.cabinClass === cabin).length;
            const isActive = cabinFilter === cabin;
            const CabinIcon = style.icon;
            return (
              <motion.button
                key={cabin}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setCabinFilter(isActive ? null : cabin)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[10px] font-bold transition-all duration-200",
                  isActive
                    ? cn(style.border, style.text)
                    : "border-border/20 bg-background text-muted-foreground hover:border-border/40"
                )}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${style.glow}, transparent)`
                    : undefined,
                  boxShadow: isActive
                    ? `0 4px 12px -4px ${style.glow}, inset 0 1px 0 hsl(var(--background)/0.5)`
                    : "0 2px 6px -3px hsl(var(--foreground)/0.08)",
                  transform: "perspective(400px) rotateX(2deg)",
                }}
              >
                <CabinIcon className="h-3 w-3" />
                {style.label} ({count})
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Scrollable 3D fare cards ───────────────── */}
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-3 pr-3 snap-x snap-proximity"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {filteredVariants.map((variant, index) => {
          const isSelected = variant.id === selectedId;
          const fareName = formatFareName(variant.fareBrandName, variant.cabinClass);
          const priceDelta = variant.price - cheapestPrice;
          const cabinStyle = getCabinStyle(variant.cabinClass);
          const CabinIcon = cabinStyle.icon;

          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)", rotateX: -4 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-[80vw] min-w-[240px] max-w-[280px] snap-start flex-none"
              style={{ perspective: "800px" }}
            >
              <motion.div
                whileTap={{ scale: 0.97, rotateX: 1 }}
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden rounded-2xl border-[1.5px] transition-all duration-300",
                  isSelected
                    ? cn("border-[hsl(var(--flights))]/50", cabinStyle.border)
                    : "border-border/30 hover:border-border/50"
                )}
                onClick={() => handleSelect(variant)}
                style={{
                  background: cabinStyle.bgPattern,
                  boxShadow: isSelected
                    ? `0 20px 40px -16px ${cabinStyle.glow},
                       0 8px 16px -8px hsl(var(--foreground)/0.06),
                       inset 0 1px 0 hsl(var(--background)/0.6),
                       inset 0 -1px 0 hsl(var(--foreground)/0.04)`
                    : `0 12px 28px -18px hsl(var(--foreground)/0.12),
                       0 2px 6px -2px hsl(var(--foreground)/0.04),
                       inset 0 1px 0 hsl(var(--background)/0.6)`,
                  transform: isSelected ? "perspective(600px) rotateX(0deg) translateY(-2px)" : "perspective(600px) rotateX(1deg)",
                }}
              >
                {/* Selection glow bar */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      className="absolute left-2 right-2 top-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[hsl(var(--flights))] to-transparent origin-center"
                    />
                  )}
                </AnimatePresence>

                {/* Glassmorphic background gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-60",
                  cabinStyle.gradient
                )} />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                {/* Card content */}
                <div className="relative z-10 flex h-full flex-col p-4">
                  {/* Header: 3D icon + cabin badge + fare name */}
                  <div className="mb-4 flex items-start gap-3">
                    <Icon3D
                      icon={CabinIcon}
                      className={cn(
                        "bg-gradient-to-br",
                        cabinStyle.badgeGradient,
                        cabinStyle.text
                      )}
                      glow={cabinStyle.glow}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] border mb-1.5",
                        cabinStyle.border, cabinStyle.text
                      )}
                        style={{
                          background: `linear-gradient(135deg, ${cabinStyle.glow}, transparent)`,
                        }}
                      >
                        {cabinStyle.label}
                      </div>
                      <p className="text-base font-extrabold leading-tight tracking-tight text-foreground truncate">
                        {fareName}
                      </p>
                    </div>

                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--flights))]"
                          style={{
                            boxShadow: "0 4px 12px -2px hsl(var(--flights)/0.4)",
                          }}
                        >
                          <Check className="h-3.5 w-3.5 text-[hsl(var(--background))]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Features with 3D icon boxes */}
                  <div className="flex-1 space-y-2">
                    <FeatureRow included={variant.conditions.changeable} label={getChangeLabel(variant)} icon={ArrowLeftRight} />
                    <FeatureRow included={variant.conditions.refundable} label={getRefundLabel(variant)} icon={ShieldCheck} />
                    <FeatureRow included={variant.baggageDetails.carryOnIncluded} label={getCarryOnLabel(variant)} icon={Briefcase} />
                    <FeatureRow included={variant.baggageDetails.checkedBagsIncluded} label={getCheckedBagLabel(variant)} icon={Luggage} />
                  </div>

                  {/* 3D Baggage summary panel */}
                  <div
                    className="mt-3 rounded-xl border border-border/20 px-3 py-2.5"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--muted)/0.4), hsl(var(--muted)/0.15))",
                      boxShadow: "inset 0 1px 0 hsl(var(--background)/0.5), 0 2px 4px -2px hsl(var(--foreground)/0.04)",
                    }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
                      Duffel baggage summary
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-foreground/85">
                      {variant.baggageIncluded || "Baggage allowance varies by carrier."}
                    </p>
                  </div>

                  {/* 3D Price section */}
                  <div className="mt-3 pt-3 border-t border-border/15">
                    <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                      total amount from
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p
                        className={cn(
                          "text-2xl font-black leading-none tabular-nums tracking-tight",
                          isSelected ? "text-[hsl(var(--flights))]" : "text-foreground"
                        )}
                        style={{
                          textShadow: isSelected ? `0 2px 12px hsl(var(--flights)/0.2)` : undefined,
                        }}
                      >
                        US${variant.price.toFixed(2)}
                      </p>
                      {priceDelta > 0 ? (
                        <span
                          className="mb-0.5 rounded-lg border border-border/20 bg-muted/30 px-2 py-0.5 text-[9px] font-bold text-muted-foreground tabular-nums"
                          style={{ boxShadow: "0 1px 3px -1px hsl(var(--foreground)/0.06)" }}
                        >
                          +US${priceDelta.toFixed(2)}
                        </span>
                      ) : (
                        <span
                          className="mb-0.5 rounded-lg border border-[hsl(var(--flights))]/20 bg-[hsl(var(--flights))]/8 px-2 py-0.5 text-[9px] font-bold text-[hsl(var(--flights))]"
                          style={{ boxShadow: "0 2px 6px -2px hsl(var(--flights)/0.15)" }}
                        >
                          Lowest fare
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 3D Scroll controls ─────────────────────── */}
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground/60 font-medium">
          Swipe to compare fares
        </p>
        <div className="flex items-center gap-2">
          {[
            { dir: "left" as const, disabled: !canScrollLeft, icon: ChevronLeft },
            { dir: "right" as const, disabled: !canScrollRight, icon: ChevronRight },
          ].map(({ dir, disabled, icon: ArrowIcon }) => (
            <motion.button
              key={dir}
              type="button"
              whileTap={{ scale: 0.9 }}
              aria-label={`Scroll fare options ${dir}`}
              onClick={() => scrollByCards(dir)}
              disabled={disabled}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200",
                disabled
                  ? "border-border/15 bg-muted/10 text-muted-foreground/25 cursor-not-allowed"
                  : "border-border/30 bg-background text-foreground/70 hover:border-border/50"
              )}
              style={{
                boxShadow: disabled
                  ? "none"
                  : "0 4px 10px -4px hsl(var(--foreground)/0.08), inset 0 1px 0 hsl(var(--background)/0.6)",
                transform: "perspective(300px) rotateX(3deg)",
              }}
            >
              <ArrowIcon className="h-4 w-4" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
