#!/usr/bin/env node
import { webkit } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:8081";
const target = process.argv[2] || "/chat";

const browser = await webkit.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const errors = [];
const consoleAll = [];
page.on("pageerror", (err) => errors.push(String(err?.message || err) + "\n" + (err?.stack || "")));
page.on("console", (msg) => consoleAll.push(`[${msg.type()}] ${msg.text()}`));

const t0 = Date.now();
try {
  await page.goto(`${BASE}${target}`, { waitUntil: "domcontentloaded", timeout: 120000 });
} catch (e) { errors.push(`nav: ${e?.message || e}`); }
await page.waitForTimeout(8000);
const ms = Date.now() - t0;

const overlay = await page.evaluate(() => {
  const h1 = Array.from(document.querySelectorAll("h1")).find(
    (el) => /^Something went wrong$/i.test(el.textContent?.trim() || "")
  );
  if (!h1) return "";
  const card = h1.closest("div")?.parentElement || document.body;
  const txt = card?.innerText || "";
  if (!/Try Again/i.test(txt) || !/Go Home/i.test(txt)) return "";
  return txt.slice(0, 800);
});

const bodyText = await page.evaluate(() => (document.body?.innerText || "").slice(0, 600));
await page.screenshot({ path: "/tmp/webkit-screenshot.png", fullPage: true });

writeFileSync("/tmp/webkit-debug.txt",
  `URL: ${target}\nLoad: ${ms}ms\n\nOVERLAY:\n${overlay || "(none)"}\n\n` +
  `BODY:\n${bodyText}\n\n` +
  `PAGE ERRORS (${errors.length}):\n${errors.join("\n---\n")}\n\n` +
  `CONSOLE (${consoleAll.length}):\n${consoleAll.slice(0, 80).join("\n")}\n`
);
console.log(`load: ${ms}ms`);
console.log(`overlay: ${overlay ? "YES" : "no"}`);
if (overlay) console.log(overlay);
console.log(`\nPAGE ERRORS:`);
errors.forEach((e, i) => console.log(`[${i}] ${e.slice(0, 500)}`));
console.log(`\nCONSOLE ERRORS (filtered):`);
consoleAll.filter((m) => m.startsWith("[error]"))
  .filter((m) => !/JWT|Failed to fetch|401|PGRST301|FunctionsFetchError/i.test(m))
  .slice(0, 15).forEach((m) => console.log(m.slice(0, 400)));

await browser.close();
process.exit(overlay ? 1 : 0);
