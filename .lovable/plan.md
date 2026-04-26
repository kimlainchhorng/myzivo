# Telegram-2026 Round-4 Add-ons

The big infrastructure (pinned banner, reply, reactions, forward, schedule, search, stickers, gallery, personalization, translate, channels, secret chat) is already mounted. The remaining "Telegram 2026" gaps are surfacing and polish. Six focused additions:

## 1. In-Chat Header Profile Sheet
Tap the chat header avatar/name → bottom sheet with:
- Large avatar, name, @username, online/last-seen, bio
- Quick actions row: Audio, Video, Mute, Search, More
- Sections: Notifications, Media (count), Files, Links, Shared groups
- Block / Report / Clear history at the bottom

New: `src/components/chat/ChatHeaderProfileSheet.tsx`
Wire: header tap target in `PersonalChat.tsx` (single line change).

## 2. Channels Tab in Chat Hub
Add a `Channels` folder pill alongside All/Unread/Personal/Groups/Shop. Selecting it lists channels the user follows (from existing `channels` / `channel_subscribers` tables) with subscriber count, broadcast badge, latest post preview. Tap → `/c/:handle`.

Wire: `src/pages/ChatHubPage.tsx` folders array + a new query branch.

## 3. Broadcast Lists
Send the same message to many people without a group. Page to create / manage broadcast lists; "Broadcast" entry added to the New-chat FAB.

New:
- `src/pages/chat/BroadcastListsPage.tsx`
- `src/pages/chat/NewBroadcastPage.tsx`
- DB: `broadcast_lists` and `broadcast_list_members` tables (RLS, owner-only).

## 4. Reply-to-Story in Chat
When a user views a friend's story they can already reply (story system exists). Surface the reply as a special bubble in the chat with story thumb + caption snippet + "Replied to your story". Adds an inline `StoryReplyBubble.tsx` rendered by `ChatMessageBubble.tsx` when `message_type === "story_reply"`.

New: `src/components/chat/StoryReplyBubble.tsx`
Wire: 1 conditional branch in `ChatMessageBubble.tsx`.

## 5. Gift / Tip In-Bubble
Send Z-Coins as a chat gift. Adds a "Gift" entry to the existing attach menu → opens `GiftSendSheet.tsx` (reuses the existing gift catalog & wallet). Recipient sees a `GiftBubble` with animation, coin amount, optional note, and Accept badge.

New:
- `src/components/chat/GiftSendSheet.tsx`
- `src/components/chat/GiftBubble.tsx`
- DB: extend `direct_messages.message_type` to allow `gift` (no schema change — column is text); add `gift_payload jsonb` column.

## 6. Storage Manager
Telegram-style "Data and Storage" page: per-chat cache size, clear cache, auto-download rules (photos/videos/files on Wi-Fi vs cellular, max size). Toggles persist to localStorage; clear actually flushes IndexedDB / Cache API entries we control.

New: `src/pages/chat/settings/StorageManagerPage.tsx`
Route: `/chat/settings/storage`
Wire: link from the Privacy hub.

## Routes Added
```
/chat/broadcasts            → BroadcastListsPage
/chat/broadcasts/new        → NewBroadcastPage
/chat/settings/storage      → StorageManagerPage
```

## Files Touched
- New (8): ChatHeaderProfileSheet, StoryReplyBubble, GiftSendSheet, GiftBubble, BroadcastListsPage, NewBroadcastPage, StorageManagerPage, useBroadcastLists hook
- Edits (4): ChatHubPage (channels folder + broadcast in FAB), PersonalChat (header tap, gift attach), ChatMessageBubble (story-reply + gift branches), ChatPrivacyHubPage (storage link), App.tsx (3 routes)
- Migration (1): `broadcast_lists`, `broadcast_list_members`, add `gift_payload` to `direct_messages`

## Out of Scope (Already Done or Deferred)
- Pinned message bar, in-chat search, reply, reactions, forward, schedule — already wired
- Custom folders, global search, privacy hub — shipped Round-3
- Slash-commands, @mention picker, voice waveform polish — defer to Round-5 (composer-only round)

## Approval
Approve to build all six. If you want a subset, say which numbers to keep.
