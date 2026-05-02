#!/usr/bin/env node
/**
 * ZIVO OTA Update Deploy Script
 * Usage: npm run deploy:update
 *
 * Requires .env.deploy with:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load deploy env vars
config({ path: join(ROOT, ".env.deploy") });

const SUPABASE_URL = "https://slirphzzwcogdbkeicff.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "app-updates";

if (!SERVICE_ROLE_KEY) {
  console.error("\nERROR: SUPABASE_SERVICE_ROLE_KEY not found.");
  console.error("Create .env.deploy with your service role key from:");
  console.error("  https://supabase.com/dashboard/project/slirphzzwcogdbkeicff/settings/api\n");
  process.exit(1);
}

// ── 1. Bump patch version ────────────────────────────────────────────────────
const pkgPath = join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`\nDeploying ZIVO v${newVersion}...`);

// ── 2. Build ─────────────────────────────────────────────────────────────────
console.log("\nBuilding...");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

// ── 3. Zip dist/ ─────────────────────────────────────────────────────────────
const zipName = `zivo-v${newVersion}.zip`;
const zipPath = join(ROOT, zipName);
if (existsSync(zipPath)) unlinkSync(zipPath);

console.log("\nZipping dist/...");
const distPath = join(ROOT, "dist");
if (process.platform === "win32") {
  execSync(
    `powershell -command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: "inherit" }
  );
} else {
  execSync(`cd "${distPath}" && zip -r "${zipPath}" .`, { stdio: "inherit", shell: true });
}

// ── 4. Upload bundle to Supabase Storage ─────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Ensure bucket exists and is public
const { data: buckets } = await supabase.storage.listBuckets();
if (!buckets?.find((b) => b.name === BUCKET)) {
  console.log(`\nCreating storage bucket '${BUCKET}'...`);
  await supabase.storage.createBucket(BUCKET, { public: true });
}

console.log("\nUploading bundle...");
const zipData = await readFile(zipPath);
const { error: uploadError } = await supabase.storage
  .from(BUCKET)
  .upload(zipName, zipData, { contentType: "application/zip", upsert: true });

if (uploadError) {
  console.error("Upload failed:", uploadError.message);
  process.exit(1);
}

const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(zipName);

// ── 5. Update latest.json ─────────────────────────────────────────────────────
console.log("\nUpdating latest.json...");
const manifest = JSON.stringify({ version: newVersion, url: publicUrl }, null, 2);
const { error: manifestError } = await supabase.storage
  .from(BUCKET)
  .upload("latest.json", Buffer.from(manifest), {
    contentType: "application/json",
    upsert: true,
  });

if (manifestError) {
  console.error("Failed to update manifest:", manifestError.message);
  process.exit(1);
}

// ── 6. Cleanup ────────────────────────────────────────────────────────────────
unlinkSync(zipPath);

console.log(`
Done! ZIVO v${newVersion} is now live.

Users on iOS & Android will download the update silently
in the background and get it on next app launch.

Bundle URL: ${publicUrl}
`);
