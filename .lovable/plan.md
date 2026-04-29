## Fix RLS for AutoRepair Estimates/Invoices/Payments

The Create Estimate → Save → Convert to Invoice → Record Payment flow is blocked by RLS policies that check ownership against the wrong table (`restaurants` instead of `store_profiles`).

### Step 1 — Apply migration

Run the already-prepared migration `supabase/migrations/20260429170000_fix_ar_estimates_invoices_rls.sql` which:

1. Drops the existing policies on `ar_estimates`, `ar_invoices`, `ar_invoice_items`, `ar_estimate_items`, and `ar_invoice_payments` that reference `restaurants`.
2. Recreates them to verify ownership via `store_profiles.owner_id = auth.uid()` for the `store_id` on the row.
3. Keeps admin override via `has_role(auth.uid(), 'admin')`.

### Step 2 — Verify the editor flow works end-to-end

After the migration is applied, manually test in `/admin/stores/.../?tab=ar-invoices`:

- Create Estimate → Save (insert path with non-UUID seed id, then update path with real UUID).
- Convert to Invoice (re-inserts seed estimate first if needed, then creates `ar_invoices` row linked via `estimate_id`, switches tab).
- Record Payment on the new invoice (insert into `ar_invoice_payments`, refresh balance).
- Send / Public View / PDF / Delete actions remain functional.

### Step 3 — Small follow-ups (only if issues surface during verify)

- If the public document view (`/d/:token`) fails due to RLS, add a permissive `SELECT` policy or RPC for rows accessed via a valid share token.
- If `ar_invoice_items` / `ar_estimate_items` inserts fail, add matching policies that join through their parent `invoice_id` / `estimate_id` to `store_profiles.owner_id`.

### Technical notes

Policy template used for each table:

```sql
CREATE POLICY "Store owners manage <table>"
ON public.<table> FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.store_profiles sp
  WHERE sp.id = <table>.store_id
    AND sp.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.store_profiles sp
  WHERE sp.id = <table>.store_id
    AND sp.owner_id = auth.uid()
));
```

For child item tables (`ar_invoice_items`, `ar_estimate_items`, `ar_invoice_payments`) the EXISTS clause joins through the parent doc's `store_id` to `store_profiles.owner_id`.

No frontend code changes are required for Step 1 — the existing `AutoRepairInvoicesSection.tsx` already handles UUID vs seed-id branching correctly.

Reply to approve and I'll apply the migration.