## Goal

Make all 10 `BusinessPageWizard` component tests pass reliably, eliminate `act()` warnings, harden the leave-guard (no infinite loop, no prompt after completion), and surface an inline "Unsaved changes" indicator in the wizard header so users can see when leaving will warn them.

---

## Changes

### 1. `src/pages/business/BusinessPageWizard.tsx`

**a) Wrap async resume + baseline effects to be test-friendly**
- The two `useEffect`s that run async work (resume from `store_profiles` and the baseline `setTimeout`) currently fire setStates outside any user-driven action, which is what's producing the `act()` warnings and the timing flakiness. Restructure:
  - Move the baseline-setting from a `setTimeout(…, 0)` into a `useEffect` that runs **synchronously** once `checking === false` AND the prefill effect has had a chance to run. Use a `useLayoutEffect` (or a `useEffect` with no timer) keyed on `[checking, profile?.id, user?.id]` to set `baselineRef.current = JSON.stringify(snapshot)` and `setBaselineReady(true)` in one tick.
  - This removes the artificial 5ms wait the tests need and removes the `setTimeout`-induced act warnings.

**b) Save & exit on step 1 with empty form**
- Currently the Save & exit button is disabled when `step === 1 && !canContinue()`. The test "persists progress and navigates to /account on Save & exit" fills only basics (which makes step 1 valid), so this should already pass — but only after the baseline timing fix. Keep the disabled rule (correct UX) and update the test (see test changes) to ensure step-1 fields are valid before clicking.
- Make `saveAndExit` call `persist({ persistProfile: false })` when `step < 3` and not gate on `canContinue()` for steps ≥ 2.

**c) Guard hardening — prevent infinite popstate loop**
- Add `isLeavingRef` early-out at the **top** of the popstate handler (already present) AND set `isLeavingRef.current = true` synchronously inside `confirmLeave` **before** removing the listener via the effect's `armed` flag.
- Move sentinel push to only happen the first time the guard arms; on re-arm (after Stay), don't double-push.
- After `confirmLeave` and after `handleComplete` succeeds, also call a small `disarmGuard()` helper that clears the listener immediately (so the next `popstate` does nothing). This matches what the "Leave navigates exactly once" and "completion disarms guard" tests assert.

**d) Inline "Unsaved changes" indicator**
- In the header (next to the "Step X of 5" line), conditionally render a small chip when `isDirty` is true:
  ```tsx
  {isDirty && (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Unsaved changes
    </span>
  )}
  ```
- Hidden once the form matches baseline (e.g. right after a successful auto-save) or after completion.

**e) Don't prompt after final step**
- `completedRef.current = true` is already set at the top of `handleComplete`. Also set it the moment the user clicks "Go to dashboard" / Skip on step 5 → confirmed by the existing logic. Verify the popstate handler bails when `completedRef.current` is true (it does). No additional change required beyond ensuring `isDirty` returns false when `completedRef.current` is true (already the case).

---

### 2. `src/pages/business/BusinessPageWizard.test.tsx`

**a) Replace the 5ms timer waits with `findBy*` queries**
- Remove `await act(async () => { await new Promise((r) => setTimeout(r, 5)); });` lines.
- Instead, in `waitReady()`, after asserting "business basics" is visible, wait for the baseline to be ready by waiting for an element that depends on it — e.g. `await waitFor(() => expect(screen.getByLabelText(/full business name/i)).toBeEnabled())` — or expose a `data-baseline-ready` attribute on the form root and `await screen.findByTestId('wizard-form[data-baseline-ready="true"]')`.

**b) Save & exit test — make persist trigger reliably**
- After `await fillBasics()`, also fire-change to ensure the React state has flushed before clicking Back. Use `await waitFor(() => expect(screen.getByRole('button', { name: /save & exit/i })).toBeEnabled())` before the click.
- This guarantees step-1 validity → button enabled → `persist` fires.

**c) New test: leave dialog does NOT appear after final step (popstate after completion)**
- Already covered by the "completion disarms guard" test. Strengthen it: also fire a header back click after completion and assert `screen.queryByText(/leave business setup/i)` is null.

**d) New test: rapid repeated popstate doesn't cause infinite loop**
- After `fillBasics()`, dispatch 3 consecutive `popstate` events in `act(...)` and assert only **one** dialog is open and `navigateSpy` was not called. Then click Leave and dispatch another popstate; assert dialog stays closed and navigate count is exactly 1.

**e) New test: "Unsaved changes" chip visibility**
- On render: assert chip is NOT in the document.
- After `fillBasics()`: assert `screen.findByText(/unsaved changes/i)` resolves.
- After clicking Continue (which auto-saves and updates baseline): assert the chip disappears via `waitFor(() => expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument())`.

**f) Wrap any remaining state-causing dispatches in `act`**
- Already used for `popstate`. Ensure all `fireEvent.click` on buttons that fire async `persist` are awaited via `await waitFor(...)` for the post-condition rather than fixed timers.

---

### 3. Run and iterate

- Run `bunx vitest run src/pages/business/BusinessPageWizard.test.tsx src/pages/business/wizardPersistence.test.ts`.
- Confirm all 10+ component tests + 10 persistence tests pass and no `act()` warnings appear.

---

## Files

- `src/pages/business/BusinessPageWizard.tsx` — baseline-effect fix, guard disarm helper, inline "Unsaved changes" chip in header.
- `src/pages/business/BusinessPageWizard.test.tsx` — remove sleep-based waits, add chip visibility test, add infinite-loop test, harden Save & exit test.

No new files. No schema changes.
