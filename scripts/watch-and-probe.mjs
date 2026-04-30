#!/usr/bin/env node
// Live watcher: when files in src/ change, debounces 3s then runs a
// WebKit smoke test against key routes. Emits one line per probe run
// to stdout — Monitor surfaces only the "BROKEN" lines as notifications.
//
// stdout protocol (each line is one event):
//   STATUS <ok|BROKEN> <ms> <route>:<detail>
//
// Tweaks:
//   FAST=1   — only probe /chat (~12s) instead of the full smoke set
//   ROUTES   — comma-separated override
import { webkit } from "@playwright/test";
import chokidar from "chokidar";

const BASE = "http://localhost:8081";
const PROJECT_REF = "slirphzzwcogdbkeicff";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;
const SMOKE = process.env.ROUTES
  ? process.env.ROUTES.split(",").map((s) => s.trim()).filter(Boolean)
  : process.env.FAST
  ? ["/chat"]
  : ["/", "/feed", "/chat", "/account", "/help-center"];

const b64u = (o) => Buffer.from(JSON.stringify(o)).toString("base64")
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const userId = "00000000-0000-4000-8000-000000000001";
const now = Math.floor(Date.now() / 1000), exp = now + 3600;
const jwt = `${b64u({ alg: "HS256", typ: "JWT" })}.${b64u({
  aud: "authenticated", role: "authenticated", sub: userId,
  email: "probe@example.test", iat: now, exp,
})}.fakesignature`;
const session = {
  access_token: jwt, refresh_token: "fake-refresh", expires_in: 3600,
  expires_at: exp, token_type: "bearer",
  user: { id: userId, aud: "authenticated", role: "authenticated",
    email: "probe@example.test",
    user_metadata: { full_name: "Probe User" },
    app_metadata: { provider: "email", providers: ["email"] },
    created_at: new Date(now * 1000).toISOString() },
};

const log = (line) => process.stdout.write(line + "\n");

const browser = await webkit.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
// Seed the fake session so we exercise authenticated code paths
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.evaluate(({ key, value }) => localStorage.setItem(key, value),
  { key: STORAGE_KEY, value: JSON.stringify(session) });

async function checkRoute(route) {
  const errors = [];
  const onErr = (err) => errors.push(String(err?.message || err));
  page.on("pageerror", onErr);
  const t0 = Date.now();
  let overlay = "";
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2500);
    overlay = await page.evaluate(() => {
      const h1 = Array.from(document.querySelectorAll("h1")).find(
        (el) => /^Something went wrong$/i.test(el.textContent?.trim() || "")
      );
      if (!h1) return "";
      const card = h1.closest("div")?.parentElement || document.body;
      const txt = card?.innerText || "";
      if (!/Try Again/i.test(txt) || !/Go Home/i.test(txt)) return "";
      const m = txt.match(/(Can.t find variable[^\n]+|.* is not defined[^\n]+|Cannot read[^\n]+|undefined is not[^\n]+|TypeError[^\n]+|ReferenceError[^\n]+|SyntaxError[^\n]+|RangeError[^\n]+)/);
      return m ? m[0].slice(0, 220) : "ErrorBoundary tripped (no message)";
    });
  } catch (e) {
    // nav timeout — keep going, it's likely Vite cold-compile
  }
  page.off("pageerror", onErr);
  const realErrors = errors.filter((e) =>
    !/Failed to fetch|JWT|401|FunctionsFetchError|PGRST301|access control checks|Importing a module script failed|Load failed|supabase\.co/i.test(e)
  );
  const ms = Date.now() - t0;
  return { ms, overlay, realErrors };
}

async function probeOnce(reason) {
  log(`RUN  reason=${reason}  routes=${SMOKE.length}`);
  let broken = 0;
  for (const route of SMOKE) {
    let r = await checkRoute(route);
    let recovered = false;
    // Transient-HMR retry: Vite mid-recompile races can show ErrorBoundary
    // for a few seconds. Retry once after a 4s settle to filter those out.
    if (r.overlay || r.realErrors.length) {
      await new Promise((res) => setTimeout(res, 4000));
      const r2 = await checkRoute(route);
      if (!r2.overlay && !r2.realErrors.length) {
        recovered = true;
        r = r2;
      } else {
        r = r2;
      }
    }
    if (r.overlay) {
      broken++;
      log(`BROKEN  ${r.ms}ms  ${route}  overlay: ${r.overlay}`);
    } else if (r.realErrors.length) {
      broken++;
      log(`BROKEN  ${r.ms}ms  ${route}  pageerror: ${r.realErrors[0].slice(0, 200)}`);
    } else if (recovered) {
      log(`ok      ${r.ms}ms  ${route}  (recovered after HMR settle)`);
    } else {
      log(`ok      ${r.ms}ms  ${route}`);
    }
  }
  log(`DONE  ${broken}/${SMOKE.length} broken`);
}

// Initial baseline run
await probeOnce("startup");

// Debounced re-run on src/ file save
let timer = null;
let lastFile = "";
const watcher = chokidar.watch("src", {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
});
watcher.on("all", (event, filePath) => {
  if (!/\.(tsx?|jsx?|css)$/.test(filePath)) return;
  lastFile = filePath;
  clearTimeout(timer);
  timer = setTimeout(() => probeOnce(`change:${lastFile}`), 3000);
});

// Keep alive
process.on("SIGTERM", async () => { await browser.close(); process.exit(0); });
process.on("SIGINT", async () => { await browser.close(); process.exit(0); });
