## What's happening

Your story DID upload successfully — I can confirm one active story exists in the database for your account (created today, expires tomorrow). The reason you don't see it on the ring is two bugs in the create-story sheet:

1. The hidden `<input>` file pickers are wrongly placed **inside** `<AnimatePresence>` as un-keyed siblings of the modal `<motion.div>`. When the sheet animates in/out, React/Framer Motion produces a "duplicate key" warning and — more importantly — the close→reopen lifecycle leaves stale children in the tree, which **prevents the parent from triggering the cache invalidation cleanly** on close. The `onClose()` runs before `invalidateAllStoryCaches`, so the carousel's `useQuery` never refetches until the 60-second auto-poll kicks in. That's why your story "doesn't show up" right after sharing.

2. The order of operations after a successful upload is `onClose()` → then component unmounts → cache invalidation never reaches the still-mounted parent because the closing animation is racing the state update.

## Fix

### 1) `src/components/profile/CreateStorySheet.tsx`

- Move the two hidden `<input type="file">` elements **out of `<AnimatePresence>`** and render them as siblings of the portal root, so AnimatePresence only ever has one keyed child.
- Add an explicit `key="create-story-sheet"` to the outer `<motion.div>` so AnimatePresence reconciliation is unambiguous.
- In `publish()`, **invalidate caches BEFORE calling `onClose()`** (currently the order is correct in code, but we'll also add a small `await Promise.resolve()` flush). More importantly, also call `invalidateAllStoryCaches` on the parent components when the sheet closes, by exposing the success via a callback.
- Add `onPublished?: () => void` prop and call it right after invalidation, so each parent (Profile, Feed, Chat) can refetch its own carousel immediately.

### 2) `src/components/profile/ProfileStories.tsx`, `src/components/social/FeedStoryRing.tsx`, `src/components/chat/ChatStories.tsx`

- Pass `onPublished={() => invalidateAllStoryCaches(queryClient, user?.id)}` to `<CreateStorySheet />`.
- Lower `refetchInterval` from 60 s to 30 s as a safety net, and add `refetchOnWindowFocus: true` so coming back to the tab after sharing always refreshes.

### 3) `src/lib/storiesCache.ts`

- Remove `exact: true` on the invalidation calls. Right now `["feed-story-users"]` matches exactly but `["profile-story-rings", userId]` with exact mode misses any in-flight variants. Switching to predicate-based invalidation (`queryKey[0] === "feed-story-users"` etc.) ensures every carousel refetches.

### 4) Quick sanity step

After the fix, your existing story (already in DB, active for ~23 more hours) will appear on the ring immediately on page reload. No data migration needed.

## Files changed

- `src/components/profile/CreateStorySheet.tsx` — restructure portal/AnimatePresence, add `onPublished` callback
- `src/components/profile/ProfileStories.tsx` — wire `onPublished`
- `src/components/social/FeedStoryRing.tsx` — wire `onPublished` + refetch tweaks
- `src/components/chat/ChatStories.tsx` — wire `onPublished`
- `src/lib/storiesCache.ts` — predicate-based invalidation

## Outcome

- Story you just shared appears in the ring **instantly** (no 60 s wait).
- React duplicate-key console warning gone.
- Reopening the create sheet after a publish no longer leaves a stale upload state.
