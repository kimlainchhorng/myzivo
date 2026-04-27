I audited every long-press surface in the app. Voice + text bubbles are now protected, but several other chat bubble types and a couple of long-press hotspots elsewhere can still trigger Apple's native menu when held. I'll plug all of them.

Plan:

1. Cover every chat row, not just text/voice bubbles
   - Apply the `chat-no-callout` class + `onContextMenu={preventDefault}` to the per-message wrapper rows in `PersonalChat` and `GroupChat`.
   - Because the CSS rule cascades to all children, this automatically protects:
     - File bubbles (FileBubble)
     - Location share bubbles
     - Coin transfer bubbles
     - Image / video bubbles inside ChatMessageBubble
     - Reply quote previews
     - Group sender names + avatars

2. Harden CallEventBubble
   - Wrap with the same `chat-no-callout` class and contextmenu suppression so holding a call event opens our action menu (not iOS Copy/Look Up).

3. Harden the chat input composer
   - Apply the no-callout treatment to the message composer's surrounding row in `PersonalChat` so iOS can't accidentally pop the loupe over the input bar background while users hover/press near the mic.

4. Reels reaction picker (long-press)
   - Add `WebkitTouchCallout: none` and `userSelect: none` to the long-pressable container in `ReelsFeedPage` that opens the reaction picker — currently only `onContextMenu.preventDefault` is set, which is not enough on iOS.

5. ProfileFeedCard reaction picker (long-press)
   - Same treatment as Reels: kill the iOS callout on the post card surface that opens the reaction picker.

6. StickerKeyboard preview long-press
   - The sticker grid uses a long-press to show the preview. Add the touch-callout suppression so iOS doesn't intercept and show its image action menu.

7. Keep things working
   - Buttons, video play, audio scrubbing, and link rich previews continue to work normally — the rule only suppresses native selection / callouts, never click handlers.
   - Vertical scrolling unaffected (still `pan-y` on the messages scroller).

Technical details:

```text
PersonalChat / GroupChat
  per-message <div key={msg.id}> → className += " chat-no-callout"
                                  → onContextMenu preventDefault
                                  → style WebkitTouchCallout: none

CallEventBubble
  outer wrapper → chat-no-callout + contextmenu preventDefault

ReelsFeedPage / ProfileFeedCard / StickerKeyboard
  long-press surfaces → WebkitTouchCallout: none, userSelect: none,
                        WebkitTapHighlightColor: transparent
```

Files to update:
- `src/components/chat/PersonalChat.tsx`
- `src/components/chat/GroupChat.tsx`
- `src/components/chat/CallEventBubble.tsx`
- `src/components/chat/StickerKeyboard.tsx`
- `src/pages/ReelsFeedPage.tsx`
- `src/components/profile/ProfileFeedCard.tsx`