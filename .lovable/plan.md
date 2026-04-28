# Next Iteration: Wire & Extend the Telegram-Style Chat Hub

The previous turn shipped the **building blocks** (`useThreadSettings`, `GlobalChatSearch`, `MuteDurationSheet`, `UserBadge`, `usePrivacy`, `chat_thread_settings`, `user_privacy_settings`). They exist in code but are mostly **not wired** into the live chat surfaces yet. This iteration finishes the wiring and adds the next batch of Telegram-parity features.

---

## Part A — Wire what already exists (no new tables)

### 1. Hook `ChatRowActionsSheet` to `useThreadSettings`
Today the sheet shows Pin / Mute / Archive but each row passes local-only `isPinned/isMuted/isArchived` props. Move that source of truth to `useThreadSettings`:
- In `ChatHubPage`, derive `isPinned/isMuted/isArchived` from `useThreadSettings.get(buildThreadId(kind, id))`.
- `onTogglePin` → `pin()/unpin()`. `onToggleArchive` → `archive()/unarchive()`.
- `onToggleMute` → open `MuteDurationSheet` (1 h / 8 h / 1 d / 1 w / Forever / Unmute) instead of immediate toggle.
- Sort the chat list: pinned first (newest pin on top), then unpinned by `last_message_at`, archived bucket hidden behind an "Archived chats" header row.

### 2. Add `UserBadge` to chat surfaces
Render `<UserBadge profile={...} />` next to display names in:
- `ChatHubPage` chat rows (verified + premium + online dot)
- `PersonalChat` / `GroupChat` headers
- `ChatHeaderProfileSheet`
- `FindContactsPage`, `SuggestedContactsRow`, `ContactRequestsPage`

### 3. Mount `GlobalChatSearch` properly
Replace the inline `ChatSearch` overlay invocation on the hub search bar so tapping search opens the 4-tab overlay (Chats / Contacts / Channels / Messages). Keep the existing `ChatSearchAllPage` as a deep-link route.

### 4. Apply `usePrivacy` server-side effects
`PrivacySecurityPage` already reads `usePrivacy`, but the values aren't enforced anywhere. Enforce on read:
- Hide `last_seen` in `ChatContactInfo` / `PersonalChat` header when target's `last_seen = nobody` (or `contacts` and viewer not a contact).
- Suppress read-receipt ticks in `ReadReceipt` when either party has `read_receipts = false`.
- Block "Add to group" call paths when target's `group_invites = nobody`.

---

## Part B — New features (small, additive)

### 5. Folder unread counters + swipe-to-archive
- Compute unread totals per folder in `ChatFolders` using existing `dm_unread` index; show pill badge per tab.
- Add a left-swipe → Archive, right-swipe → Pin gesture in `SwipeableRow` (already exists; just wire to thread settings).

### 6. "Saved Messages" self-DM
- Add a permanent pinned row at the top of the hub: avatar = bookmark icon, label = "Saved Messages", routes to `/chat/dm/<self.id>`.
- In `PersonalChat`, when `peerId === user.id`, render a custom header ("Saved Messages — your private cloud") and skip presence/typing.

### 7. Scheduled & silent send (UI only — engine exists)
- Long-press the send button in `ChatComposer` to open `MessageScheduler` (already in repo) plus a new "Send without sound" option that sets `silent=true` on the outbound payload (push function already honors `silent`).

### 8. Forward stats + "Forwarded from" label
- When a message has `forwarded_from_user_id`, render a small italic header "Forwarded from <name>" in `ChatMessageBubble` with `<UserBadge>`.
- Respect `privacy.forwards = nobody` (show "Hidden account" instead of name + disable tap-through).

### 9. Quick reaction tray
- Double-tap a bubble → instant ❤️ reaction (already partially wired); long-press still opens full `MessageReactionPicker`. Persist last-used emoji per user in `localStorage` for the "+" slot.

### 10. Empty-state polish
- `ContactsPage`: when zero contacts, big illustration + "Sync phone contacts" + "Find people nearby" + "Invite friends" CTAs.
- `ContactRequestsPage`: split tabs Incoming / Sent / Declined with counts in tab labels.

---

## Part C — Database (one small migration)

Only one new column needed; everything else reuses existing tables.

```sql
-- Allow per-message "silent" flag + scheduled send timestamp on direct_messages
alter table public.direct_messages
  add column if not exists silent boolean not null default false,
  add column if not exists scheduled_for timestamptz;

create index if not exists idx_direct_messages_scheduled
  on public.direct_messages (scheduled_for)
  where scheduled_for is not null;
```

A tiny edge-function cron (`flush-scheduled-messages`, every minute) flips `scheduled_for → null` and broadcasts via Realtime so the existing chat listener delivers them.

---

## File map

**New:**
- `supabase/functions/flush-scheduled-messages/index.ts`
- `src/components/chat/SavedMessagesRow.tsx`
- `src/components/chat/ForwardedFromHeader.tsx`

**Modified:**
- `src/pages/ChatHubPage.tsx` — wire thread settings, mount `GlobalChatSearch`, add Saved Messages row, sort by pin/archive
- `src/components/chat/ChatRowActionsSheet.tsx` — open `MuteDurationSheet`
- `src/components/chat/ChatMessageBubble.tsx` — render `ForwardedFromHeader`, double-tap quick reaction
- `src/components/chat/ChatComposer.tsx` — long-press send → schedule / silent
- `src/components/chat/ReadReceipt.tsx`, `src/components/chat/ChatContactInfo.tsx` — honor `usePrivacy`
- `src/components/chat/ChatFolders.tsx` — unread counters per folder
- `src/components/chat/SwipeableRow.tsx` — gesture → pin/archive
- `src/pages/chat/ContactsPage.tsx`, `src/pages/chat/ContactRequestsPage.tsx` — empty-state polish
- Multiple headers/rows — drop in `<UserBadge>`

**Migration:** adds `silent` + `scheduled_for` to `direct_messages` (+ index).

---

## Out of scope this round
- Secret chats end-to-end key exchange (already has placeholder page)
- Bots / inline keyboards
- Stories integration into chat (already separate system)
- Voice-to-text transcription (separate pipeline)

Approve and I'll wire it all up in one pass.