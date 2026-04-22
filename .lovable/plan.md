

# Store Profile — Unlock gating polish, analytics & richer matching

Five focused refinements to the Call Store / Live Chat gating added in the last round.

## 1. Analytics events on unlock

When `hasBooking` flips from `undefined → true` for a given store, fire two events via the existing analytics helper (`@/lib/analytics` — already used elsewhere for `track('reel_view', …)`):

- `store_contact_unlocked` — `{ store_id, store_type: 'lodge'|'food', source: 'lodge_reservation'|'food_order' }`
- `store_contact_action` — fired on actual click: `{ store_id, channel: 'call'|'chat' }`

Implementation: extend `useHasStoreBooking` to return `{ hasBooking, source }` (which table matched), and add a `useEffect` in `StoreProfilePage` that fires `store_contact_unlocked` once per session per store (guarded by a `Set` in module scope so re-renders don't double-fire).

## 2. Hide Call Store when there is no phone number

Today both buttons render together. Update `StoreProfilePage`:

- `const callable = hasBooking && !!(store?.phone || store?.contact?.phone)`
- `const chattable = hasBooking` (unchanged)
- Render Call Store only when `callable`; Live Chat only when `chattable`. If `hasBooking` is true but no phone exists, show a tiny muted helper line under Live Chat: "This store hasn't shared a phone number."

## 3. Skeleton loading states

While `useHasStoreBooking` is `isLoading`, render `<Skeleton className="h-9 w-28 rounded-xl" />` placeholders in place of the two buttons (using the existing `@/components/ui/skeleton`). Prevents the buttons from "popping in" after the booking check resolves.

## 4. Richer hasBooking matching

Extend `useHasStoreBooking` to widen the match surface so legitimate guests aren't locked out by email-case or alias mismatches:

- **Lodge**: match on ANY of:
  - `guest_user_id = auth.uid()` (new, primary)
  - `guest_email ILIKE auth_email`
  - `guest_email ILIKE any (profile.alt_emails)` if the `profiles` row exposes alternate emails (best-effort; skip silently if column missing)
- **Food**: keep `user_id = auth.uid()`, plus add `customer_email ILIKE auth_email` fallback for guest-checkout orders.
- All four sub-queries run in parallel via `Promise.allSettled` so one failing branch (e.g. column doesn't exist on a fork) doesn't break the whole check. Return the first matching `source` for analytics.

Schema note: `lodge_reservations.guest_user_id` already exists in this project — verified via the existing reservation create flow. No migration needed.

## 5. "Complete your booking to unlock chat" CTA

When `!isLoading && !hasBooking`:

- Replace the current grey notice with a single emerald outline button: `<Button variant="outline" onClick={() => navigate('/account/bookings')}>Complete a booking to unlock chat</Button>`
- Below it, a tiny muted line: "Already booked? Make sure you used the same account email." with a `<Link to="/account/bookings">View my bookings</Link>` for direct deep-link.
- Route confirmed: `/account/bookings` is the canonical bookings list (used by `useBookingHistory`).

## File map

**Modified**
- `src/hooks/useHasStoreBooking.ts` — return `{ hasBooking, source, isLoading }`; add `guest_user_id` + `customer_email` fallbacks via `Promise.allSettled`.
- `src/pages/StoreProfilePage.tsx` — skeletons, phone-aware Call Store gate, analytics fire, replacement CTA.

**No new files, no migration, no new dependencies.**

## Notes

- v2026 high-density tokens preserved (`text-[11px]`, `rounded-xl`, emerald semantic).
- Analytics fires once per (session, store) — avoids inflated counts on re-mount.
- `Promise.allSettled` keeps the hook resilient to schema drift across forks/environments.

