/**
 * StoreScheduleSection — Weekly shift scheduling for employees.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

interface Props { storeId: string; }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_COLORS: Record<string, string> = {
  morning: "bg-amber-500/15 text-amber-700 border-amber-300/40",
  afternoon: "bg-blue-500/15 text-blue-700 border-blue-300/40",
  evening: "bg-purple-500/15 text-purple-700 border-purple-300/40",
  full: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40",
};

type Shift = { employeeId: string; day: number; type: string; start: string; end: string; };

export default function StoreScheduleSection({ storeId }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [shiftForm, setShiftForm] = useState({ employeeId: "", day: "0", type: "morning", start: "09:00", end: "17:00" });

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-schedule", storeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_employees")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "active")
        .order("name");
      return (data || []) as any[];
    },
  });

  const addShift = () => {
    if (!shiftForm.employeeId) return;
    setShifts(prev => [...prev, {
      employeeId: shiftForm.employeeId,
      day: Number(shiftForm.day),
      type: shiftForm.type,
      start: shiftForm.start,
      end: shiftForm.end,
    }]);
    setAddDialog(false);
    setShiftForm({ employeeId: "", day: "0", type: "morning", start: "09:00", end: "17:00" });
  };

  const removeShift = (idx: number) => setShifts(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm font-semibold px-2">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</Button>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setAddDialog(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Shift
        </Button>
      </div>

      {/* Schedule Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-3 py-2.5 font-semibold text-xs text-muted-foreground w-36 sticky left-0 bg-muted/40">Employee</th>
                {DAYS.map((d, i) => (
                  <th key={d} className="text-center px-2 py-2.5 font-semibold text-xs text-muted-foreground min-w-[100px]">
                    <div>{d}</div>
                    <div className="text-[10px] font-normal">{format(addDays(weekStart, i), "MMM d")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-muted-foreground text-sm">No employees yet. Add employees first to create schedules.</td></tr>
              ) : employees.map((emp: any) => (
                <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-3 py-3 sticky left-0 bg-card">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {emp.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[12px] leading-tight">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.day === dayIdx);
                    return (
                      <td key={dayIdx} className="px-1.5 py-2 text-center align-top">
                        {dayShifts.length > 0 ? dayShifts.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => removeShift(shifts.indexOf(s))}
                            className={cn("block w-full rounded-lg border px-2 py-1.5 text-[10px] font-medium mb-1 transition-all hover:opacity-70", SHIFT_COLORS[s.type] || SHIFT_COLORS.full)}
                          >
                            <div className="font-semibold capitalize">{s.type}</div>
                            <div className="opacity-75">{s.start}–{s.end}</div>
                          </button>
                        )) : (
                          <div className="h-10 rounded-lg border border-dashed border-border/50 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(SHIFT_COLORS).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-sm border", cls)} />
            <span className="text-[11px] text-muted-foreground capitalize">{key}</span>
          </div>
        ))}
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Shift</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={shiftForm.employeeId} onValueChange={v => setShiftForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Day</Label>
                <Select value={shiftForm.day} onValueChange={v => setShiftForm(f => ({ ...f, day: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d} — {format(addDays(weekStart, i), "MMM d")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Shift Type</Label>
                <Select value={shiftForm.type} onValueChange={v => setShiftForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="full">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={shiftForm.start} onChange={e => setShiftForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={shiftForm.end} onChange={e => setShiftForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={addShift} disabled={!shiftForm.employeeId}>Add Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
