/**
 * Mobile Full-Screen Date Picker Sheet
 * Opens as full-screen overlay on mobile for easy date selection
 */

import { useState, useEffect } from "react";
import { X, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfToday, addDays } from "date-fns";

interface MobileDatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  label?: string;
  minDate?: Date;
  accentColor?: "sky" | "orange" | "violet";
}

export default function MobileDatePickerSheet({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  label = "Select Date",
  minDate,
  accentColor = "sky",
}: MobileDatePickerSheetProps) {
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);

  // Sync temp date when prop changes
  useEffect(() => {
    setTempDate(selectedDate);
  }, [selectedDate, open]);

  const handleConfirm = () => {
    onDateSelect(tempDate);
    onOpenChange(false);
  };

  const colorClasses = {
    sky: "bg-sky-500 hover:bg-sky-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    violet: "bg-violet-500 hover:bg-violet-600",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Calendar className={cn(
                "w-5 h-5",
                accentColor === "sky" ? "text-sky-500" : 
                accentColor === "orange" ? "text-orange-500" : "text-violet-500"
              )} />
              {label}
            </SheetTitle>
            {tempDate && (
              <span className="text-sm font-medium text-muted-foreground">
                {format(tempDate, "EEE, MMM d, yyyy")}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Calendar - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <CalendarComponent
            mode="single"
            selected={tempDate}
            onSelect={setTempDate}
            disabled={(date) => {
              if (minDate && isBefore(date, minDate)) return true;
              return isBefore(date, startOfToday());
            }}
            className="mx-auto scale-110 origin-top"
            classNames={{
              day_selected: cn(
                "text-white",
                accentColor === "sky" ? "bg-sky-500 hover:bg-sky-600" :
                accentColor === "orange" ? "bg-orange-500 hover:bg-orange-600" :
                "bg-violet-500 hover:bg-violet-600"
              ),
              day_today: cn(
                "font-bold",
                accentColor === "sky" ? "text-sky-500" :
                accentColor === "orange" ? "text-orange-500" : "text-violet-500"
              ),
            }}
          />
        </div>

        {/* Footer with CTA */}
        <div className="p-4 border-t border-border/50 bg-background shrink-0 safe-area-inset-bottom">
          <Button
            onClick={handleConfirm}
            disabled={!tempDate}
            className={cn(
              "w-full h-12 font-bold text-base gap-2",
              colorClasses[accentColor],
              "text-white shadow-lg active:scale-[0.98]"
            )}
          >
            <Check className="w-5 h-5" />
            {tempDate ? `Select ${format(tempDate, "MMM d")}` : "Select a date"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
