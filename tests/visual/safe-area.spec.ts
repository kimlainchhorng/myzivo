/**
 * Visual regression tests for safe-area handling.
 *
 * Captures the top 100px of key routes on multiple iPhone viewports to detect
 * the white-bar regression that occurs when safe-area floors are reintroduced.
 *
 * Usage:
 *   bun run test:visual            # run against baselines
 *   bun run test:visual --update-snapshots   # refresh baselines
 *
 * Note: requires Playwright. The first run will create baselines under
 * tests/visual/__screenshots__/ — review and commit them.
 *
 * See: docs/dev/capacitor-safe-area.md
 */
import { test, expect, devices } from "@playwright/test";

const VIEWPORTS = [
  { name: "iphone-se", ...devices["iPhone SE"] },
  { name: "iphone-13", ...devices["iPhone 13"] },
  { name: "iphone-14-pro-max", ...devices["iPhone 14 Pro Max"] },
];

const ROUTES = [
  { name: "home", path: "/" },
  { name: "account", path: "/account" },
  { name: "profile", path: "/profile" },
  { name: "chat", path: "/chat" },
];

for (const vp of VIEWPORTS) {
  test.describe(`safe-area · ${vp.name}`, () => {
    test.use({ viewport: vp.viewport, userAgent: vp.userAgent });

    for (const route of ROUTES) {
      test(`top region — ${route.name}`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "networkidle" });
        // Allow any safe-area / font-loading shifts to settle.
        await page.waitForTimeout(400);

        // Capture only the top 100px — that's where the regression appears.
        const screenshot = await page.screenshot({
          clip: { x: 0, y: 0, width: vp.viewport.width, height: 100 },
        });

        expect(screenshot).toMatchSnapshot(`${vp.name}-${route.name}-top.png`, {
          maxDiffPixelRatio: 0.001, // ~0.1%
        });
      });
    }
  });
}
