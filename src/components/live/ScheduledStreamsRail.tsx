/**
 * ScheduledStreamsRail — horizontal carousel of upcoming streams with
 * a live countdown and an RSVP toggle. Renders nothing when empty.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Bell from "lucide-react/dist/esm/icons/bell";
import BellRing from "lucide-react/dist/esm/icons/bell-ring";
import Users from "lucide-react/dist/esm/icons/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScheduledStreams } from "@/hooks/useScheduledStreams";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatRemaining(s: number): string {
  if (s <= 0) return "Live now";
  const days = Math.floor(s / 86400);
  if (days >= 1) return `in ${days}d ${Math.floor((s % 86400) / 3600)}h`;
  const hours = Math.floor(s / 3600);
  if (hours >= 1) return `in ${hours}h ${Math.floor((s % 3600) / 60)}m`;
  const mins = Math.floor(s / 60);
  if (mins >= 1) return `in ${mins}m ${s % 60}s`;
  return `in ${s}s`;
}

export default function ScheduledStreamsRail() {
  const { user } = useAuth();
  const { items, myRsvps, rsvp, unrsvp, loading } = useScheduledStreams(10);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const visible = useMemo(
    () => items.filter((s) => new Date(s.scheduled_at).getTime() > now - 60_000),
    [items, now]
  );

  if (loading || visible.length === 0) return null;

  return (
    <div className="px-4 pt-4 pb-1">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-violet-500" />
          Upcoming streams
          <span className="ml-1 text-[10px] font-bold text-muted-foreground">{visible.length}</span>
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {visible.map((s) => {
          const remaining = Math.max(0, Math.floor((new Date(s.scheduled_at).getTime() - now) / 1000));
          const going = myRsvps.has(s.id);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 w-[210px] rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {s.cover_url ? (
                  <img
                    src={s.cover_url}
                    alt={s.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-rose-500/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/40" />
                <span className="absolute top-2 left-2 rounded-full bg-violet-500/95 text-white text-[9px] font-bold px-2 py-0.5 inline-flex items-center gap-1 shadow">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatRemaining(remaining)}
                </span>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Users className="w-2.5 h-2.5 text-white/80" />
                  <span className="text-[10px] text-white font-bold tabular-nums">{s.rsvp_count}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-7 w-7 ring-2 ring-white/70 shadow">
                      <AvatarImage src={s.host_avatar ?? undefined} />
                      <AvatarFallback className="bg-violet-500/30 text-white text-[10px] font-bold">
                        {s.host_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[11px] font-bold text-white truncate drop-shadow flex-1 min-w-0">
                      {s.host_name}
                    </p>
                  </div>
                  <p className="text-[12px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {s.title}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!user?.id) {
                    toast.error("Sign in to RSVP");
                    return;
                  }
                  if (going) {
                    const ok = await unrsvp(s.id);
                    if (ok) toast.info(`Removed from ${s.host_name}'s reminders`);
                  } else {
                    const ok = await rsvp(s.id);
                    if (ok) toast.success(`You'll be notified when ${s.host_name} goes live`);
                  }
                }}
                className={cn(
                  "px-3 py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors",
                  going
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-t border-emerald-500/20"
                    : "bg-violet-500 text-white hover:bg-violet-600"
                )}
              >
                {going ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                {going ? "Going · You'll be notified" : "RSVP"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
