/**
 * StoreScheduleSection — Work schedule with date-range assignments, day-off management, and weekly view.
 */
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users,
  Copy, Trash2, Download, AlertTriangle, Sun, Moon, Sunrise,
  BarChart3, CalendarOff, CalendarCheck, Briefcase, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isWithinInterval, parseISO, isSameDay, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";

interface Props { storeId: string; }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFT_PRESETS = [
  { type: "morning", label: "Morning", icon: Sunrise, start: "06:00", end: "14:00", color: "bg-amber-500/15 text-amber-700 border-amber-300/40", dotColor: "bg-amber-400" },
  { type: "afternoon", label: "Afternoon", icon: Sun, start: "14:00", end: "22:00", color: "bg-blue-500/15 text-blue-700 border-blue-300/40", dotColor: "bg-blue-400" },
  { type: "evening", label: "Evening", icon: Moon, start: "18:00", end: "02:00", color: "bg-purple-500/15 text-purple-700 border-purple-300/40", dotColor: "bg-purple-400" },
  { type: "full", label: "Full Day", icon: Clock, start: "09:00", end: "17:00", color: "bg-emerald-500/15 text-emerald-700 border-emerald-300/40", dotColor: "bg-emerald-400" },
  { type: "split", label: "Split Shift", icon: BarChart3, start: "10:00", end: "20:00", color: "bg-rose-500/15 text-rose-700 border-rose-300/40", dotColor: "bg-rose-400" },
];

const OFF_REASONS = ["Day Off", "Vacation", "Sick Leave", "Personal", "Public Holiday"];
const VISIBLE_DAY_COUNT = 14;

type WorkAssignment = {
  id: string;
  employeeId: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  shiftType: string;
  shiftStart: string;
  shiftEnd: string;
  workDays: number[]; // 0=Mon ... 6=Sun
  note?: string;
};

type DayOff = {
  id: string;
  employeeId: string;
  date: string; // yyyy-MM-dd
  reason: string;
  note?: string;
};

export default function StoreScheduleSection({ storeId }: Props) {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [offDialog, setOffDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{ empId: string; dayIdx: number } | null>(null);
  const [tab, setTab] = useState("schedule");

  const [assignForm, setAssignForm] = useState({
    employeeId: "", startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    shiftType: "full", shiftStart: "09:00", shiftEnd: "17:00",
    workDays: [0, 1, 2, 3, 4] as number[], note: "",
  });

  const [offForm, setOffForm] = useState({
    employeeId: "", startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    reason: "Day Off", note: "",
  });

  const scheduleKey = `schedule_data_${storeId}`;
  const scheduleQueryKey = ["schedule-data", storeId] as const;

  const { data: scheduleData } = useQuery({
    queryKey: scheduleQueryKey,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", scheduleKey).maybeSingle();
      if (error) throw error;
      const value = data?.value && typeof data.value === "object" ? (data.value as any) : {};
      return {
        assignments: Array.isArray(value.assignments) ? (value.assignments as WorkAssignment[]) : [],
        daysOff: Array.isArray(value.daysOff) ? (value.daysOff as DayOff[]) : [],
      };
    },
  });

  useEffect(() => {
    if (!scheduleData) return;
    setAssignments(scheduleData.assignments);
    setDaysOff(scheduleData.daysOff);
  }, [scheduleData]);

  const saveScheduleMutation = useMutation({
    mutationFn: async (payload: { assignments: WorkAssignment[]; daysOff: DayOff[] }) => {
      const value = { assignments: payload.assignments, daysOff: payload.daysOff };
      const { data: existing, error: existingError } = await supabase.from("app_settings").select("id").eq("key", scheduleKey).maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        const { error } = await supabase.from("app_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", scheduleKey);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("app_settings").insert({ key: scheduleKey, value, description: "Store schedule data" });
        if (error) throw error;
      }
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData(scheduleQueryKey, payload);
    },
    onError: (error: any) => {
      toast.error("Failed to save schedule: " + error.message);
    },
  });

  const persistSchedule = (newAssignments: WorkAssignment[], newDaysOff: DayOff[]) => {
    const nextValue = { assignments: newAssignments, daysOff: newDaysOff };
    queryClient.setQueryData(scheduleQueryKey, nextValue);
    saveScheduleMutation.mutate(nextValue);
  };

  const { data: employees = [] } = useQuery({
    queryKey: ["store-employees-schedule", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("store_employees").select("*").eq("store_id", storeId).eq("status", "active").order("name");
      return (data || []) as any[];
    },
  });

  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const safeDaysOff = Array.isArray(daysOff) ? daysOff : [];
  const weekDates = Array.from({ length: VISIBLE_DAY_COUNT }, (_, i) => addDays(weekStart, i));

  // Get status for a specific employee on a specific date
  const getDayStatus = (empId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOff = safeDaysOff.find(d => d.employeeId === empId && d.date === dateStr);
    if (dayOff) return { status: "off" as const, dayOff, assignment: null };

    const dayOfWeek = (date.getDay() + 6) % 7; // convert to Mon=0
    const assignment = safeAssignments.find(a =>
      a.employeeId === empId &&
      Array.isArray(a.workDays) &&
      a.workDays.includes(dayOfWeek) &&
      isWithinInterval(date, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
    );
    if (assignment) return { status: "working" as const, dayOff: null, assignment };
    return { status: "unset" as const, dayOff: null, assignment: null };
  };

  const addAssignment = () => {
    if (!assignForm.employeeId || assignForm.workDays.length === 0) return;
    const newAssignment: WorkAssignment = {
      id: crypto.randomUUID(), employeeId: assignForm.employeeId,
      startDate: assignForm.startDate, endDate: assignForm.endDate,
      shiftType: assignForm.shiftType, shiftStart: assignForm.shiftStart,
      shiftEnd: assignForm.shiftEnd, workDays: assignForm.workDays,
      note: assignForm.note,
    };
    const updated = [...safeAssignments, newAssignment];
    setAssignments(updated);
    persistSchedule(updated, safeDaysOff);
    setAssignDialog(false);
    toast.success("Work schedule assigned");
  };

  const addDaysOff = () => {
    if (!offForm.employeeId) return;
    const start = parseISO(offForm.startDate);
    const end = parseISO(offForm.endDate);
    const days = eachDayOfInterval({ start, end });
    const newOffs = days.map(d => ({
      id: crypto.randomUUID(), employeeId: offForm.employeeId,
      date: format(d, "yyyy-MM-dd"), reason: offForm.reason, note: offForm.note,
    }));
    const updated = [...safeDaysOff, ...newOffs];
    setDaysOff(updated);
    persistSchedule(safeAssignments, updated);
    setOffDialog(false);
    toast.success(`${newOffs.length} day(s) off added`);
  };

  const removeAssignment = (id: string) => {
    const updated = safeAssignments.filter(a => a.id !== id);
    setAssignments(updated);
    persistSchedule(updated, safeDaysOff);
  };
  const removeDayOff = (id: string) => {
    const updated = safeDaysOff.filter(d => d.id !== id);
    setDaysOff(updated);
    persistSchedule(safeAssignments, updated);
  };

  const toggleWorkDay = (day: number) => {
    setAssignForm(f => ({
      ...f,
      workDays: f.workDays.includes(day) ? f.workDays.filter(d => d !== day) : [...f.workDays, day].sort(),
    }));
  };

  // Stats
  const weekStats = useMemo(() => {
    let totalShifts = 0;
    let totalHours = 0;
    const scheduledIds = new Set<string>();
    const coverageByDay = weekDates.map(() => 0);

    employees.forEach((emp: any) => {
      weekDates.forEach((date, dayIdx) => {
        const s = getDayStatus(emp.id, date);
        if (s.status === "working" && s.assignment) {
          totalShifts++;
          scheduledIds.add(emp.id);
          coverageByDay[dayIdx]++;
          const [sh, sm] = s.assignment.shiftStart.split(":").map(Number);
          const [eh, em] = s.assignment.shiftEnd.split(":").map(Number);
          totalHours += Math.max(0, (eh + em / 60) - (sh + sm / 60));
        }
      });
    });
    return { totalShifts, totalHours, scheduledCount: scheduledIds.size, coverageByDay };
  }, [employees, weekDates, safeAssignments, safeDaysOff]);

  const maxCoverage = Math.max(...weekStats.coverageByDay, 1);

  const copyWeek = () => {
    toast.success("Schedule copied to next week");
    setWeekStart(addWeeks(weekStart, 1));
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Total Shifts", value: weekStats.totalShifts, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Clock, label: "Total Hours", value: `${weekStats.totalHours.toFixed(0)}h`, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Users, label: "Scheduled Staff", value: weekStats.scheduledCount, color: "text-purple-500", bg: "bg-purple-500/10" },
          { icon: AlertTriangle, label: "Unscheduled", value: employees.length - weekStats.scheduledCount, color: "text-amber-500", bg: "bg-amber-500/10" },
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
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-2 h-16 min-w-[980px]">
            {weekDates.map((date, i) => {
              const count = weekStats.coverageByDay[i] || 0;
              const height = (count / maxCoverage) * 100;
              return (
                <div key={date.toISOString()} className="min-w-[60px] flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold">{count}</span>
                  <div className="w-full rounded-t-md bg-muted relative" style={{ height: "48px" }}>
                    <div className={cn("absolute bottom-0 w-full rounded-t-md transition-all", count > 0 ? "bg-primary/70" : "bg-muted-foreground/10")} style={{ height: `${Math.max(height, 5)}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{format(date, "EEE")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Week Nav + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(subWeeks(weekStart, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="text-sm font-semibold px-2">{format(weekStart, "MMM d")} — {format(addDays(weekStart, VISIBLE_DAY_COUNT - 1), "MMM d, yyyy")}</div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekStart(addWeeks(weekStart, 1))}><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="text-xs ml-1" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={copyWeek}><Copy className="w-3 h-3" /> Copy Week</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="w-3 h-3" /> Export</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 text-destructive" onClick={() => setOffDialog(true)}><CalendarOff className="w-3.5 h-3.5" /> Set Day Off</Button>
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => setAssignDialog(true)}><Plus className="w-3.5 h-3.5" /> Assign Work</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="schedule" className="text-xs gap-1.5"><Calendar className="w-3.5 h-3.5" /> Weekly View</TabsTrigger>
          <TabsTrigger value="assignments" className="text-xs gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Assignments ({safeAssignments.length})</TabsTrigger>
          <TabsTrigger value="daysoff" className="text-xs gap-1.5"><CalendarOff className="w-3.5 h-3.5" /> Days Off ({safeDaysOff.length})</TabsTrigger>
        </TabsList>

        {/* Weekly Grid */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1580px]">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-3 py-2.5 font-semibold text-xs text-muted-foreground w-40 sticky left-0 bg-muted/40 z-10">Employee</th>
                    {weekDates.map((date) => {
                      const isToday = isSameDay(date, new Date());
                      const weekDayIndex = (date.getDay() + 6) % 7;
                      const isWeekend = weekDayIndex >= 5;
                      return (
                        <th key={date.toISOString()} className={cn("text-center px-2 py-2.5 font-semibold text-xs min-w-[105px]", isToday ? "text-primary" : isWeekend ? "text-destructive/70" : "text-muted-foreground")}>
                          {format(date, "EEE")}<div className="text-[10px] font-normal">{format(date, "MMM d")}</div>
                        </th>
                      );
                    })}
                    <th className="text-center px-2 py-2.5 font-semibold text-xs text-muted-foreground w-16 sticky right-0 bg-muted/40 z-10">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan={weekDates.length + 2} className="text-center py-14 text-muted-foreground text-sm">No employees yet.</td></tr>
                  ) : employees.map((emp: any) => {
                    let weekHours = 0;
                    return (
                      <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-3 sticky left-0 bg-card z-10 min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{emp.name?.charAt(0)?.toUpperCase()}</div>
                            <div><p className="font-medium text-[12px] leading-tight">{emp.name}</p><p className="text-[10px] text-muted-foreground capitalize">{emp.role}</p></div>
                          </div>
                        </td>
                        {weekDates.map((date, dayIdx) => {
                          const isToday = isSameDay(date, new Date());
                          const { status, dayOff, assignment } = getDayStatus(emp.id, date);

                          if (status === "working" && assignment) {
                            const [sh, sm] = assignment.shiftStart.split(":").map(Number);
                            const [eh, em] = assignment.shiftEnd.split(":").map(Number);
                            weekHours += Math.max(0, (eh + em / 60) - (sh + sm / 60));
                          }

                          const preset = assignment ? SHIFT_PRESETS.find(p => p.type === assignment.shiftType) : null;

                          return (
                            <td key={date.toISOString()} className={cn("px-1 py-1.5 text-center align-top", isToday && "bg-primary/5")}>
                              {status === "off" ? (
                                <div className="w-full rounded-lg bg-destructive/8 border border-destructive/20 px-2 py-2 text-[10px]">
                                  <CalendarOff className="w-3.5 h-3.5 text-destructive/60 mx-auto mb-0.5" />
                                  <div className="font-medium text-destructive/80">{dayOff?.reason}</div>
                                </div>
                              ) : status === "working" && assignment ? (
                                <button
                                  onClick={() => setDetailDialog({ empId: emp.id, dayIdx })}
                                  className={cn("block w-full rounded-lg border px-2 py-1.5 text-[10px] font-medium transition-all hover:shadow-sm active:scale-95", preset?.color || SHIFT_PRESETS[3].color)}
                                >
                                  <div className="font-semibold capitalize">{assignment.shiftType}</div>
                                  <div className="opacity-75">{assignment.shiftStart}–{assignment.shiftEnd}</div>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const weekDayIndex = (date.getDay() + 6) % 7;
                                    setAssignForm(f => ({ ...f, startDate: format(date, "yyyy-MM-dd"), endDate: format(date, "yyyy-MM-dd"), workDays: [weekDayIndex] }));
                                    setAssignDialog(true);
                                  }}
                                  className="w-full h-12 rounded-lg border border-dashed border-border/50 flex items-center justify-center hover:bg-muted/30 hover:border-primary/30 transition-all group"
                                >
                                  <Plus className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-2 py-3 text-center sticky right-0 bg-card z-10">
                          <span className={cn("text-xs font-semibold", weekHours > 40 ? "text-destructive" : "text-foreground")}>{weekHours.toFixed(0)}h</span>
                          {weekHours > 40 && <AlertTriangle className="w-3 h-3 text-destructive mx-auto mt-0.5" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap mt-3">
            {SHIFT_PRESETS.map(p => (
              <div key={p.type} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", p.dotColor)} />
                <span className="text-[11px] text-muted-foreground">{p.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-destructive/30" /><span className="text-[11px] text-muted-foreground">Day Off</span></div>
            <div className="flex items-center gap-1.5 ml-2"><AlertTriangle className="w-3 h-3 text-destructive" /><span className="text-[11px] text-muted-foreground">Overtime (&gt;40h)</span></div>
          </div>
        </TabsContent>

        {/* Assignments List */}
        <TabsContent value="assignments" className="mt-4 space-y-3">
          {safeAssignments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No work assignments yet. Assign schedules to your employees.</p>
              <Button size="sm" onClick={() => setAssignDialog(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Assign Work</Button>
            </Card>
          ) : safeAssignments.map(a => {
            const emp = employees.find((e: any) => e.id === a.employeeId);
            const preset = SHIFT_PRESETS.find(p => p.type === a.shiftType);
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{emp?.name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{emp?.name || "Unknown"}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px]", preset?.color)}>{preset?.label}</Badge>
                        <span className="text-[11px] text-muted-foreground">{a.shiftStart}–{a.shiftEnd}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CalendarCheck className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{format(parseISO(a.startDate), "MMM d")} → {format(parseISO(a.endDate), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {DAYS.map((d, i) => (
                          <span key={i} className={cn("text-[9px] w-6 h-5 rounded flex items-center justify-center font-semibold",
                            a.workDays.includes(i) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"
                          )}>{d.charAt(0)}</span>
                        ))}
                      </div>
                      {a.note && <p className="text-[11px] text-muted-foreground mt-1.5 italic">"{a.note}"</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeAssignment(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* Days Off List */}
        <TabsContent value="daysoff" className="mt-4 space-y-3">
          {safeDaysOff.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarOff className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No days off set yet.</p>
              <Button size="sm" variant="outline" onClick={() => setOffDialog(true)} className="gap-1.5"><CalendarOff className="w-3.5 h-3.5" /> Set Day Off</Button>
            </Card>
          ) : (() => {
            const grouped = safeDaysOff.reduce((acc, d) => {
              const key = d.employeeId;
              if (!acc[key]) acc[key] = [];
              acc[key].push(d);
              return acc;
            }, {} as Record<string, DayOff[]>);

            return Object.entries(grouped).map(([empId, offs]) => {
              const emp = employees.find((e: any) => e.id === empId);
              return (
                <Card key={empId} className="p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{emp?.name?.charAt(0)}</div>
                    <div><p className="font-semibold text-sm">{emp?.name || "Unknown"}</p><p className="text-[10px] text-muted-foreground">{offs.length} day(s) off</p></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {offs.sort((a, b) => a.date.localeCompare(b.date)).map(off => (
                      <Badge key={off.id} variant="outline" className="text-[10px] gap-1 bg-destructive/5 text-destructive/80 border-destructive/20 pr-1">
                        {format(parseISO(off.date), "MMM d")} · {off.reason}
                        <button onClick={() => removeDayOff(off.id)} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            });
          })()}
        </TabsContent>
      </Tabs>

      {/* Assign Work Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Assign Work Schedule</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={assignForm.employeeId} onValueChange={v => setAssignForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>From Date</Label><Input type="date" value={assignForm.startDate} onChange={e => setAssignForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>To Date</Label><Input type="date" value={assignForm.endDate} onChange={e => setAssignForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Working Days</Label>
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <button key={i} onClick={() => toggleWorkDay(i)}
                    className={cn("w-10 h-9 rounded-lg text-xs font-semibold border transition-all",
                      assignForm.workDays.includes(i)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                    )}>{d.slice(0, 2)}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <button className="text-[10px] text-primary hover:underline" onClick={() => setAssignForm(f => ({ ...f, workDays: [0,1,2,3,4] }))}>Mon–Fri</button>
                <button className="text-[10px] text-primary hover:underline" onClick={() => setAssignForm(f => ({ ...f, workDays: [0,1,2,3,4,5] }))}>Mon–Sat</button>
                <button className="text-[10px] text-primary hover:underline" onClick={() => setAssignForm(f => ({ ...f, workDays: [0,1,2,3,4,5,6] }))}>Every Day</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Shift Type</Label>
              <div className="flex gap-2 flex-wrap">
                {SHIFT_PRESETS.map(p => {
                  const Icon = p.icon;
                  return (
                    <button key={p.type} onClick={() => setAssignForm(f => ({ ...f, shiftType: p.type, shiftStart: p.start, shiftEnd: p.end }))}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all",
                        assignForm.shiftType === p.type ? p.color + " border-current shadow-sm" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                      )}><Icon className="w-3 h-3" />{p.label}</button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Start Time</Label><Input type="time" value={assignForm.shiftStart} onChange={e => setAssignForm(f => ({ ...f, shiftStart: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>End Time</Label><Input type="time" value={assignForm.shiftEnd} onChange={e => setAssignForm(f => ({ ...f, shiftEnd: e.target.value }))} /></div>
            </div>

            <div className="space-y-1.5"><Label>Note (optional)</Label><Input value={assignForm.note} onChange={e => setAssignForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Training period, probation..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button onClick={addAssignment} disabled={!assignForm.employeeId || assignForm.workDays.length === 0}>Assign Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Off Dialog */}
      <Dialog open={offDialog} onOpenChange={setOffDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarOff className="w-4 h-4 text-destructive" /> Set Day(s) Off</DialogTitle></DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={offForm.employeeId} onValueChange={v => setOffForm(f => ({ ...f, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>From</Label><Input type="date" value={offForm.startDate} onChange={e => setOffForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>To</Label><Input type="date" value={offForm.endDate} onChange={e => setOffForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={offForm.reason} onValueChange={v => setOffForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OFF_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Note (optional)</Label><Input value={offForm.note} onChange={e => setOffForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOffDialog(false)}>Cancel</Button>
            <Button onClick={addDaysOff} disabled={!offForm.employeeId} variant="destructive">Set Day(s) Off</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cell Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={o => !o && setDetailDialog(null)}>
        <DialogContent className="max-w-sm">
          {detailDialog && (() => {
            const date = addDays(weekStart, detailDialog.dayIdx);
            const emp = employees.find((e: any) => e.id === detailDialog.empId);
            const { status, dayOff, assignment } = getDayStatus(detailDialog.empId, date);
            const preset = assignment ? SHIFT_PRESETS.find(p => p.type === assignment.shiftType) : null;
            return (
              <>
                <DialogHeader><DialogTitle>{format(date, "EEEE, MMM d")}</DialogTitle></DialogHeader>
                <div className="space-y-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{emp?.name?.charAt(0)}</div>
                    <div><p className="font-semibold text-sm">{emp?.name}</p><p className="text-xs text-muted-foreground capitalize">{emp?.role}</p></div>
                  </div>
                  {status === "working" && assignment && (
                    <Card className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[11px]", preset?.color)}>{preset?.label}</Badge>
                        <span className="text-sm font-medium">{assignment.shiftStart} – {assignment.shiftEnd}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Schedule: {format(parseISO(assignment.startDate), "MMM d")} → {format(parseISO(assignment.endDate), "MMM d, yyyy")}
                      </div>
                      {assignment.note && <p className="text-[11px] italic text-muted-foreground">"{assignment.note}"</p>}
                    </Card>
                  )}
                  {status === "off" && dayOff && (
                    <Card className="p-3 bg-destructive/5 border-destructive/20">
                      <p className="text-sm font-medium text-destructive">{dayOff.reason}</p>
                      {dayOff.note && <p className="text-[11px] text-muted-foreground mt-1">{dayOff.note}</p>}
                    </Card>
                  )}
                </div>
                <DialogFooter>
                  {status === "working" && assignment && (
                    <Button variant="destructive" size="sm" onClick={() => { removeAssignment(assignment.id); setDetailDialog(null); }}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove Assignment</Button>
                  )}
                  {status === "off" && dayOff && (
                    <Button variant="outline" size="sm" onClick={() => { removeDayOff(dayOff.id); setDetailDialog(null); }}><X className="w-3.5 h-3.5 mr-1.5" /> Remove Day Off</Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
