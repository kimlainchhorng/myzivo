
## What’s actually happening (based on your answers + Supabase logs)

You’re seeing:
- **Redirect screen stays forever**
- **Sometimes an error toast**
- **New tab blocked/blank**
- **Console logs appear**
- **DevTools Network shows “no request shown”**

And in Supabase Edge Function logs we previously saw:
- **Stripe `url_invalid`** for `success_url` (“explicit scheme such as https must be provided”)

This points to **two separate problems** that can both cause the “Redirecting…” screen to hang:

1) **Checkout session creation can fail server-side** when `origin` is malformed (missing `https://` or is relative like `/rides`) → Stripe rejects the session → function returns 500.
2) **Browser pop-up blocking/adblock can prevent the redirect/new-tab fallback**, and if the function request is blocked (or an OPTIONS preflight hangs), the UI stays on “processing” because the promise never resolves.

We’ll fix both: make the Edge Function generate valid URLs 100% of the time, and make the frontend resilient against blocked popups/hanging requests.

---

## Phase 1 — Make Edge Function origin handling bulletproof (fix Stripe `success_url`)

### Change: Resolve a safe, absolute origin
Update `supabase/functions/create-ride-checkout/index.ts` to:
- Prefer `Origin` if it’s an absolute `http(s)://…`
- Else parse `Referer` with `new URL(referer).origin` (only if absolute)
- Else fall back to a **hard-coded allowed base URL**: `https://myzivo.lovable.app`
- Also add a final guard: if the resulting origin doesn’t start with `http`, force it to fallback.

This eliminates the “scheme missing” Stripe error permanently.

### Add: Log the resolved origin and the final success_url/cancel_url
Keep the logs, but add:
- `console.log("[create-ride-checkout] success_url:", success_url)`
- `console.log("[create-ride-checkout] cancel_url:", cancel_url)`

So when you test on the published site, we can confirm what URL Stripe is receiving.

### Optional (recommended): Allowlist-based origin
If you have multiple domains (e.g. `hizovo.com` later), use an allowlist:
- `["https://myzivo.lovable.app", "https://hizovo.com"]`
If computed origin isn’t in the list, fallback to the primary.

---

## Phase 2 — Fix “stuck on redirect” UX (handle popup blockers + hung network)

### A) Pre-open the checkout tab synchronously (beats popup blockers)
Update `src/pages/Rides.tsx` `handlePayment()` to:
1. Immediately do: `const popup = window.open("about:blank", "_blank")` inside the click handler (synchronous).
2. If popup is blocked, `popup` will be `null` → we know immediately and can fall back to same-tab navigation later.
3. After we get `data.url`, set:
   - If `popup` exists: `popup.location.href = data.url`
   - Else: `window.location.assign(data.url)`

This avoids the current pattern where `window.open()` happens inside a `setTimeout`, which is almost always blocked by modern browsers.

### B) Add an explicit request timeout + recovery
Right now, if the Edge Function call hangs (blocked request / preflight never finishes), the UI can remain on “processing” forever.

Add a timeout (e.g., 15 seconds):
- If it times out, show a toast:
  - “Payment setup is taking too long. Please disable ad blockers for this site and try again.”
- Then return user to `step="confirm"` and `isSubmitting=false`.

Implementation approach:
- Wrap the invoke promise with `Promise.race([invokePromise, timeoutPromise])`

### C) Improve on-screen processing state
In the “processing” UI, add:
- A “Cancel” / “Back” button that returns to confirm step
- A small help hint:
  - “If you use an ad blocker, allow `supabase.co` and `stripe.com`.”

This makes it possible to recover without reloading the page.

---

## Phase 3 — Validate whether the request is being blocked client-side (your “No request shown”)

Because you’re testing on the **published site**, Lovable’s built-in iframe network tools won’t capture it. So we’ll add quick self-diagnostics:

### A) Add a single log line right before invoking the function
In `handlePayment()`:
- `console.log("[Rides] Invoking edge function create-ride-checkout...")`

### B) Add an `onunhandledrejection` temporary debug (optional)
If needed, temporarily attach:
- `window.addEventListener("unhandledrejection", ...)`
to catch any silent promise issues (can remove after confirmed).

### C) What you (user) should check after we ship the changes
In Chrome DevTools > Network:
- Filter: `create-ride-checkout` or `functions`
- You should see either:
  - `POST https://slirphzzwcogdbkeicff.supabase.co/functions/v1/create-ride-checkout` (200)
  - Or an OPTIONS + POST pair

If you still see “no request”:
- It’s likely extension-level blocking (some privacy tools block before it hits the network panel), or you’re viewing the wrong frame/context.
- Testing in a clean Chrome profile is the fastest confirmation.

---

## Phase 4 — (If still failing) Add a “manual checkout link” fallback

If the Edge Function returns `{ url }` but navigation is prevented:
- Display a button: “Open Secure Checkout”
- Clicking it uses `window.location.assign(url)` (same tab) and also sets `popup.location` if available.

This guarantees the user can continue even in stricter browser configurations.

---

## Files that will be changed

1. `supabase/functions/create-ride-checkout/index.ts`
   - Robust origin resolution (always absolute https origin)
   - Log final URLs used for Stripe session

2. `src/pages/Rides.tsx`
   - Pre-open popup tab synchronously
   - Timeout protection around `supabase.functions.invoke`
   - Better processing UI with cancel/back + instructions
   - Keep logs, add “Invoking edge function…” log

3. (If applicable) `src/pages/app/AppRides.tsx`
   - Apply the same “pre-open tab + timeout” pattern so mobile/PWA doesn’t regress

---

## Verification steps (end-to-end)

1) Go to **published** site: `https://myzivo.lovable.app/rides`  
2) Open DevTools Console and Network  
3) Click “Pay & Request”  
4) Confirm:
- Console shows:
  - `[Rides] Starting checkout...`
  - `[Rides] Invoking edge function...`
  - `[Rides] Checkout response...`
- Network shows the functions call (OPTIONS/POST) completing
- A new tab opens to Stripe (or same tab navigates if popup blocked)

5) If it fails, check Supabase function logs for `create-ride-checkout` and confirm `success_url` starts with `https://`.

---

## Why this will fix it

- The Stripe “Invalid URL” error is solved by ensuring `success_url` and `cancel_url` always start with `https://…`.
- The “stuck on redirect” is solved by:
  - avoiding popup blockers (open tab synchronously)
  - avoiding infinite loading (timeout + back button)
  - providing user-facing recovery paths

