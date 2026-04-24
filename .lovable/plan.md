## Goal

Add five small reliability/UX improvements on top of the post viewer work that already shipped:

1. Undo a submitted report within 10 seconds and roll the menu badge back.
2. Capture failed/aborted swipe-dismiss attempts so future gesture regressions are diagnosable.
3. Copy the dev regression checklist results to the clipboard for bug reports.
4. Stop E2E menu tests from soft-skipping by seeding a guaranteed in-memory post.
5. Make the post menu and grab handle keyboard- and screen-reader-friendly.

## What changes

### 1. Undo report within 10 seconds (`ProfileContentTabs.tsx`)
- After `setReportStep("submitted")`, also start a 10s undo window:
  - Show a secondary "Undo report" button on the confirmation screen with a live countdown ("Undo (10s)").
  - When clicked within the window: remove the post id from `reportedPosts` (and `persistReported`), best-effort delete the just-inserted `post_reports` row (`.delete().eq("post_id", ...).eq("reporter_id", user.id).order("created_at", { ascending: false }).limit(1)`), `toast.success("Report undone")`, close sheet.
  - After 10s the button disappears; "Done" remains.
- Track the undo target in a `useRef<{ postId: string; expiresAt: number } | null>` so navigating away cancels it cleanly. Unmount cleanup clears the timer.
- The `Reported` badge in the menu reads from `reportedPosts`, so it auto-reverts when undo flips the set.
- Also surface a global toast with an inline Undo action using `sonner`'s `toast(... , { action: { label: "Undo", onClick } , duration: 10000 })` so users get the affordance even if they dismiss the sheet.

### 2. Gesture error logging (`useSwipeDownClose.ts` + `errorReporting.ts`)
- Add a tiny `logGestureEvent(kind, ctx)` helper next to `logProfileActionError` that pipes to `analytics_events` as `event_name: "gesture_event"` (deduped per-session, fire-and-forget). Keep payload ≤512B.
- In `useSwipeDownClose`:
  - On `onDragEnd`, if `shouldDismiss` is false **and** `info.offset.y >= thresholds.minDragDistance`, log `gesture.swipe_aborted` with `{ offsetY, velocityY, platform, threshold }` — these are the "tried to swipe but didn't pass threshold" cases the user hit.
  - Wrap `dragControls.start(e)` in `startDrag` with try/catch and log `gesture.start_failed` on throw (extremely rare, but currently silent).
  - Log `gesture.dismissed` at info level (sampled 1/10) so we have positive baseline volume.
- No UI change.

### 3. "Copy results" on the regression page (`PostMenuRegressionPage.tsx`)
- Add a `Copy results` button next to `Run all checks`. Disabled when no rows have run.
- Builds a markdown-style block:
  ```
  ZIVO post-menu regression — 2026-04-24T…
  UA: <navigator.userAgent>
  - [OK]  Bookmark insert — Insert + rollback succeeded
  - [FAIL] Report submit — new row violates RLS …
  ```
- Uses `navigator.clipboard.writeText` with a `document.execCommand("copy")` textarea fallback. Toast on success/failure. Adds a `data-testid="regression-copy-results"` for QA.

### 4. Seeded E2E dataset (no more soft-skip)
- New file `tests/e2e/fixtures/seedProfilePosts.ts` exporting `seedProfilePosts(page)` that:
  - Calls `page.addInitScript` to set a `window.__ZIVO_E2E_SEED__` flag and a small JSON payload (3 mock posts: image, reel, text) **before** any app script runs.
- New module `src/lib/testing/e2eSeed.ts` (tree-shaken in prod via `if (import.meta.env.DEV || window.__ZIVO_E2E_SEED__)`):
  - Reads the seed payload and exposes `getE2ESeedPosts(): FeedItem[] | null`.
- `ProfileContentTabs.tsx` initial `feed` state: `useState<FeedItem[]>(() => getE2ESeedPosts() ?? demoFeed)`. Production behavior unchanged because the flag is unset.
- Update both menu specs to call `await seedProfilePosts(page)` before `page.goto("/profile")` and remove the `test.skip(true, …)` branch — replace with a hard `expect(trigger).toBeVisible()`.
- Net effect: CI always has 3 posts available; no other surface area changes.

### 5. Accessibility (menu + grab handle)
- `SwipeGrabHandle.tsx`:
  - Make it focusable: `tabIndex={0}`, keep `role="button"`, refine `aria-label` to "Close post — drag down or press Escape".
  - Add `onKeyDown`: `Enter`/`Space` triggers `onClose` (passed in as a new optional prop; ProfileContentTabs/ReelsFeedPage already have a close handler — wire it through).
  - Visible focus ring: `focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none rounded-full`.
- Post menu sheet (`ProfileContentTabs.tsx`):
  - Wrap menu in `role="menu"` with `aria-label="Post actions"`. Each row: `role="menuitem"`, explicit `aria-label` (e.g. "Report this post — already reported" when disabled), `aria-disabled` for the disabled Report row.
  - Trap focus while open: focus the first menuitem on mount, restore focus to the trigger on close, handle `Escape` to close, handle `ArrowDown`/`ArrowUp` to move focus between rows (small `useRovingFocus` inline helper, ~25 lines).
  - Sheet container gets `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing at the existing title.
- New a11y unit test `src/components/social/SwipeGrabHandle.a11y.test.tsx`:
  - Asserts `aria-label`, `tabIndex=0`, that `Enter` calls `onClose`, and that focus ring class is present.
- New a11y E2E `tests/e2e/post-menu-a11y.spec.ts`:
  - With the new seed fixture, opens the menu via keyboard (`Tab` to "..." trigger, `Enter`), then `Tab`s through every row asserting `:focus` lands on each `data-testid` in order, and `Escape` closes the sheet and returns focus to the trigger.

## Files

**New**
- `src/lib/testing/e2eSeed.ts`
- `tests/e2e/fixtures/seedProfilePosts.ts`
- `tests/e2e/post-menu-a11y.spec.ts`
- `src/components/social/SwipeGrabHandle.a11y.test.tsx`

**Edited**
- `src/components/profile/ProfileContentTabs.tsx` (undo flow, a11y on menu, e2e seed init)
- `src/components/social/SwipeGrabHandle.tsx` (keyboard support, focus ring, optional `onClose`)
- `src/components/social/useSwipeDownClose.ts` (gesture logging hooks)
- `src/lib/security/errorReporting.ts` (export `logGestureEvent`)
- `src/pages/dev/PostMenuRegressionPage.tsx` (Copy results button)
- `tests/e2e/post-menu-interaction.spec.ts` (use seed fixture, drop soft-skip)

## Out of scope
- No DB schema changes (post_reports already supports delete via RLS the user has).
- No changes to the Reels viewer's own swipe — the hook change benefits it automatically.
- No new analytics dashboards; events land in the existing `analytics_events` table.
