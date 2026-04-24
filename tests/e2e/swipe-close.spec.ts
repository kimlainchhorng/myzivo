/**
 * Swipe-down-to-close E2E QA — runs across iPhone (Mobile Safari) and
 * Android (Pixel 7 Chrome) device descriptors so per-platform thresholds
 * in `useSwipeDownClose` are exercised end-to-end.
 *
 * Drives Playwright's pointer/touch APIs at controlled velocities on
 * every fullscreen post viewer (profile post, public profile post, reel
 * post-detail). Fails CI if:
 *  - A short, slow drag accidentally dismisses the overlay
 *  - A drag past the offset threshold fails to dismiss
 *  - A fast flick fails to dismiss
 *  - Vertical scrolling inside the overlay's scroll region triggers
 *    dismissal (must hold on iPhone *and* Android)
 */

import { test, expect, devices, type Page, type Locator } from "@playwright/test";

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

const DEVICE_PROFILES = [
  { label: "iPhone (iOS Safari)", device: devices["iPhone 13"] },
  { label: "Android (Pixel 7 Chrome)", device: devices["Pixel 7"] },
];

/**
 * Touch-aware drag that works on real mobile emulation. Uses dispatched
 * TouchEvents so framer-motion's pointer pipeline treats it as a real
 * finger drag and `detectPlatform()` (which reads navigator.userAgent)
 * picks up iOS vs Android thresholds correctly.
 */
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

  // hasTouch is set by mobile device descriptors. Fall back to mouse
  // for desktop contexts (none in this spec but keeps the helper safe).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasTouch = (page.context() as any)._options?.hasTouch ?? false;

  if (hasTouch) {
    await page.evaluate(
      async ({ startX, startY, distance, steps, stepDelayMs }) => {
        const el = document.elementFromPoint(startX, startY) as HTMLElement | null;
        if (!el) return;
        const fire = (type: string, x: number, y: number) => {
          const touch = new Touch({
            identifier: 1,
            target: el,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
          });
          const ev = new TouchEvent(type, {
            cancelable: true,
            bubbles: true,
            touches: type === "touchend" ? [] : [touch],
            targetTouches: type === "touchend" ? [] : [touch],
            changedTouches: [touch],
          });
          el.dispatchEvent(ev);
        };
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        fire("touchstart", startX, startY);
        for (let i = 1; i <= steps; i++) {
          await sleep(stepDelayMs);
          const y = startY + (distance * i) / steps;
          fire("touchmove", startX, y);
        }
        fire("touchend", startX, startY + distance);
      },
      { startX, startY, distance, steps, stepDelayMs },
    );
    return;
  }

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    const y = startY + (distance * i) / steps;
    await page.mouse.move(startX, y, { steps: 1 });
    if (stepDelayMs > 0) await page.waitForTimeout(stepDelayMs);
  }
  await page.mouse.up();
}

async function scrollInside(page: Page, x: number, y: number) {
  await page.evaluate(
    ({ startX, startY }) => {
      const el = document.elementFromPoint(startX, startY) as HTMLElement | null;
      if (!el) return;
      const fire = (type: string, py: number) => {
        const t = new Touch({
          identifier: 2,
          target: el,
          clientX: startX,
          clientY: py,
          pageX: startX,
          pageY: py,
        });
        el.dispatchEvent(
          new TouchEvent(type, {
            cancelable: true,
            bubbles: true,
            touches: type === "touchend" ? [] : [t],
            targetTouches: type === "touchend" ? [] : [t],
            changedTouches: [t],
          }),
        );
      };
      fire("touchstart", startY);
      for (let i = 1; i <= 10; i++) fire("touchmove", startY + i * 30);
      fire("touchend", startY + 300);
    },
    { startX: x, startY: y },
  );
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

for (const profile of DEVICE_PROFILES) {
  test.describe(`swipe-down-to-close — ${profile.label}`, () => {
    test.use({ ...profile.device });

    for (const c of CASES) {
      test.describe(c.name, () => {
        test("short slow drag does NOT dismiss", async ({ page }) => {
          await openOverlay(page, c);
          const handle = page.getByTestId(c.grabHandleTestId);
          await dragDown(page, handle, 60, 12, 16);
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
          // 60px in ~80ms ≈ 750+ px/s — over both iOS and Android floors.
          await dragDown(page, handle, 60, 4, 18);
          await expect(page.getByTestId(c.overlayPresenceTestId)).toHaveCount(0, {
            timeout: 2000,
          });
        });

        test("inner vertical scroll does NOT dismiss", async ({ page }) => {
          await openOverlay(page, c);
          const overlay = page.getByTestId(c.overlayPresenceTestId);
          const box = await overlay.boundingBox();
          if (!box) test.skip();
          const startX = box!.x + box!.width / 2;
          const startY = box!.y + box!.height - 80;
          await scrollInside(page, startX, startY);
          await page.waitForTimeout(400);
          await expect(page.getByTestId(c.overlayPresenceTestId)).toBeVisible();
        });
      });
    }
  });
}
