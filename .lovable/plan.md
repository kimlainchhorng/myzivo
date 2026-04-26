# Phase 3B–3E — Reactions, Voice, Self-Destruct, Translate

Phase 3A (Edit / Reply / Forward / Pin) shipped. Approve to continue with the remaining sub-phases.

---

## 3B — Multi-emoji Reactions + Realtime aggregation

**Hooks**
- `src/hooks/useReactions.ts` — load aggregated reactions per `message_id`, subscribe to realtime inserts/deletes, expose `toggle(emoji)` (insert if absent, delete if I already reacted).

**Components**
- `MessageReactionPicker.tsx` (rewrite) — switch from 8 lucide icons to **16 native emojis** (❤️ 😂 👍 👎 🔥 🎉 ✨ ⭐ 😮 😢 🙏 💯 👏 🤔 😍 💔), grid layout, hold-to-expand later.
- `MessageReactionsBar.tsx` (new) — chip row under each bubble showing `❤️ 3` style aggregates; tap to toggle; framer-motion enter/exit; highlight chip if reactedByMe.

Reuses existing `message_reactions` table (columns: `message_id, user_id, emoji`). No schema changes.

---

## 3C — Voice Notes + AI Transcribe

**Hooks**
- `useVoiceRecorder.ts` — MediaRecorder (`audio/webm;codecs=opus`), 64-bin waveform sampling via Web Audio API, hold-to-record / swipe-up-to-cancel, returns `{ blob, durationMs, waveform }`.
- `useVoiceTranscribe.ts` — invokes `transcribe-voice` edge function with the storage path; updates `voice_notes.transcript`.

**Components**
- `VoiceRecorderButton.tsx` — replaces the mic icon in composer; long-press to record, animated waveform preview, swipe-up cancels, release sends.
- `VoiceNotePlayer.tsx` — bubble player: play/pause, scrubbable waveform, duration, "Show transcript" toggle.

**Edge function**
- `supabase/functions/transcribe-voice/index.ts` — downloads voice blob via signed URL, calls **Lovable AI gateway** (`google/gemini-2.5-flash` for audio transcription with `inline_data` audio input), writes `transcript` + `transcript_lang` back to `voice_notes`.

**Storage bucket**: create private `voice-notes` bucket via migration with RLS (owner upload, sender+recipient read).

**Reuses** existing `voice_notes` table (columns: `user_id, conversation_id, audio_url, duration_seconds, waveform_data, is_listened`). I'll add columns `transcript text`, `transcript_lang text`, `message_id uuid`.

---

## 3D — Self-Destruct + Scheduled Send

**Already in DB**: `direct_messages.expires_at`, `disappearing_message_settings`, `scheduled_messages` table (with `sender_id, receiver_id, message, scheduled_at, status`).

**Hooks**
- `useSelfDestruct.ts` — when recipient first reads a message with `expires_at IS NULL` and a `self_destruct_seconds` value, set `expires_at = now + N`. Client timer hides + deletes locally at expiry; server sweep also deletes.
- `useScheduledSend.ts` — list pending (`status='pending'`), schedule new, cancel.

**Components**
- `SelfDestructPicker.tsx` — popover from composer flame icon: Off, 5s, 10s, 30s, 1m, 5m.
- `ScheduledMessagesSheet.tsx` — bottom sheet listing user's pending scheduled messages with cancel/edit.
- Composer: long-press send → date/time picker → inserts into `scheduled_messages`.

**Migration**: add `self_destruct_seconds int` to `direct_messages`.

**Edge functions** (cron every minute via `pg_cron` + `pg_net`)
- `schedule-fire` — flips `scheduled_messages` rows where `scheduled_at <= now()` and `status='pending'` into `direct_messages`, marks `status='sent'`.
- `cleanup-expired-messages` — deletes `direct_messages` where `expires_at <= now()`.

---

## 3E — Per-message AI Translate

**Hook**
- `useMessageTranslate.ts` — given a message id + target language (user's locale), check `message_translations` cache; if miss, invoke `translate-caption` (existing) and persist to `message_translations`.

**Component**
- `TranslateMenuItem` already wired in `MessageActionsSheet`. Tapping opens the translation under the bubble (`MessageBubble` extension): "Translated from {sourceLang}" + translated text + "Show original" toggle.

Reuses existing `message_translations` table.

---

## Acceptance per sub-phase

- **3B**: Long-press a bubble → 16-emoji picker → tap emoji → chip appears under bubble for both users in real time. Tap own chip again → removes it.
- **3C**: Hold mic → record → release → bubble with waveform plays back; transcript appears 2-5s later under the player.
- **3D**: Send a self-destruct (10s) message → recipient opens it → 10s countdown → bubble vanishes. Schedule "Hello" for tomorrow 9am → appears in chat at 9am.
- **3E**: Tap Translate on a French message → see English translation under it; toggle back to original.

Approve to build all four (3B → 3E) sequentially in one loop.
