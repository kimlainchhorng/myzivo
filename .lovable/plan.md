
"Upgrade all in time" — interpreting as: roll out v2026 upgrades across all remaining high-traffic surfaces in one consolidated pass.

## Plan — v2026 Platform-Wide Upgrade Pass

### 1. Wallet & Payments
- Add `staleTime: 30s` + optimistic balance updates to `useWallet` hook
- New `wallet-summary` edge function: balance + recent txns + ZIVO+ tier in 1 call
- Cache headers (15s) for snappy repeat loads

### 2. Chat / Messaging
- Upgrade `useConversations` with `gcTime: 10min` + `refetchOnWindowFocus: false`
- Add Realtime channel for unread-count updates (replaces polling)
- Batch read-receipt writes (debounce 500ms)

### 3. Notifications
- Bump `useNotifications` to keep last-fetched data warm (staleTime 60s)
- Mark-as-read becomes optimistic (no spinner flash)
- New `notifications-summary` edge endpoint: unread count + latest 5 in 1 call

### 4. Reels / Feed
- Increase `useReels` page prefetch from 1 → 2 pages ahead
- Add `placeholderData: keepPreviousData` to avoid blank flashes on tab switch
- Memoize ranking score calc (avoid re-runs on every scroll)

### 5. Search / Discovery
- Add 10s in-memory dedup for identical queries
- `useSmartSearch` → `staleTime: 30s`

### 6. Shared infra
- Create `supabase/functions/_shared/cors.ts` (single source of truth)
- Bump remaining edge funcs to `@supabase/supabase-js@2.57.0`

### 7. DB hygiene
- Index `notifications(user_id, created_at DESC)` for fast inbox loads
- Index `messages(conversation_id, created_at DESC)` for chat scroll
- Index `wallet_transactions(user_id, created_at DESC)` for wallet history

### 8. Quiet fixes
- Resolve the `emrld.ltd` "Load failed" runtime error

### Verify
- curl new edge functions
- Check Network tab — fewer redundant requests

Approve and I'll roll out all 8 in one pass.
