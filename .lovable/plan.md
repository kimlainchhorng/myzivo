
The user keeps seeing "Couldn't start" on the QR dialog. The RPC `create_live_pair_session` was patched but still fails. I need to investigate why.

Likely causes:
1. The `live_pair_sessions` table may be missing the `created_by` column (original migration may not have included it).
2. RLS policy may block the INSERT even though function is SECURITY DEFINER (unlikely if SD).
3. Schema cache still stale.

I should check the actual table schema and recent error logs before patching again.

## Plan

1. Inspect the `live_pair_sessions` table schema to confirm column names match the INSERT statement (`id`, `token`, `store_id`, `created_by`, `status`, `expires_at`).
2. Check Postgres logs / test the RPC via curl with a real auth token to capture the exact error message.
3. Based on findings, write a corrective migration:
   - Add any missing columns (e.g., `created_by uuid`)
   - OR adjust the function to match actual columns
4. Refresh PostgREST schema cache (`NOTIFY pgrst, 'reload schema'`).
5. Re-test in browser as `kimlain@hizivo.com` → open store → Live Stream → "Continue on Phone" → confirm QR renders.

## Technical details

- Function is `SECURITY DEFINER` so RLS won't block inserts done by it.
- If `created_by` column doesn't exist, INSERT raises "column does not exist" → caught by frontend as generic "Couldn't start".
- Fix: either ALTER TABLE to add `created_by uuid REFERENCES auth.users(id)`, or remove it from the INSERT.
- Will keep `created_by` for audit purposes and add the column if missing.
