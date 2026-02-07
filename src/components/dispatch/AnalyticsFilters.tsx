/**
 * AnalyticsFilters - Date range filter for analytics
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/hooks/useDispatchAnalytics";

interface AnalyticsFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type PresetOption = "today" | "7days" | "30days" | "month" | "custom";

const AnalyticsFilters = ({ dateRange, onDateRangeChange }: AnalyticsFiltersProps) => {
  const [preset, setPreset] = useState<PresetOption>("7days");
  const [customStart, setCustomStart] = useState<Date | undefined>(dateRange.start);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(dateRange.end);

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value);
    
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (value) {
      case "today":
        start = startOfDay(now);
        break;
      case "7days":
        start = startOfDay(subDays(now, 6));
        break;
      case "30days":
        start = startOfDay(subDays(now, 29));
        break;
      case "month":
        start = startOfMonth(now);
        break;
      case "custom":
        // Keep current custom range
        return;
      default:
        start = startOfDay(subDays(now, 6));
    }

    onDateRangeChange({ start, end });
  };

  const handleCustomDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (type === "start") {
      setCustomStart(date);
      if (date && customEnd) {
        onDateRangeChange({ start: startOfDay(date), end: endOfDay(customEnd) });
      }
    } else {
      setCustomEnd(date);
      if (customStart && date) {
        onDateRangeChange({ start: startOfDay(customStart), end: endOfDay(date) });
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetOption)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7days">Last 7 Days</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !customStart && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStart ? format(customStart, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={(d) => handleCustomDateSelect(d, "start")}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !customEnd && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEnd ? format(customEnd, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={(d) => handleCustomDateSelect(d, "end")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <span className="text-sm text-muted-foreground ml-2">
        {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
      </span>
    </div>
  );
};

export default AnalyticsFilters;
