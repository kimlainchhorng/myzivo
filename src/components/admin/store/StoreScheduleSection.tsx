/**
 * StoreScheduleSection — 2026 Weekly shift scheduling with templates, drag hints, coverage overview, copy week.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users,
  Copy, Trash2, Download, AlertTriangle, CheckCircle2, Sun,
  Moon, Sunrise, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { toast } from "sonner";

interface Props { storeId: string; }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_PRESETS = [
  { type: "morning", label: "Morning", icon: Sunrise, start: "06:00", end: "14:00", color: "bg-amber-500/15 text-amber-700 border-amber-300/40" },
  { type: "afternoon", label: "Afternoon", icon: Sun, start: "14:00", end: "22:00", color: "bg-blue-500/15 text-blue-700 border-blue-300/40" },
  { type: "evening", label: "Evening", icon: Moon, start: "18:00", end: "02:00", color: "bg-purple-500/15 text-purple-700 border-purple-300/40" },
  { type: "full", label: "Full Day", icon: Clock, start: "09:00", end: "17:00", color: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40" },
  { type: "split", label: "Split Shift", icon: BarChart3, start: "10:00", end: "20:00", color: "bg-rose-500/15 text-rose-700 border-rose-300/40" },
];

type Shift = { id: string; employeeId: string; day: number; type: string; start: string; end: string; note?: string; };

export default function StoreScheduleSection({ storeId }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [quickDay, setQuickDay] = useState<number | null>(null);
  const [shiftForm, setShiftForm] = useState({ employeeId: "", day: "0", type: "morning", start: "09:00", end: "17:00", note: "" });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-schedule", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("store_employees").select("*").eq("store_id", storeId).eq("status", "active").order("name");
      return (data || []) as any[];
    },
  });

  const addShift = () => {
    if (!shiftForm.employeeId) return;
    const preset = SHIFT_PRESETS.find(p => p.type === shiftForm.type);
    setShifts(prev => [...prev, {
      id: crypto.randomUUID(), employeeId: shiftForm.employeeId,
      day: Number(shiftForm.day), type: shiftForm.type,
      start: shiftForm.start || preset?.start || "09:00",
      end: shiftForm.end || preset?.end || "17:00",
      note: shiftForm.note,
    }]);
    setAddDialog(false);
    setShiftForm({ employeeId: "", day: "0", type: "morning", start: "09:00", end: "17:00", note: "" });
  };

  const removeShift = (id: string) => setShifts(prev => prev.filter(s => s.id !== id));

  const copyWeek = () => {
    const copied = shifts.map(s => ({ ...s, id: crypto.randomUUID() }));
    setWeekStart(addWeeks(weekStart, 1));
    setShifts(prev => [...prev, ...copied]);
    toast.success("Schedule copied to next week");
  };

  const clearWeek = () => { setShifts([]); toast.success("Week cleared"); };

  // Coverage stats
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((s, sh) => {
    const [sh1, sm1] = sh.start.split(":").map(Number);
    const [eh1, em1] = sh.end.split(":").map(Number);
    return s + Math.max(0, (eh1 + em1 / 60) - (sh1 + sm1 / 60));
  }, 0);
  const coverageByDay = DAYS.map((_, i) => shifts.filter(s => s.day === i).length);
  const maxCoverage = Math.max(...coverageByDay, 1);

  const handlePresetClick = (preset: typeof SHIFT_PRESETS[0]) => {
    setShiftForm(f => ({ ...f, type: preset.type, start: preset.start, end: preset.end }));
  };

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Total Shifts", value: totalShifts, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Clock, label: "Total Hours", value: `${totalHours.toFixed(0)}h`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Users, label: "Scheduled Staff", value: new Set(shifts.map(s => s.employeeId)).size, color: "text-purple-500", bg: "bg-purple-500/10" },
          { icon: AlertTriangle, label: "Unscheduled", value: employees.length - new Set(shifts.map(s => s.employeeId)).size, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}><s.icon className={cn("w-5 h-5", s.color)} /></div>
              <div><p className="text-[11px] text-muted-foreground font-medium">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coverage Bar */}
      <Card className="p-4">
        <p className="text-xs font-semibold mb-3">Daily Coverage</p>
        <div className="flex items-end gap-2 h-16">
          {DAYS.map((d, i) => {
            const count = coverageByDay[i];
            const height = (count / maxCoverage) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold">{count}</span>
                <div className="w-full rounded-t-md bg-muted relative" style={{ height: "48px" }}>
                  <div className={cn("absolute bottom-0 w-full rounded-t-md transition-all", count > 0 ? "bg-primary/70" : "bg-muted-foreground/10")} style={{ height: `${Math.max(height, 5)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{d}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="text-sm font-semibold px-2">{format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}</div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={copyWeek}><Copy className="w-3 h-3" /> Copy Week</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 text-destructive" onClick={clearWeek}><Trash2 className="w-3 h-3" /> Clear</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="w-3 h-3" /> Export</Button>
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => setAddDialog(true)}><Plus className="w-3.5 h-3.5" /> Add Shift</Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-3 py-2.5 font-semibold text-xs text-muted-foreground w-40 sticky left-0 bg-muted/40 z-10">Employee</th>
                {DAYS.map((d, i) => (
                  <th key={d} className="text-center px-2 py-2.5 font-semibold text-xs text-muted-foreground min-w-[105px]">
                    <div className={cn(format(addDays(weekStart, i), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && "text-primary")}>{d}</div>
                    <div className="text-[10px] font-normal">{format(addDays(weekStart, i), "MMM d")}</div>
                  </th>
                ))}
                <th className="text-center px-2 py-2.5 font-semibold text-xs text-muted-foreground w-16">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-14 text-muted-foreground text-sm">No employees yet. Add employees first to create schedules.</td></tr>
              ) : employees.map((emp: any) => {
                const empShifts = shifts.filter(s => s.employeeId === emp.id);
                const empHours = empShifts.reduce((s, sh) => {
                  const [sh1, sm1] = sh.start.split(":").map(Number);
                  const [eh1, em1] = sh.end.split(":").map(Number);
                  return s + Math.max(0, (eh1 + em1 / 60) - (sh1 + sm1 / 60));
                }, 0);

                return (
                  <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-3 py-3 sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{emp.name?.charAt(0)?.toUpperCase()}</div>
                        <div><p className="font-medium text-[12px] leading-tight">{emp.name}</p><p className="text-[10px] text-muted-foreground capitalize">{emp.role}</p></div>
                      </div>
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const dayShifts = empShifts.filter(s => s.day === dayIdx);
                      const isToday = format(addDays(weekStart, dayIdx), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      return (
                        <td key={dayIdx} className={cn("px-1 py-1.5 text-center align-top", isToday && "bg-primary/5")}>
                          {dayShifts.length > 0 ? dayShifts.map(s => {
                            const preset = SHIFT_PRESETS.find(p => p.type === s.type);
                            return (
                              <button key={s.id} onClick={() => setSelectedShift(s)}
                                className={cn("block w-full rounded-lg border px-2 py-1.5 text-[10px] font-medium mb-1 transition-all hover:shadow-sm active:scale-95", preset?.color || SHIFT_PRESETS[3].color)}>
                                <div className="font-semibold capitalize">{s.type}</div>
                                <div className="opacity-75">{s.start}–{s.end}</div>
                              </button>
                            );
                          }) : (
                            <button onClick={() => { setShiftForm(f => ({ ...f, day: String(dayIdx) })); setAddDialog(true); }}
                              className="w-full h-12 rounded-lg border border-dashed border-border/50 flex items-center justify-center hover:bg-muted/30 hover:border-primary/30 transition-all group">
                              <Plus className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-3 text-center">
                      <span className={cn("text-xs font-semibold", empHours > 40 ? "text-red-500" : "text-foreground")}>{empHours.toFixed(0)}h</span>
                      {empHours > 40 && <AlertTriangle className="w-3 h-3 text-red-500 mx-auto mt-0.5" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {SHIFT_PRESETS.map(p => (
          <div key={p.type} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-sm border", p.color)} />
            <span className="text-[11px] text-muted-foreground">{p.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2"><AlertTriangle className="w-3 h-3 text-red-500" /><span className="text-[11px] text-muted-foreground">Overtime (&gt;40h)</span></div>
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Shift</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            {/* Preset buttons */}
            <div>
              <Label className="text-xs mb-2 block">Quick Presets</Label>
              <div className="flex gap-2 flex-wrap">
                {SHIFT_PRESETS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button key={p.type} onClick={() => handlePresetClick(p)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all", shiftForm.type === p.type ? p.color + " border-current shadow-sm" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted")}>
                      <Icon className="w-3 h-3" />{p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2"><Label>Employee</Label><Select value={shiftForm.employeeId} onValueChange={v => setShiftForm(f => ({ ...f, employeeId: v }))}><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger><SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Day</Label><Select value={shiftForm.day} onValueChange={v => setShiftForm(f => ({ ...f, day: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d} — {format(addDays(weekStart, i), "MMM d")}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Shift Type</Label><Select value={shiftForm.type} onValueChange={v => { const p = SHIFT_PRESETS.find(x => x.type === v); setShiftForm(f => ({ ...f, type: v, start: p?.start || f.start, end: p?.end || f.end })); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SHIFT_PRESETS.map(p => <SelectItem key={p.type} value={p.type}>{p.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={shiftForm.start} onChange={e => setShiftForm(f => ({ ...f, start: e.target.value }))} /></div>
              <div className="space-y-2"><Label>End Time</Label><Input type="time" value={shiftForm.end} onChange={e => setShiftForm(f => ({ ...f, end: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Note (optional)</Label><Input value={shiftForm.note} onChange={e => setShiftForm(f => ({ ...f, note: e.target.value }))} placeholder="Special instructions..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={addShift} disabled={!shiftForm.employeeId}>Add Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Detail Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={o => !o && setSelectedShift(null)}>
        <DialogContent className="max-w-sm">
          {selectedShift && (() => {
            const emp = employees.find((e: any) => e.id === selectedShift.employeeId);
            const preset = SHIFT_PRESETS.find(p => p.type === selectedShift.type);
            return (
              <>
                <DialogHeader><DialogTitle>Shift Details</DialogTitle></DialogHeader>
                <div className="space-y-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{emp?.name?.charAt(0)}</div>
                    <div><p className="font-semibold text-sm">{emp?.name}</p><p className="text-xs text-muted-foreground capitalize">{emp?.role}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3"><p className="text-[10px] text-muted-foreground">Day</p><p className="text-sm font-medium">{DAYS[selectedShift.day]} — {format(addDays(weekStart, selectedShift.day), "MMM d")}</p></Card>
                    <Card className="p-3"><p className="text-[10px] text-muted-foreground">Type</p><Badge className={cn("text-[11px]", preset?.color)}>{preset?.label}</Badge></Card>
                    <Card className="p-3"><p className="text-[10px] text-muted-foreground">Time</p><p className="text-sm font-medium">{selectedShift.start} — {selectedShift.end}</p></Card>
                    <Card className="p-3"><p className="text-[10px] text-muted-foreground">Hours</p><p className="text-sm font-medium">{(() => { const [s,sm] = selectedShift.start.split(":").map(Number); const [e,em] = selectedShift.end.split(":").map(Number); return Math.max(0,(e+em/60)-(s+sm/60)).toFixed(1); })()}h</p></Card>
                  </div>
                  {selectedShift.note && <div className="text-xs bg-muted/30 rounded-lg p-3">{selectedShift.note}</div>}
                </div>
                <DialogFooter>
                  <Button variant="destructive" size="sm" onClick={() => { removeShift(selectedShift.id); setSelectedShift(null); }}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
