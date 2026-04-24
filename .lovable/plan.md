## Why `/more` still shows "klainkonkat" while `/profile` shows "ZIVO Platform"

### Root cause (verified against the live DB)

The `profiles` table does **not** have `display_name` or `username` columns. The actual name field is **`full_name`**. `/profile` already reads `profile.full_name` ("ZIVO Platform"), but `/more` queries non-existent `display_name` and `username` — so both return `undefined` and it falls back to the email prefix → "klainkonkat".

There's a second bug: `/more` looks up the row with `.eq("id", user.id)`, while the canonical hook (`useUserProfile`) uses `.or("user_id.eq.X,id.eq.X")`. Some rows are keyed by `user_id` only, so `/more` may not even find the right row.

### Fix `src/pages/MorePage.tsx`

1. **Use the shared `useUserProfile()` hook** (the same one `/profile` uses) instead of a hand-rolled query. This automatically gives `/more` the correct row (id-or-user_id match), the correct `full_name`, `avatar_url`, `is_verified`, and stays in sync with profile updates.
2. Compute `displayName = profile.full_name → email prefix → "User"` (no `display_name`, no `username`).
3. Drop the `username` line under the name (the column doesn't exist).
4. Drop the now-orphan `useQuery` profile block in `MorePage`.
5. Keep the verified blue checkmark, the Friends/Followers/Following trio, and the link to `/profile`.

### Account-flow audit (also done)

I checked all ~60 routes referenced by the More page sections (Essentials, Creator Studio, Travel & Orders, Social, Business, Account & Support) against `src/App.tsx` — **every route resolves to a real registered route**. No 404s, no missing destinations.

### Nice-to-have polish at the same time

- Cache the profile query under the same key as `/profile` (`userProfile`) so navigating between the two doesn't re-fetch.
- Hide the username `<p>` line entirely (no column → no value → no empty space).

### Out of scope

- Database schema changes — you don't need a `display_name` or `username` column; `full_name` is what the rest of the app already uses.
- `/profile` page — already correct.
- Link list / sections layout — already complete and all routes work.

### Files

- `src/pages/MorePage.tsx` — switch to `useUserProfile()`, fix display-name fallback, drop username row.
