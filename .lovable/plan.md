Add a robust receipt upload pipeline with preflight validation, automatic retry, an edge-function fallback bucket, and an in-app diagnostics panel.

## What you'll get

1. **Preflight check** — before uploading, the app calls a new edge function that confirms (a) you're authenticated, (b) you own the store (or are an admin), and (c) the storage folder we'd use matches your store. The Add expense / Scan invoice flow surfaces a clear error if any check fails.
2. **Automatic retry on transient errors** — if the primary `ar-receipts` upload fails with `08P01` (or any 5xx / network blip), the client retries up to 3 times with exponential backoff (300 ms, 700 ms, 1500 ms).
3. **Fallback bucket via edge function** — if all retries still fail, the image is sent to a new `ar-receipts-fallback` bucket through an edge function using the service role. The expense is saved with a fallback signed URL so the receipt is never lost.
4. **Diagnostics panel** — a collapsible "Upload diagnostics" panel inside the Expenses section records the last upload attempt's request URL, headers (auth bearer redacted), bucket, object path, attempt count, retried/fallback status, and the raw Supabase error JSON. Includes a "Copy details" button.

## Files to add / change

- `supabase/migrations/<ts>_ar_receipts_fallback_bucket.sql` — creates the private `ar-receipts-fallback` bucket and a SELECT-only RLS policy for owners (writes happen only via service role).
- `supabase/functions/ar-receipts-helper/index.ts` — new edge function with two actions:
  - `preflight` — validates JWT, looks up `store_profiles.owner_id`, checks `user_roles` for admin, returns ownership flags + expected folder.
  - `fallback_upload` — accepts `image_base64` + `mime_type`, decodes, writes to `ar-receipts-fallback/{store_id}/...` via service role, returns a signed URL.
- `src/components/admin/store/autorepair/finance/FinanceExpensesSection.tsx` — refactor scan-invoice flow to:
  - Call `ar-receipts-helper` (`preflight`) before any upload.
  - Wrap `supabase.storage.from('ar-receipts').upload(...)` in a retry helper that detects transient errors (HTTP 5xx, network failure, message contains `08P01`, `Database`, `timeout`, `ECONNRESET`).
  - On final failure, call `ar-receipts-helper` (`fallback_upload`) and store the returned `bucket` + `path` in `ar_expenses.receipt_url` (prefixed `fallback:` so the detail view knows which bucket to sign from).
  - Maintain a `diagnosticsRef` of the last attempt and render an "Upload diagnostics" panel with copy-to-clipboard.
- `ExpenseDetailSheet` — when `receipt_url` starts with `fallback:`, sign from `ar-receipts-fallback`; otherwise sign from `ar-receipts`.

## Technical notes

```text
flow:
  click Scan invoice / pick file
    -> POST ar-receipts-helper {action:'preflight', store_id}
       (block with toast if !ok)
    -> read file -> base64
    -> POST scan-invoice {image_base64, mime_type}
    -> attempt direct upload to ar-receipts (with retry x3)
         if final error and transient/permission:
           POST ar-receipts-helper {action:'fallback_upload', ...}
    -> open review dialog, save expense
```

Transient detection rule:
```text
isTransient = err.statusCode in {500,502,503,504}
           || /08P01|database error|timeout|ECONNRESET|fetch failed/i.test(err.message)
           || err.name === 'TypeError'   // browser network error
```

Diagnostics record (kept in component state, last 1 attempt):
```text
{
  url, method, bucket, path,
  attempts: [{ n, started, durationMs, status, code, message, transient }],
  used_fallback: bool,
  user_id, store_id, headers: {authorization:'Bearer <redacted>', apikey:'<redacted>', 'x-upsert':'false'}
}
```

After approval I'll apply the migration, deploy the new edge function, and ship the client changes in a single pass.