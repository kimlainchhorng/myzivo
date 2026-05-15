## Goal
Make hizivo.com and the Zivo app measurably faster — focused on real-user metrics (LCP, INP, CLS, TTFB), not guesses.

## Phase 1 — Measure (no code yet)
1. Run a Lighthouse pass on the published URL (mobile + desktop) and capture LCP, INP, CLS, TBT, total JS, total image weight.
2. Add `web-vitals` reporting (tiny, ~2KB) sending p75 LCP/INP/CLS to console + an analytics endpoint so we see *real* user numbers, not lab.
3. Identify the top 3 bottlenecks from the report (likely candidates: hero image weight, third-party scripts, initial JS chunk, font loading).

## Phase 2 — High-impact wins (apply only what the report flags)
- **Images**: Convert hero/LCP image to AVIF + WebP via `vite-imagetools`; add `<link rel="preload" as="image" fetchpriority="high">` for the LCP image; ensure explicit width/height on all `<img>` to kill CLS.
- **Fonts**: `font-display: swap`, preload only the one weight used above the fold, subset if custom.
- **Third-party**: Defer/async all analytics + pixel scripts; load Meta/GA only after first interaction or `requestIdleCallback`.
- **Route splitting**: Verify heavy routes (FeedPage, ExplorePage, admin shell) are still lazy; preload only the landing chunk.
- **Supabase**: Add indexes for any query >200ms surfaced by `supabase--linter` or query analytics; batch parallel fetches on first paint.

## Phase 3 — Mobile/native (Capacitor)
- Enable WebView caching headers via `public/_headers` (already partially configured — extend `Cache-Control: public, max-age=31536000, immutable` on hashed assets).
- Preconnect to Supabase + image CDN in `index.html`.
- Confirm splash screen hides only after first meaningful paint, not after full hydration.

## Phase 4 — Validate
Re-run Lighthouse + check web-vitals dashboard after each change. Roll back any change that doesn't move the needle.

## Technical notes
- Skip premature micro-optimizations (already done: lucide-react no-barrel, IntersectionObserver, lazy admin, idle analytics).
- No new dependencies beyond `web-vitals` and `vite-imagetools` unless data justifies it.
- Each phase ships independently and gets published before the next.

## Deliverables
- Phase 1: a numbers report you can read.
- Phases 2–4: only the fixes the data demands.
