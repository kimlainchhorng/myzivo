# SEO and marketing audit — September 2026

Scope: the `zivosmedia` web app (zivosmedia.com). The five sibling ZIVO repos
are out of scope here, and app-store listing work (ASO) is blocked upstream —
`com.myzivo.app` and `com.hizovo.app` are both suspended on Google Play with
appeal 5-6274000042114 outstanding, so store metadata cannot be improved until
that resolves.

## What shipped

### The sitemap is generated from the router

`public/sitemap.xml` was hand-maintained and had drifted. It advertised:

| URL | What a crawler actually got |
| --- | --- |
| `/eats`, `/referrals` | A login wall — both sit behind `ProtectedRoute` |
| `/rides`, `/terms`, `/ground-transport` | A client-side redirect |
| `/hotels/in-london` **and** `/hotels/london` | The same page under two URLs |
| `/car-rental/in-miami` **and** `/rent-car/miami` | The same page under two URLs |

`scripts/seo/route-inventory.mjs` parses `src/App.tsx` read-only and partitions
all 706 routes into indexable / no-index / dynamic / redirect. It resolves
computed declarations (`path={SOCIAL_ROUTE_PATHS.feed}`) and collapses duplicate
declarations the way React Router does — first wins — which is what exposed the
dead `/events` and `/places` redirects sitting behind live pages.

`npm run seo:sitemap` builds the sitemap from that partition plus
`src/config/programmaticSEO.ts`: **382 URLs, up from 170**, one canonical URL
shape per entity, and `lastmod` taken from each page's own git history rather
than the build date. Where a date cannot be derived the tag is omitted — an
absent `lastmod` beats an invented one.

### robots.txt blocks the signed-in app

293 routes that only ever render for a signed-in user were crawlable, including
the whole `/account`, `/chat`, `/shop-dashboard` and `/personal` families.
`/account` and `/chat` were disallowed **only** inside the `GPTBot` and
`ClaudeBot` groups, so Googlebot was free to crawl them while the AI crawlers
were not.

`npm run seo:robots` rewrites a delimited block inside `User-agent: *`.
Rules collapse to a prefix only when nothing crawlable starts with that string —
robots.txt matches raw prefixes, not path segments, so `Disallow: /app` would
also block `/apply`. That check keeps `/shop` and `/grocery` per-path (each
mixes a public landing page with signed-in surfaces) and stops `/c` from
blocking the public `/c/:handle` channel pages.

### The two files can no longer contradict each other

Six URLs were about to be advertised while robots.txt disallowed them —
`/profile`, `/driver`, `/flights/results`, `/flights/live`, `/rent-car/results`,
`/rent-car/detail`. Google reports that pair as *"Indexed, though blocked by
robots.txt"*: it keeps the URL, never reads the page, and lists it with no
description. The sitemap generator now reads robots.txt and treats it as the
final say.

### A gate that keeps all of it true

`npm run qa:seo-contracts` — 1,627 checks — is wired into `platform:audit` and
`release:gate`, alongside `seo:sitemap:check` and `seo:robots:check`. It fails
the build when any of the above regresses, applies the same rules to
`public/llms.txt` (the AI-crawler index, which pointed at login-walled `/eats`
and `/rides`), and parses every JSON-LD block in `index.html`.

## Marketing attribution was dark in production — action needed

`src/config/marketingRuntimeConfig.ts` fills the `zivo-*` meta tags from Vite
env vars, and `public/analytics-bootstrap.js` reads those tags after consent.
The machinery is wired and tested. But **no production deploy workflow passed a
single marketing env var**, so every pixel shipped empty:

- Google Analytics 4 — no sessions, no conversions, no audience data
- Google Ads — no conversion tracking, so ad spend cannot be attributed
- Meta and TikTok pixels — no remarketing audiences
- Google AdSense — no ads served, so no ad revenue at all

Both `deploy-cloudflare-production.yml` and `deploy-production.yml` now pass
them to the build step. They are intentionally **optional** — an unset secret
ships an empty meta tag and the bootstrap skips that pixel — so nothing breaks
if a value is missing.

**To turn attribution on**, add these as GitHub repository secrets:

| Secret | Where to get it | Format |
| --- | --- | --- |
| `VITE_GOOGLE_ANALYTICS_ID` | GA4 → Admin → Data streams | `G-XXXXXXX` |
| `VITE_GOOGLE_ADS_ID` | Google Ads → Tools → Conversions | `AW-XXXXXXXXX` |
| `VITE_META_PIXEL_ID` | Meta Events Manager | numeric |
| `VITE_TIKTOK_PIXEL_ID` | TikTok Events Manager | alphanumeric |
| `VITE_X_PIXEL_ID` | X Ads → Events Manager | alphanumeric |
| `VITE_GOOGLE_ADSENSE_CLIENT` | AdSense → Account → Settings | `ca-pub-XXXXXXXX` |

Nothing is measurable until at least `VITE_GOOGLE_ANALYTICS_ID` is set — that
one is the prerequisite for judging whether any of the SEO work above moved
traffic.

## Backlog

Ordered by expected value. Each entry says why it was not done in this pass.

### 1. Reels have no crawlable URL of their own

`/reels` serves the reels surface, but individual reels only exist at
`/reels/:postId`, and no listing page links them, so the entire short-video
library is invisible to search. `VideoObject` structured data on reel pages plus
a video sitemap is the standard fix. Needs a data-backed listing route, so it is
product work, not a config change.

### 2. Duplicate URL shapes still resolve

`/hotels/in-london` and `/flights/cities/london` still render alongside their
canonical forms. They are out of the sitemap, but they self-canonicalise:
`SEOHead` defaults `canonical` to `location.pathname`, so each duplicate still
declares itself canonical. The fix is a canonical-normalisation map in
`SEOHead`, or 301s at the edge in `cloudflare/worker.ts`. Not done here because
it touches request handling on the live domain and deserves its own change.

### 3. Eight admin routes are not behind `ProtectedRoute`

`/admin/cafe-qr-sheet/:storeId`, `/admin/cafe-summary/:storeId/:date`,
`/admin/salon-queue/:storeId`, `/admin/salon-receipt/:bookingId`,
`/admin/salon-schedule/:storeId/:date`, `/admin/salon-summary/:storeId/:date`,
`/admin/stores/:storeId/car-rental-daily-sheet` and
`/admin/stores/:storeId/car-rental-receipt/:reservationId` take an id straight
from the URL with no route-level guard. They are print/receipt views, so this
may be deliberate — but it is a security question, not an SEO one, and needs a
look at whether the components check authorisation themselves.

### 4. `sameAs` lists no social profiles

The `Organization` schema in `index.html` links only zivosmedia.com and the App
Store listing. `sameAs` is how Google ties the entity to its Facebook,
Instagram, X, LinkedIn, TikTok and YouTube profiles. Left alone because the
profile URLs are not in the repo and must not be guessed.

### 5. No hreflang despite four languages

The app supports English, Khmer, Arabic and French, but language is switched
client-side with no distinct URLs, so there is nothing for `hreflang` to point
at. Real localised URLs (`/km/...`) would have to come first.

### 6. `/` redirects to `/feed` above 1024px

`src/pages/Index.tsx` renders `AppHome` on mobile and `<Navigate to="/feed">` on
desktop. Google indexes mobile-first so this is not urgent, but the canonical
homepage redirecting on desktop is worth revisiting.

### 7. `getCarRentalCityUrl` returns a dead path

`src/config/programmaticSEO.ts` builds `/car-rentals/{slug}`, but no such route
exists — the real ones are `/rent-car/:city` and `/car-rental/:city`. The
function currently has no callers, so nothing is broken; fix or delete it before
someone uses it.

### 8. `RouteSEOHeader.tsx` has zero usages

`src/components/seo/RouteSEOHeader.tsx` is imported nowhere. Wire it up or
delete it.

## Commands

```bash
npm run seo:robots        # regenerate the robots.txt block (run first)
npm run seo:sitemap       # regenerate the sitemap from the router
npm run qa:seo-contracts  # the full SEO gate
```

Order matters: the sitemap reads robots.txt, so regenerate robots first.
