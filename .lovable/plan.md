# Harden the post viewer: tests, logging, tap targets, report status

A focused pass that adds verifiable safeguards around the swipe-down post viewer and its menu. Five small, independent pieces.

## 1. End-to-end tests for swipe + menu re-clickability

Add `tests/e2e/post-menu-interaction.spec.ts` (Playwright, mirrors the existing `swipe-close.spec.ts` pattern):

- **Swipe round-trip**: open the profile post viewer → swipe handle past the threshold → assert overlay unmounts (`profile-post-close` gone). Re-open → assert overlay remounts.
- **Repeated swipes don't trap clicks**: open / close the overlay 3× in a row, then on the 4th open click the "..." button and assert the menu sheet appears (`data-testid="profile-post-menu-sheet"`). Catches stale drag-listener / pointer-capture regressions.
- **Menu actions are clickable**: with the menu open, click each of Report / Notifications / Not interested / Comment settings and assert the correct success state appears (toast or follow-up sheet via new `data-testid` hooks).
- Runs on iPhone 13 + Pixel 7 device descriptors so iOS/Android swipe thresholds are both exercised.

## 2. In-app regression checklist (dev-only)

New page `src/pages/dev/PostMenuRegressionPage.tsx` mounted at `/dev/post-menu-check` (gated to `import.meta.env.DEV` — 404s in production).

A simple checklist UI that:
- Lists the 4 menu actions (Report, Notifications, Not interested, Comment settings) plus Bookmark and Copy link.
- Each row has a "Run" button that calls the same handler the real menu uses against a mock post id.
- A green check + "OK" badge appears when the action's success state fires; a red X + the captured error message appears on failure.
- Useful for QA before each release without having to seed real posts.

## 3. Report confirmation + persistent status badge

`src/components/profile/ProfileContentTabs.tsx`:
- After Submit on the Report sheet, replace the current text-only "submitted" step with a clear confirmation screen: large check icon, "Report submitted", explanation paragraph, and Done button (already partially there — polish copy + visuals).
- Track reported posts in a `reportedPosts: Set<string>` state (and persist to `localStorage` keyed by user id so it survives reloads).
- In the post "..." menu, when the current post is in `reportedPosts`, show the Report row with a small muted "Reported" badge and disable re-submission. Same treatment in the Reels menu (`src/pages/ReelsFeedPage.tsx`).

## 4. Tap-target audit on the overlay

Mobile tap-size guideline is 44×44 (Apple HIG) / 48×48 (Material).

- `SwipeGrabHandle`: already at `h-8` tap zone — bump to `h-11` (44px) so the gesture target meets HIG even though the visible pill stays small.
- Menu rows in profile + reels: confirm `min-h-[48px]` and `py-3.5` everywhere (Reels rows already have it; profile rows currently `py-3.5` only — add `min-h-[48px]`).
- Header close button on the overlay: confirm `min-h-[44px] min-w-[44px]` (already present per grep, but add to public-profile overlay if missing).
- Add a Vitest unit test `src/components/social/SwipeGrabHandle.test.tsx` that renders the handle and asserts `getBoundingClientRect().height >= 44`.

## 5. Client-side error logging for profile actions

Extend `src/lib/security/errorReporting.ts` with a small named export:

```ts
export function logProfileActionError(action: string, ctx: Record<string, unknown>, error: unknown): void
```

It dedupes (same dedupe set), serializes the payload context (post id, user id, action name), trims to 1KB, and inserts to `analytics_events` with `event_name: "profile_action_error"`. Failures stay silent — never throw.

Wire it into the existing `try/catch` blocks in `ProfileContentTabs.tsx`:
- Bookmark toggle (already wraps insert/delete in try/catch — replace bare `toast.error` with `logProfileActionError("bookmark.toggle", { postId, op }, error)` before the toast).
- Report submit (the new try/catch added last turn).
- Delete post handler.
- Edit caption save handler.

No new database tables — reuses the existing `analytics_events` table and the existing dedupe pipeline.

## Files

- New: `tests/e2e/post-menu-interaction.spec.ts`
- New: `src/pages/dev/PostMenuRegressionPage.tsx` (+ route entry in `src/App.tsx`)
- New: `src/components/social/SwipeGrabHandle.test.tsx`
- Edit: `src/components/social/SwipeGrabHandle.tsx` (h-11 tap zone)
- Edit: `src/components/profile/ProfileContentTabs.tsx` (report status badge, persistent state, error logging, tap-target tweaks, test ids on menu sheet + rows)
- Edit: `src/pages/ReelsFeedPage.tsx` (mirror reported-status badge)
- Edit: `src/lib/security/errorReporting.ts` (new `logProfileActionError` export)

## Out of scope
- No DB migrations.
- No changes to swipe thresholds — those were tuned earlier and tests will guard against regressions.
- No production dev-page exposure — the regression checklist is DEV-only.
