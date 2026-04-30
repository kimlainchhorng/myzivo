#!/usr/bin/env node
import { chromium } from "@playwright/test";
const BASE = "http://localhost:8081";
const ROUTES = ["/reels", "/live", "/help-center", "/partners", "/rides/hub"];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

for (const route of ROUTES) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err?.message || err)));
  const t0 = Date.now();
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    errors.push(`nav: ${String(e?.message || e).slice(0, 150)}`);
  }
  const ms = Date.now() - t0;
  const overlay = await page.evaluate(() => {
    const t = document.body?.innerText || "";
    if (!/Something went wrong/i.test(t)) return "";
    const m = t.match(/(Can.t find variable[^\n]*|.* is not defined[^\n]*|Cannot read[^\n]*|undefined is not[^\n]*)/);
    return m ? m[0].slice(0, 200) : "ErrorBoundary tripped";
  });
  const tag = overlay ? "BROKEN" : "ok";
  console.log(`${tag}  ${route}  (${ms}ms)`);
  if (overlay) console.log(`   ${overlay}`);
  for (const e of errors.slice(0, 3)) console.log(`   pageerror: ${e.slice(0, 200)}`);
  page.removeAllListeners("pageerror");
}
await browser.close();
