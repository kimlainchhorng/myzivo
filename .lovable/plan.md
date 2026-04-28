I found the current error is still happening before the AI scan runs: the upload to Supabase Storage fails on `ar-receipts/...` with `StorageApiError: database error, code: 08P01`.

The latest policies exist and the logged-in user does own the store, so this is no longer a normal “wrong owner” RLS failure. `08P01` is a low-level database/protocol error from the Storage service. To stop this loop, I’ll change the scan flow so it no longer depends on uploading the image to Storage before scanning.

Plan:

1. Bypass Storage for invoice scanning
   - In `FinanceExpensesSection.tsx`, replace the pre-scan `supabase.storage.upload(...).createSignedUrl(...)` step with browser-side file reading.
   - Send the selected invoice image directly to the `scan-invoice` edge function as base64.
   - This removes the failing `ar-receipts` upload from the scan path.

2. Keep receipts optional after successful parsing
   - After the invoice is parsed and the review dialog opens, the expense can still be saved even if receipt storage is unavailable.
   - The saved expense will not block on `receipt_url` when Storage errors occur.
   - I’ll add a small note/toast so the user understands: “Invoice scanned, receipt image was not attached.”

3. Harden the Edge Function input
   - Update `supabase/functions/scan-invoice/index.ts` to accept `image_base64` plus an optional MIME type.
   - Validate image size/type server-side and send the image to Lovable AI Gateway using a data URL.
   - Keep CORS headers on every response.

4. Clean up the Storage policy separately
   - Add a follow-up migration that simplifies `ar-receipts` policies to the safest minimal folder-owner checks using the same pattern Supabase documents.
   - Keep store-owner checks via `store_profiles.owner_id`.
   - Add `auth.role() = 'authenticated'` and avoid complex expressions that can make Storage return vague 500 errors.
   - This is still useful for viewing/attaching receipts later, but it will no longer be required for scanning.

5. Improve diagnostics if anything else fails
   - Update the error toast to clearly show whether the failure is file reading, AI parsing, saving expense, or saving line items.
   - Keep the console log with stage information for the next debug pass if needed.

Technical notes:

```text
Current failing flow:
Browser file -> Storage upload -> Signed URL -> scan-invoice -> review dialog
                  ^ failing here with 08P01

New flow:
Browser file -> base64 -> scan-invoice -> review dialog -> save expense
```

This avoids the broken Storage upload path entirely for the main “Scan invoice” feature, while still preserving secure Storage policies for receipt attachment/display when Supabase Storage behaves correctly.