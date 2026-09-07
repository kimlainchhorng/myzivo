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
`src/config/programmaticSEO.ts`: **278 URLs, up from 170**, one canonical URL
shape per entity, and `lastmod` taken from each page's own git history rather
than the build date. Where a date cannot be derived the tag is omitted — an
absent `lastmod` beats an invented one.

### Every Helmet page pointed its canonical at the homepage

`index.html` shipped a static `<link rel="canonical" href="https://zivosmedia.com/">`.
`SEOHead` updates that tag in place, so its pages were fine. But 59 pages use
`react-helmet-async`, which **appends** a second canonical instead — leaving two
tags, with the homepage first. Google reads the first one.

Measured on `/hotels/london` before the fix:

```
canonicals: ["https://zivosmedia.com/", "https://zivosmedia.com/hotels/london"]
titles:     ["Hotels in London 2027 | ...", "ZIVO – Travel, Rides, Food, Shop & Jobs"]
```

Every city landing page, guide, cafe and salon storefront was telling Google it
was a copy of the homepage. The static canonical is gone; pages now set their
own, and a page that sets none has no canonical at all — Google then uses the
URL it crawled, which is strictly better than pointing at `/`.

Verified after the fix: `/hotels/london`, `/deals/summer-flights` and
`/flights/to/paris` each have exactly one canonical, pointing at themselves.

### Most of the programmatic flight and car-rental URLs were one page wearing 85 hats

React Router does not bind params inside a path segment, so these route patterns
never match anything:

```
/flights/:origin-to-:destination   -> FlightRoutePage   (dead)
/flights/to-:toCity                -> FlightLanding     (dead)
/flights/from-:fromCity            -> FlightLanding     (dead)
/car-rental/in-:location           -> CarRentalLanding  (dead)
```

Those URLs fall through to `/flights/:route` and `/car-rental/:slug` instead.
Confirmed in the browser: `/flights/new-york-to-london` and `/flights/to-paris`
both serve *"Search Flights from Cambodia – ZIVO | 500+ Airlines"* with
`canonical="/flights"`, and `/rent-car/miami` serves the generic car-rental
landing with `canonical="/rent-car"`.

So 85 sitemap URLs were 85 copies of two pages, each disclaiming itself. They
are out. What is left renders a real, self-canonical page: `/flights/to/<city>`
(25), `/hotels/<city>` (25), `/airports/<iata>` (25) and `/deals/<slug>`.

`/flights/cities/:citySlug` was a stub that redirected to `/flights`, throwing
the city away. It now redirects to `/flights/to/<city>`, and `FlightToCity`
canonicalises to its own URL instead of the dead hyphen form.

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

### 2. The dead route patterns should be fixed or removed

`FlightRoutePage` is unreachable and `src/pages/seo/FlightRoutePage.tsx`,
`AirportTransfersPage` and friends may be in the same position. Either give them
segment-shaped routes (`/flights/route/:origin/:destination`) or delete them.
Until then, roughly 60 previously-indexed `/flights/<a>-to-<b>` URLs serve the
generic landing. They consolidate into `/flights` via canonical, so nothing is
broken — but the route-level content that was built for them is not being
served.

### 3. Legacy URL shapes deserve 301s

`/hotels/in-london`, `/flights/to-paris` and `/car-rental/in-miami` were all
indexed and now resolve to a generic or mangled page. Edge 301s in
`cloudflare/worker.ts` pointing them at `/hotels/london`, `/flights/to/paris`
and `/rent-car/miami` would recover that link equity. Not done here because it
changes request handling on the live domain and deserves its own change.

### 4. Eight admin routes are not behind `ProtectedRoute`

`/admin/cafe-qr-sheet/:storeId`, `/admin/cafe-summary/:storeId/:date`,
`/admin/salon-queue/:storeId`, `/admin/salon-receipt/:bookingId`,
`/admin/salon-schedule/:storeId/:date`, `/admin/salon-summary/:storeId/:date`,
`/admin/stores/:storeId/car-rental-daily-sheet` and
`/admin/stores/:storeId/car-rental-receipt/:reservationId` take an id straight
from the URL with no route-level guard. They are print/receipt views, so this
may be deliberate — but it is a security question, not an SEO one, and needs a
look at whether the components check authorisation themselves.

### 5. `sameAs` lists no social profiles

The `Organization` schema in `index.html` links only zivosmedia.com and the App
Store listing. `sameAs` is how Google ties the entity to its Facebook,
Instagram, X, LinkedIn, TikTok and YouTube profiles. Left alone because the
profile URLs are not in the repo and must not be guessed.

### 6. No hreflang despite four languages

The app supports English, Khmer, Arabic and French, but language is switched
client-side with no distinct URLs, so there is nothing for `hreflang` to point
at. Real localised URLs (`/km/...`) would have to come first.

### 7. `/` redirects to `/feed` above 1024px

`src/pages/Index.tsx` renders `AppHome` on mobile and `<Navigate to="/feed">` on
desktop. Google indexes mobile-first so this is not urgent, but the canonical
homepage redirecting on desktop is worth revisiting.

### 8. `getCarRentalCityUrl` returns a dead path

`src/config/programmaticSEO.ts` builds `/car-rentals/{slug}`, but no such route
exists — the real ones are `/rent-car/:city` and `/car-rental/:city`. The
function currently has no callers, so nothing is broken; fix or delete it before
someone uses it.

### 9. `RouteSEOHeader.tsx` has zero usages

`src/components/seo/RouteSEOHeader.tsx` is imported nowhere. Wire it up or
delete it.

### 10. App Links point at a package that does not exist

`src/components/SEOHead.tsx` writes `al:android:package` as `com.zivo.app`,
while `src/config/appStoreLinks.ts` uses `com.hizovo.app`. Neither matches
`com.myzivo.app`. Worth reconciling once the Play appeal resolves and it is
clear which package survives.

## Commands

```bash
npm run seo:robots        # regenerate the robots.txt block (run first)
npm run seo:sitemap       # regenerate the sitemap from the router
npm run qa:seo-contracts  # the full SEO gate
```

Order matters: the sitemap reads robots.txt, so regenerate robots first.
