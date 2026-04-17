
Modernize the Account page (`/account`) with v2026 upgrades — refresh UI density, add live data hooks, and harden the underlying API/Supabase layer.

## Plan

### 1. Account page UI v2026 refresh
- Tighter spacing, glassmorphic action chips, refined typography
- Replace static badges with live status pills (online/verified/ZIVO+ tier)
- Add quick-stats strip (followers · following · posts) pulled from Supabase
- Smarter "Add bio" inline editor with char counter

### 2. Account data hook upgrades (`useUserProfile`)
- Add `staleTime: 60s` + `gcTime: 5min` for faster repeat loads
- Parallelize profile + stats fetch with `Promise.all`
- Add optimistic updates on bio/avatar changes
- Add `refetchOnWindowFocus: false` to cut redundant calls

### 3. New `account-summary` edge function
- Single endpoint returning: profile + counts (posts/followers/following) + ZIVO+ tier + verification state
- 30s edge cache headers
- Reduces 4 client round-trips → 1

### 4. Supabase hygiene
- Add index on `profiles(user_id)` if missing
- Add index on `follows(follower_id)` and `follows(following_id)` for fast count queries

### 5. Verify
- curl `account-summary` to confirm payload shape
- Check Network tab — Account page should issue 1 request instead of 4

Approve and I'll roll this out.
