/**
 * Fare Variants Card — lets user pick between fare brands (Basic Economy, Main Cabin, etc.)
 * Uses real Duffel fareVariants data from the selected offer.
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

const CABIN_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  economy: { bg: "bg-muted/30", text: "text-foreground", border: "border-border/40", label: "Economy" },
  premium_economy: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-400/30", label: "Premium Economy" },
  business: { bg: "bg-indigo-500/10", text: "text-indigo-700", border: "border-indigo-400/30", label: "Business" },
  first: { bg: "bg-yellow-500/10", text: "text-yellow-700", border: "border-yellow-500/30", label: "First" },
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

function getCarryOnLabel(variant: FareVariant): string {
  const bag = variant.baggageDetails;
  if (!bag.carryOnIncluded) return "No carry-on bag";
  const qty = bag.carryOnQuantity > 0 ? `${bag.carryOnQuantity} carry-on bag${bag.carryOnQuantity > 1 ? "s" : ""}` : "Carry-on bag";
  const weight = bag.carryOnWeightKg ? ` · ${bag.carryOnWeightKg}kg` : bag.carryOnWeightLb ? ` · ${bag.carryOnWeightLb}lb` : "";
  return `${qty}${weight}`;
}

function getCheckedBagLabel(variant: FareVariant): string {
  const bag = variant.baggageDetails;
  if (!bag.checkedBagsIncluded) return "No checked bag";
  const qty = bag.checkedBagQuantity > 0 ? `${bag.checkedBagQuantity} checked bag${bag.checkedBagQuantity > 1 ? "s" : ""}` : "Checked bag";
  const weight = bag.checkedBagWeightKg ? ` · ${bag.checkedBagWeightKg}kg` : bag.checkedBagWeightLb ? ` · ${bag.checkedBagWeightLb}lb` : "";
  return `${qty}${weight}`;
}

function getChangeLabel(variant: FareVariant): string {
  const cond = variant.conditions;
  if (!cond.changeable) return "Changes not allowed";
  if (!cond.changePenalty || cond.changePenalty === 0) return "Changes allowed";
  return `Change fee ${cond.penaltyCurrency} ${cond.changePenalty}`;
}

function getRefundLabel(variant: FareVariant): string {
  const cond = variant.conditions;
  if (!cond.refundable) return "Refund not allowed";
  if (!cond.refundPenalty || cond.refundPenalty === 0) return "Refund allowed";
  return `Refund fee ${cond.penaltyCurrency} ${cond.refundPenalty}`;
}

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

export function FareVariantsCard({ offer, onSelectVariant }: FareVariantsCardProps) {
  const variants = offer.fareVariants;
  const [selectedId, setSelectedId] = useState<string>(offer.id);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const cheapestPrice = useMemo(
    () => Math.min(...(variants?.map((variant) => variant.price) ?? [offer.price])),
    [offer.price, variants]
  );

  useEffect(() => {
    setSelectedId(offer.id);
  }, [offer.id]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const updateScrollState = () => {
      const maxScrollLeft = node.scrollWidth - node.clientWidth;
      setCanScrollLeft(node.scrollLeft > 4);
      setCanScrollRight(node.scrollLeft < maxScrollLeft - 4);
    };

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [variants]);

  if (!variants || variants.length <= 1) return null;

  const handleSelect = (variant: FareVariant) => {
    setSelectedId(variant.id);
    onSelectVariant(variant);
  };

  const scrollByCards = (direction: "left" | "right") => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.max(node.clientWidth * 0.78, 220);
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section aria-label="Fare options">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[hsl(var(--flights))]/10">
          <Ticket className="h-3.5 w-3.5 text-[hsl(var(--flights))]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--flights))]">Fare Options</p>
        <Badge variant="secondary" className="ml-auto h-4 px-1.5 py-0 text-[8px]">
          {variants.length} available
        </Badge>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pb-2.5 pr-3 snap-x snap-proximity"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {variants.map((variant, index) => {
          const isSelected = variant.id === selectedId;
          const fareName = formatFareName(variant.fareBrandName, variant.cabinClass);
          const priceDelta = variant.price - cheapestPrice;

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
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {formatCabinClass(variant.cabinClass)}
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold leading-none tracking-tight">{fareName}</p>
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

                  <div className="mb-3 flex items-end justify-between gap-3 border-b border-border/20 pb-3">
                    <div>
                      <p className="text-[9px] text-muted-foreground">Total amount from</p>
                      <p className={cn(
                        "mt-0.5 text-[1.95rem] font-extrabold leading-none tabular-nums tracking-tight",
                        isSelected ? "text-[hsl(var(--flights))]" : "text-foreground"
                      )}>
                        US${variant.price.toFixed(2)}
                      </p>
                    </div>
                    {priceDelta > 0 ? (
                      <Badge variant="outline" className="border-border/30 bg-muted/20 text-[9px] font-semibold">
                        +US${priceDelta.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge className="bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border border-[hsl(var(--flights))]/20 text-[9px] font-semibold">
                        Lowest fare
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <FeatureRow included={variant.conditions.changeable} label={getChangeLabel(variant)} />
                    <FeatureRow included={variant.conditions.refundable} label={getRefundLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.carryOnIncluded} label={getCarryOnLabel(variant)} />
                    <FeatureRow included={variant.baggageDetails.checkedBagsIncluded} label={getCheckedBagLabel(variant)} />
                  </div>

                  <div className="mt-3 rounded-xl border border-border/25 bg-muted/20 px-2.5 py-2">
                    <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Duffel baggage summary</p>
                    <p className="mt-1 text-[11px] leading-tight text-foreground/90">
                      {variant.baggageIncluded || "Baggage allowance varies by carrier."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

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
