# Profile Stories — Facebook-Style Upgrade

The shared `stories` pipeline, `StoryViewer`, and `CreateStorySheet` are already wired up from the previous turn. This plan closes the remaining gaps so the Profile experience truly matches Facebook.

## What's already working (verified by reading current files)
- `ProfileStories.tsx` reads from the real `stories` table, opens `CreateStorySheet` to compose, and `StoryViewer` to view.
- `CreateStorySheet.tsx` uploads to the `user-stories` bucket with photo / camera / colored-text modes and inserts into `stories`.
- `StoryViewer.tsx` has progress bars, tap zones, swipe-down-to-close, view recording (`story_views` upsert per segment), comments, owner viewers list, and delete.
- `FeedStoryRing.tsx` already uses a `["feed-story-users"]` query that returns every friend with active stories — we'll reuse it.

## What's missing / to fix

### 1. Profile ring carousel (biggest visible gap)
Today the Profile only shows a single "Your story" tile. Facebook-style means a horizontal scroller of rings: your tile first, then each friend with an active story.

- Rewrite `ProfileStories.tsx` to render `[Your story | Friend 1 | Friend 2 | …]` in a horizontal scroller.
- Reuse `["feed-story-users"]` so the cache stays in sync with Feed and Chat.
- Each tile: avatar wrapped in a gradient ring (full color = unviewed, muted gray = fully viewed), name truncated under it, subtle count dot when a user has 2+ active segments.
- Tap a tile → open `StoryViewer` with `groups = allUsersWithStories` and `startGroupIndex = tappedIndex` so swiping moves between senders correctly.
- Skeleton tiles while loading so the row doesn't pop in.

### 2. Correct active-story count per ring
- The ring count today is implicit (just one progress bar per story). Display the per-user segment count by mapping over `group.stories.length`, and only show the count badge when ≥ 2.
- "Viewed" detection: add a small `useQuery(["my-story-views"])` that returns the set of `story_id`s the current user has viewed; mark a ring as fully-viewed only when **every** story in that group is in the set.
- Invalidate `["my-story-views"]` when `StoryViewer` closes so rings update instantly.

### 3. Real upload progress + retry + clear errors
Replace the boolean `uploading` flag in `CreateStorySheet.tsx` with a real progress UI:
- Switch from `supabase.storage.upload` to a manual `XMLHttpRequest` PUT against a Supabase signed upload URL (the JS SDK doesn't expose progress events). Request the signed URL via `supabase.storage.from('user-stories').createSignedUploadUrl(path)`.
- Footer shows a thin progress bar + "Uploading 47%" while active.
- On failure: inline red error banner with the message + a "Retry" button that re-runs `publish()` with the same payload (no need to re-pick the file).
- Add a confirm dialog if the user taps the close X mid-upload.

### 4. Optional music picker in composer + playback
- Add a "🎵 Music" chip in both the `preview-media` and `compose-text` steps that opens a small bottom-sheet picker.
- Curated set of 8–12 short royalty-free clips bundled at `public/audio/stories/*.mp3` with title + artist labels.
- Selected track URL is saved on the new `audio_url` column; preview the chosen clip in the composer with a tiny play/stop control so the user knows what they picked.
- `StoryViewer.tsx` plays `audio_url` via a single `<audio>` element keyed to `currentStory.id`, auto-playing muted on first segment then unmuting on user tap (mobile autoplay rules); pauses when `paused`, viewers sheet, or comments sheet is open.

### 5. Verify view tracking is firing correctly
- The per-segment `story_views` upsert is already in `StoryViewer` (`useEffect` keyed on `currentStory.id`). After deploy, run a `supabase--read_query` on `story_views` to confirm rows are landing.
- Owner ring shows total views as `currentStory.viewsCount` — confirm the `views_count` column is being incremented by the existing trigger, otherwise count rows in `story_views` directly.

### 6. Small polish
- Composer: clear "Music: <track>" pill with an X to remove the selection.
- Viewer: tiny music icon in the header when `audio_url` is set, tap to mute/unmute.
- Carousel scrolls horizontally with `snap-x` and momentum on mobile; remains a single row on desktop.

## Database changes (additive, safe)
```sql
alter table public.stories
  add column if not exists audio_url text;
```
No RLS change required (existing row policies cover the new column). Bucket `user-stories` already exists and is public. No migration of existing rows needed.

(Text stickers on photos are baked into the uploaded image via canvas in the existing text-mode flow — no new column needed for that.)

## Files to touch
- `src/components/profile/ProfileStories.tsx` — rewrite as ring carousel with friends + viewed-state.
- `src/components/profile/CreateStorySheet.tsx` — XHR upload with progress, retry, error banner, music picker UI, save `audio_url`.
- `src/components/stories/StoryViewer.tsx` — play `audio_url`, mute toggle in header.
- `supabase/migrations/<ts>_stories_audio_url.sql` — single `add column` statement.
- `public/audio/stories/` — small bundled track set + a `tracks.json` manifest the picker reads.

## Out of scope for this pass
- Draggable text stickers on top of videos (would need a new `stickers` JSON column + overlay renderer).
- Drawing / freehand brush.
- Server-side re-encoding to burn overlays into video.

Ready to implement on approval.