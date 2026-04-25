## Findings (already verified)

- **RLS SELECT policy on `stories`** — already correct: `Anyone can read active stories USING (expires_at > now())`. Both your own sessions and the feed can read it. **No DB change needed.**
- **Your story IS in the DB** — confirmed earlier (1 active row, expires in ~23 h).
- **`invalidateAllStoryCaches`** — already rewritten last turn to use predicate-based invalidation + active refetch on every story-related cache key (`feed-story-users`, `user-stories`, `profile-story-rings`, `profile-my-story`, `my-story-views`, `chat-story-rings`, `story-author-profiles`, `feed-story-profiles`). Will add `chat-story-rings` and confirm it covers `my-story-views`.
- **Duplicate-key warning** — root cause was hidden file `<input>` elements rendered as un-keyed siblings inside `<AnimatePresence>`. Already moved them outside and added an explicit `key="create-story-sheet"` to the outer motion.div.
- **Auto refresh after publish** — `CreateStorySheet` already calls `invalidateStoryQueries()` then fires the new `onPublished?.()` callback; all three parents (Profile, Feed, Chat) wire it to `invalidateAllStoryCaches`. Carousels also dropped to 30 s polling + `refetchOnWindowFocus`.

## What still needs to ship

### 1) Add `StoryDebugPanel` (new file)

`src/components/stories/StoryDebugPanel.tsx` — floating bug-icon button (bottom-right, above the mobile nav). Opens a 320 px panel that shows in real time:

- **Database (direct)**: bypasses every cache and queries `stories` for the current user where `expires_at > now()`. Shows count, latest story id, expiry timestamp, last fetch time, and a "Refetch" button.
- **Carousel caches**: reads `queryClient.getQueryState` for `["feed-story-users"]`, `["profile-story-rings", userId]`, and `["user-stories"]`. For each, shows: cache status, row count, last update time, and a green/amber dot indicating whether your story id is present in that cache.
- **Force refresh all** button → calls `invalidateAllStoryCaches` + refetches the direct DB query.

Visibility gate: only renders when `?debug=stories` is in the URL OR `localStorage.zivo_debug_stories === '1'`. Includes a "disable debug" link inside the panel.

### 2) Mount the debug panel app-wide

In `src/App.tsx`, render `<StoryDebugPanel />` once near the top level (after providers, alongside the toaster). It self-gates so it's invisible by default.

### 3) Confirm `invalidateAllStoryCaches` keys are exhaustive

Audit pass already done. Final key set:
`feed-story-users`, `user-stories`, `profile-story-rings`, `profile-my-story`, `my-story-views`, `chat-story-rings`, `story-author-profiles`, `feed-story-profiles`. No edit unless something's missing — will re-grep before saving.

### 4) Re-verify the duplicate-key fix

Open `CreateStorySheet.tsx` after the previous edit and confirm:
- Outer `<AnimatePresence>` wraps a single keyed `<motion.div key="create-story-sheet">`.
- Inner `<AnimatePresence>` blocks for `showMusicSheet` / `showQuitConfirm` each wrap a single conditional motion.div (already keyed by presence/absence, fine).
- The two hidden file inputs are outside `<AnimatePresence>`. Already done.

### 5) Auto-refresh-on-publish

Already wired: `CreateStorySheet.publish()` → `invalidateStoryQueries()` → `onPublished?.()` → `onClose()`. Each parent passes `onPublished={() => invalidateAllStoryCaches(queryClient, user?.id)}`. Will leave as-is; the new debug panel will let you visually confirm the cache flips green within ~1 second of publish.

## How to use the debug panel

Open the app with `?debug=stories` appended to the URL (e.g. `/feed?debug=stories`), or run `localStorage.setItem('zivo_debug_stories','1')` once in the console. A small bug button appears bottom-right; tap to expand. Publish a story and watch the three carousel rows flip from amber → green.

## Files

- **New**: `src/components/stories/StoryDebugPanel.tsx`
- **Edit**: `src/App.tsx` — mount `<StoryDebugPanel />`
- (No DB / RLS changes; previous turn's edits already cover items 2, 4, 5.)
