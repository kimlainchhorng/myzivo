

# Store Profile — Phone verification, resilient analytics & smarter unlock UX

Five focused refinements on top of the gating + analytics work.

## 1. "Verify phone" step for store owners

In `LodgingPropertyProfileSection` → Contact card (and the equivalent food-store profile editor):

- Phone input gains a sibling **"Verify phone"** button when `contact.phone` is set but `contact.phone_verified_at` is null.
- Click → opens a small inline OTP sheet using the existing Twilio Verify flow (`send-otp-sms` + `verify-otp` edge functions, already used by `CountryPhoneInput` for user signup).
- On success: write `phone_verified_at = now()` to `lodge_property_profile.contact` (jsonb merge) and show an emerald "Verified" pill next to the phone.
- Customer side (`StoreProfilePage`): `callable = hasBooking && !!contact.phone` (verification not strictly required to display, but the verified pill is shown to customers as a trust signal in the new policy panel).

No new edge functions — reuses existing OTP infra. Migration: none (data lives inside existing `contact` jsonb).

## 2. Session-scoped unlock flag (replaces module Set)

Today `store_contact_unlocked` uses a module-scope `Set<string>` which resets on HMR / route remount and double-fires.

Replace with `sessionStorage`:

```ts
const key = `zivo:unlock_fired:${storeId}`;
if (!sessionStorage.getItem(key)) {
  track('store_contact_unlocked', {...});
  sessionStorage.setItem(key, '1');
}
```

- Survives HMR and component remounts within the tab session.
- Naturally resets when the tab closes (matches "once per browser session" intent).
- Wrapped in `try/catch` for Safari private mode.

## 3. Analytics offline fallback + flush-on-online

Extend `src/lib/analytics.ts`:

- On insert failure (catch + `.then(_, onErr)`), push the event to `localStorage` under key `zivo:analytics_queue` (capped at 200 events; oldest dropped).
- Add a one-time `flushQueue()` helper invoked:
  - On module load (covers reload after offline).
  - On `window.addEventListener('online', …)`.
  - On every successful insert (lazy drain — try up to 25 queued at a time).
- Each queued event keeps its original `created_at`, plus `flushed_at` set on retry success.
- Never throws; queue ops are wrapped in `try/catch`.

## 4. Tooltip reasoning on the locked CTA

`StoreProfilePage`'s "Complete a booking to unlock chat" button gains a `Tooltip`:

- Default copy: "Live Chat & Call Store unlock after a confirmed booking at this store."
- When `useHasStoreBooking` returns `source` from a *different* store (we already know the user has SOME bookings in app state): copy adapts → "Your other bookings don't qualify — you need a confirmed reservation **here**."
- For lodge stores: "Confirmed reservation required (lodge_reservation)."
- For food stores: "Completed order required (food_order)."

The store type is derived from `store.kind` (`lodge` vs `food`) which is already on the loaded store object. Uses existing `@/components/ui/tooltip`.

## 5. Unique `event_id` on contact actions

- Add `event_id: crypto.randomUUID()` to every `track()` call automatically — extend `analytics.ts` so all events get a stable id (used downstream for dedupe in BigQuery / SQL views).
- `store_contact_action` specifically: also include a `click_nonce` generated per render of the buttons, so a double-click within the same render shares a nonce (analytics dedupes on `nonce`), but a deliberate second click after re-render gets a new one.

```ts
track('store_contact_action', {
  store_id,
  channel: 'call',
  click_nonce: nonceRef.current,
});
```

`nonceRef` is reset whenever `hasBooking` flips or the store id changes.

## File map

**Modified**
- `src/lib/analytics.ts` — add `event_id`, localStorage queue, `flushQueue`, `online` listener.
- `src/hooks/useHasStoreBooking.ts` — already returns `source`; no change unless we also surface a `hasAnyBooking` flag (added: lightweight extra query without `store_id` filter, cached 5 min, used only for tooltip copy).
- `src/pages/StoreProfilePage.tsx` — sessionStorage unlock guard, tooltip on locked CTA, `click_nonce` on contact actions, "Verified" pill in policy panel.
- `src/components/admin/store/lodging/property-profile/ContactCard.tsx` — "Verify phone" button + inline OTP sheet, writes `phone_verified_at`.
- `src/hooks/lodging/useLodgePropertyProfile.ts` — extend `contact` jsonb type with optional `phone_verified_at: string | null`.

**No migration. No new edge functions. No new dependencies.**

## Notes

- All UI keeps v2026 high-density tokens (`text-[11px]`, `rounded-xl`, emerald semantic, Lucide-only).
- Analytics queue is bounded (200 events) and silently drops oldest — no risk of localStorage bloat.
- OTP reuse means store owners verify with the same SMS infra used elsewhere; rate limits already enforced (5 SMS/day per number).
- `event_id` is generated client-side; if the analytics table doesn't have an `event_id` column yet, the helper writes it inside the `properties` jsonb instead — zero schema change required.

