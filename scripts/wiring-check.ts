/**
 * scripts/wiring-check.ts
 * One-shot CI runner — pings lodging-wiring-monitor and exits non-zero on any failure.
 *
 * Usage:
 *   SUPABASE_URL=https://slirphzzwcogdbkeicff.supabase.co \
 *   SUPABASE_ANON_KEY=... \
 *   deno run --allow-net --allow-env scripts/wiring-check.ts
 */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://slirphzzwcogdbkeicff.supabase.co";
const ANON = Deno.env.get("SUPABASE_ANON_KEY");

if (!ANON) {
  console.error("SUPABASE_ANON_KEY env var is required.");
  Deno.exit(2);
}

const url = `${SUPABASE_URL}/functions/v1/lodging-wiring-monitor`;
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ANON}`,
    apikey: ANON,
  },
  body: JSON.stringify({ source: "ci" }),
});

const json = await res.json().catch(() => ({}));
console.log(JSON.stringify(json, null, 2));

if (!res.ok || (json.fail ?? 0) > 0 || (json.new_failures ?? 0) > 0) {
  console.error(`Wiring check failed: ${json.fail ?? "?"} failing, ${json.new_failures ?? 0} new regressions.`);
  Deno.exit(1);
}
console.log("Wiring check OK.");
Deno.exit(0);
