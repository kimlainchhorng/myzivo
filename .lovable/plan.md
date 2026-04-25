# Story Deep-Link Support

Make every story ring (Profile, Feed, Chat) deep-linkable so opening a story by its `story_id` always lands in the correct viewer at the correct group + segment, and the URL reflects what's open (so it can be shared, bookmarked, or restored on refresh).

## What you'll be able to do

- Click any ring on `/profile`, `/feed`, or `/chat` → URL updates to `?story=<story_id>` and the shared `StoryViewer` opens to that exact story.
- Visit `/profile?story=<id>` (or `/feed`, `/chat`, or a new `/stories/:storyId` link) → app loads, fetches the story's owner group, and opens the viewer to that segment.
- As the viewer auto-advances or you tap next/prev, the URL updates to the currently visible `story_id`.
- Closing the viewer removes the param and returns to the page underneath.
- Sharing a story copies a `/stories/<id>` link that works from anywhere (logged-out users go through auth then land on the story).

## Changes

### 1. New shared hook `useStoryDeepLink`
`src/hooks/useStoryDeepLink.ts`
- Reads `?story=<id>` from the current URL (works on `/profile`, `/feed`, `/chat`).
- Exposes `{ activeStoryId, openStory(id), closeStory(), updateStory(id) }`.
- Uses `react-router`'s `useSearchParams` so back/forward navigation closes/reopens the viewer naturally.

### 2. New global route `/stories/:storyId`
`src/pages/StoryDeepLinkPage.tsx` (added to `src/App.tsx`)
- Looks up the story by id, finds its owner, then `navigate("/feed?story=<id>", { replace: true })` so the viewer opens over the feed (the canonical "stories home"). Unauthenticated users are redirected through the existing auth guard and resume after login.
- Handles missing/expired stories with a friendly fallback ("This story is no longer available").

### 3. Wire the three carousels through the hook
- `src/components/profile/ProfileStories.tsx`
- `src/components/chat/ChatStories.tsx`
- `src/components/social/FeedStoryRing.tsx` (also remove the current `toast.info("Viewing …")` placeholder and actually open `StoryViewer` — this carousel currently doesn't render the viewer at all)

Each carousel will:
- Fetch its existing story groups (unchanged query keys).
- On ring click → `openStory(group.stories[0].id)`.
- Render `<StoryViewer>` when `activeStoryId` matches a story it knows about, computing `startGroupIndex` + `startStoryIndex` from `activeStoryId`.
- On close → `closeStory()`.

### 4. Extend `StoryViewer` to support a starting story id and URL sync
`src/components/stories/StoryViewer.tsx`
- Add optional props: `startStoryIndex?: number` and `onStoryChange?: (storyId: string) => void`.
- Initialize `viewIdx` from `startStoryIndex`.
- Fire `onStoryChange(currentStory.id)` whenever the active story changes (next/prev/auto-advance/group change), so the carousel can call `updateStory(id)` to keep the URL in sync.

### 5. "Share story" action
In `StoryViewer`'s right-side action stack, wire the existing **Send** button to copy `${window.location.origin}/stories/${currentStory.id}` to the clipboard with a toast confirmation. Uses the Web Share API when available, falls back to clipboard.

## Technical notes

- No DB migrations required — `stories.id` is already the canonical key.
- Query keys (`profile-story-rings`, `feed-story-users`, `user-stories`) are unchanged; deep-link logic operates on already-fetched groups in each carousel. The `/stories/:storyId` page does a one-shot lookup to find the owner before redirecting.
- Expired stories (past `expires_at`) are treated as "no longer available" on the deep-link page rather than opening an empty viewer.
- URL param uses `?story=` (not the path) on profile/feed/chat so refreshing keeps the underlying page mounted; only the public sharable URL uses `/stories/:storyId`.
- Replace history (`{ replace: true }`) is used when the viewer auto-advances so back-button doesn't walk through every segment.

## Files

- create `src/hooks/useStoryDeepLink.ts`
- create `src/pages/StoryDeepLinkPage.tsx`
- edit `src/App.tsx` (add `/stories/:storyId` route)
- edit `src/components/stories/StoryViewer.tsx` (start index + onStoryChange + share)
- edit `src/components/profile/ProfileStories.tsx`
- edit `src/components/chat/ChatStories.tsx`
- edit `src/components/social/FeedStoryRing.tsx` (mount viewer + deep-link)