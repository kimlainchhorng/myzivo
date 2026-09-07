#!/usr/bin/env node
/**
 * Keeps the crawl-blocking half of public/robots.txt in sync with the router.
 *
 * Everything outside the generated block is hand-written and left alone. The
 * block itself lists the signed-in and operational routes that a crawler should
 * never spend budget on — 293 of them were reachable when this was written,
 * including the whole /account, /chat and /shop-dashboard families.
 *
 * Rules are grouped only when the entire family is non-indexable. /shop and
 * /grocery mix public landing pages with signed-in surfaces, so those emit
 * exact paths instead of a prefix that would block the public page too.
 *
 *   node scripts/seo/generate-robots.mjs           # rewrite the block
 *   node scripts/seo/generate-robots.mjs --check   # fail if it is stale
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, buildInventory } from './route-inventory.mjs';

const ROBOTS_PATH = path.join(REPO_ROOT, 'public', 'robots.txt');
const BEGIN = '# BEGIN generated app-only routes (scripts/seo/generate-robots.mjs)';
const END = '# END generated app-only routes';

/**
 * robots.txt matches by raw string prefix, not by path segment: `Disallow: /app`
 * also blocks `/apply`. Every safety check below therefore uses startsWith on
 * the raw path, which is what a crawler actually does.
 */
function blocks(rule, pathname) {
  return pathname.startsWith(rule);
}

/** A concrete URL a dynamic route would serve, for prefix testing. */
function samplePath(routePath) {
  return routePath.replace(/:[A-Za-z0-9_]+/g, 'x').replace(/\*/g, 'x');
}

/** Dynamic routes become wildcard rules: a :param segment turns into a star. */
function toRule(routePath) {
  return routePath.replace(/:[A-Za-z0-9_]+/g, '*');
}

/**
 * Collapse paths into the shortest safe set of Disallow rules.
 *
 * A prefix is only usable when no crawlable URL starts with it. That keeps
 * `/shop` and `/grocery` per-path (they mix a public landing page with
 * signed-in surfaces) and stops `/c` from blocking the public `/c/:handle`
 * channel pages.
 */
function collapseToRules(inventory, existingRules) {
  const alreadyBlocked = (pathname) => existingRules.some((rule) => blocks(rule, pathname));
  const noIndexRules = inventory.noIndex.map(toRule).filter((rule) => !alreadyBlocked(rule));
  const crawlable = [
    ...inventory.indexable,
    ...inventory.dynamic.map(samplePath),
    ...inventory.redirectsToIndexable,
  ];
  const isSafe = (rule) => !crawlable.some((pathname) => blocks(rule, pathname));

  const rules = new Set();
  for (const depth of [1, 2, 3]) {
    const prefixes = new Set(
      noIndexRules
        .map((rule) => rule.split('/').filter(Boolean))
        .filter((segments) => segments.length >= depth && !segments[depth - 1].includes('*'))
        .map((segments) => `/${segments.slice(0, depth).join('/')}`),
    );
    for (const prefix of prefixes) {
      if (!isSafe(prefix)) continue;
      if ([...rules].some((existing) => blocks(existing, prefix))) continue;
      rules.add(prefix);
    }
  }

  for (const rule of noIndexRules) {
    if ([...rules].some((existing) => blocks(existing, rule))) continue;
    if (!isSafe(rule)) continue;
    rules.add(rule);
  }

  return [...rules].sort();
}

function renderBlock(rules) {
  return [
    BEGIN,
    '# Signed-in and operational routes. Generated from the router — do not edit',
    '# by hand; run `npm run seo:robots` after changing routes.',
    ...rules.map((rule) => `Disallow: ${rule}`),
    END,
  ].join('\n');
}

function applyBlock(robots, block) {
  const beginIndex = robots.indexOf(BEGIN);
  if (beginIndex !== -1) {
    const endIndex = robots.indexOf(END, beginIndex);
    return robots.slice(0, beginIndex) + block + robots.slice(endIndex + END.length);
  }
  // First run: insert just above the sitemap footer so the rules stay inside
  // the `User-agent: *` group.
  const anchor = robots.indexOf('# ===========================\n# SITEMAP');
  if (anchor === -1) throw new Error('robots.txt: could not find the SITEMAP footer to insert before');
  return `${robots.slice(0, anchor) + block}\n\n${robots.slice(anchor)}`;
}

const inventory = buildInventory();
const robots = readFileSync(ROBOTS_PATH, 'utf8');

/**
 * Hand-written rules win. Anything they already cover — /admin, /driver,
 * /profile and friends — is left out of the generated block rather than
 * restated per path.
 *
 * Only the `User-agent: *` group counts. The GPTBot and ClaudeBot groups above
 * it disallow /account and /chat for those crawlers alone; treating those as
 * global would leave both families open to Googlebot.
 */
const generatedStart = robots.indexOf(BEGIN);
const wildcardGroup = robots.slice(
  robots.indexOf('User-agent: *'),
  generatedStart === -1 ? undefined : generatedStart,
);
const existingRules = [...wildcardGroup.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1].replace(/\*$/, ''));
const rules = collapseToRules(inventory, existingRules);
const updated = applyBlock(robots, renderBlock(rules));

if (process.argv.includes('--check')) {
  if (updated !== robots) {
    console.error('SEO: public/robots.txt is out of date. Run `npm run seo:robots`.');
    process.exit(1);
  }
  console.log(`SEO: robots.txt up to date (${rules.length} generated rules).`);
} else {
  writeFileSync(ROBOTS_PATH, updated);
  console.log(`SEO: wrote ${rules.length} Disallow rules to public/robots.txt.`);
}
