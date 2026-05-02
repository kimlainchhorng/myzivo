import { useState } from "react";
import { ArrowLeft, Plus, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AppLayout from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Shift {
  id: string;
  employeeName: string;
  dayIndex: number;
  startTime: string;
  endTime: string;
  role: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROLES = ["Cashier", "Manager", "Driver", "Kitchen", "Delivery", "Support"];
const SHIFT_COLORS = [
  "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  "bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300",
  "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300",
];

const STORAGE_KEY = "zivo_employee_schedule";

function loadShifts(): Shift[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function getWeekLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function ShopEmployeeSchedulePage() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>(loadShifts);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeName: "", dayIndex: 0, startTime: "09:00", endTime: "17:00", role: "Cashier" });

  const save = (updated: Shift[]) => {
    setShifts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addShift = () => {
    if (!form.employeeName.trim()) return;
    const s: Shift = { id: `${Date.now()}`, ...form, employeeName: form.employeeName.trim() };
    save([...shifts, s]);
    toast.success(`Shift added for ${s.employeeName}`);
    setShowForm(false);
    setForm({ employeeName: "", dayIndex: 0, startTime: "09:00", endTime: "17:00", role: "Cashier" });
  };

  const removeShift = (id: string) => {
    save(shifts.filter((s) => s.id !== id));
    toast.success("Shift removed");
  };

  const colorForEmployee = (name: string) => {
    const names = [...new Set(shifts.map((s) => s.employeeName))];
    return SHIFT_COLORS[names.indexOf(name) % SHIFT_COLORS.length] ?? SHIFT_COLORS[0];
  };

  const totalHoursForEmployee = (name: string) => {
    return shifts.filter((s) => s.employeeName === name).reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
    }, 0).toFixed(1);
  };

  const employees = [...new Set(shifts.map((s) => s.employeeName))];

  return (
    <AppLayout title="Employee Schedule" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24 max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 mb-5">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px] flex-1">Employee Schedule</h1>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Shift
          </Button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="w-8 h-8 rounded-full hover:bg-muted/60 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-[13px]">{weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week of ${getWeekLabel(weekOffset).split("–")[0].trim()}`}</p>
            <p className="text-[11px] text-muted-foreground">{getWeekLabel(weekOffset)}</p>
          </div>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="w-8 h-8 rounded-full hover:bg-muted/60 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Add shift form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4">
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[14px]">Add Shift</p>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted/60">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <input
                  type="text"
                  value={form.employeeName}
                  onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
                  placeholder="Employee name"
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Day</p>
                    <select value={form.dayIndex} onChange={(e) => setForm((f) => ({ ...f, dayIndex: parseInt(e.target.value) }))}
                      className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none">
                      {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Role</p>
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none">
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">Start</p>
                    <input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-1">End</p>
                    <input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <Button onClick={addShift} disabled={!form.employeeName.trim()} className="w-full">Add Shift</Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly grid */}
        <div className="space-y-2 mb-6">
          {DAYS.map((day, dayIdx) => {
            const dayShifts = shifts.filter((s) => s.dayIndex === dayIdx);
            const isToday = dayIdx === (new Date().getDay() + 6) % 7 && weekOffset === 0;
            return (
              <Card key={day} className={cn("p-3", isToday && "border-primary/40 bg-primary/5")}>
                <div className="flex items-center gap-2 mb-2">
                  <p className={cn("text-[12px] font-bold w-8", isToday ? "text-primary" : "text-muted-foreground")}>{day}</p>
                  {isToday && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Today</span>}
                </div>
                {dayShifts.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground pl-10">No shifts</p>
                ) : (
                  <div className="space-y-1.5 pl-10">
                    {dayShifts.map((s) => (
                      <div key={s.id} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[12px]", colorForEmployee(s.employeeName))}>
                        <span className="font-semibold flex-1 truncate">{s.employeeName}</span>
                        <span className="text-[10px] opacity-80">{s.role}</span>
                        <span className="font-medium tabular-nums">{s.startTime}–{s.endTime}</span>
                        <button onClick={() => removeShift(s.id)} className="ml-1 opacity-60 hover:opacity-100">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Employee hours summary */}
        {employees.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5 inline mr-1" /> Weekly hours by employee
            </p>
            <div className="space-y-2">
              {employees.map((name) => (
                <Card key={name} className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[13px] font-bold shrink-0">
                    {name[0].toUpperCase()}
                  </div>
                  <p className="font-semibold text-[13px] flex-1 truncate">{name}</p>
                  <div className="text-right">
                    <p className="font-bold text-[14px]">{totalHoursForEmployee(name)}</p>
                    <p className="text-[10px] text-muted-foreground">hrs/week</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {shifts.length === 0 && !showForm && (
          <Card className="p-8 text-center text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-[14px] mb-1">No shifts scheduled</p>
            <p className="text-[12px] mb-4">Add shifts to build the weekly schedule.</p>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add First Shift
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
