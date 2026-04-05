import { ArrowLeft, Calendar, Clock, Coffee, Palmtree, Thermometer, User, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { useState } from "react";

const SHIFT_META: Record<string, { label: string; icon: typeof Sunrise; gradient: string; color: string }> = {
  morning: { label: "Morning", icon: Sunrise, gradient: "from-amber-400 to-orange-400", color: "bg-amber-50 text-amber-700 border-amber-200" },
  afternoon: { label: "Afternoon", icon: Sun, gradient: "from-sky-400 to-blue-500", color: "bg-sky-50 text-sky-700 border-sky-200" },
  evening: { label: "Evening", icon: Moon, gradient: "from-violet-400 to-purple-500", color: "bg-violet-50 text-violet-700 border-violet-200" },
  full: { label: "Full Day", icon: Clock, gradient: "from-emerald-400 to-teal-500", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  split: { label: "Split", icon: BarChart3, gradient: "from-rose-400 to-pink-500", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const OFF_ICONS: Record<string, typeof Coffee> = {
  "Day Off": Coffee,
  "Vacation": Palmtree,
  "Sick Leave": Thermometer,
  "Personal": User,
};

type WorkAssignment = {
  id: string; employeeId: string;
  startDate: string; endDate: string;
  shiftType: string; shiftStart: string; shiftEnd: string;
  workDays: number[]; note?: string;
};

type DayOff = {
  id: string; employeeId: string;
  date: string; reason: string; note?: string;
};

export default function PersonalSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // Find the employee record for this user
  const { data: empRecord, isLoading: empLoading } = useQuery({
    queryKey: ["my-employee-record", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("store_employees")
        .select("id, store_id, name, role, employee_number")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Load schedule data for that store
  const { data: scheduleData, isLoading: schedLoading } = useQuery({
    queryKey: ["personal-schedule", empRecord?.store_id],
    queryFn: async () => {
      if (!empRecord?.store_id) return null;
      const key = `schedule_data_${empRecord.store_id}`;
      const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
      const value = data?.value && typeof data.value === "object" ? (data.value as any) : {};
      return {
        assignments: Array.isArray(value.assignments) ? (value.assignments as WorkAssignment[]) : [],
        daysOff: Array.isArray(value.daysOff) ? (value.daysOff as DayOff[]) : [],
      };
    },
    enabled: !!empRecord?.store_id,
  });

  const isLoading = empLoading || schedLoading;

  // Filter assignments & days off for this employee
  const myAssignments = (scheduleData?.assignments || []).filter(a => a.employeeId === empRecord?.id);
  const myDaysOff = (scheduleData?.daysOff || []).filter(d => d.employeeId === empRecord?.id);

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dow = (date.getDay() + 6) % 7;

    const off = myDaysOff.find(d => d.date === dateStr);
    if (off) return { type: "off" as const, reason: off.reason };

    const assignment = myAssignments.find(a => {
      if (!a.workDays.includes(dow)) return false;
      const start = new Date(a.startDate);
      const end = new Date(a.endDate);
      return date >= start && date <= end;
    });

    if (assignment) {
      const meta = SHIFT_META[assignment.shiftType] || SHIFT_META.full;
      return { type: "shift" as const, shiftType: assignment.shiftType, start: assignment.shiftStart, end: assignment.shiftEnd, meta };
    }

    return { type: "none" as const };
  };

  // Count weekly stats
  const weekShifts = weekDates.filter(d => getDayInfo(d).type === "shift").length;
  const weekHours = weekDates.reduce((sum, d) => {
    const info = getDayInfo(d);
    if (info.type !== "shift") return sum;
    const [sh, sm] = (info.start || "09:00").split(":").map(Number);
    const [eh, em] = (info.end || "17:00").split(":").map(Number);
    let hrs = eh - sh + (em - sm) / 60;
    if (hrs < 0) hrs += 24;
    return sum + hrs;
  }, 0);

  return (
    <AppLayout title="Schedule" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px]">My Schedule</h1>
        </div>

        {!empRecord && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-purple-500" />
            </div>
            <h2 className="font-semibold text-[15px] mb-1">No Schedule Found</h2>
            <p className="text-[13px] text-muted-foreground max-w-[260px]">You're not linked to any store as an employee yet.</p>
          </div>
        ) : (
          <>
            {/* Employee Info */}
            {empRecord && (
              <Card className="p-3 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {empRecord.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{empRecord.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{empRecord.role}
                    {empRecord.employee_number && <span className="ml-1.5 font-mono">· EMP-{String(empRecord.employee_number).padStart(5, "0")}</span>}
                  </p>
                </div>
              </Card>
            )}

            {/* Week Nav */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-0.5 bg-muted/40 rounded-full p-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-xs font-semibold h-8 px-4 rounded-full" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}
              </p>
            </div>

            {/* Week Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{weekShifts}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Shifts</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{weekHours.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Hours</p>
              </Card>
            </div>

            {/* Daily Schedule */}
            <div className="space-y-2">
              {weekDates.map(date => {
                const info = getDayInfo(date);
                const isToday = isSameDay(date, today);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <Card
                    key={date.toISOString()}
                    className={cn(
                      "p-3 transition-all",
                      isToday && "ring-2 ring-primary/30 shadow-md",
                      info.type === "none" && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Date */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                        isToday ? "bg-primary text-primary-foreground" : "bg-muted/50"
                      )}>
                        <span className="text-[10px] font-semibold uppercase leading-none">{format(date, "EEE")}</span>
                        <span className="text-lg font-bold leading-tight">{format(date, "d")}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {info.type === "shift" && (
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r shrink-0", info.meta.gradient)} />
                            <span className="text-[13px] font-semibold">{info.meta.label}</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums ml-auto">{info.start} – {info.end}</span>
                          </div>
                        )}
                        {info.type === "off" && (() => {
                          const OffIcon = OFF_ICONS[info.reason] || Coffee;
                          return (
                            <div className="flex items-center gap-2">
                              <OffIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-[13px] font-medium text-muted-foreground">{info.reason}</span>
                            </div>
                          );
                        })()}
                        {info.type === "none" && (
                          <span className="text-[12px] text-muted-foreground">
                            {isWeekend ? "Weekend" : "No shift"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
