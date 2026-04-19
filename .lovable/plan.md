
Goal: fix the Go Live back button so it always leaves `/go-live`, even when the page was opened directly and there is no usable browser history.

What’s actually wrong:
- The button in `src/pages/GoLivePage.tsx` currently does `navigate(-1)`.
- In the screenshot, the preview is already loaded directly on `/go-live`, so there may be no prior app route to go back to.
- That means the click can fire correctly and still appear to “do nothing.”
- The earlier `pointer-events-none` overlay fix may be valid, but it does not solve the missing-history case.

Implementation plan:
1. Replace the raw `navigate(-1)` handler in `GoLivePage` with the shared `useSmartBack()` helper from `src/lib/smartBack.ts`.
2. Use a concrete fallback route for Go Live, likely `/live`, so:
   - if history exists: go back
   - if not: go to the live discovery page instead of staying stuck on `/go-live`
3. Keep the existing visual button, but make sure the button itself remains explicitly clickable above overlays.
4. Check other live-entry paths (`/pair/:token`, Live page, wallet/admin shortcuts) so the new fallback does not break those flows.

Files to update:
- `src/pages/GoLivePage.tsx`
  - import `useSmartBack`
  - create `const goBack = useSmartBack("/live")`
  - change the top-left back button to `onClick={goBack}`
- Possibly `src/lib/smartBack.ts`
  - only if needed to make history detection more reliable than plain `window.history.length`

Technical note:
- If needed, I’ll harden `useSmartBack()` to use a more reliable signal than `window.history.length` alone, because iframe/preview history can be misleading.
- Preferred behavior:
```text
/go-live back button
  -> previous in-app page if available
  -> otherwise /live
```

What I’ll verify after implementation:
- Open `/go-live` directly and tap back: should go to `/live`
- Enter `/go-live` from `/live` and tap back: should return to `/live`
- Enter via `/pair/:token` flow and tap back: should still leave the studio correctly
- Confirm the button is clickable on mobile viewport and not blocked by overlays
