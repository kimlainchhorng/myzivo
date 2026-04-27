## Telegram-style voice messages

Compare current ZIVO voice UI vs Telegram screenshots and align.

### Differences identified

**Player bubble (`VoiceMessagePlayer.tsx`):**

| Aspect | Telegram | ZIVO now |
|---|---|---|
| Bar count | ~50 thin bars filling bubble width | 32 chunkier bars |
| Bar style | Rounded thin (~2px), tight gap, even baseline gap | OK but spacing too wide, varying minHeights look noisy |
| Idle animation | Static (no loop) | Each bar pulses on play (busy/distracting) |
| Time format | Single `0:05` shown bottom-left | `0:00 / -0:05` dual time (cluttered) |
| Speed pill | Compact `1x` chip on right of waveform | `1×` button below waveform |
| Bubble bg | Solid green for `isMe`, white for other | Already matches via primary token |
| Played-state dot | Telegram shows tiny "unread voice" dot before play | Missing |
| Play icon | Filled play, large 40px circle | Already similar |

**Recorder overlay (`HoldToRecordMic.tsx`):**

| Aspect | Telegram | ZIVO now |
|---|---|---|
| Layout | Single rounded pill at very bottom: red dot + `0:01` left, `< Slide to cancel` center, mic on right with green ring growing as you slide | Card-style bar with extra lock pill floating high above |
| Lock affordance | Small lock icon directly above mic, slides up smoothly | Floats far up (-top-24), feels detached |
| Cancel link | "Cancel" plain text (when locked) | OK |
| Time format | `0:01` mono digits, no leading space | OK |

### Changes

**1. `src/components/chat/VoiceMessagePlayer.tsx`** — refine to match Telegram density:
- Increase bar count 32 → 48
- Reduce gap from 1.5px → 1px; use `min-w-[1.5px]` per bar
- Remove per-bar pulse animation on play (keep only the "filled" color transition); waveform should look like Telegram's static bars filling left-to-right
- Show only single time (`currentTime` while playing/seeked, `duration` otherwise) — drop the `/ -remaining` half
- Move speed pill inline to right side of waveform row (replace `flex-col` layout): `[play] [waveform] [time + 1x pill stacked tightly]`
- Add small "unheard" indicator dot for incoming, unplayed messages (only `!isMe && progress === 0 && !playing`)
- Trim `min-w-[220px]` → `min-w-[200px]`, `max-w-[260px]` so bubble matches Telegram's compact look

**2. `src/components/chat/HoldToRecordMic.tsx`** — make recorder overlay match Telegram pill:
- Reduce overlay to a single rounded-full pill (not rounded-2xl card)
- Move the lock indicator from `-top-24` to `-top-16` and shrink it to a tight rounded-full chip (just lock icon, no chevron stack)
- Replace text `"Slide to cancel"` arrangement with: red blinking dot + mono time on far left, `‹ Slide to cancel` centered, growing green progress halo on the mic on far right
- Add subtle background glow that grows with `dragRatio` instead of switching to destructive bg (Telegram keeps the bar neutral until release)

**3. Keep unchanged**
- `VoiceNotePlayer.tsx` (different surface, used elsewhere)
- Storage / upload pipeline
- Bubble container colors (already use semantic tokens)

### Verify

- `bunx tsc --noEmit`
- Spot-check `/chat` on 428×703 viewport with both incoming and outgoing voice messages
- Hold mic to confirm new pill layout

### Expected result

Voice bubbles look as dense and clean as Telegram's; recording overlay collapses to the familiar single pill with slide-to-cancel + lock above mic.
