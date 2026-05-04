/**
 * LiveNowStrip — horizontal strip of currently-live creators, shown inline
 * in the feed. Pulls from `live_streams` (status="live"), self-hides when
 * nothing is live so the surface never sits empty.
 *
 * Replaces the previous hardcoded mock that shipped with fabricated names
 * (Chef Maria, TechTalk, etc).
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LiveStreamRow {
  id: string;
  user_id: string | null;
  title: string | null;
  host_name: string | null;
  host_avatar: string | null;
  viewer_count: number | null;
}

function compactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1_000_000) return Math.round(n / 1000) + "k";
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
}

function initialsOf(name: string | null | undefined): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "L";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LiveNowStrip() {
  const navigate = useNavigate();

  const { data: streams = [] } = useQuery<LiveStreamRow[]>({
    queryKey: ["feed-live-now-strip"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("live_streams")
        .select("id, user_id, title, host_name, host_avatar, viewer_count")
        .eq("status", "live")
        .is("ended_at", null)
        .order("viewer_count", { ascending: false })
        .limit(12);
      return (data as LiveStreamRow[]) ?? [];
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });

  if (streams.length === 0) return null;

  return (
    <section
      aria-label="Live now"
      className="bg-card border-b border-border/10 px-3 py-3"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" aria-hidden="true" />
          Live Now
        </h3>
        <button
          type="button"
          onClick={() => navigate("/live")}
          className="text-[12px] font-semibold text-primary active:opacity-70"
        >
          See all
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {streams.map((s) => {
          const name = s.host_name || s.title || "Live";
          const viewers = s.viewer_count ?? 0;
          const targetUser = s.user_id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate(targetUser ? `/user/${targetUser}` : "/live")}
              aria-label={`Watch ${name} live, ${compactCount(viewers)} watching`}
              className="shrink-0 flex flex-col items-center gap-1.5 w-[80px] active:opacity-70 transition-opacity"
            >
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-border">
                  <AvatarImage src={s.host_avatar || undefined} alt="" />
                  <AvatarFallback className="text-white text-sm font-bold bg-foreground">
                    {initialsOf(s.host_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-foreground text-white text-[8px] font-bold px-1 rounded-full leading-none py-0.5">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] font-semibold text-foreground text-center leading-tight line-clamp-1 w-full">
                {name}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {compactCount(viewers)} watching
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
