# Story Reactions & Replies — 5-feature upgrade

Implements all 5 requested items as one coordinated change to `StoryViewer.tsx` (plus one tiny shared hook for realtime). No DB migration is required — everything reuses existing tables (`story_reactions`, `story_comments`, `direct_messages`).

## What you get

### 1. Edit / remove your own reaction (instant counts)
- In the bottom emoji row, your active emoji shows a small **× chip** to clear it in one tap.
- Tapping a different emoji **switches** your reaction (already supported server-side; UI now confirms it visually with an animated swap).
- Owner's "Reactions" count in the insights pill + tab badge update **optimistically** so the number changes the instant you tap, then reconciles with the server.

### 2. Threaded replies under each reaction
- In the owner's **Reactions tab**, each reactor row gets a "Reply" affordance and a chevron to expand a thread underneath.
- Threads use the existing `story_comments` table with a content convention: `[react:<reactionId>] body` (no schema change). The viewer parses & groups them under the matching reaction.
- Both the **story owner** AND the **original reactor** can post into a thread. Other viewers don't see other people's threads.
- Renders inline with avatar + relative time; auto-scrolls to newest.

### 3. Tap-to-react quick picker (no leaving screen)
- Adds a `+` chip at the end of the 6-emoji row (non-owner). Tapping it (or long-pressing any emoji) opens a **floating glass picker** above the row with a 24-emoji palette: 😍🥹🤩😎😭🤣👏🙌💯🔥✨💖🥳😱😤🫶🤝👀🌟⚡🎉🍿🤔🙏
- Picking one fires the same `reactToStory` mutation, animates a burst, and closes the picker.
- Tapping outside or the close icon dismisses without sending.

### 4. Live updates (Supabase realtime)
- New hook `useStoryRealtime(storyId)` opens a Supabase channel subscribing to `story_reactions` and `story_comments` filtered to the active story.
- On any INSERT / UPDATE / DELETE event, it invalidates the four query keys (`story-reactions-list`, `story-my-reaction`, `story-comments`, `story-viewers`) so the owner sees new reactions, removed reactions, and new threaded replies in real time without a refresh.
- Channel is cleaned up automatically when the viewer unmounts or the story changes.

### 5. DM-style story replies (no more orphan comments)
- The non-owner reply input at the bottom of the viewer **no longer writes to `story_comments`** for free-text replies.
- Pressing Send (or Enter) inserts a row into `direct_messages` with:
  - `sender_id` = current user
  - `receiver_id` = story owner
  - `message` = `"💬 Replied to your story\n<typed text>\n<deep-link to the story>"`
  - `message_type = "text"`
- Toast: **"Reply sent — open chat to continue"** with a tappable action that navigates to `/chat`.
- Threaded reactions (item 2) still use `story_comments` because they live inside the story-insights surface, not the inbox.

## Files touched

| File | Change |
|---|---|
| `src/components/stories/StoryViewer.tsx` | All 5 features wired in (state, mutations, UI for picker + thread + DM reply) |
| `src/hooks/useStoryRealtime.ts` (new) | Tiny hook: subscribes to reactions/comments channels, invalidates queries on change |

## Technical notes

- **No DB migration needed.** Realtime works on existing tables; thread parent-id is encoded in `content` prefix (cleanly stripped before display).
- **RLS unchanged.** `direct_messages` already accepts inserts where `sender_id = auth.uid()`. `story_comments` policy already restricts who can write.
- **Optimistic updates** use `queryClient.setQueryData` for the reactor's own row so taps feel instant; realtime then reconciles for the owner.
- Quick picker is rendered inside the existing portal overlay — no new portal/z-index conflicts.

## Build order (single pass)
1. Add `useStoryRealtime.ts` hook.
2. Wire it inside `StoryViewer` next to existing queries.
3. Replace non-owner reply input handler → `direct_messages` insert + navigate-to-chat toast.
4. Add `+` quick-pick chip and floating picker overlay.
5. Add per-reactor "Reply" + chevron + thread renderer in Reactions tab.
6. Add active-emoji × clear button + optimistic count update.

Ready to ship as one approved change.