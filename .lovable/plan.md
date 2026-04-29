## Goal
Finish the Finance suite by upgrading the **two remaining basic sub-tabs** — Payments Received and Expenses & Bills — to the same accountant-grade quality as P&L / Income / Tax. Plus three cross-cutting wins that benefit all dashboards.

---

## Part 1 — Payments Received (full upgrade)

Replace 3-stat + flat list + single dialog with a real cash-in dashboard.

### Period bar
Today / 7d / 30d / 90d / This month / Last month / YTD / Custom + previous-period compare toggle. Same shape as the Income/Tax bars.

### KPI strip (6 cards w/ sparklines + delta vs previous period)
1. Total received
2. Payment count
3. Avg payment
4. Largest payment
5. Unique customers paid
6. Refunds issued — color-coded

### Trend chart
Bar = daily/weekly receipts + Line = cumulative. Day/Week/Month toggle.

### Method breakdown
Donut (Cash / Card / Check / ABA / Other) + per-method totals & counts table.

### Smart "Record Payment" dialog
- Outstanding-only invoice filter (toggle).
- Searchable invoice combobox (number / customer / vehicle / plate).
- Auto-fills amount with remaining balance when invoice picked.
- Overpayment confirm prompt.
- Inline customer summary card after pick (name, vehicle, balance, days outstanding).

### Outstanding invoices side panel
Top 10 unpaid/partial invoices sorted by days-outstanding with a "Apply payment" button that opens the dialog pre-filled.

### Recent payments table
Search (reference/customer/invoice #), method filter, sort by date/amount, edit/delete row actions, click-through to linked invoice. "Closed invoice" pill when a payment fully settled it.

### Refund action
Per-row "Refund" → records a negative-amount payment with method = original, reference auto-set to "Refund of {original}".

### Export
CSV (payments in range) + Print + per-customer statement export.

### Files
- `src/components/admin/store/autorepair/finance/FinancePaymentsSection.tsx` — refactor to orchestrator (parallel `useQueries`).
- `src/lib/admin/paymentsCalculations.ts` — new (KPIs, series grouping, method breakdown, customer aggregation).
- `src/lib/admin/paymentsCsvExport.ts` — new.
- `src/components/admin/store/autorepair/finance/payments/` — new folder:
  - `PaymentsPeriodBar.tsx`
  - `PaymentsKpiStrip.tsx`
  - `PaymentsTrendChart.tsx`
  - `PaymentsMethodBreakdown.tsx`
  - `PaymentsTable.tsx`
  - `PaymentsOutstandingPanel.tsx`
  - `RecordPaymentDialog.tsx`

---

## Part 2 — Expenses & Bills (focused upgrade)

The current page already has AI receipt scan + add-expense form (1,254 lines — keep that intact). Add an **analytics layer above it**, no rewrite of the existing form/scan code.

### New header strip (above existing scanner card)
- Period bar (Today / 7d / 30d / 90d / This month / Last month / YTD / Custom + compare toggle).
- 6 KPI cards w/ sparklines:
  1. Total spent
  2. COGS (parts/supplies/materials/inventory)
  3. OpEx (everything else)
  4. Expense count
  5. Avg expense
  6. Vendor count

### New analytics row (between KPIs and existing list)
- **Trend chart** — daily/weekly bar + cumulative line.
- **Top categories** (horizontal bars, top 8) with click-to-filter the existing list.
- **Top vendors** (horizontal bars, top 8) with click-to-filter the existing list.

### Existing list — small upgrades
- Tie its filter state to the new period bar (so the list shows only what's in range).
- Add "Vendor" filter dropdown alongside the existing "Category" filter.
- Add row click → opens existing edit drawer (already there) — confirm wiring.
- Add a "Receipt" thumbnail badge when `receipt_url` is set (click opens in new tab).

### Export
CSV + Print menu added to the period bar (matches the other 4 dashboards).

### Files
- `src/components/admin/store/autorepair/finance/FinanceExpensesSection.tsx` — wrap the existing content with the new period bar / KPI strip / charts at the top, pass filtered range down to the existing list.
- `src/lib/admin/expensesCalculations.ts` — new (KPIs, series, category/vendor aggregation, COGS classifier — re-uses logic from pnlCalculations).
- `src/lib/admin/expensesCsvExport.ts` — new.
- `src/components/admin/store/autorepair/finance/expenses/` — new folder:
  - `ExpensesPeriodBar.tsx` (re-skin of the Income period bar)
  - `ExpensesKpiStrip.tsx`
  - `ExpensesTrendChart.tsx`
  - `ExpensesCategoryBars.tsx`
  - `ExpensesVendorBars.tsx`

**Note**: I will NOT rewrite the existing AI scan / add-expense form / list — only add layers above and tie filters. The 1,254-line file stays mostly intact.

---

## Part 3 — Cross-cutting upgrades (all 5 dashboards)

### A) Real PDF export (replaces browser print)
- Add `jspdf` + `jspdf-autotable`.
- New utility `src/lib/admin/financePdfExport.ts` that takes the same payloads as the CSV exporters and writes a branded PDF (store name, period, KPI grid, breakdown tables).
- Wire into the export menus on P&L, Income, Tax, Payments, Expenses alongside CSV.

### B) Email-to-Accountant edge function
Currently P&L "Email" just opens mailto + downloads CSV. Replace with:
- New edge function `send-finance-report` that accepts `{ to, subject, message, csvBase64, pdfBase64?, filename }` and sends via Resend.
- Will check for `RESEND_API_KEY` first — if missing, prompt to add it.
- Shared `EmailAccountantDialog` component (To, Subject, Message preview, attachment list).
- Per-store CPA email saved in localStorage `zivo:ar:cpa-email:{storeId}` so it pre-fills next time.

### C) Saved view preferences
Persist last-used date range, group-by, and compare toggle per dashboard per store in localStorage so refresh / tab switch keeps the same view.
- Key pattern: `zivo:ar:fin:{section}:{storeId}` → `{ from, to, groupBy, compare }`.
- New `src/lib/admin/financePrefs.ts` helper.

### Files for Part 3
- `src/lib/admin/financePdfExport.ts` — new.
- `src/lib/admin/financePrefs.ts` — new.
- `src/components/admin/store/autorepair/finance/shared/EmailAccountantDialog.tsx` — new.
- `supabase/functions/send-finance-report/index.ts` — new edge function.
- `supabase/config.toml` — register new function (verify_jwt = true).
- Light edits to all 5 orchestrators to wire in PDF + Email + prefs.

---

## Out of scope
- QuickBooks / Xero formatted exports (separate pass).
- Stripe / ABA auto-import of payments (requires merchant account + new schema).
- Rewriting the existing receipt-scan / expense form code.

---

## Technical notes
- No DB migrations needed — uses existing tables.
- `jspdf` + `jspdf-autotable` are tiny, fully client-side.
- Edge function uses `RESEND_API_KEY` (will check secrets and ask to add if missing).
- All money in cents; v2026 high-density styling (text-[11px/13px], p-2/p-3).
- All charts via `recharts` (already present from earlier upgrades).
- I will also quietly fix the current `useContext` runtime error.
