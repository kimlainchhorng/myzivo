Do I know what the issue is? Yes.

The last fix left two database-policy problems:

1. The receipt storage policy still uses the wrong `name` field. In the saved policy, `storage.foldername(name)` is resolving to `store_profiles.name` / `restaurants.name`, not the uploaded file path on `storage.objects.name`. So an upload path like:

```text
a914b90d-c249-4794-ba5e-3fdac0deed44/receipt.jpg
```

is not being matched correctly, which blocks Scan invoice.

2. The expense policies still reference `restaurants`, but `authenticated` currently has no `SELECT` privilege on `restaurants`. Because the RLS policy checks that table, manual Add expense can still fail even though the store is correctly in `store_profiles`.

Plan to fix it:

1. Apply a new Supabase migration that:
   - Drops and recreates `ar_expenses` policies using only `store_profiles.owner_id = auth.uid()` plus admin access.
   - Drops and recreates `ar_expense_items` policies through `ar_expenses -> store_profiles` only.
   - Drops and recreates `ar-receipts` storage policies using the fully qualified file path: `storage.objects.name`.
   - Adds explicit `WITH CHECK` rules for insert/update so uploads and saves are validated correctly.
   - Keeps admin access via `has_role(auth.uid(), 'admin')`.
   - Grants the needed table/function privileges to `authenticated`.
   - Sends `NOTIFY pgrst, 'reload schema'` so Supabase/PostgREST refreshes its API cache after these policy changes.

2. Update the finance UI error handling so if anything still fails, the toast shows whether it failed at:
   - receipt upload,
   - invoice scan AI function,
   - expense row insert,
   - line item insert.

3. Validate after approval:
   - Manual Add expense saves a row in `ar_expenses`.
   - Scan invoice uploads to `ar-receipts`, calls `scan-invoice`, opens the review form, and saves line items.
   - The page refreshes totals instead of showing `database error, code: 08P01`.

After you approve, I’ll apply the migration and code change directly.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
  <lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>