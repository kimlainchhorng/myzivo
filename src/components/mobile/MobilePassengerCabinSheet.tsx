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
          className="mx-3 mb-2 rounded-[28px] overflow-hidden animate-scale-in"
          style={{
            background: "hsl(var(--card))",
            boxShadow: `
              0 -1px 0 0 hsl(var(--border) / 0.15),
              0 12px 40px -6px hsl(var(--foreground) / 0.15),
              0 30px 70px -10px hsl(var(--foreground) / 0.08),
              inset 0 1px 0 0 hsl(0 0% 100% / 0.06)
            `,
            transform: "perspective(900px) rotateX(0.8deg)",
            transformOrigin: "bottom center",
          }}
        >
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 text-left">
            <SheetTitle className="flex items-center gap-3 text-[17px] font-bold tracking-tight">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, hsl(160 84% 39%), hsl(160 70% 48%))",
                  boxShadow: "0 3px 12px hsl(160 84% 39% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                }}
              >
                <Users className="h-[18px] w-[18px] text-white" />
              </div>
              Travelers & Cabin
            </SheetTitle>
          </SheetHeader>

          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

          <div className="space-y-5 px-6 py-5">
            {/* Passenger counter — recessed 3D surface */}
            <div
              className="rounded-[20px] p-[18px]"
              style={{
                background: "hsl(var(--background))",
                boxShadow: "inset 0 2px 8px hsl(var(--foreground) / 0.04), inset 0 0 0 1px hsl(var(--border) / 0.4)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[15px] text-foreground">Travelers</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">Up to 9 passengers</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Minus */}
                  <button
                    type="button"
                    aria-label="Decrease travelers"
                    className="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-[0.88] touch-manipulation"
                    style={passengers > 1 ? {
                      background: "hsl(var(--card))",
                      boxShadow: "0 3px 8px hsl(var(--foreground) / 0.07), 0 1px 2px hsl(var(--foreground) / 0.05), inset 0 -1px 0 hsl(var(--foreground) / 0.04), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
                    } : {
                      background: "hsl(var(--muted) / 0.4)",
                    }}
                    onClick={() => onPassengersChange(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                  >
                    <Minus className={cn("h-4 w-4", passengers <= 1 ? "text-muted-foreground/30" : "text-foreground")} />
                  </button>

                  {/* Count display — pill with gradient */}
                  <div
                    className="w-[52px] h-11 flex items-center justify-center text-[18px] font-extrabold rounded-2xl"
                    style={{
                      background: "linear-gradient(145deg, hsl(160 84% 39% / 0.12), hsl(160 84% 39% / 0.06))",
                      color: "hsl(160 84% 32%)",
                      boxShadow: "inset 0 0 0 1.5px hsl(160 84% 39% / 0.15)",
                    }}
                  >
                    {passengers}
                  </div>

                  {/* Plus */}
                  <button
                    type="button"
                    aria-label="Increase travelers"
                    className="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-[0.88] touch-manipulation"
                    style={passengers < 9 ? {
                      background: "hsl(var(--card))",
                      boxShadow: "0 3px 8px hsl(var(--foreground) / 0.07), 0 1px 2px hsl(var(--foreground) / 0.05), inset 0 -1px 0 hsl(var(--foreground) / 0.04), inset 0 1px 0 hsl(0 0% 100% / 0.06)",
                    } : {
                      background: "hsl(var(--muted) / 0.4)",
                    }}
                    onClick={() => onPassengersChange(Math.min(9, passengers + 1))}
                    disabled={passengers >= 9}
                  >
                    <Plus className={cn("h-4 w-4", passengers >= 9 ? "text-muted-foreground/30" : "text-foreground")} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cabin class — premium 3D cards */}
            <div>
              <p className="mb-3 text-[13px] font-bold text-foreground tracking-tight uppercase opacity-60">Cabin class</p>
              <div className="grid grid-cols-2 gap-2.5">
                {cabinOptions.map((option) => {
                  const isSelected = cabin === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="relative rounded-[18px] p-3.5 text-left transition-all duration-200 active:scale-[0.95] touch-manipulation overflow-hidden"
                      style={isSelected ? {
                        background: "linear-gradient(145deg, hsl(160 84% 39%), hsl(160 70% 44%))",
                        boxShadow: "0 6px 20px hsl(160 84% 39% / 0.35), 0 2px 4px hsl(160 84% 39% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
                      } : {
                        background: "hsl(var(--card))",
                        boxShadow: "0 2px 8px hsl(var(--foreground) / 0.06), inset 0 0 0 1px hsl(var(--border) / 0.5)",
                      }}
                      onClick={() => onCabinChange(option.value)}
                    >
                      {/* Subtle shine overlay on selected */}
                      {isSelected && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "linear-gradient(135deg, hsl(0 0% 100% / 0.15) 0%, transparent 50%)",
                          }}
                        />
                      )}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center mb-2",
                          isSelected ? "bg-white/20" : "bg-muted"
                        )}
                      >
                        <Icon className={cn(
                          "h-3.5 w-3.5",
                          isSelected ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <p className={cn(
                        "text-[13px] font-bold leading-tight",
                        isSelected ? "text-white" : "text-foreground"
                      )}>
                        {option.label}
                      </p>
                      <p className={cn(
                        "text-[10px] mt-0.5 leading-tight font-medium",
                        isSelected ? "text-white/65" : "text-muted-foreground/70"
                      )}>
                        {option.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Done — premium gradient button */}
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-[52px] w-full rounded-2xl text-white font-bold text-[15px] border-0 active:scale-[0.97] transition-all duration-150 tracking-wide"
              style={{
                background: "linear-gradient(145deg, hsl(160 84% 39%), hsl(160 70% 44%))",
                boxShadow: "0 6px 20px hsl(160 84% 39% / 0.3), 0 2px 6px hsl(160 84% 39% / 0.15), inset 0 1px 0 hsl(160 84% 60% / 0.3), inset 0 -2px 0 hsl(160 84% 30% / 0.15)",
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
