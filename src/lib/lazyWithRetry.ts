/**
 * lazyWithRetry — React.lazy with automatic retry for transient chunk-load
 * failures. After exhausted retries, triggers a one-time hard reload to pull
 * the latest chunk hashes from a new deploy.
 */
import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "__lazy_chunk_reload__";

function isChunkError(err: unknown): boolean {
  const msg = (err as Error)?.message || String(err);
  return (
    msg.includes("Importing a module script failed") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Loading CSS chunk") ||
    msg.includes("error loading dynamically imported module")
  );
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 400,
) {
  return lazy(async () => {
    let lastErr: unknown;
    for (let i = 0; i <= retries; i++) {
      try {
        const mod = await factory();
        // Reset reload flag on success
        try { sessionStorage.removeItem(RELOAD_KEY); } catch {}
        return mod;
      } catch (err) {
        lastErr = err;
        if (!isChunkError(err)) throw err;
        if (i < retries) {
          await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        }
      }
    }
    // Final fallback: hard reload once to recover from stale deploy
    try {
      if (typeof window !== "undefined" && !sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        // Return a never-resolving promise so React doesn't render fallback
        return new Promise(() => {}) as never;
      }
    } catch {}
    throw lastErr;
  });
}
