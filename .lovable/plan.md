## Root cause

The Phase 1 security migration revoked `SELECT` on `public.profiles` from `anon`/`authenticated` and re-granted only a subset of columns. But several frontend hooks still query columns that were **not** re-granted (or use `select("*")`), and PostgREST denies the entire query the moment it touches a column you don't have `SELECT` on.

That is why `/profile` shows an infinite spinner and "a lot more is broken" — anything depending on `useUserProfile` (the most-used profile hook in the app) silently fails.

## Specific breakages identified

1. **`src/hooks/useUserProfile.ts`** — `select("*")` on `profiles` → fails because PII columns (email, phone, etc.) are no longer readable.
   - This is the hook used by Profile, Account, Settings, edit flows, and many more pages.
2. **`src/hooks/useAffiliateAttribution.ts`** — selects `affiliate_code`, `affiliate_captured_at` → both columns were **omitted** from the GRANT list. Affiliate attribution silently broken.
3. **PII-dependent admin/account pages** — anything that previously read `email`, `phone`, `date_of_birth`, KYC fields directly from the table now needs the RPC path.

The good news: all the *public* profile queries the feed/reels/chat already use safe column lists (`id, user_id, full_name, username, avatar_url, is_verified`, etc.) which **are** in the GRANT, so those keep working. The fix is targeted.

## Fix plan

### 1. Restore `useUserProfile` via the secure RPC (primary fix)
Replace the `select("*")` query with a call to the `get_my_profile()` RPC that the migration already created. This RPC runs as `SECURITY DEFINER` and returns the full row only to the owner — exactly what we want, and it's the pattern already used in `AccountExportPage.tsx`.

```ts
// useUserProfile.ts
const { data, error } = await supabase.rpc("get_my_profile").single();
```

This single change unblocks `/profile`, `/account`, settings, and every screen that consumes `useUserProfile`.

### 2. Re-grant truly non-sensitive columns that the app legitimately needs
Add a tiny follow-up migration that grants `SELECT` on the columns we omitted by mistake but that aren't actually PII:

- `affiliate_code`, `affiliate_captured_at` (already grants `affiliate_partner_name` — these belong with it)
- Anything else flagged during step 3's audit

Sensitive columns stay revoked: `email`, `phone`, `date_of_birth`, KYC fields, password-related, `affiliate_code` only if you consider it sensitive (we'll keep it owner-only and read via a small dedicated RPC instead — safer).

Decision: read affiliate attribution via a new `get_my_affiliate_attribution()` RPC rather than re-granting, since affiliate codes can identify referral chains.

### 3. Audit pass for any other broken column reads
Run a sweep across the codebase looking for `from("profiles").select(...)` calls that reference columns outside the GRANT list, and convert each to either:
- A safe column subset (if it's a public query), or
- The `get_my_profile()` RPC (if it's the owner reading themselves), or
- A new narrow RPC (if it's a specific narrow PII need).

Known files to verify in this pass:
- `useAffiliateAttribution.ts` → switch to RPC
- Any admin-only PII reads (`AdminFlightPriceAlerts` already migrated; verify others)
- Edge cases in chat/notifications hooks

### 4. Add a regression guard
Add a small dev-time console warning in `useUserProfile` so the next time a column-grant breaks profile loading, the error appears immediately in the console (already partially in place — keep it).

## What stays the same

- The PII protection model (column-level GRANT + owner RPC) — this is the correct, secure pattern. We're not rolling back security.
- `get_my_profile()`, `admin_get_profile()`, `get_cv_by_share_code()` RPCs all stay.
- HTTP security headers, audit log, CSP report-only — untouched.

## What you'll see after the fix

- `/profile` loads instantly with full data (name, bio, social links, settings).
- Affiliate attribution works again.
- All public profile cards/feeds keep working (they already used safe columns).
- Security posture is unchanged — PII still protected by column grants + owner-RPC pattern.

## Files touched

- `src/hooks/useUserProfile.ts` — switch to `get_my_profile()` RPC
- `src/hooks/useAffiliateAttribution.ts` — switch to new narrow RPC
- New migration — adds `get_my_affiliate_attribution()` RPC
- Sweep of any other `profiles.select(...)` callers found during audit (small edits)

Approve and I'll implement in this order: RPC migration → `useUserProfile` fix → `useAffiliateAttribution` fix → audit sweep.