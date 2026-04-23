

## Goal
Make the mobile contact section on `/grocery/shop/:slug` smarter and more useful: show booking/lock status inline, persist unlocked state across refreshes, give users an SMS fallback when calling is off, prompt them straight to chat after booking, and add a long-press copy fallback for sharing.

## What you'll see

**1. Inline booking status under "Ride There" (mobile/tablet)**
A small status chip directly under the green Ride There button:
- Loading → `Checking your bookings…` (subtle skeleton)
- Unlocked → green pill `Chat & Call unlocked · Booking on file`
- Locked → amber pill `Locked — Complete a booking to enable Chat`
This replaces the standalone "Complete a booking to unlock chat" panel below and is always visible at a glance.

**2. Persisted unlock state (no flicker on refresh)**
The result of `useHasStoreBooking(storeId)` is cached per `(userId, storeId)` in `localStorage` (key: `zivo:store-unlock:{userId}:{storeId}`, TTL 24h). On reload, the UI immediately shows the last-known state, then revalidates in the background — no more "everything looks locked for 1 second on every visit".

**3. SMS fallback when Call is disabled**
When the store has a phone number but calling is locked (no booking yet), the **Call** tile turns into an **SMS** tile that opens `sms:+855...?body=Hi, I'm interested in {storeName}…`. Users can still reach the store on mobile without needing to book first. If there's no phone at all, it stays disabled with the existing locked styling.

**4. "Open chat" toast right after booking**
After a successful booking on the same store (detected when `hasBooking` flips from `false` → `true` while the page is open), a sonner toast appears:
`Booking confirmed — chat with {storeName} is now unlocked` with an **Open chat** action button that opens the StoreLiveChat sheet directly. Auto-dismisses after 8s.

**5. Long-press / right-click → Copy link fallback**
On the **Share** tile:
- Tap → native `navigator.share` (or copy fallback if unavailable)
- Long-press (500ms) on touch / right-click on desktop → directly copies the page URL to clipboard with a `Link copied to clipboard` toast, bypassing the share sheet entirely
Useful when iOS Safari's share sheet misbehaves or the user just wants the URL.

## Technical Summary

**Files modified**
- `src/hooks/useHasStoreBooking.ts` — add `localStorage` cache layer (`initialData` from cache + `onSuccess` write-through), 24h TTL, scoped by user+store.
- `src/pages/StoreProfilePage.tsx`
  - New inline status chip rendered between Ride There button and the 3-tile grid.
  - Replace Call tile logic: if `!callable && phone` → render SMS tile (`sms:` href, `MessageSquare` icon, label "SMS").
  - Add `useEffect` watching `hasBooking` transition `false → true` → fire `toast.success(..., { action: { label: "Open chat", onClick: () => setChatOpen(true) }})`.
  - Share tile: add `onContextMenu` + `onTouchStart`/`onTouchEnd` long-press handlers (500ms timer) that call `navigator.clipboard.writeText(window.location.href)` and show toast.
  - Remove the now-redundant standalone "Complete a booking to unlock chat" panel (its info moves into the inline status chip).

**No DB changes, no edge functions, no new dependencies** — pure client-side UX improvements.

