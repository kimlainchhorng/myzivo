## Chat Mega Upgrade — Phase B & C

Continuing from Phase A (gifting + wallet + DB). Now wiring the document scanner, file bubbles, channels surface in chat, and a real contacts workflow.

---

### Phase B — Scanner → PDF & File Upgrades

**Goal:** Camera/photo → auto-cropped A4 PDF, plus richer file/document message bubbles.

1. **DocumentScanner component** (`src/components/chat/DocumentScanner.tsx`)
   - Full-screen sheet with camera capture (Capacitor Camera on native, `<input capture>` on web).
   - Multi-page capture (add page, reorder, delete).
   - Edge detection + perspective correction using **OpenCV.js** (lazy-loaded from CDN to keep bundle small).
   - Filter modes: Auto, Color, Grayscale, B&W (high-contrast scan look).
   - Page size selector: A4 (default), Letter, Original.
   - "Save as PDF" → builds A4 PDF via **jsPDF**, uploads to `chat-files` bucket, sends as `file` message.

2. **FileBubble component** (`src/components/chat/FileBubble.tsx`)
   - Renders any non-image/video file message: icon by mime type, filename, size, page count (PDFs).
   - Tap → preview sheet (PDF.js inline viewer for PDFs, native open for others).
   - Download button + share-to-other-chat.

3. **DocumentBubble component** (`src/components/chat/DocumentBubble.tsx`)
   - Specialized variant for scanner output: shows first-page thumbnail + "X pages · A4 · PDF".

4. **Wire scanner into ChatAttachMenu**
   - Replace the "coming soon" toast with `onScanDocument` opening `DocumentScanner` in `PersonalChat` and `GroupChat`.

5. **`useChatFiles` hook** (`src/hooks/useChatFiles.ts`)
   - Helpers to upload to `chat-files` bucket (already created in Phase A), insert `chat_files` row, and emit a `file` message.
   - Generate first-page thumbnail (PDF.js → canvas → upload).

6. **Renderer routing**
   - In `MessageBubble` (or wherever message types are dispatched), route `message_type='file'` → `FileBubble`, and detect scanner-origin (metadata flag) → `DocumentBubble`.

---

### Phase C — Channels in Chat & Real Contacts Workflow

**Goal:** Surface Channels inside the unified Chat Hub and add a proper contacts flow with requests, sync, and nearby.

1. **Channels tab in Chat Hub** (`src/pages/chat/ChatHub.tsx` or equivalent)
   - Add a "Channels" segment alongside Chats/Groups.
   - Lists subscribed channels (via `useChannel` / new `useMyChannels`) with latest post preview, unread dot, and verified badge.
   - "Discover" button → existing `/channels` directory.
   - Tap channel → opens `ChannelPage` inside the chat panel (desktop) or full route (mobile).

2. **Channel quick-broadcast composer** (owners/admins only)
   - Add a compact composer at the top of `ChannelPage` for owners: text + image + schedule.
   - New edge function `channel-broadcast` that inserts a post and fans out a notification to all subscribers (uses existing `device_tokens`).

3. **Contact requests workflow**
   - **DB:** new `contact_requests` table (`from_user_id`, `to_user_id`, `status: pending|accepted|declined`, `message`, timestamps) with RLS (only sender/recipient can read; only recipient can update).
   - Update `useContacts.add()`: if target user has "require approval" privacy on, create a `contact_request` instead of direct insert.
   - New `ContactRequestsPage` (`/chat/contacts/requests`) — incoming + outgoing tabs, accept/decline.
   - Notification badge on Contacts tab when pending requests exist.

4. **Phone-book contact sync (native)**
   - Use `@capacitor-community/contacts` for permission + read.
   - Hash phone numbers client-side (SHA-256, lowercased E.164) and POST to new `contact-match` edge function.
   - Edge function compares against hashed `profiles.phone_hash` (new column, indexed) and returns matched user_ids.
   - "Find Contacts on ZIVO" screen lists matches with one-tap add.

5. **People Nearby**
   - DB: `nearby_presence` (`user_id`, `geohash`, `lat`, `lng`, `expires_at`, `is_visible`) — RLS so only same-geohash users can read, expires after 30 min.
   - New `NearbyChatPage` reusing geohash queries: shows users within ~1 km who opted in.
   - Opt-in toggle in Chat Privacy Hub (default off); broadcasts current location every 60s while screen is open.

---

### Backend Summary (new this round)

**Tables**
- `contact_requests`
- `nearby_presence`
- `profiles.phone_hash` (column add, indexed)

**Edge Functions**
- `channel-broadcast` — atomic post + push fan-out
- `contact-match` — hashed phone matching
- `generate-file-thumbnail` — server-side PDF first-page render fallback (when client render fails)

**Storage**
- Reuse `chat-files` bucket from Phase A for scans/files.
- New public-read `channel-media` bucket for channel post images.

---

### Order of Execution
1. Phase B: scanner + file bubbles (high user-visible value).
2. Phase C-1: Channels tab in chat hub.
3. Phase C-2: Contact requests + privacy gating.
4. Phase C-3: Phone sync + Nearby (optional final pass).

Approve to proceed.
