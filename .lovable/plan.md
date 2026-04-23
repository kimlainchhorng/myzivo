

## Inline Payment Card Upgrade — Lodging Booking

Make the embedded Stripe card a self-contained, multi-state payment hub inside the booking sheet. No redirects, no confusion about what to do next.

### What you'll get

1. **One-click retry on expired sessions** — If Stripe's client secret expires (or the session errors out), the card shows a "Session expired — Refresh card form" button that re-creates the Checkout Session in place.
2. **Polished loading + error states** — Skeleton shimmer while the secret loads, clear error banner with retry, and proper `aria-live`/focus management so screen readers announce state changes and the retry button gets focus on error.
3. **Inline receipt after authorization** — When Stripe fires `onComplete` (and the realtime payment row flips to `authorized`/`captured`/`succeeded`), the card swaps to a green "Payment confirmed" panel showing amount, last 4 digits (from PI), auth code, and reservation ID — all without leaving the sheet.
4. **Payment-method toggle inside the card** — Segmented control at the top of the payment card: **Card** · **Apple/Google Pay** · **Cash on arrival**. Card and wallets stay inline (Stripe Embedded Checkout already surfaces wallet buttons when the device supports them); Cash collapses the embed and shows a "Pay at check-in" confirmation panel instead.
5. **Clear success/failure step with next actions** — Three explicit terminal states inside the same card:
   - ✅ **Authorized** — "Your card is held. We'll capture on check-in." + View receipt button.
   - ❌ **Failed** — Reason from Stripe + "Try a different card" (refreshes secret) and "Switch to cash" (toggles method).
   - ⏳ **Processing** — Spinner with "Confirming with your bank…" and a 30s safety timeout that surfaces the retry path.

### How it works

```text
LodgingEmbeddedCheckout (refactored)
├── Header: method toggle (Card | Wallet | Cash)
├── Body (state machine)
│   ├── loading      → skeleton + aria-live="polite"
│   ├── ready        → <EmbeddedCheckout/> (Stripe handles card+wallets)
│   ├── expired      → "Refresh card form" CTA → re-invoke create-lodging-deposit
│   ├── error        → banner + retry (auto-focus button)
│   ├── processing   → spinner + 30s watchdog
│   ├── succeeded    → inline receipt panel (amount, •••• 4242, ref ID)
│   └── failed       → reason + "Try another card" / "Switch to cash"
└── Realtime sub on lodging_payments row → drives succeeded/failed
```

### Files to change

- `src/components/lodging/LodgingEmbeddedCheckout.tsx` — refactor into state machine, add method toggle, expired/succeeded/failed panels, a11y (aria-live regions, focus management, ESC handling stays with parent sheet).
- `src/components/lodging/LodgingBookingDrawer.tsx` — lift method toggle state up so Cash collapses the embed; pass current `payment_status` from realtime down so the card can render the receipt panel; remove the now-redundant external "Card on file" badge actions.
- `src/components/lodging/LodgingPaymentBadge.tsx` — keep as a compact summary above the card; defer all action buttons to the new inline card to avoid duplicate CTAs.
- `supabase/functions/create-lodging-deposit/index.ts` — add a `force_new: true` flag so the retry path mints a fresh session instead of reusing the expired one (idempotency key gets a new suffix).

### Detection of expired secret

Stripe Embedded Checkout doesn't emit an explicit "expired" event, so we'll:
- Track session creation time; after 23h (Stripe sessions live 24h) preemptively show the refresh state.
- Listen for the `EmbeddedCheckoutProvider` error callback and any `expired_session` style messages → flip to `expired` state.
- Always offer a manual "Refresh card form" link in the card footer as an escape hatch.

### Accessibility

- Card root: `role="region"` + `aria-label="Payment"`.
- State container: `aria-live="polite"` for loading/processing, `aria-live="assertive"` for errors and success.
- Method toggle: real `<button role="tab">` group with arrow-key navigation.
- On error/expired, focus moves to the primary retry button.
- All icons get `aria-hidden`; status text is the source of truth for screen readers.

### Out of scope (ask if you want them)

- Saving the card for future stays (requires SetupIntent + customer flow).
- Splitting deposit vs. full charge selection inside the card (currently driven by parent).

