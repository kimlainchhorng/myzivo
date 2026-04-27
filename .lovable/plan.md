I see the issue in your screenshot: iOS is still selecting something inside the chat bubble and showing the native “Copy / Look Up / Translate” menu before our app menu can take over. I’ll harden the chat touch handling so holding messages uses ZIVO’s own actions instead of the iPhone text-selection menu.

Plan:

1. Add a stronger mobile no-selection utility
   - Create a reusable CSS class for chat action areas that disables:
     - iOS touch callout
     - text selection
     - tap highlight
     - draggable/selectable child media
   - Apply it to children too, not only the outer wrapper, because iOS can select nested text/time labels inside the bubble.

2. Harden voice message bubbles
   - Add capture-phase handlers to the voice player wrapper:
     - `onTouchStartCapture`
     - `onContextMenuCapture`
     - `onSelectStartCapture`
     - `onDragStartCapture`
   - Prevent native iOS selection/callout on long-press while keeping normal tap-to-play and waveform seek working.
   - Cancel the browser context menu when iOS fires it, so “Copy / Look Up / Translate” does not appear.

3. Harden normal chat message bubbles too
   - The text bubble component already has a custom long-press menu, but it does not fully block iOS selection.
   - Apply the same no-selection class and native-menu suppression to `ChatMessageBubble`, so holding any message does not show Apple’s menu.

4. Update direct voice wrappers in Personal and Group chat
   - Add the no-selection/touch-callout suppression to the outer green/gray voice bubble containers, not only inside `VoiceMessagePlayer`.
   - This prevents the timestamp or empty bubble area from triggering the native menu.

5. Keep scrolling and playback natural
   - Preserve vertical scroll with `touch-action: pan-y` on message wrappers.
   - Use movement thresholds so scrolling does not accidentally open the ZIVO action sheet.
   - Keep buttons and waveform controls responsive.

Technical details:

```text
Chat bubble / voice bubble
  touch start capture: mark as chat gesture and prevent native callout when needed
  pointer long-press: open ZIVO menu
  contextmenu/selectstart/dragstart capture: prevent iOS/desktop native menu
  child elements: user-select: none; -webkit-touch-callout: none
```

Files to update:
- `src/index.css`
- `src/components/chat/VoiceMessagePlayer.tsx`
- `src/components/chat/ChatMessageBubble.tsx`
- `src/components/chat/PersonalChat.tsx`
- `src/components/chat/GroupChat.tsx`