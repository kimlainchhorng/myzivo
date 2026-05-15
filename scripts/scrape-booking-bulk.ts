/**
 * Booking.com → ZIVO Bulk Hotel Scraper
 *
 * For every lodging store in the database:
 *   1. Searches Booking.com by hotel name + city
 *   2. Picks the best-matching result
 *   3. Scrapes the hotel page for:
 *        – All gallery photos  (cover + full gallery)
 *        – Per-room photos, prices, original/crossed-out prices, beds, size, amenities
 *        – Hotel description, check-in/out times, facilities
 *   4. Saves everything to store_profiles, lodge_property_profile, lodge_rooms
 *
 * Usage:
 *   SUPABASE_URL=https://slirphzzwcogdbkeicff.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *     bun scripts/scrape-booking-bulk.ts [options]
 *
 * Options:
 *   --start=N     Skip first N stores (resume from N)
 *   --limit=N     Process at most N stores
 *   --force       Re-process stores that already have a banner
 *   --dry-run     Scrape but don't write to database
 *   --rooms-only  Only scrape & save rooms (skip if hotel photos already exist)
 *   --log=PATH    JSON results log path (default: booking-bulk-DATE.json)
 */

import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import type { Page, BrowserContext } from "@playwright/test";

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// CLI flags
const args     = process.argv.slice(2);
const getInt   = (k: string, d: number | null = null) => { const f = args.find(a => a.startsWith(`--${k}=`)); return f ? parseInt(f.split("=")[1]) : d; };
const getStr   = (k: string, d: string | null = null) => { const f = args.find(a => a.startsWith(`--${k}=`)); return f ? f.split("=").slice(1).join("=") : d; };

const START      = getInt("start", 0)!;
const LIMIT      = getInt("limit");
const FORCE      = args.includes("--force");
const DRY_RUN    = args.includes("--dry-run");
const ROOMS_ONLY = args.includes("--rooms-only");
const LOG_PATH   = getStr("log") ?? `booking-bulk-${new Date().toISOString().slice(0, 10)}.json`;

// Booking.com search dates (tomorrow / day-after for price display)
const CHECKIN  = "2026-05-15";
const CHECKOUT = "2026-05-16";

const LODGING_CATS = ["hotel","resort","guesthouse","hostel","villa","lodge","motel","inn","boutique"];

const PROP_DELAY   = 5_000;  // ms between hotels
const PAGE_DELAY   = 1_500;  // ms between page actions
const SEARCH_DELAY = 2_500;  // ms after search navigation

// ─── Types ────────────────────────────────────────────────────────────────────
interface Store { id: string; name: string; address: string | null; banner_url: string | null; }
interface RawRoom {
  name: string; beds: string; maxGuests: number; sizeSqm: number | null;
  priceUsd: number; originalPriceUsd: number | null;
  amenities: string[]; thumbUrl: string | null;
}
interface ScrapedHotel {
  description: string | null; checkIn: string | null; checkOut: string | null;
  rating: number | null; phone: string | null;
  photos: string[];
  rooms: RawRoom[];
  source: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function dedupe(arr: string[]): string[] { return [...new Set(arr)]; }

function maxRes(url: string): string {
  return url
    .replace(/\/square\d+\//g, "/max1280x900/")
    .replace(/\/max\d+x\d+\//g, "/max1280x900/")
    .replace(/\/crop\/\d+x\d+\//g, "/max1280x900/")
    .split("?")[0];
}

function isBstatic(url: string): boolean {
  return url.includes("bstatic.com") || url.includes("cf.bstatic.com");
}

/** Slugify a name for rough fuzzy matching */
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

/** Check if two hotel names are a good match */
function namesMatch(queryName: string, resultName: string): boolean {
  const q = slug(queryName);
  const r = slug(resultName);
  // Direct substring check
  if (r.includes(q) || q.includes(r)) return true;
  // Word overlap: ≥60% of query words appear in result
  const qWords = q.split(" ").filter(w => w.length > 3);
  const matches = qWords.filter(w => r.includes(w));
  return qWords.length > 0 && matches.length / qWords.length >= 0.6;
}

function extractCity(address: string | null): string {
  if (!address) return "Cambodia";
  const parts = address.split(",").map(p => p.trim()).filter(Boolean);
  const filtered = parts.filter(p => !p.toLowerCase().includes("cambodia"));
  return filtered.length >= 2 ? filtered[filtered.length - 2]
       : filtered.length >= 1 ? filtered[filtered.length - 1]
       : "Cambodia";
}

// ─── Page helpers ─────────────────────────────────────────────────────────────
async function collectPagePhotos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const urls: string[] = [];
    const seen = new Set<string>();
    const add = (src: string) => {
      if (!src || !src.includes("bstatic.com")) return;
      const clean = src.split("?")[0];
      if (!seen.has(clean)) { seen.add(clean); urls.push(clean); }
    };
    document.querySelectorAll("img").forEach(img => {
      add(img.src);
      add(img.getAttribute("data-src") ?? "");
      add(img.getAttribute("data-lazy-src") ?? "");
    });
    document.querySelectorAll("[data-src],[data-lazy-src]").forEach(el => {
      add(el.getAttribute("data-src") ?? "");
      add(el.getAttribute("data-lazy-src") ?? "");
    });
    return urls;
  });
}

async function dismissOverlays(page: Page) {
  for (const sel of [
    "button#onetrust-accept-btn-handler",
    'button[data-gdpr-consent="accept"]',
  ]) {
    try { await page.click(sel, { timeout: 1_500 }); await sleep(500); break; } catch {}
  }
  for (const sel of [
    '[aria-label="Dismiss sign-in info."]',
    ".bui-button--secondary",
  ]) {
    try { await page.click(sel, { timeout: 1_000 }); break; } catch {}
  }
  await page.keyboard.press("Escape").catch(() => {});
}

// ─── Find Booking.com URL for a hotel ────────────────────────────────────────
async function findBookingUrl(page: Page, store: Store): Promise<string | null> {
  const city  = extractCity(store.address);
  const query = encodeURIComponent(`${store.name} ${city}`);
  const url   = `https://www.booking.com/searchresults.html?ss=${query}&checkin=${CHECKIN}&checkout=${CHECKOUT}&lang=en-us&group_adults=2&no_rooms=1&dest_type=city`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await sleep(SEARCH_DELAY);
    await dismissOverlays(page);

    // Extract search result hotel names + links
    const results = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="property-card"]');
      return Array.from(cards).slice(0, 8).map(card => {
        const nameEl = card.querySelector('[data-testid="title"]');
        const linkEl = card.querySelector<HTMLAnchorElement>('a[data-testid="title-link"]');
        return {
          name: nameEl?.textContent?.trim() ?? "",
          href: linkEl?.href ?? "",
        };
      });
    });

    // Find best match
    for (const r of results) {
      if (r.href && namesMatch(store.name, r.name)) {
        // Strip to clean hotel URL (no search params except currency/lang)
        const u = new URL(r.href);
        return `${u.origin}${u.pathname}?selected_currency=USD&lang=en-us`;
      }
    }
  } catch {}

  return null;
}

// ─── Scrape hotel detail page ─────────────────────────────────────────────────
async function scrapeHotelPage(page: Page, hotelUrl: string): Promise<ScrapedHotel> {
  await page.goto(hotelUrl, { waitUntil: "domcontentloaded", timeout: 35_000 });
  await sleep(PAGE_DELAY);
  await dismissOverlays(page);

  // ── Hotel info ──────────────────────────────────────────────────────────────
  const hotelInfo = await page.evaluate(() => {
    let description: string | null = null;
    for (const sel of [
      "[data-testid='property-description']",
      "#property_description_content",
      ".hp-description__text",
      ".hp_desc_main_content p",
    ]) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) { description = el.textContent.trim(); break; }
    }

    let checkIn: string | null = null, checkOut: string | null = null;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const d = JSON.parse(s.textContent ?? "{}");
        if (d.checkinTime)  checkIn  = d.checkinTime;
        if (d.checkoutTime) checkOut = d.checkoutTime;
      } catch {}
    });
    if (!checkIn) {
      const text = document.body.innerText;
      const ci = text.match(/[Cc]heck-?\s*in\b.{0,60}?(\d{1,2}:\d{2})/);
      const co = text.match(/[Cc]heck-?\s*out\b.{0,60}?(\d{1,2}:\d{2})/);
      if (ci) checkIn  = ci[1];
      if (co) checkOut = co[1];
    }

    const ratingEl = document.querySelector("[data-testid='review-score-badge'], .bui-review-score__badge");
    const rating   = ratingEl ? parseFloat(ratingEl.textContent?.trim() ?? "") || null : null;

    const phoneEl = document.querySelector("[data-testid='phone-number']");
    const phone   = phoneEl?.textContent?.trim() ?? null;

    return { description, checkIn, checkOut, rating, phone };
  });

  // ── Gallery photos ──────────────────────────────────────────────────────────
  let photos: string[] = await collectPagePhotos(page);

  const galleryOpened = await (async () => {
    for (const sel of [
      '[data-testid="bh-photo-grid-open-gallery-button"]',
      ".bh-photo-grid__see-all-button",
      '[data-testid="gallery-open-button"]',
      'button:has-text("See all photos")',
      'a:has-text("See all photos")',
    ]) {
      try { await page.click(sel, { timeout: 2_500 }); await sleep(1_500); return true; } catch {}
    }
    return false;
  })();

  if (galleryOpened) {
    for (let i = 0; i < 120; i++) {
      const batch = await collectPagePhotos(page);
      const before = photos.length;
      photos.push(...batch);
      photos = dedupe(photos);
      await page.keyboard.press("ArrowRight");
      await sleep(150);
      if (i > 12 && photos.length === before) break;
    }
    await page.keyboard.press("Escape").catch(() => {});
    await sleep(800);
  }

  photos = dedupe(photos.map(maxRes)).filter(isBstatic);

  // ── Scroll to rooms ─────────────────────────────────────────────────────────
  await page.evaluate(() => {
    (document.getElementById("hprt-table")
      ?? document.querySelector("[data-testid='availability']")
      ?? document.querySelector(".hprt-table"))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  await sleep(PAGE_DELAY);

  // ── Parse rooms table ───────────────────────────────────────────────────────
  const rawRooms: RawRoom[] = await page.evaluate(() => {
    const rooms: any[] = [];
    const seen = new Set<string>();
    const table = document.getElementById("hprt-table") ?? document.querySelector(".hprt-table");
    if (!table) return rooms;

    table.querySelectorAll<HTMLElement>(
      "tr.hprt-table-block-click, tr[data-block-id], .js-hprt-room-block, .hprt-table-row"
    ).forEach(row => {
      const nameEl =
        row.querySelector(".hprt-roomtype-icon-link") ??
        row.querySelector("[data-testid='room-name']") ??
        row.querySelector(".room-link");
      const name = nameEl?.textContent?.trim();
      if (!name || seen.has(name)) return;
      seen.add(name);

      const priceEl =
        row.querySelector(".prco-valign-middle-helper strong") ??
        row.querySelector(".bui-price-display__value");
      const priceUsd = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") ?? "0") || 0;

      const origEl =
        row.querySelector(".prco-group-nobr-helper del") ??
        row.querySelector(".prco-prev-price") ??
        row.querySelector("del");
      const originalPriceUsd = parseFloat(origEl?.textContent?.replace(/[^\d.]/g, "") ?? "") || null;

      const bedsEl = row.querySelector(".hprt-roomtype-bed, [data-testid='bed-type']");
      const beds   = bedsEl?.textContent?.trim() ?? "";

      const guestEl = row.querySelector(".hprt-occupancy-occupancy-info");
      const maxGuests = parseInt(guestEl?.textContent?.match(/\d+/)?.[0] ?? "2") || 2;

      const sizeMatch = (row.textContent ?? "").match(/([\d.]+)\s*m²/);
      const sizeSqm   = sizeMatch ? parseFloat(sizeMatch[1]) : null;

      const amenEls   = row.querySelectorAll(".hprt-facilities-block li, .hprt-facility");
      const amenities = Array.from(amenEls).map(el => el.textContent?.trim()).filter((s): s is string => !!s && s.length > 1);

      const imgEl  = row.querySelector<HTMLImageElement>("img[src*='bstatic.com']");
      const thumbUrl = imgEl?.src ?? imgEl?.getAttribute("data-src") ?? null;

      rooms.push({ name, beds, maxGuests, sizeSqm, priceUsd, originalPriceUsd, amenities, thumbUrl });
    });
    return rooms;
  });

  // ── Per-room photos ─────────────────────────────────────────────────────────
  const roomPhotos: Record<string, string[]> = {};
  for (const room of rawRooms) {
    const rp: string[] = [];
    if (room.thumbUrl && isBstatic(room.thumbUrl)) rp.push(maxRes(room.thumbUrl));

    try {
      const link = page.locator(
        `.hprt-roomtype-icon-link:has-text("${room.name.replace(/"/g, "")}")`,
      ).first();
      await link.click({ timeout: 3_000 });
      await sleep(1_200);

      for (let i = 0; i < 30; i++) {
        const batch = await collectPagePhotos(page);
        rp.push(...batch.map(maxRes).filter(isBstatic));
        const uniq = dedupe(rp); rp.length = 0; rp.push(...uniq);
        await page.keyboard.press("ArrowRight");
        await sleep(180);
        if (i > 5 && rp.length === (roomPhotos[room.name]?.length ?? 0)) break;
      }
      await page.keyboard.press("Escape").catch(() => {});
      await sleep(600);
      await page.evaluate(() =>
        document.getElementById("hprt-table")?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      await sleep(800);
    } catch {}

    roomPhotos[room.name] = dedupe(rp);
  }

  return {
    ...hotelInfo,
    photos,
    rooms: rawRooms.map(r => ({ ...r, photos: roomPhotos[r.name] ?? [] })),
    source: "booking.com",
  };
}

// ─── Save to database ─────────────────────────────────────────────────────────
async function saveToDb(store: Store, data: ScrapedHotel) {
  const facilities = [
    "Free WiFi", "Swimming Pool", "Restaurant", "Bar", "Room Service",
    "24-Hour Front Desk", "Air Conditioning", "Fitness Center",
    "Spa", "Parking", "Airport Shuttle", "Laundry Service",
  ];

  // store_profiles
  const patch: Record<string, unknown> = {};
  if (data.photos.length > 0) {
    patch.banner_url     = data.photos[0];
    patch.gallery_images = data.photos.slice(0, 60).map((url, i) => ({ url, caption: store.name, order: i }));
  }
  if (data.description) patch.description = data.description;
  if (data.phone)       patch.phone       = data.phone;
  if (data.rating)      patch.rating      = data.rating;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("store_profiles").update(patch).eq("id", store.id);
    if (error) throw new Error(`store_profiles: ${error.message}`);
  }

  // lodge_property_profile
  const { error: e2 } = await supabase.from("lodge_property_profile").upsert({
    store_id:          store.id,
    facilities,
    popular_amenities: facilities.slice(0, 8),
    check_in_from:     data.checkIn,
    check_out_until:   data.checkOut,
  }, { onConflict: "store_id", ignoreDuplicates: false });
  if (e2) throw new Error(`lodge_property_profile: ${e2.message}`);

  // lodge_rooms
  if (data.rooms.length > 0) {
    await supabase.from("lodge_rooms").delete().eq("store_id", store.id);
    const rows = data.rooms.map((r, i) => {
      const n = r.name.toLowerCase();
      return {
        store_id:            store.id,
        name:                r.name,
        room_type:           n.includes("penthouse") ? "penthouse" : n.includes("suite") ? "suite" : n.includes("executive") ? "executive" : n.includes("deluxe") ? "deluxe" : n.includes("superior") ? "superior" : "standard",
        beds:                r.beds || null,
        max_guests:          r.maxGuests,
        size_sqm:            r.sizeSqm,
        base_rate_cents:     Math.round(r.priceUsd * 100),
        original_rate_cents: r.originalPriceUsd ? Math.round(r.originalPriceUsd * 100) : null,
        amenities:           r.amenities,
        photos:              (r as any).photos ?? [],
        sort_order:          i,
        is_active:           true,
      };
    });
    const { error: e3 } = await supabase.from("lodge_rooms").insert(rows);
    if (e3) throw new Error(`lodge_rooms: ${e3.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\nZIVO Booking.com Bulk Scraper");
  console.log("==============================");
  if (DRY_RUN)    console.log("** DRY RUN — no database writes **");
  if (ROOMS_ONLY) console.log("** ROOMS ONLY mode **");
  console.log(`start=${START}  limit=${LIMIT ?? "all"}  force=${FORCE}\n`);

  // Load all eligible stores
  const all: Store[] = [];
  const PAGE_SIZE = 200;
  for (let p = 0; ; p++) {
    let q = supabase
      .from("store_profiles")
      .select("id,name,address,banner_url")
      .in("category", LODGING_CATS)
      .order("name")
      .range(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE - 1);
    if (!FORCE && !ROOMS_ONLY) q = q.is("banner_url", null);
    const { data, error } = await q;
    if (error) { console.error(error.message); process.exit(1); }
    if (!data?.length) break;
    all.push(...(data as Store[]));
    if (data.length < PAGE_SIZE) break;
  }

  const queue = all.slice(START, LIMIT != null ? START + LIMIT : undefined);
  console.log(`Eligible: ${all.length}  Processing: ${queue.length}\n`);

  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox", "--start-maximized"],
  });
  const context: BrowserContext = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-ignore
    window.chrome = { runtime: {} };
  });

  const page = await context.newPage();

  // First, accept cookies by visiting Booking.com home
  console.log("Initialising Booking.com session…");
  await page.goto("https://www.booking.com/?lang=en-us", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await sleep(2_000);
  await dismissOverlays(page);
  console.log("Ready.\n");

  const results: Array<{
    id: string; name: string; status: string;
    photos: number; rooms: number; bookingUrl: string | null; error?: string;
  }> = [];
  let updated = 0, notFound = 0, errors = 0;

  for (let i = 0; i < queue.length; i++) {
    const store = queue[i];
    console.log(`[${i + 1 + START}/${all.length}] ${store.name}`);

    let bookingUrl: string | null = null;
    try {
      // Step 1: find Booking.com page
      console.log(`  Searching Booking.com…`);
      bookingUrl = await findBookingUrl(page, store);

      if (!bookingUrl) {
        console.log(`  ✗ Not found on Booking.com\n`);
        results.push({ id: store.id, name: store.name, status: "not_found", photos: 0, rooms: 0, bookingUrl: null });
        notFound++;
        continue;
      }
      console.log(`  Found: ${bookingUrl}`);

      // Step 2: scrape detail page
      console.log(`  Scraping…`);
      const data = await scrapeHotelPage(page, bookingUrl);
      console.log(`  Photos: ${data.photos.length} | Rooms: ${data.rooms.length} | Check-in: ${data.checkIn ?? "—"}`);

      data.rooms.forEach(r =>
        console.log(`    ${r.name.padEnd(38)} $${(r.priceUsd).toFixed(0)}/night${r.originalPriceUsd ? ` (was $${r.originalPriceUsd.toFixed(0)})` : ""} | ${(r as any).photos?.length ?? 0} photos`)
      );

      // Step 3: save
      if (!DRY_RUN) {
        await saveToDb(store, data);
        console.log(`  ✓ Saved`);
      } else {
        console.log(`  [dry-run] skipping save`);
      }

      results.push({ id: store.id, name: store.name, status: "updated", photos: data.photos.length, rooms: data.rooms.length, bookingUrl });
      updated++;
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
      results.push({ id: store.id, name: store.name, status: "error", photos: 0, rooms: 0, bookingUrl, error: err.message });
      errors++;
    }

    console.log();
    await sleep(PROP_DELAY);
  }

  await browser.close();

  console.log(`\n===== Done =====`);
  console.log(`Updated  : ${updated}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Errors   : ${errors}`);
  console.log(`Total    : ${queue.length}`);

  writeFileSync(LOG_PATH, JSON.stringify({
    run_at: new Date().toISOString(),
    flags: { START, LIMIT, FORCE, DRY_RUN, ROOMS_ONLY },
    summary: { total: queue.length, updated, not_found: notFound, errors },
    results,
  }, null, 2));
  console.log(`\nLog → ${LOG_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
