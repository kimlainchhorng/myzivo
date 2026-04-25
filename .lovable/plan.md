## Fixes & follow-ups for Like / Comment / Share / Save

Based on the screenshot error and your QA list.

### 1. Fix "duplicate key value violates unique constraint post_likes_post_id_user_id_key"

Cause: in `handleLikeToggle` (ProfileContentTabs.tsx), the optimistic UI flips `likedPosts` first, then sends an `insert`. If the row already exists in DB (stale hydration, fast double-tap, or another tab), the insert collides with the unique `(post_id, user_id)` constraint and Supabase throws → toast error → state rolls back to "unliked", confusing the user.

Fix:
- Treat Postgres error code `23505` (unique_violation) as **success-no-op** — desired end state already reached.
- Same idea for delete: if no row matched, that's also a success-no-op.
- Keep the optimistic UI exactly as it is now.

### 2. Add engagement tracking

Use the existing `track()` helper in `src/lib/analytics.ts` (already writes to the `analytics_events` table with `event_id` dedupe + offline queue). Fire one event per action with a consistent shape:

| Event | Fired in | Payload |
|---|---|---|
| `post_liked` | handleLikeToggle (insert path) | `{ post_id, author_id, surface: "profile_feed" }` |
| `post_unliked` | handleLikeToggle (delete path) | `{ post_id, author_id, surface: "profile_feed" }` |
| `post_comment_opened` | openComments | `{ post_id, author_id }` |
| `post_comment_added` | onCommentsCountChange when count rises | `{ post_id, author_id, total: count }` |
| `post_share_opened` | onShare | `{ post_id, author_id }` |
| `post_bookmarked` / `post_unbookmarked` | handleBookmarkToggle | `{ post_id, author_id }` |

These flow into `analytics_events` and you can already group by `event_name` + `properties->>post_id` and `date_trunc('day', created_at)` for per-post / per-day metrics.

### 3. Validate share sheet

`UnifiedShareSheet` (already used) calls `onClose` for cancel + after copy/native-share success — `setSharePostId(null)` dismisses cleanly. No code change needed; will confirm by tap-test after rebuild. If a residual issue appears we can add a defensive `key={sharePostId}` to force remount.

### 4. Comment count via `onCommentsCountChange`

Already wired in the previous turn — the `feed[item].comments` updates in place when `usePostComments` reports a new total (covers both add and delete).

### 5. New action row QA (iOS / Android safe-area + a11y)

Already passes — h-10 = 40px which is below the 44pt iOS minimum. Bump tap targets to `min-h-[44px]` to match Apple's HIG and Android Material guidance, while keeping the visual chip the same size by using inner padding. Add `focus-visible:ring-2 ring-primary/40` for keyboard a11y.

### 6. Like persistence verified after refresh

`useEffect` hydrating `likedPosts` from `post_likes` was added in the previous turn — heart starts filled on reload for posts the user liked. With (1) above, repeat taps no longer error.

## Files

- `src/components/profile/ProfileContentTabs.tsx` — make like insert/delete idempotent (treat 23505 / 0 rows as success); add `track()` calls for like/unlike/comment open/comment added/share/bookmark.
- `src/components/profile/ProfileFeedCard.tsx` — bump button heights to `min-h-[44px]`, add `focus-visible` ring.

## Out of scope

- No DB schema changes. Existing `analytics_events`, `post_likes`, `post_comments`, `bookmarks` tables are sufficient.
- No new dashboard UI; raw events land in `analytics_events` for query.
