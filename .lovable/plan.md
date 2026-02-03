

# Flights SEO, Route Landing Pages & Indexing for ZIVO

## Summary

This plan implements OTA-grade SEO infrastructure for ZIVO Flights, including dynamic route landing pages, airport/city information pages, enhanced structured data (TravelAction schema), comprehensive sitemap updates, and proper crawl controls. The goal is to drive organic traffic through search-engine-optimized, non-affiliate landing pages.

---

## Current State Analysis

| Requirement | Status | Details |
|-------------|--------|---------|
| **Route landing pages** | ✅ Exists | `/flights/:route` pattern with `FlightLanding.tsx` |
| **Route URL format** | ⚠️ Partial | Uses `{from}-to-{to}` but sitemap uses `from-{from}-to-{to}` inconsistently |
| **Airport pages** | ❌ Missing | No `/airports/{iata}` pages |
| **City pages** | ⚠️ Partial | Hotels has city pages, flights does not |
| **BreadcrumbList schema** | ✅ Exists | `BreadcrumbSchema.tsx` component available |
| **TravelAction schema** | ❌ Missing | No TravelAction structured data |
| **Sitemap** | ✅ Exists | `public/sitemap.xml` with 526 lines, includes some routes |
| **robots.txt** | ✅ Exists | Good structure, blocks admin/checkout/auth pages |
| **noIndex on checkout** | ⚠️ Partial | Some checkout pages have noIndex, need to verify all |
| **SEO disclaimers** | ⚠️ Partial | Exists on FlightLanding but needs OTA-specific wording |

---

## Implementation Plan

### Phase 1: Standardize Route URL Format

**Goal:** Establish consistent URL pattern for SEO route pages.

**Chosen Format:** `/flights/{origin}-to-{destination}` (lowercase, hyphenated)

Examples:
- `/flights/new-york-to-los-angeles`
- `/flights/miami-to-cancun`
- `/flights/chicago-to-london`

**File:** `src/utils/seoUtils.ts` (MODIFY)

Add URL generation utilities:
```typescript
/**
 * Generate SEO-friendly route URL
 */
export function generateRouteUrl(origin: string, destination: string): string {
  const originSlug = formatCitySlug(origin);
  const destSlug = formatCitySlug(destination);
  return `/flights/${originSlug}-to-${destSlug}`;
}

/**
 * Parse route from URL slug
 */
export function parseRouteSlug(slug: string): { origin: string; destination: string } | null {
  const match = slug.match(/^(.+)-to-(.+)$/);
  if (!match) return null;
  return {
    origin: parseCitySlug(match[1]),
    destination: parseCitySlug(match[2]),
  };
}
```

---

### Phase 2: Create Airport Pages

**Goal:** SEO landing pages for major airports at `/airports/{iata}`.

**File:** `src/pages/AirportPage.tsx` (NEW)

Create airport information page with:
- Airport name and IATA code as H1
- City and country information
- Embedded flight search prefilled with airport code
- Popular routes from this airport
- "Book flights on ZIVO" CTA
- No price guarantees or affiliate language

```typescript
// Key content structure:
<SEOHead 
  title={`${airport.name} (${airport.code}) - Flights | ZIVO`}
  description={`Search flights from ${airport.name} in ${airport.city}. Book securely on ZIVO.`}
/>

<h1>Flights from {airport.name} ({airport.code})</h1>
<p>{airport.city}, {airport.country}</p>

<FlightSearchFormPro initialFrom={airport.code} />

<PopularRoutesFromAirport airportCode={airport.code} />
```

**File:** `src/components/seo/PopularRoutesFromAirport.tsx` (NEW)

Display popular destinations from specific airport.

**File:** `src/App.tsx` (MODIFY)

Add route:
```typescript
<Route path="/airports/:iata" element={<AirportPage />} />
```

---

### Phase 3: Create City Flight Pages

**Goal:** SEO landing pages for cities at `/flights/cities/{city-slug}`.

**File:** `src/pages/FlightCityPage.tsx` (NEW)

Create city-focused flight search page with:
- City name as H1: "Flights to {City Name}"
- Brief city intro (from city database)
- Embedded search prefilled with destination
- Popular routes to this city
- Cross-sell to hotels in the same city

**File:** `src/App.tsx` (MODIFY)

Add routes:
```typescript
<Route path="/flights/cities/:citySlug" element={<FlightCityPage />} />
```

---

### Phase 4: Add TravelAction Structured Data

**Goal:** Add schema.org TravelAction for flight search pages (OTA-safe, no affiliate references).

**File:** `src/components/seo/FlightSearchSchema.tsx` (NEW)

```typescript
/**
 * Injects TravelAction schema for flight search pages
 * SEO-safe, OTA-compliant - no affiliate/partner references
 */

interface FlightSearchSchemaProps {
  origin?: string;
  destination?: string;
  departureDate?: string;
}

export default function FlightSearchSchema({ origin, destination, departureDate }: FlightSearchSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://hizivo.com/flights/results?origin={origin}&dest={destination}&date={departureDate}",
        "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
      },
      "query-input": [
        "required name=origin",
        "required name=destination", 
        "required name=departureDate"
      ],
      "provider": {
        "@type": "Organization",
        "name": "ZIVO",
        "url": "https://hizivo.com"
      }
    };

    // Inject script
    let script = document.querySelector('script[data-schema="flight-search"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'flight-search');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => script?.remove();
  }, [origin, destination, departureDate]);

  return null;
}
```

**File:** `src/pages/FlightLanding.tsx` (MODIFY)

Add FlightSearchSchema component and BreadcrumbSchema to the page.

---

### Phase 5: Add Breadcrumbs to All Flight Pages

**Goal:** Consistent breadcrumb navigation with JSON-LD schema.

**File:** `src/components/seo/FlightBreadcrumbs.tsx` (NEW)

```typescript
/**
 * Flight page breadcrumbs with JSON-LD schema
 */

interface FlightBreadcrumbsProps {
  origin?: string;
  destination?: string;
  currentPage?: 'search' | 'results' | 'details' | 'checkout';
}

export default function FlightBreadcrumbs({ origin, destination, currentPage = 'search' }: FlightBreadcrumbsProps) {
  const items = [
    { name: 'Home', url: '/' },
    { name: 'Flights', url: '/flights' },
  ];

  if (origin && destination) {
    items.push({
      name: `${origin} to ${destination}`,
      url: generateRouteUrl(origin, destination),
    });
  }

  if (currentPage === 'results') {
    items.push({ name: 'Results', url: '/flights/results' });
  }

  return (
    <>
      <BreadcrumbSchema items={items} />
      {/* Visual breadcrumb UI */}
    </>
  );
}
```

---

### Phase 6: Update robots.txt

**Goal:** Ensure proper crawl controls for flight pages.

**File:** `public/robots.txt` (MODIFY)

Add explicit rules:
```txt
# ===========================
# FLIGHTS - PUBLIC SEO PAGES
# ===========================
Allow: /flights
Allow: /flights/*
Allow: /airports
Allow: /airports/*

# ===========================
# FLIGHTS - PRIVATE (NOINDEX)
# ===========================
Disallow: /flights/checkout
Disallow: /flights/traveler
Disallow: /flights/confirmation
Disallow: /flights/results  # Dynamic results, not for indexing

# Ensure checkout pages are blocked
Disallow: /checkout
Disallow: /booking/duffel-checkout
```

---

### Phase 7: Expand Sitemap with Route Pages

**Goal:** Add top 50 flight routes to sitemap.

**File:** `public/sitemap.xml` (MODIFY)

Add popular route pages in standardized format:
```xml
<!-- Popular Flight Routes (SEO Format: {origin}-to-{destination}) -->
<url>
  <loc>https://hizivo.com/flights/new-york-to-los-angeles</loc>
  <lastmod>2026-02-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://hizivo.com/flights/new-york-to-london</loc>
  <lastmod>2026-02-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<!-- ... additional routes ... -->

<!-- Airport Pages -->
<url>
  <loc>https://hizivo.com/airports/jfk</loc>
  <lastmod>2026-02-01</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://hizivo.com/airports/lax</loc>
  <lastmod>2026-02-01</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

---

### Phase 8: Ensure noIndex on All Private Pages

**Goal:** Block indexing of checkout, traveler info, confirmation pages.

**Files to verify/update with `noIndex={true}`:**
- `FlightTravelerInfo.tsx`
- `FlightCheckout.tsx`
- `FlightConfirmation.tsx`
- `FlightResults.tsx` (dynamic results shouldn't be indexed)

**File:** `src/pages/FlightCheckout.tsx` (MODIFY)

Ensure:
```typescript
<SEOHead 
  title="Checkout - ZIVO Flights"
  description="Complete your flight booking securely on ZIVO."
  noIndex={true}
/>
```

---

### Phase 9: SEO-Safe Content Disclaimers

**Goal:** Add OTA-compliant disclaimers on all landing pages.

**File:** `src/config/flightSEOContent.ts` (NEW)

```typescript
/**
 * SEO-safe content for flight landing pages
 * No affiliate references, no partner comparisons
 */

export const FLIGHT_SEO_DISCLAIMERS = {
  /** Price disclaimer for landing pages */
  priceNote: "Prices and availability may change. Final price shown before payment.",
  
  /** Booking model explanation */
  bookingModel: "You book and pay on ZIVO. Tickets are issued by licensed partners.",
  
  /** No guarantee language */
  noGuarantee: "Flight prices vary by date and availability.",
} as const;

export const FLIGHT_SEO_INTRO = {
  /** Generic intro for route pages */
  routeIntro: (origin: string, destination: string) => 
    `Search flights from ${origin} to ${destination}. Book directly on ZIVO and receive instant e-tickets. Tickets are issued by licensed airline ticketing partners.`,
  
  /** Intro for airport pages */
  airportIntro: (airportName: string, city: string) =>
    `Find flights from ${airportName} in ${city}. Compare prices and book securely on ZIVO.`,
  
  /** Intro for city pages */
  cityIntro: (cityName: string) =>
    `Discover flights to ${cityName}. Search real-time prices and book on ZIVO with instant ticket issuance.`,
} as const;
```

**File:** `src/pages/FlightLanding.tsx` (MODIFY)

Update SEO content block to use new OTA-safe language:
```typescript
import { FLIGHT_SEO_DISCLAIMERS, FLIGHT_SEO_INTRO } from "@/config/flightSEOContent";

// In the SEO content section:
<p className="text-muted-foreground">
  {FLIGHT_SEO_INTRO.routeIntro(from, to)}
</p>
<p className="text-xs text-muted-foreground mt-4">
  {FLIGHT_SEO_DISCLAIMERS.priceNote}
</p>
```

---

### Phase 10: Performance Optimizations

**Goal:** Ensure fast loading for SEO crawlers.

**Optimizations:**
1. **Lazy-load search results** - Results component already lazy-loaded
2. **Pre-render critical content** - H1, intro text, search form above fold
3. **Image optimization** - Already using optimized images with srcset
4. **Cache route pages** - Add cache headers via Vite config

**File:** `vite.config.ts` (MODIFY)

Add build-time cache hints for static route pages:
```typescript
// Add to build config for static asset caching
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'flight-seo': ['./src/pages/FlightLanding.tsx', './src/pages/AirportPage.tsx'],
      }
    }
  }
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/seoUtils.ts` | MODIFY | Add route URL generation utilities |
| `src/pages/AirportPage.tsx` | CREATE | Airport information landing page |
| `src/pages/FlightCityPage.tsx` | CREATE | City-focused flight search page |
| `src/components/seo/FlightSearchSchema.tsx` | CREATE | TravelAction structured data |
| `src/components/seo/FlightBreadcrumbs.tsx` | CREATE | Breadcrumbs with schema |
| `src/components/seo/PopularRoutesFromAirport.tsx` | CREATE | Routes grid for airport pages |
| `src/config/flightSEOContent.ts` | CREATE | OTA-safe SEO content config |
| `src/pages/FlightLanding.tsx` | MODIFY | Add schemas, update content |
| `src/pages/FlightCheckout.tsx` | MODIFY | Ensure noIndex |
| `src/pages/FlightTravelerInfo.tsx` | MODIFY | Ensure noIndex |
| `src/pages/FlightResults.tsx` | MODIFY | Add noIndex |
| `src/App.tsx` | MODIFY | Add airport and city routes |
| `public/robots.txt` | MODIFY | Update crawl rules |
| `public/sitemap.xml` | MODIFY | Add route and airport URLs |
| `vite.config.ts` | MODIFY | Add code splitting for SEO pages |

---

## URL Structure Summary

| Pattern | Example | Purpose |
|---------|---------|---------|
| `/flights` | `/flights` | Main flights search |
| `/flights/{origin}-to-{destination}` | `/flights/new-york-to-london` | Route landing page |
| `/flights/to-{city}` | `/flights/to-paris` | Destination landing |
| `/flights/from-{city}` | `/flights/from-miami` | Origin landing |
| `/flights/cities/{slug}` | `/flights/cities/tokyo` | City info page |
| `/airports/{iata}` | `/airports/jfk` | Airport info page |

---

## Structured Data Summary

| Schema Type | Page | Purpose |
|-------------|------|---------|
| `Organization` | All pages | Company info |
| `WebSite` | Homepage | Site search action |
| `BreadcrumbList` | All flight pages | Navigation hierarchy |
| `FAQPage` | Flight landing | Common questions |
| `SearchAction` | Flight search | Rich search integration |

---

## Indexing Rules

| Page Type | Index? | robots.txt | noIndex meta |
|-----------|--------|------------|--------------|
| `/flights` | YES | Allow | No |
| `/flights/{route}` | YES | Allow | No |
| `/airports/{iata}` | YES | Allow | No |
| `/flights/results` | NO | Disallow | Yes |
| `/flights/traveler` | NO | Disallow | Yes |
| `/flights/checkout` | NO | Disallow | Yes |
| `/flights/confirmation/*` | NO | Disallow | Yes |

---

## SEO Content Guidelines

**DO use:**
- "Search flights"
- "Book on ZIVO"
- "Prices shown are final before payment"
- "Tickets issued by licensed partners"

**DO NOT use:**
- "Cheapest guaranteed"
- "Compare with other sites"
- "Redirect to partner"
- "Affiliate" or "commission" language
- Price guarantees

---

## Testing Checklist

1. **Route Pages**
   - [ ] `/flights/new-york-to-london` loads correctly
   - [ ] Search form prefilled with route
   - [ ] Breadcrumbs display correctly
   - [ ] Structured data validates in Google Rich Results Test

2. **Airport Pages**
   - [ ] `/airports/jfk` shows airport info
   - [ ] Popular routes display
   - [ ] Search prefilled with IATA code

3. **Crawl Control**
   - [ ] Checkout pages return noindex meta
   - [ ] Results pages return noindex meta
   - [ ] robots.txt blocks private paths

4. **Sitemap**
   - [ ] All route URLs accessible
   - [ ] All airport URLs accessible
   - [ ] No 404s in sitemap

5. **Performance**
   - [ ] LCP < 2.5s on mobile
   - [ ] CLS < 0.1
   - [ ] Search form interactive within 3s

