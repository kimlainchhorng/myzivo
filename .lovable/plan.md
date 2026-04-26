## Goal
Make the Chat hub (`/chat`) feel like Telegram: denser, more informative, and more interactive — so users stop saying "missing a lot."

All work stays inside the existing `ChatHubPage.tsx` + a few small new components. No backend/data model changes are required for v1 (pin/archive/mute use a per-user local store first, with a follow-up migration noted at the end).

---

## 1. Folder bar with unread badges

Replace the current 4-pill category row (Personal / Shop / Support / Ride) with a Telegram-style horizontal folder bar:

- `All`, `Unread`, `Personal`, `Groups`, `Shop`, `Support`, `Ride`
- Each pill shows a small green badge with the unread count for that folder (hidden when 0)
- Active pill = filled green; inactive = subtle gray; horizontal scroll on overflow
- Persist last-selected folder in `localStorage`

Folder filtering is computed client-side from the chat list already loaded.

## 2. Pinned chats + swipe actions

- New "Pinned" section at the top of the list (separator label "Pinned"), followed by "Chats"
- Long-press a row OR swipe-right → action sheet with **Pin / Unpin, Mute / Unmute, Mark read, Archive, Delete**
- Swipe-left on a row → reveals inline `Archive` (amber) and `Delete` (red) buttons (Telegram-style)
- Swipe-right on a row → reveals `Read/Unread` and `Pin` buttons
- Implementation: wrap each row in a `SwipeableRow` component using `framer-motion` drag with snap thresholds; reuse existing toast for confirmations

## 3. Rich row metadata (the big visual upgrade)

Each conversation row will show:

- **Avatar** with a green online dot (bottom-right) when the contact is online (use existing `useChatPresence` presence channel, batched per visible row)
- **Verified badge** next to name (already imported)
- **Pin icon** to the left of the timestamp when pinned
- **Mute bell** (slashed) when muted
- **Last-message preview** with:
  - `You: …` prefix when the last message is from the current user
  - `typing…` in green (replaces preview while the other side is typing)
  - Sender name prefix in groups (`Alex: hey`)
  - Existing media icons (📷 🎤 📍 🎥) preserved
- **Delivery ticks** on outgoing previews: `✓` sent, `✓✓` delivered, blue `✓✓` read (derive from `read_at` / `delivered_at` on `direct_messages`)
- **Unread count badge**: green pill, right-aligned under the timestamp; gray when chat is muted

## 4. Archive section + search filters

- A single "Archived chats" row pinned at the very top of the list (Telegram-style) when ≥1 chat is archived. Tap → expands to show archived chats inline; unread count shown on the row.
- Inside the search input, when the user starts typing, show filter chips below it: **Chats · Media · Links · Files** (v1 only "Chats" is functional; the others render as disabled "Coming soon" chips so the UI parity is there without scope creep).

## 5. Friendly empty state

When the personal folder has 0 (or only 1) chats, render a 3-card suggestion grid below the existing "Your story" row:

- **Invite friends** → opens native share sheet with the user's referral link
- **Find people nearby** → routes to `/nearby`
- **New group** → opens existing `CreateGroupModal`

Cards use the established rounded-2xl + soft-shadow style with emerald accent icons.

---

## Technical details

**Files touched**
- `src/pages/ChatHubPage.tsx` — folder bar, archive row, suggestion grid, wire new row component
- `src/components/chat/ChatListRow.tsx` *(new)* — extracts the row markup with online dot, ticks, mute/pin icons, typing/You-prefix preview
- `src/components/chat/SwipeableRow.tsx` *(new)* — reusable framer-motion swipe wrapper (left/right action reveal + snap)
- `src/hooks/useChatPrefs.ts` *(new)* — localStorage-backed pin/mute/archive map keyed by `userId:partnerId`; returns `{pinned, muted, archived, togglePin, toggleMute, toggleArchive}`
- `src/hooks/useBulkPresence.ts` *(new)* — single Supabase presence channel `chat-list-presence` that tracks which user_ids in the visible list are online (avoids one channel per row)

**Data**
- v1 stores pin/mute/archive in `localStorage` so it ships immediately and works offline.
- Follow-up (noted, not built now): a `chat_preferences` table `(user_id, partner_id, pinned, muted, archived, updated_at)` synced via Supabase for cross-device parity.

**Performance**
- Memoize folder counts and sort with `useMemo` keyed on `[chats, prefs]`.
- Single presence channel for the whole list (not per row).
- Delivery tick state read from existing message fields — no extra query.

**Visuals**
- Reuse existing emerald tokens (`bg-primary`, `text-primary`); keep the rounded-2xl glass aesthetic from the v2026 chat memory.
- Online dot: `w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background absolute -bottom-0.5 -right-0.5`.
- Unread badge: `min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px]` (gray variant when muted).

**Out of scope for this pass**
- Cross-device sync of pin/mute/archive (planned follow-up table).
- Functional Media/Links/Files search filters (UI only).
- Channels tab (separate feature already at `/channels`).

---

## Result

After this change the Chat screen will display: folder tabs with live unread badges, an archive row, a pinned section, rows with online dots, ticks, mute/pin markers, "You:"/typing previews, swipe actions, and a friendly suggestion grid when the list is short — closing the gap with Telegram in one pass.