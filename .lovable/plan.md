

# Sidebar polish — scroll memory, a11y, route-close, focus trap

Five upgrades to `src/components/admin/StoreOwnerLayout.tsx` (one new helper file). No backend, no new dependencies.

---

## 1. Per-tab scroll memory

Replace the unconditional "reset to top" behavior with **per-tab persistence**:

- Add `scrollMemoryRef = useRef<Record<string, number>>({})` keyed by `activeTab`.
- On nav scroll (`onScroll` handler on `<nav>`): `scrollMemoryRef.current[activeTab] = el.scrollTop`.
- When sidebar opens: restore `navRef.scrollTop = scrollMemoryRef.current[activeTab] ?? 0` (run after RAF so the drawer is laid out).
- When user switches tab via a nav button: leave memory intact for the previous tab; the next open of the same tab restores its position.
- First-ever open of a tab still lands at top (default 0), which preserves the picture-1 behavior the user fought for.

## 2. ARIA / screen-reader announcements

On the portaled drawer + backdrop:

- `<aside>` gets `role="dialog"`, `aria-modal="true"`, `aria-label="Store navigation"`, `aria-hidden={!sidebarOpen}`, and `tabIndex={-1}` so it can receive programmatic focus.
- Backdrop gets `role="presentation"` (interactive-but-decorative) and keeps `aria-hidden`.
- Hamburger button gets `aria-controls="store-owner-sidebar"`, `aria-expanded={sidebarOpen}`, `aria-label="Open navigation"`.
- Close (ChevronLeft) button gets `aria-label="Close navigation"`.
- Nav landmarks: `<nav aria-label="Store sections">`, group labels via `aria-labelledby` on the Manage / Team sections.

## 3. Auto-close on route / tab change

- Existing nav buttons already call `closeSidebar()` on click — keep that.
- Add an effect: `useEffect(() => { if (sidebarOpen) closeSidebar(); }, [activeTab])` so any external tab change (e.g. deep link, parent-driven change) also closes the drawer.
- Add an effect listening to `useLocation().pathname` from `react-router-dom`: close on pathname change. This catches browser-back, programmatic `navigate()`, and any sub-link not routed through `onTabChange`.

## 4. Focus trap for the mobile drawer

New small utility file `src/components/admin/useFocusTrap.ts` (mirrors the style of the existing `useFocusReturn`):

- Hook: `useFocusTrap(containerRef, active)`.
- When `active` flips true: query all focusable descendants (`a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])`), focus the first one, and attach a `keydown` listener on the container that intercepts `Tab` / `Shift+Tab` to wrap focus between first and last.
- On deactivate: removes the listener. Pairs with the existing `useFocusReturn` pattern (return focus to the hamburger button).
- Wire `useFocusTrap(asideRef, sidebarOpen)` and `useFocusReturn(sidebarOpen)` into `StoreOwnerLayout`.

## 5. iOS Safari verification (post-fix QA)

After implementation, use the browser preview tool at 390×844, navigate to `/admin/stores/a914b90d-c249-4794-ba5e-3fdac0deed44`, scroll the page to the bottom, tap the hamburger, and screenshot to confirm the store header (avatar + "AB Complete Car Care" + ID) is flush with the top of the viewport. If the header is clipped, fall back to wrapping the portaled aside in a `top: env(safe-area-inset-top)`-aware container — but the existing `inset-y-0` + portal-to-body fix should already pass.

---

## Files

- **Edit** `src/components/admin/StoreOwnerLayout.tsx` — add scroll memory ref + onScroll handler, swap unconditional reset for restore, add ARIA attributes, add route/activeTab close effects, wire focus trap + focus return.
- **Create** `src/components/admin/useFocusTrap.ts` — ~40-line focus trap hook.

## Build order

1. Create `useFocusTrap.ts`.
2. Add scroll memory + restore logic, replacing the reset-to-zero on open.
3. Add ARIA attributes and IDs across drawer, backdrop, hamburger, close button, nav.
4. Add route/`activeTab` auto-close effects.
5. Wire `useFocusTrap` + `useFocusReturn` in the layout.
6. Browser-preview QA at 390×844 from a scrolled page; screenshot to confirm header is at top.

