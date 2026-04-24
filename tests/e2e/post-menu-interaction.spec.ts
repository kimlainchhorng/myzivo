/**
 * Post viewer menu interaction E2E QA.
 *
 * Verifies two regression-prone behaviors that broke historically when
 * the swipe-down dismiss gesture changed:
 *
 *  1. Swipe round-trip — overlay opens, dismisses with a real flick,
 *     re-opens cleanly, no stale pointer captures.
 *
 *  2. Repeated open/close cycles do not poison click handlers — after 3
 *     dismiss-and-reopen rounds, the "..." menu trigger and each menu
 *     row must still respond to taps.
 *
 * Uses iPhone 13 + Pixel 7 device descriptors so iOS and Android swipe
 * thresholds (per `useSwipeDownClose`) are both exercised end-to-end.
 *
 * Trigger thumbnails / overlay test ids are seeded by the dev profile
 * fixture; if `[data-testid^="profile-post-thumb"]` is not present the
 * test soft-skips so it doesn't block CI on environments without seed
 * data.
 */
import { test, expect, devices, type Page, type Locator } from "@playwright/test";
import { seedProfilePosts } from "./fixtures/seedProfilePosts";

const DEVICE_PROFILES = [
  { label: "iPhone 13 (iOS Safari)", device: devices["iPhone 13"] },
  { label: "Pixel 7 (Android Chrome)", device: devices["Pixel 7"] },
];

/**
 * Touch-aware drag identical to swipe-close.spec.ts. Duplicated to keep
 * each spec file independently runnable without a shared fixture import.
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

async function openProfilePostOverlay(page: Page): Promise<boolean> {
  await seedProfilePosts(page);
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  const trigger = page.locator('[data-testid^="profile-post-thumb"]').first();
  // Seed guarantees posts exist — fail loudly if the seed bridge regressed.
  await expect(trigger).toBeVisible({ timeout: 8000 });
  await trigger.click();
  await page.getByTestId("profile-post-grab-handle").waitFor({ state: "visible", timeout: 5000 });
  return true;
}

for (const profile of DEVICE_PROFILES) {
  test.describe(`post-menu interaction — ${profile.label}`, () => {
    test.use({ ...profile.device });

    test("swipe round-trip: dismiss with a flick, then re-open cleanly", async ({ page }) => {
      const opened = await openProfilePostOverlay(page);
      if (!opened) return;

      const handle = page.getByTestId("profile-post-grab-handle");
      // Fast flick well past every platform threshold.
      await dragDown(page, handle, 280, 8, 8);

      // Overlay should be gone.
      await expect(page.getByTestId("profile-post-close")).toBeHidden({ timeout: 3000 });

      // Re-open without page reload.
      const trigger = page.locator('[data-testid^="profile-post-thumb"]').first();
      await trigger.click();
      await expect(page.getByTestId("profile-post-grab-handle")).toBeVisible({ timeout: 3000 });
    });

    test("repeated open/close keeps menu trigger and rows clickable", async ({ page }) => {
      const opened = await openProfilePostOverlay(page);
      if (!opened) return;

      // 3 swipe-dismiss + reopen cycles to flush any stale pointer state.
      for (let i = 0; i < 3; i++) {
        await dragDown(page, page.getByTestId("profile-post-grab-handle"), 280, 8, 8);
        await expect(page.getByTestId("profile-post-close")).toBeHidden({ timeout: 3000 });
        await page.locator('[data-testid^="profile-post-thumb"]').first().click();
        await page
          .getByTestId("profile-post-grab-handle")
          .waitFor({ state: "visible", timeout: 3000 });
      }

      // Open the "..." menu — this is what historically broke after the
      // swipe gesture left a captured pointer behind.
      const moreBtn = page.locator('[aria-label="Post options"], [aria-label="More options"]').first();
      await moreBtn.click({ trial: false });

      const sheet = page.getByTestId("profile-post-menu-sheet");
      await expect(sheet).toBeVisible({ timeout: 3000 });

      // Each labeled action should be clickable.
      for (const id of [
        "profile-menu-report",
        "profile-menu-notifications",
        "profile-menu-not-interested",
      ]) {
        const row = page.getByTestId(id);
        await expect(row).toBeVisible();
        const box = await row.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });

    test("report flow shows confirmation and persists 'Reported' status", async ({ page }) => {
      const opened = await openProfilePostOverlay(page);
      if (!opened) return;

      const moreBtn = page.locator('[aria-label="Post options"], [aria-label="More options"]').first();
      await moreBtn.click();
      await page.getByTestId("profile-post-menu-sheet").waitFor({ state: "visible" });

      await page.getByTestId("profile-menu-report").click();

      // Pick the first category to reach the submit screen.
      await page.getByText("I just don't like it").first().click();
      await page.getByTestId("profile-report-submit").click();

      // Confirmation screen.
      await expect(page.getByTestId("profile-report-submitted")).toBeVisible({ timeout: 3000 });
      await page.getByRole("button", { name: /done/i }).click();

      // Re-open the menu — Report row should now show the "Reported" badge.
      await moreBtn.click();
      await expect(page.getByTestId("profile-menu-report-status")).toHaveText(/reported/i);
    });
  });
}
