/**
 * useVerificationRealtime — subscribe once at app boot. When an admin
 * flips a `profiles.is_verified` or `store_profiles.is_verified` flag,
 * every connected client receives the postgres_changes event and
 * invalidates the relevant react-query caches so the badge updates
 * everywhere within ~1 second.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const KEYS_TO_INVALIDATE: Array<readonly unknown[]> = [
  ["admin-users"],
  ["admin-stores-verification"],
  ["suggested-users"],
  ["follow-suggestions"],
  ["public-profile"],
  ["verified-status"],
  ["feed"],
  ["feed-posts"],
  ["reels-feed"],
  // Chat surfaces
  ["chat-hub-personal"],
  ["chat-hub-shop"],
  ["chat-hub-ride"],
  ["chat-hub-support"],
  ["chat-hub-groups"],
  ["personal-chat-peer"],
  // Notifications + social
  ["social-notifications"],
  ["notifications"],
  ["activity-feed"],
  // Discovery
  ["explore-users"],
  ["explore-trending"],
  ["smart-search-users"],
  ["smart-search"],
  // Live
  ["live-stream-host"],
  ["live-stream-viewers"],
  ["live-chat"],
  ["live-streams"],
  // Other surfaces
  ["dating-profiles"],
  ["sound-posts"],
  ["leaderboard"],
  ["qr-profile"],
];

export function useVerificationRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`verification-realtime-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const oldV = (payload.old as any)?.is_verified;
          const newV = (payload.new as any)?.is_verified;
          if (oldV === newV) return;
          KEYS_TO_INVALIDATE.forEach((k) =>
            qc.invalidateQueries({ queryKey: k }),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "store_profiles" },
        (payload) => {
          const oldV = (payload.old as any)?.is_verified;
          const newV = (payload.new as any)?.is_verified;
          if (oldV === newV) return;
          KEYS_TO_INVALIDATE.forEach((k) =>
            qc.invalidateQueries({ queryKey: k }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
