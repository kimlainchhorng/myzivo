import { test, expect } from "@playwright/test";

const storeId = process.env.LODGING_E2E_STORE_ID;
const tabs = ["lodge-overview", "lodge-rate-plans", "lodge-addons", "lodge-guest-requests"];

test.describe("lodging admin deep links", () => {
  test.skip(!storeId, "Set LODGING_E2E_STORE_ID and an authenticated storage state to run live lodging deep-link checks.");

  for (const tab of tabs) {
    test(`refresh keeps ${tab} rendered without blank content`, async ({ page }) => {
      await page.goto(`/admin/stores/${storeId}?tab=${tab}`);
      await page.reload({ waitUntil: "networkidle" });
      const panel = page.getByTestId(`lodging-tab-${tab}`);
      await expect(panel).toBeVisible();
      await expect(panel).not.toBeEmpty();
      await expect(page.locator("main")).not.toContainText(/blank|undefined|null/i);
    });
  }
});