#!/usr/bin/env node
// Inject a fake Supabase session into localStorage to exercise the
// authenticated /chat code path. The JWT won't validate server-side
// (Supabase API calls return 401), but client-side `getSession()` will
// resolve and React will render as if logged in — surfacing any runtime
// errors in the authenticated code path.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:8081";
const PROJECT_REF = "slirphzzwcogdbkeicff";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const b64u = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const userId = "00000000-0000-4000-8000-000000000001";
const now = Math.floor(Date.now() / 1000);
const exp = now + 3600;
const jwt = `${b64u({ alg: "HS256", typ: "JWT" })}.${b64u({
  aud: "authenticated", role: "authenticated", sub: userId,
  email: "probe@example.test", iat: now, exp,
})}.fakesignature`;

const session = {
  access_token: jwt,
  refresh_token: "fake-refresh",
  expires_in: 3600,
  expires_at: exp,
  token_type: "bearer",
  user: {
    id: userId,
    aud: "authenticated",
    role: "authenticated",
    email: "probe@example.test",
    user_metadata: { full_name: "Probe User" },
    app_metadata: { provider: "email", providers: ["email"] },
    created_at: new Date(now * 1000).toISOString(),
  },
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Visit any same-origin page first so we can write localStorage for that origin
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.evaluate(
  ({ key, value }) => localStorage.setItem(key, value),
  { key: STORAGE_KEY, value: JSON.stringify(session) }
);

const errors = [];
const consoleErrors = [];
page.on("pageerror", (err) => errors.push(String(err?.message || err)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

const t0 = Date.now();
try {
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 90000 });
} catch (e) {
  errors.push(`nav: ${String(e?.message || e).slice(0, 200)}`);
}
await page.waitForTimeout(8000);
const ms = Date.now() - t0;

const overlay = await page.evaluate(() => {
  const t = document.body?.innerText || "";
  if (!/Something went wrong/i.test(t)) return "";
  const m = t.match(/(Something went wrong[\s\S]{0,500})/);
  return m ? m[0] : "ErrorBoundary tripped";
});

const bodySample = await page.evaluate(() =>
  (document.body?.innerText || "").slice(0, 1200)
);

await page.screenshot({ path: "/tmp/chat-auth-screenshot.png", fullPage: true });
writeFileSync("/tmp/chat-auth-debug.txt",
  `Load: ${ms}ms\n\nOVERLAY:\n${overlay || "(none)"}\n\n` +
  `BODY SAMPLE:\n${bodySample}\n\n` +
  `PAGE ERRORS (${errors.length}):\n${errors.join("\n")}\n\n` +
  `CONSOLE ERRORS (${consoleErrors.length}):\n${consoleErrors.slice(0, 30).join("\n")}\n`
);

console.log(`load: ${ms}ms`);
console.log(`overlay: ${overlay ? "YES — page crashed" : "no — page rendered"}`);
if (overlay) console.log(overlay.slice(0, 600));
console.log(`pageerrors (${errors.length}):`);
errors.slice(0, 8).forEach((e) => console.log(`  ${e.slice(0, 250)}`));
console.log(`console errors (${consoleErrors.length}):`);
consoleErrors.slice(0, 8).forEach((e) => console.log(`  ${e.slice(0, 250)}`));
console.log(`\nscreenshot: /tmp/chat-auth-screenshot.png`);

await browser.close();
process.exit(overlay || errors.length ? 1 : 0);
