## Goal

Make the Auto Repair admin (left sidebar in your screenshot) feel organized and complete: re-group items so related tools sit together, fix the parts that don't actually save data, and add a brand new **Finance** section so you can see income, expenses, and profit.

---

## 1. Sidebar reorganization

Current sidebar mixes "Manage" and "Shop Ops" with no clear flow. New grouping (top to bottom):

```
MANAGE
  Profile
  Bookings
  Customers

FRONT DESK
  Estimates
  Invoices
  Vehicles
  Auto Check (VIN)

SHOP FLOOR
  Work Orders
  Inspections
  Technicians & Bays
  Reminders & Recalls

INVENTORY
  Part Shop
  Tire Inventory

CUSTOMER CARE
  Warranty & Comebacks
  Fleet Accounts

FINANCE   ← NEW
  Income & Revenue
  Expenses & Bills
  Payments Received
  Profit & Loss
  Tax & Payouts

INSIGHTS
  Reports & Analytics
  Marketing & Ads
  Live Stream

TEAM
  Employees / Payroll / Schedule / Time Clock / etc.

SYSTEM
  Settings / Software & Apps / Back to App / Sign Out
```

Wider sidebar labels so "Warranty & Comeb…" and similar no longer truncate.

---

## 2. Fixes for things that don't work

Found from auditing the code:

- **Invoices tab** — currently keeps invoices only in browser memory. Refresh = data gone. Will create a real `ar_invoices` table and wire create / list / status updates / delete to the database.
- **Estimates → Convert to Invoice** — today it creates a work order instead of an invoice. Will route conversion into the new `ar_invoices` table and mark the estimate as "converted".
- **Reports tab** — only counts work orders, ignores invoices and payments, so revenue is wrong. Will pull from invoices + payments for accurate numbers.
- **Send / Print buttons** on the invoice list — wire up to the existing PDF preview dialog instead of being no-ops.
- **Status badges** — standardize colors (Draft / Sent / Paid / Overdue / Void) across Estimates and Invoices so they match.
- **Sidebar deep-link reset** — already fixed last round; will verify the new Finance tab IDs are added to the allow-list so they don't bounce back to Profile.

---

## 3. New Finance section

Five sub-tabs under Finance:

**Income & Revenue**
- Today / This week / This month / Custom range
- Cards: Total Revenue, Paid Invoices, Outstanding (unpaid), Avg Ticket
- Top 5 services by revenue
- Mini chart: daily revenue last 30 days

**Expenses & Bills**
- Add expense (category, vendor, amount, date, receipt photo upload)
- Categories: Parts, Rent, Utilities, Supplies, Tools, Marketing, Insurance, Other
- List + filter by category/date
- Monthly total

**Payments Received**
- Auto-logged when an invoice is marked Paid
- Manual "Record Payment" for cash / check / card / ABA
- Filter by method, date, customer

**Profit & Loss**
- Income − Expenses − Payroll = Net Profit
- Month-over-month comparison
- Export to CSV / PDF

**Tax & Payouts**
- Sales tax collected (auto from invoices)
- Payout history (from existing Stripe/payment tables)
- Quarterly tax estimate

---

## 4. Database changes (migration)

New tables (all with `store_id`, RLS so only the store owner + admins can access):

- `ar_invoices` — number, customer info, vehicle info, line items (jsonb), subtotal, tax, total, status (draft/sent/paid/overdue/void), paid_at, due_at, estimate_id (link back), created_at
- `ar_invoice_payments` — invoice_id, amount_cents, method (cash/card/check/aba/other), reference, paid_at, notes
- `ar_expenses` — category, vendor, amount_cents, expense_date, receipt_url, notes
- `ar_payouts` — payout_date, amount_cents, source, reference (for tracking what was deposited to bank)

Each gets indexes on `store_id` + date columns for the Finance dashboards.

---

## 5. Files that will change

- `src/components/admin/StoreOwnerLayout.tsx` — new sidebar grouping + Finance items
- `src/lib/admin/storeTabRouting.ts` — add Finance tab IDs to the allow-list
- `src/pages/admin/AdminStoreEditPage.tsx` — render Finance sections, wire titles
- `src/components/admin/store/autorepair/AutoRepairInvoicesSection.tsx` — replace local state with Supabase persistence
- `src/components/admin/store/autorepair/AutoRepairEstimatesSection.tsx` — fix Convert-to-Invoice
- `src/components/admin/store/autorepair/AutoRepairReportsSection.tsx` — pull from invoices + payments
- New folder `src/components/admin/store/autorepair/finance/` with:
  - `FinanceIncomeSection.tsx`
  - `FinanceExpensesSection.tsx`
  - `FinancePaymentsSection.tsx`
  - `FinanceProfitLossSection.tsx`
  - `FinanceTaxPayoutsSection.tsx`
- One new Supabase migration creating the 4 tables above + RLS policies

---

## What you'll see after approval

1. Sidebar regroups instantly into MANAGE / FRONT DESK / SHOP FLOOR / INVENTORY / CUSTOMER CARE / **FINANCE** / INSIGHTS / TEAM / SYSTEM.
2. Invoices you create actually save and survive a refresh.
3. New "Finance" group with Income, Expenses, Payments, P&L, Tax & Payouts.
4. Reports show real revenue based on paid invoices.

Approve and I'll run the migration first, then ship the UI changes.