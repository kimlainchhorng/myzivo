import type { Page } from "@playwright/test";

const EMAIL = "kimlain@hizivo.com";
const PASSWORD = "Chhorng@1903";

export async function login(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  if (!page.url().includes("/login")) return;
  await page.locator("#login-email").fill(EMAIL);
  await page.locator("#login-password").fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 25_000 });
}
