import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const tabs = ["lodge-overview", "lodge-rate-plans", "lodge-addons", "lodge-guest-requests"];
const adminStoreSource = readFileSync("src/pages/admin/AdminStoreEditPage.tsx", "utf8");
const qaSource = readFileSync("src/lib/lodging/lodgingQa.ts", "utf8");

test.describe("lodging admin deep-link logic", () => {
  for (const tab of tabs) {
    test(`refresh target ${tab} has deterministic QA coverage`, async () => {
      expect(adminStoreSource).toContain(`data-testid="lodging-tab-${tab}"`);
      expect(qaSource).toContain(`Refresh deep link: ${tab}`);
      expect(qaSource).toContain(`?tab=${tab}`);
    });
  }
});