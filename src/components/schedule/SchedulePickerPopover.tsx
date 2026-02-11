import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    TIME_SLOTS.push(`${hh}:${mm}`);
  }
}

function formatTime12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface SchedulePickerPopoverProps {
  onConfirm: (date: Date, time: string) => void;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function SchedulePickerPopover({
  onConfirm,
  triggerLabel = "Schedule for later",
  triggerClassName,
}: SchedulePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleConfirm = () => {
    if (date && time) {
      onConfirm(date, time);
      setOpen(false);
      setDate(undefined);
      setTime(undefined);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 border-primary/30 text-primary hover:bg-primary/10",
            triggerClassName
          )}
        >
          <Clock className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 pointer-events-auto"
        align="center"
        side="top"
        sideOffset={8}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < today}
            initialFocus
            className="p-3 pointer-events-auto"
          />

          {/* Time selector */}
          <div className="border-t sm:border-t-0 sm:border-l border-border p-3 w-full sm:w-36">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 max-h-[200px] overflow-y-auto">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={cn(
                    "text-xs px-2 py-1.5 rounded-lg transition-colors text-left",
                    time === slot
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {formatTime12(slot)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {date && time
              ? `${format(date, "MMM d, yyyy")} at ${formatTime12(time)}`
              : "Select date & time"}
          </div>
          <Button
            size="sm"
            disabled={!date || !time}
            onClick={handleConfirm}
            className="bg-primary text-primary-foreground"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
