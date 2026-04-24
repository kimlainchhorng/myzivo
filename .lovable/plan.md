## Goal
Restore reliable swipe/drag-down close behavior for the fullscreen post viewers, so users can dismiss them by pulling down instead of only tapping the close button.

## What I will change

1. Unify dismissal behavior across all post viewers
- Update `src/components/profile/ProfileContentTabs.tsx` post-detail overlay to support drag-down-to-close.
- Update `src/pages/PublicProfilePage.tsx` post-detail overlay to support the same drag-down-to-close behavior.
- Harden `src/pages/ReelsFeedPage.tsx` post-detail viewer so swipe-down still works even when the content area scrolls.

2. Use one shared interaction pattern
- Add a shared close threshold matching existing sheet/reels behavior (offset/velocity based).
- Keep close-button support, but make swipe-down work from the header/top gesture region consistently.
- Avoid relying on full-surface drag when the inner area is scrollable, because that can block or fight the dismiss gesture.

3. Preserve the safe-area work already done
- Keep all viewer headers and close buttons on `var(--zivo-safe-top-overlay)`.
- Make the draggable top region safe-area aware so the gesture handle stays below the status bar/notch.

4. Re-test the affected screens
- Re-check:
  - `/profile` post viewer
  - public profile post viewer
  - `/reels` post-detail viewer
- Confirm both close methods work:
  - tap X/back
  - drag/swipe down from the top region

## Technical details

### Root cause found
There are currently three different implementations:

- `ProfileContentTabs.tsx`
  - fullscreen post viewer has no swipe-dismiss logic at all
- `PublicProfilePage.tsx`
  - fullscreen post viewer has no swipe-dismiss logic at all
- `ReelsFeedPage.tsx`
  - post-detail viewer uses outer `drag="y"`, but the inner scroll container/header touch behavior can prevent the dismiss gesture from triggering reliably

That matches the symptom: the user can sometimes move things visually, but the close action does not complete.

### Implementation approach
I will convert these viewers to a consistent pattern:

```text
fullscreen overlay
├─ safe-area header / grab zone   <- drag starts here
├─ media/content area             <- normal scroll/tap behavior
└─ bottom action area
```

Planned mechanics:
- Use Framer Motion drag on the overlay container or a dedicated top grab zone.
- Trigger close when:
  - downward offset passes threshold, or
  - downward velocity passes threshold.
- Keep `touchAction: 'none'` only on the drag-start region.
- Keep `touchAction: 'pan-y'` on scrollable content so reading/comments still scroll naturally.
- If needed, extract a tiny shared helper for close thresholds to keep the three viewers aligned.

### Runtime issue to fix while touching this area
The preview also captured a runtime error:
- `Cannot read properties of null (reading 'useContext')`
- stack points to `useNavigate` inside `ProfileContentTabs.tsx`

I will verify and fix that root cause if it is still reproducible after the viewer refactor, since it affects the same screen.

## Files likely to edit
- `src/components/profile/ProfileContentTabs.tsx`
- `src/pages/PublicProfilePage.tsx`
- `src/pages/ReelsFeedPage.tsx`
- possibly a small shared helper if needed

## Verification
After implementation I will verify:
- `/profile`: open a post, swipe down from the top/header, overlay closes
- `/profile`: close button still works
- public profile viewer: same behavior
- `/reels` post-detail: swipe down reliably closes even after scrolling content
- safe-area spacing remains correct on the close/header area