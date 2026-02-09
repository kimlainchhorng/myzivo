/**
 * useOfflineCache Hook
 * localStorage cache layer for TanStack Query data with 24h expiry.
 */

const CACHE_PREFIX = "zivo-cache-";
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedEntry<T> {
  data: T;
  cachedAt: string;
}

export function cacheData<T>(key: string, data: T): void {
  try {
    const entry: CachedEntry<T> = {
      data,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.warn("[OfflineCache] Failed to cache:", key, error);
  }
}

export function getCachedData<T>(key: string): { data: T; cachedAt: Date } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CachedEntry<T> = JSON.parse(raw);
    const cachedAt = new Date(entry.cachedAt);
    const age = Date.now() - cachedAt.getTime();

    if (age > DEFAULT_EXPIRY_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return { data: entry.data, cachedAt };
  } catch {
    return null;
  }
}

export function clearOfflineCache(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
