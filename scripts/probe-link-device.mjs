#!/usr/bin/env node
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

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

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.evaluate(({ key, value }) => localStorage.setItem(key, value),
  { key: STORAGE_KEY, value: JSON.stringify(session) });

const errors = [];
const consoleAll = [];
page.on("pageerror", (err) => errors.push(String(err?.message || err) + "\n" + (err?.stack || "")));
page.on("console", (msg) => consoleAll.push(`[${msg.type()}] ${msg.text()}`));

try {
  await page.goto(`${BASE}/account/link-device`, { waitUntil: "domcontentloaded", timeout: 60000 });
} catch (e) { errors.push(`nav: ${e?.message || e}`); }
await page.waitForTimeout(4000);

const fullText = await page.evaluate(() => document.body?.innerText || "");
await page.screenshot({ path: "/tmp/link-device-screenshot.png", fullPage: true });

writeFileSync("/tmp/link-device-debug.txt",
  `URL: ${page.url()}\n\nFULL BODY TEXT:\n${fullText}\n\n` +
  `PAGE ERRORS (${errors.length}):\n${errors.join("\n---\n")}\n\n` +
  `CONSOLE (${consoleAll.length}):\n${consoleAll.slice(0, 60).join("\n")}\n`
);
console.log("BODY TEXT (first 800):");
console.log(fullText.slice(0, 800));
console.log("\nPAGE ERRORS:");
errors.forEach((e, i) => console.log(`[${i}] ${e.slice(0, 600)}`));
console.log("\nCONSOLE ERRORS (filtered):");
consoleAll.filter((m) => m.startsWith("[error]") && !/JWT|Failed to fetch|401|PGRST301|FunctionsFetchError/i.test(m)).slice(0, 15).forEach((m) => console.log(m.slice(0, 400)));

await browser.close();
