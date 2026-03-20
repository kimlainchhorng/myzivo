/**
 * Fare Variants Card — lets user pick between fare brands (Basic Economy, Main Cabin, Business, etc.)
 * Uses real Duffel fareVariants data from the selected offer.
 * Supports multi-cabin filtering when Business/First/Premium Economy are available.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Ticket, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

type FareVariant = NonNullable<DuffelOffer["fareVariants"]>[number];

interface FareVariantsCardProps {
  offer: DuffelOffer;
  onSelectVariant: (variant: FareVariant) => void;
}

/* ── Cabin class styling ────────────────────────────── */
const CABIN_STYLES: Record<string, { bg: string; text: string; border: string; label: string; badgeBg: string }> = {
  economy:         { bg: "bg-muted/30",        text: "text-foreground",    border: "border-border/40",        label: "Economy",         badgeBg: "bg-muted/40" },
  premium_economy: { bg: "bg-amber-500/10",    text: "text-amber-700",    border: "border-amber-400/30",     label: "Premium Economy", badgeBg: "bg-amber-500/10" },
  business:        { bg: "bg-indigo-500/10",   text: "text-indigo-700",   border: "border-indigo-400/30",    label: "Business",        badgeBg: "bg-indigo-500/10" },
  first:           { bg: "bg-yellow-500/10",   text: "text-yellow-700",   border: "border-yellow-500/30",    label: "First",           badgeBg: "bg-yellow-500/10" },
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

/* ── Feature row ────────────────────────────────────── */
function FeatureRow({ included, label }: { included: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px] leading-tight">
      {included ? (
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--flights))]" />
      ) : (
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      )}
      <span className={cn(included ? "text-foreground" : "text-muted-foreground/70")}>{label}</span>
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

  // Unique cabin classes
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
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[hsl(var(--flights))]/10">
          <Ticket className="h-3.5 w-3.5 text-[hsl(var(--flights))]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--flights))]">Fare Options</p>
        <Badge variant="secondary" className="ml-auto h-4 px-1.5 py-0 text-[8px]">
          {variants.length} available
        </Badge>
      </div>

      {/* Cabin class filter chips (only when multiple cabin classes exist) */}
      {hasMultipleCabins && (
        <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCabinFilter(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors active:scale-95",
              !cabinFilter
                ? "border-[hsl(var(--flights))] bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]"
                : "border-border/30 bg-background text-muted-foreground hover:border-border/60"
            )}
          >
            All ({variants.length})
          </button>
          {cabinClasses.map((cabin) => {
            const style = getCabinStyle(cabin);
            const count = variants.filter((v) => v.cabinClass === cabin).length;
            const isActive = cabinFilter === cabin;
            return (
              <button
                key={cabin}
                type="button"
                onClick={() => setCabinFilter(isActive ? null : cabin)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors active:scale-95",
                  isActive
                    ? cn(style.border, style.bg, style.text)
                    : "border-border/30 bg-background text-muted-foreground hover:border-border/60"
                )}
              >
                {style.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollable fare cards */}
      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pb-2.5 pr-3 snap-x snap-proximity"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {filteredVariants.map((variant, index) => {
          const isSelected = variant.id === selectedId;
          const fareName = formatFareName(variant.fareBrandName, variant.cabinClass);
          const priceDelta = variant.price - cheapestPrice;
          const cabinStyle = getCabinStyle(variant.cabinClass);

          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-[82vw] min-w-[240px] max-w-[288px] snap-start flex-none"
            >
              <Card
                className={cn(
                  "relative h-full cursor-pointer overflow-hidden border transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.98]",
                  isSelected
                    ? "border-[hsl(var(--flights))] ring-1 ring-[hsl(var(--flights))]/20"
                    : "border-border/40 hover:border-border/70"
                )}
                onClick={() => handleSelect(variant)}
                style={{
                  boxShadow: isSelected
                    ? "0 14px 28px -18px hsl(var(--flights)/0.35), 0 2px 8px -4px hsl(var(--foreground)/0.08)"
                    : "0 10px 24px -22px hsl(var(--foreground)/0.28), 0 1px 4px -2px hsl(var(--foreground)/0.06)",
                }}
              >
                {isSelected && <div className="absolute left-0 right-0 top-0 h-[3px] bg-[hsl(var(--flights))]" />}

                <CardContent className="flex h-full flex-col p-3.5">
                  {/* Cabin class badge + fare name */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <Badge className={cn("mb-1.5 text-[9px] font-bold uppercase tracking-wider border", cabinStyle.badgeBg, cabinStyle.text, cabinStyle.border)}>
                        {cabinStyle.label}
                      </Badge>
                      <p className="text-lg font-extrabold leading-none tracking-tight">{fareName}</p>
                    </div>

                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.82 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.82 }}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--flights))]"
                        >
                          <Check className="h-3 w-3 text-[hsl(var(--background))]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2.5">
                    <FeatureRow included={variant.conditions.changeable} label={getChangeLabel(variant)} />
                    <FeatureRow included={variant.conditions.refundable} label={getRefundLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.carryOnIncluded} label={getCarryOnLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.checkedBagsIncluded} label={getCheckedBagLabel(variant)} />
                  </div>

                  {/* Baggage summary */}
                  <div className="mt-3 rounded-xl border border-border/25 bg-muted/20 px-2.5 py-2">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Duffel baggage summary</p>
                    <p className="mt-1 text-[11px] leading-tight text-foreground/90">
                      {variant.baggageIncluded || "Baggage allowance varies by carrier."}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-3 border-t border-border/20 pt-3">
                    <p className="text-[9px] text-muted-foreground">total amount from</p>
                    <div className="mt-0.5 flex items-end justify-between gap-2">
                      <p className={cn(
                        "text-[1.6rem] font-extrabold leading-none tabular-nums tracking-tight",
                        isSelected ? "text-[hsl(var(--flights))]" : "text-foreground"
                      )}>
                        US${variant.price.toFixed(2)}
                      </p>
                      {priceDelta > 0 ? (
                        <Badge variant="outline" className="border-border/30 bg-muted/20 text-[9px] font-semibold mb-0.5">
                          +US${priceDelta.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge className="bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border border-[hsl(var(--flights))]/20 text-[9px] font-semibold mb-0.5">
                          Lowest fare
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll controls */}
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">Swipe or use arrows to compare fare brands.</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Scroll fare options left"
            onClick={() => scrollByCards("left")}
            disabled={!canScrollLeft}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border/30 bg-background text-muted-foreground transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Scroll fare options right"
            onClick={() => scrollByCards("right")}
            disabled={!canScrollRight}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border/30 bg-background text-muted-foreground transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
