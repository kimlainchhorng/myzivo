/**
 * Vehicle Availability Calendar Component
 * Calendar UI for blocking/unblocking dates
 */

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVehicleAvailability, useUpdateVehicleAvailability } from "@/hooks/useP2PVehicle";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday, addMonths, subMonths } from "date-fns";

interface VehicleAvailabilityCalendarProps {
  vehicleId: string;
}

export function VehicleAvailabilityCalendar({ vehicleId }: VehicleAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [mode, setMode] = useState<"block" | "unblock">("block");

  const { data: availability, isLoading } = useVehicleAvailability(vehicleId, currentMonth);
  const updateAvailability = useUpdateVehicleAvailability();

  // Build a map of blocked dates
  const blockedDatesMap = useMemo(() => {
    const map = new Map<string, boolean>();
    availability?.forEach((a) => {
      map.set(a.date, !a.is_available);
    });
    return map;
  }, [availability]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Pad beginning with empty slots
    const startDayOfWeek = start.getDay();
    const paddedDays: (Date | null)[] = Array(startDayOfWeek).fill(null);
    
    return [...paddedDays, ...days];
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    if (isBefore(date, startOfToday())) return;
    
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr);
      }
      return [...prev, dateStr];
    });
  };

  const handleApplyChanges = async () => {
    if (selectedDates.length === 0) return;
    
    await updateAvailability.mutateAsync({
      vehicleId,
      dates: selectedDates,
      isAvailable: mode === "unblock",
    });
    
    setSelectedDates([]);
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDatesMap.get(dateStr) === true;
  };

  const isDateSelected = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return selectedDates.includes(dateStr);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Availability Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "block" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("block")}
          >
            Block dates
          </Button>
          <Button
            variant={mode === "unblock" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("unblock")}
          >
            Unblock dates
          </Button>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar cells */}
            {calendarDays.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              
              const isPast = isBefore(date, startOfToday());
              const blocked = isDateBlocked(date);
              const selected = isDateSelected(date);
              
              return (
                <button
                  key={date.toISOString()}
                  disabled={isPast}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-colors relative",
                    "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isPast && "opacity-40 cursor-not-allowed",
                    !isPast && !blocked && !selected && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
                    blocked && !selected && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
                    selected && "ring-2 ring-primary ring-offset-2",
                    isToday(date) && "font-bold"
                  )}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
            <span>Blocked</span>
          </div>
        </div>

        {/* Apply button */}
        {selectedDates.length > 0 && (
          <Button
            className="w-full"
            onClick={handleApplyChanges}
            disabled={updateAvailability.isPending}
          >
            {updateAvailability.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {mode === "block" ? "Block" : "Unblock"} {selectedDates.length} date(s)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
