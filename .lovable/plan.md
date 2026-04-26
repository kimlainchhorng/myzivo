# Phase 3 — Messaging Power-ups

Goal: Bring chat to Telegram parity with **edit, forward, reply quote, multi-emoji reactions, voice notes, self-destruct timers, scheduled send, pin, and AI translate/transcribe**.

---

## 1. Database

### New columns on `messages` (additive, all nullable)
- `edited_at timestamptz`
- `original_text text` (snapshot of pre-edit body for "edited" UI)
- `forwarded_from_message_id uuid` + `forwarded_from_user_id uuid`
- `reply_to_message_id uuid`
- `self_destruct_seconds int` (1–60; null = off)
- `expires_at timestamptz` (computed when first read)
- `scheduled_for timestamptz` (null = send now)
- `is_pinned boolean default false`
- `pinned_at timestamptz`

### New tables
- `message_reactions` — already exists (used by `MessageReactionPicker`). Confirm RLS allows owner upsert + read by chat participants.
- `message_pins` — `id, chat_partner_id, message_id, pinned_by, pinned_at`. One pin per message per conversation.
- `voice_notes` — `id, message_id, storage_path, duration_ms, waveform jsonb, transcript text, transcript_lang text`.
- `scheduled_messages` — staging table for `scheduled_for > now()`; a cron edge function flips them into `messages` at fire time.

### Storage
- Bucket `voice-notes` (private). RLS: owner write, chat participants read.

---

## 2. Hooks

```
src/hooks/
  useMessageActions.ts    // edit, delete, forward, reply, pin
  useReactions.ts         // toggle, list, real-time updates
  useVoiceRecorder.ts     // MediaRecorder + waveform sampling + upload
  useSelfDestruct.ts      // arm timer on read, fire delete
  useScheduledSend.ts     // queue + list scheduled
  useMessageTranslate.ts  // wraps useCaptionTranslation for messages
  useVoiceTranscribe.ts   // calls transcribe-voice edge function
```

---

## 3. Edge functions

```
supabase/functions/
  schedule-fire/         // cron every 60s; moves due rows from scheduled_messages → messages
  transcribe-voice/      // takes voice_notes.id → calls Lovable AI (whisper-equivalent) → writes transcript
  translate-message/     // already covered by translate-caption, reuse
```

---

## 4. UI components

```
src/components/chat/
  MessageBubble.tsx                // (extend) render reply quote, forwarded badge, edited tag, pin icon, burn timer
  MessageActionsSheet.tsx          // long-press menu: Reply, Forward, Edit, Copy, Pin, Delete, React, Translate
  ForwardPickerSheet.tsx           // pick contact / chat to forward to
  EditMessageBar.tsx               // inline edit bar above composer
  ReplyComposerBar.tsx             // shows quoted message above input
  VoiceRecorderButton.tsx          // hold-to-record, swipe-to-cancel, waveform
  VoiceNotePlayer.tsx              // bubble player with waveform + transcript toggle
  SelfDestructPicker.tsx           // 5s/10s/30s/1m/off
  ScheduledMessagesSheet.tsx       // list pending scheduled, cancel/edit
  PinnedMessageBanner.tsx          // top of ChatPage
  TranslateMenuItem.tsx            // per-message translate to user's locale
```

---

## 5. Routes

```
/chat/:partnerId/scheduled        ScheduledMessagesSheet (modal route)
/chat/:partnerId/pinned           PinnedMessagesPage
```

---

## 6. Workflow

```text
Edit message
  ├─▶ long-press → MessageActionsSheet → Edit
  ├─▶ EditMessageBar shows above composer with current text
  └─▶ Save → messages.update({text, edited_at, original_text})

Forward
  ├─▶ Actions → Forward → ForwardPickerSheet
  └─▶ For each target: messages.insert({...copy, forwarded_from_*})

Reply
  ├─▶ Swipe-right on bubble or Actions → Reply
  └─▶ ReplyComposerBar mounts; send → messages.insert({reply_to_message_id})

Voice note
  ├─▶ Hold mic button → MediaRecorder (opus/webm)
  ├─▶ Release → upload to voice-notes bucket
  ├─▶ messages.insert({type:'voice'}) + voice_notes.insert({...})
  └─▶ background: transcribe-voice edge function fills transcript

Self-destruct
  ├─▶ Composer → flame icon → SelfDestructPicker (5s/10s/30s/1m)
  ├─▶ messages.insert({self_destruct_seconds: N})
  ├─▶ Recipient opens chat → first read sets expires_at = now + N
  └─▶ Client timer + cron sweep delete row at expires_at

Scheduled send
  ├─▶ Composer long-press send → date/time picker
  ├─▶ scheduled_messages.insert(...)
  └─▶ schedule-fire cron (every 60s) flips due rows to messages

Pin
  ├─▶ Actions → Pin → message_pins.insert; messages.update(is_pinned=true)
  └─▶ PinnedMessageBanner shows latest pin at top of chat

Reactions (multi-emoji)
  ├─▶ Long-press → MessageReactionPicker (already exists, extend to 16 emojis)
  ├─▶ message_reactions.upsert({message_id,user_id,emoji})
  └─▶ Realtime subscribe → bubble shows aggregated counts

AI translate
  ├─▶ Actions → Translate
  └─▶ translate-message → display under bubble, toggle original/translation

AI transcribe
  └─▶ Auto on voice send; user can tap "Show transcript" on player
```

---

## 7. Security
- RLS on all new tables: owner-write, chat-participant-read (uses existing `is_chat_participant` helper).
- Voice note bucket: signed URLs only, 5-min expiry.
- Edit window: server trigger blocks edits older than 48h (Telegram parity).
- Self-destruct: cron `cleanup-expired-messages` runs every minute; also client deletes locally on timer.
- Scheduled messages: RLS owner-only; fire function uses service role.

---

## 8. Sub-phases (shippable)

**3A — Edit / Reply / Forward / Pin** (no new edge functions)
- DB columns + `useMessageActions`, `MessageActionsSheet`, `ReplyComposerBar`, `EditMessageBar`, `ForwardPickerSheet`, `PinnedMessageBanner`.

**3B — Multi-emoji Reactions polish + Realtime**
- Extend `MessageReactionPicker` to 16 emojis + long-press for full picker; aggregate counts on bubble; realtime channel.

**3C — Voice Notes + AI Transcribe**
- Bucket, `voice_notes` table, `useVoiceRecorder`, `VoiceRecorderButton`, `VoiceNotePlayer`, `transcribe-voice` edge function (Lovable AI whisper).

**3D — Self-Destruct + Scheduled Send**
- Columns, `SelfDestructPicker`, `ScheduledMessagesSheet`, `schedule-fire` cron, `cleanup-expired-messages` cron.

**3E — AI Translate per-message**
- `TranslateMenuItem` reusing `translate-caption` function.

---

## 9. Acceptance
- Long-press a message → see Reply, Forward, Edit (own only), Copy, Pin, React, Translate, Delete.
- Edit a message within 48h → bubble shows "edited" tag.
- Forward to another contact → recipient sees "Forwarded from @username".
- Hold mic → record voice → release → bubble shows waveform + auto transcript.
- Send a self-destruct (10s) photo → vanishes 10s after recipient opens.
- Schedule a message for tomorrow 9am → appears in recipient's chat at 9am.
- Pin a message → banner stays visible at top of chat.
- Tap Translate on a foreign-language message → see translation under original.

Approve and I'll build 3A first, then continue through 3E.
