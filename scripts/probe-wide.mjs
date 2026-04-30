#!/usr/bin/env node
import { chromium } from "@playwright/test";

const BASE = "http://localhost:8081";

// Broad sample covering high-traffic + every section
const ROUTES = [
  "/", "/feed", "/reels", "/live", "/chat", "/activity",
  "/account", "/account/profile-edit", "/account/wallet",
  "/account/notifications", "/account/security", "/account/settings",
  "/account/preferences", "/account/privacy", "/account/loyalty",
  "/account/membership", "/account/promos", "/account/saved-places",
  "/account/verification", "/account/scan-device", "/account/legal",
  "/account/cookies", "/account/data-rights", "/account/export",
  "/account/translation", "/account/travelers", "/account/addresses",
  "/account/favorites", "/account/gift-cards", "/account/invoices",
  "/account/receipts", "/account/referrals", "/account/reviews",
  "/account/subscriptions", "/account/tax", "/account/contact",
  "/account/accessibility", "/account/activity-log", "/account/analytics",
  "/account/link-device", "/account/linked-devices",
  "/help", "/help-center", "/about", "/partners",
  "/rides/hub",
  "/admin/analytics", "/admin/feedback", "/admin/employees", "/admin/launch",
  "/admin/moderation", "/admin/pricing", "/admin/remote-config",
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const broken = [];
let i = 0;
for (const route of ROUTES) {
  i++;
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err?.message || err)));
  let overlay = "";
  let navErr = "";
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    overlay = await page.evaluate(() => {
      const h1 = Array.from(document.querySelectorAll("h1")).find(
        (el) => /^Something went wrong$/i.test(el.textContent?.trim() || "")
      );
      if (!h1) return "";
      const card = h1.closest("div")?.parentElement || document.body;
      const txt = card?.innerText || "";
      if (!/Try Again/i.test(txt) || !/Go Home/i.test(txt)) return "";
      const m = txt.match(/(Can.t find variable[^\n]+|.* is not defined[^\n]+|Cannot read[^\n]+|undefined is not[^\n]+|TypeError[^\n]+|ReferenceError[^\n]+|SyntaxError[^\n]+|RangeError[^\n]+)/);
      return m ? m[0].slice(0, 250) : "ErrorBoundary tripped (no message extracted)";
    });
  } catch (e) {
    navErr = String(e?.message || e).slice(0, 100);
  }
  const realErr = overlay || errors.find((e) => !/networkidle|Timeout/.test(e));
  if (realErr) {
    broken.push({ route, overlay, errors });
    console.log(`[${i}/${ROUTES.length}] BROKEN  ${route}`);
    if (overlay) console.log(`   overlay: ${overlay}`);
    errors.slice(0, 3).forEach((e) => console.log(`   ${e.slice(0, 200)}`));
  } else {
    console.log(`[${i}/${ROUTES.length}] ok      ${route}${navErr ? "  (slow)" : ""}`);
  }
  page.removeAllListeners("pageerror");
}

await browser.close();
console.log(`\n${broken.length}/${ROUTES.length} broken`);
process.exit(broken.length ? 1 : 0);
