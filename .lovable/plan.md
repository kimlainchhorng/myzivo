## Goal

Make the leave-guard rock-solid (no false positives, no infinite loops, correctly off after completion), persist every step automatically, give users a "Save & exit" path, and lock the behaviour in with automated tests.

## Bugs / gaps in the current wizard

1. **`isDirty` is a false positive.** It's `!!bizName || !!bizEmail || …`, but `bizEmail`, `firstName`, `contactEmail`, etc. are *prefilled* from the user's profile in a `useEffect`. The wizard appears dirty before the user touches anything → the leave dialog opens on every Back press.
2. **`completedRef` flips too late.** It's set after every awaited DB call in `handleComplete`. A `popstate` fired during that window still shows the leave prompt on the success path.
3. **Steps 3, 4, 5 don't auto-save.** Only steps 1 & 2 call `persistPartial`. Resuming after a refresh on Step 4 loses the contact info entered on Step 3 (it lives only on `profiles`, but the wizard doesn't re-pull it back into local state on resume).
4. **No "Save & exit" action.** The dialog only offers Stay / Leave (which discards work-in-progress on the current step).
5. **Loop risk.** `popstate` re-pushes the sentinel; if a confirmed Leave fires another popstate before the listener is removed, or if the user mashes Back, we could re-prompt. Need an `isLeaving` latch and a single source of truth for "should we guard?".
6. **No tests** covering any of this.

## Plan

### 1. Fix `isDirty` (no more false positives)

- Capture a `baselineRef` snapshot of all field values right after the prefill + resume effects settle (use a small `baselineReady` flag set on the next tick once the resume + prefill effects have run).
- `isDirty = baselineReady && JSON.stringify(currentFields) !== baselineRef.current`.
- After each successful `persistPartial`, refresh the baseline so just-saved values stop counting as dirty.

### 2. Flip the guard off the moment completion starts

- Set `completedRef.current = true` at the very top of `handleComplete` (before any awaits).
- Also add an `isLeaving` ref set to `true` when the user confirms Leave or Save & exit, so the guard short-circuits during the actual navigation.

### 3. Auto-save on every step

- Extend `persistPartial` to also write the step-3 fields it owns:
  - `profiles.full_name` / `profiles.phone` (already done in `handleComplete` — move into `persistPartial` so step-3 Continue persists immediately).
- Hit `persistPartial` on Continue for steps 1, 2, 3, 4 (4 already has `logoUrl` saved, just call it). Step 5 still funnels through `handleComplete`.
- On resume, also re-hydrate contact fields from `profiles` (the existing `profile` query already runs — extend the prefill effect to set values from `profile` instead of skipping when present).
- After each successful save, update `baselineRef` so the wizard becomes "clean" again.

### 4. "Save & exit" in the leave dialog

- Add a third button to the AlertDialog footer: **Save & exit**.
- Behaviour: call `persistPartial()` (without `setup_complete`), show toast "Setup saved — pick up here later", set `isLeaving` ref, then navigate to `/account` (or `-1` if there's history). If the save fails, keep the dialog open and surface the error.
- Disabled when on Step 1 with invalid name (can't satisfy NOT NULL).

### 5. Loop-proof popstate handler

- Single `useEffect` with these refs:
  - `guardArmedRef` — true while `isDirty && !completedRef.current && !isLeaving.current`.
  - `sentinelPushedRef` — track whether our sentinel is currently the top entry so we never double-push.
- On mount: push sentinel once. On unmount or when guard becomes disarmed: remove listener, no extra `history.go`.
- When confirming Leave: set `isLeaving.current = true`, remove the popstate listener *before* `history.go(-1)` so the resulting popstate isn't intercepted.
- When user opens the dialog via the in-header Back button (not via popstate), confirming Leave just calls `navigate(-1)` directly — no popstate trickery.

### 6. Tests

Use the existing Vitest setup. New file: `src/pages/business/BusinessPageWizard.test.tsx`.

Mock surface:
- `@/integrations/supabase/client` — minimal chainable `from(...).select(...).maybeSingle()` / `update().eq()` / `insert().select().single()` stubs returning canned data; `storage.from().upload()` no-op.
- `@/contexts/AuthContext` — return `{ user: { id: "u1", email: "u1@test.com" } }`.
- `@/hooks/useUserProfile` — return prefilled profile.
- `react-router-dom` — wrap in `MemoryRouter`; spy on `useNavigate`.

Cases:
1. **Clean state doesn't prompt** — render, prefill runs, press in-header Back on Step 1 → no dialog, navigate(-1) called immediately.
2. **Dirty state prompts on header Back** — type into business name, press Back → dialog opens.
3. **Dirty state prompts on browser Back** — type into business name, dispatch a `popstate` → dialog opens; assert sentinel is re-pushed (history.length unchanged).
4. **Stay keeps you on page** — open dialog, click Stay → dialog closes, no navigate call, fields preserved.
5. **Leave navigates exactly once** — open dialog (popstate path), click Leave → exactly one history pop / navigate call; firing another popstate after does NOT reopen dialog (no infinite loop).
6. **Save & exit calls persist + navigates** — click Save & exit → `supabase.from('store_profiles').insert` called with `setup_complete: false`, success toast, navigate called.
7. **Completion disarms the guard** — fill all required fields, click "Go to dashboard"; while submission is pending, fire popstate → no dialog. After completion, navigate to resolved dashboard route.
8. **Refresh / beforeunload** — assert `beforeunload` listener is registered when dirty and removed when clean.
9. **Resume restores state** — mount with a stubbed existing partial row → Step set to 3, name/phone/category/logo prefilled, baseline reflects loaded values so wizard is NOT dirty on mount.
10. **Auto-save on each Continue** — simulate Continue from steps 1, 2, 3, 4 → assert `persistPartial` (i.e. `store_profiles` update) called each time with the right payload, and `profiles.update` called on step 3.

### 7. Minor cleanups

- Move `persistPartial` and the slug helper into a small extractable function returning a `{ id, error }` tuple so the test can also unit-test the slug-collision path without mounting React.
- Add a typed `WizardSnapshot` interface for the JSON.stringify baseline.

## Files

- **edit** `src/pages/business/BusinessPageWizard.tsx` — fixes 1–5 above.
- **new** `src/pages/business/BusinessPageWizard.test.tsx` — 10 test cases above.
- **new (small)** `src/pages/business/wizardPersistence.ts` — extracted `persistPartial` + `findAvailableSlug` for unit-test isolation.
- **new** `src/pages/business/wizardPersistence.test.ts` — slug collision + 23505 paths.

## Out of scope

- Database schema changes. We continue *not* writing `email` to `store_profiles`.
- Restyling the dialog. Just adds one more button.
- Capacitor hardware-back integration on native — out of scope for this round (web `popstate` covers it via Capacitor's back-button-emits-popstate behaviour by default).

## Acceptance

- Open `/business/new`, press Back without typing → leaves immediately, no dialog.
- Type a name, press Back → dialog with Stay / Save & exit / Leave.
- Save & exit persists, toasts, and lands you on `/account`.
- Pressing Leave then Back again does not loop — you actually navigate away.
- Completing step 5 navigates to the dashboard with no leave prompt.
- Refreshing mid-flow restores you to the next incomplete step with prior values intact.
- All 10 + 2 tests pass via `bunx vitest run`.