# Restore your profile (fix stuck-loading spinner)

## What happened

Your data is **safe and intact** — the database still has:
- ZIVO Platform name
- Blue verified badge
- Brand name = ZIVO
- Avatar + cover photo

The problem is a **permissions bug** introduced when we tightened security on the `profiles` table earlier today.

## Root cause (technical)

The earlier security migration (`20260426215638`) replaced wide-open SELECT access on `profiles` with a strict, **column-by-column** GRANT list. Every column the app reads must be explicitly listed.

Then a later migration added a new column — `display_brand_name` (the "ZIVO" override) — but **forgot to grant SELECT on it** to the `authenticated` role.

Confirmed via Postgres:
```
has_column_privilege('authenticated', 'profiles', 'display_brand_name', 'SELECT') = false
has_column_privilege('authenticated', 'profiles', 'full_name',          'SELECT') = true
```

So when the Profile page runs `SELECT *` on `profiles`, Postgres rejects it with "permission denied for column display_brand_name". The query throws, `profile` stays `null`, and the page is stuck on the green spinner. The bottom-nav Account tab falls back to your email's first letter, which is why it shows "K" instead of the ZIVO logo.

## Fix

### 1. Database migration — grant the missing column
```sql
GRANT SELECT (display_brand_name) ON public.profiles TO authenticated;
```

### 2. Future-proof the GRANT list
Add a defensive migration that auto-grants SELECT on **all current columns** of `profiles` to `authenticated` (the row-level RLS policy still restricts which rows are returned — column GRANTs only control which fields are visible). This prevents the same bug the next time we add a column.

```sql
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ')
    INTO cols
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='profiles';
  EXECUTE format('GRANT SELECT (%s) ON public.profiles TO authenticated', cols);
END$$;
```

Sensitive fields (email, phone, kyc, payout, etc.) remain protected by the existing RLS row policy — only the row owner can SELECT their own row, so non-owners still cannot read those values for other users.

### 3. Make the client query resilient
In `src/hooks/useUserProfile.ts`, replace `.select("*")` with an explicit list of columns the Profile page actually needs. This way, if a future column is added without a GRANT, only that column is missing — the rest of the profile still loads. Add a small `console.error` if the query fails, so we see this immediately next time instead of an infinite spinner.

### 4. Verify after deploy
- Reload `/account` → should show "ZIVO Platform" + blue badge + cover photo + avatar.
- Bottom nav Account tab → should show ZIVO logo, not "K".
- No regression on other users' profile views.

## Files changed

- `supabase/migrations/<new-timestamp>_fix_profiles_column_grants.sql` — adds the missing GRANT and the defensive auto-grant block
- `src/hooks/useUserProfile.ts` — replace `select("*")` with explicit columns + error logging

## Not changed

- No data is modified. Your profile row is untouched.
- No RLS policy is loosened. Row-level access stays the same; only column-level visibility is restored to what it was before today.
