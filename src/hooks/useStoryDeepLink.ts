/**
 * useStoryDeepLink — Reads/writes the `?story=<story_id>` URL param so any
 * stories carousel (Profile / Feed / Chat) can deep-link directly into the
 * shared StoryViewer at the exact story segment.
 *
 * Uses react-router's useSearchParams so back/forward navigation closes or
 * reopens the viewer naturally without unmounting the underlying page.
 */
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useStoryDeepLink() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStoryId = searchParams.get("story");

  const openStory = useCallback(
    (storyId: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("story", storyId);
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const updateStory = useCallback(
    (storyId: string) => {
      const next = new URLSearchParams(searchParams);
      if (next.get("story") === storyId) return;
      next.set("story", storyId);
      // Replace so auto-advance doesn't pollute browser history
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const closeStory = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("story");
    setSearchParams(next, { replace: false });
  }, [searchParams, setSearchParams]);

  return { activeStoryId, openStory, updateStory, closeStory };
}
