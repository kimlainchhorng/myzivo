## Next Step: Wire Phase 3B–3D Into the Live Chat UI

Edit + Translate (3A/3E) are already integrated. The reactions, voice notes, self-destruct, scheduled send, forward, pin, and reply components exist as standalone files but are not yet imported anywhere. This step makes them all actually usable in `PersonalChat`.

### What you'll get
- Long-press a bubble → emoji reaction picker (16 emojis) + reaction chips appear under bubbles
- Hold the mic in the composer → record a voice note with waveform + AI transcript
- Flame icon in composer → set self-destruct timer (5s / 1m / 1h / 1d) on next message
- Clock icon in composer → schedule a message for later + view/manage queued messages
- Forward action → pick recipients sheet → send to multiple chats
- Pin action → message pins to top banner above chat
- Tap reply on action sheet → composer shows quoted reply preview

### Files to edit

**`src/components/chat/PersonalChat.tsx`**
- Import: `MessageReactionsBar`, `MessageReactionPicker`, `VoiceRecorderButton`, `SelfDestructPicker`, `ScheduledMessagesSheet`, `ForwardPickerSheet`, `PinnedMessageBanner`, `ReplyComposerBar`, `useScheduledSend`, `useSelfDestruct`
- Add state: `replyTo`, `forwardingMsg`, `selfDestructSec`, `showScheduler`, `pickerForMessageId`
- Render `<PinnedMessageBanner>` between header and message list
- Render `<MessageReactionsBar messageId={m.id}>` under each `ChatMessageBubble`
- Render `<ReplyComposerBar>` above composer when `replyTo` set
- Add composer buttons: mic (`VoiceRecorderButton`), flame (`SelfDestructPicker`), clock (opens `ScheduledMessagesSheet`)
- Wire send: include `reply_to_id`, `expires_at` (now + selfDestructSec), call `scheduleSend` instead of insert when scheduled
- Render `<ForwardPickerSheet>` when `forwardingMsg` set, calls `forwardMessage` from `useMessageActions`

**`src/components/chat/ChatMessageBubble.tsx`**
- Add props: `onReply`, `onForward`, `onPin`, `onReact`, `isPinned`
- Add menu items: Reply, Forward, Pin/Unpin, React (opens picker popover anchored to bubble)
- On long-press (mobile) / right-click (desktop) → open `MessageReactionPicker` floating above bubble

### Out of scope (intentionally)
- GroupChat.tsx wiring — same pattern, do as a follow-up to keep diff reviewable
- Voice playback UI swap (`VoiceMessagePlayer` → `VoiceNotePlayer` with transcript) — separate step, requires testing existing voice messages still render
- 3F secret chats / multi-device — Phase 4

### Acceptance check
After wiring, in PersonalChat you should be able to: long-press a bubble and see the 16-emoji picker, tap an emoji and see a chip appear under the bubble, hold the mic to record + send voice with transcript, set a 1-min self-destruct timer and watch the message disappear, schedule a message for +2 minutes and see it deliver via the cron worker.
