import { chromium } from "@playwright/test";
import fs from "node:fs";

const APP = "http://127.0.0.1:4175";
const STORE_ID = "0013f47a-b8f6-4748-a112-ca5e03300abf";
const EMAIL = "chhorngkimlain1@gmail.com";
const PASSWORD = "Chhorng@1903";
const VIDEO = "/Users/viyitta/Downloads/4181385a-4f3c-4661-8432-bf360e542c33.mp4";
const OUT_DIR = "/Users/viyitta/Documents/GitHub/myzivo/tmp/e2e-artifacts";

if (!fs.existsSync(VIDEO)) {
  console.error("Video file missing:", VIDEO);
  process.exit(2);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const report = {
  upload: "unknown",
  playback: "unknown",
  errors: [],
  requestFailures: [],
  screenshots: [],
};

const shot = async (page, name) => {
  const file = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") {
    report.errors.push(msg.text());
  }
});

page.on("requestfailed", (req) => {
  report.requestFailures.push(`${req.failure()?.errorText || "failed"} :: ${req.url()}`);
});

try {
  await page.goto(`${APP}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await shot(page, "01-login-page");

  const email = page.locator('input[type="email"]').first();
  const password = page.locator('input[type="password"]').first();
  await email.fill(EMAIL);
  await password.fill(PASSWORD);

  const submit = page.locator('button[type="submit"]').first();
  await submit.click();

  await page.waitForTimeout(3500);
  await shot(page, "02-after-login-submit");

  await page.goto(`${APP}/admin/stores/${STORE_ID}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  await shot(page, "03-store-admin-page");

  const videoPostEntry = page.locator('text=Video Post').first();
  await videoPostEntry.click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  await shot(page, "04-video-dialog-open");

  const uploader = page.locator('input[type="file"][accept*="video/mp4"]').first();
  await uploader.setInputFiles(VIDEO);
  await page.waitForTimeout(1500);
  await shot(page, "05-video-selected");

  let done = false;
  for (let i = 0; i < 90; i++) {
    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    if (bodyText.includes("upload failed") || bodyText.includes("video format is not supported")) {
      report.upload = "failed";
      done = true;
      break;
    }
    if (bodyText.includes(" ready") || bodyText.includes("ready\n") || bodyText.includes("1 file ready")) {
      report.upload = "ready";
      done = true;
      break;
    }
    await page.waitForTimeout(1000);
  }

  await shot(page, "06-upload-result");
  if (!done && report.upload === "unknown") report.upload = "timeout";

  const playButton = page.locator('button[aria-label="Play"]').first();
  if (await playButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await playButton.click();
    await page.waitForTimeout(2000);
    const playing = await page.evaluate(() => {
      const v = document.querySelector("video");
      return v ? !v.paused : false;
    });
    report.playback = playing ? "playing" : "not-playing";
  } else {
    report.playback = "play-button-not-found";
  }

  await shot(page, "07-playback-check");
} catch (err) {
  report.upload = "script-error";
  report.errors.push(String(err));
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
