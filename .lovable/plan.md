# Stories: Full Audit, Cleanup & IG/FB-Class Polish

## 1. Live test pass (Klainkonkat@gmail.com)
Log in via the preview browser and walk every story surface, capturing screenshots + console/network for each:

- **Create flow** (`CreateStorySheet`) on Profile, Feed and Chat triggers
  - Photo pick, camera capture, text-only with gradient bg, music track
  - Upload progress, retry on failure, signed-PUT error surfacing
  - Cancel mid-upload (XHR abort)
- **Carousels**: `ProfileStories`, `FeedStoryRing`, `ChatStories`
  - Confirm same data shape, same ring style, same click → same `StoryViewer`
  - Confirm react-query cache keys don't collide and invalidate after upload
- **Viewer** (`StoryViewer`)
  - Auto-progress, tap nav, hold-pause, swipe-down close
  - Mute/unmute, music sync, viewers list (owner), delete (owner)
  - Comments insert into `story_comments`, views into `story_views`
- **Deep links**: `/story/:id` from each source, back/forward, missing/expired states, analytics events
- **Admin**: `/admin/stories-funnel` renders with real `analytics_events`

Document any defect found and fix it as part of step 2/3.

## 2. Fix the real gaps (current bugs)

| Gap | Fix |
|---|---|
| Deleting a story removes the DB row but **leaves the file in `user-stories` bucket** | In `StoryViewer.deleteStoryMutation`, parse the storage path from `mediaUrl` and call `supabase.storage.from('user-stories').remove([path])` before/after the row delete. Same for `audioUrl` if it lives in our bucket. |
| **No automatic 24h expiry / cleanup** | New SQL migration: `cleanup_expired_stories()` SECURITY DEFINER that (a) collects expired rows, (b) deletes their storage objects via `storage.objects` rows in `user-stories`, (c) deletes from `stories`, `story_views`, `story_comments`, `story_reactions`. Schedule via `pg_cron` hourly. |
| `story_reactions` table exists but viewer only toggles a local `liked` state | Wire the heart button to upsert/delete in `story_reactions`; subscribe owner viewers list to reactions count. |
| Carousels don't show **seen vs unseen** ring (FB/IG signature) | Compute per-group "all seen" from `story_views` for current user; render gray ring when fully seen, gradient ring otherwise. |
| Profile/Feed/Chat sometimes desync after upload | Single shared invalidation helper `invalidateAllStoryCaches(qc)` called from `CreateStorySheet`, delete, and reactions. |

## 3. Add the missing IG/FB features
1. **Quick emoji reactions bar** at the bottom of the viewer (❤️🔥👏😂😮😢) writing to `story_reactions`.
2. **Reply-to-story** input: sends a DM into the existing chat thread with a quoted preview of the story (uses current chat/messages tables).
3. **Share / forward**: copy `/story/:id` link + native share sheet.
4. **"Your story" tile** as the first ring in every carousel — when owner has none it opens `CreateStorySheet`; when owner has one it opens viewer; long-press = manage (delete / view insights).
5. **Story highlights surfacing**: existing `story_highlights` table — show a small Highlights row under `ProfileStories` for the profile owner.
6. **Mute account from stories** (long-press menu) — preference table entry to hide that user's stories from rings.
7. **Progress segments + smooth crossfade** between segments and groups (polish).

## 4. Visual polish (FB/IG-class)
- Gradient ring tokens (`from-fuchsia-500 via-rose-500 to-amber-400`) with seen-state desaturation.
- 56 px avatar in carousels, 64 px on Profile, consistent gap and snap-x scroll.
- Viewer: rounded 24 px container on tablet+, blurred backdrop, spring transitions.
- Empty states with friendly illustrations + "Add to story" CTA.

## 5. Files to touch / add

**New**
- `supabase/migrations/<ts>_stories_cleanup_and_reactions.sql` — `cleanup_expired_stories()` + cron + RLS for reactions usage.
- `src/components/stories/StoryReactionsBar.tsx`
- `src/components/stories/StoryReplyInput.tsx`
- `src/components/stories/YourStoryTile.tsx`
- `src/lib/storiesCache.ts` — shared `invalidateAllStoryCaches` + `getSeenMap` helpers.

**Edit**
- `src/components/stories/StoryViewer.tsx` — storage delete on remove, real reactions, reply, share, polish.
- `src/components/profile/CreateStorySheet.tsx` — use shared cache helper, polish.
- `src/components/profile/ProfileStories.tsx` — seen state, YourStoryTile, highlights row.
- `src/components/social/FeedStoryRing.tsx` — seen state, YourStoryTile.
- `src/components/chat/ChatStories.tsx` — seen state, YourStoryTile.

## Technical notes
- Storage path parsing: `media_url` is a public URL like `…/storage/v1/object/public/user-stories/<uid>/<file>`; split on `/user-stories/` and use the suffix.
- Cron: hourly is enough since `expires_at` is enforced by RLS for reads; cleanup is just to free space.
- Reactions RLS: insert/delete only own rows; read all on active stories.
- All new analytics events reuse `meta` column.

## Out of scope
- Native push for new story (covered by existing notifications system).
- Story ads / sponsored placements.
