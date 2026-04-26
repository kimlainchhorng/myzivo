## Phase 4 — Multi-Device + Secret Chats + Group Upgrades

This phase is large. I'll deliver it in **three focused tracks**, each independently usable. This plan covers all three; the implementation phase will build them in order so you can review/test between tracks.

---

### Track A — Multi-Device QR Login (link phone ↔ desktop)

**What you get:** From a logged-in device, generate a QR code. Scan it on any other browser/phone to log that device in *without* re-entering the password. Manage all linked devices from Settings → Active Sessions.

**DB (1 new table):**
- `device_link_tokens` — `id`, `code` (short uuid), `qr_secret` (random), `issuing_user_id`, `claimed_by_device_id`, `claimed_at`, `expires_at` (now + 5 min), `status` (pending/claimed/used/expired)

**Edge functions:**
- `device-link-issue` — authed; creates a token row, returns `{ code, qr_secret, expires_at }`
- `device-link-claim` — anonymous; takes `{ code, qr_secret, device_label, device_fingerprint }`, marks token claimed, returns a one-time exchange code
- `device-link-exchange` — anonymous; takes the exchange code, calls `auth.admin.generateLink('magiclink')` for the issuing user, returns the magic-link token so the new device signs in

**UI:**
- `src/pages/chat/settings/LinkDevicePage.tsx` — shows a QR (using `qrcode.react`), polls status every 2s, success toast when claimed
- `src/pages/auth/ScanToLoginPage.tsx` — opens camera (using existing capacitor camera or web `BarcodeDetector` with manual paste fallback), reads QR, calls claim → exchange → `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`
- Extend the existing `ActiveSessionsPage` with a **"Link a device"** button + clearer "this device" badge

---

### Track B — Secret Chats (E2E encrypted 1-on-1)

**Approach:** Pragmatic E2E using **WebCrypto + ECDH (P-256) + AES-GCM** with sealed-sender server storage. Not full libsignal Double Ratchet (that's months of work), but server cannot read messages. Forward secrecy via per-conversation key rotation every N messages.

**DB (3 new tables):**
- `device_keys` — `user_id`, `device_id`, `public_key_jwk` (jsonb), `created_at` (private key stays in client IndexedDB only)
- `secret_chats` — `id`, `user_a`, `user_b`, `created_at`, `ttl_seconds` (default 86400), `verification_sas` (Short Auth String for safety-number compare)
- `secret_messages` — `id`, `chat_id`, `sender_id`, `ciphertext` (text), `iv` (text), `ephemeral_pubkey` (jsonb), `created_at`, `expires_at`, `delivered_at`

**Client crypto helper (`src/lib/crypto/e2e.ts`):**
- Generate + persist device keypair in IndexedDB on first use
- Publish public key to `device_keys` on login
- Encrypt: ECDH(my_eph, their_pub) → derive AES-GCM key → encrypt → store `{ ciphertext, iv, eph_pub }`
- Decrypt: ECDH(my_static, eph_pub) → derive → decrypt

**UI:**
- New "Start Secret Chat" entry in chat header menu → opens `SecretChatPage.tsx` (full-screen with lock-icon header + dark theme)
- Reuses existing chat bubble layout but messages go through `secret_messages` and `e2e.encrypt/decrypt`
- "Verify safety number" sheet showing the SAS for both users to compare

---

### Track C — Group Chat Upgrades

**What you get:** Roles, invite links, polls in chat.

**DB (3 changes):**
- `chat_group_members`: add `role` (enum: `owner`/`admin`/`member`), `nickname`, `muted_until`
- `chat_group_invites` (new) — `id`, `group_id`, `code` (short slug), `created_by`, `expires_at`, `max_uses`, `use_count`, `revoked_at`
- `chat_polls` already exists — add a `group_id` column (currently has only `chat_partner_id` for 1-on-1) so polls work in groups

**RLS / security-definer:**
- `is_group_admin(_uid, _group_id)` returns boolean — used in RLS for promote/kick/edit-group-meta

**UI:**
- `GroupChat.tsx` admin tools: kick member, promote/demote (admins only), edit group name/avatar (admins only)
- `GroupInviteSheet.tsx` — generate/copy/revoke invite links (deep link `/chat/join/:code`)
- `JoinGroupPage.tsx` route — validates invite, joins user, redirects to group
- Extend existing `ChatPollBubble.tsx` to render group polls; add "Create Poll" entry in `ChatAttachMenu` for groups

---

### Build order

1. **Track C** first (smallest, all-additive, no external libs) — gives groups parity with 1-on-1 quickly
2. **Track A** next (medium, needs camera/QR libs)
3. **Track B** last (largest, needs careful crypto handling + IndexedDB key storage)

Each track ends with you able to test it independently. After Track C you can say "next" to go to Track A, etc. — or stop at any point.

### Out of scope (intentionally)

- Full libsignal Double Ratchet protocol (would take weeks; current scheme already gives server-blind E2E)
- Backwards-compatible re-encryption of existing message history
- Video/voice in secret chats (text + media only first; calls in a later phase)
- Apple/Google sign-in for new linked devices (uses email magic-link exchange)

### Acceptance check (per track)

- **C:** Owner of a group can kick someone, promote a member to admin, generate an invite link, and a second account can join via that link. Polls created in a group show up in chat and accept votes.
- **A:** From desktop you scan the QR shown on phone → desktop is signed into the same account; both devices appear in Active Sessions.
- **B:** Open a secret chat with another user; both see the same SAS; messages decrypt locally; rows in `secret_messages` show only ciphertext (verifiable in Supabase SQL editor).
