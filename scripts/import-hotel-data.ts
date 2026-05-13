/**
 * Hotel Data Auto-Import Script
 *
 * Bulk-fetches hotel/resort data from TripAdvisor for all properties
 * in store_profiles and saves photos, ratings, and facilities to Supabase.
 *
 * Usage (requires service-role key):
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *     bun scripts/import-hotel-data.ts [options]
 *
 * Options:
 *   --start=N    Skip first N properties (default: 0, for resuming)
 *   --limit=N    Process at most N properties (default: all)
 *   --force      Re-process even if banner_url is already set
 *   --dry-run    Fetch and log but don't write to Supabase
 *   --log=PATH   Write JSON results log to this path (default: import-results-DATE.json)
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- CLI flags ---
const args = process.argv.slice(2);
const getIntFlag = (name: string, def: number | null = null): number | null => {
  const f = args.find(a => a.startsWith(`--${name}=`));
  return f ? parseInt(f.split("=")[1], 10) : def;
};
const getStrFlag = (name: string, def: string | null = null): string | null => {
  const f = args.find(a => a.startsWith(`--${name}=`));
  return f ? f.split("=").slice(1).join("=") : def;
};

const START = getIntFlag("start", 0)!;
const LIMIT = getIntFlag("limit");
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const LOG_PATH = getStrFlag("log") ?? `import-results-${new Date().toISOString().slice(0, 10)}.json`;

// --- Config ---
const REQUEST_DELAY_MS = 3000;   // between individual HTTP requests
const PROPERTY_DELAY_MS = 6000;  // between properties (to be polite to servers)
const MAX_RETRIES = 3;
const FETCH_TIMEOUT_MS = 30000;

const LODGING_CATEGORIES = ["hotel", "resort", "guesthouse", "hostel", "villa", "lodge", "motel", "inn", "boutique"];

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Upgrade-Insecure-Requests": "1",
};

// --- Types ---
interface Property {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  banner_url: string | null;
  gallery_images: unknown[] | null;
  category: string | null;
  description: string | null;
}

interface ImportResult {
  id: string;
  name: string;
  status: "updated" | "skipped" | "not_found" | "error";
  photos: number;
  rating: number | null;
  tripadvisor_url?: string;
  error?: string;
}

interface GalleryImage {
  url: string;
  caption: string;
  order: number;
}

interface TripAdvisorData {
  photos: string[];
  rating: number | null;
  description: string | null;
  facilities: string[];
  checkIn: string | null;
  checkOut: string | null;
}

// --- Utilities ---
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractCity(address: string | null): string {
  if (!address) return "Cambodia";
  const parts = address.split(",").map(p => p.trim()).filter(Boolean);
  const nonCambodia = parts.filter(p => !p.toLowerCase().includes("cambodia"));
  // City is usually near the end: "Street, Khan, City, Province, Cambodia"
  if (nonCambodia.length >= 2) return nonCambodia[nonCambodia.length - 2];
  if (nonCambodia.length >= 1) return nonCambodia[nonCambodia.length - 1];
  return "Cambodia";
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter(u => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// --- HTTP ---
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status === 503) {
        console.log(`    Rate limited (${res.status}), waiting 15s…`);
        await sleep(15000);
        continue;
      }
      if (!res.ok) {
        console.log(`    HTTP ${res.status} for ${url}`);
        if (attempt < retries - 1) await sleep(REQUEST_DELAY_MS);
        continue;
      }
      return await res.text();
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log(`    Timeout after ${FETCH_TIMEOUT_MS / 1000}s`);
      } else {
        console.log(`    Fetch error: ${err.message}`);
      }
      if (attempt < retries - 1) await sleep(REQUEST_DELAY_MS);
    }
  }
  return null;
}

// --- TripAdvisor parsing ---
function extractTAPhotos(html: string): string[] {
  const photos: string[] = [];

  // CDN URLs embedded in HTML (various sizes — normalise to "photo-o" for highest quality)
  const re = /dynamic-media-cdn\.tripadvisor\.com\/media\/photo-[a-z]\/[\w/.\-]+\.(?:jpg|jpeg|png|webp)/gi;
  for (const m of html.matchAll(re)) {
    const url = "https://" + m[0].replace(/\/photo-[a-z]\//, "/photo-o/");
    photos.push(url);
  }

  // JSON-embedded photo arrays: "url":"https://dynamic..."
  const jsonRe = /"(?:url|src|imageUrl|photoUrl)":\s*"(https:\/\/dynamic-media-cdn\.tripadvisor\.com\/media\/photo-[a-z]\/[^"]+)"/gi;
  for (const m of html.matchAll(jsonRe)) {
    const url = m[1].replace(/\/photo-[a-z]\//, "/photo-o/");
    photos.push(url);
  }

  return dedupeUrls(photos);
}

function extractTARating(html: string): number | null {
  // JSON-LD structured data
  for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const ld = JSON.parse(m[1]);
      const rv = ld?.aggregateRating?.ratingValue;
      if (rv) return parseFloat(String(rv));
    } catch {}
  }
  // Embedded JSON blobs
  const ratingRe = /"ratingValue":\s*"?([\d.]+)/;
  const rm = html.match(ratingRe);
  if (rm) return parseFloat(rm[1]);
  // Bubble rating attribute
  const bubbleRe = /data-rating="([\d.]+)"/;
  const bm = html.match(bubbleRe);
  if (bm) return parseFloat(bm[1]);
  return null;
}

function extractTADescription(html: string): string | null {
  // og:description (most reliable)
  const og = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
  if (og) return decodeHtmlEntities(og[1]);

  // JSON-LD description
  for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const ld = JSON.parse(m[1]);
      if (ld?.description) return String(ld.description);
    } catch {}
  }
  return null;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

const KNOWN_FACILITIES = [
  "Swimming Pool", "Outdoor Pool", "Indoor Pool", "Infinity Pool",
  "Free WiFi", "WiFi", "High-Speed Internet",
  "Restaurant", "Bar", "Lounge", "Coffee Shop", "Café",
  "Spa", "Massage", "Wellness Center", "Sauna", "Steam Room",
  "Fitness Center", "Gym", "Exercise Room",
  "Free Parking", "Parking", "Valet Parking",
  "Airport Transfer", "Airport Shuttle",
  "Room Service", "24-Hour Room Service",
  "Laundry Service", "Dry Cleaning",
  "24-Hour Front Desk", "Concierge",
  "Air Conditioning",
  "Breakfast Available", "Breakfast Included",
  "Beach Access", "Beachfront", "Private Beach",
  "Ocean View", "Sea View", "Mountain View",
  "Garden", "Terrace", "Balcony",
  "Meeting Room", "Business Center", "Conference Room",
  "Kids Club", "Children's Pool", "Playground",
  "Tour Desk", "Car Rental", "Bicycle Rental",
  "Non-Smoking Rooms", "Smoking Area",
  "Pet Friendly", "Pets Allowed",
  "Elevator", "Lift",
  "Safety Deposit Box", "Luggage Storage",
  "Currency Exchange", "ATM",
];

function extractTAFacilities(html: string): string[] {
  const found = new Set<string>();

  // Try JSON amenities array
  for (const m of html.matchAll(/"(?:amenities|facilities|amenity)":\s*\[([^\]]{1,2000})\]/gi)) {
    for (const item of m[1].matchAll(/"([^"]{3,80})"/g)) {
      found.add(toTitleCase(item[1].trim()));
    }
  }

  // Keyword scan
  for (const kw of KNOWN_FACILITIES) {
    if (html.includes(kw)) found.add(kw);
  }

  return [...found];
}

function extractTACheckInOut(html: string): { checkIn: string | null; checkOut: string | null } {
  const timeRe = /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
  const checkInRe = new RegExp(`[Cc]heck[- ]?[Ii]n[^<]{0,60}?${timeRe.source}`, "i");
  const checkOutRe = new RegExp(`[Cc]heck[- ]?[Oo]ut[^<]{0,60}?${timeRe.source}`, "i");
  const ciMatch = html.match(checkInRe);
  const coMatch = html.match(checkOutRe);
  return {
    checkIn: ciMatch ? ciMatch[1].trim() : null,
    checkOut: coMatch ? coMatch[1].trim() : null,
  };
}

// --- TripAdvisor search + fetch ---
async function searchTripAdvisor(name: string, city: string): Promise<string | null> {
  const q = encodeURIComponent(`${name} ${city} Cambodia`);
  const url = `https://www.tripadvisor.com/Search?q=${q}&searchSessionId=&sid=&blockRedirect=true`;
  const html = await fetchWithRetry(url);
  if (!html) return null;

  // Match /Hotel_Review-gXXXX-dXXXX-Reviews-Name-City.html
  const re = /\/Hotel_Review-g\d+-d\d+-Reviews-[^"'\s>]{4,200}\.html/g;
  const matches = [...new Set(html.match(re) ?? [])];
  if (matches.length === 0) return null;

  // Prefer match that contains part of the hotel name
  const nameParts = name.toLowerCase().replace(/[^a-z0-9]/g, "_").split("_").filter(p => p.length > 3);
  const preferred = matches.find(m => nameParts.some(p => m.toLowerCase().includes(p)));
  return "https://www.tripadvisor.com" + (preferred ?? matches[0]);
}

async function fetchTripAdvisorData(pageUrl: string): Promise<TripAdvisorData | null> {
  await sleep(REQUEST_DELAY_MS);
  const html = await fetchWithRetry(pageUrl);
  if (!html) return null;

  const photos = extractTAPhotos(html);
  const rating = extractTARating(html);
  const description = extractTADescription(html);
  const facilities = extractTAFacilities(html);
  const { checkIn, checkOut } = extractTACheckInOut(html);

  return { photos, rating, description, facilities, checkIn, checkOut };
}

// --- Supabase writes ---
async function updateStoreProfile(
  id: string,
  banner_url: string,
  gallery_images: GalleryImage[],
  rating: number | null,
  description: string | null,
): Promise<void> {
  if (DRY_RUN) { console.log(`    [dry-run] store_profiles update for ${id}`); return; }

  const payload: Record<string, unknown> = { banner_url, gallery_images };
  if (rating !== null) payload.rating = rating;
  if (description) payload.description = description;

  const { error } = await supabase.from("store_profiles").update(payload).eq("id", id);
  if (error) throw new Error(`store_profiles update: ${error.message}`);
}

async function upsertLodgeProfile(
  storeId: string,
  facilities: string[],
  popularAmenities: string[],
  checkIn: string | null,
  checkOut: string | null,
): Promise<void> {
  if (DRY_RUN) { console.log(`    [dry-run] lodge_property_profile upsert for ${storeId}`); return; }

  const payload: Record<string, unknown> = {
    store_id: storeId,
    facilities,
    popular_amenities: popularAmenities,
  };
  if (checkIn) payload.check_in_from = checkIn;
  if (checkOut) payload.check_out_until = checkOut;

  const { error } = await supabase
    .from("lodge_property_profile")
    .upsert(payload, { onConflict: "store_id", ignoreDuplicates: false });
  if (error) throw new Error(`lodge_property_profile upsert: ${error.message}`);
}

// --- Main ---
async function main(): Promise<void> {
  console.log(`\nZIVO Hotel Data Auto-Import`);
  console.log(`============================`);
  if (DRY_RUN) console.log(`** DRY RUN — no database writes **`);
  console.log(`Flags: start=${START}, limit=${LIMIT ?? "all"}, force=${FORCE}`);
  console.log();

  // Load properties in pages
  console.log("Loading lodging properties from Supabase…");
  const allProps: Property[] = [];
  const PAGE = 200;

  for (let page = 0; ; page++) {
    let q = supabase
      .from("store_profiles")
      .select("id, name, address, latitude, longitude, rating, banner_url, gallery_images, category, description")
      .in("category", LODGING_CATEGORIES)
      .order("name", { ascending: true })
      .range(page * PAGE, page * PAGE + PAGE - 1);

    if (!FORCE) q = q.is("banner_url", null);

    const { data, error } = await q;
    if (error) { console.error("Failed to load:", error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    allProps.push(...(data as Property[]));
    if (data.length < PAGE) break;
  }

  const queue = allProps.slice(START, LIMIT != null ? START + LIMIT : undefined);
  console.log(`Total eligible: ${allProps.length} | Processing: ${queue.length}`);
  console.log();

  const results: ImportResult[] = [];
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < queue.length; i++) {
    const prop = queue[i];
    console.log(`[${i + 1}/${queue.length}] ${prop.name}`);
    const city = extractCity(prop.address);

    const result: ImportResult = {
      id: prop.id,
      name: prop.name,
      status: "not_found",
      photos: 0,
      rating: null,
    };

    try {
      // 1. Find TripAdvisor page
      const taUrl = await searchTripAdvisor(prop.name, city);
      await sleep(REQUEST_DELAY_MS);

      if (!taUrl) {
        console.log(`    Not found on TripAdvisor (city: ${city})`);
        result.status = "not_found";
        results.push(result);
        notFound++;
        await sleep(PROPERTY_DELAY_MS);
        continue;
      }

      result.tripadvisor_url = taUrl;
      console.log(`    Found: ${taUrl}`);

      // 2. Scrape property page
      const ta = await fetchTripAdvisorData(taUrl);

      if (!ta || ta.photos.length === 0) {
        console.log(`    Could not extract photos from TripAdvisor page`);
        result.status = "not_found";
        results.push(result);
        notFound++;
        await sleep(PROPERTY_DELAY_MS);
        continue;
      }

      result.photos = ta.photos.length;
      result.rating = ta.rating;
      console.log(`    Photos: ${ta.photos.length} | Rating: ${ta.rating ?? "—"} | Facilities: ${ta.facilities.length}`);
      if (ta.checkIn) console.log(`    Check-in: ${ta.checkIn} | Check-out: ${ta.checkOut ?? "—"}`);

      // 3. Build gallery (cap at 50 images)
      const gallery: GalleryImage[] = ta.photos.slice(0, 50).map((url, idx) => ({
        url,
        caption: `${prop.name}`,
        order: idx,
      }));

      // 4. Write to Supabase
      await updateStoreProfile(prop.id, ta.photos[0], gallery, ta.rating, ta.description);

      if (ta.facilities.length > 0 || ta.checkIn || ta.checkOut) {
        await upsertLodgeProfile(
          prop.id,
          ta.facilities,
          ta.facilities.slice(0, 12),
          ta.checkIn,
          ta.checkOut,
        );
      }

      result.status = "updated";
      updated++;
      console.log(`    ✓ Saved`);
    } catch (err: any) {
      result.status = "error";
      result.error = err.message;
      errors++;
      console.error(`    ✗ ${err.message}`);
    }

    results.push(result);
    await sleep(PROPERTY_DELAY_MS);
  }

  // Summary
  console.log(`\n===== Import Complete =====`);
  console.log(`Updated:   ${updated}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Errors:    ${errors}`);
  console.log(`Total:     ${queue.length}`);

  // Write log
  const log = {
    run_at: new Date().toISOString(),
    flags: { START, LIMIT, FORCE, DRY_RUN },
    summary: { total: queue.length, updated, not_found: notFound, errors },
    results,
  };
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
  console.log(`\nResults log → ${LOG_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
