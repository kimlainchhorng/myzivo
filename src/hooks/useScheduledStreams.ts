/**
 * useScheduledStreams — upcoming scheduled streams + RSVP state.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduledStream {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  host_name: string;
  host_avatar: string | null;
  cover_url: string | null;
  scheduled_at: string;
  rsvp_count: number;
}

export function useScheduledStreams(limit = 8) {
  const { user } = useAuth();
  const [items, setItems] = useState<ScheduledStream[]>([]);
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await (supabase as any)
      .from("live_streams")
      .select("id, user_id, title, topic, host_name, host_avatar, cover_url, scheduled_at")
      .eq("status", "scheduled")
      .is("ended_at", null)
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    const ids = ((rows ?? []) as any[]).map((r) => r.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: rsvpRows } = await (supabase as any)
        .from("live_stream_rsvps")
        .select("stream_id")
        .in("stream_id", ids);
      for (const r of (rsvpRows ?? []) as any[]) {
        counts.set(r.stream_id, (counts.get(r.stream_id) ?? 0) + 1);
      }
    }
    setItems(
      ((rows ?? []) as any[]).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title || "Live Stream",
        topic: r.topic || "General",
        host_name: r.host_name || "Host",
        host_avatar: r.host_avatar ?? null,
        cover_url: r.cover_url ?? null,
        scheduled_at: r.scheduled_at,
        rsvp_count: counts.get(r.id) ?? 0,
      })) as ScheduledStream[]
    );
    if (user?.id && ids.length) {
      const { data: mine } = await (supabase as any)
        .from("live_stream_rsvps")
        .select("stream_id")
        .eq("user_id", user.id)
        .in("stream_id", ids);
      setMyRsvps(new Set(((mine ?? []) as any[]).map((r) => r.stream_id)));
    } else {
      setMyRsvps(new Set());
    }
    setLoading(false);
  }, [limit, user?.id]);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("scheduled-streams-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        (payload: any) => {
          const r = payload.new ?? payload.old;
          if (r?.status === "scheduled" || r?.scheduled_at) refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_stream_rsvps" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const rsvp = useCallback(async (streamId: string) => {
    const { error } = await (supabase as any).rpc("rsvp_scheduled_stream", { p_stream_id: streamId });
    if (!error) {
      setMyRsvps((s) => {
        const n = new Set(s);
        n.add(streamId);
        return n;
      });
      setItems((prev) =>
        prev.map((p) => (p.id === streamId ? { ...p, rsvp_count: p.rsvp_count + 1 } : p))
      );
    }
    return !error;
  }, []);

  const unrsvp = useCallback(async (streamId: string) => {
    const { error } = await (supabase as any).rpc("unrsvp_scheduled_stream", { p_stream_id: streamId });
    if (!error) {
      setMyRsvps((s) => {
        const n = new Set(s);
        n.delete(streamId);
        return n;
      });
      setItems((prev) =>
        prev.map((p) => (p.id === streamId ? { ...p, rsvp_count: Math.max(0, p.rsvp_count - 1) } : p))
      );
    }
    return !error;
  }, []);

  return { items, myRsvps, rsvp, unrsvp, loading, refresh };
}
