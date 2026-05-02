import { chromium } from 'playwright';

const DEVELOPER_ID = '5585425195147923232';
const APP_ID = '4975101708130032572';
const BASE = `https://play.google.com/console/u/0/developers/${DEVELOPER_ID}/app/${APP_ID}`;
const DRAFT = `${BASE}/tracks/4698016251957513928/releases/3/prepare`;

(async () => {
  const context = await chromium.launchPersistentContext(
    'C:\\Users\\abiga\\AppData\\Local\\PlaywrightSession',
    { headless: false, slowMo: 300, channel: 'chrome' }
  );
  const page = context.pages()[0] || await context.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('https://play.google.com/console', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // If not logged in, wait up to 2 minutes for the user to sign in manually
  if (page.url().includes('accounts.google.com') || page.url().includes('signin')) {
    console.log('\n>>> Browser opened. Please sign in with kimlain@hizivo.com');
    console.log('    Waiting up to 2 minutes for login to complete...\n');
    // Wait until we leave the login page
    await page.waitForURL(url => !url.includes('accounts.google.com') && !url.includes('signin'), { timeout: 120000 });
    await page.waitForTimeout(3000);
  }

  console.log('Logged in. Navigating to draft...');
  await page.goto(`${BASE}/app-dashboard`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.goto(DRAFT, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'scripts/draft-state.png' });

  // Click Next to reach review
  const nextBtn = page.locator('button:has-text("Next")').last();
  if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Next to reach review page...');
    await nextBtn.click({ force: true });
    await page.waitForTimeout(5000);
  }

  // Expand all errors/warnings
  const showMoreBtns = await page.locator('button:has-text("Show more")').all();
  for (const btn of showMoreBtns) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(800);
    }
  }
  await page.screenshot({ path: 'scripts/errors-expanded.png' });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== PAGE CONTENT ===\n', bodyText.substring(0, 5000));

  await context.close();
})();
