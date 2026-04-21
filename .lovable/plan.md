

# Fix: Sidebar opens scrolled to bottom instead of top

## Problem
On `/admin/stores/:id` (and other store-owner pages), when you scroll the page down and then tap the hamburger to open the sidebar, the sidebar's inner nav list is scrolled to the bottom (picture 4) — hiding the store header and "Profile" item. It should always open at the top (picture 1).

## Root cause
`StoreOwnerLayout.tsx` resets `asideRef.scrollTop` and `navRef.scrollTop` inside a `useLayoutEffect` that fires the moment `sidebarOpen` becomes `true`. At that instant the panel is still translated off-screen (`-translate-x-full`) and the browser hasn't laid out the inner `<nav>` yet, so the reset is silently dropped on some mobile browsers. The `onTransitionEnd` fallback only fires reliably for the `aside`'s transform, not for the nested scroll container, leaving `<nav>` at whatever scroll position it inherited from a previous open.

## Fix (single file: `src/components/admin/StoreOwnerLayout.tsx`)

1. **Reset scroll synchronously before paint AND on next two animation frames.** Run `resetSidebarScroll()` immediately, then again inside a double `requestAnimationFrame` after `sidebarOpen` flips to `true`. This guarantees the reset takes effect once the sheet has been laid out and is scrollable.

2. **Reset on every open, on every nested scroll container.** Walk all scrollable descendants of `asideRef` (nav + any inner scroll wrappers) and set `scrollTop = 0`, not just the two known refs.

3. **Also reset on `onTransitionEnd` for both transform and the nav element**, keeping the existing safety net.

4. **Collapse the Employees group to its default state on open** so the drawer always reveals the same first screen (header + Profile … Live Stream) regardless of prior interaction. Only collapse if the active tab is not inside the employees group.

## Result
Opening the sidebar from any scroll position now always shows the store header and the top of the Manage list — matching picture 1, never picture 4.

## Technical Details
- **Edited file:** `src/components/admin/StoreOwnerLayout.tsx` only
- **No new files, no dependencies, no backend changes**
- **Build order:** single edit, ~15 lines changed in the existing reset logic

