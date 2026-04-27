## Make voice UI smooth like Telegram

The previous Telegram pass got the layout right but playback and recording still look choppy. Three concrete sources of jank:

### Issues

1. **Bars step on/off in chunks.** Telegram fills the *active* bar partially (left-to-right) so the boundary glides through the waveform. We use `i/barCount <= progress` which flips full bars in 1/48 jumps.
2. **Re-rendering 48 bars 60×/sec is heavy.** Every progress tick re-computes color classes for every bar with `transition-colors duration-150`, causing flicker on the boundary.
3. **`timeupdate` is not smooth.** Browsers fire `timeupdate` ~4-15×/sec. We need `requestAnimationFrame` interpolation between events for a continuous progress line.
4. **Recording pill hint** translates with raw `dragX`, not springed → micro-stutter on touch.

### Changes

**`src/components/chat/VoiceMessagePlayer.tsx`**
- Replace per-bar React state with **one progress ref + RAF loop** that updates a single CSS variable on the waveform container; bars are rendered once and don't re-render on progress.
- Each bar gets `--p` (its position) and uses a CSS gradient mask: bar background is filled-color, with an overlay using `linear-gradient(to right, transparent var(--fill), unfilledColor var(--fill))` so the active bar shows a partial fill — boundary slides smoothly.
- Drop `transition-colors` (no longer needed since fill is gradient-driven).
- Keep `timeupdate` only to sync absolute time; RAF interpolates between events using `audio.currentTime` + `performance.now()` delta * playbackRate.
- Memoize the waveform array (already deterministic).

**`src/components/chat/HoldToRecordMic.tsx`**
- Replace `dragX * 0.45` raw translate on the slide-cancel hint with a **spring** (`framer-motion` `useSpring`) so it eases instead of tracking 1:1.
- Add `will-change: transform` on the moving lock chip and slide hint so the browser promotes them to compositor layers.
- Pin the bottom pill height to a fixed 44px so the layout doesn't reflow when "Release to cancel" replaces the hint.

**Verify**
- `bunx tsc --noEmit`
- Open `/chat/personal/<id>` on 428×703, play a voice note — boundary should glide, no stepping
- Hold mic, slide left — hint should drift smoothly with spring, not snap

### Expected result

- Playhead glides through bars instead of stepping bar-by-bar
- No 48-element re-renders per frame
- Recording overlay tracks the finger smoothly without jitter
