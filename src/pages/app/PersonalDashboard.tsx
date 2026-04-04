/**
 * PersonalDashboard — Employee hub (Facebook-style compact layout).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Users, LogIn, LogOut, Calendar, Timer,
  CheckCircle2, ChevronRight, FileText, Bell, HelpCircle, Settings, Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";

type ClockStatus = "clocked-out" | "clocked-in";

const PersonalDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clockStatus, setClockStatus] = useState<ClockStatus>("clocked-out");
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [totalHoursToday, setTotalHoursToday] = useState(0);

  const handleClockIn = () => {
    setClockStatus("clocked-in");
    setClockInTime(new Date());
  };

  const handleClockOut = () => {
    if (clockInTime) {
      const hours = (Date.now() - clockInTime.getTime()) / 3600000;
      setTotalHoursToday((prev) => prev + hours);
    }
    setClockStatus("clocked-out");
    setClockInTime(null);
  };

  const formatElapsed = () => {
    if (!clockInTime) return "00:00:00";
    const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, "0");
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const [, setTick] = useState(0);
  if (clockStatus === "clocked-in") {
    setTimeout(() => setTick((t) => t + 1), 1000);
  }

  const menuItems = [
    { icon: Users, label: "Employees", description: "Manage team members", onClick: () => navigate("/personal/employees"), color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Briefcase, label: "Apply Job", description: "Create CV & apply", onClick: () => navigate("/personal/create-cv"), color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { icon: Calendar, label: "Schedule", description: "View work schedule", onClick: () => navigate("/personal/schedule"), color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Timer, label: "Timesheet", description: "View hours history", onClick: () => navigate("/personal/timesheet"), color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: FileText, label: "Pay Stubs", description: "Earnings & deductions", onClick: () => navigate("/personal/pay-stubs"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Bell, label: "Notifications", description: "Alerts & reminders", onClick: () => navigate("/personal/notifications"), color: "text-rose-500", bg: "bg-rose-500/10" },
    { icon: HelpCircle, label: "Help & Support", description: "FAQs & contact", onClick: () => navigate("/personal/help"), color: "text-sky-500", bg: "bg-sky-500/10" },
    { icon: Settings, label: "Settings", description: "Account preferences", onClick: () => navigate("/personal/settings"), color: "text-muted-foreground", bg: "bg-muted/60" },
  ];

  return (
    <AppLayout title="Personal" hideHeader>
      <div className="flex flex-col px-4 pt-3 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-bold text-[17px]">Personal Account</h1>
        </div>

        {/* Clock Card — compact */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl p-3.5 mb-3 border",
            clockStatus === "clocked-in"
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-card border-border/40"
          )}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", clockStatus === "clocked-in" ? "bg-emerald-500/15" : "bg-muted/60")}>
              <Clock className={cn("w-4 h-4", clockStatus === "clocked-in" ? "text-emerald-500" : "text-muted-foreground")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] leading-tight">
                {clockStatus === "clocked-in" ? "Currently Working" : "Not Clocked In"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {clockStatus === "clocked-in"
                  ? `Since ${clockInTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Tap Clock In to start"}
              </p>
            </div>
            {clockStatus === "clocked-in" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>

          <div className="text-center mb-3">
            <p className="text-2xl font-mono font-bold tracking-wider">{formatElapsed()}</p>
            <p className="text-[11px] text-muted-foreground">Today: {totalHoursToday.toFixed(1)}h logged</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClockIn}
              disabled={clockStatus === "clocked-in"}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all",
                clockStatus === "clocked-in"
                  ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  : "bg-emerald-500 text-white"
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              Clock In
            </button>
            <button
              onClick={handleClockOut}
              disabled={clockStatus !== "clocked-in"}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] transition-all",
                clockStatus !== "clocked-in"
                  ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              <LogOut className="w-3.5 h-3.5" />
              Clock Out
            </button>
          </div>
        </motion.div>

        {/* Menu List — Facebook-style compact rows */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-muted/30 transition-colors touch-manipulation active:bg-muted/50 text-left"
            >
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.bg)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px] leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{item.description}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PersonalDashboard;
