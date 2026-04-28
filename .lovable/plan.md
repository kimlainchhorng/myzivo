I found why “nothing” is happening from the user’s perspective:

- The current scan flow only uses a hidden file picker. If the selected file is cancelled, blocked by browser/mobile capture behavior, or the function call fails early, the UI does not clearly show a next step.
- The helper function still depends on Supabase auth claim validation that can reject valid preview sessions. The deployed logs show no recent successful `ar-receipts-helper` or `scan-invoice` calls, and the expenses table for this store currently has no saved invoice rows.
- Auto-save only runs after all stages finish. A preflight/auth issue stops the whole process before OCR and save, so the user sees no saved result.

Plan to fix it:

1. Make scan action explicit and visible
   - Replace the hidden-only scan flow with a small scan/upload sheet.
   - Show clear states: “Choose photo”, “Reading image”, “Scanning invoice”, “Saving expense”, “Saved”.
   - Add a visible “Upload receipt photo” control and keep camera capture support for mobile.
   - If the user cancels file selection, show “No image selected” instead of appearing to do nothing.

2. Remove the fragile auth blocker before OCR
   - Do not let `ar-receipts-helper` preflight block invoice OCR.
   - First read and scan the image, then attempt save through the helper.
   - If preflight/helper auth fails, keep the parsed form open with the extracted fields so nothing is lost.

3. Harden edge function authentication
   - Update `ar-receipts-helper` to use the reliable two-client pattern:
     - user-context Supabase client initialized from the incoming Authorization header
     - service-role Supabase client for controlled inserts/uploads after ownership is validated
   - Use `auth.getUser(accessToken)` and/or JWT payload fallback for the `sub` claim instead of relying only on `getClaims`, which has been returning invalid-session errors in Edge Functions.
   - Return structured errors with stage, status, details, and action.

4. Call helper functions with an explicit session token
   - Add a small client helper for `ar-receipts-helper` calls that fetches the active session and sends:
     - `Authorization: Bearer <access_token>`
     - `apikey: <publishable key>`
     - JSON body
   - Use this for `preflight`, `fallback_upload`, and `save_expense` instead of relying only on `supabase.functions.invoke()` for auth context.

5. Guarantee save fallback behavior
   - If primary receipt storage fails, use fallback upload as before.
   - If receipt upload fails entirely but OCR succeeds, still save the expense without `receipt_url` instead of stopping the invoice save.
   - If server-side save fails from a transient DB/storage issue like `08P01`, retry the helper save with backoff.
   - If auto-save still cannot complete, open the dialog prefilled with scanned values so the user can press Save manually.

6. Improve AutoZone extraction defaults
   - Adjust the scan normalization to handle the shown AutoZone invoice:
     - vendor: AutoZone
     - invoice number: `00252121382`
     - date: `2026-04-21`
     - time: `08:25 AM`
     - payment: cash
     - item: TOTAL PRO BATTERY / part `24F-T`
     - subtotal/total: `$117.00`, tax `$0.00`
   - Add local safeguards so if the AI returns totals but weak line items, the app creates a valid line item from the invoice total and still saves.

7. Make diagnostics actually useful for this issue
   - Keep the diagnostics panel visible after every scan attempt.
   - Include scan stage, helper action, function URL, HTTP status, response body/error, bucket/path, and whether an expense row was inserted.
   - Show a compact user-facing status banner: “Saved”, “Scanned but needs review”, or “Failed at auth/OCR/save”.

8. Deploy and validate
   - Deploy updated `ar-receipts-helper` and `scan-invoice` edge functions.
   - Test `preflight` through the edge function tool with the current logged-in user context if available.
   - Verify the store `a914b90d-c249-4794-ba5e-3fdac0deed44` receives a new `ar_expenses` row and an `ar_expense_items` row after scanning.

Expected result after implementation:

```text
Click Scan invoice
→ select/take receipt photo
→ app shows “Scanning invoice…”
→ app extracts fields
→ app saves expense automatically
→ expense list shows AutoZone · $117.00 with receipt attached when upload works
```

If upload/auth still fails, the scan will no longer silently stop: the form will open prefilled so the invoice data is not lost.