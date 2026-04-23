

## Goal
Make the mobile contact section more robust: cleaner long-press vs tap handling, SMS draft confirmation, i18n status chip, normalized phone number, and a one-tap "Refresh / View bookings" action on the locked chip.

## What you'll see

**1. Bullet-proof Share long-press (no double-fire)**
- Long-press on Share → copies link, shows toast.
- The synthetic `click` that fires after touchend is now suppressed via `e.preventDefault()` + `e.stopPropagation()` on `onTouchEnd` when the long-press fired, plus a 350ms `ignoreNextClick` window. No more "share sheet pops open right after I copied the link".
- Right-click on desktop also copies and blocks the click.

**2. SMS confirmation toast**
- After tapping the SMS tile, a toast appears: `SMS draft opened — type your message and hit send` (auto-dismiss 4s). Confirms the composer was triggered (helps when iOS opens Messages in background).

**3. i18n + consistent tone for the status chip**
New translation keys in `src/i18n/translations.ts` (English + Khmer; English fallback covers the other 23 langs):
- `store.booking_status.checking` → "Checking your bookings…"
- `store.booking_status.unlocked` → "Chat & Call unlocked"
- `store.booking_status.unlocked_sub` → "Booking on file"
- `store.booking_status.locked` → "Locked — book to unlock Chat & Call"
- `store.booking_status.refresh` → "Refresh"
- `store.booking_status.view_bookings` → "View bookings"
- `store.sms_draft_opened` → "SMS draft opened"
- `store.link_copied` → "Link copied to clipboard"

Chip text is rebuilt to use `t(...)` everywhere. Loading state uses a real label + spinner instead of an empty pulse so screen readers announce state.

**4. Normalized phone (E.164) once, used everywhere**
- Compute `const normalizedPhone = useMemo(() => normalizePhoneE164ForStore(store.phone), [store.phone])` once in the component using the existing `src/lib/phone.ts` helpers (`normalizePhoneDigits`, `buildPhoneE164`).
- Strips spaces, dashes, parentheses, dots; if no leading `+`, prefix with country code (defaults to `+855` for Cambodia stores, configurable via `store.country_code` if present).
- Both `tel:` and `sms:` links use the same `normalizedPhone` value — no more duplicate inline regex in two places.

**5. Refresh / View bookings on the locked chip**
The locked chip becomes a two-part pill on mobile:
```
[ 🔒  Locked — book to unlock Chat & Call ]   [ ↻ Refresh ]
                                                ↓ tap
                                         re-runs useHasStoreBooking
                                         (queryClient.invalidateQueries)
```
- Primary (left, larger): tap → navigates to `/account/bookings`.
- Secondary (right, icon button): tap → `queryClient.invalidateQueries({ queryKey: ["has-store-booking", storeId] })` + clears the localStorage cache key + shows toast `Re-checking…`. Lets users force a refresh after they just booked (covers webhook lag).

## Technical Summary

**Files modified**
- `src/pages/StoreProfilePage.tsx`
  - Add `normalizedPhone` memo using `buildPhoneE164` from `@/lib/phone`. Replace both inline `tel:`/`sms:` regex builders with this single value.
  - Refactor Share button: introduce `ignoreNextClickRef` (boolean + timestamp). On long-press fire, set ref + timeout 350ms. `onClick` early-returns if ref is set. `onTouchEnd` calls `preventDefault()` when long-press fired.
  - Add SMS `toast.success(t("store.sms_draft_opened"))` on the SMS tile's `onClick`.
  - Replace hardcoded chip strings with `t(...)` calls; add `Loader2` spinner to loading state.
  - Split locked chip into pill + small `RefreshCcw` icon button. Wire to `queryClient.invalidateQueries` and `localStorage.removeItem(\`zivo:store-unlock:${userId}:${storeId}\`)`.
  - Import `useQueryClient` from `@tanstack/react-query` and `RefreshCcw` from `lucide-react`.
- `src/hooks/useHasStoreBooking.ts`
  - Export a small helper `clearStoreBookingCache(userId, storeId)` so the page can wipe the cache on manual refresh without duplicating the key format.
- `src/i18n/translations.ts`
  - Add the 8 new keys above to the `en` block and Khmer (`km`) block. Other languages fall back to `en` automatically.

**No DB / edge function / dependency changes.** Pure client-side hardening.

