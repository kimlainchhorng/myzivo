import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const cabinOptions = [
  { value: "economy", label: "Economy" },
  { value: "premium", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
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
        className="rounded-t-3xl px-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <SheetHeader className="px-4 pb-2 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Travelers & Cabin
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Travelers</p>
                <p className="text-sm text-muted-foreground">Up to 9 passengers</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Decrease travelers"
                  className="h-11 w-11 rounded-xl touch-manipulation"
                  onClick={() => onPassengersChange(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-10 text-center text-lg font-semibold">{passengers}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Increase travelers"
                  className="h-11 w-11 rounded-xl touch-manipulation"
                  onClick={() => onPassengersChange(Math.min(9, passengers + 1))}
                  disabled={passengers >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Cabin class</p>
            <div className="grid grid-cols-2 gap-2">
              {cabinOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={cabin === option.value ? "default" : "outline"}
                  className={cn("h-11 rounded-xl justify-center", cabin === option.value && "shadow-sm")}
                  onClick={() => onCabinChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Button type="button" onClick={() => onOpenChange(false)} className="h-12 w-full rounded-xl">
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
