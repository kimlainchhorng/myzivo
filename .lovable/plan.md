## Goal
Upgrade both **Tax & Payouts** and **Income & Revenue** to the same accountant-grade quality as the new Profit & Loss dashboard. Reuse existing tables (`ar_invoices`, `ar_invoice_payments`, `ar_payouts`, `ar_expenses`) — **no schema changes needed**.

---

## Part 1 — Tax & Payouts (full upgrade)

Replace the basic 3-stat card + flat payout list with a real tax management dashboard.

### Period bar
- Quarter selector (Q1–Q4) + year picker, plus presets: This Quarter, Last Quarter, YTD, Custom range.
- Export menu: CSV + Print/PDF.

### Tax KPI strip (6 cards)
1. Sales tax **collected** (paid invoices in period)
2. Sales tax **remitted** (payouts tagged "Tax Payment")
3. Sales tax **owed** (collected − remitted) — color-coded
4. Quarterly revenue (paid)
5. Estimated income tax — configurable rate (default 27%, editable, stored in localStorage)
6. Net after tax (revenue − est. tax)

### Quarterly filing tracker
Timeline component listing the 4 IRS estimated-tax due dates for the current year:
- Q1 → Apr 15, Q2 → Jun 15, Q3 → Sep 15, Q4 → Jan 15 (next year)
- Each row: status badge (Upcoming / Due Soon / Overdue / Paid), estimated amount due, "Mark as Paid" button (records a payout with source = "Tax Payment").

### Sales tax breakdown
Group paid invoices by tax rate (derived from `tax_cents / (total_cents − tax_cents)`) and show subtotal, tax, count per rate band.

### Upgraded payout history
- Source dropdown with categories: Bank Deposit, Stripe, Tax Payment, Owner Draw, Other.
- Inline edit of amount/source/reference/date.
- Search by reference, filter by source and date range.
- Receipt URL field (optional).
- CSV export of payouts in range.

### 1099-NEC prep list
Aggregate `ar_expenses` by vendor for the calendar year; flag any vendor paid > $600 as 1099-eligible. Export CSV with vendor, total paid, expense count.

### Files
- `src/components/admin/store/autorepair/finance/FinanceTaxPayoutsSection.tsx` — refactor to orchestrator (parallel `useQueries`).
- `src/lib/admin/taxCalculations.ts` — new (IRS due dates, sales tax math, quarter helpers, 1099 aggregation).
- `src/lib/admin/taxCsvExport.ts` — new.
- `src/components/admin/store/autorepair/finance/tax/` — new folder with:
  - `TaxPeriodBar.tsx`
  - `TaxKpiStrip.tsx`
  - `TaxQuarterlyTracker.tsx`
  - `TaxSalesBreakdown.tsx`
  - `TaxPayoutHistory.tsx`
  - `Tax1099Prep.tsx`

---

## Part 2 — Income & Revenue (full upgrade)

Replace the 4-stat + top-services list with a true revenue analytics view.

### Period bar
Today / 7d / 30d / 90d / This Month / Last Month / YTD / Custom + previous-period comparison toggle.

### KPI strip with sparklines (6 cards)
Revenue (paid), Billed, Outstanding, Avg ticket, Invoice count, Collection rate (paid ÷ billed %). Each shows delta vs previous period and a 14-point sparkline.

### Revenue trend chart (recharts)
Bar = daily/weekly revenue, Line = cumulative. Toggle Day/Week/Month grouping.

### Breakdown panels
- **Revenue by service** (top 10, horizontal bar) — click to drawer with the invoices that contributed.
- **Revenue by payment method** (donut) — pulled from `ar_invoice_payments.method`.
- **Top customers** (top 10 by paid revenue, with invoice count and last visit).
- **Revenue by technician** if `items[].technician_id` exists; otherwise hide gracefully.

### Recent invoices table
Search, status filter (paid/partial/sent/overdue), sort by total/date, click-through to invoice detail drawer.

### Export
CSV (invoices in range) + Print view.

### Files
- `src/components/admin/store/autorepair/finance/FinanceIncomeSection.tsx` — refactor to orchestrator.
- `src/lib/admin/incomeCalculations.ts` — new (period grouping, breakdowns, comparisons).
- `src/lib/admin/incomeCsvExport.ts` — new.
- `src/components/admin/store/autorepair/finance/income/` — new folder with:
  - `IncomePeriodBar.tsx`
  - `IncomeKpiStrip.tsx`
  - `IncomeTrendChart.tsx`
  - `IncomeServiceBreakdown.tsx`
  - `IncomeMethodDonut.tsx`
  - `IncomeTopCustomers.tsx`
  - `IncomeInvoiceTable.tsx`
  - `IncomeInvoiceDrawer.tsx`

---

## Shared technical notes
- Parallel data fetching with `useQueries` (current + previous period) — same pattern as P&L.
- All money in cents; reuse existing `fmt()` helper convention.
- All charts via `recharts` (already installed for P&L).
- Tax rate + estimated income tax % persisted in `localStorage` per store (`zivo:ar:tax-rate:{storeId}`).
- No DB migrations. No edge functions. No new dependencies.

---

## Out of scope (will offer after)
- Real PDF (jsPDF) instead of print
- Email-to-accountant edge function
- QuickBooks/Xero formatted exports
- Expenses & Bills upgrade (already 1,254 lines — needs separate planning pass)
