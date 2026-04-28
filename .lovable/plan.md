# Contacts Page — Bug Fixes + Missing Add-Ons

The Contacts page is functional but has one broken link and several gaps that block real usage. This plan fixes the bugs, then layers in the missing must-haves.

## 1. Bug fixes (must do first)

- **Broken QR route.** Header QR icon and `AddContactSheet → "My QR code"` both navigate to `/chat/qr`, but the actual route registered in `App.tsx` is `/qr-profile`. Update both call sites to `/qr-profile`. Without this, the QR icon does nothing on tap.
- **"Sync phone" tile is mislabeled.** It currently routes to `/chat/find-contacts`, the same page as "Find by phone". Either remove the duplicate, or wire a real native sync path (see §2).
- **Realtime not refreshing suggestions.** `useSuggestedContacts` never invalidates when a new follower or DM arrives. Add a lightweight subscription on `follows` (where `following_id = me`) and on `direct_messages` so the cached "People you may know" list re-revalidates instead of going stale for 5 minutes.
- **Suggestions cache leaks across users.** Memory cache is keyed by user id (good), but on sign-out it isn't cleared. Clear `memCache` and `sessionStorage` `zivo:suggested:*` keys on auth change.

## 2. Real native contacts sync

Right now "Sync phone" just opens a paste-text screen. Add a true native path on iOS/Android via Capacitor:

- Add `@capacitor-community/contacts` as a dependency.
- New helper `src/lib/nativeContacts.ts`: `isNativeAvailable()`, `requestPermission()`, `pickAndHashPhones()` — pulls phone numbers from device contacts, normalises to E.164 best-effort, hashes locally with the existing `hashPhoneE164` (no raw numbers ever leave the device), then calls the existing `contact-match` edge function.
- `FindContactsPage.tsx`: when running on native, show a primary "Sync from phone" button that uses the native flow; fall back to the current paste-text UI on web.
- "Sync phone" tile on Contacts page becomes the entry to this native flow (and gracefully falls back to the paste UI on web).

## 3. Blocked-users management

`blocked_users` table exists and `useBlockUser` is already used elsewhere, but Contacts has no surface for it. Users blocked on a chat surface have no way to unblock from here.

- Add a 5th quick-action tile (or move "Nearby" to a secondary row) called **"Blocked"** linking to a new page `src/pages/chat/BlockedUsersPage.tsx`.
- Page lists blocked profiles with avatar + name + Unblock button. Uses `useBlockUser` to list/unblock and the same profile-fetch pattern as `useContacts`.
- Register route `/chat/blocked` in `App.tsx`.

## 4. "Search everyone" fallback in contact search

Today the search bar only filters local contacts. If a user types a name that isn't in their list, they hit a dead end.

- When `q.trim().length >= 2` and `filtered.length === 0`, render a "Search everyone on ZIVO" affordance that queries `usernames` + `profiles` (limit 8) and shows results inline with an Add button (reusing `add()` from `useContacts`).
- Debounce the remote query 300 ms.

## 5. Contact list sections

The list is a flat dump. Add lightweight sectioning that already maps to existing data:

- **Favorites** (rows where `favorite = true`) — pinned at top with star header.
- **Recently added** (top 5 by `created_at`, last 7 days).
- **All contacts** A–Z with sticky single-letter headers.

Pure client-side grouping over the existing `useContacts` result; no schema changes.

## 6. Request status badge on suggestion cards

If you've already sent a request to a suggested person, the "Add" button still says "Add" and a second tap returns a duplicate error. Fix:

- `SuggestedContactsRow` reads `outgoing` from `useContactRequests`. If a suggestion's `user_id` matches a pending outgoing request, render a disabled "Pending" pill (with link to `/chat/contacts/requests?tab=out`) instead of the green Add button.
- After a successful `add()`, also remove the user from the local `dismissed`/visible set so the card disappears immediately.

## 7. Empty-state polish

The "No contacts yet" empty state only offers "Add contact". Replace with three buttons: **Add by @username**, **Sync phone**, **Invite friends** — mirroring the three real ways to grow the list.

---

## Files to change / create

Edit:
- `src/pages/chat/ContactsPage.tsx` — fix QR route, sectioned list, search-everyone fallback, Blocked tile, richer empty state.
- `src/components/chat/AddContactSheet.tsx` — fix `/chat/qr` → `/qr-profile`.
- `src/components/chat/SuggestedContactsRow.tsx` — Pending badge from outgoing requests; remove added user from list.
- `src/hooks/useSuggestedContacts.ts` — realtime invalidation on follows/DMs; clear cache on sign-out.
- `src/pages/chat/FindContactsPage.tsx` — native "Sync from phone" button when available.
- `src/App.tsx` — register `/chat/blocked` route.
- `package.json` — add `@capacitor-community/contacts`.

Create:
- `src/lib/nativeContacts.ts`
- `src/pages/chat/BlockedUsersPage.tsx`
- `src/components/chat/SearchEveryoneResults.tsx` (used by ContactsPage search fallback)

No DB migrations required — `blocked_users`, `contact_requests`, `follows`, `user_contacts`, `direct_messages` already exist.

After approval, the user will need to run `npx cap sync` once for the new native contacts plugin to take effect on device.
