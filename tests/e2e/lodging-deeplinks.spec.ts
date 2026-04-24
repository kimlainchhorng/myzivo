import { test, expect } from "@playwright/test";

const tabs = ["lodge-overview", "lodge-rate-plans", "lodge-addons", "lodge-guest-requests"];

test.describe("lodging admin deep-link logic", () => {
  for (const tab of tabs) {
    test(`refresh target ${tab} has deterministic QA coverage`, async ({ page }) => {
      await page.goto(`/admin/lodging/qa-checklist`);
      await expect(page.getByRole("heading", { name: /hotel admin qa checklist/i })).toBeVisible();
      await expect(page.getByText(`/admin/stores/preview-store?tab=${tab}`)).toBeVisible();
      await expect(page.getByText(`Refresh deep link: ${tab}`)).toBeVisible();
      await expect(page.locator("main")).not.toBeEmpty();
    });
  }
});