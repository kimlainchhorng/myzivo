# Story system: cleanup hardening, seen-state verification, deep-link tests, and E2E QA

This plan addresses four asks: (1) make storage cleanup robust against missing/legacy URLs, (2) verify and harden seen/unseen ring state across navigation and accounts, (3) add deep-link tests for expired/deleted/chat/shared-link cases with analytics assertions, and (4) run a structured end-to-end test pass across all story flows on iOS / Android / web and report mismatches.

## 1. Bulletproof storage cleanup (no orphans)

Today, `deleteStory` in `StoryViewer.tsx` and `cleanup_expired_stories()` rely solely on the public URL string to recover the storage key. If `media_url`/`audio_url` is null, malformed, or stored with a different host, the object is leaked.

Changes:
- **`StoryViewer.tsx → deleteStory`**: switch to a fallback chain — (a) try `parseStorageKeyFromPublicUrl`, (b) re-fetch the story row before deletion to get the latest URLs, (c) list `user-stories/{user_id}/{story_id}/` via `supabase.storage.from('user-stories').list()` and remove every returned object. This guarantees image, video, thumbnail, and audio assets are all swept even when a URL field is empty.
- **`storiesCache.ts`**: add `collectStoryStorageKeys(story)` helper that returns all candidate keys (media, audio, thumbnail) and used by both delete paths.
- **DB function `cleanup_expired_stories()`** (new migration): before deleting `stories` rows, additionally delete every `storage.objects` row whose `name LIKE user_id || '/' || story_id || '/%'` for the expired set. This covers stories whose `media_url` was never written (failed upload) or used a non-public URL pattern.
- **`CreateStorySheet.tsx`**: when an upload succeeds but the subsequent `stories` insert fails, immediately remove the just-uploaded object (currently leaked).

## 2. Seen / unseen carousel state

Audit + fixes for `FeedStoryRing`, `ProfileStories`, `ChatStories`:
- **Refetch on viewer close**: today `viewedIds` only refreshes via React Query staleness. Wire `StoryViewer`'s `onClose` to call `invalidateAllStoryCaches(qc, user.id)` so `["my-story-views", user.id]` is re-pulled and the ring desaturates immediately on return.
- **Account switch**: `["my-story-views", user?.id]` already keys on user id, but the cache for the previous user persists. Add a `useEffect` in a top-level `StoriesAccountSync` (or extend the existing `AuthProvider`) that calls `qc.removeQueries({ queryKey: ["my-story-views"] })` on `SIGNED_OUT` / user change so a different device/account never sees stale "seen" rings.
- **Cross-device**: `story_views` is server-side, so the new device pulls the correct set on first mount — verified by the same query — but we'll add a lightweight `realtime` subscription on `story_views` filtered by `viewer_id = me` to update rings live when the same account marks a story seen on another device.

## 3. Deep-link edge-case tests + analytics assertions

Extend `src/components/stories/__tests__/`:
- **`StoryDeepLinkExpired.test.tsx`** — mounts `StoryDeepLinkPage` with a mocked supabase that returns a story with `expires_at` in the past; asserts the "Story expired" copy renders and `track('story_deeplink_missing', { reason: 'expired' })` was called.
- **`StoryDeepLinkDeleted.test.tsx`** — mocks `maybeSingle()` returning `{ data: null }`; asserts `not_found` reason + analytics event.
- **`StoryDeepLinkFromChat.test.tsx`** — renders `ChatStories` with a fixture group, drives `?story=ID`, asserts the viewer mounts and `track('story_deeplink_open', { source: 'chat' })` fires exactly once.
- **`StoryDeepLinkFromSharedLink.test.tsx`** — mounts `StoryDeepLinkPage` with a valid story, asserts redirect to `/feed?story=…` and `track('story_deeplink_open', { source: 'shared-link' })`.
- All tests mock `@/lib/analytics` with a `vi.fn()` and assert the event payload shape used by `AdminStoriesFunnelPage`.

## 4. End-to-end QA pass + report

Run the preview signed in as the provided test account and exercise every flow per platform via the browser tool with three viewport profiles (iPhone 390×844, Pixel 412×915, desktop 1440×900). For each, walk:
1. Open story from Feed ring, Profile ring, and Chat row
2. Tap-right (next) and tap-left (prev) including across user groups
3. React (each emoji) and verify persistence after reload
4. Share → copy link, Share → forward (to a friend), confirm chat message appears
5. Owner: delete a story early; confirm it disappears from carousel and storage object is gone (`storage.objects` query)
6. Expired story: insert a row with `expires_at = now() - interval '1 hour'`, run `select cleanup_expired_stories();`, confirm row + objects removed

Deliverable: `docs/qa/stories-e2e-2026-04-25.md` with a per-platform pass/fail matrix, screenshots of any visual mismatches, and a triage list of bugs to fix in a follow-up.

## Technical notes

- New migration adds the path-prefix sweep inside `cleanup_expired_stories()` and a covering index `storage.objects (bucket_id, name text_pattern_ops)` to keep the `LIKE` fast.
- Realtime subscription is added in `useMyStoryViews` (extracted from the duplicated query in Feed/Profile) so all three carousels share one source of truth.
- Test fixtures reuse the `StoryGroup` shape already used in `StoryDeepLinkNavigation.test.tsx`.

## Files

Created:
- `src/hooks/useMyStoryViews.ts`
- `src/components/stories/__tests__/StoryDeepLinkExpired.test.tsx`
- `src/components/stories/__tests__/StoryDeepLinkDeleted.test.tsx`
- `src/components/stories/__tests__/StoryDeepLinkFromChat.test.tsx`
- `src/components/stories/__tests__/StoryDeepLinkFromSharedLink.test.tsx`
- `supabase/migrations/<ts>_stories_cleanup_prefix_sweep.sql`
- `docs/qa/stories-e2e-2026-04-25.md`

Edited:
- `src/lib/storiesCache.ts` (add `collectStoryStorageKeys`)
- `src/components/stories/StoryViewer.tsx` (robust delete + close-time invalidation)
- `src/components/profile/CreateStorySheet.tsx` (rollback orphan upload on insert failure)
- `src/components/social/FeedStoryRing.tsx`, `ProfileStories.tsx`, `ChatStories.tsx` (use shared `useMyStoryViews`)
- `src/contexts/AuthProvider` (clear story-view cache on user change)
