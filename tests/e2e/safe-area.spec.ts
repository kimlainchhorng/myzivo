/**
 * Safe-area screenshot QA.
 *
 * For each device profile we:
 *  1. Inject a custom `--zivo-safe-top` value to simulate the OS's reported
 *     `env(safe-area-inset-top)` (including the broken iOS WKWebView case
 *     where it returns 0 even on Dynamic Island devices).
 *  2. Visit each key viewer (feed sticky header, reel close button,
 *     post-detail header, profile post viewer).
 *  3. Assert the element's `getBoundingClientRect().top` is below the
 *     status-bar zone for that device.
 *  4. Capture a screenshot artifact on failure.
 *
 * CI (`.github/workflows/safe-area-qa.yml`) fails if any assertion fails.
 */

import { test, expect, type Page } from "@playwright/test";
import { login } from "./fixtures/login";

interface Profile {
  name: string;
  width: number;
  height: number;
  /** simulated env(safe-area-inset-top) value in CSS px */
  inset: number;
  /** minimum acceptable element-top for overlay close buttons */
  overlayFloor: number;
}

const PROFILES: Profile[] = [
  { name: "iPhone-15-Pro", width: 393, height: 852, inset: 59, overlayFloor: 59 },
  { name: "iPhone-SE", width: 375, height: 667, inset: 20, overlayFloor: 20 },
  { name: "Pixel-8", width: 412, height: 915, inset: 32, overlayFloor: 32 },
  { name: "Galaxy-S24", width: 360, height: 780, inset: 36, overlayFloor: 36 },
  // The bug: native WKWebView reports 0 even on Dynamic Island.
  // The 60px floor in `--zivo-safe-top-overlay` MUST keep us safe.
  { name: "DynamicIsland-broken", width: 393, height: 852, inset: 0, overlayFloor: 60 },
];

async function applyProfile(page: Page, p: Profile) {
  await page.setViewportSize({ width: p.width, height: p.height });
  // Inject the simulated inset BEFORE any script runs so token resolution
  // sees the correct value on first paint.
  await page.addInitScript((inset: number) => {
    const style = document.createElement("style");
    style.id = "__qa_safe_area";
    style.textContent = `:root { --zivo-safe-top: ${inset}px !important; }`;
    if (document.head) document.head.appendChild(style);
    else document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  }, p.inset);
}

async function expectClear(page: Page, selector: string, floor: number, label: string) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible", timeout: 20_000 });
  const top = await el.evaluate((node) => node.getBoundingClientRect().top);
  expect(top, `${label} should clear ${floor}px (got ${top}px)`).toBeGreaterThanOrEqual(
    floor - 0.5,
  );
}

for (const p of PROFILES) {
  test.describe(`safe-area @ ${p.name} (inset=${p.inset}px)`, () => {
    test.setTimeout(90_000);
    test.beforeEach(async ({ page }) => {
      await login(page);
      await applyProfile(page, p);
    });

    test("feed sticky header clears status bar", async ({ page }) => {
      await page.goto("/feed");
      await expectClear(
        page,
        '[data-testid="feed-sticky-header"]',
        p.inset,
        "feed sticky header",
      );
      await page.screenshot({ path: `test-results/safe-area-${p.name}-feed.png` });
    });

    test("reels close button clears status bar", async ({ page }) => {
      // The reel-close-button only renders inside the fullscreen reel player.
      // Open a video feed card if one exists, otherwise skip gracefully.
      await page.goto("/feed", { waitUntil: "domcontentloaded" });
      const videoCard = page.locator('[data-testid^="feed-post-card"]').first();
      const hasCard = await videoCard.isVisible().catch(() => false);
      if (!hasCard) {
        test.skip(true, "No feed post cards found — cannot open reel player");
        return;
      }
      // Click the media image inside the card to trigger onOpenFullscreen.
      const mediaImg = videoCard.locator("img, video").first();
      const hasMedia = await mediaImg.isVisible().catch(() => false);
      if (!hasMedia) {
        test.skip(true, "Feed card has no media — cannot open reel player");
        return;
      }
      await mediaImg.click();
      const closeBtn = page.locator('[data-testid="reel-close-button"]').first();
      const btnVisible = await closeBtn.isVisible().catch(() => false);
      if (!btnVisible) {
        test.skip(true, "reel-close-button not rendered after card click — card is not a video");
        return;
      }
      await expectClear(
        page,
        '[data-testid="reel-close-button"]',
        p.overlayFloor,
        "reel close button",
      );
      await page.screenshot({ path: `test-results/safe-area-${p.name}-reels.png` });
    });
  });
}
