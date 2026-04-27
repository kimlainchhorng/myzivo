## What's wrong

Your 4 villas are **safe in the database** (`VILLA`, `VILLA Class`, `VILLA A`, `VILLA Class A`, all `is_active=true`). Nothing was deleted.

The Rooms tab shows "No rooms yet" because Phase 13's security migration accidentally revoked `EXECUTE` permission on the helper functions used inside RLS policies. Result: every read/write to `lodge_rooms` (and any other table whose policy calls those helpers) fails with:

```
403 — permission denied for function is_lodge_store_owner
```

This is a one-line-class regression. Your data, photos, rates, and add-ons are all intact and will reappear the moment the grant is restored.

## Fix — one migration

Re-grant `EXECUTE` on the security-definer helpers to `authenticated` (and `anon` where the policy is public-readable). Because the functions are `SECURITY DEFINER`, this does NOT widen privileges — they still only return the boolean their internal logic computes; callers cannot read underlying tables directly.

```sql
-- Restore execute on RLS helper functions
GRANT EXECUTE ON FUNCTION public.is_lodge_store_owner(uuid)        TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_lodge_store_manager(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.safe_uuid(text)                   TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text)              TO authenticated, anon;
```

(Exact list will be derived by querying `pg_proc` for any helper referenced in lodge_*/store_* policies, so we don't miss one.)

## Verification after migration

1. Re-open `/admin/stores/7322b460-…?tab=lodge-rooms` — the 4 VILLA rooms should reappear with their photos, rates, and add-ons.
2. Confirm sibling tabs work: `lodge-rate-plans`, `lodge-calendar`, `lodge-housekeeping`, `documents`, `training`, `audit-log`.
3. Re-run Supabase linter to confirm no new warnings.

## Why this is safe

- `SECURITY DEFINER` functions run as their owner (postgres), so granting EXECUTE to `authenticated` only lets the client *call* the function — it cannot bypass the function's internal checks.
- The original Phase 13 intent (preventing arbitrary callers from probing internals) is preserved by `search_path` pinning and the function bodies themselves; the blanket REVOKE was overly aggressive.
- No data migration, no schema change, no frontend change required.

## Files touched

- `supabase/migrations/<timestamp>_restore_rls_helper_grants.sql` (new, ~15 lines)

That's it. Approve to apply and your villas come back immediately.