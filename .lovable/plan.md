# Fix: "I added a story but tapping it shows nothing"

## Root cause
`ProfileStories` and `FeedStoryRing` both use the same React Query key — `["feed-story-users"]` — but return **different data shapes**:

- `FeedStoryRing` returns `StoryUser[]` (just `{userId, userName, hasUnviewed, storyCount}`).
- `ProfileStories` (new) expects `RawStory[]` (full story rows with `id`, `media_url`, etc.).

Whichever component mounts first wins the cache. When `FeedStoryRing` has already populated the cache, `ProfileStories` reads it as `RawStory[]`, every story's fields are `undefined`, the carousel collapses to an empty list, and the "Your story" tile thinks `hasMyStory` is false — so tapping does nothing useful (or opens an empty viewer).

A second, smaller issue is the React warning `Function components cannot be given refs` — the hidden file `<input ref={…}>` elements in `CreateStorySheet` sit inside the `<AnimatePresence>` motion subtree, where `PopChild` wraps children and trips the ref-forwarding warning.

## Fix

### 1. Give `ProfileStories` its own query key
- Change `queryKey: ["feed-story-users"]` → `queryKey: ["profile-story-rings", user?.id]` in `src/components/profile/ProfileStories.tsx`.
- On viewer close, invalidate **both** `["profile-story-rings"]` and `["feed-story-users"]` so the Feed ring also updates.

### 2. Invalidate the new key after publishing
- In `src/components/profile/CreateStorySheet.tsx` `publish()`, also call `queryClient.invalidateQueries({ queryKey: ["profile-story-rings"] })` so a freshly uploaded story shows up immediately on the Profile page.

### 3. Silence the ref warning
- Move the two hidden `<input ref={fileInputRef}>` / `<input ref={cameraInputRef}>` elements from inside the `motion.div` backdrop to **outside** the motion subtree (still inside the `AnimatePresence` portal). React then attaches refs directly to plain DOM nodes — no `PopChild` wrapper, no warning.

No DB changes, no schema changes. Three small edits in two files. After the fix, adding a story will instantly populate the ring and tapping it will open the viewer with your new story as the first segment.

Ready to implement on approval.