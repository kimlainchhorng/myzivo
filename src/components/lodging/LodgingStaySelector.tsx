/**
 * LodgingStaySelector — sticky bar with check-in/out + guest counters.
 * State persists to URL params (ci, co, ad, ch).
 */
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onChange: (next: { checkIn: string; checkOut: string; adults: number; children: number }) => void;
}

const toISO = (d: Date) => format(d, "yyyy-MM-dd");

export function LodgingStaySelector({ checkIn, checkOut, adults, children, onChange }: Props) {
  const [openGuests, setOpenGuests] = useState(false);
  const ciDate = checkIn ? new Date(checkIn) : new Date();
  const coDate = checkOut ? new Date(checkOut) : new Date(Date.now() + 86400000);
  const nights = Math.max(1, Math.round((coDate.getTime() - ciDate.getTime()) / 86400000));

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-sm p-2 grid grid-cols-3 gap-1.5">
      {/* Check-in */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-start p-2 rounded-lg hover:bg-muted/50 transition text-left">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Check-in</span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <CalendarIcon className="h-3 w-3" />
              {format(ciDate, "MMM d")}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={ciDate}
            onSelect={(d) => d && onChange({ checkIn: toISO(d), checkOut: d >= coDate ? toISO(new Date(d.getTime() + 86400000)) : checkOut, adults, children })}
            disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Check-out */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-start p-2 rounded-lg hover:bg-muted/50 transition text-left border-l border-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Check-out</span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <CalendarIcon className="h-3 w-3" />
              {format(coDate, "MMM d")}
            </span>
            <span className="text-[9px] text-muted-foreground">{nights} night{nights > 1 ? "s" : ""}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={coDate}
            onSelect={(d) => d && onChange({ checkIn, checkOut: toISO(d), adults, children })}
            disabled={(d) => d <= ciDate}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Guests */}
      <Popover open={openGuests} onOpenChange={setOpenGuests}>
        <PopoverTrigger asChild>
          <button className="flex flex-col items-start p-2 rounded-lg hover:bg-muted/50 transition text-left border-l border-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Guests</span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" />
              {adults + children}
            </span>
            <span className="text-[9px] text-muted-foreground">{adults}A{children ? ` · ${children}C` : ""}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-3" align="end">
          <Counter label="Adults" sub="13+" value={adults} min={1} max={12}
            onChange={(v) => onChange({ checkIn, checkOut, adults: v, children })} />
          <Counter label="Children" sub="0-12" value={children} min={0} max={8}
            onChange={(v) => onChange({ checkIn, checkOut, adults, children: v })} />
          <Button size="sm" className="w-full" onClick={() => setOpenGuests(false)}>Done</Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Counter({ label, sub, value, min, max, onChange }: { label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="icon" variant="outline" className="h-7 w-7" disabled={value <= min} onClick={() => onChange(value - 1)}><Minus className="h-3 w-3" /></Button>
        <span className="w-6 text-center text-sm font-bold">{value}</span>
        <Button type="button" size="icon" variant="outline" className="h-7 w-7" disabled={value >= max} onClick={() => onChange(value + 1)}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}
