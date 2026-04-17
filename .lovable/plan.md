
The user wants two things based on the screenshot showing "Sign in to go live" on the phone:

1. **Allow going live WITHOUT signing in on phone** — pairing token alone should authorize the phone to broadcast as the paired store. Currently `/go-live` requires real auth.
2. **Show the store's profile photo on the Go Live screen** (the paired identity avatar) so streamer sees which shop they're broadcasting as.

## Investigation needed

I need to look at:
- `/go-live` route component (the page in the screenshot)
- How auth gate is enforced there
- `livePairing.ts` already saves `PairedIdentity` to localStorage with store_id/name/avatar
- Backend: stream creation likely requires `auth.uid()` — need an edge function that accepts a pairing session token and creates/authorizes a stream on behalf of the store owner

## Plan

### 1. Frontend — `/go-live` page
- Read `getPairedIdentity()` from localStorage on mount
- If a paired identity exists AND no auth user → treat as "paired session" mode
- Replace "Sign in to go live" button with "Go Live as [Store Name]" using paired identity
- Show the store avatar + name prominently at the top (header area, replacing/augmenting "Go Live" title)
- Add a small "Paired device" badge + "Unpair" link

### 2. Backend — pairing-authenticated streaming
- New edge function `pair-go-live` (public, no JWT required):
  - Accepts `{ pair_token, action: 'start'|'heartbeat'|'end', stream_payload }`
  - Validates token against `live_pair_sessions` (must be `confirmed`, not expired)
  - Looks up `store_owner_id`
  - Performs the stream action server-side using service role on behalf of that owner
- New RPC `get_paired_session_by_token(p_token)` — returns store_id, store_owner_id, store_name, avatar if status='confirmed' (used by phone to re-validate identity on load)
- Extend `confirm_live_pair_session` to also return a long-lived `device_token` (or reuse the pair token) phone stores in localStorage for ongoing API calls

### 3. Frontend wiring on `/go-live`
- On mount: if `PairedIdentity` exists, call `get_paired_session_by_token` to confirm it's still valid; if expired/cancelled, clear localStorage and show normal sign-in
- Stream start/stop/heartbeat → call `pair-go-live` edge function with stored pair token instead of direct supabase inserts
- Display: avatar (h-10 w-10 rounded-full) + store name + "Paired" badge in the top bar

### 4. Security guardrails
- Pair token only authorizes: starting/ending live streams + posting chat as that store
- Pair token does NOT authorize: profile edits, payments, wallet, DMs to other users
- Pair sessions expire (already 10 min for pairing handshake — extend confirmed sessions to 24h for streaming use)
- Add `revoked_at` field; desktop "Unpair" calls a revoke RPC

## Technical details

- Files to edit: `src/pages/GoLive.tsx` (or wherever the screenshot screen lives — need to locate), `src/lib/livePairing.ts` (add token persistence + API helpers)
- New edge function: `supabase/functions/pair-go-live/index.ts` (verify_jwt = false)
- New migration: extend `live_pair_sessions` (add `revoked_at`, lengthen expiry on confirm), add `get_paired_session_by_token` RPC, add `revoke_live_pair_session` RPC
- Avatar: use existing `optimizeAvatar` util for the header thumbnail
