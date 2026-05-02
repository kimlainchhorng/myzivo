/**
 * useStreamGoalAndPin — realtime stream goal + pinned-comment state.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PinnedComment {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  content: string;
  created_at: string;
}

export function useStreamGoalAndPin(streamId: string | undefined) {
  const [coinGoal, setCoinGoal] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [pinnedCommentId, setPinnedCommentId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<PinnedComment | null>(null);
  const [loading, setLoading] = useState(!!streamId);

  useEffect(() => {
    if (!streamId) {
      setCoinGoal(0);
      setCoinsEarned(0);
      setPinnedCommentId(null);
      setPinned(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: row } = await (supabase as any)
        .from("live_streams")
        .select("coin_goal, coins_earned, pinned_comment_id")
        .eq("id", streamId)
        .maybeSingle();
      if (cancelled) return;
      const r = row as any;
      setCoinGoal(r?.coin_goal ?? 0);
      setCoinsEarned(r?.coins_earned ?? 0);
      setPinnedCommentId(r?.pinned_comment_id ?? null);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`stream-meta-${streamId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${streamId}` },
        (payload: any) => {
          const r = payload.new;
          if (typeof r.coin_goal === "number") setCoinGoal(r.coin_goal);
          if (typeof r.coins_earned === "number") setCoinsEarned(r.coins_earned);
          setPinnedCommentId(r.pinned_comment_id ?? null);
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  useEffect(() => {
    if (!pinnedCommentId) {
      setPinned(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: row } = await (supabase as any)
        .from("live_comments")
        .select("id, user_id, content, created_at")
        .eq("id", pinnedCommentId)
        .maybeSingle();
      if (!row || cancelled) return;
      const { data: prof } = await (supabase as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", (row as any).user_id)
        .maybeSingle();
      if (cancelled) return;
      setPinned({
        id: (row as any).id,
        user_id: (row as any).user_id,
        user_name: (prof as any)?.full_name ?? null,
        user_avatar: (prof as any)?.avatar_url ?? null,
        content: (row as any).content,
        created_at: (row as any).created_at,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [pinnedCommentId]);

  return { coinGoal, coinsEarned, pinned, loading };
}
