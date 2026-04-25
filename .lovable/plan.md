## Goal

On the Profile page post (and any other place that uses `ProfileFeedCard`), make sure **Like, Comment, Share, and Save** all complete the full flow with proper persistence + counts + feedback — and give the action row a fresh, modern icon style.

## Problems found

1. **Like is not persisted.** `ProfileContentTabs.tsx` (line 778) only flips local state; nothing is written to `post_likes`. Refresh = like is lost. No author push notification.
2. **Comment** opens `CommentsSheet` (OK), but the post's `comments` count on the card is not refreshed after the user posts a comment, so the row still says the old number until full reload.
3. **Share** sets `sharePostId` and opens the share sheet — the share sheet works, but on success it doesn't bump a share counter or close cleanly in all cases. Verify the sheet's "Copy link / native share / cancel" all dismiss and toast.
4. **Save (Bookmark)** already persists to the `bookmarks` table — keep as-is, just restyle the icon.
5. **Icons** are plain Lucide outlines (`Heart / MessageCircle / Share2 / Bookmark`). User wants a new style.

## Changes

### 1. `src/components/profile/ProfileContentTabs.tsx` — wire Like to Supabase

Replace the inline `onToggleLike` (line 778) with a real `handleLikeToggle` that mirrors the canonical flow in `ReelsFeedPage` (`handleLike`, lines 1219-1259):

- Guard: require `user?.id`, block local-draft IDs.
- Optimistic update of `likedPosts` Set + `feed[].likes`.
- Insert/delete on `post_likes` keyed by `(post_id = stripped id, user_id)`.
- On error: roll back optimistic state + toast.
- On like (not unlike) and when `item.userId !== user.id`: fire `send-push-notification` with `post_liked`.
- On success: invalidate any feed queries so counts stay in sync across tabs.

Also hydrate the user's liked state on mount: query `post_likes` for the current user against the visible post IDs and seed `likedPosts`. (Currently `likedPosts` is empty on every load, so the heart never starts filled.)

### 2. Comment count refresh

After `CommentsSheet` adds a comment, bump `feed[item.id].comments` by 1. The sheet already exposes a callback pattern used elsewhere — pass an `onCommentAdded(postId)` prop from `ProfileContentTabs` that does `setFeed(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p))`.

### 3. Share flow

In `ProfileContentTabs`, when the `ShareSheet` (driven by `sharePostId`) reports success or close, clear `sharePostId` so the sheet fully dismisses. Add a toast on copy-link success if missing. No DB change needed (no `post_shares` table is in scope).

### 4. New icon style — `ProfileFeedCard.tsx`

Replace the four action buttons (lines 397-445) with a modern, slightly chunkier style consistent with ZIVO's v2026 design language:

- Use **filled/duotone** Lucide variants by toggling `fill` + a soft colored background pill on the active state.
- Active states:
  - Like → `Heart` filled, red gradient (`from-rose-500 to-red-600`) with subtle glow.
  - Comment → `MessageCircle` outline, neutral; on tap a quick scale bounce.
  - Share → swap `Share2` for **`Send`** (paper-plane, more modern, matches IG/TikTok).
  - Save → `Bookmark` filled emerald (`text-emerald-500 fill-emerald-500`) with soft `bg-emerald-500/10` chip.
- Each button becomes a 40×40 rounded-full tap target with a subtle hover background (`hover:bg-muted/40`) and `active:scale-90` micro-interaction.
- Counts moved to the right of each icon in a tighter `text-[12px] font-semibold tabular-nums` style.
- Group the three left actions in a single `gap-1` cluster; bookmark stays right-aligned.

Apply the same restyle anywhere else that renders the same row, so the look is consistent (only `ProfileFeedCard` based on current usage).

## Files

- `src/components/profile/ProfileContentTabs.tsx` — add `handleLikeToggle`, hydrate `likedPosts`, wire `onCommentAdded`, ensure share sheet dismisses cleanly.
- `src/components/profile/ProfileFeedCard.tsx` — accept `onCommentAdded` prop pass-through; restyle action row with new icons + chips.
- (If needed) `src/components/social/CommentsSheet.tsx` — emit `onCommentAdded(postId)` after a successful insert.

## Out of scope

- No schema changes (uses existing `post_likes`, `post_comments`, `bookmarks` tables).
- No changes to grid/photo/reel tabs — only the "All" feed action row.
