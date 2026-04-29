import { test, expect, Page } from "@playwright/test";

const EMAIL = "kimlain@hizivo.com";
const PASSWORD = "Chhorng@1903";

// ─── helpers ────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.locator("#login-email").fill(EMAIL);
  await page.locator("#login-password").fill(PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait for auth redirect (leave the /login path)
  await page.waitForURL(url => !url.pathname.includes("/login"), { timeout: 20_000 });
}

/** Query Supabase in-browser to get the first store_profile owned by the logged-in user */
async function getFirstStoreId(page: Page): Promise<string> {
  // Navigate anywhere authenticated so the Supabase client is initialised
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const storeId = await page.evaluate(async (): Promise<string> => {
    // The Supabase client is exposed via window.__supabase in dev, or we
    // can import it via the module registry. Fall back to a direct REST call.
    const SUPA_URL = "https://slirphzzwcogdbkeicff.supabase.co";
    // Supabase stores the session under sb-<project_ref>-auth-token
    const AUTH_KEY = "sb-slirphzzwcogdbkeicff-auth-token";
    const rawSession =
      localStorage.getItem(AUTH_KEY) ??
      sessionStorage.getItem(AUTH_KEY) ??
      "null";
    const session = JSON.parse(rawSession);
    const token =
      session?.access_token ??
      session?.currentSession?.access_token ??
      "";

    if (!token) throw new Error("No auth token found in localStorage");

    const res = await fetch(
      `${SUPA_URL}/rest/v1/store_profiles?select=id&order=created_at.asc&limit=1`,
      {
        headers: {
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`store_profiles query failed: ${res.status}`);
    const rows = await res.json();
    if (!rows?.length) throw new Error("No stores found for this user");
    return rows[0].id as string;
  });

  return storeId;
}

async function goToPartShop(page: Page, storeId: string) {
  await page.goto(`/admin/stores/${storeId}?tab=ar-parts`);
  await page.waitForLoadState("networkidle");
  // The Part Shop tab renders both sections — wait for Parts Suppliers heading
  await page.getByText("Parts Suppliers").waitFor({ timeout: 15_000 });
}

// ─── tests ──────────────────────────────────────────────────────────────────

test.describe("Parts Suppliers — AutoZonePro connect flow", () => {
  let storeId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);
    storeId = await getFirstStoreId(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── 1. section renders ────────────────────────────────────────────────────
  test("Parts Suppliers section renders with 32 suppliers", async ({ page }) => {
    await goToPartShop(page, storeId);

    // Badge shows 32
    const badge = page.locator("text=32").first();
    await expect(badge).toBeVisible();

    // AutoZonePro row is present
    await expect(page.getByText("AutoZonePro")).toBeVisible();
  });

  // ── 2. connect dialog ─────────────────────────────────────────────────────
  test("AutoZonePro connect dialog saves creds and opens portal", async ({ page, context }) => {
    await goToPartShop(page, storeId);

    // Clear any pre-existing cred so the key icon is shown
    await page.evaluate((sid) => {
      localStorage.removeItem(`ar_supplier_${sid}_autozonepro`);
    }, storeId);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByText("Parts Suppliers").waitFor({ timeout: 12_000 });

    // Click key icon on AutoZonePro row
    const keyBtn = page.locator("[title='Connect account']").first();
    await expect(keyBtn).toBeVisible({ timeout: 8_000 });
    await keyBtn.click();

    // Dialog should open
    await expect(page.getByText("Connect AutoZonePro")).toBeVisible({ timeout: 5_000 });

    // Fill credentials
    await page.getByPlaceholder("Username or email").fill("Kimlain");
    await page.locator('input[type="password"]').first().fill("Chhorng@1903");

    // Clicking Save should open a new tab
    const [newTab] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: /save.*open portal/i }).click(),
    ]);

    await newTab.waitForLoadState("domcontentloaded");
    expect(newTab.url()).toContain("autozonepro.com");

    // Dialog should close and "Account saved" should appear
    await expect(page.getByText("Account saved").first()).toBeVisible({ timeout: 5_000 });
  });

  // ── 3. connected state shows correct buttons ──────────────────────────────
  test("Connected supplier shows Open Portal and Edit buttons", async ({ page }) => {
    await goToPartShop(page, storeId);

    // Pre-seed via localStorage then reload
    await page.evaluate((sid) => {
      localStorage.setItem(
        `ar_supplier_${sid}_autozonepro`,
        JSON.stringify({ username: "Kimlain", password: "Chhorng@1903" })
      );
    }, storeId);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByText("Parts Suppliers").waitFor({ timeout: 12_000 });

    await expect(page.getByText("Account saved").first()).toBeVisible();
    await expect(page.locator("[title='Open portal']").first()).toBeVisible();
    await expect(page.locator("[title='Edit credentials']").first()).toBeVisible();

    // "connected X" badge in section header
    await expect(page.getByText(/1 connected/i)).toBeVisible();
  });

  // ── 4. category filter ────────────────────────────────────────────────────
  test("Category filter Retail Chain shows AutoZonePro, hides Toyota TIS", async ({ page }) => {
    await goToPartShop(page, storeId);

    await page.getByRole("button", { name: "Retail Chain" }).click();
    await expect(page.getByText("AutoZonePro")).toBeVisible();
    await expect(page.getByText("Toyota TIS")).not.toBeVisible();
  });

  // ── 5. search filter ──────────────────────────────────────────────────────
  test("Search 'autozone' shows AutoZonePro, hides RockAuto", async ({ page }) => {
    await goToPartShop(page, storeId);

    await page.getByPlaceholder(/search suppliers/i).fill("autozone");
    await expect(page.getByText("AutoZonePro")).toBeVisible();
    await expect(page.getByText("RockAuto")).not.toBeVisible();
  });

  // ── 6. disconnect ─────────────────────────────────────────────────────────
  test("Disconnect removes saved account", async ({ page }) => {
    await goToPartShop(page, storeId);

    // Seed, reload
    await page.evaluate((sid) => {
      localStorage.setItem(
        `ar_supplier_${sid}_autozonepro`,
        JSON.stringify({ username: "Kimlain", password: "Chhorng@1903" })
      );
    }, storeId);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.getByText("Parts Suppliers").waitFor({ timeout: 12_000 });

    // Open edit dialog then disconnect
    await page.locator("[title='Edit credentials']").first().click();
    await expect(page.getByText("Connect AutoZonePro")).toBeVisible();
    await page.getByRole("button", { name: "Disconnect" }).click();

    // Toast confirms; "Account saved" gone; key icon back
    await expect(page.getByText(/disconnected/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("[title='Connect account']").first()).toBeVisible({ timeout: 5_000 });
  });
});
