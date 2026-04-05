/**
 * Personal Schedule — 2026 Facebook-density style
 */
import { ArrowLeft, Calendar, Clock, Coffee, Palmtree, Thermometer, User, ChevronLeft, ChevronRight, Sunrise, Sun, Moon, BarChart3, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday as checkIsToday } from "date-fns";
import { useState } from "react";
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

  const { data: empRecord, isLoading: empLoading } = useQuery({
    queryKey: ["my-employee-record", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: byUserId } = await supabase
        .from("store_employees")
        .select("id, store_id, name, role, employee_number, created_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (byUserId) return byUserId;
      if (user.email) {
        const { data: byEmail } = await supabase
          .from("store_employees")
          .select("id, store_id, name, role, employee_number, created_at")
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
  const weekOffs = weekDates.filter(d => getDayInfo(d).type === "off").length;

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
              {/* Employee Card — compact FB style */}
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

              {/* Week Navigator — pill bar */}
              <div className="flex items-center justify-between mb-2.5">
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

              {/* Stats Row — 3 col, ultra compact */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[
                  { value: weekShifts, label: "Shifts", color: "text-primary" },
                  { value: weekHours.toFixed(1), label: "Hours", color: "text-emerald-500" },
                  { value: weekOffs, label: "Off", color: "text-amber-500" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-card border border-border/30 py-2.5 text-center">
                    <p className={cn("text-xl font-extrabold leading-none", s.color)}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Day-by-day — FB list density */}
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
                          {info.type === "shift" && (() => {
                            const Icon = info.meta.icon;
                            return (
                              <div className="flex items-center gap-1.5">
                                <div className={cn("w-2 h-2 rounded-full shrink-0", info.meta.dot)} />
                                <span className="text-[12px] font-semibold text-foreground">{info.meta.label}</span>
                              </div>
                            );
                          })()}
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
