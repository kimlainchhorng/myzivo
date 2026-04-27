## What you're seeing

In your screenshot, the oval shape with the two blue dots is **iOS's native text-selection magnifier (the "loupe")**. When you touch-and-hold a voice bubble, iOS grabs the gesture for text selection instead of letting the app handle it. That's why nothing useful happens — and it also blocks the long-press-to-toggle-debug gesture we wired into the failed badge.

So today, touch-and-hold on a voice bubble does:
- **iOS native**: shows the selection loupe + handles + a "Copy / Look Up" callout (sometimes hidden behind the bubble)
- **App**: nothing — the long-press never reaches our handlers because iOS swallows it

## Plan

### 1. Kill the iOS loupe / callout on chat bubbles
In `VoiceMessagePlayer.tsx` (and the text bubble wrappers in `PersonalChat.tsx` / `GroupChat.tsx`), add to the outermost bubble div:
- `style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}`
- `onContextMenu={(e) => e.preventDefault()}`

This removes the magnifier, the selection handles, and the "Copy / Look Up" iOS popup.

### 2. Add a real long-press action menu on voice bubbles
Wire a 500 ms long-press (pointerdown/pointerup with movement cancellation) on the whole voice bubble — not just the failed badge — that opens a small bottom-sheet / popover with:
- **Reply** (sets `replyTo` like text bubbles already do via `onContextMenu`)
- **Copy link** (the public URL of the audio)
- **Resend** (only when `_upload_status === "failed"`, reuses existing `retryVoiceSend`)
- **Delete / Discard** (uses existing `discardVoiceSend` for failed/uploading, or a normal delete for sent)
- **Toggle voice debug** (moves the hidden gesture off the tiny badge onto the whole bubble — much easier to hit)

### 3. Keep the failed-badge shortcut working
The existing 700 ms long-press on the "Failed" badge stays as a power-user shortcut, but now it actually fires (because we no longer let iOS steal the gesture).

### 4. Haptic + visual feedback
On long-press fire, trigger a light haptic (`navigator.vibrate?.(10)`) and a quick scale pulse on the bubble so you know the gesture registered.

## Files to change
- `src/components/chat/VoiceMessagePlayer.tsx` — disable iOS selection/callout, add bubble-level long-press, open action sheet
- `src/components/chat/PersonalChat.tsx` — same selection/callout suppression on text bubbles, pass `onDelete` into the voice player
- `src/components/chat/GroupChat.tsx` — same as PersonalChat
- (new) `src/components/chat/VoiceBubbleActionSheet.tsx` — small Radix `Drawer`/`Popover` with the 4–5 actions above

## Out of scope
- Reactions on voice bubbles (can be added later if you want the iMessage tap-back row above the menu)
- Forwarding voice notes to another chat
