# Contacts Page Enhancements

Five focused improvements to the Contacts experience without touching unrelated areas.

## 1. Retry + clearer toasts when adding suggested contacts

File: `src/components/chat/SuggestedContactsRow.tsx`

- Wrap `add()` in a small helper that classifies failures:
  - Rate limit (Postgres `429`, error code `429`, or message includes "rate"/"too many") → toast: "You're going too fast. Try again in a moment." with a **Retry** action.
  - Network/offline (`!navigator.onLine`, `TypeError: Failed to fetch`, `NetworkError`) → toast: "No connection. Check your network and try again." with **Retry** action.
  - Duplicate (`23505`) → silently treat as success and refresh.
  - Other → toast.error with the actual message + **Retry** action.
- Use `sonner`'s `toast.error(msg, { action: { label: "Retry", onClick: () => onAdd(id) } })`.
- Add a per-card retry counter (max 2 auto-retries on network errors with 800ms backoff) before surfacing the toast.

## 2. Keyboard nav + ARIA on header & quick-action grid

File: `src/pages/chat/ContactsPage.tsx`

- Header buttons already use `aria-label`; add `title` for desktop tooltip and ensure `tabIndex` order: Back → Search input → Invite → QR → Add.
- Wrap quick-action grid in `<nav aria-label="Contact quick actions">` and convert each tile from `<button>` to `<button type="button" aria-label="…">` with descriptive labels: "Find people by phone number", "Sync phone contacts", "View contact requests", "Find people nearby".
- Add visible `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none` to header icon buttons and quick-action tiles.
- Add `role="group"` + `aria-label="Suggested people"` to `SuggestedContactsRow` container.

## 3. Clearer badge on each suggested profile + deep-link

File: `src/components/chat/SuggestedContactsRow.tsx`

- Replace plain "Follows you" / "Recent chat" text with a small pill badge (emerald for follower, sky for chat) using `UserCheck` / `MessageCircle` Lucide icons.
- Make the badge a clickable element:
  - `reason === "follower"` → navigates to `/u/{username}` (or `/profile/{user_id}` fallback) with `?context=followers`.
  - `reason === "chat"` → opens the existing chat via the same `navigate("/chat", { state: { openChat: {…} } })` pattern used in `ContactsPage`.
- Stop click propagation so tapping the badge doesn't trigger the Add button. Add `aria-label="Open profile, follows you"` / `aria-label="Open recent chat with {name}"`.

## 4. Cache + fewer round-trips for "People you may know"

File: `src/hooks/useSuggestedContacts.ts`

- Add an in-memory module-level cache keyed by `user.id` with a 5-minute TTL: `{ data, fetchedAt }`. On mount, return cached data immediately and revalidate in background (stale-while-revalidate).
- Run the three independent reads in parallel with `Promise.all` instead of sequentially:
  - `user_contacts` (excludes), `follows` (followers), `direct_messages` (recent partners).
- Reduce `direct_messages` limit from 60 → 40 and select only `sender_id, receiver_id` (already done) plus add `head: false`.
- Persist the most recent successful payload to `sessionStorage` under `zivo:suggested:{userId}` so tab revisits skip the network entirely until TTL expires.
- Expose `isStale` so the row can show a tiny spinner only while revalidating.

## 5. Invite via contact request + Requests-tab status

Files:
- `src/components/chat/InviteFriendsSheet.tsx`
- `src/hooks/useContactRequests.ts` (already exists)
- `src/pages/chat/ContactRequestsPage.tsx` (already shows Sent/Incoming tabs)

Behavior:
- Add a new section in `InviteFriendsSheet` titled "Invite an existing ZIVO user" with a `@username` input + **Send request** button.
- On submit:
  1. Resolve username via existing `useContacts().findByUsername`.
  2. If found, call `useContactRequests().send(userId, "Hi! Let's connect on ZIVO.")`.
  3. Toast success: "Request sent. Track it in Requests → Sent." with action **View** that navigates to `/chat/contacts/requests` with `?tab=out`.
  4. If username not found → toast: "No ZIVO user with that handle. Share your invite link instead."
- Update `ContactRequestsPage` to read `?tab=in|out` from `useSearchParams` and set the initial tab accordingly so the toast deep-link lands users on the Sent tab.
- The existing Sent tab already shows pending/accepted/declined/cancelled status, so no schema changes needed.

## Technical notes

- No database migrations needed — `contact_requests` and `user_contacts` already exist with realtime subscriptions.
- All changes are client-side TS/TSX. No new dependencies.
- Sonner toasts support `action` for the Retry/View buttons natively.
- Cache uses module scope + `sessionStorage`; cleared automatically when the user signs out (the hook keys by `user.id` and resets to `[]` when null).

## Files modified

- `src/pages/chat/ContactsPage.tsx` — a11y + focus styling
- `src/components/chat/SuggestedContactsRow.tsx` — retry logic, badges, deep-links, a11y
- `src/hooks/useSuggestedContacts.ts` — parallel queries, in-memory + sessionStorage cache, SWR
- `src/components/chat/InviteFriendsSheet.tsx` — new "Invite existing user" section that sends a contact request
- `src/pages/chat/ContactRequestsPage.tsx` — honor `?tab=` query param for deep-linking
