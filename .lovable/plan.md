## Problem

In the "Add Expense / Invoice" dialog, the Line Items table is cramped — Part #, Name, Qty, and Unit price inputs collapse so badly that placeholders show as "SK", "Ite", "(", and the row controls overlap. Two root causes:

1. **Header/row column mismatch**: Header sums to 12 (3+4+1+2+2). Row sums to 12 only by stealing a column from "Total" for the delete button (3+4+1+2+1+1), so the Total cell sits under the wrong header and the entire layout drifts.
2. **Qty column is `col-span-1`** (~1/12 of width) — far too narrow for a number input with stepper arrows. Inside a `max-w-2xl` dialog this becomes ~30px wide.

## Fix

### `FinanceExpensesSection.tsx` — Line items table

Rebalance the grid and align header with rows:

```text
Part #  | Name | Qty | Unit price | Total | ✕
col-3   | 4    | 1   | 2          | 2     | (absolute icon, not in grid)
```

Concrete changes:

- Widen the dialog a touch: `max-w-2xl` → `max-w-3xl` so inputs breathe.
- Use **`grid-cols-12`** consistently with: Part `col-span-3`, Name `col-span-4`, Qty `col-span-1`, Unit `col-span-2`, Total `col-span-2`. Add the delete X as a small absolute-positioned button on the right of each row (or move to its own trailing column and re-balance to a 13-col layout via `grid-cols-[3fr_4fr_1fr_2fr_2fr_auto]` using arbitrary template — preferred, no math drift).
- Switch to `grid-cols-[1.2fr_2fr_0.7fr_1.2fr_1.2fr_auto]` (fractional) for both header and rows so columns scale with available width and the Qty/Unit inputs stay readable.
- Remove the inline `text-xs` size on inputs in favor of `text-sm` (still compact at h-8) so users can actually read what they type.
- Stack to a single column on mobile (`md:grid` only) — on small screens render each line as a vertical mini-card with two rows: [Part # | Name] then [Qty | Unit | Total | ✕].

### Apply the same fractional template to the **detail view** table (lines ~518 and ~527) so the read-only display matches.

### Tax / Subtotal block

- Move the running totals (Subtotal / Tax / Total) into a right-aligned summary card with a subtle border so it visually anchors. Keep Tax input on the left.

## Out of Scope

- No DB schema changes.
- No edge function changes.
- No changes to scan logic.

## Files

- `src/components/admin/store/autorepair/finance/FinanceExpensesSection.tsx` (edit dialog grid + detail view grid + dialog max width)
