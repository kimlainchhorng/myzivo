/**
 * useStoryRealtime — Subscribes to live changes on the active story's
 * reactions, comments, and views. Any INSERT / UPDATE / DELETE event
 * invalidates the matching React Query caches so the owner (and viewers)
 * see new emoji counts and threaded replies without refreshing.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStoryRealtime(storyId: string | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!storyId) return;

    const channel = supabase
      .channel(`story-live:${storyId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "story_reactions",
          filter: `story_id=eq.${storyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["story-reactions-list", storyId] });
          queryClient.invalidateQueries({ queryKey: ["story-my-reaction", storyId] });
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "story_comments",
          filter: `story_id=eq.${storyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] });
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "story_views",
          filter: `story_id=eq.${storyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["story-viewers", storyId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId, queryClient]);
}
