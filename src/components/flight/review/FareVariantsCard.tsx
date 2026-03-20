/**
 * Fare Variants Card — lets user pick between fare brands (Basic Economy, Main Cabin, etc.)
 * Uses real Duffel fareVariants data from the selected offer.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Luggage, Briefcase, RefreshCw, ArrowLeftRight, Ticket
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

type FareVariant = NonNullable<DuffelOffer["fareVariants"]>[number];

interface FareVariantsCardProps {
  offer: DuffelOffer;
  onSelectVariant: (variant: FareVariant) => void;
}

function formatFareName(name: string | null, cabinClass: string): string {
  if (!name) return cabinClass.replace("_", " ");
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function FeatureRow({ included, label }: { included: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      {included ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      )}
      <span className={cn(
        "leading-tight",
        included ? "text-foreground" : "text-muted-foreground/60"
      )}>
        {label}
      </span>
    </div>
  );
}

export function FareVariantsCard({ offer, onSelectVariant }: FareVariantsCardProps) {
  const variants = offer.fareVariants;
  if (!variants || variants.length <= 1) return null;

  // Find which variant is currently selected (match by id)
  const [selectedId, setSelectedId] = useState<string>(offer.id);

  const handleSelect = (variant: FareVariant) => {
    setSelectedId(variant.id);
    onSelectVariant(variant);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-[hsl(var(--flights))]/10 flex items-center justify-center">
          <Ticket className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--flights))]">Fare Options</p>
        <Badge variant="secondary" className="text-[8px] ml-auto px-1.5 py-0 h-4">
          {variants.length} available
        </Badge>
      </div>

      {/* Horizontal scrollable fare cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {variants.map((variant, i) => {
          const isSelected = variant.id === selectedId;
          const bag = variant.baggageDetails;
          const cond = variant.conditions;
          const fareName = formatFareName(variant.fareBrandName, variant.cabinClass);

          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="snap-start shrink-0"
              style={{ width: variants.length <= 2 ? "calc(50% - 5px)" : "72%" }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 overflow-hidden relative h-full",
                  isSelected
                    ? "border-[hsl(var(--flights))] shadow-md shadow-[hsl(var(--flights))]/15 ring-1 ring-[hsl(var(--flights))]/30"
                    : "border-border/40 hover:border-border/70 hover:shadow-sm"
                )}
                onClick={() => handleSelect(variant)}
                style={{
                  boxShadow: isSelected
                    ? "0 4px 20px -4px hsl(var(--flights)/0.15), inset 0 1px 0 0 hsl(0 0% 100%/0.06)"
                    : "0 1px 4px -1px hsl(var(--foreground)/0.04), inset 0 1px 0 0 hsl(0 0% 100%/0.04)"
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[hsl(var(--flights))]" />
                )}

                <CardContent className="p-3 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {variant.cabinClass?.replace("_", " ") || "Economy"}
                    </p>
                    <p className="text-sm font-bold mt-0.5 leading-tight">{fareName}</p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 flex-1">
                    <FeatureRow
                      included={!!cond?.changeable}
                      label={cond?.changeable ? "Changeable" : "Not changeable"}
                    />
                    <FeatureRow
                      included={!!cond?.refundable}
                      label={cond?.refundable ? "Refundable" : "Not refundable"}
                    />
                    <FeatureRow
                      included={!!bag?.carryOnIncluded}
                      label={bag?.carryOnIncluded
                        ? `Includes carry-on bags`
                        : "No carry-on bags"
                      }
                    />
                    <FeatureRow
                      included={!!bag?.checkedBagsIncluded}
                      label={bag?.checkedBagsIncluded
                        ? `Includes checked bags${bag.checkedBagWeightKg ? ` (${bag.checkedBagWeightKg}kg)` : ""}`
                        : "No checked bags"
                      }
                    />
                    {cond?.changePenalty != null && cond.changePenalty > 0 && (
                      <div className="text-[9px] text-muted-foreground pl-5.5">
                        Change fee: ${cond.changePenalty} {cond.penaltyCurrency}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 pt-2.5 border-t border-border/20">
                    <p className="text-[9px] text-muted-foreground">total amount from</p>
                    <p className={cn(
                      "text-lg font-extrabold tabular-nums leading-tight mt-0.5",
                      isSelected ? "text-[hsl(var(--flights))]" : "text-foreground"
                    )}>
                      US${variant.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Selected badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-2.5 right-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-[hsl(var(--flights))] flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
