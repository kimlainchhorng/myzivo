

## Problem
After scanning the QR + tapping "Confirm & Go Live" on the phone, the desktop studio still shows `<GoLivePage />` ("Camera unavailable") instead of `<PairedStreamViewer />` (the phone's live feed).

Root cause in `StoreLiveStreamSection.tsx`:
- The `pairStatus === "confirmed"` switch (line 317) depends on local component state set only by the realtime UPDATE handler that fires while the QR dialog is open.
- When the dialog closes, the cleanup at line 90 resets `pairStatus` to `"idle"` → studio falls back to `<GoLivePage />` (desktop has no camera → blank).
- On a fresh page load there is no detection of an already-paired phone — the desktop "forgets" the pairing.

The phone *is* publishing correctly; the desktop just isn't switching into viewer mode.

## Fix

### 1. Persist + auto-detect paired session on desktop
- Don't reset `pairStatus` on dialog close — keep the "confirmed" badge so the studio keeps showing the viewer.
- On mount, query for an **active** `live_pair_sessions` row for this `storeId` (status `confirmed`, not expired). If found → set `pairStatus = "confirmed"`, store the session, auto-mount studio.
- Add a new RPC `get_active_pair_session_for_store(p_store_id uuid)` returning the most recent confirmed/active session for the store. Restricted so only the store owner can call it.

### 2. Always-on realtime watcher (independent of dialog)
- Move the `live_pair_sessions` realtime subscription out of the dialog effect into a top-level effect keyed on `storeId`. Listen for INSERT and UPDATE rows where `store_id = storeId`.
- On any row flipping to `confirmed`, set `pairStatus = "confirmed"` and auto-open the studio.

### 3. Auto-show viewer when phone goes live, even without an explicit pair session
- Add a parallel watcher: query `live_streams` for this `storeOwnerId` with `status='live'`. If one exists, switch the studio to `<PairedStreamViewer />` even if `pairStatus` isn't `"confirmed"` (covers the case where the user scanned via a different desktop session).
- Updated condition for the studio body becomes:
  ```
  (pairStatus === "confirmed" || hasActiveLiveStream) && storeOwnerId
    ? <PairedStreamViewer ... />
    : <GoLivePage />
  ```

### 4. Manual "force viewer" toggle (small UX safety net)
- Add a tiny button in the studio header: when an active stream exists but the desktop shows GoLivePage, allow user to tap "View phone feed" → switches to `<PairedStreamViewer />`.

### 5. Phone-side robustness check
- In `GoLivePage.tsx`, double-check that the publisher PC is created when `phase === "live" && isPaired`. Add a console log on offer creation to make debugging easier (no behavior change).

## Files
- `src/components/admin/StoreLiveStreamSection.tsx` — restructure pairing state, add active-session + active-stream queries, update studio gate, remove reset-on-close.
- New migration: add `get_active_pair_session_for_store` RPC (security definer, owner-only).
- `src/pages/GoLivePage.tsx` — add a `[publisher]` console log around offer creation.

## Out of scope
- TURN server (still STUN-only).
- Public viewers (only the paired-owner desktop sees the feed).

