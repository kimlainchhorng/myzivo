# Smooth Hold-to-Record Voice — Round 5

## Problem
The mic button in `PersonalChat` (and `GroupChat`) is **tap-to-start / tap-to-send**, which feels clunky. Users expect a Telegram/WhatsApp/iMessage-style **press-and-hold** mic with **slide-up-to-lock** and **slide-left-to-cancel** gestures. The standalone `VoiceRecorderButton` already has hold logic but is unused, and only handles cancel — no lock, no haptics, no slide-left, no preview-before-send.

## What we'll build

### 1. New `HoldToRecordMic` component
A premium, gesture-driven mic that replaces the inline mic button in both `PersonalChat` and `GroupChat`.

**Gestures (single pointer, no extra taps):**
- **Press & hold** → start recording instantly (after 120ms guard to ignore accidental taps)
- **Release** → send the voice note
- **Slide left past threshold** → cancel with red trash animation + haptic
- **Slide up past threshold** → lock recording (hands-free); shows a floating Stop/Send/Cancel toolbar
- **Light haptic** on start, lock, and cancel (via `navigator.vibrate` fallback + Capacitor Haptics if available)

### 2. Smooth recording overlay
Replace the current static random-bar overlay with a real-time waveform tied to actual mic input (RMS samples from `useVoiceRecorder` already exist — surface them live).

**Visual states:**
- **Recording (held):** mic pulses, slide-left chevron + "Slide to cancel", upward chevron + lock icon, live waveform, MM:SS timer, drag offset follows finger with rubber-band easing
- **Locked:** floating compact bar above keyboard with Pause / Trash / Send, waveform continues, finger free
- **Cancelling preview:** bar turns red, mic shakes, releasing here trashes the recording

### 3. Tap-vs-hold disambiguation
- Quick tap (<200 ms or <500 ms recording) → toast "Hold to record" and discard, no error
- Mic permission denied → friendly inline tooltip with "Enable mic" deep link

### 4. Hook upgrades — `useVoiceRecorder`
- Expose **live waveform stream** (last 32 samples) via state, not only on stop
- Add `pause()` / `resume()` for the locked state
- Pre-warm `getUserMedia` on first long-press attempt and cache the stream for 5s after stop to avoid the cold-start delay

### 5. Wire-in
- Replace inline mic in `PersonalChat.tsx` (lines 1604-1609) with `<HoldToRecordMic onRecorded={handleVoiceUpload} />`
- Replace the existing recording overlay block (lines 1430-1483) — the new component owns its own overlay
- Same swap inside `GroupChat.tsx`
- Remove the now-dead inline overlay; keep `voice.audioBlob` upload path intact

### 6. Polish
- Smooth Framer Motion spring for the drag offset (stiffness 400, damping 32)
- Backdrop-blurred floating "lock" pill that animates up as the user drags
- Sound cue on send (subtle pop) — reuses existing `giftSounds.ts` util pattern
- iOS safe-area aware so the locked toolbar sits above the home indicator

## Technical notes
- Single new file: `src/components/chat/HoldToRecordMic.tsx`
- Edits: `src/hooks/useVoiceRecorder.ts` (live waveform + pause/resume), `src/components/chat/PersonalChat.tsx`, `src/components/chat/GroupChat.tsx`
- No DB / migrations / new deps — pure UX layer
- Existing `VoiceRecorderButton.tsx` left in place (still used elsewhere if any) but the new component supersedes it

## Out of scope (ask later if wanted)
- Voice-to-text transcription preview before send
- Variable playback speed in the bubble (already supported in VoiceMessageBubble)
- Background noise suppression toggle
