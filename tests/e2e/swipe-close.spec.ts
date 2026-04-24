/**
 * Swipe-down-to-close E2E QA.
 *
 * Drives Playwright's pointer API at controlled velocities to validate
 * the per-platform thresholds in `useSwipeDownClose` for all three
 * fullscreen post viewers (profile post, public profile post, reel
 * post-detail). Fails CI if:
 *  - A short, slow drag accidentally dismisses the overlay
 *  - A drag past the offset threshold fails to dismiss
 *  - A fast flick fails to dismiss
 *  - Vertical scrolling inside the overlay's scroll region triggers
 *    dismissal
 */

import { test, expect, type Page, type Locator } from "@playwright/test";

const VIEWPORT = { width: 393, height: 852 }; // iPhone 15 Pro

interface ViewerCase {
  name: string;
  /** Page route to open before locating the trigger thumbnail. */
  route: string;
  /** Selector that opens the fullscreen overlay when clicked. */
  triggerSelector: string;
  /** Selector for the visible grab handle inside the overlay. */
  grabHandleTestId: string;
  /** Selector that exists only while the overlay is mounted. */
  overlayPresenceTestId: string;
  /** Optional scrollable inner content selector for the scroll-test. */
  scrollableSelector?: string;
}

const CASES: ViewerCase[] = [
  {
    name: "profile post viewer",
    route: "/profile",
    triggerSelector: '[data-testid^="profile-post-thumb"]',
    grabHandleTestId: "profile-post-grab-handle",
    overlayPresenceTestId: "profile-post-close",
  },
  {
    name: "public profile post viewer",
    // Routed via deterministic seed user; CI fixture seeds this profile.
    route: "/u/qa-public-profile",
    triggerSelector: '[data-testid^="public-post-thumb"]',
    grabHandleTestId: "public-post-grab-handle",
    overlayPresenceTestId: "public-post-overlay-body",
  },
  {
    name: "reel post-detail viewer",
    route: "/feed",
    triggerSelector: '[data-testid^="feed-post-card"]',
    grabHandleTestId: "post-detail-grab-handle",
    overlayPresenceTestId: "post-detail-header",
  },
];

async function dragDown(
  page: Page,
  handle: Locator,
  distance: number,
  steps: number,
  stepDelayMs: number,
) {
  const box = await handle.boundingBox();
  if (!box) throw new Error("grab handle has no bounding box");
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    const y = startY + (distance * i) / steps;
    await page.mouse.move(startX, y, { steps: 1 });
    if (stepDelayMs > 0) await page.waitForTimeout(stepDelayMs);
  }
  await page.mouse.up();
}

async function openOverlay(page: Page, c: ViewerCase) {
  await page.goto(c.route, { waitUntil: "domcontentloaded" });
  const trigger = page.locator(c.triggerSelector).first();
  await trigger.waitFor({ state: "visible", timeout: 8000 });
  await trigger.click();
  await page
    .getByTestId(c.grabHandleTestId)
    .waitFor({ state: "visible", timeout: 5000 });
}

test.describe("swipe-down-to-close", () => {
  test.use({ viewport: VIEWPORT });

  for (const c of CASES) {
    test.describe(c.name, () => {
      test("short slow drag does NOT dismiss", async ({ page }) => {
        await openOverlay(page, c);
        const handle = page.getByTestId(c.grabHandleTestId);
        await dragDown(page, handle, 60, 12, 16);
        // Overlay should remain mounted.
        await expect(page.getByTestId(c.overlayPresenceTestId)).toBeVisible();
      });

      test("long drag past threshold dismisses", async ({ page }) => {
        await openOverlay(page, c);
        const handle = page.getByTestId(c.grabHandleTestId);
        await dragDown(page, handle, 220, 14, 14);
        await expect(page.getByTestId(c.overlayPresenceTestId)).toHaveCount(0, {
          timeout: 2000,
        });
      });

      test("fast flick dismisses", async ({ page }) => {
        await openOverlay(page, c);
        const handle = page.getByTestId(c.grabHandleTestId);
        // 60px in ~80ms ≈ 750+ px/s
        await dragDown(page, handle, 60, 4, 18);
        await expect(page.getByTestId(c.overlayPresenceTestId)).toHaveCount(0, {
          timeout: 2000,
        });
      });

      test("inner scroll does NOT dismiss", async ({ page }) => {
        await openOverlay(page, c);
        // Scroll well below the grab handle to mimic finger-on-content.
        const overlay = page.getByTestId(c.overlayPresenceTestId);
        const box = await overlay.boundingBox();
        if (!box) test.skip();
        const startX = box!.x + box!.width / 2;
        const startY = box!.y + box!.height - 80;
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        for (let i = 1; i <= 10; i++) {
          await page.mouse.move(startX, startY + 30 * i, { steps: 1 });
          await page.waitForTimeout(12);
        }
        await page.mouse.up();
        await expect(page.getByTestId(c.overlayPresenceTestId)).toBeVisible();
      });
    });
  }
});
