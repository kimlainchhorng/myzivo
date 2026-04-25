/**
 * Shared helpers for the Stories surface.
 *
 * - `invalidateAllStoryCaches` — single place to refresh every carousel
 *   (Profile, Feed, Chat) plus per-user "my stories" + view-state.
 * - `parseStorageKeyFromPublicUrl` — turn a `…/user-stories/<key>` public
 *   URL back into the storage object key so we can delete the file.
 */
import type { QueryClient } from "@tanstack/react-query";

export const STORIES_BUCKET = "user-stories";

/** Invalidate every cache the story system reads from. */
export function invalidateAllStoryCaches(qc: QueryClient, userId?: string | null) {
  qc.invalidateQueries({ queryKey: ["feed-story-users"], exact: true });
  qc.invalidateQueries({ queryKey: ["user-stories"], exact: true });
  if (userId) {
    qc.invalidateQueries({ queryKey: ["profile-story-rings", userId], exact: true });
    qc.invalidateQueries({ queryKey: ["profile-my-story", userId], exact: true });
    qc.invalidateQueries({ queryKey: ["my-story-views", userId], exact: true });
  }
}

/**
 * Convert a public storage URL into its bucket key.
 * Returns null if the URL doesn't look like a `user-stories` public URL.
 */
export function parseStorageKeyFromPublicUrl(url?: string | null): string | null {
  if (!url) return null;
  const marker = `/${STORIES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const key = url.slice(idx + marker.length).split("?")[0];
  return key || null;
}
