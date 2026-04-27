# Voice message long-press → floating menu (matches your screenshot)

## What changes

Right now, when you long-press a voice message, a **bottom drawer** slides up (Reply / Copy link / Resend / Delete / Debug). You want the same **floating white popover + emoji reaction bar** that already appears when you long-press a text bubble — exactly like the screenshot.

After this change, long-pressing any voice bubble will show:

- **Reaction bar** (❤️ 😂 👍 😮 😢 🔥 🎉 😍) floating just above/below the bubble
- **Floating white menu** with:
  - Reply
  - Copy link (the audio URL)
  - Forward
  - Pin / Unpin
  - Resend (only if upload failed)
  - Delete (red, with "Delete for everyone / Delete for me" sub-menu like text)
- Background dim + tap-outside to close
- Smart positioning: opens downward when bubble is near the top of the screen
- Light haptic on long-press (same 30 ms vibrate as text bubbles)

The bottom drawer (`VoiceBubbleActionSheet`) is removed from the long-press flow. The hidden voice-debug toggle stays available via the existing `window.__zivoVoiceDebug()` console hook so we don't clutter the new menu.

## Where the work happens

```text
src/components/chat/PersonalChat.tsx     ← wrap voice bubble with new long-press shell
src/components/chat/GroupChat.tsx        ← same wrap for group voice bubbles
src/components/chat/VoiceMessagePlayer.tsx ← stop opening the drawer on long-press
```

A small new shared component:

```text
src/components/chat/VoiceBubbleLongPressMenu.tsx
```

…holds the floating popover + reaction bar (factored out of `ChatMessageBubble` so both text and voice share identical styling, animation, and dismiss behavior).

## Technical details

1. **Extract popover** — Lift the existing popover JSX from `ChatMessageBubble.tsx` (lines ~800–882: backdrop, reaction row, action menu, delete sub-menu) into `VoiceBubbleLongPressMenu.tsx` accepting props: `open`, `onClose`, `isMe`, `openDown`, `canEdit`, `canResend`, `isPinned`, `onReply`, `onCopy`, `onForward`, `onPin`, `onResend`, `onDelete`, plus reactions handlers. `ChatMessageBubble` keeps using it (no visual change there).
2. **Wrap voice bubble** — In `PersonalChat.tsx` (lines 1728–1763) and `GroupChat.tsx`, wrap the voice bubble container with the same long-press handlers used by text bubbles: `onPointerDown` (400 ms timer → set `showActions`/`showReactions`, measure `getBoundingClientRect().top < 320` for `openDown`, vibrate 30 ms), `onPointerUp/Cancel/Move` to clear the timer, and `onClick` to dismiss. Render `<VoiceBubbleLongPressMenu>` as a sibling positioned absolutely.
3. **Hook into existing handlers** — Reuse `handleReply`, `handleDelete`, `handleForward`, `handlePin` already defined in `PersonalChat`/`GroupChat`. Map "Copy" to `navigator.clipboard.writeText(voice_url)` with a toast. "Resend" calls the existing `retryVoiceSend(csid)`; "Delete" sub-menu calls `discardVoiceSend(csid)` for optimistic/failed bubbles or `handleDelete(msg.id)` for sent ones.
4. **Reactions** — Use the same `MessageReactionsBar` already rendered below voice messages (line 1801) and the same `toggleReaction` flow as text bubbles, so tapping ❤️ persists into `message_reactions` and shows the chip row beneath the bubble.
5. **Remove drawer trigger** — In `VoiceMessagePlayer.tsx`, remove the long-press → `VoiceBubbleActionSheet` open. The file `VoiceBubbleActionSheet.tsx` becomes unused; leave it in the repo for now (no deletes in this pass) so we can revert quickly if needed.
6. **Edit suppression** — Voice has no editable text, so the menu hides the "Edit" row (passes `canEdit={false}`).
7. **iOS callout** — The wrapper keeps the existing `chat-no-callout`, `WebkitTouchCallout: none`, and `onContextMenu={(e) => e.preventDefault()}` so the native iOS "Copy / Look Up" sheet never appears.

## Out of scope

- No DB schema changes
- No changes to how voice notes are recorded, uploaded, or played
- No styling changes to the bubble itself — only the long-press overlay
