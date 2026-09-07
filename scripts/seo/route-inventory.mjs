/**
 * Route inventory for SEO tooling.
 *
 * Parses src/App.tsx read-only and partitions every <Route path="..."> into
 * buckets. Everything SEO-related (sitemap generation, noindex sweeps, coverage
 * checks) reads from here so the classification lives in exactly one place.
 *
 * App.tsx uses a flat, self-closing <Route ... /> list (no nested children, no
 * index routes), so a route's element is everything between its own path="..."
 * and the next path="...". That keeps the parser simple and honest.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..');
const APP_TSX = path.join(REPO_ROOT, 'src', 'App.tsx');

/** Redirect elements never deserve their own indexed URL. */
const REDIRECT_ELEMENTS = ['<Navigate', '<PreserveQueryRedirect', '<LegacyRedirect'];

/**
 * Public paths that exist for machines or for a signed-in flow, not for
 * searchers. They stay crawlable (no robots.txt block) but must never be
 * advertised in the sitemap, and they carry noIndex.
 *
 * Prefix rules cover whole families; the exact set below catches one-offs.
 */
const SITEMAP_EXCLUDED_PREFIXES = [
  // Operational / machine endpoints
  '/admin',
  '/auth/',
  '/auth-callback',
  '/oauth',
  '/connect/callback',
  '/debug',
  '/dev/',
  '/test-',
  '/preview/',
  '/embed/',
  '/prototype/',
  // Booking + commerce funnels (thin, session-scoped, often duplicated)
  '/booking/',
  '/checkout',
  '/payment',
  '/pay/',
  '/travel/checkout',
  // Signed-in app surfaces that happen not to sit behind ProtectedRoute
  '/business/',
  '/driver/',
  '/zivo-travel/account',
  '/zivo-travel/my-trips',
  '/zivo-travel/payment-methods',
  '/zivo-travel/wallet',
];

/** Funnel steps inside otherwise-indexable verticals. */
const SITEMAP_EXCLUDED_SUFFIXES = [
  '/checkout',
  '/confirmation',
  '/traveler',
  '/traveler-info',
  '/cart',
  '/orders',
  '/order-placed',
  '/order-confirmed',
  '/redeem',
  '/review',
  '/dashboard',
];

const SITEMAP_EXCLUDED_EXACT = new Set([
  '/index',
  '/offline',
  '/404',
  '/not-found',
  // Auth entry points — crawlable but not worth a sitemap slot
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify',
  '/logout',
  '/partner-login',
  '/delete-account',
  '/account-deletion',
  '/account/legal',
  // Session- or user-scoped surfaces
  '/onboarding',
  '/setup',
  '/install',
  '/invite',
  '/out',
  '/unsubscribe',
  '/share/with-me',
  '/my-rentals',
  '/network/saved',
  '/support/new',
  '/security-test',
  '/filters',
  '/feed-new',
  '/eats/restaurant-dashboard',
  '/flights/bookings',
  '/flights/details/review',
  '/grocery/returns',
]);

function readAppSource() {
  return readFileSync(APP_TSX, 'utf8');
}

/**
 * Resolve `path={SOCIAL_ROUTE_PATHS.feed}` style routes.
 *
 * Not every route is a string literal, and missing the computed ones is not a
 * harmless gap: /feed, /reels and /reels/:postId are all declared this way, and
 * treating them as absent would drop the social surface from the sitemap and
 * disallow it in robots.txt. Anything unresolvable throws rather than being
 * silently skipped.
 */
function resolveComputedPaths(source) {
  const resolved = new Map();
  for (const [, identifier] of source.matchAll(/path=\{([A-Za-z0-9_]+)\./g)) {
    if (resolved.has(identifier)) continue;
    const importMatch = source.match(
      new RegExp(`import\\s*\\{[^}]*\\b${identifier}\\b[^}]*\\}\\s*from\\s*["']([^"']+)["']`),
    );
    if (!importMatch) throw new Error(`route-inventory: cannot find the import for ${identifier} in App.tsx`);
    const specifier = importMatch[1];
    const base = specifier.startsWith('@/') || specifier.startsWith('./')
      ? path.join(REPO_ROOT, 'src', specifier.slice(2))
      : null;
    if (!base) throw new Error(`route-inventory: unsupported import specifier ${specifier} for ${identifier}`);
    const file = ['.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find((candidate) => existsSync(candidate));
    if (!file) throw new Error(`route-inventory: cannot read the module defining ${identifier} (${specifier})`);
    const module = readFileSync(file, 'utf8');
    const body = module.match(new RegExp(`${identifier}\\s*=\\s*\\{([\\s\\S]*?)\\}`));
    if (!body) throw new Error(`route-inventory: ${identifier} is not a literal object in ${specifier}`);
    const entries = new Map(
      [...body[1].matchAll(/([A-Za-z0-9_]+)\s*:\s*["']([^"']+)["']/g)].map((m) => [m[1], m[2]]),
    );
    resolved.set(identifier, entries);
  }
  return resolved;
}

/**
 * @returns {{ path: string, protected: boolean, redirect: boolean, dynamic: boolean, element: string }[]}
 */
export function parseRoutes(source = readAppSource()) {
  const computed = resolveComputedPaths(source);
  const matches = [...source.matchAll(/path=(?:"([^"]*)"|\{([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\})/g)];
  return matches.map((match, i) => {
    let routePath = match[1];
    if (routePath === undefined) {
      const [, , identifier, key] = match;
      routePath = computed.get(identifier)?.get(key);
      if (!routePath) throw new Error(`route-inventory: cannot resolve path={${identifier}.${key}}`);
    }
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : source.length;
    const element = source.slice(start, end);
    const redirect = REDIRECT_ELEMENTS.some((tag) => element.includes(tag));
    return {
      path: routePath,
      protected: element.includes('<ProtectedRoute'),
      redirect,
      redirectTarget: redirect ? (element.match(/\bto="([^"]+)"/)?.[1] ?? null) : null,
      dynamic: routePath.includes(':') || routePath.includes('*'),
      element,
    };
  });
}

/**
 * React Router matches identical paths in declaration order, so a second
 * <Route path="/events"> is dead code. Collapsing to the first declaration is
 * what the browser actually does — anything else misreports /events and
 * /places, which are each declared twice (page first, redirect second).
 */
export function firstDeclarationWins(routes) {
  const seen = new Set();
  return routes.filter((route) => {
    if (seen.has(route.path)) return false;
    seen.add(route.path);
    return true;
  });
}

export function isSitemapExcluded(routePath) {
  if (SITEMAP_EXCLUDED_EXACT.has(routePath)) return true;
  if (SITEMAP_EXCLUDED_PREFIXES.some((prefix) => routePath.startsWith(prefix))) return true;
  return SITEMAP_EXCLUDED_SUFFIXES.some((suffix) => routePath.endsWith(suffix) && routePath !== suffix);
}

/**
 * The partition every other SEO script builds on.
 *
 * - `indexable`: static, public, non-redirect routes → sitemap + SEOHead required.
 * - `noIndex`: auth-gated or operational routes → must carry noIndex, never in the sitemap.
 * - `dynamic`: parameterised routes → sitemap entries come from data, not the route table.
 * - `redirects`: routes that only forward elsewhere.
 */
export function buildInventory(source = readAppSource()) {
  const routes = firstDeclarationWins(parseRoutes(source));
  const indexable = [];
  const noIndex = [];
  const dynamic = [];
  const redirects = [];

  for (const route of routes) {
    if (route.redirect) {
      redirects.push(route);
      continue;
    }
    if (route.protected) {
      noIndex.push(route);
      continue;
    }
    if (route.dynamic) {
      dynamic.push(route);
      continue;
    }
    if (isSitemapExcluded(route.path)) {
      noIndex.push(route);
      continue;
    }
    indexable.push(route);
  }

  const dedupe = (list) => [...new Set(list.map((r) => r.path))].sort();
  const indexablePaths = new Set(indexable.map((r) => r.path));

  return {
    total: routes.length,
    indexable: dedupe(indexable),
    noIndex: dedupe(noIndex),
    dynamic: dedupe(dynamic),
    redirects: dedupe(redirects),
    // A redirect only earns crawl budget when it lands on an indexable page;
    // /account -> /account/profile is not worth a crawl, /terms -> /legal/terms is.
    redirectsToIndexable: dedupe(
      redirects.filter((r) => r.redirectTarget && indexablePaths.has(r.redirectTarget)),
    ),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inventory = buildInventory();
  console.log(JSON.stringify(
    {
      total: inventory.total,
      counts: {
        indexable: inventory.indexable.length,
        noIndex: inventory.noIndex.length,
        dynamic: inventory.dynamic.length,
        redirects: inventory.redirects.length,
      },
      ...inventory,
    },
    null,
    2,
  ));
}
