## Problem

On initial open, the New Group sheet's "Create Group" button is clipped below the visible area on iOS Safari. Picture 2 shows that once you touch & scroll the page, Safari recalculates the viewport, the bottom toolbar collapses, and the button becomes visible. So the fix isn't more padding — it's making the modal use the **dynamic viewport height** that always matches the visible area.

Root cause in `src/components/chat/CreateGroupModal.tsx`:

```tsx
<motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
```

`fixed inset-0` resolves to `100vh` on iOS Safari, which is the *large* viewport height (excluding the dynamic bottom toolbar). When the toolbar is visible, the bottom of the overlay (and the bottom-aligned sheet) extends past the visible screen — hiding the Create button until the user scrolls and Safari recalculates.

## Fix

In `src/components/chat/CreateGroupModal.tsx`, change the overlay container to use `100dvh` instead of `inset-0` so it always matches the *visible* viewport:

```tsx
// Before
<motion.div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" ...>
  <div className="absolute inset-0 bg-black/50" />

// After
<motion.div
  className="fixed inset-x-0 top-0 z-[60] flex items-end sm:items-center justify-center w-full"
  style={{ height: "100dvh" }}
  ...
>
  <div className="absolute inset-0 bg-black/50" />
```

Also keep the existing `pb-[max(1rem,env(safe-area-inset-bottom))]` on the footer (already done) so the button clears the iOS home indicator.

No design or behavior changes — purely a viewport-height fix that makes the Create button visible the moment the sheet opens.
