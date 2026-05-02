/**
 * userScopedStorage — Per-user wrappers around localStorage / sessionStorage.
 *
 * Why this exists: keys like "zivo_delivery_addresses" or "zivo_passengers"
 * used to be written to a global key on the browser. If User A signs out and
 * User B signs in on the same device (shared family computer, library kiosk,
 * test devices), B saw A's saved addresses / contacts / search history. Real
 * cross-account data leak.
 *
 * The fix is straightforward: suffix every read/write with the current user
 * id (or "guest" when nobody is signed in). The first time we see a value
 * under the legacy unscoped key, we one-shot-migrate it into the scoped key
 * for the current user, then delete the legacy key. After that, scoped reads
 * are the source of truth.
 *
 * Migration policy: legacy data inherits to the *first* user who opens the
 * page after the upgrade. That's pragmatic — the most common case is "the
 * device only ever had one user" and inheriting their data preserves their
 * existing UX. If a different user later signs in, they get an empty
 * scope (no leak) and the legacy key is already gone.
 *
 * Guest sessions get the literal "guest" suffix so unauthenticated drafts
 * don't survive across sign-outs into another user's space.
 */

type Backend = "local" | "session";

function backendOf(b: Backend): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return b === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function scopedKey(key: string, userId: string | null | undefined): string {
  return `${key}:${userId || "guest"}`;
}

/**
 * Read a user-scoped value, with one-shot migration from the legacy unscoped
 * key. Returns null if neither key has a value (or storage is unavailable).
 */
export function getUserScoped(
  key: string,
  userId: string | null | undefined,
  backend: Backend = "local",
): string | null {
  const store = backendOf(backend);
  if (!store) return null;
  const sk = scopedKey(key, userId);
  try {
    const scoped = store.getItem(sk);
    if (scoped !== null) return scoped;
    // Legacy fallback — migrate once.
    const legacy = store.getItem(key);
    if (legacy !== null) {
      store.setItem(sk, legacy);
      store.removeItem(key);
      return legacy;
    }
    return null;
  } catch {
    return null;
  }
}

/** Write a user-scoped value. Failures (quota, private mode) are swallowed. */
export function setUserScoped(
  key: string,
  userId: string | null | undefined,
  value: string,
  backend: Backend = "local",
): void {
  const store = backendOf(backend);
  if (!store) return;
  try {
    store.setItem(scopedKey(key, userId), value);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Remove the user-scoped value (and any legacy unscoped value). */
export function removeUserScoped(
  key: string,
  userId: string | null | undefined,
  backend: Backend = "local",
): void {
  const store = backendOf(backend);
  if (!store) return;
  try {
    store.removeItem(scopedKey(key, userId));
    store.removeItem(key); // belt-and-suspenders: clear any straggling legacy value
  } catch {
    /* ignore */
  }
}

/** JSON convenience wrapper around getUserScoped. */
export function getUserScopedJSON<T>(
  key: string,
  userId: string | null | undefined,
  fallback: T,
  backend: Backend = "local",
): T {
  const raw = getUserScoped(key, userId, backend);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON convenience wrapper around setUserScoped. */
export function setUserScopedJSON(
  key: string,
  userId: string | null | undefined,
  value: unknown,
  backend: Backend = "local",
): void {
  try {
    setUserScoped(key, userId, JSON.stringify(value), backend);
  } catch {
    /* serialization failure — ignore */
  }
}
