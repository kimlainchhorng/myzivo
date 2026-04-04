/**
 * PersonalDashboard — Employee hub with Clock In/Out and team management.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Users, LogIn, LogOut, Calendar, Timer,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/app/AppLayout";

type ClockStatus = "clocked-out" | "clocked-in" | "on-break";

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

  // Live timer
  const [, setTick] = useState(0);
  if (clockStatus === "clocked-in") {
    setTimeout(() => setTick((t) => t + 1), 1000);
  }

  const quickActions = [
    {
      icon: Users,
      label: "Employees",
      description: "Manage team members",
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/personal/employees"),
    },
    {
      icon: Calendar,
      label: "Schedule",
      description: "View work schedule",
      color: "from-purple-500 to-purple-600",
      onClick: () => navigate("/personal/schedule"),
    },
    {
      icon: Timer,
      label: "Timesheet",
      description: "View hours history",
      color: "from-amber-500 to-amber-600",
      onClick: () => navigate("/personal/timesheet"),
    },
  ];

  return (
    <AppLayout title="Personal" hideHeader>
      <div className="flex flex-col px-5 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <h1 className="font-bold text-xl">Personal Account</h1>
        </div>

        {/* Clock Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl p-5 mb-5 border shadow-sm",
            clockStatus === "clocked-in"
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-card border-border/40"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                clockStatus === "clocked-in"
                  ? "bg-emerald-500/15"
                  : "bg-muted/60"
              )}
            >
              <Clock
                className={cn(
                  "w-5 h-5",
                  clockStatus === "clocked-in"
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                )}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {clockStatus === "clocked-in" ? "Currently Working" : "Not Clocked In"}
              </p>
              <p className="text-xs text-muted-foreground">
                {clockStatus === "clocked-in"
                  ? `Since ${clockInTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Tap Clock In to start"}
              </p>
            </div>
            {clockStatus === "clocked-in" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-muted-foreground/40" />
            )}
          </div>

          {/* Timer display */}
          <div className="text-center mb-5">
            <p className="text-4xl font-mono font-bold tracking-wider">
              {formatElapsed()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Today: {totalHoursToday.toFixed(1)}h logged
            </p>
          </div>

          {/* Clock In / Out Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClockIn}
              disabled={clockStatus === "clocked-in"}
              className={cn(
                "flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-[0.97] transition-all shadow-sm",
                clockStatus === "clocked-in"
                  ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              )}
            >
              <LogIn className="w-4 h-4" />
              Clock In
            </button>
            <button
              onClick={handleClockOut}
              disabled={clockStatus !== "clocked-in"}
              className={cn(
                "flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-[0.97] transition-all shadow-sm",
                clockStatus !== "clocked-in"
                  ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              <LogOut className="w-4 h-4" />
              Clock Out
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/30 bg-card/60 hover:bg-card/90 transition-colors touch-manipulation active:scale-[0.98] text-left"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
              >
                <action.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PersonalDashboard;
