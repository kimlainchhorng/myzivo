#!/usr/bin/env node
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:8081";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const errors = [];
const consoleErrors = [];
const failed = [];

page.on("pageerror", (err) => errors.push(String(err?.message || err)));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("response", (res) => {
  if (res.status() >= 400) failed.push(`${res.status()}  ${res.url().replace(BASE, "")}`);
});
page.on("requestfailed", (req) =>
  failed.push(`FAIL  ${req.url().replace(BASE, "")}  ${req.failure()?.errorText}`)
);

const t0 = Date.now();
try {
  await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded", timeout: 180000 });
} catch (e) {
  errors.push(`navigation: ${String(e?.message || e).slice(0, 200)}`);
}
// Let the React tree mount and any deferred imports run
await page.waitForTimeout(8000);

const ms = Date.now() - t0;
const overlayText = await page.evaluate(() => {
  const root = document.body;
  if (!root) return "";
  const text = root.innerText || "";
  if (!/Something went wrong/i.test(text)) return "";
  const m = text.match(/(Something went wrong[\s\S]{0,400})/);
  return m ? m[0] : "ErrorBoundary tripped (couldn't extract message)";
});

const renderedTitle = await page.title();
const bodyTextSample = await page.evaluate(() => (document.body?.innerText || "").slice(0, 500));

writeFileSync("/tmp/chat-debug.txt",
  `URL: ${page.url()}\nLoad time: ${ms}ms\nTitle: ${renderedTitle}\n\n` +
  `OVERLAY:\n${overlayText || "(none)"}\n\n` +
  `BODY SAMPLE:\n${bodyTextSample}\n\n` +
  `PAGE ERRORS (${errors.length}):\n${errors.join("\n")}\n\n` +
  `CONSOLE ERRORS (${consoleErrors.length}):\n${consoleErrors.slice(0, 20).join("\n")}\n\n` +
  `FAILED REQUESTS (${failed.length}):\n${failed.slice(0, 20).join("\n")}\n`
);
await page.screenshot({ path: "/tmp/chat-screenshot.png", fullPage: true });

console.log(`load: ${ms}ms`);
console.log(`title: ${renderedTitle}`);
console.log(`overlay: ${overlayText ? "YES" : "no"}`);
if (overlayText) console.log(overlayText.slice(0, 400));
console.log(`pageerrors: ${errors.length}`);
errors.slice(0, 5).forEach((e) => console.log(`  ${e.slice(0, 200)}`));
console.log(`console errors: ${consoleErrors.length}`);
consoleErrors.slice(0, 5).forEach((e) => console.log(`  ${e.slice(0, 200)}`));
console.log(`failed requests: ${failed.length}`);
failed.slice(0, 8).forEach((f) => console.log(`  ${f.slice(0, 200)}`));
console.log(`\nfull report: /tmp/chat-debug.txt`);
console.log(`screenshot:  /tmp/chat-screenshot.png`);

await browser.close();
process.exit(overlayText ? 1 : 0);
