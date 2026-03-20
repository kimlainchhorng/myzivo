import { Minus, Plus, Users, Crown, Plane, Star, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const cabinOptions = [
  { value: "economy", label: "Economy", icon: Plane, desc: "Standard seating" },
  { value: "premium", label: "Premium Economy", icon: Star, desc: "Extra legroom" },
  { value: "business", label: "Business", icon: Crown, desc: "Lie-flat seats" },
  { value: "first", label: "First Class", icon: Gem, desc: "Ultimate luxury" },
] as const;

interface MobilePassengerCabinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passengers: number;
  cabin: string;
  onPassengersChange: (value: number) => void;
  onCabinChange: (value: "economy" | "premium" | "business" | "first") => void;
}

export default function MobilePassengerCabinSheet({
  open,
  onOpenChange,
  passengers,
  cabin,
  onPassengersChange,
  onCabinChange,
}: MobilePassengerCabinSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-0 bg-transparent border-0 shadow-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* 3D Floating Card */}
        <div
          className="mx-3 mb-2 rounded-3xl overflow-hidden animate-scale-in"
          style={{
            background: "hsl(var(--card))",
            boxShadow: `
              0 -2px 0 0 hsl(var(--border) / 0.3),
              0 8px 32px -4px hsl(var(--foreground) / 0.12),
              0 24px 60px -8px hsl(var(--foreground) / 0.08),
              inset 0 1px 0 0 hsl(var(--card) / 0.8)
            `,
            transform: "perspective(800px) rotateX(1deg)",
            transformOrigin: "bottom center",
          }}
        >
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-3 text-left">
            <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                  boxShadow: "0 2px 8px hsl(var(--primary) / 0.3)",
                }}
              >
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              Travelers & Cabin
            </SheetTitle>
          </SheetHeader>

          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

          <div className="space-y-4 px-5 py-4">
            {/* Passenger counter — recessed 3D surface */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "hsl(var(--background))",
                boxShadow: "inset 0 2px 6px hsl(var(--foreground) / 0.04), 0 1px 0 hsl(var(--card))",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Travelers</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Up to 9 passengers</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Decrease travelers"
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.92] touch-manipulation",
                      passengers <= 1
                        ? "bg-muted/50 text-muted-foreground/30"
                        : "text-foreground"
                    )}
                    style={passengers > 1 ? {
                      background: "hsl(var(--background))",
                      boxShadow: "0 2px 6px hsl(var(--foreground) / 0.08), 0 1px 2px hsl(var(--foreground) / 0.06), inset 0 -1px 0 hsl(var(--foreground) / 0.05)",
                    } : undefined}
                    onClick={() => onPassengersChange(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div
                    className="w-12 h-10 flex items-center justify-center text-lg font-bold rounded-xl"
                    style={{
                      background: "hsl(var(--primary) / 0.08)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    {passengers}
                  </div>

                  <button
                    type="button"
                    aria-label="Increase travelers"
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.92] touch-manipulation",
                      passengers >= 9
                        ? "bg-muted/50 text-muted-foreground/30"
                        : "text-foreground"
                    )}
                    style={passengers < 9 ? {
                      background: "hsl(var(--background))",
                      boxShadow: "0 2px 6px hsl(var(--foreground) / 0.08), 0 1px 2px hsl(var(--foreground) / 0.06), inset 0 -1px 0 hsl(var(--foreground) / 0.05)",
                    } : undefined}
                    onClick={() => onPassengersChange(Math.min(9, passengers + 1))}
                    disabled={passengers >= 9}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cabin class — 3D selectable cards */}
            <div>
              <p className="mb-2.5 text-sm font-semibold text-foreground tracking-tight">Cabin class</p>
              <div className="grid grid-cols-2 gap-2">
                {cabinOptions.map((option) => {
                  const isSelected = cabin === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "relative rounded-2xl p-3 text-left transition-all duration-200 active:scale-[0.96] touch-manipulation",
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      )}
                      style={isSelected ? {
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))",
                        boxShadow: "0 4px 14px hsl(var(--primary) / 0.3), 0 1px 3px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--primary-foreground) / 0.15)",
                      } : {
                        background: "hsl(var(--background))",
                        boxShadow: "0 2px 6px hsl(var(--foreground) / 0.06), 0 1px 2px hsl(var(--foreground) / 0.04), inset 0 -1px 0 hsl(var(--foreground) / 0.04)",
                      }}
                      onClick={() => onCabinChange(option.value)}
                    >
                      <Icon className={cn("h-4 w-4 mb-1.5", isSelected ? "text-primary-foreground/90" : "text-muted-foreground")} />
                      <p className="text-sm font-semibold leading-tight">{option.label}</p>
                      <p className={cn("text-[10px] mt-0.5 leading-tight", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Done button with 3D glow */}
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-12 w-full rounded-2xl text-primary-foreground font-semibold text-sm border-0 active:scale-[0.97] transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, hsl(160 84% 39%), hsl(160 84% 45%))",
                boxShadow: "0 4px 14px hsl(160 84% 39% / 0.35), 0 1px 3px hsl(160 84% 39% / 0.2), inset 0 1px 0 hsl(160 84% 60% / 0.3)",
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
