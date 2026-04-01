/**
 * Wraps a dynamic import with retry + cache-bust logic so stale chunks
 * (common after deploys) recover automatically instead of crashing.
 */
export function lazyRetry<T extends { default: unknown }>(
  importFn: () => Promise<T>,
  retries = 2,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (remaining: number) => {
      importFn()
        .then(resolve)
        .catch((error: unknown) => {
          if (remaining > 0) {
            // Brief pause then retry
            setTimeout(() => attempt(remaining - 1), 500);
          } else {
            // All retries exhausted — force a full page reload once
            const reloadKey = "chunk_reload";
            if (!sessionStorage.getItem(reloadKey)) {
              sessionStorage.setItem(reloadKey, "1");
              window.location.reload();
            } else {
              sessionStorage.removeItem(reloadKey);
              reject(error);
            }
          }
        });
    };
    attempt(retries);
  });
}
