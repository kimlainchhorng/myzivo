import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://hizivo.com';
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * Route → OG image map. When a caller doesn't pass `ogImage` explicitly, SEOHead
 * picks the closest match here so social shares (FB/IG/X/LinkedIn/WhatsApp/iMessage)
 * advertise the right product. Order matters — first matching prefix wins.
 * Drop new vertical-specific images into /public and add a row here.
 */
const ROUTE_OG_IMAGE_MAP: ReadonlyArray<readonly [string, string]> = [
  ['/flights',   '/og-flights.jpg'],
  ['/airports',  '/og-flights.jpg'],
  ['/hotels',    '/og-hotels.jpg'],
  ['/rent-car',  '/og-cars.jpg'],
  ['/car-rental','/og-cars.jpg'],
  ['/',          '/og-homepage.jpg'], // homepage gets its dedicated landing image
];

function pickOgImageForPath(pathname: string): string {
  for (const [prefix, img] of ROUTE_OG_IMAGE_MAP) {
    if (prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)) return img;
  }
  return DEFAULT_OG_IMAGE;
}

/**
 * Friendly labels for path segments — used in auto-generated breadcrumbs so the
 * SERP shows "Flights › New York › Miami" instead of "flights › new-york › miami".
 * Anything not listed gets title-cased from the slug as a graceful fallback.
 */
const SEGMENT_LABELS: Record<string, string> = {
  flights: 'Flights', hotels: 'Hotels', 'rent-car': 'Car Rental', 'car-rental': 'Car Rental',
  rides: 'Rides', eats: 'Eats', grocery: 'Grocery', delivery: 'Delivery',
  feed: 'Feed', reels: 'Reels', creators: 'Creators', explore: 'Explore',
  channels: 'Channels', communities: 'Communities', trending: 'Trending', live: 'Live',
  shop: 'Shop', jobs: 'Jobs', marketplace: 'Marketplace', business: 'Business',
  about: 'About', help: 'Help', faq: 'FAQ', contact: 'Contact', press: 'Press',
  careers: 'Careers', partners: 'Partners', deals: 'Deals', guides: 'Guides',
  airports: 'Airports', cities: 'Cities', install: 'Install',
  events: 'Events', experiences: 'Experiences', wellness: 'Wellness',
  podcasts: 'Podcasts', dating: 'Dating', places: 'Places',
};

function labelForSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Decode "to-london", "from-new-york", "in-tokyo" prefixes nicely.
  const m = segment.match(/^(to|from|in)-(.+)$/);
  if (m) {
    const prefix = m[1] === 'in' ? '' : m[1].charAt(0).toUpperCase() + m[1].slice(1) + ' ';
    return prefix + titleCase(m[2]);
  }
  return titleCase(segment);
}

function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a BreadcrumbList JSON-LD object from the current pathname so every page
 * gets SERP breadcrumb rich results without callers having to hand-author one.
 * Skips the homepage (no breadcrumb needed) and dynamic-id segments (uuid-like).
 */
function buildBreadcrumbList(pathname: string, siteUrl: string): object | null {
  const cleaned = pathname.replace(/\/+$/, '');
  if (!cleaned || cleaned === '/') return null;
  const segments = cleaned.split('/').filter(Boolean);
  // Drop opaque IDs (uuids, long numbers) — they look ugly in SERP breadcrumbs.
  const isOpaqueId = (s: string) =>
    /^[0-9a-f]{8,}$/i.test(s) || /^\d{6,}$/.test(s);

  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'ZIVO', item: `${siteUrl}/` },
  ];
  let acc = '';
  let pos = 2;
  for (const seg of segments) {
    acc += '/' + seg;
    if (isOpaqueId(seg)) continue;
    items.push({
      '@type': 'ListItem',
      position: pos++,
      name: labelForSegment(seg),
      item: `${siteUrl}${acc}`,
    });
  }
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Per-route title/description defaults. SEOHead falls back to the closest match
 * here when the caller passes empty strings or omits the props — so a route
 * that forgets to wire SEO still gets an indexable title and description
 * instead of leaking the homepage <title> into Google's index.
 *
 * Order matters: longest matching prefix wins.
 */
const ROUTE_DEFAULTS: ReadonlyArray<readonly [string, { title: string; description: string }]> = [
  ['/flights',       { title: 'Compare Cheap Flights – Search 500+ Airlines | ZIVO',
                       description: 'Compare cheap flights from 500+ airlines with no hidden fees. Direct NDC pricing, instant e-tickets, and 24/7 support on ZIVO.' }],
  ['/hotels',        { title: 'Compare Hotels Worldwide – Best Prices | ZIVO',
                       description: 'Find hotels from 500+ trusted partners including Booking.com, Expedia, and Hotels.com. Filter by price, rating, and amenities on ZIVO.' }],
  ['/rent-car',      { title: 'Rent a Car – Hertz, Enterprise, Avis & More | ZIVO',
                       description: 'Compare rental car prices from major brands at airports and city locations worldwide. Free cancellation on most bookings.' }],
  ['/car-rental',    { title: 'Car Rental Worldwide – Compare Prices | ZIVO',
                       description: 'Search rental cars at thousands of pickup locations. Compare Hertz, Enterprise, Avis and more on ZIVO.' }],
  ['/rides',         { title: 'Book a Ride On Demand | ZIVO',
                       description: 'Request rides on demand from your phone. Safe, fast, and affordable rides on ZIVO.' }],
  ['/eats',          { title: 'Order Food Delivery From Local Restaurants | ZIVO',
                       description: 'Browse local restaurants and order food delivery in minutes. Live order tracking on ZIVO.' }],
  ['/grocery',       { title: 'Grocery Delivery From Nearby Stores | ZIVO',
                       description: 'Order groceries from nearby stores with same-day delivery on ZIVO.' }],
  ['/reels',         { title: 'Reels – Short-Form Video From Creators | ZIVO',
                       description: 'Watch short videos from creators worldwide. Discover, like, share, and follow on ZIVO Reels.' }],
  ['/feed',          { title: 'Your Personal Feed | ZIVO',
                       description: 'A personalized feed of posts, reels, and updates from people and creators you follow on ZIVO.' }],
  ['/creators',      { title: 'Discover Creators on ZIVO',
                       description: 'Find and subscribe to creators across travel, food, music, fashion, and more on ZIVO.' }],
  ['/explore',       { title: 'Explore – Discover People, Places & Content | ZIVO',
                       description: 'Discover trending creators, places, posts, and topics on ZIVO Explore.' }],
  ['/shop',          { title: 'Shop – Online Marketplace | ZIVO',
                       description: 'Discover online shops on ZIVO. Buy from local stores and global brands in one app.' }],
  ['/marketplace',   { title: 'ZIVO Marketplace – Buy & Sell',
                       description: 'Cross-vertical marketplace for ZIVO sellers — products, services, and digital goods.' }],
  ['/jobs',          { title: 'Jobs – Hire & Apply on ZIVO',
                       description: 'Post jobs, hire faster, and apply for roles right inside the ZIVO app. Built-in messaging and applications.' }],
  ['/install',       { title: 'Install the ZIVO App – iOS, Android & Web',
                       description: 'Get the free ZIVO app on iOS, Android, or use it as a web app. One account for travel, social, shop, jobs, and more.' }],
  ['/business',      { title: 'ZIVO for Business – POS, Shop, Jobs',
                       description: 'Run your business on ZIVO with built-in POS, online storefront, hiring, and analytics.' }],
  ['/ai-trip-planner', { title: 'AI Trip Planner – Build Itineraries Instantly | ZIVO',
                         description: 'Tell ZIVO where and when you want to go and get a complete itinerary with flights, hotels, and activities in seconds.' }],
  ['/airports',      { title: 'Airport Guides – Flights, Tips & Transit | ZIVO',
                       description: 'Airport guides with flight info, transit, and tips for travelers on ZIVO.' }],
  ['/guides',        { title: 'Travel Guides – Tips & How-Tos | ZIVO',
                       description: 'Travel guides covering cheap flights, best time to book, destination tips, and more on ZIVO.' }],
  ['/deals',         { title: 'Travel & Shopping Deals | ZIVO',
                       description: 'Limited-time deals on flights, hotels, cars, food, and shopping on ZIVO.' }],
  ['/faq',           { title: 'Frequently Asked Questions | ZIVO',
                       description: 'Answers to common questions about ZIVO — accounts, bookings, payments, and more.' }],
  ['/help',          { title: 'Help Center | ZIVO',
                       description: 'Get help with bookings, accounts, payments, and ZIVO features. Contact support 24/7.' }],
  ['/about',         { title: 'About ZIVO – Free All-In-One Super-App',
                       description: 'ZIVO is a free super-app combining travel, social, shop, jobs, and creators in one account.' }],
];

const FALLBACK_TITLE = 'ZIVO – Free Super-App: Travel, Social, Shop, Jobs & Creators';
const FALLBACK_DESCRIPTION = 'All-in-one free app: book flights, hotels & cars, order rides & food, share reels, follow creators, open a shop, post or apply for jobs, chat & call.';

function pickDefaultsForPath(pathname: string): { title: string; description: string } {
  let best: { title: string; description: string } | null = null;
  let bestLen = -1;
  for (const [prefix, defaults] of ROUTE_DEFAULTS) {
    if (pathname.startsWith(prefix) && prefix.length > bestLen) {
      best = defaults;
      bestLen = prefix.length;
    }
  }
  return best ?? { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  noIndex?: boolean;
  ogImage?: string;
  /** Optional JSON-LD structured data object (or array of objects) */
  structuredData?: object | object[];
  /** Article published/modified date for article type */
  publishedTime?: string;
  modifiedTime?: string;
  /** App deep link for app indexing (e.g. "zivo://rides") */
  appLink?: string;
}

export default function SEOHead({
  title,
  description,
  canonical,
  type = 'website',
  noIndex = false,
  ogImage,
  structuredData,
  publishedTime,
  modifiedTime,
  appLink,
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = canonical
      ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`)
      : `${SITE_URL}${location.pathname}`;

    // If the caller passed an ogImage we honor it; otherwise auto-select a
    // route-specific image so flight/hotel/car pages get their own landing
    // graphics instead of the generic site image.
    const resolvedOgImage = ogImage ?? pickOgImageForPath(location.pathname);
    const ogImageUrl = resolvedOgImage.startsWith('http') ? resolvedOgImage : `${SITE_URL}${resolvedOgImage}`;

    // Resolve title/description with route-specific fallbacks so a page that
    // forgets to wire SEO never leaks the homepage <title> into Google's index.
    const defaults = pickDefaultsForPath(location.pathname);
    const resolvedTitle = title?.trim() || defaults.title;
    const resolvedDescription = description?.trim() || defaults.description;

    // robots
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    document.title = resolvedTitle;

    setMeta('name', 'description', resolvedDescription);
    setMeta('name', 'twitter:title', resolvedTitle);
    setMeta('name', 'twitter:description', resolvedDescription);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@ZivoApp');
    setMeta('name', 'twitter:image', ogImageUrl);
    setMeta('name', 'twitter:image:alt', resolvedTitle);

    setMeta('property', 'og:title', resolvedTitle);
    setMeta('property', 'og:description', resolvedDescription);
    setMeta('property', 'og:type', type === 'product' || type === 'profile' ? 'website' : type);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', ogImageUrl);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', resolvedTitle);
    setMeta('property', 'og:site_name', 'ZIVO');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'fb:app_id', '2304266847061310');

    if (publishedTime) setMeta('property', 'article:published_time', publishedTime);
    if (modifiedTime) setMeta('property', 'article:modified_time', modifiedTime);

    // Apple/Android app deep link
    if (appLink) {
      setMeta('name', 'al:ios:url', appLink);
      setMeta('name', 'al:ios:app_store_id', '6759480121');
      setMeta('name', 'al:ios:app_name', 'ZIVO');
      setMeta('name', 'al:android:url', appLink);
      setMeta('name', 'al:android:package', 'com.zivo.app');
      setMeta('name', 'al:android:app_name', 'ZIVO');
    }

    // canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // structured data injection — merges caller-supplied JSON-LD with an
    // auto-generated BreadcrumbList so every non-home route gets rich-snippet
    // breadcrumbs in Google SERPs without callers having to author one.
    const SCRIPT_ID = 'seo-head-jsonld';
    let existingScript = document.getElementById(SCRIPT_ID);
    const breadcrumb = buildBreadcrumbList(location.pathname, SITE_URL);
    const callerData = structuredData
      ? (Array.isArray(structuredData) ? structuredData : [structuredData])
      : [];
    const combined = breadcrumb ? [breadcrumb, ...callerData] : callerData;

    if (combined.length > 0) {
      if (!existingScript) {
        existingScript = document.createElement('script');
        existingScript.setAttribute('type', 'application/ld+json');
        existingScript.id = SCRIPT_ID;
        document.head.appendChild(existingScript);
      }
      // Single object stays a single object so Google doesn't have to dig.
      existingScript.textContent = JSON.stringify(combined.length === 1 ? combined[0] : combined);
    } else if (existingScript) {
      existingScript.remove();
    }

    return () => {
      // Only clean up the JSON-LD blob this instance owns; let the next route's SEOHead
      // (or the homepage's static <title>/<meta>) overwrite the rest. Hardcoding a reset
      // here causes back-navigation to flash stale strings into <head>.
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [title, description, canonical, type, noIndex, ogImage, structuredData, publishedTime, modifiedTime, appLink, location.pathname]);

  return null;
}

function setMeta(attrType: 'name' | 'property', key: string, value: string) {
  const selector = `meta[${attrType}="${key}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrType, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}
