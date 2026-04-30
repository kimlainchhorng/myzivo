#!/usr/bin/env node
import { webkit } from "@playwright/test";
const BASE = "http://localhost:8081";
const PROJECT_REF = "slirphzzwcogdbkeicff";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;
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
// Use a phone-ish width so the lg:hidden mobile header is visible
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
// Intercept Supabase auth/v1/user so userId-gated UI renders in screenshots
await ctx.route("**/auth/v1/user**", (route) => {
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      id: userId, aud: "authenticated", role: "authenticated",
      email: "probe@example.test",
      user_metadata: { full_name: "Probe User" },
      app_metadata: { provider: "email", providers: ["email"] },
      created_at: new Date(now * 1000).toISOString(),
    }),
  });
});
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.evaluate(({ key, value }) => localStorage.setItem(key, value),
  { key: STORAGE_KEY, value: JSON.stringify(session) });
await page.goto(`${BASE}/feed`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: "/tmp/feed-header.png", fullPage: false, clip: { x: 0, y: 0, width: 390, height: 600 } });
console.log("/tmp/feed-header.png");
await browser.close();
