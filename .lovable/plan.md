# Story carousel — fix what happens after publishing

## What I observed in the live test

1. Logged into the preview as `klainkonkat@gmail.com` and reproduced the flow on `/profile`.
2. After the previous fix (column rename to `text_overlay` / `view_count`), the publish call succeeds and the story shows up in the rings.
3. The remaining issues that surface **after** publishing and tapping the ring:
   - Tapping **your own** ring on the feed always opens the viewer; there is no way to add another segment from the ring (Instagram/Facebook always offer "Add to your story").
   - The duplicate-key React warning in the console still fires from `StoryViewer` whenever it is opened from `ProfileStories`. The current trace points at `AnimatePresence > StoryViewer > ProfileStories`.
   - The "Your story" thumbnail shows only the avatar — never the latest story media — so right after publishing it's not obvious the upload succeeded until the viewer is opened.

## Fixes to ship

### 1. "Your story" ring becomes Add + View
File: `src/components/social/FeedStoryRing.tsx` (and mirror in `ChatStories` / `ProfileStories` if they expose the same affordance)

- Replace the single `onClick` with a small action sheet (existing `Sheet` primitive) when the user already has a story:
  - "View your story" → opens viewer
  - "Add to your story" → opens `CreateStorySheet`
- If the user has no story, keep current behavior: open `CreateStorySheet` directly.
- Keep the `+` plus-badge always visible so adding stays one tap away.

### 2. Show latest media as the "Your story" thumbnail
File: `src/components/social/FeedStoryRing.tsx`

- When `myGroup.stories.length > 0`, render an `<img>` (or first video frame poster) of the latest segment as the ring background instead of always falling back to the avatar.
- Continue to overlay the avatar small in the corner when media is shown.

### 3. Remove the residual duplicate-key warning from StoryViewer
File: `src/components/stories/StoryViewer.tsx`

- Audit every `AnimatePresence` block (lines 458, 618, 750, 798, 874, 948) and ensure each direct child has a stable, unique key. Most likely culprits:
  - The outer `AnimatePresence` (line 458) wraps a single `motion.div` with no key — give it `key={currentStory.id}` so navigation re-mounts cleanly.
  - The viewers / comments lists already use stable keys, but defend against duplicate `viewer_id` rows by deduping in the query map.
- After the change, navigate forward/back through a 2+ segment story in the viewer and confirm no warning is logged.

### 4. Verification (browser test)
- Log in, publish a fresh story, confirm:
  - The ring thumbnail updates to the new media within ~1 s.
  - Tapping the ring shows the action sheet with View / Add.
  - "Add" opens `CreateStorySheet` and a second segment can be published.
  - Console is free of the duplicate-key and previous warnings.
  - `?debug=stories` panel still shows green for Database / Feed / Profile / Chat.

## Out of scope (already fixed in the previous turn)
- Column-name mismatch on `stories` (`text_overlay`, `view_count`).
- RLS SELECT policy for own + active stories.
- `invalidateAllStoryCaches` predicate keys for Feed / Chat / Profile.
- `AuthProvider` mount fix that previously caused the blank screen.
