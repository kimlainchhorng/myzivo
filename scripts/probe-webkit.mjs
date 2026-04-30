#!/usr/bin/env node
// Same as probe-auth-wide.mjs but uses WebKit (Safari engine) to catch
// Safari-only ReferenceErrors like `requestIdleCallback`.
import { webkit } from "@playwright/test";

const BASE = "http://localhost:8081";
const PROJECT_REF = "slirphzzwcogdbkeicff";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;
const ROUTES = process.argv.slice(2).length > 0 ? process.argv.slice(2) : [
  "/", "/feed", "/reels", "/live", "/chat", "/activity",
  "/account", "/account/profile-edit", "/account/wallet",
  "/account/notifications", "/account/security", "/account/settings",
  "/account/preferences", "/account/privacy",
  "/account/scan-device", "/account/link-device", "/account/linked-devices",
  "/help", "/help-center", "/about", "/partners", "/rides/hub",
  "/chat/contacts", "/chat/nearby", "/chat/find-contacts", "/chat/blocked",
];

const b64u = (o) => Buffer.from(JSON.stringify(o)).toString("base64")
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const userId = "00000000-0000-4000-8000-000000000001";
const now = Math.floor(Date.now() / 1000), exp = now + 3600;
const jwt = `${b64u({ alg:"HS256", typ:"JWT" })}.${b64u({
  aud:"authenticated", role:"authenticated", sub:userId,
  email:"probe@example.test", iat:now, exp,
})}.fakesignature`;
const session = {
  access_token: jwt, refresh_token: "fake-refresh", expires_in: 3600,
  expires_at: exp, token_type: "bearer",
  user: { id: userId, aud:"authenticated", role:"authenticated",
    email:"probe@example.test",
    user_metadata:{ full_name:"Probe User" },
    app_metadata:{ provider:"email", providers:["email"] },
    created_at: new Date(now*1000).toISOString() },
};

const browser = await webkit.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.evaluate(({ key, value }) => localStorage.setItem(key, value),
  { key: STORAGE_KEY, value: JSON.stringify(session) });

const broken = [];
let i = 0;
for (const route of ROUTES) {
  i++;
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err?.message || err)));
  let overlay = "";
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(3000);
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
    // navigation timeout — keep going
  }
  const realErrors = errors.filter((e) =>
    !/Failed to fetch|JWT|401|FunctionsFetchError|PGRST301|access control checks|Importing a module script failed|Load failed|supabase\.co/i.test(e)
  );
  if (overlay || realErrors.length) {
    broken.push({ route, overlay, realErrors });
    console.log(`[${i}/${ROUTES.length}] BROKEN  ${route}`);
    if (overlay) console.log(`   overlay: ${overlay}`);
    realErrors.slice(0, 3).forEach((e) => console.log(`   pageerror: ${e.slice(0, 220)}`));
  } else {
    console.log(`[${i}/${ROUTES.length}] ok      ${route}`);
  }
  page.removeAllListeners("pageerror");
}

await browser.close();
console.log(`\n${broken.length}/${ROUTES.length} broken (WebKit/Safari)`);
process.exit(broken.length ? 1 : 0);
