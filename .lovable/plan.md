# Profile page mobile polish — sticky header + parallax cover

Bring the mobile Account/Profile scroll experience closer to Facebook by adding two effects that activate only below the `lg` breakpoint, leaving the desktop layout untouched.

## What you'll see on mobile

1. **Parallax cover photo** — as you scroll, the cover image moves up slightly slower than the page and gently scales/fades, giving a subtle depth effect (same trick Facebook/Instagram use).
2. **Sticky compact top bar** — once you scroll past the cover (~140px), a thin glass bar slides down from the top showing:
   - Back button (left)
   - Small avatar + display name + verified badge (center-left)
   - Notifications button (right, mirrors the existing one in the cover)
   The bar fades/slides out when you scroll back up to the top.

Desktop (`lg+`) is unchanged — same centered glass card, same existing parallax background.

## Technical changes (single file: `src/pages/Profile.tsx`)

1. **New scroll progress hook for sticky bar**
   - Add `const { scrollY } = useScroll({ container: scrollRef })` alongside the existing `scrollYProgress`.
   - Derive `stickyOpacity = useTransform(scrollY, [80, 160], [0, 1])` and `stickyY = useTransform(scrollY, [80, 160], [-12, 0])`.
   - Derive `coverY = useTransform(scrollY, [0, 240], [0, -60])` and `coverScale = useTransform(scrollY, [-100, 0], [1.15, 1])` for the parallax/rubber-band effect.

2. **Wrap the cover `<img>` / placeholder in a `motion.div`**
   - Apply `style={{ y: coverY, scale: coverScale }}` only on mobile by gating with a `lg:!translate-y-0 lg:!scale-100` override (or render a separate motion wrapper conditionally via `useIsMobile`).
   - Keep the existing reposition drag handlers on the outer container so cover repositioning still works.

3. **Add sticky compact header (mobile only)**
   - Insert a `motion.header` as the first child of the `PullToRefresh` container, positioned `fixed top-0 inset-x-0 z-40 lg:hidden`.
   - Apply `style={{ opacity: stickyOpacity, y: stickyY }}` and `pointer-events-none` when `stickyOpacity` ≈ 0 (use `useMotionValueEvent` to toggle a state, or just rely on opacity + `pointer-events-auto` always — acceptable since buttons under it remain reachable below threshold).
   - Layout: `h-14 px-3 flex items-center gap-3 bg-background/85 backdrop-blur-xl border-b border-border/40 safe-area-top`.
   - Contents:
     - Back button → `navigate(-1)` (uses existing `useNavigate`).
     - `Avatar` (size 8) with `profile?.avatar_url`.
     - `<span className="font-semibold text-sm truncate">{profile?.display_name}</span>` + `{profile?.is_verified && <VerifiedBadge size={14} />}`.
     - Right-aligned notifications bell that toggles `showNotifPanel` (reusing existing state).

4. **No new dependencies, no new files, no API changes.** Existing `framer-motion`, `VerifiedBadge`, `Avatar`, `ArrowLeft`, and `useNavigate` are already imported.

## QA checklist after implementation
- Mobile (≤1023px): sticky bar appears around 140px scroll, hides at top; cover image translates up while scrolling and rubber-bands on overscroll pull-to-refresh.
- Desktop (≥1024px): no sticky bar, cover unchanged, existing background parallax still works.
- Cover reposition mode still drags correctly (parallax should disable while `coverRepositioning` is true — gate `coverY`/`coverScale` to `0`/`1` when repositioning).
- Verified badge renders next to the name in the sticky bar when `is_verified` is true.
