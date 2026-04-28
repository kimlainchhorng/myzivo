
## What's wrong today

Looking at the Contacts screen and the supporting code, here is what's broken or out of place:

1. **`FindContactsPage.addContact` inserts directly into `contact_requests` and ignores duplicates.** The `contact_requests` table has `UNIQUE(from_user_id, to_user_id)`, so re-tapping "Add" or adding a person who already has an outstanding request returns a 23505 error and shows a raw Postgres message instead of "Request already sent." It also doesn't reuse `useContactRequests().send()` which already handles refresh.

2. **No "Pending" / "In contacts" state on Find-by-phone matches.** Every match shows a generic "Add" button even when a request is already outgoing or the person is already in `user_contacts`. Users can spam-tap and get duplicate-key errors.

3. **Suggested row's "Add" sends a contact directly (`useContacts.add`) but the Find-by-phone flow sends a *request* (`contact_requests`).** Two entry points behave differently for the same action. The previous plan said "sending an invite creates a contact request" — Suggested should also go through `send()` so the receiver can approve, OR both flows should agree. They don't.

4. **Requests tab doesn't show a badge on the Contacts header.** Users have no way to know an incoming request is waiting unless they tap into Requests.

5. **No way to dismiss a "People you may know" suggestion permanently.** Current dismissal is in-memory only — refresh and the same person reappears.

6. **No profile preview before adding.** Tapping Add commits immediately. There's no confirm sheet showing avatar/bio/mutuals so users add the wrong person by accident.

7. **`Recently added` section shows contacts whose `added_via = "chat_history"`** (the fallback in `useContacts.refresh`) which means the very first DM partner is mislabeled "Recently added" with no real add date. The fallback should be tagged differently or excluded from the Recently-added bucket.

8. **`syncPhone()` quick-action navigates to `/chat/find-contacts` regardless of native availability.** On native devices we should kick off the picker directly instead of forcing an extra screen.

9. **Accepting a request creates reciprocal `user_contacts` rows but doesn't auto-cancel any matching outgoing request the recipient might have already sent** (the "you sent me + I sent you" case yields two requests and only one gets resolved).

10. **Missing pieces** the previous loop didn't deliver:
    - Resend button on a declined outgoing request.
    - Empty state on Requests tab is fine, but no link back to "Find friends".
    - No header badge count on the Contacts → Requests quick-action tile (the count exists in the hook).

## Plan

### 1. Unify "Add" flow through `useContactRequests.send()`
- Update `SuggestedContactsRow` and `FindContactsPage` to call `send(userId)` instead of `useContacts.add` / direct insert.
- In `useContactRequests.send`, treat Postgres `23505` as success ("Request already sent") and return `{ ok: true, duplicate: true }`.
- Suggested card and Find-by-phone match row both render three states:
  `Add` → `Pending` (amber, links to Sent tab) → `In contacts` (muted, opens chat) — driven by `outgoing` + `useContacts().contacts`.

### 2. Contacts header — incoming-request badge
- Read `incoming.length` from `useContactRequests` in `ContactsPage`.
- Show a small emerald dot + count on the **Requests** quick-action tile and a matching dot on the header `Inbox` icon if we add one. Tile aria-label updates: `"Requests, N pending"`.

### 3. Persistent "Not interested" for suggestions
- Create migration `suggestion_dismissals(user_id, dismissed_user_id, created_at, PRIMARY KEY(user_id,dismissed_user_id))` with RLS (owner only).
- Extend `useSuggestedContacts.fetchFresh` to read dismissals in parallel and exclude them.
- Add `dismiss(id)` that inserts a row and updates the cache; replace the in-memory `dismissed` set in `SuggestedContactsRow`.

### 4. Profile preview confirm sheet before send
- New `ConfirmAddContactSheet` (avatar, name, @username, mutuals count if any, message textarea, **Send request** button).
- Triggered by every Add action (Suggested, Find-by-phone, AddContactSheet username lookup). Optional `message` is forwarded to `send()`.

### 5. Fix Recently-added mislabeling
- In `useContacts`, only build the `chat_history` fallback when there are zero real contacts (already true). When real contacts exist, never inject fallback rows.
- In `ContactsPage`, exclude rows whose `added_via === "chat_history"` from the Recently-added bucket (push them to A–Z instead).

### 6. Native sync goes straight to picker
- `ContactsPage.syncPhone()`: if `nativeReady`, call `pickAndHashPhones()` directly and navigate to `/chat/find-contacts` only with results. Otherwise navigate as today.

### 7. Accept resolves reciprocal request
- In `useContactRequests.accept`, after the update, also `update({status:'accepted'})` any pending request where `from_user_id = me AND to_user_id = req.from_user_id` so the Sent tab clears.

### 8. Requests tab polish
- Add **Resend** button on declined outgoing requests (deletes the row, then re-`send`).
- Empty state: add "Find friends" CTA → `/chat/find-contacts`.
- Show counts in tab labels (already partial; add `· N` for sent pending too).

### 9. Minor cleanup
- `nativeContacts.ts` — only register the optional plugin when `Capacitor.isNativePlatform()`; currently it tries on web and silently fails (still fine, but noise in logs).
- Add `aria-current` on the active Requests tab.

## Technical details

**Files to edit**
- `src/hooks/useContactRequests.ts` — handle 23505, reciprocal accept, expose `resend`.
- `src/hooks/useSuggestedContacts.ts` — fetch + filter dismissals.
- `src/components/chat/SuggestedContactsRow.tsx` — three-state button, persistent dismiss, open ConfirmAddContactSheet.
- `src/components/chat/ConfirmAddContactSheet.tsx` — **new** shared confirm sheet.
- `src/components/chat/AddContactSheet.tsx` — route through ConfirmAddContactSheet.
- `src/pages/chat/FindContactsPage.tsx` — switch to `send()`, show Pending/In contacts states, ConfirmAddContactSheet, fix the duplicate insert behaviour.
- `src/pages/chat/ContactsPage.tsx` — header/tile badge, native-direct sync, exclude `chat_history` from Recently-added, link to Requests with count.
- `src/pages/chat/ContactRequestsPage.tsx` — Resend button, empty-state CTA, sent-pending count.
- `src/hooks/useContacts.ts` — keep behaviour but expose `addedViaChatHistory` flag for filtering.

**New migration** (`suggestion_dismissals`)
```sql
CREATE TABLE public.suggestion_dismissals (
  user_id UUID NOT NULL,
  dismissed_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, dismissed_user_id)
);
ALTER TABLE public.suggestion_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages dismissals" ON public.suggestion_dismissals
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_suggestion_dismissals_user ON public.suggestion_dismissals(user_id);
```

**Out of scope** (not in this loop): server-side push when an incoming request arrives, Nearby contacts integration, group invite links — flag as follow-ups.
