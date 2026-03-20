import { useEffect, useMemo, useState } from "react";
import { format, isBefore, startOfToday, addDays } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { DateRange } from "react-day-picker";

/* ─── Single-date picker (existing) ─── */
interface MobileDatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  onDateConfirmed?: (date: Date) => void;
  label?: string;
  minDate?: Date;
  accentColor?: string;
}

export default function MobileDatePickerSheet({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  onDateConfirmed,
  label = "Select date",
  minDate,
}: MobileDatePickerSheetProps) {
  const earliestDate = useMemo(() => {
    const today = startOfToday();
    return minDate && !isBefore(minDate, today) ? minDate : today;
  }, [minDate]);

  const initialMonth = selectedDate && !isBefore(selectedDate, earliestDate) ? selectedDate : earliestDate;
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    if (open) {
      setMonth(selectedDate && !isBefore(selectedDate, earliestDate) ? selectedDate : earliestDate);
    }
  }, [open, selectedDate, earliestDate]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <SheetHeader className="px-4 pb-2 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-emerald-500" />
            {label}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={selectedDate}
              onSelect={(date) => {
                onDateSelect(date);
                if (date) {
                  onDateConfirmed?.(date);
                  onOpenChange(false);
                }
              }}
              disabled={(date) => isBefore(date, earliestDate)}
              initialFocus
              className="pointer-events-auto p-3"
              classNames={calendarClassNames}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-h-10 text-sm text-muted-foreground">
              {selectedDate ? `Selected: ${format(selectedDate, "EEE, MMM d")}` : "Tap a date to continue"}
            </div>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-w-24 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm"
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Range picker: departure → return in one sheet ─── */
interface MobileDateRangePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departDate?: Date;
  returnDate?: Date;
  onRangeConfirmed: (depart: Date, ret: Date) => void;
  label?: string;
  minDate?: Date;
}

export function MobileDateRangePickerSheet({
  open,
  onOpenChange,
  departDate,
  returnDate,
  onRangeConfirmed,
  label = "Select dates",
  minDate,
}: MobileDateRangePickerSheetProps) {
  const earliestDate = useMemo(() => {
    const today = startOfToday();
    return minDate && !isBefore(minDate, today) ? minDate : today;
  }, [minDate]);

  const [range, setRange] = useState<DateRange | undefined>(
    departDate ? { from: departDate, to: returnDate } : undefined
  );
  const [month, setMonth] = useState<Date>(departDate ?? earliestDate);

  useEffect(() => {
    if (open) {
      setRange(departDate ? { from: departDate, to: returnDate } : undefined);
      setMonth(departDate ?? earliestDate);
    }
  }, [open, departDate, returnDate, earliestDate]);

  const handleDone = () => {
    if (range?.from && range?.to) {
      onRangeConfirmed(range.from, range.to);
      onOpenChange(false);
    } else if (range?.from) {
      // Auto-set return 7 days later if only departure selected
      const ret = addDays(range.from, 7);
      onRangeConfirmed(range.from, ret);
      onOpenChange(false);
    }
  };

  const summaryText = range?.from
    ? range.to
      ? `${format(range.from, "MMM d")} → ${format(range.to, "MMM d")}`
      : `Depart: ${format(range.from, "MMM d")} — tap return`
    : "Tap departure date";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <SheetHeader className="px-4 pb-2 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-emerald-500" />
            {label}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Calendar
              mode="range"
              month={month}
              onMonthChange={setMonth}
              selected={range}
              onSelect={setRange}
              numberOfMonths={1}
              disabled={(date) => isBefore(date, earliestDate)}
              initialFocus
              className="pointer-events-auto p-3"
              classNames={calendarClassNames}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-h-10 text-sm text-muted-foreground">{summaryText}</div>
            <Button
              type="button"
              onClick={handleDone}
              disabled={!range?.from}
              className="min-w-24 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm disabled:opacity-40"
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Shared classNames ─── */
const calendarClassNames = {
  months: "flex flex-col space-y-4",
  month: "space-y-3",
  caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-semibold text-foreground",
  nav: "space-x-1 flex items-center",
  nav_button: "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 inline-flex items-center justify-center rounded-full hover:bg-muted transition-colors",
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse",
  head_row: "flex",
  head_cell: "text-muted-foreground rounded-md w-10 font-medium text-xs py-2 text-center",
  row: "flex w-full mt-1",
  cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-emerald-500/10 [&:has([aria-selected])]:bg-emerald-500/10 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
  day: "h-10 w-10 p-0 font-normal rounded-lg hover:bg-emerald-500/10 transition-colors inline-flex items-center justify-center text-foreground aria-selected:opacity-100",
  day_range_end: "day-range-end",
  day_selected: "bg-emerald-500 text-white hover:bg-emerald-600 focus:bg-emerald-500 font-semibold shadow-sm rounded-lg",
  day_today: "bg-muted text-foreground font-semibold rounded-lg",
  day_outside: "text-muted-foreground/30 aria-selected:bg-emerald-500/50 aria-selected:text-white",
  day_disabled: "bg-slate-700 text-slate-300 rounded-lg",
  day_range_middle: "aria-selected:bg-emerald-500/10 aria-selected:text-foreground rounded-none",
  day_hidden: "invisible",
};
