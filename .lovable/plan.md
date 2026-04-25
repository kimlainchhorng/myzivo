# Add Instagram-style "Send to" forward sheet for stories

Items 2-5 from your request are already shipped and verified in the previous turn (seen/unseen rings, persisted reactions in `story_reactions`, storage cleanup on delete, hourly `cleanup_expired_stories()` cron). The only remaining gap is item 1: today the share button only does **copy link / native share** — there is no in-app **forward to another user** flow like Instagram's "Send to".

## What gets added

A new `StoryForwardSheet` opened from the viewer's Share button. It contains:

1. **Copy link** quick action at the top — copies `${origin}/stories/:id` (the same canonical deep link the rest of the system uses, so it routes through `StoryDeepLinkPage` correctly).
2. **Friend picker** — lists accepted friends from `friendships` (status='accepted'), searchable, multi-select, with checkmark.
3. **Optional note** input (auto-prefixed to the link, e.g. `"loved this 😍\nhttps://…/stories/<id>"`).
4. **Send button** — inserts one row per recipient into `direct_messages` (sender_id, receiver_id, message, message_type='text'). The deep link is included so tapping it in chat opens `StoryDeepLinkPage` → real viewer.

## Analytics

Both paths emit `story_share` (new event) with `meta`:
- `{ story_id, source, method: "copy_link" }`
- `{ story_id, source, method: "forward", recipient_count }`

Where `source` is the carousel the viewer was opened from (`profile` / `feed` / `chat` / `shared-link`) — already passed into `StoryViewer` via `useStoryDeepLink`.

## Files

**New**
- `src/components/stories/StoryForwardSheet.tsx` — the sheet (portal, friend list, search, copy-link, send).

**Edit**
- `src/components/stories/StoryViewer.tsx`
  - Accept a `source` prop so analytics knows which carousel opened the viewer.
  - Replace `handleShare` (current native-share-with-clipboard-fallback) with: open the new `StoryForwardSheet`. Pause playback while open.
- `src/components/profile/ProfileStories.tsx`, `src/components/social/FeedStoryRing.tsx`, `src/components/chat/ChatStories.tsx`, `src/pages/StoryDeepLinkPage.tsx` — pass their respective `source` ("profile" / "feed" / "chat" / "shared-link") into `<StoryViewer />`.

## Technical notes
- Friends loading copies the proven pattern from `CreateGroupModal`: `friendships` `or(user_id.eq.me,friend_id.eq.me)` + `status='accepted'`, then `profiles` lookup.
- Deep link is built from `window.location.origin` so it works for preview, published, and custom domains (hizivo.com, zivollc.com).
- Empty state when the user has no friends still surfaces the "Copy link" action.
- Sheet uses the same portal + spring sheet pattern as `CreateStorySheet` for visual consistency.

## Out of scope
- Forwarding to chat groups (only 1:1 DMs in v1; can be added later).
- Story-as-rich-card preview inside chat — for now the link auto-renders via the existing rich-link preview system the chat already has.
