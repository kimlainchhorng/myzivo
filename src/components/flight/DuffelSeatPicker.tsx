/**
 * DuffelSeatPicker — Interactive seat map powered by Duffel API
 * Shows real cabin layout with prices from the airline
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Armchair, Check, X, Plane, ChevronLeft, ChevronRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDuffelSeatMaps, type SeatElement, type SeatMap } from "@/hooks/useDuffelSeatMaps";

interface SelectedSeat {
  designator: string;
  serviceId: string;
  passengerId: string;
  price: number;
  currency: string;
}

interface DuffelSeatPickerProps {
  offerId: string | null;
  passengerIds: string[];
  className?: string;
  onSeatsSelected?: (seats: SelectedSeat[]) => void;
}

export default function DuffelSeatPicker({
  offerId,
  passengerIds,
  className,
  onSeatsSelected,
}: DuffelSeatPickerProps) {
  const { data, isLoading, error } = useDuffelSeatMaps(offerId);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);
  const [activePassengerIdx, setActivePassengerIdx] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<Map<string, SelectedSeat>>(new Map());

  const seatMaps = data?.seat_maps || [];
  const available = data?.available ?? false;
  const activeSeatMap = seatMaps[activeSegmentIdx];

  // Get all seat elements with their prices for the active passenger
  const seatInfo = useMemo(() => {
    if (!activeSeatMap) return { rows: [], minPrice: 0, maxPrice: 0 };
    const passengerId = passengerIds[activePassengerIdx];
    const allSeats: { designator: string; price: number; currency: string; serviceId: string }[] = [];

    for (const cabin of activeSeatMap.cabins) {
      for (const row of cabin.rows) {
        for (const section of row.sections) {
          for (const el of section.elements) {
            if (el.type === "seat" && el.is_available) {
              const svc = el.available_services.find(s => s.passenger_id === passengerId);
              if (svc) {
                allSeats.push({
                  designator: el.designator!,
                  price: svc.price,
                  currency: svc.currency,
                  serviceId: svc.id,
                });
              }
            }
          }
        }
      }
    }

    const prices = allSeats.map(s => s.price);
    return {
      rows: allSeats,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
    };
  }, [activeSeatMap, passengerIds, activePassengerIdx]);

  const handleSeatClick = (element: SeatElement) => {
    if (!element.is_available || !element.designator) return;
    const passengerId = passengerIds[activePassengerIdx];
    const svc = element.available_services.find(s => s.passenger_id === passengerId);
    if (!svc) return;

    const key = `${activeSegmentIdx}-${passengerId}`;
    const newMap = new Map(selectedSeats);
    const existing = newMap.get(key);

    if (existing?.designator === element.designator) {
      newMap.delete(key);
    } else {
      newMap.set(key, {
        designator: element.designator,
        serviceId: svc.id,
        passengerId: svc.passenger_id,
        price: svc.price,
        currency: svc.currency,
      });
    }

    setSelectedSeats(newMap);
    onSeatsSelected?.(Array.from(newMap.values()));

    // Auto-advance to next passenger if available
    if (!existing && activePassengerIdx < passengerIds.length - 1) {
      setTimeout(() => setActivePassengerIdx(prev => prev + 1), 300);
    }
  };

  const getSelectedForSegmentPassenger = () => {
    const key = `${activeSegmentIdx}-${passengerIds[activePassengerIdx]}`;
    return selectedSeats.get(key);
  };

  const totalSeatCost = useMemo(() => {
    return Array.from(selectedSeats.values()).reduce((sum, s) => sum + s.price, 0);
  }, [selectedSeats]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-border/30 bg-card/50 p-6", className)}>
        <div className="flex items-center gap-3 justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--flights))]" />
          <p className="text-sm text-muted-foreground">Loading seat map...</p>
        </div>
      </div>
    );
  }

  // Not available
  if (error || !available || seatMaps.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border/30 bg-card/50 p-5", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
            <Armchair className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Seat Selection</p>
            <p className="text-xs text-muted-foreground">
              Seat selection is not available for this flight. You can choose your seat after booking through the airline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSel = getSelectedForSegmentPassenger();

  return (
    <div className={cn("rounded-2xl border border-[hsl(var(--flights))]/20 bg-card overflow-hidden", className)}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-border/20"
        style={{ background: "hsl(var(--flights) / 0.04)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Armchair className="w-4.5 h-4.5 text-[hsl(var(--flights))]" />
            <span className="text-sm font-bold">Choose Your Seat</span>
          </div>
          {totalSeatCost > 0 && (
            <Badge className="bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-0 text-xs font-bold">
              +${totalSeatCost.toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Segment tabs (if multiple flights) */}
        {seatMaps.length > 1 && (
          <div className="flex gap-1.5 mt-2">
            {seatMaps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSegmentIdx(idx)}
                className={cn(
                  "text-[10px] font-medium px-2.5 py-1 rounded-full transition-all",
                  idx === activeSegmentIdx
                    ? "bg-[hsl(var(--flights))] text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                Flight {idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Passenger selector */}
        {passengerIds.length > 1 && (
          <div className="flex gap-1.5 mt-2">
            {passengerIds.map((_, idx) => {
              const key = `${activeSegmentIdx}-${passengerIds[idx]}`;
              const hasSeat = selectedSeats.has(key);
              return (
                <button
                  key={idx}
                  onClick={() => setActivePassengerIdx(idx)}
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-1 rounded-full transition-all flex items-center gap-1",
                    idx === activePassengerIdx
                      ? "bg-[hsl(var(--flights))]/15 text-[hsl(var(--flights))] border border-[hsl(var(--flights))]/30"
                      : "bg-muted/20 text-muted-foreground",
                    hasSeat && "ring-1 ring-emerald-400/50"
                  )}
                >
                  {hasSeat && <Check className="w-2.5 h-2.5 text-emerald-500" />}
                  Passenger {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Seat Map */}
      <div className="px-3 py-4 overflow-x-auto">
        {activeSeatMap?.cabins.map((cabin, cabinIdx) => (
          <div key={cabinIdx} className="mb-4 last:mb-0">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-2">
              {cabin.cabin_class.replace("_", " ")}
            </p>

            {/* Column labels */}
            {cabin.rows[0] && (
              <div className="flex justify-center gap-0 mb-1.5">
                {cabin.rows[0].sections.map((section, sIdx) => (
                  <div key={sIdx} className="flex gap-[3px]">
                    {sIdx > 0 && <div className="w-5" />}
                    {section.elements.map((el, eIdx) => (
                      <div key={eIdx} className="w-8 text-center">
                        <span className="text-[8px] font-bold text-muted-foreground/50">
                          {el.designator?.replace(/\d/g, "") || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Rows */}
            <div className="space-y-[3px]">
              {cabin.rows.map((row, rowIdx) => {
                const rowNum = row.sections[0]?.elements[0]?.designator?.replace(/\D/g, "") || String(rowIdx + 1);
                const isWingRow = rowIdx >= cabin.wings.first_row_index && rowIdx <= cabin.wings.last_row_index;

                return (
                  <div key={rowIdx} className="flex items-center justify-center gap-0">
                    {/* Row number */}
                    <span className="text-[8px] text-muted-foreground/50 w-4 text-right mr-1 tabular-nums shrink-0">
                      {rowNum}
                    </span>

                    {row.sections.map((section, sIdx) => (
                      <div key={sIdx} className="flex gap-[3px]">
                        {/* Aisle gap */}
                        {sIdx > 0 && <div className="w-5 flex items-center justify-center">
                          {isWingRow && <div className="w-px h-4 bg-muted-foreground/10" />}
                        </div>}
                        {section.elements.map((el, eIdx) => {
                          const passId = passengerIds[activePassengerIdx];
                          const svc = el.available_services.find(s => s.passenger_id === passId);
                          const isSelected = currentSel?.designator === el.designator;
                          const isOtherPassengerSeat = Array.from(selectedSeats.values()).some(
                            s => s.designator === el.designator && s.passengerId !== passId
                          );

                          if (el.type === "empty") {
                            return <div key={eIdx} className="w-8 h-8" />;
                          }

                          if (el.type !== "seat") {
                            return (
                              <div key={eIdx} className="w-8 h-8 flex items-center justify-center">
                                {el.type === "lavatory" && <span className="text-[8px]">🚻</span>}
                                {el.type === "galley" && <span className="text-[8px]">🍽</span>}
                                {el.type === "exit_row" && <span className="text-[8px] text-amber-500">⇥</span>}
                              </div>
                            );
                          }

                          const isFree = svc && svc.price === 0;
                          const isAvail = el.is_available && svc && !isOtherPassengerSeat;

                          return (
                            <motion.button
                              key={eIdx}
                              whileTap={isAvail ? { scale: 0.9 } : undefined}
                              onClick={() => isAvail && handleSeatClick(el)}
                              disabled={!isAvail}
                              className={cn(
                                "w-8 h-8 rounded-md text-[8px] font-bold transition-all flex items-center justify-center relative",
                                isSelected
                                  ? "bg-[hsl(var(--flights))] text-primary-foreground shadow-md ring-2 ring-[hsl(var(--flights))]/30"
                                  : isOtherPassengerSeat
                                    ? "bg-emerald-500/20 text-emerald-600 border border-emerald-400/30"
                                    : isAvail
                                      ? isFree
                                        ? "bg-muted/30 border border-border/30 text-muted-foreground hover:border-[hsl(var(--flights))]/40 hover:bg-[hsl(var(--flights))]/5"
                                        : "bg-muted/20 border border-border/40 text-foreground hover:border-[hsl(var(--flights))]/40 hover:bg-[hsl(var(--flights))]/5"
                                      : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                              )}
                              title={
                                el.designator
                                  ? `${el.designator}${svc ? ` - $${svc.price}` : " - Unavailable"}`
                                  : ""
                              }
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : isOtherPassengerSeat ? (
                                <span className="text-[7px]">P{Array.from(selectedSeats.entries()).findIndex(([, v]) => v.designator === el.designator) + 1}</span>
                              ) : !isAvail ? (
                                <X className="w-3 h-3" />
                              ) : (
                                <span className="tabular-nums">
                                  {isFree ? "Free" : `$${svc!.price}`}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    ))}

                    {/* Wing indicator */}
                    {isWingRow && (
                      <span className="text-[7px] text-muted-foreground/30 ml-1">✈</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend + Selection Summary */}
      <div className="px-4 py-3 border-t border-border/20 bg-muted/10 space-y-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/20 border border-border/40" /> Available
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-[hsl(var(--flights))]" /> Selected
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted/10 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-muted-foreground/30" />
            </div> Taken
          </span>
        </div>

        {/* Selected seats summary */}
        {selectedSeats.size > 0 && (
          <div className="space-y-1">
            {Array.from(selectedSeats.entries()).map(([key, seat]) => {
              const [segIdx] = key.split("-");
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {seatMaps.length > 1 ? `Flight ${Number(segIdx) + 1} · ` : ""}
                    Seat {seat.designator}
                  </span>
                  <span className="font-bold tabular-nums text-[hsl(var(--flights))]">
                    {seat.price === 0 ? "Free" : `+$${seat.price.toFixed(2)}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[9px] text-muted-foreground/60">
          Seat selection is optional. Seats will be assigned at check-in if not selected.
        </p>
      </div>
    </div>
  );
}
