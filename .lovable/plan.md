## Goal

Turn `FinanceProfitLossSection.tsx` from a basic 3-card summary into a full, professional Profit & Loss dashboard — matching what owners expect from QuickBooks / Shop-Ware level reporting.

Currently the page only shows: From/To dates, CSV button, Income/Expenses/Net cards, and a single category breakdown. We will keep it lightweight but add the missing critical sections.

---

## What gets added

### 1. Smart date controls (top bar)
Replace the bare From/To inputs with:
- Quick presets: **Today, This Week, MTD, Last Month, QTD, YTD, Last 12 Months, Custom**
- A **Compare to** toggle: Previous period / Previous year / None
- Group-by selector: **Day / Week / Month**
- Export menu: **CSV, PDF (printable P&L statement), Email to accountant**

### 2. KPI strip (6 cards instead of 3)
- Revenue (paid)
- Invoiced (billed but not yet paid) — pulled from `ar_invoices.total_cents` minus `amount_paid_cents`
- COGS / Parts cost — `ar_expenses` where category in (parts, supplies)
- Gross Profit + Gross Margin %
- Operating Expenses (rent, utilities, payroll, marketing, other)
- **Net Profit + Net Margin %**

Each card shows: value, sparkline, vs-previous-period delta with arrow + colored %.

### 3. Revenue & Expense trend chart
Stacked bar / line chart (Recharts) over the selected range, grouped by Day/Week/Month:
- Bars: Revenue vs Expenses
- Line overlay: Net Profit
- Hover tooltip with full breakdown

### 4. Income breakdown (new card)
- By **payment method** (cash, card, ABA, check, other) — from `ar_invoice_payments.method`
- By **service category** — derived from `ar_invoices.items` jsonb (top services)
- By **technician** — top earners (joins `ar_work_orders` if available)

### 5. Expense breakdown — upgraded
Keep the existing horizontal bars but add:
- Toggle: **By Category** / **By Vendor** / **By Payment Method**
- Each row clickable → opens a drawer listing the underlying expense rows (date, vendor, amount, receipt link)
- Show top 5 vendors with logos / initials

### 6. Cash flow mini-section
- **Cash in** (payments received)
- **Cash out** (expenses paid + payouts from `ar_payouts`)
- **Net cash** for the period
- Running balance line chart

### 7. Accounts Receivable (AR) panel
Pulled from `ar_invoices` where `status != 'paid'`:
- Total outstanding $
- Aging buckets: Current, 1–30, 31–60, 61–90, 90+ days
- Top 5 unpaid customers with "Send reminder" button (links to existing invoice page)

### 8. Tax estimate strip
- Sales tax collected (sum of `ar_invoices.tax_cents` paid in period)
- Estimated income tax owed (configurable rate, default 15%) on Net Profit
- Quick link to **Tax & Payouts** sub-tab

### 9. P&L statement view (toggle)
A second view mode "**Statement**" that renders an accountant-style printable P&L:

```text
Revenue
  Service revenue ............ $X,XXX
  Parts revenue .............. $X,XXX
  Total Revenue .............. $X,XXX

Cost of Goods Sold
  Parts ...................... ($XXX)
  Supplies ................... ($XXX)
  Gross Profit ............... $X,XXX  (XX.X%)

Operating Expenses
  Rent ....................... ($XXX)
  Payroll .................... ($XXX)
  Utilities .................. ($XXX)
  Marketing .................. ($XXX)
  Other ...................... ($XXX)
  Total OpEx ................. ($X,XXX)

Net Operating Income ......... $X,XXX
Taxes (est.) ................. ($XXX)
─────────────────────────────────────
NET PROFIT ................... $X,XXX  (XX.X%)
```

Print-friendly layout, includes store name + period header.

### 10. Empty / loading states
- Skeleton loaders on first paint
- Friendly empty state when no data ("Record your first invoice to see your P&L")
- Error toast if a query fails

### 11. Export upgrades
- **CSV**: extended (KPIs + daily series + category + vendor + AR aging + tax)
- **PDF**: uses browser print with a dedicated `@media print` stylesheet
- "Email to accountant" button (uses existing send-email edge function if available, otherwise mailto: with CSV attached)

---

## Technical details

**Files to edit**
- `src/components/admin/store/autorepair/finance/FinanceProfitLossSection.tsx` — main rewrite (keep file, expand)

**New helper files**
- `src/components/admin/store/autorepair/finance/pnl/PnLKpiStrip.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLTrendChart.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLIncomeBreakdown.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLExpenseBreakdown.tsx` (with vendor/category/method toggle + drill-down drawer)
- `src/components/admin/store/autorepair/finance/pnl/PnLCashFlow.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLArAging.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLTaxEstimate.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLStatementView.tsx`
- `src/components/admin/store/autorepair/finance/pnl/PnLDateRangeBar.tsx` (presets + compare + group-by)
- `src/lib/admin/pnlCalculations.ts` — pure helpers: `computeKpis`, `groupSeries`, `agingBuckets`, `categorize`, `compareDelta`
- `src/lib/admin/pnlCsvExport.ts` — extended CSV builder (modeled on existing `performanceCsvExport.ts`)

**Data sources (existing tables, no DB changes needed)**
- `ar_invoice_payments` — paid revenue, by method
- `ar_invoices` — billed revenue, items jsonb, AR aging, sales tax
- `ar_expenses` — operating expenses, by category/vendor/method
- `ar_payouts` — cash-out tracking
- All filtered by `store_id`

**Charting**: use existing `recharts` already in the project (used elsewhere in admin). Bar + line composed chart; small sparklines via `<Sparkline>` from `recharts`.

**State**: keep React Query; add a single `useArFinanceData(storeId, from, to, compareMode)` hook that fans out the parallel queries (mirrors the pattern in `useStoreMarketingOverview.ts`).

**Performance**: parallel `Promise.all` on the 4 queries; memoized aggregations; `staleTime: 30s`; query invalidation when date range changes.

**Styling**: high-density v2026 standard already used elsewhere — `text-[11px/13px]`, `p-2/p-3`, `.zivo-card-organic`, emerald/rose tokens for income/expense, Lucide icons only.

**Print**: scoped `@media print` block in `PnLStatementView.tsx` to hide controls and force black-on-white.

---

## Out of scope (can do later if you want)
- Multi-store consolidated P&L
- Budget vs Actual
- Class/department tagging
- QuickBooks/Xero sync
- Locked accounting periods
