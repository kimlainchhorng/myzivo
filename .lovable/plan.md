

## Speed Optimization Plan — Web & Mobile App

The app is slow because of heavy upfront work on first paint: too many providers wrapping every route, an external Travelpayouts (`emrld.ltd`) script loading early, the home page rendering 15+ lazy sections (each with its own Suspense + IntersectionObserver) immediately, and large vendor chunks. Here's what I'll fix.

### What you'll notice
- Home page becomes interactive 1–2 seconds faster
- Smoother scrolling on the mobile feed/home
- Lower data usage (fewer scripts on first load)
- Faster route changes (better prefetch + smaller chunks)

### Changes

**1. Defer the Travelpayouts script (`emrld.ltd`)**
Currently loaded near page start — it shows up in your session replay before the hero finishes painting. Move it behind `requestIdleCallback` with a 3-second timeout and skip it on Capacitor native + on non-flight pages. Saves ~150–300 ms on LCP.

**2. Trim above-the-fold work on the desktop home (`Index.tsx`)**
The desktop home renders `LiveTripTracker`, `TrendingNearYou`, `AISmartDeals`, `DesktopHotDeals`, `PriceAlertsWidget` PLUS 12 below-fold sections — all with their own Suspense wrappers. I'll:
- Keep only `HeroSection`, `HeroSearchCard`, `ServicesShowcase`, `StatsSection` eager
- Wrap the rest behind `LazySection` with `rootMargin: "200px"` so they load just-in-time, not eagerly
- Remove duplicated padding wrappers that trigger extra layout passes

**3. Mobile home (`AppHome` / `DriverHomePage`)**
Add `content-visibility: auto` to off-screen card sections so the browser skips rendering work until they scroll near. Big win on low-end Android.

**4. Bundle splitting (`vite.config.ts`)**
- Split `vendor-radix` (currently one fat chunk with 8 packages) into 2 chunks: dialogs/popovers vs. the rest
- Add `lucide-react` to its own chunk so icons cache separately and don't re-download on every deploy
- Add `vendor-query` for `@tanstack/react-query`

**5. Route prefetch tuning (`RoutePrefetcher.tsx`)**
- Remove the auto-prefetch of `/flights /hotels /cars` after 2 s on homepage (it competes for bandwidth with hero images). Keep prefetch only on hover/focus of nav links.
- Add prefetch for `/feed` (the desktop redirect target) on auth resolve.

**6. React Query defaults**
Set `staleTime: 60_000` and `refetchOnWindowFocus: false` globally — currently every focus triggers refetches across all hooks, causing the "feels slow" jank when switching tabs.

**7. Image optimization**
- Add `loading="lazy"` and `decoding="async"` to all home-section `<img>` tags missing them
- Add `fetchpriority="high"` to the single hero LCP image only

**8. Drop unused providers on auth-only routes**
`CurrencyProvider`, `CustomerCityProvider`, `BrandProvider`, `ZivoPlusProvider`, `RemoteConfigProvider` all run on every route including `/login`. I'll keep them at the root but make their initial fetches `enabled: !!user` so unauthenticated users don't wait on profile/brand/remote-config queries.

### Files I'll edit
- `index.html` — defer emrld.ltd, fix script ordering
- `src/pages/Index.tsx` — wrap power sections in LazySection
- `src/pages/driver/DriverHomePage.tsx` + `src/pages/app/AppHome.tsx` — content-visibility
- `vite.config.ts` — chunk splits
- `src/components/shared/RoutePrefetcher.tsx` — remove eager prefetch
- `src/App.tsx` — query client defaults, gated provider fetches
- 4–6 home section components — image attributes

### Out of scope
No visual/layout changes. No removed features. No backend changes.

