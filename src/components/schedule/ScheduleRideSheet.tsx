/**
 * Schedule Ride Bottom Sheet
 * Allows riders to schedule a ride for later with date/time picker
 */
import { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Navigation, X, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ScheduleRideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickup: string;
  dropoff: string;
  rideName?: string;
  estimatedPrice?: string;
  onConfirm: (date: Date, time: string) => void;
}

const TIME_SLOTS: string[] = [];
for (let h = 6; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
}
// Add early morning slots
for (let h = 0; h < 6; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
}

function formatTime12(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function ScheduleRideSheet({
  open,
  onOpenChange,
  pickup,
  dropoff,
  rideName,
  estimatedPrice,
  onConfirm,
}: ScheduleRideSheetProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = addDays(today, 30);

  // Filter out past time slots for today
  const availableSlots = TIME_SLOTS.filter((slot) => {
    if (!date || !isSameDay(date, new Date())) return true;
    const now = new Date();
    const [h, m] = slot.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    // Require 1 hour advance
    slotTime.setMinutes(slotTime.getMinutes() - 60);
    return slotTime > now;
  });

  const handleConfirm = () => {
    if (date && time) {
      onConfirm(date, time);
      onOpenChange(false);
      setDate(undefined);
      setTime(undefined);
    }
  };

  // Quick date options
  const quickDates = [
    { label: "Today", date: new Date() },
    { label: "Tomorrow", date: addDays(new Date(), 1) },
    { label: format(addDays(new Date(), 2), "EEE"), date: addDays(new Date(), 2) },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto p-0 bg-[#FFFBF5] border-t border-emerald-200">
        <div className="p-5 space-y-5">
          {/* Header */}
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              Schedule for Later
            </SheetTitle>
          </SheetHeader>

          {/* Route summary */}
          <div className="p-3 rounded-xl bg-white border border-emerald-100">
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="truncate flex-1">{pickup || "Pickup"}</span>
            </div>
            {dropoff && (
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                <div className="w-2 h-2 bg-teal-600 rounded-full" />
                <span className="truncate flex-1">{dropoff}</span>
              </div>
            )}
            {rideName && (
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>{rideName}</span>
                {estimatedPrice && <span className="font-semibold text-emerald-600">{estimatedPrice}</span>}
              </div>
            )}
          </div>

          {/* Quick date picks */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pick a date</p>
            <div className="flex gap-2 mb-3">
              {quickDates.map((qd) => (
                <button
                  key={qd.label}
                  onClick={() => setDate(qd.date)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    date && isSameDay(date, qd.date)
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-white border border-emerald-200 text-zinc-700 hover:bg-emerald-50"
                  )}
                >
                  {qd.label}
                </button>
              ))}
            </div>

            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < today || d > maxDate}
              className="p-0 pointer-events-auto [&_.rdp-day_button]:rounded-xl"
            />
          </div>

          {/* Time slots */}
          <AnimatePresence>
            {date && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Select time
                </p>
                <div className="grid grid-cols-4 gap-1.5 max-h-[200px] overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn(
                        "text-xs py-2 px-1 rounded-xl font-medium transition-all duration-200 touch-manipulation active:scale-95",
                        time === slot
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                          : "bg-white border border-zinc-200 text-zinc-700 hover:border-emerald-300"
                      )}
                    >
                      {formatTime12(slot)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary & Confirm */}
          <div className="pt-2 border-t border-emerald-100">
            <div className="text-sm text-zinc-500 mb-3">
              {date && time ? (
                <span className="text-emerald-700 font-semibold">
                  {isSameDay(date, new Date()) ? "Today" : format(date, "EEE, MMM d")} at {formatTime12(time)}
                </span>
              ) : (
                "Select date & time"
              )}
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!date || !time}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 disabled:from-zinc-300 disabled:to-zinc-400"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule Ride
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
