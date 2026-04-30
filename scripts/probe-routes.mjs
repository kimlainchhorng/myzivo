#!/usr/bin/env node
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:8081";
const ROUTES = [
  "/", "/feed", "/chat", "/activity", "/account", "/help",
  "/account/profile-edit", "/account/scan-device",
  "/about", "/account/wallet", "/account/notifications",
  "/account/security", "/account/settings",
  "/admin/analytics", "/admin/feedback",
  "/account/preferences", "/account/privacy",
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const results = [];
for (const route of ROUTES) {
  const errors = [];
  const fetchFails = [];
  const onError = (err) => errors.push(String(err?.message || err));
  const onResponse = (res) => {
    if (res.status() >= 400) {
      fetchFails.push(`${res.status()} ${res.url().replace(BASE, "")}`);
    }
  };
  page.on("pageerror", onError);
  page.on("response", onResponse);
  let overlayText = "";
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2500);
    overlayText = await page.evaluate(() => {
      const root = document.body;
      if (!root) return "";
      const text = root.innerText || "";
      if (!/Something went wrong/i.test(text)) return "";
      const match = text.match(/(Can.t find variable[^\n]*|.* is not defined[^\n]*|Cannot read[^\n]*|undefined is not[^\n]*|Failed to fetch[^\n]*)/);
      return match ? match[0].slice(0, 200) : "ErrorBoundary tripped";
    });
  } catch (e) {
    errors.push(`navigation: ${String(e?.message || e).slice(0, 150)}`);
  }
  page.off("pageerror", onError);
  page.off("response", onResponse);
  results.push({ route, errors, fetchFails, overlayText });
}

await browser.close();

let bad = 0;
for (const r of results) {
  const realError = r.overlayText || r.errors.some((e) => !/Timeout|networkidle/.test(e));
  if (realError) bad++;
  const tag = realError ? "BROKEN" : (r.errors.length ? "slow  " : "ok    ");
  console.log(`${tag}  ${r.route}`);
  if (r.overlayText) console.log(`   overlay: ${r.overlayText}`);
  for (const e of r.errors) console.log(`   pageerror: ${e.slice(0, 200)}`);
  const realFetchFails = r.fetchFails.filter((f) => !/favicon|sourcemap|\.map$/.test(f));
  for (const e of realFetchFails.slice(0, 3))
    console.log(`   fetch:     ${e.slice(0, 200)}`);
}
console.log(`\n${bad}/${results.length} broken`);
process.exit(bad ? 1 : 0);
