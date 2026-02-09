/**
 * Delivery Time Bottom Sheet
 * ASAP or Schedule for Later with date/time picker
 */
import { useState, useMemo } from "react";
import { Clock, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, setHours, setMinutes, addHours, isAfter } from "date-fns";

export type DeliveryMode = "asap" | "scheduled";

interface DeliveryTimeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DeliveryMode;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  onConfirm: (mode: DeliveryMode, date: Date | null, time: string | null) => void;
  restaurantHours?: { open: string; close: string };
}

export function DeliveryTimeSheet({
  open,
  onOpenChange,
  mode,
  scheduledDate,
  scheduledTime,
  onConfirm,
  restaurantHours,
}: DeliveryTimeSheetProps) {
  const [tempMode, setTempMode] = useState<DeliveryMode>(mode);
  const [tempDate, setTempDate] = useState<Date | null>(scheduledDate);
  const [tempTime, setTempTime] = useState<string | null>(scheduledTime);

  // Reset temp values when sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempMode(mode);
      setTempDate(scheduledDate);
      setTempTime(scheduledTime);
    }
    onOpenChange(isOpen);
  };

  // Generate date options (Today + next 6 days)
  const dateOptions = useMemo(() => {
    const dates: { date: Date; label: string }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      dates.push({
        date,
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(date, "EEE, MMM d"),
      });
    }
    
    return dates;
  }, []);

  // Generate time slots based on selected date
  const timeSlots = useMemo(() => {
    if (!tempDate) return [];
    
    const slots: string[] = [];
    const now = new Date();
    const isToday = isSameDay(tempDate, now);
    
    // Default hours: 10:00 AM - 10:00 PM
    const openHour = restaurantHours?.open 
      ? parseInt(restaurantHours.open.split(":")[0]) 
      : 10;
    const closeHour = restaurantHours?.close 
      ? parseInt(restaurantHours.close.split(":")[0]) 
      : 22;
    
    // Generate 30-minute slots
    for (let hour = openHour; hour < closeHour; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = setMinutes(setHours(new Date(tempDate), hour), minute);
        
        // Skip past times for today (plus 1 hour buffer for prep)
        if (isToday && !isAfter(slotTime, addHours(now, 1))) continue;
        
        slots.push(format(slotTime, "h:mm a"));
      }
    }
    
    return slots;
  }, [tempDate, restaurantHours]);

  // Set default date when switching to scheduled mode
  const handleModeChange = (newMode: DeliveryMode) => {
    setTempMode(newMode);
    if (newMode === "scheduled" && !tempDate) {
      setTempDate(new Date());
    }
  };

  const handleConfirm = () => {
    if (tempMode === "asap") {
      onConfirm("asap", null, null);
    } else if (tempDate && tempTime) {
      onConfirm("scheduled", tempDate, tempTime);
    }
    onOpenChange(false);
  };

  const isValid = tempMode === "asap" || (tempMode === "scheduled" && tempDate && tempTime);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <SheetTitle className="text-center">When would you like it?</SheetTitle>
        </SheetHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-3">
            {/* ASAP Option */}
            <button
              onClick={() => handleModeChange("asap")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                tempMode === "asap"
                  ? "bg-orange-500/10 border-orange-500"
                  : "bg-muted/30 border-border/50 hover:border-border"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                tempMode === "asap" ? "bg-orange-500/20" : "bg-muted"
              )}>
                <Clock className={cn(
                  "w-5 h-5",
                  tempMode === "asap" ? "text-orange-500" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "font-bold",
                  tempMode === "asap" ? "text-orange-500" : "text-foreground"
                )}>
                  Deliver ASAP
                </p>
                <p className="text-sm text-muted-foreground">Usually 30-45 min</p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                tempMode === "asap" ? "border-orange-500 bg-orange-500" : "border-muted-foreground"
              )}>
                {tempMode === "asap" && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>

            {/* Schedule Option */}
            <button
              onClick={() => handleModeChange("scheduled")}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all",
                tempMode === "scheduled"
                  ? "bg-violet-500/10 border-violet-500"
                  : "bg-muted/30 border-border/50 hover:border-border"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                tempMode === "scheduled" ? "bg-violet-500/20" : "bg-muted"
              )}>
                <Calendar className={cn(
                  "w-5 h-5",
                  tempMode === "scheduled" ? "text-violet-500" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "font-bold",
                  tempMode === "scheduled" ? "text-violet-500" : "text-foreground"
                )}>
                  Schedule for Later
                </p>
                <p className="text-sm text-muted-foreground">Choose a specific time</p>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                tempMode === "scheduled" ? "border-violet-500 bg-violet-500" : "border-muted-foreground"
              )}>
                {tempMode === "scheduled" && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          </div>

          {/* Date & Time Picker (only shown for scheduled mode) */}
          {tempMode === "scheduled" && (
            <div className="space-y-4">
              {/* Date Selector */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {dateOptions.map(({ date, label }) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setTempDate(date);
                        setTempTime(null); // Reset time when date changes
                      }}
                      className={cn(
                        "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                        tempDate && isSameDay(date, tempDate)
                          ? "bg-violet-500 text-white"
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selector */}
              {tempDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Select Time</p>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setTempTime(slot)}
                          className={cn(
                            "px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            tempTime === slot
                              ? "bg-violet-500 text-white"
                              : "bg-muted/50 text-foreground hover:bg-muted"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No available times for this date
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with CTA */}
        <div className="p-4 border-t border-border/50 bg-background shrink-0 safe-area-inset-bottom">
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className={cn(
              "w-full h-12 font-bold text-base gap-2 text-white shadow-lg active:scale-[0.98]",
              tempMode === "asap" 
                ? "bg-orange-500 hover:bg-orange-600" 
                : "bg-violet-500 hover:bg-violet-600"
            )}
          >
            <Check className="w-5 h-5" />
            {tempMode === "asap" 
              ? "Deliver ASAP" 
              : tempTime 
                ? `Schedule for ${format(tempDate!, "MMM d")} at ${tempTime}`
                : "Select a time"
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
