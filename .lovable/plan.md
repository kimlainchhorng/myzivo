# Speed up ZIVO website and mobile app

I checked the live preview on mobile size and confirmed the app is loading too much before users see content.

## What I found

Tested routes:
- `/` website homepage on mobile viewport
- `/index` mobile app entry route
- `/feed` main social/feed route

Measured issues:
- Homepage mobile FCP: about **9.4s**
- Mobile `/index` FCP: about **8.3s**
- Feed FCP: about **14.3s**
- Each route loads around **250 resources**
- Almost all are JavaScript files
- `src/App.tsx` is large: **1,122 lines**, about **410 lazy route imports**
- `lucide-react` loads early and is one of the biggest files
- `@supabase/supabase-js`, `App.tsx`, and `index.css` are also heavy on startup
- Global providers and listeners mount before the first screen is visible
- Console shows repeated React warnings from the app tree, adding extra dev-time overhead

Main reason it feels slow: the app loads the full super-app shell, many providers, icons, routes, and listeners before showing the first usable screen.

## Fix plan

### 1. Make first screen load faster
- Keep only the minimum first-screen components eager.
- Lazy-load lower homepage sections.
- Add lightweight skeleton placeholders so the page appears quickly.
- Remove heavy animation library usage from first-screen homepage/mobile app components where possible and replace with CSS transitions.

### 2. Reduce startup JavaScript
- Split the huge route table in `src/App.tsx` into smaller lazy route groups:
  - admin routes
  - driver routes
  - shop/merchant routes
  - travel routes
  - social/chat routes
- This prevents every visitor from paying the parse cost of routes they are not opening.

### 3. Defer background services
Move non-critical startup work until after the page is visible:
- push notification bootstrap
- verification realtime bridge
- geofence notifications
- deletion return dialog
- story debug panel
- geo detection
- page analytics tracking
- cookie/PWA/global overlays where safe

Authenticated users will still get these features, but after the first paint instead of before it.

### 4. Fix mobile app route startup
- Optimize `/index` so the mobile home loads only mobile-home code first.
- Delay unused homepage/desktop widgets on mobile.
- Keep safe-area and Capacitor behavior intact.

### 5. Optimize icon loading
- Replace above-fold `lucide-react` barrel imports with direct icon imports.
- Keep Lucide icons, but stop loading the large icon bundle during first paint.

### 6. Improve image and asset delivery
- Preload the main LCP image.
- Add explicit image sizes to prevent layout shift.
- Ensure hero/service images use WebP/optimized sources.
- Keep long-cache rules for hashed assets.
- Adjust HTML caching safely for faster repeat visits.

### 7. Clean console/runtime warnings
- Fix the React ref warning in the app tree.
- This will reduce noisy console work and make future performance debugging cleaner.

### 8. Validate after changes
After implementation, I will run:
- mobile `/`
- mobile `/index`
- mobile `/feed`
- desktop `/feed`
- build/type check if available

Target improvement:
- First visible content under **3–4 seconds** in preview/dev conditions
- Fewer initial JS resources
- Lower script/task duration
- Faster repeat visits

## Files expected to change

- `src/App.tsx`
- route split files under `src/routes/`
- `src/pages/Index.tsx`
- `src/pages/app/AppHome.tsx` if needed
- `src/components/home/*` first-screen components
- `src/main.tsx`
- `index.html`
- `public/_headers`
- possibly small utility file for deferred/idle mounting

No database changes are needed.

Approve this and I will implement the speed fixes directly.