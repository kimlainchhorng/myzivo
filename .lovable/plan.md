# Estimates & Invoices — Upgrade Plan

You're right: the current list row only has **Preview / Send / Print** icons that all open the same dialog. There's no edit, no delete, no real "send", no way to mark paid, and no search. Estimates also can't be converted into invoices. Let's fix that.

## What's missing today (from the screenshot + code review)
1. No **Edit** — once created, you can't change a customer name, line item, or price.
2. No **Delete** — wrong invoices stay forever.
3. No **Status actions** — you can't mark Sent, Paid, Void, or record a partial payment.
4. **Send** button doesn't actually send — it just opens the preview.
5. No **Convert Estimate → Invoice** (huge for shop workflow).
6. No **Search / Filter** — finding INV-2032 in a list of 500 is impossible.
7. No **Duplicate** — repeat customers redo everything by hand.
8. No **KPI strip** — owner can't see Outstanding $, Paid this month, Overdue count at a glance.
9. No **PDF download** — only browser print.
10. **Estimates aren't persisted** to a table (only invoices are saved to `ar_invoices`).

## What we'll add

### A. Row actions (per invoice/estimate)
Replace the 3 ambiguous icon buttons with a clean action set:
- **View** (eye) → preview dialog
- **Edit** (pencil) → reopens the create form pre-filled with that doc
- **Send** (paper plane) → opens a small sheet to send via Email or SMS through an edge function (`send-ar-document`)
- **Mark Paid** (dollar) → records payment to `ar_invoice_payments`, flips status, feeds Finance dashboards
- **Duplicate** (copy)
- **Download PDF** (download) — uses `jspdf` + `jspdf-autotable`
- **Delete** (trash) with confirm dialog
- **Convert to Invoice** (estimates only, primary action)

### B. List header upgrades
- **Search bar** — by number, customer name, phone, VIN, plate
- **Status filter pills** — All · Draft · Sent · Paid · Overdue · Void
- **Sort menu** — Newest, Oldest, Amount high→low, Customer A→Z
- **KPI strip** above the tabs (4 compact cards):
  - Outstanding Balance (sum unpaid)
  - Paid This Month
  - Overdue (count + amount, red)
  - Avg Ticket

### C. Edit + Delete plumbing
- New `updateInvoice(id, patch)` writes to `ar_invoices` then updates local state.
- New `deleteInvoice(id)` soft-deletes (`deleted_at` column) so Finance numbers stay accurate historically — **requires a small migration**: add `deleted_at timestamptz` to `ar_invoices` and `ar_estimates`, and filter `is null` everywhere.
- Edit reuses the existing create form (already supports all fields), just prefilled with `setDraft(existing)` and a Save button that calls update vs insert.

### D. Persist Estimates properly
Currently estimates only live in React state and the seed array — they vanish on refresh outside the seeded ones. We'll:
- Use the existing `ar_estimates` table (already referenced in your finance layer).
- Mirror the same insert/select/update/delete pattern as invoices.

### E. Convert Estimate → Invoice
One-click button on any estimate:
1. Inserts a new row into `ar_invoices` with the estimate's customer, vehicle, items.
2. Generates the next `INV-####` number.
3. Marks the source estimate `status = 'approved'` and stores `converted_invoice_id`.
4. Switches the tab to Invoices and highlights the new row.

### F. Send via Email/SMS
New edge function `send-ar-document`:
- Inputs: `docId`, `channel: "email" | "sms"`, `to`
- Email path uses Resend (already configured) with a branded HTML template and a PDF attachment.
- SMS path uses Twilio (already configured) with a short message + signed view link.
- On success, flips status to `sent` and stamps `sent_at`.

### G. Public view link (so customers can actually open it)
- New table `ar_document_share_links (token uuid, doc_id, doc_type, expires_at)`.
- New public page `/d/:token` that renders the same preview, no auth needed.
- The Send action automatically generates the link and embeds it in the email/SMS.

## Technical layout

```text
src/components/admin/store/autorepair/
  AutoRepairInvoicesSection.tsx          (refactor: add actions, search, KPI)
  invoices/
    InvoiceKpiStrip.tsx                   (NEW)
    InvoiceListRow.tsx                    (NEW — extracted row + dropdown menu)
    InvoiceFilterBar.tsx                  (NEW — search + status pills + sort)
    SendDocumentSheet.tsx                 (NEW — email/SMS picker)
    RecordInvoicePaymentDialog.tsx        (NEW)
    DeleteConfirmDialog.tsx               (NEW — shared)
    ConvertEstimateButton.tsx             (NEW)
src/lib/admin/
  invoiceActions.ts                       (NEW — update/delete/duplicate/convert/markPaid)
  invoicePdf.ts                           (NEW — jsPDF generator)
src/pages/PublicDocumentView.tsx          (NEW — /d/:token route)
supabase/functions/send-ar-document/      (NEW edge function)
```

## DB migration (small)
- `ALTER TABLE ar_invoices ADD COLUMN deleted_at timestamptz, sent_at timestamptz, converted_from_estimate_id uuid;`
- `ALTER TABLE ar_estimates ADD COLUMN deleted_at timestamptz, sent_at timestamptz, converted_invoice_id uuid, status text DEFAULT 'draft';`
- New `ar_document_share_links` table with RLS allowing anon SELECT by token only.

## Order of work
1. Migration + persist estimates to `ar_estimates`.
2. Row dropdown menu with Edit / Delete / Duplicate / Mark Paid / Download PDF.
3. Edit flow (reuse create form).
4. Search + status filters + KPI strip.
5. Convert Estimate → Invoice.
6. Send sheet + edge function + public share page.

Want me to start with **steps 1–4** (the "I can't edit my invoice" pain) and queue Send + Convert as a follow-up, or do all of it in one pass?
