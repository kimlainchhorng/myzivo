import { test, expect } from "@playwright/test";
import { login } from "./fixtures/login";

test("reels page loads after login and we can capture state", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await login(page);

  await page.screenshot({ path: testInfo.outputPath("reels-after-login.png"), fullPage: false });

  await page.goto("/reels", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toContainText(/Reels|For You|Following/i, { timeout: 20_000 });
  await page.screenshot({ path: testInfo.outputPath("reels-page.png"), fullPage: false });

  const url = page.url();
  const title = await page.title();
  const bodyText = (await page.locator("body").innerText()).slice(0, 800);

  console.log("FINAL_URL:", url);
  console.log("TITLE:", title);
  console.log("BODY_PREVIEW:", bodyText.replace(/\s+/g, " "));
  console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors.slice(0, 20), null, 2));
  console.log("PAGE_ERRORS:", JSON.stringify(pageErrors.slice(0, 20), null, 2));

  expect(url).toContain("/reels");
});
