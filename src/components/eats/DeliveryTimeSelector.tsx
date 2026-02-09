/**
 * Delivery Time Selector Button
 * Compact display of current delivery time selection
 */
import { useState } from "react";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { DeliveryTimeSheet, type DeliveryMode } from "./DeliveryTimeSheet";

interface DeliveryTimeSelectorProps {
  mode: DeliveryMode;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  onChange: (mode: DeliveryMode, date: Date | null, time: string | null) => void;
  restaurantHours?: { open: string; close: string };
}

export function DeliveryTimeSelector({
  mode,
  scheduledDate,
  scheduledTime,
  onChange,
  restaurantHours,
}: DeliveryTimeSelectorProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const isScheduled = mode === "scheduled" && scheduledDate && scheduledTime;

  // Format the scheduled time display
  const getTimeLabel = () => {
    if (!isScheduled || !scheduledDate || !scheduledTime) {
      return "30-45 min";
    }

    const isToday = isSameDay(scheduledDate, new Date());
    const dateLabel = isToday ? "Today" : format(scheduledDate, "MMM d");
    return `${dateLabel} at ${scheduledTime}`;
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSheetOpen(true)}
        className={cn(
          "w-full bg-zinc-900/80 backdrop-blur border rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left",
          isScheduled ? "border-violet-500/30" : "border-white/5"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isScheduled ? "bg-violet-500/20" : "bg-orange-500/20"
        )}>
          {isScheduled ? (
            <Calendar className="w-5 h-5 text-violet-500" />
          ) : (
            <Clock className="w-5 h-5 text-orange-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-bold text-sm",
            isScheduled ? "text-violet-400" : "text-white"
          )}>
            {isScheduled ? "Scheduled Delivery" : "Deliver ASAP"}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {getTimeLabel()}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
      </motion.button>

      <DeliveryTimeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={mode}
        scheduledDate={scheduledDate}
        scheduledTime={scheduledTime}
        onConfirm={onChange}
        restaurantHours={restaurantHours}
      />
    </>
  );
}
