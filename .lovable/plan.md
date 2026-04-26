
# Chat Mega Upgrade — v2026.5

A large multi-area upgrade focused on five missing pillars: **gifting (live-style)**, **wallet inside chat**, **channels workflow**, **contacts real flow**, and a **document/photo scanner that exports A4 PDFs**. Plus the database, edge function and API plumbing to make it all real.

---

## 1) Live-style Gift Sending in Chat

Replace the current static `GiftSendSheet` with a premium, live-stream-grade flow.

- New `ChatGiftPanel` modeled after `LiveStreamPage` gift drawer:
  - Tabbed catalog (Popular / Animated / Exclusive / Coins) using existing `giftCatalog`.
  - Coin balance pill at top (reads `useCustomerWallet` / `useZivoWallet`), "Top up" button → `/wallet`.
  - Long-press to **combo-send** (x2, x5, x10) like in live streams.
- Full-screen gift animation overlay reused from live (`GiftAnimationOverlay`) plays for both sender and receiver in the chat thread (Realtime trigger via `direct_messages` insert).
- New `GiftBubble` upgrade: confetti burst, replay button, "Send back" CTA, coin amount badge.
- Wire from `ChatAttachMenu` → add **Gift** action (replaces the current ad-hoc entry) and from the chat header `+` action.
- Server: deduct coins atomically through new edge function `chat-send-gift` (validates balance, inserts message, writes `gift_transactions` row, broadcasts realtime).

## 2) Wallet inside Chat

Bring the `/wallet` experience into chat without leaving the conversation.

- New `ChatWalletSheet` (bottom sheet) shows: Z-Coin balance, cash balance, last 5 transactions, "Top up", "Send coins to this contact", "Cash out".
- Reuses `useZivoWallet`, `useCustomerWallet`, `useStripePaymentMethods` (no duplicate logic).
- Add **Send Coins** flow (peer-to-peer): amount picker + note → edge function `chat-transfer-coins` (atomic debit/credit + `direct_messages` row of type `coin_transfer` + new `CoinTransferBubble`).
- Entry points: chat header avatar sheet, `+` attach menu ("Send Money"), and long-press on any gift bubble.

## 3) Channels — real workflow inside chat hub

Today `/channels/*` exists in isolation. Surface and finish it.

- Add **Channels tab** to the Chat hub filters row (next to All / Unread / Personal / Groups).
- Realtime subscriptions in `useChannel` for new posts, reactions, and subscriber counts.
- Channel post composer: text, image, video, poll, scheduled posts (reuse `MessageScheduler`).
- Channel admin tools page wiring: pin post, mute subscribers, broadcast notification, export subscribers CSV.
- New edge function `channel-broadcast` (fan-out push via existing `send-push-notification`).
- DB: `channel_posts`, `channel_subscribers`, `channel_post_reactions` (add missing columns: `pinned`, `scheduled_for`, `view_count`).

## 4) Contacts — real workflow

Make `ContactsPage` actually feel like Telegram/WhatsApp contacts.

- Phone-book sync (Capacitor `@capacitor-community/contacts`) with explicit permission screen and on-device matching to ZIVO users via hashed phone numbers.
- Invite non-ZIVO contacts via SMS/WhatsApp share sheet.
- QR add: scan/show QR (reuse `QRProfilePage`).
- Nearby people (Bluetooth/GPS opt-in, mirrors Telegram "People Nearby") — gated behind privacy toggle.
- Contact request flow (`contact_requests` table) with accept/decline + notification.
- Block list management page.
- Realtime presence + last-seen on contact rows (respects `usePrivacy` settings).

## 5) Document & Photo Scanner → A4 PDF

New attach option: **Scan**.

- Multi-page camera capture using `@capacitor/camera` (web fallback: file input).
- Auto edge-detection + perspective correction with **OpenCV.js** (lazy loaded).
- Filters: Original / B&W / Grayscale / Magic Color.
- Reorder pages, retake, delete.
- Export to **A4 PDF** (jsPDF) with proper DPI and margins; also offer JPEG export.
- Upload to `chat-files` bucket → send as `message_type='document'` with `file_payload {name, pages, size_bytes, pdf_url, mime}`.
- New `DocumentBubble` with page-count chip, size, "Open" (in-app PDF viewer using `react-pdf`), Save to device, Forward.
- Quota enforcement via existing storage manager.

## 6) File & Media Upgrades (cross-cutting)

- Generic file attach (PDF, DOCX, ZIP, audio) — new `FileBubble` with mime icon, size, download progress.
- Resumable uploads (tus-style) via existing `uploadWithProgress` util — add chunk retry.
- Preview generation edge function `generate-file-thumbnail` (PDF first page → JPG thumb).
- Per-mime allow-list + AV scan hook `scan-file-upload` (deferred to ClamAV-compatible API).

## 7) Database / Server / API plumbing (single migration)

New tables:
- `gift_transactions` (id, sender_id, receiver_id, message_id, gift_key, coins, combo, created_at)
- `coin_transfers` (id, from_user, to_user, amount, message_id, status, created_at)
- `channel_posts`, `channel_post_reactions`, `channel_subscribers` enhancements
- `contact_requests` (id, requester, recipient, status, created_at, message)
- `blocked_contacts` (owner_id, blocked_user_id, created_at)
- `nearby_presence` (user_id, geohash, updated_at, ttl) with auto-cleanup
- `chat_files` registry (id, owner_id, message_id, bucket_path, mime, size, pages, sha256)

Edge functions: `chat-send-gift`, `chat-transfer-coins`, `channel-broadcast`, `generate-file-thumbnail`, `scan-file-upload`, `contacts-match-hashes`.

Storage buckets: `chat-files` (private, RLS by sender/receiver), `chat-scans` (private).

RLS: `has_role`-style helpers; senders & receivers can read their own gift/coin/transfer rows; channels readable by subscribers, writable by owners/admins.

## 8) UX polish

- Unified **Send menu** redesign (Gift • Money • Photo • Video • Doc • Scan • Location • Poll • Sticker) — Telegram-grade grid with haptics.
- Coin balance always visible in chat header when in a 1:1 with another monetized user.
- Toast templates for "Gift sent", "Coins received", "Document uploaded".

---

## Technical notes (for the engineer)

- Reuse existing hooks: `useZivoWallet`, `useCustomerWallet`, `useGiftAnimationQueue`, `useChannel`, `useContacts`, `useMessageActions`, `usePrivacy`.
- Realtime: subscribe to `direct_messages` filtered by `message_type in ('gift','coin_transfer','document')` to fire animations / refresh balances.
- Coin debit must happen server-side only — never mutate balance from the client. Use a Postgres function `fn_transfer_coins(from, to, amount)` invoked by the edge function inside a transaction.
- OpenCV.js & react-pdf are heavy — lazy load only inside the Scanner/Document viewer routes to keep bundle small.
- Channels realtime: add `channel_posts` to `supabase_realtime` publication.
- Contacts hash matching: SHA-256 over E.164 phone, send only hashes to `contacts-match-hashes`.

## Files to create (high-level)

- `src/components/chat/ChatGiftPanel.tsx`, `ChatGiftAnimationLayer.tsx`, `CoinTransferBubble.tsx`, `DocumentBubble.tsx`, `FileBubble.tsx`, `ChatWalletSheet.tsx`, `SendMenu.tsx`
- `src/components/chat/scanner/ScannerCamera.tsx`, `ScannerEditor.tsx`, `ScannerExport.tsx`
- `src/pages/chat/ChatChannelsTab.tsx` (or extend Chat hub)
- `src/pages/chat/ContactsNearbyPage.tsx`, `ContactsBlockedPage.tsx`, `ContactsRequestsPage.tsx`
- `src/hooks/useChatGifts.ts`, `useCoinTransfer.ts`, `useDocumentScanner.ts`, `useChannelPosts.ts`, `useContactRequests.ts`
- `supabase/functions/chat-send-gift|chat-transfer-coins|channel-broadcast|generate-file-thumbnail|contacts-match-hashes/index.ts`
- One migration: tables, RLS, helper functions, realtime publication.

## Files to update

- `src/components/chat/ChatAttachMenu.tsx` → new SendMenu grid
- `src/components/chat/PersonalChat.tsx`, `GroupChat.tsx` → wire panels, animation layer, realtime gift/coin handlers
- `src/components/chat/GiftBubble.tsx` → animation replay + send-back
- `src/pages/Chat.tsx` (hub) → Channels tab + entries for Contacts requests/blocked/nearby
- `src/App.tsx` → new routes
- `src/hooks/useChannel.ts` → realtime + admin actions

## Out of scope (will propose separately if you want)

- End-to-end encryption for documents/coins (currently relies on RLS + TLS).
- Real ClamAV deployment (we add the hook only).
- Native iOS/Android share-extension for "Save to ZIVO".

---

This is a big plan — approve and I'll execute it in phased commits: (Phase A) DB + edge functions + gift panel & wallet sheet, (Phase B) scanner + document/file bubbles, (Phase C) channels tab + contacts workflow.
