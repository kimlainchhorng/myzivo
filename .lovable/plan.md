# Phase 4 Track B — End-to-End Encrypted Secret Chats

This is the final piece of Phase 4. After this, ZIVO chat will support a true Signal-style "Secret Chat" mode in addition to the regular `direct_messages` chats already shipped.

## What you'll see

- A new entry on every contact: **"Start Secret Chat"**.
- Inside a Secret Chat:
  - A purple "lock" header showing "End-to-end encrypted".
  - Messages are server-blind: even ZIVO support cannot read them.
  - Optional **disappearing-messages** timer (1 min / 1 h / 1 day) chosen at chat creation.
  - **Verify Safety Number** screen — compare a 60-digit code with your contact (in person or by voice) to confirm there is no man-in-the-middle.
  - "Reset encryption keys" option that wipes local keys and forces a fresh handshake.
- Secret chats live alongside normal chats but are clearly marked with a lock icon and a different (subtle indigo) bubble theme.

## Security model

- **Identity keypair** per device: ECDH P-256 generated in WebCrypto, **non-extractable** private key, stored in IndexedDB. Public key is published to `device_keys` so others can encrypt to you.
- **Message key**: ECDH shared secret → HKDF-SHA-256 (salted with chat-id) → AES-GCM 256-bit per message, fresh 12-byte random IV.
- Server stores only `iv + ciphertext + sender public key`. RLS allows only the two participants to read or write.
- **Safety Number (SAS)** = SHA-256 of both public keys, formatted as 12 groups of 5 digits.

## Technical Section

### Database (one migration)

Three new tables, all RLS-locked:

```text
device_keys
  user_id, device_fingerprint, public_key_jwk, created_at
  - SELECT: any authenticated user (needed to encrypt to them)
  - INSERT/UPDATE/DELETE: only owner

secret_chats
  user_a, user_b (ordered, distinct, unique pair), created_by, ttl_seconds
  - all ops gated to participants

secret_messages
  chat_id, sender_id, sender_public_key_jwk, iv, ciphertext, expires_at
  - SELECT/INSERT gated via is_secret_chat_participant() SECURITY DEFINER fn
  - Sender can DELETE own row
  - Added to supabase_realtime publication
```

No edge functions required — all encryption happens client-side; the server just persists ciphertext.

### Client code

- `src/lib/secretChat/crypto.ts` — WebCrypto helpers:
  - `getOrCreateIdentity()` (IndexedDB-backed, non-extractable private key)
  - `encryptMessage({ plaintext, chatId, recipientPublicKeyJwk })` → `{ iv, ciphertext, senderPublicKeyJwk }`
  - `decryptMessage({ payload, chatId })` → plaintext
  - `computeSafetyNumber({ jwkA, jwkB })` → 60-digit SAS string
  - `resetIdentity()` — wipes local keys

- `src/hooks/useSecretChat.ts` — wraps:
  - publishing the local public key to `device_keys` on first use
  - fetching/creating the `secret_chats` row for a given partner
  - subscribing to `secret_messages` realtime, decrypting on receive
  - sending: encrypt → insert into `secret_messages`
  - applying disappearing-message TTL (`expires_at`) and pruning

- `src/components/chat/SecretChatHeader.tsx` — lock badge + verify button
- `src/components/chat/SecretChatPage.tsx` — full chat UI (reuses bubble/composer styling, but locked-down: no media/locked-media/voice in v1)
- `src/components/chat/SafetyNumberSheet.tsx` — shows the SAS code + "Mark verified" toggle

- New routes in `src/App.tsx`:
  - `/chat/secret/:partnerId`
- Entry point: add **"Start Secret Chat"** button in `ChatContactInfo.tsx` (and a long-press option on the contact list later).

### Out of scope (v1)

- Media/voice/file attachments inside secret chats (text only — encrypting blobs requires a separate ciphertext-storage pipeline; can ship in a follow-up)
- Multi-device key sync (each device has its own keypair; messages encrypted to one device's public key are only readable on that device — same as Signal's secret chats)
- Group secret chats

### Build order

1. Run the SQL migration (3 tables + helper fn).
2. Add `crypto.ts` + `useSecretChat.ts`.
3. Build `SecretChatPage` + `SafetyNumberSheet`.
4. Wire route + "Start Secret Chat" entry in `ChatContactInfo`.
5. Smoke-test: open between two accounts in two browsers, verify SAS matches, send a message, confirm DB row contains only base64 ciphertext.