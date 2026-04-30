/**
 * usePostViewTracking — increment a post's view count when it stays in view
 * for at least DWELL_MS. Each (post, user) is counted only once per session
 * to avoid inflating numbers from rapid scrolls.
 *
 * Increments are best-effort and fire-and-forget; failures don't surface to
 * the user.
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const DWELL_MS = 1500;

// Posts already counted this session — survives rerenders, resets on reload.
const sessionViewed = new Set<string>();

export function usePostViewTracking(
  postId: string,
  source: "store" | "user",
  isActive: boolean,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only track when the post is the active card
    if (!isActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    const key = `${source}:${postId}`;
    if (sessionViewed.has(key)) return;

    timerRef.current = setTimeout(() => {
      sessionViewed.add(key);
      // Use the right RPC per source. Both increment_*_view_count RPCs are
      // SECURITY DEFINER so anonymous viewers can be counted too.
      const rpcName = source === "user" ? "increment_user_post_views" : "increment_store_post_views";
      supabase.rpc(rpcName as any, { _post_id: postId }).then(({ error }) => {
        if (error) {
          // RPC missing in this environment? Roll back the dedup so the next
          // dwell can retry, but stay silent — view counts are non-critical.
          sessionViewed.delete(key);
        }
      }, () => {
        sessionViewed.delete(key);
      });
    }, DWELL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [postId, source, isActive]);
}
