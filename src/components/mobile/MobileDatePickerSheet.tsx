import { format, isBefore, startOfToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileDatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  label?: string;
  minDate?: Date;
  accentColor?: string;
}

export default function MobileDatePickerSheet({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  label = "Select date",
  minDate,
}: MobileDatePickerSheetProps) {
  const earliestDate = minDate && !isBefore(minDate, startOfToday()) ? minDate : startOfToday();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <SheetHeader className="px-4 pb-2 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-primary" />
            {label}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-border bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateSelect(date);
                if (date) onOpenChange(false);
              }}
              disabled={(date) => isBefore(date, earliestDate)}
              initialFocus
              className="pointer-events-auto"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-h-10 text-sm text-muted-foreground">
              {selectedDate ? `Selected: ${format(selectedDate, "EEE, MMM d")}` : "Choose a travel date"}
            </div>
            <Button type="button" onClick={() => onOpenChange(false)} className="min-w-24 rounded-xl">
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
