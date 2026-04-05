/**
 * Personal Schedule — 2026 Facebook-density style
 * Features: mini calendar strip, next shift countdown, hours progress, estimated earnings
 */
import { ArrowLeft, Calendar, Clock, Coffee, Palmtree, Thermometer, User, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, BarChart3, Briefcase, DollarSign, Timer, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, differenceInMinutes, isAfter, isBefore, isEqual } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHIFT_META: Record<string, { label: string; icon: typeof Sunrise; gradient: string; dot: string }> = {
  morning: { label: "Morning", icon: Sunrise, gradient: "from-amber-400 to-orange-400", dot: "bg-amber-400" },
  afternoon: { label: "Afternoon", icon: Sun, gradient: "from-sky-400 to-blue-500", dot: "bg-sky-400" },
  evening: { label: "Evening", icon: Moon, gradient: "from-violet-400 to-purple-500", dot: "bg-violet-400" },
  full: { label: "Full Day", icon: Clock, gradient: "from-emerald-400 to-teal-500", dot: "bg-emerald-500" },
  split: { label: "Split", icon: BarChart3, gradient: "from-rose-400 to-pink-500", dot: "bg-rose-400" },
};

const OFF_ICONS: Record<string, typeof Coffee> = {
  "Day Off": Coffee,
  "Vacation": Palmtree,
  "Sick Leave": Thermometer,
  "Personal": User,
};

const WEEKLY_TARGET_HOURS = 40;

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
  const [now, setNow] = useState(new Date());
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // Live clock for countdown
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { data: empRecord, isLoading: empLoading } = useQuery({
    queryKey: ["my-employee-record", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: byUserId } = await supabase
        .from("store_employees")
        .select("id, store_id, name, role, employee_number, created_at, hourly_rate")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (byUserId) return byUserId;
      if (user.email) {
        const { data: byEmail } = await supabase
          .from("store_employees")
          .select("id, store_id, name, role, employee_number, created_at, hourly_rate")
          .eq("email", user.email)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();
        if (byEmail) {
          await supabase.from("store_employees").update({ user_id: user.id }).eq("id", byEmail.id);
          return byEmail;
        }
      }
      return null;
    },
    enabled: !!user,
  });

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
  const myAssignments = (scheduleData?.assignments || []).filter(a => a.employeeId === empRecord?.id);
  const myDaysOff = (scheduleData?.daysOff || []).filter(d => d.employeeId === empRecord?.id);

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dow = (date.getDay() + 6) % 7;
    const off = myDaysOff.find(d => d.date === dateStr);
    if (off) return { type: "off" as const, reason: off.reason };
    const assignment = myAssignments.find(a => {
      if (!a.workDays.includes(dow)) return false;
      return date >= new Date(a.startDate) && date <= new Date(a.endDate);
    });
    if (assignment) {
      const meta = SHIFT_META[assignment.shiftType] || SHIFT_META.full;
      return { type: "shift" as const, shiftType: assignment.shiftType, start: assignment.shiftStart, end: assignment.shiftEnd, meta };
    }
    return { type: "none" as const };
  };

  const getShiftHours = (start: string, end: string) => {
    const [sh, sm] = (start || "09:00").split(":").map(Number);
    const [eh, em] = (end || "17:00").split(":").map(Number);
    let hrs = eh - sh + (em - sm) / 60;
    if (hrs < 0) hrs += 24;
    return hrs;
  };

  const weekShifts = weekDates.filter(d => getDayInfo(d).type === "shift").length;
  const weekHours = weekDates.reduce((sum, d) => {
    const info = getDayInfo(d);
    if (info.type !== "shift") return sum;
    return sum + getShiftHours(info.start, info.end);
  }, 0);
  const weekOffs = weekDates.filter(d => getDayInfo(d).type === "off").length;
  const hourlyRate = empRecord?.hourly_rate || 0;
  const estimatedEarnings = weekHours * hourlyRate;
  const hoursProgress = Math.min((weekHours / WEEKLY_TARGET_HOURS) * 100, 100);

  // Next shift countdown
  const nextShift = useMemo(() => {
    const upcoming: { date: Date; start: string; end: string; meta: typeof SHIFT_META["full"] }[] = [];
    // Check next 14 days
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      const info = getDayInfo(d);
      if (info.type === "shift") {
        const [sh, sm] = info.start.split(":").map(Number);
        const shiftDateTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sh, sm);
        if (isAfter(shiftDateTime, now)) {
          upcoming.push({ date: shiftDateTime, start: info.start, end: info.end, meta: info.meta });
          break;
        }
      }
    }
    return upcoming[0] || null;
  }, [now, myAssignments, myDaysOff]);

  const countdownText = useMemo(() => {
    if (!nextShift) return null;
    const diffMins = differenceInMinutes(nextShift.date, now);
    if (diffMins < 1) return "Starting now";
    if (diffMins < 60) return `in ${diffMins}m`;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h < 24) return `in ${h}h ${m}m`;
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return `in ${days}d ${remH}h`;
  }, [nextShift, now]);

  const empId = empRecord ? `EMP-${empRecord.created_at ? new Date(empRecord.created_at).getFullYear() : "2024"}-${String(empRecord.employee_number || 0).padStart(5, "0")}` : "";

  return (
    <AppLayout title="Schedule" hideHeader>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="safe-area-top" />
          <div className="flex items-center gap-3 px-4 h-11">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform -ml-1">
              <ArrowLeft className="w-[18px] h-[18px] text-foreground" />
            </button>
            <h1 className="font-bold text-[15px] text-foreground">My Schedule</h1>
          </div>
        </div>

        <div className="px-3 pb-24">
          {!empRecord && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-[14px] mb-1 text-foreground">No Schedule Found</h2>
              <p className="text-[12px] text-muted-foreground max-w-[240px]">You're not linked to any store as an employee yet.</p>
            </div>
          ) : (
            <>
              {/* Employee Card */}
              {empRecord && (
                <div className="flex items-center gap-2.5 py-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-[13px] ring-2 ring-primary/10">
                    {empRecord.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{empRecord.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      <span className="capitalize">{empRecord.role}</span>
                      {empId && <span className="ml-1 font-mono opacity-60">· {empId}</span>}
                    </p>
                  </div>
                  <Briefcase className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}

              {/* Next Shift Countdown Banner */}
              {nextShift && countdownText && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 px-3 py-2.5 mb-3 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Next Shift</p>
                    <p className="text-[12px] font-bold text-foreground leading-tight">
                      {nextShift.meta.label} · {nextShift.start} – {nextShift.end}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-extrabold text-primary leading-tight">{countdownText}</p>
                    <p className="text-[9px] text-muted-foreground">{format(nextShift.date, "EEE, MMM d")}</p>
                  </div>
                </motion.div>
              )}

              {/* Week Navigator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-0 bg-muted/30 rounded-full p-[3px]">
                  <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    className="text-[11px] font-semibold h-7 px-3 rounded-full hover:bg-muted/60 active:scale-95 transition-all"
                  >
                    Today
                  </button>
                  <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/60 active:scale-90 transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d")}
                </span>
              </div>

              {/* Mini Week Calendar Strip */}
              <div className="flex gap-1 mb-3">
                {weekDates.map(date => {
                  const info = getDayInfo(date);
                  const isToday = isSameDay(date, today);
                  return (
                    <div key={date.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-wider",
                        isToday ? "text-primary" : "text-muted-foreground/60"
                      )}>
                        {format(date, "EEE").charAt(0)}
                      </span>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                        isToday ? "bg-primary text-primary-foreground shadow-sm" : "bg-transparent text-foreground"
                      )}>
                        {format(date, "d")}
                      </div>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        info.type === "shift" ? (SHIFT_META[info.shiftType]?.dot || "bg-emerald-500") : "",
                        info.type === "off" ? "bg-amber-400" : "",
                        info.type === "none" ? "bg-transparent" : ""
                      )} />
                    </div>
                  );
                })}
              </div>

              {/* Stats Row — 3 col */}
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { value: weekShifts, label: "Shifts", color: "text-primary" },
                  { value: weekHours.toFixed(1), label: "Hours", color: "text-emerald-500" },
                  { value: weekOffs, label: "Off", color: "text-amber-500" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-card border border-border/30 py-2 text-center">
                    <p className={cn("text-lg font-extrabold leading-none", s.color)}>{s.value}</p>
                    <p className="text-[8px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Hours Progress Bar + Earnings */}
              <div className="rounded-xl bg-card border border-border/30 px-3 py-2.5 mb-3 space-y-2">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Weekly Hours</span>
                    <span className="text-[10px] font-bold text-foreground tabular-nums">{weekHours.toFixed(1)} / {WEEKLY_TARGET_HOURS}h</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${hoursProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        hoursProgress >= 100 ? "from-emerald-400 to-emerald-500" :
                        hoursProgress >= 75 ? "from-primary to-primary/80" :
                        "from-sky-400 to-primary"
                      )}
                    />
                  </div>
                </div>

                {/* Estimated Earnings */}
                {hourlyRate > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Est. Earnings</span>
                    </div>
                    <span className="text-[13px] font-extrabold text-emerald-500">${estimatedEarnings.toFixed(2)}</span>
                  </div>
                )}
                {hourlyRate <= 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60">Hourly rate not set</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Day-by-day list */}
              <div className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {weekDates.map((date, idx) => {
                    const info = getDayInfo(date);
                    const isToday = isSameDay(date, today);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <motion.div
                        key={date.toISOString()}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all",
                          isToday && "bg-primary/[0.04] ring-1 ring-primary/20",
                          info.type === "none" && !isToday && "opacity-50",
                          info.type !== "none" && !isToday && "bg-card border border-border/20"
                        )}
                      >
                        {/* Date badge */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 transition-colors",
                          isToday
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : info.type !== "none"
                              ? "bg-muted/40"
                              : "bg-transparent"
                        )}>
                          <span className="text-[8px] font-bold uppercase leading-none tracking-wider opacity-80">{format(date, "EEE")}</span>
                          <span className="text-[15px] font-extrabold leading-tight">{format(date, "d")}</span>
                        </div>

                        {/* Shift info */}
                        <div className="flex-1 min-w-0">
                          {info.type === "shift" && (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full shrink-0", info.meta.dot)} />
                                <span className="text-[12px] font-semibold text-foreground">{info.meta.label}</span>
                              </div>
                              <span className="text-[9px] text-muted-foreground/60 ml-3.5">
                                {getShiftHours(info.start, info.end).toFixed(1)}h
                              </span>
                            </div>
                          )}
                          {info.type === "off" && (() => {
                            const OffIcon = OFF_ICONS[info.reason] || Coffee;
                            return (
                              <div className="flex items-center gap-1.5">
                                <OffIcon className="w-3 h-3 text-amber-500" />
                                <span className="text-[12px] font-medium text-muted-foreground">{info.reason}</span>
                              </div>
                            );
                          })()}
                          {info.type === "none" && (
                            <span className="text-[11px] text-muted-foreground/70">{isWeekend ? "Weekend" : "No shift"}</span>
                          )}
                        </div>

                        {/* Time on right */}
                        {info.type === "shift" && (
                          <span className="text-[10px] text-muted-foreground font-mono tabular-nums shrink-0">
                            {info.start} – {info.end}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
