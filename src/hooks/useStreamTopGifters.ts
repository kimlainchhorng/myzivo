/**
 * useStreamTopGifters — top supporters for a single stream session.
 * Reads from `v_live_stream_top_gifters` and auto-refreshes when a new
 * `live_gift_displays` row arrives via realtime.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StreamTopGifter {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  coinsTotal: number;
  giftsCount: number;
  lastGiftAt: string;
}

export function useStreamTopGifters(streamId: string | undefined, limit = 10) {
  const [data, setData] = useState<StreamTopGifter[]>([]);
  const [loading, setLoading] = useState<boolean>(!!streamId);

  useEffect(() => {
    if (!streamId) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const fetchData = async () => {
      const { data: rows } = await (supabase as any)
        .from("v_live_stream_top_gifters")
        .select(
          "gifter_id, gifter_name, gifter_avatar, gifter_verified, coins_total, gifts_count, last_gift_at"
        )
        .eq("stream_id", streamId)
        .order("coins_total", { ascending: false })
        .limit(limit);
      if (cancelled) return;
      const mapped: StreamTopGifter[] = ((rows ?? []) as any[]).map((r, i) => ({
        rank: i + 1,
        userId: r.gifter_id,
        name: r.gifter_name ?? "Guest",
        avatar: r.gifter_avatar ?? null,
        verified: r.gifter_verified === true,
        coinsTotal: Number(r.coins_total) || 0,
        giftsCount: r.gifts_count ?? 0,
        lastGiftAt: r.last_gift_at,
      }));
      setData(mapped);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`stream-top-gifters-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_gift_displays",
          filter: `stream_id=eq.${streamId}`,
        },
        () => {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(fetchData, 500);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [streamId, limit]);

  return { data, loading };
}
