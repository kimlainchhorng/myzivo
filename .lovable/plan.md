

# Room photo viewer: LQIP, hints, counter, zoom & full-screen

Five upgrades layered onto `LodgingRoomDetailsModal.tsx` plus one new full-screen viewer component. No DB or upload changes — purely viewer polish.

## 1. Blurred LQIP placeholders

While each photo loads, show a blurred low-quality version instead of a flat skeleton:

- For Supabase-hosted images, request a tiny preview via the existing `/render/image/` transform (e.g. `?width=24&quality=20`) and render it `object-contain` with `filter: blur(20px) scale(1.1)` underneath the full image.
- Full image fades from `opacity-0` → `opacity-100` over 400ms; blurred layer fades out simultaneously.
- For non-Supabase URLs (or when the transform fails), fall back to the existing shimmer `Skeleton`.
- Helper: small `getLqipUrl(src)` util that detects Supabase storage URLs and rewrites the render path.

## 2. Swipe & keyboard hints + smooth transitions

- First time the modal opens in a session (tracked via `sessionStorage["lodging.gallery.hintsSeen"]`), overlay a 2-second auto-dismissing pill at the bottom of the carousel: `← → arrows · swipe to browse`.
- Permanent micro-hints: small `ChevronLeft`/`ChevronRight` ghost icons at the edges that gently pulse for the first 3 seconds, then fade to subtle (`opacity-30`).
- Smooth transitions: keep Embla `loop:true`, add `duration: 28` for snappier-but-smooth ease; cross-fade the active slide's image opacity on `select` event for an extra polished feel on top of Embla's translate animation.

## 3. Visible counter + caption strip (outside the image)

- Move the counter pill **out of the image overlay** into a dedicated strip directly below the carousel: `Photo 2 of 7` on the left, optional caption on the right.
- Caption sources, in priority: `photo.caption` (if photos become objects later), else inferred from filename (strip extension, replace `-`/`_` with spaces, title-case), else empty.
- Strip uses `text-[11px] text-muted-foreground` matching the high-density UI standard so it never competes with the photo.
- The in-image counter pill is removed so the photo is fully visible — the strip below replaces it.

## 4. Pinch-to-zoom + double-tap zoom (in-modal)

Inside the details modal carousel, add gesture-driven zoom on the active slide:

- New tiny `ZoomableImage` wrapper using pointer events:
  - **Pinch**: track two pointers, compute distance ratio → `transform: scale(s)` (clamped 1×–4×).
  - **Double-tap**: toggle 1× ↔ 2.5× centered on tap point.
  - **Pan when zoomed**: single-pointer drag translates within bounds.
- When `scale > 1`, Embla swipe is disabled (`api?.reInit({ watchDrag: false })` style — toggle a `panning` ref) so zoom-pan doesn't accidentally change slides. Reset to 1× on slide change.
- Small `100% / 250%` indicator appears top-left only while zoomed.

## 5. Full-screen photo viewer with zoom controls

New component `LodgingPhotoLightbox.tsx`:

- Triggered by an `Expand` (maximize) icon button in the carousel's top-right corner of the details modal.
- Renders a portal `Dialog` with `bg-black/95`, photo centered with `object-contain` filling the viewport (max `100vw`/`100vh`).
- Reuses `ZoomableImage` for pinch/double-tap.
- On-screen controls bar (bottom): `−` zoom out, `Reset`, `+` zoom in, divider, `Prev` / counter `2 / 7` / `Next`, divider, `X` close. All keyboard-accessible: `+`/`-`/`0` for zoom, arrows for nav, `Esc` to close.
- Same LQIP + fade-in treatment as the modal carousel for consistency.
- Preserves currently-viewed slide index when opening from the modal; on close, the modal's Embla scrolls back to that index so context is kept.

## Files

**Create**
- `src/components/lodging/LodgingPhotoLightbox.tsx` — full-screen viewer with zoom controls + keyboard nav.
- `src/components/lodging/ZoomableImage.tsx` — pointer-based pinch / double-tap / pan wrapper, shared by the modal carousel and the lightbox.
- `src/lib/lqip.ts` — `getLqipUrl(src)` Supabase render-transform helper + filename → caption inferer.

**Edit**
- `src/components/lodging/LodgingRoomDetailsModal.tsx` — wrap each slide in `ZoomableImage`, add LQIP layer, hint pill + edge chevrons, move counter to a caption strip below carousel, add Expand button that opens the lightbox, disable Embla drag while zoomed.

## Out of scope

- Per-photo captions stored in DB (inferred from filename for now).
- Thumbnail strip / filmstrip navigation in the lightbox (counter + arrows are enough for v1).
- Server-generated true LQIP base64 (uses Supabase render transform instead — no upload-time work).

