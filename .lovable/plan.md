# Plan — Facebook-Style Story Flow on Profile

## Problem
The "Your story" entry on the Account page (`ProfileStories`) is broken and inconsistent with the rest of the app:
- Tapping "Your story" runs a fake handler that just shows a toast — **no actual upload happens**.
- It queries the wrong table (`user_stories`) while the real working pipeline (used in Feed/Chat) uses `stories` + `story_views` + `story_comments` + the `user-stories` storage bucket.
- It has no Facebook-style **create flow** (choose Photo / Text / Camera), no caption step, no preview, no audience selector.
- Viewer is barebones: no pause, no like, no comments, no viewers list, no swipe-down to close.
- Two parallel implementations (`ChatStories` vs `ProfileStories`) drift apart and confuse users.

## Goal
Bring the Profile "Your story" experience in line with Facebook: a clear **Create Story sheet** → upload/preview → publish → rich **fullscreen viewer** (the same one used elsewhere).

## Approach — reuse the working `ChatStories` engine, add a Facebook-style create sheet on top

We will NOT maintain two story stacks. We replace `ProfileStories` with a thin profile wrapper that:
1. Uses the same `stories` table + `user-stories` bucket + `story_views` / `story_comments` already wired in `ChatStories`.
2. Renders a Facebook-style "Your story" tile.
3. On tap (when no story exists), opens a new **Create Story bottom sheet**.
4. On tap (when a story exists), opens the existing rich fullscreen viewer.

## Changes

### 1. New component: `src/components/profile/CreateStorySheet.tsx`
Facebook-style bottom sheet with three creation paths:
- **Photo / Video** — opens the file picker (image or video, validates ≤5MB image / ≤20MB video).
- **Text Story** — typed text on a colored gradient background; rendered to a canvas → uploaded as an image.
- **Camera** — opens file picker with `capture="environment"` so phones launch the camera directly.

Flow:
1. Tap method → pick/capture media (or type text + pick gradient).
2. **Preview screen** with caption input (Facebook-style overlaid text field), audience chip ("Public" — read-only for v1), and a primary "Share to Story" button.
3. On Share: upload to `user-stories` bucket, insert into `stories` table (24h `expires_at`), invalidate the `["user-stories"]` query so the ring updates everywhere.

Reuses existing tokens (`bg-card`, `text-foreground`, `bg-primary`, etc.) — no hardcoded colors.

### 2. Rewrite `src/components/profile/ProfileStories.tsx`
- Drop the broken `user_stories` query and fake upload handler.
- Query the same `stories` table (24h, by current user) to detect "do I have an active story?".
- Render the same "Your story" tile visual the user already sees.
- Tap behavior:
  - No active story → open `CreateStorySheet`.
  - Has active story → open the fullscreen viewer (extracted from `ChatStories`, see step 3).
- Long-press / chevron on existing story → quick "Add to your story" or "Delete story" action sheet (Facebook parity).

### 3. Extract the viewer into a shared component
- New file: `src/components/stories/StoryViewer.tsx` — lift the fullscreen viewer (progress bars, pause/play, tap zones, like, comment sheet, viewers sheet, delete) out of `ChatStories.tsx` essentially as-is.
- `ChatStories.tsx` and `ProfileStories.tsx` both import and use it. Behavior identical to today's `ChatStories` viewer (already Facebook/TikTok-class).
- Add **swipe-down to close** gesture for parity with Facebook (framer-motion drag on Y axis with velocity threshold).

### 4. Profile feed ring stays consistent
- After publishing from the sheet, invalidate `["user-stories"]` and `["feed-story-users"]` query keys so the ring updates on Profile, Feed, and Chat instantly.

## Out of scope (call out, don't build)
- Music sticker, polls, mentions, link sticker — Facebook has these but they're large separate features.
- Story highlights pinning (already a separate `StoryHighlights.tsx` component).
- Audience picker beyond "Public" — schema doesn't currently store audience on `stories`.

## Files touched
- `src/components/profile/ProfileStories.tsx` — rewritten (small wrapper).
- `src/components/profile/CreateStorySheet.tsx` — **new**.
- `src/components/stories/StoryViewer.tsx` — **new** (extracted from `ChatStories`).
- `src/components/chat/ChatStories.tsx` — refactored to import the shared viewer (no UX change).

No DB migrations needed — `stories`, `story_views`, `story_comments` and the `user-stories` bucket already exist and are in use.

## Verification
- Build passes.
- From Profile, tap "Your story" with no active story → Create sheet opens, can pick photo/video/text, preview, share, story appears in ring instantly.
- Tap an existing own story → fullscreen viewer with viewers count and delete action.
- Tap a friend's story (via Feed) → same viewer, can like/comment.
