# Make hizivo.com + Zivo app measurably faster

Web-vitals reporter is live. Rather than wait for field data, attack the three highest-leverage targets that already show up in the build output and HTML.

## 1. Shrink the initial JS bundle (~100 KB gzipped today)

- Audit `src/main.tsx` and the root `App.tsx`: anything not needed for first paint (analytics SDKs, Capacitor plugins on web, PostHog, Meta Pixel, remote config) moves behind `requestIdleCallback` or a route-level dynamic import.
- Move `BrandContext`, `RemoteConfigContext`, `UTMContext`, `TravelCartContext`, `ZivoPlusContext` providers so only what the landing page needs hydrates immediately; the rest mount on first navigation or idle.
- Verify every heavy route (Feed, Explore, Admin, FlightSearch, DuffelCheckout, WhiteboardPage, LiveKit screens) is `lazy()` and not pulled by an eager import chain. Run `rg "from \"@/pages/" src/App.tsx` style checks.

Expected: 30–50 KB gzip off the entry chunk → faster TTI on 4G.

## 2. Fix LCP on the landing page (`/index`)

- Identify the LCP element on `/index` (likely the hero image or headline).
- If image: add `<link rel="preload" as="image" fetchpriority="high">` in `index.html` for the exact file, set `loading="eager"` + `fetchpriority="high"` on the `<img>`, and ensure explicit `width`/`height` to kill CLS.
- Convert that single hero to AVIF + WebP (via `vite-imagetools` or one-time `sharp` conversion committed alongside the original).
- Confirm preconnects for Supabase + image CDN already exist in `index.html`; add if missing.

Expected: 0.5–1.5s LCP improvement on mobile.

## 3. Defer all third-party scripts until idle/interaction

- Audit `index.html` and `src/main.tsx` for GA, Meta Pixel, PostHog, Sentry, any tag manager. Each one should load via `requestIdleCallback` (already the pattern for web-vitals) or on first user interaction, never in the critical path.
- Keep the `<noscript>` pixel fallback in `<body>`, not `<head>` (HTML5 rule already in your stack notes).

Expected: removes 100–300 ms of main-thread blocking on first load.

## 4. Validate

- Re-publish, then run PageSpeed Insights on `https://hizivo.com` (mobile profile) and capture LCP/INP/CLS/TBT.
- Cross-check with the live `[vitals]` console lines on a real phone session.
- Roll back any change in steps 1–3 that doesn't move a metric.

## What this plan does NOT touch

- The 93 KB gzipped CSS — already audited, splitting it risks visual regressions for ~3–4 KB savings.
- Supabase queries — wait for real slow-query data from the Supabase linter before optimizing.
- Native Capacitor shell — perf wins there need physical device profiling, not blind edits.

## Technical notes

- No new runtime deps unless step 2 picks `vite-imagetools` (build-time only, zero runtime cost).
- Each step ships independently and gets published before the next, so wins are attributable.
- All edits stay in `src/main.tsx`, `src/App.tsx`, `index.html`, the LCP image's source path, and at most one new `vite.config.ts` plugin entry.
