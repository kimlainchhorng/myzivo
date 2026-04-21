

# Fix: Sidebar header hidden when opening from a scrolled page (mobile)

## What the user sees
- Page at top → tap menu → sidebar shows store header (avatar + "AB Complete Car Care") at the very top ✅ (picture 2)
- Page scrolled down → tap menu → sidebar opens but the **store header is missing/cut off**, the drawer appears to start at "MANAGE" with a visible gap above it ❌ (picture 4)

## Real root cause
The previous passes treated this as "scroll inside the sidebar". It is not. The drawer's inner scroll is at 0 — the **store header is being pushed above the visible viewport**.

Two things combine to cause this on iOS Safari / mobile WebKit:

1. **Body scroll-lock uses `position: fixed; top: -${scrollY}px`.** When iOS Safari's visual viewport is offset (URL bar collapsed/expanded), a child with `position: fixed; top: 0` is anchored to the **layout viewport top**, not the **visual viewport top**. The layout viewport top can sit above the visible area, so the first ~80px of the sidebar (the brand header) is clipped off-screen.
2. **`h-[100dvh]`** is recomputed when the body lock toggles, but the aside is rendered before the lock fully applies, so its top edge can land in the wrong place for one frame and stay there because nothing re-measures.

Resetting `scrollTop` (the previous fix) cannot help — there is nothing to scroll; the entire header element is positioned outside the visible area.

## Fix (single file: `src/components/admin/StoreOwnerLayout.tsx`)

### 1. Replace `position: fixed` body lock with html-overflow lock
Switch the scroll-lock effect from `body { position: fixed; top: -scrollY }` to:
```
html.style.overflow = "hidden"
body.style.overflow = "hidden"
body.style.touchAction = "none"
```
…and restore on cleanup. This prevents background scroll **without changing the viewport's scroll offset**, so any `position: fixed` child (the aside + overlay) renders at true viewport top. No `window.scrollTo` needed on close, no visual jump, no header clipping.

### 2. Render the drawer + overlay in a portal at `document.body`
Wrap the mobile aside + backdrop with `createPortal(..., document.body)` so they are not nested inside the scrolled `min-h-screen` flex container. This guarantees their `fixed` coordinates are relative to the viewport regardless of any transformed/scrolled ancestor (a `transform`, `filter`, or `will-change` ancestor can also turn `fixed` into "fixed-to-ancestor"). The sticky desktop sidebar (`lg:sticky`) stays in the normal tree — only the mobile-drawer rendering goes through the portal.

### 3. Anchor the aside with explicit `inset-y-0`
Change the className from `top-0 left-0 h-[100dvh]` to `inset-y-0 left-0` so the aside is pinned to both top AND bottom of the viewport. If iOS recomputes viewport height mid-animation, the header stays anchored to top instead of riding a stale `100dvh` value.

### 4. Remove the now-obsolete scroll-reset machinery
With the header always visible at top, the elaborate `useLayoutEffect` + double-RAF + 3 setTimeouts can collapse to a single `resetSidebarScroll()` call inside `openSidebar`. Keep `onTransitionEnd` as a one-line safety net.

### 5. Keep existing behavior
- ESC, backdrop-click, and ChevronLeft still close the drawer
- Employees group still collapses on open unless an employee tab is active
- Desktop `lg:sticky` sidebar untouched

## Result
Opening the sidebar from any scroll position — top, mid-page, or bottom — shows the store header (avatar + name + ID) flush against the top of the screen, exactly like picture 2. No gap, no clipped header, no jump on close.

## Technical Details
- **Edited file:** `src/components/admin/StoreOwnerLayout.tsx` only
- **No new files, no new dependencies, no backend changes**
- **Imports added:** `createPortal` from `react-dom`
- **Build order:**
  1. Swap body `position:fixed` lock → html/body `overflow:hidden` lock
  2. Portal the mobile aside + backdrop to `document.body`
  3. Switch aside className to `inset-y-0`
  4. Trim scroll-reset effect to a single call

