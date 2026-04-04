/**
 * ActivityLogPage — Full history of logins, actions, changes with filters
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, LogIn, Settings, Pencil, Trash2, Loader2, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { motion } from "framer-motion";

const ACTION_ICONS: Record<string, typeof LogIn> = {
  login: LogIn,
  settings_change: Settings,
  profile_update: Pencil,
  account_delete: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
  login: "bg-sky-500/15 text-sky-500",
  settings_change: "bg-indigo-500/15 text-indigo-500",
  profile_update: "bg-emerald-500/15 text-emerald-500",
  account_delete: "bg-rose-500/15 text-rose-500",
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "login", label: "Logins" },
  { value: "settings_change", label: "Settings" },
  { value: "profile_update", label: "Profile" },
];

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export default function ActivityLogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity-log", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await (supabase as any)
        .from("account_activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const filtered = useMemo(
    () => filter === "all" ? activities : activities.filter((a: any) => a.action_type === filter),
    [activities, filter]
  );

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach((a: any) => {
      const label = getDateLabel(a.created_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(a);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Activity Log</h1>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12 text-muted-foreground" />}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity recorded yet</p>
          </div>
        )}
        {grouped.map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{dateLabel}</p>
            <div className="space-y-1.5">
              {items.map((a: any, i: number) => {
                const Icon = ACTION_ICONS[a.action_type] || Shield;
                const colorClass = ACTION_COLORS[a.action_type] || "bg-primary/10 text-primary";
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/40"
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass.split(" ")[0]}`}>
                      <Icon className={`h-4 w-4 ${colorClass.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.description || a.action_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        {a.device_info && ` · ${a.device_info}`}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
