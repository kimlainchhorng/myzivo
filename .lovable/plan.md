# Plan — Scan & Structured Invoices for Expenses & Bills

Upgrade the Auto Repair → Finance → **Expenses & Bills** dialog so the shop owner can either **snap a photo / upload a receipt** and have it auto‑parsed by AI, OR enter a full invoice manually with structured fields and per‑line items (part number, name, qty, unit price, line total).

## What you'll see in the app

- New **"Scan invoice"** button next to **Add expense**.
  - Opens the camera on mobile (`capture="environment"`) or a file picker on desktop.
  - Image is uploaded to Supabase Storage and sent to Lovable AI Gateway (Gemini 2.5 Flash, vision) to extract: company name, invoice #, date, time (AM/PM), payment method, subtotal, tax, total, and a list of line items `{part_number, name, qty, unit_price, line_total}`.
  - Parsed data pre‑fills the **Add Expense** dialog so the owner can review/edit before saving.
- **Add Expense** dialog redesigned with:
  - Company / Vendor (e.g. AutoZone, NAPA)
  - Invoice # • Date • Time (AM/PM picker)
  - Payment method • Category
  - **Line items table** — add/remove rows; columns: Part #, Name, Qty, Unit Price, Total (auto). Subtotal/Tax/Total auto‑computed; total syncs to `amount_cents`.
  - Receipt image preview (if scanned/uploaded) with "Replace" and "Remove".
  - Notes.
- Expense list rows now show **vendor • invoice # • date+time** and a small 📎 icon when a receipt image is attached. Click a row → **Invoice details drawer** with full line items and the receipt image.

## Database changes

Extend `ar_expenses` and add a child table for line items:

```sql
ALTER TABLE public.ar_expenses
  ADD COLUMN invoice_number text,
  ADD COLUMN invoice_time   time,         -- stored 24h, displayed as AM/PM
  ADD COLUMN subtotal_cents integer,
  ADD COLUMN tax_cents      integer,
  ADD COLUMN receipt_url    text;         -- public URL in ar-receipts bucket

CREATE TABLE public.ar_expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.ar_expenses(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  part_number text,
  name text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price_cents integer NOT NULL DEFAULT 0,
  line_total_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ar_expense_items ENABLE ROW LEVEL SECURITY;
-- Policies: only store owner/admin can read/insert/update/delete items
-- (mirroring existing ar_expenses policies via EXISTS subquery on ar_expenses + stores).
```

Storage: create a private bucket `ar-receipts` with RLS allowing the store owner to read/write their own folder `<store_id>/...`.

## Edge function

`supabase/functions/scan-invoice/index.ts`
- Auth required (verify_jwt = true).
- Input: `{ image_url }` (public URL from `ar-receipts`) or base64.
- Calls **Lovable AI Gateway** `google/gemini-2.5-flash` with vision message asking for strict JSON:
  ```json
  { "vendor": "...", "invoice_number": "...", "date": "YYYY-MM-DD",
    "time": "HH:MM", "payment_method": "card|cash|...",
    "subtotal_cents": 0, "tax_cents": 0, "total_cents": 0,
    "items": [{ "part_number": "...", "name": "...", "quantity": 1,
                "unit_price_cents": 0, "line_total_cents": 0 }] }
  ```
- Handles 429/402 with friendly messages. Returns parsed object to client.

## Files to add / change

- **New** `supabase/functions/scan-invoice/index.ts` (+ `config.toml` entry).
- **New migration** for columns, `ar_expense_items` table, RLS, and `ar-receipts` storage bucket + policies.
- **Edit** `src/components/admin/store/autorepair/finance/FinanceExpensesSection.tsx`:
  - Add Scan button + hidden `<input type="file" accept="image/*" capture="environment">`.
  - Upload to storage, call `scan-invoice`, prefill form.
  - New form state: `invoice_number`, `invoice_time` (with AM/PM toggle), `items[]`, `subtotal`, `tax`, `receipt_url`.
  - Line‑items editor (add row, remove row, auto line total = qty × unit price; total = sum + tax).
  - On save: insert `ar_expenses` then bulk‑insert `ar_expense_items`.
  - List row: show vendor • inv# • date `h:mm A` • 📎 icon.
  - Click row → details Drawer/Sheet with items table + receipt image.
- **Edit** `FinancePnLSection` (minor): keep using `amount_cents` (already correct, no change needed).

## Time AM/PM handling

Store `invoice_time` as `time` (24h). UI uses two `Select`s (1–12, 00/15/30/45) + AM/PM toggle, converted on save/load. Display via `format(date, 'h:mm a')` from `date-fns` (already in the project).

## Out of scope

- OCR of handwritten receipts beyond what Gemini vision handles.
- Multi‑page PDF invoices (image only for v1).
- Editing line items after save — v1 supports view + delete the whole expense; inline edit can come next.
