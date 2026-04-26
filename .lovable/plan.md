## Goal
Round 2 of Telegram-parity for the Chat hub. The previous pass added folders, swipe actions, pin/mute/archive prefs, and a suggestion grid — but these row-level Telegram details and entry points are still missing. This pass closes those gaps without touching the inner chat screens.

---

## What's still missing vs Telegram (and what we'll build)

### 1. Online presence dots on every avatar
Right now rows have no live online indicator. Add a single shared presence channel (`chat-list-presence`) that tracks which user_ids in the visible list are online, and render a green dot on the avatar bottom-right.

- New hook `src/hooks/useBulkPresence.ts` — joins one Supabase presence channel, accepts an array of user_ids, returns `Set<string>` of online ids. Re-tracks when the list changes; cleans up on unmount.
- Render: `w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background absolute -bottom-0.5 -right-0.5` on personal rows only (not groups).

### 2. Delivery ticks on outgoing previews
Telegram shows ✓ / ✓✓ / blue ✓✓ next to outgoing previews. Today the row preview has no tick at all.

- When the last message's `sender_id === currentUser.id`, prepend tick icon:
  - `Check` (single) when `delivered_at` null
  - `CheckCheck` (gray) when delivered but not read
  - `CheckCheck` (emerald) when `is_read = true`
- Already imported `Check` / `CheckCheck`. Pull the needed fields (`sender_id`, `delivered_at`, `is_read`) into the existing chat list query and pass through.

### 3. "You:" prefix + group sender prefix + live typing preview
Today preview is plain text. Telegram shows `You: …`, `Alex: hey` (groups), and replaces the preview with green `typing…` while the partner is typing.

- "You:" prefix already partially in place — verify and apply consistently.
- Groups: prefix with sender display name from `last_message.sender_name` if available.
- Typing: piggy-back on the existing `useChatPresence` channel pattern — broadcast `typing` events on the per-conversation channel; the hub subscribes to a lightweight `chat-typing-bus` channel that fans out which `partner_id` is currently typing. Replace preview line with `<span class="text-primary">typing…</span>` when set.

### 4. Long-press / row-tap action sheet
Swipe actions exist but discoverability is low on web. Add a `MoreVertical` button that opens a `Sheet` (reuse shadcn) with: **Pin / Unpin**, **Mute / Unmute**, **Mark as read**, **Archive / Unarchive**, **Clear history**, **Delete chat**. Long-press (300ms) on touch also triggers it.

- New `src/components/chat/ChatRowActionsSheet.tsx`.
- Reuse `useChatPrefs` for pin/mute/archive; wire delete + clear to existing handlers in `ChatHubPage`.

### 5. Search filter chips (Chats / Media / Links / Files)
v1 promised "Chats" functional + others as "Coming soon". Currently no chips render under search. Add the chip row that appears only when search is non-empty; "Chats" is active, others render disabled with a "Soon" tag.

### 6. Saved Messages (Telegram's "self chat")
A staple Telegram feature with no equivalent today. Add a pinned, always-on row at the very top of the personal folder labeled **Saved Messages** with the bookmark icon. Tapping opens `PersonalChat` with the user's own id as the partner — `direct_messages` already supports same-user rows; we just need to allow it in the row click handler.

- Last-message preview pulls from `direct_messages` where `sender_id = receiver_id = me`.
- Auto-creates on first tap (no row insert needed; the chat opens empty).

### 7. Floating "New" FAB with menu
Telegram has a single circular pencil FAB that fans out: **New Group**, **New Channel**, **New Contact**, **New Chat**. Today we only have a `+` in the header. Add a bottom-right FAB (above the mobile nav) with a popover menu of those 4 actions. "New Channel" routes to `/channels/new`, "New Contact" opens `AddContactSheet`, "New Group" opens `CreateGroupModal`, "New Chat" opens contact picker.

### 8. Unread/Mute icons on the avatar row (polish)
- Pin icon shown left of the timestamp when `isPinned` (already added) — verify on muted+pinned combo.
- Add a tiny mute-bell on the avatar corner when muted *and* unread > 0 so the gray badge reads clearly.
- Date column: show today's time, "Yesterday", or short date — same as Telegram (already in `formatChatTime`, verify groups path uses it too — currently groups inline-format.)

---

## Technical details

**New files**
- `src/hooks/useBulkPresence.ts` — single shared presence channel, returns `Set<string> onlineIds`.
- `src/hooks/useTypingBus.ts` — subscribes to a broadcast channel that each `PersonalChat` already pings on input; returns `Map<partnerId, boolean>`. (Will also add a one-line broadcast inside `PersonalChat`'s existing typing handler.)
- `src/components/chat/ChatRowActionsSheet.tsx` — shadcn `Sheet` with the action list.
- `src/components/chat/NewChatFab.tsx` — floating button + popover.
- `src/components/chat/SearchFilterChips.tsx` — chip row.

**Files edited**
- `src/pages/ChatHubPage.tsx`
  - Hook in `useBulkPresence` with the list of visible personal partner ids.
  - Hook in `useTypingBus` and override preview text when typing.
  - Inject Saved Messages pseudo-row at top of personal list.
  - Render `NewChatFab`, `SearchFilterChips`, presence dots, ticks, action-sheet trigger.
  - Extend the existing chats query to include `sender_id`, `delivered_at`, `is_read` on the last message.
- `src/components/chat/PersonalChat.tsx` — emit a tiny `chat-typing-bus` broadcast (1 line in the existing typing handler) so the hub can show `typing…`.

**Data**
- No schema changes. All new behavior reads existing `direct_messages` columns and uses Supabase Realtime presence/broadcast.

**Performance**
- Presence: one channel, not one-per-row.
- Typing bus: one global broadcast channel; payload is `{ from: uuid, typing: bool }`.
- Memoize ticks/preview transforms keyed on `[chats, prefs, typingMap, onlineIds]`.

**Visuals**
- Reuse emerald primary tokens; rounded-2xl glass aesthetic.
- Online dot, pin icon, slashed bell, ticks all sized to match Telegram density (12–14px).
- FAB: `bottom-20 right-4 size-14 rounded-full shadow-xl bg-primary text-primary-foreground`.

**Out of scope for this pass**
- Cross-device sync of pin/mute/archive (still localStorage; planned `chat_preferences` table later).
- Functional Media/Links/Files filter results (UI only).
- Channels/Stories changes (separate features).
- Backend table for Saved Messages metadata — uses existing `direct_messages` self-rows.

---

## Result

After this pass, every row will show a live online dot, delivery ticks, "You:"/sender prefixes, and live `typing…`. Users get a Saved Messages shortcut, a Telegram-style FAB with all "new" actions, an action sheet for full row controls, and search filter chips — closing the remaining day-to-day Telegram parity gaps in the chat list.
