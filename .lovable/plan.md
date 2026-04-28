I found the likely cause of the scan/save error.

The Expenses & Bills page is using `store_profiles.id` as the store ID, but the new `ar_expenses`, `ar_expense_items`, and `ar-receipts` RLS policies check ownership against the older `restaurants` table. Your auto repair store exists in `store_profiles` (`AB Complete Car Care`), so the RLS ownership check fails when the app uploads/scans/saves. The storage receipt policies also have a bug where they check `storage.foldername(r.name)` instead of the uploaded object path.

Plan to fix it:

1. Update database RLS policies for auto-repair finance
   - Replace the owner checks on `ar_expenses` so they validate against `public.store_profiles.owner_id` using `ar_expenses.store_id`.
   - Replace the owner checks on `ar_expense_items` so they validate through `ar_expenses -> store_profiles`.
   - Keep admin access through `has_role(auth.uid(), 'admin')`.

2. Fix scanned receipt storage policies
   - Update `ar_receipts_select`, `ar_receipts_insert`, `ar_receipts_update`, and `ar_receipts_delete` to compare the first folder in the object path to `store_profiles.id`.
   - Correct the current broken expression from checking `storage.foldername(r.name)` to checking `storage.foldername(name)`.
   - This allows uploads to paths like:

```text
{storeId}/{timestamp}.jpg
```

3. Improve the app error message
   - In `FinanceExpensesSection.tsx`, make scan/upload/save errors more specific instead of showing only `database error, code: 08P01`.
   - If storage upload fails, show a receipt upload permission message.
   - If save fails due to RLS/permission, show a clear message like “You do not have permission to save expenses for this store.”

4. Validation after implementation
   - Re-check the active RLS policies in Supabase.
   - Verify the user/store ownership path matches `store_profiles.owner_id`.
   - Deploy the migration and retest the scan flow so the invoice can upload, parse, open the review dialog, and save line items.