## Problem

In the screenshots, the "Your story" ring on both **Feed** and **Chat** shows just a letter/initial (or camera icon) instead of the user's profile picture when no active story has been posted.

Currently:
- `FeedStoryRing.tsx` falls back to `myGroup?.avatarUrl` — but `myGroup` is undefined when the user has no story, so it shows only the email initial.
- `ChatStories.tsx` has the same issue — falls back to a Camera icon when there's no `myStories`.

## Fix

Use the existing `useUserProfile()` hook to load the signed-in user's avatar, and display it as the fallback inside the "Your story" ring whenever there's no story media yet. The green "+" badge stays so it's still clear they can add a story.

### Files to update

**1. `src/components/social/FeedStoryRing.tsx`**
- Import `useUserProfile`.
- In the empty-story fallback branch, use `profile?.avatar_url` first (via `optimizeAvatar`), then fall back to initials only if no avatar exists.

**2. `src/components/chat/ChatStories.tsx`**
- Import `useUserProfile`.
- Replace the Camera-icon fallback with the user's `profile.avatar_url`. Camera icon stays only as the last-resort fallback when the user truly has no avatar uploaded.

No backend or schema changes. The "+" / Sparkles badge and gradient ring behavior remain unchanged.
