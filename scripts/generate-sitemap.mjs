#!/usr/bin/env node
/**
 * Build-time sitemap generator for hizivo.com.
 *
 * Why: hand-maintaining public/sitemap.xml drifts from the actual React route
 * list — new public pages get shipped and never indexed. This script is the
 * single source of truth and writes both sitemap.xml and sitemap-index.xml.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs              # writes to public/
 *   node scripts/generate-sitemap.mjs --check      # exits 1 if generated content
 *                                                  # differs from what's on disk
 *                                                  # (use this in CI)
 *
 * Editing this file:
 *   - Add static routes to STATIC_ROUTES
 *   - Add programmatic routes (city/route loops) to the bottom of buildUrls()
 *   - Each entry: { path, changefreq, priority, image? }
 *   - Domain canonicalization, image:image namespace, and lastmod=today are
 *     handled automatically.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const INDEX_PATH = path.join(PUBLIC_DIR, 'sitemap-index.xml');

const SITE_URL = 'https://hizivo.com';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/**
 * @typedef {Object} SitemapEntry
 * @property {string} path
 * @property {'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'} changefreq
 * @property {number} priority
 * @property {{ loc: string, title: string, caption?: string }} [image]
 */

/** @type {SitemapEntry[]} */
const STATIC_ROUTES = [
  // Top-level
  { path: '/',           changefreq: 'daily',   priority: 1.0,
    image: { loc: '/og-homepage.jpg',
             title: 'ZIVO – Free Super-App: Travel, Social, Shop, Jobs & Creators',
             caption: 'All-in-one free app for flights, hotels, cars, rides, food, reels, shops, jobs, chat and calls.' } },

  // Travel hubs
  { path: '/flights',  changefreq: 'daily', priority: 0.9,
    image: { loc: '/og-flights.jpg', title: 'Compare flights from 500+ airlines on ZIVO',
             caption: 'Search and book cheap flights with no hidden fees.' } },
  { path: '/hotels',   changefreq: 'daily', priority: 0.9,
    image: { loc: '/og-hotels.jpg', title: 'Compare hotels from 500+ trusted partners on ZIVO',
             caption: 'Find hotels worldwide with price comparison from Booking.com, Expedia and more.' } },
  { path: '/rent-car', changefreq: 'daily', priority: 0.9,
    image: { loc: '/og-cars.jpg', title: 'Rent a car from Hertz, Enterprise, Avis on ZIVO',
             caption: 'Compare rental car prices from major brands worldwide.' } },
  { path: '/car-rental', changefreq: 'daily', priority: 0.9 },
  { path: '/rides',    changefreq: 'daily', priority: 0.9 },
  { path: '/eats',     changefreq: 'daily', priority: 0.9 },
  { path: '/grocery',  changefreq: 'daily', priority: 0.8 },
  { path: '/delivery', changefreq: 'daily', priority: 0.8 },

  // Travel extras
  { path: '/extras',           changefreq: 'weekly', priority: 0.8 },
  { path: '/things-to-do',     changefreq: 'weekly', priority: 0.8 },
  { path: '/activities',       changefreq: 'weekly', priority: 0.8 },
  { path: '/ground-transport', changefreq: 'weekly', priority: 0.7 },
  { path: '/travel-insurance', changefreq: 'weekly', priority: 0.7 },
  { path: '/ai-trip-planner',  changefreq: 'weekly', priority: 0.8 },
  { path: '/business-travel',  changefreq: 'weekly', priority: 0.7 },
  { path: '/multi-city-builder', changefreq: 'weekly', priority: 0.7 },
  { path: '/cars',             changefreq: 'weekly', priority: 0.7 },
  { path: '/cars/search',      changefreq: 'weekly', priority: 0.7 },
  { path: '/how-to-rent',      changefreq: 'monthly', priority: 0.6 },
  { path: '/insurance',        changefreq: 'monthly', priority: 0.6 },
  { path: '/concierge',        changefreq: 'monthly', priority: 0.6 },

  // App
  { path: '/install', changefreq: 'weekly', priority: 0.9 },

  // Social & creators
  { path: '/feed',         changefreq: 'hourly',  priority: 0.9 },
  { path: '/reels',        changefreq: 'hourly',  priority: 0.9 },
  { path: '/creators',     changefreq: 'daily',   priority: 0.8 },
  { path: '/explore',      changefreq: 'daily',   priority: 0.8 },
  { path: '/channels',     changefreq: 'daily',   priority: 0.7 },
  { path: '/communities',  changefreq: 'daily',   priority: 0.7 },
  { path: '/leaderboard',  changefreq: 'daily',   priority: 0.6 },
  { path: '/trending',     changefreq: 'hourly',  priority: 0.8 },
  { path: '/nearby',       changefreq: 'daily',   priority: 0.7 },
  { path: '/smart-search', changefreq: 'weekly',  priority: 0.7 },
  { path: '/live',         changefreq: 'hourly',  priority: 0.8 },
  { path: '/watch-party',  changefreq: 'weekly',  priority: 0.6 },
  { path: '/podcasts',     changefreq: 'weekly',  priority: 0.7 },
  { path: '/sounds',       changefreq: 'weekly',  priority: 0.6 },
  { path: '/link-hub',     changefreq: 'weekly',  priority: 0.6 },

  // Lifestyle & discover
  { path: '/events',              changefreq: 'daily',  priority: 0.8 },
  { path: '/experiences',         changefreq: 'daily',  priority: 0.8 },
  { path: '/places',              changefreq: 'daily',  priority: 0.7 },
  { path: '/dating',              changefreq: 'weekly', priority: 0.7 },
  { path: '/wellness',            changefreq: 'weekly', priority: 0.7 },
  { path: '/wellness/mindfulness', changefreq: 'weekly', priority: 0.6 },
  { path: '/wellness/nutrition',   changefreq: 'weekly', priority: 0.6 },
  { path: '/food',                changefreq: 'weekly', priority: 0.7 },

  // Service verticals
  { path: '/auto-repair',     changefreq: 'weekly', priority: 0.7 },
  { path: '/package-delivery', changefreq: 'weekly', priority: 0.7 },
  { path: '/move',            changefreq: 'weekly', priority: 0.7 },
  { path: '/ride',            changefreq: 'weekly', priority: 0.7 },
  { path: '/services',        changefreq: 'weekly', priority: 0.7 },

  // Marketplace & creator monetization
  { path: '/marketplace',      changefreq: 'daily',  priority: 0.8 },
  { path: '/shop',             changefreq: 'daily',  priority: 0.8 },
  { path: '/jobs',             changefreq: 'daily',  priority: 0.8 },
  { path: '/monetization',     changefreq: 'weekly', priority: 0.7 },
  { path: '/digital-products', changefreq: 'weekly', priority: 0.7 },
  { path: '/promote',          changefreq: 'weekly', priority: 0.6 },
  { path: '/brand-deals',      changefreq: 'weekly', priority: 0.6 },

  // Business / partnerships
  { path: '/business',          changefreq: 'monthly', priority: 0.6 },
  { path: '/corporate',         changefreq: 'monthly', priority: 0.5 },
  { path: '/partners',          changefreq: 'monthly', priority: 0.6 },
  { path: '/partners/join',     changefreq: 'monthly', priority: 0.6 },
  { path: '/partner-with-zivo', changefreq: 'monthly', priority: 0.6 },
  { path: '/become-partner',    changefreq: 'monthly', priority: 0.6 },
  { path: '/affiliate-hub',     changefreq: 'monthly', priority: 0.6 },
  { path: '/api-partners',      changefreq: 'monthly', priority: 0.5 },
  { path: '/enterprise-ready',  changefreq: 'monthly', priority: 0.6 },
  { path: '/enterprise-trust',  changefreq: 'monthly', priority: 0.6 },
  { path: '/for-customers',     changefreq: 'monthly', priority: 0.6 },
  { path: '/developers',        changefreq: 'monthly', priority: 0.6 },
  { path: '/connect-website',   changefreq: 'monthly', priority: 0.5 },
  { path: '/data-insights',     changefreq: 'monthly', priority: 0.5 },
  { path: '/compliance',        changefreq: 'monthly', priority: 0.5 },

  // Trust, support, transparency
  { path: '/about',         changefreq: 'monthly', priority: 0.6 },
  { path: '/how-it-works',  changefreq: 'monthly', priority: 0.6 },
  { path: '/help',          changefreq: 'monthly', priority: 0.5 },
  { path: '/help-center',   changefreq: 'monthly', priority: 0.6 },
  { path: '/support',       changefreq: 'monthly', priority: 0.6 },
  { path: '/faq',           changefreq: 'monthly', priority: 0.6 },
  { path: '/safety',        changefreq: 'monthly', priority: 0.6 },
  { path: '/security',      changefreq: 'monthly', priority: 0.5 },
  { path: '/status',        changefreq: 'daily',   priority: 0.5 },
  { path: '/mission',       changefreq: 'monthly', priority: 0.5 },
  { path: '/vision',        changefreq: 'monthly', priority: 0.5 },
  { path: '/brand',         changefreq: 'monthly', priority: 0.5 },
  { path: '/reliability',   changefreq: 'monthly', priority: 0.5 },
  { path: '/trust-statement', changefreq: 'monthly', priority: 0.5 },
  { path: '/contact',       changefreq: 'monthly', priority: 0.5 },
  { path: '/careers',       changefreq: 'monthly', priority: 0.5 },
  { path: '/press',         changefreq: 'monthly', priority: 0.5 },
  { path: '/company',       changefreq: 'monthly', priority: 0.5 },
  { path: '/membership',    changefreq: 'weekly',  priority: 0.7 },
  { path: '/zivo-plus',     changefreq: 'weekly',  priority: 0.7 },
  { path: '/referrals',     changefreq: 'monthly', priority: 0.5 },
  { path: '/rewards',       changefreq: 'weekly',  priority: 0.6 },
  { path: '/promotions',    changefreq: 'daily',   priority: 0.7 },
  { path: '/deals',         changefreq: 'daily',   priority: 0.7 },
  { path: '/roadmap',       changefreq: 'monthly', priority: 0.4 },

  // Guides
  { path: '/guides',                  changefreq: 'weekly',  priority: 0.6 },
  { path: '/guides/cheap-flights',    changefreq: 'monthly', priority: 0.6 },
  { path: '/guides/best-time-to-book', changefreq: 'monthly', priority: 0.6 },

  // Legal
  { path: '/terms',                  changefreq: 'monthly', priority: 0.4 },
  { path: '/privacy',                changefreq: 'monthly', priority: 0.4 },
  { path: '/cookies',                changefreq: 'monthly', priority: 0.3 },
  { path: '/affiliate-disclosure',   changefreq: 'monthly', priority: 0.4 },
  { path: '/refund-policy',          changefreq: 'monthly', priority: 0.4 },
  { path: '/legal/partner-disclosure', changefreq: 'monthly', priority: 0.4 },
  { path: '/legal/accessibility',    changefreq: 'monthly', priority: 0.3 },
  { path: '/legal/seller-of-travel', changefreq: 'monthly', priority: 0.4 },
];

// Programmatic destinations — extend freely; one source of truth for SEO breadth.
const POPULAR_CITIES = [
  'new-york', 'los-angeles', 'london', 'paris', 'tokyo', 'dubai',
  'cancun', 'miami', 'las-vegas', 'orlando', 'bangkok', 'singapore',
  'bali', 'rome', 'istanbul', 'hong-kong', 'mexico-city', 'toronto',
  'sydney', 'phnom-penh', 'barcelona', 'chicago',
];
const POPULAR_FROM_CITIES = ['new-york', 'los-angeles', 'chicago', 'miami', 'dallas', 'san-francisco', 'atlanta', 'boston', 'seattle'];
const POPULAR_ROUTES = [
  ['new-york', 'los-angeles'], ['new-york', 'london'], ['new-york', 'miami'], ['new-york', 'paris'],
  ['los-angeles', 'new-york'], ['los-angeles', 'london'], ['los-angeles', 'tokyo'], ['los-angeles', 'las-vegas'],
  ['chicago', 'new-york'], ['chicago', 'los-angeles'],
  ['miami', 'new-york'], ['miami', 'cancun'],
  ['san-francisco', 'tokyo'], ['dallas', 'las-vegas'], ['seattle', 'honolulu'], ['boston', 'dublin'],
];
const POPULAR_AIRPORTS = ['jfk', 'lax', 'ord', 'mia', 'sfo', 'lhr', 'cdg', 'dxb', 'nrt', 'sin'];
const RENT_CAR_CITIES = [
  'miami', 'las-vegas', 'los-angeles', 'orlando', 'new-york', 'chicago', 'dallas',
  'atlanta', 'phoenix', 'san-diego', 'seattle', 'denver', 'houston', 'boston',
];

function buildUrls() {
  /** @type {SitemapEntry[]} */
  const out = [...STATIC_ROUTES];

  // Flight destinations (to-X / from-X)
  for (const c of POPULAR_CITIES) out.push({ path: `/flights/to-${c}`, changefreq: 'weekly', priority: 0.8 });
  for (const c of POPULAR_FROM_CITIES) out.push({ path: `/flights/from-${c}`, changefreq: 'weekly', priority: 0.8 });
  // Routes
  for (const [from, to] of POPULAR_ROUTES) out.push({ path: `/flights/${from}-to-${to}`, changefreq: 'weekly', priority: 0.8 });
  // Airport pages
  for (const code of POPULAR_AIRPORTS) out.push({ path: `/airports/${code}`, changefreq: 'monthly', priority: 0.7 });
  // Flight city hubs
  for (const c of POPULAR_CITIES.slice(0, 6)) out.push({ path: `/flights/cities/${c}`, changefreq: 'weekly', priority: 0.7 });
  // Hotels (both URL formats supported by app)
  for (const c of POPULAR_CITIES) out.push({ path: `/hotels/${c}`, changefreq: 'weekly', priority: 0.8 });
  for (const c of POPULAR_CITIES) out.push({ path: `/hotels/in-${c}`, changefreq: 'weekly', priority: 0.8 });
  // Car rental (both formats)
  for (const c of RENT_CAR_CITIES) out.push({ path: `/rent-car/${c}`, changefreq: 'weekly', priority: 0.8 });
  for (const c of RENT_CAR_CITIES.slice(0, 6)) out.push({ path: `/car-rental/in-${c}`, changefreq: 'weekly', priority: 0.8 });

  // De-dupe by path (last wins, so static overrides programmatic for important pages)
  const seen = new Map();
  for (const e of out) seen.set(e.path, e);
  return [...seen.values()];
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function renderUrl(entry) {
  const lines = [];
  lines.push('  <url>');
  lines.push(`    <loc>${SITE_URL}${entry.path}</loc>`);
  lines.push(`    <lastmod>${TODAY}</lastmod>`);
  lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  if (entry.image) {
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${SITE_URL}${entry.image.loc}</image:loc>`);
    lines.push(`      <image:title>${escapeXml(entry.image.title)}</image:title>`);
    if (entry.image.caption) lines.push(`      <image:caption>${escapeXml(entry.image.caption)}</image:caption>`);
    lines.push('    </image:image>');
  }
  lines.push('  </url>');
  return lines.join('\n');
}

function renderSitemap(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by scripts/generate-sitemap.mjs — do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    entries.map(renderUrl).join('\n\n'),
    '</urlset>',
    '',
  ].join('\n');
}

function renderIndex() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by scripts/generate-sitemap.mjs — do not edit by hand. -->',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <sitemap>',
    `    <loc>${SITE_URL}/sitemap.xml</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    '  </sitemap>',
    '</sitemapindex>',
    '',
  ].join('\n');
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const entries = buildUrls();
  const sitemap = renderSitemap(entries);
  const index = renderIndex();

  if (checkOnly) {
    const onDiskSitemap = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, 'utf8') : '';
    const onDiskIndex = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';
    // Strip the lastmod date when comparing in --check, so a stale CI cache
    // doesn't fail the check just because the day rolled over.
    const stripDates = (s) => s.replace(/<lastmod>[\d-]+<\/lastmod>/g, '<lastmod>YYYY-MM-DD</lastmod>');
    if (stripDates(onDiskSitemap) !== stripDates(sitemap) || stripDates(onDiskIndex) !== stripDates(index)) {
      console.error('✗ sitemap is out of date — run `node scripts/generate-sitemap.mjs` and commit the result.');
      process.exit(1);
    }
    console.log(`✓ sitemap up to date (${entries.length} URLs)`);
    return;
  }

  fs.writeFileSync(SITEMAP_PATH, sitemap);
  fs.writeFileSync(INDEX_PATH, index);
  console.log(`✓ wrote ${entries.length} URLs to public/sitemap.xml (${TODAY})`);
}

main();
