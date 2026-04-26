## What I see in your screenshots

1. **Chat input bar is overcrowded** — the `+ • doc • flame • clock • Message • smile • mic` row has 6 controls fighting for space, so the **Message** field gets squashed and you can't comfortably reach every button. Last screenshot 4 confirms it's tight even on desktop.
2. **Call screen reaction strip sits in the safe-area zone** — `CallReactionStrip` is positioned `absolute bottom-3` inside the call stage, which on phones (with home-indicator) ends up behind/touching the device safe-area and overlapping the controls bar. Buttons at the very bottom of the call screen also need to clear that zone.
3. **Contacts page now shows "Kim Thai"** ✅ (chat-history fallback works).

## Fixes I will ship

### 1. PersonalChat input toolbar — make all action buttons reachable
File: `src/components/chat/PersonalChat.tsx` (lines ~1471–1545)

Wrap the leading utility buttons (Attach `+`, Document, Self-destruct flame, Scheduled clock) in a horizontally scrollable group with hidden scrollbars:

- Container: `flex items-end gap-1 overflow-x-auto no-scrollbar shrink min-w-0 max-w-[44%] sm:max-w-[55%]`
- Each button keeps `shrink-0`
- Input + Send/Mic stay pinned on the right and never get squeezed
- On larger screens the row still shows everything inline; on narrow screens you can swipe the action group sideways
- Add a tiny `.no-scrollbar { scrollbar-width: none } .no-scrollbar::-webkit-scrollbar { display: none }` utility in `src/index.css` if not already present

### 2. Call screen — lift reactions strip & controls clear of safe area
Files:
- `src/components/chat/call/CallReactionStrip.tsx` — change wrapper from `absolute inset-x-0 bottom-3` to position above the controls bar with `bottom: calc(env(safe-area-inset-bottom, 0px) + 84px)` so it floats above the home-indicator AND above the controls row.
- `src/components/chat/call/GroupCallControls.tsx` — verify `paddingBottom: calc(env(safe-area-inset-bottom, 0px) + 12px)` is applied (already there) and bump to `+ 16px` so tap targets clear the iOS gesture zone.
- `src/components/chat/CallScreen.tsx` (legacy 1:1 path) — line 802: ensure the bottom controls row uses `max(calc(env(safe-area-inset-bottom, 0px) + 1rem), 1.5rem)` so the End/Mute/Cam buttons don't sit on top of the home-indicator.

### 3. Sanity sweep on call buttons only (no other behavior changes)
- Confirm every button in `GroupCallControls` is tappable (44×44 minimum) and not clipped.
- Confirm REC pill in the header doesn't collide with the close button on small viewports.

### Out of scope
- No data-model changes.
- Group-chat input bar (`GroupChat.tsx`) is much simpler and already fits — leaving it.
- No browser testing — I'll make these layout fixes and type-check.

### Why this resolves your message
- "I need move scroll that I can see all button" → action buttons now scroll horizontally; nothing is hidden.
- "in call when click some button…have button in safety zone please move" → reaction strip and bottom controls are pushed above the iOS safe-area inset.
- "check button only" → I won't touch any other logic.