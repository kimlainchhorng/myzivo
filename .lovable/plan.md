# Fix profile post viewer parity, bookmarks error, and swipe handle polish

## Problems found while testing

1. **Bookmarks save fails** — `ProfileContentTabs` inserts a `title` column that doesn't exist in the `bookmarks` table, producing the red error banner shown in the feed: *"Could not find the 'title' column of 'bookmarks' in the schema cache."*
2. **Profile 3-dot menu buttons don't really work** — On the profile page (`/profile`), the post overlay's "..." menu uses placeholder `toast.info`/`toast.success` calls for Report, Turn on notifications, Not interested, and Comment settings. They show a toast but do nothing. The Reels feed already has real implementations (Report sheet, persistent notifications toggle, real "Hide" action, Comment settings sheet). The two viewers don't match.
3. **Duplicate grab pill in the bottom sheet** — Inside the profile post-options bottom sheet there is both the sheet's own drag affordance (top) AND a second `w-10 h-1` divider mid-sheet (line 879). That's the second bar visible in screenshot 330.
4. **Swipe handle visual** — the current 4px-tall, 36px-wide pill is hard to spot on photo posts; users don't realize they can drag.

## What I'll change

### 1. Bookmarks insert (fix red banner)
`src/components/profile/ProfileContentTabs.tsx`
- Remove `title:` and `collection_name:` from the insert payload (table only has `user_id`, `item_id`, `item_type`, `created_at`). Same fix mirrors the working `useBookmark` hook.

### 2. Profile post menu — wire real handlers (parity with Reels)
`src/components/profile/ProfileContentTabs.tsx` (overlay menu, lines ~882–955)
- **Report** → open the same `ReportSheet` flow used in Reels (categories → sub-reason → submitted), persisting to `post_reports` if available, otherwise a graceful confirmation.
- **Turn on/off notifications** → toggle local `post_followed` state stored per post in `post_subscriptions` (insert/delete row), label flips to "Turn off notifications".
- **Not interested** → insert `post_hidden` row and immediately remove the post from the visible list (optimistic).
- **Comment settings** (owner only) → open the same `CommentSettingsSheet` already implemented in Reels. Extract it into `src/components/social/PostCommentSettingsSheet.tsx` so both viewers reuse it.
- Keep existing working actions: Copy link, Share, Edit caption, Delete post.

### 3. Remove duplicate handle in bottom sheet
- Delete the standalone `<div className="w-10 h-1 ...">` on line 879 — `SwipeableSheet` already renders its own grab indicator.

### 4. Swipe handle — better affordance
`src/components/social/SwipeGrabHandle.tsx`
- Increase tap zone height from `h-5` → `h-8`, pill from `h-1 w-9` → `h-1.5 w-12`, and add a soft glow on dark tone (`shadow-[0_0_12px_rgba(255,255,255,0.25)]`) so it stays visible over photos.
- Add a one-time subtle pulse animation when the overlay first opens (`animate-pulse` for ~1.2s via a `useEffect` timeout) to teach the gesture.
- Move the handle from inside the header row to a dedicated full-width row above it so the header buttons (X, author, more) stop competing with the drag target.

### 5. Quick verification I'll run after the fixes
- Open a post from `/profile` → tap "..." → confirm Report opens the categories sheet, Notifications toggles label + persists, Not interested removes the post, Comment settings opens (owner).
- Tap the bookmark icon → confirm green "Saved" toast and no red error.
- Drag the new bigger pill down → overlay dismisses; pulse plays once on open.
- Re-check the Reels overlay to confirm the shared CommentSettings sheet still works.

## Files to edit
- `src/components/profile/ProfileContentTabs.tsx` (bookmark insert, menu handlers, remove duplicate handle)
- `src/components/social/SwipeGrabHandle.tsx` (size, glow, pulse, position)
- `src/pages/ReelsFeedPage.tsx` (use shared CommentSettings sheet)
- New: `src/components/social/PostCommentSettingsSheet.tsx` (extracted shared sheet)
- New: `src/components/social/PostReportSheet.tsx` (extracted shared sheet, optional if simpler to import inline)

No database migrations required — all writes target existing tables (`bookmarks`, `post_reports`, `post_hidden`, `post_subscriptions` already exist or fall back to local state if missing).
