/**
 * Search Protection - Detect and block abusive search patterns
 * 
 * Protects against:
 * - Duplicate identical searches in short time windows
 * - Rapid cycling (changing airports/dates too fast)
 * - Bot-like behavior patterns
 */

// Track recent searches to detect duplicates (with sessionStorage persistence)
const recentSearches = new Map<string, { count: number; lastSearch: number }>();
const DUPLICATE_WINDOW_MS = 10000; // 10 seconds
const MAX_DUPLICATES = 3;

// Track rapid cycling (changing airports/dates rapidly)
const cyclingTracker = new Map<string, { changes: number; lastChange: number }>();
const CYCLING_WINDOW_MS = 30000; // 30 seconds
const MAX_CYCLING_CHANGES = 10;

// Exponential backoff for repeat offenders
const BLOCK_STORAGE_KEY = 'zivo-search-blocks';

interface BlockData {
  count: number;
  blockedUntil: number;
}

function getBlockData(sessionId: string): BlockData {
  try {
    const raw = sessionStorage.getItem(`${BLOCK_STORAGE_KEY}-${sessionId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { count: 0, blockedUntil: 0 };
}

function setBlockData(sessionId: string, data: BlockData): void {
  try {
    sessionStorage.setItem(`${BLOCK_STORAGE_KEY}-${sessionId}`, JSON.stringify(data));
  } catch { /* ignore */ }
}

function getBackoffMs(blockCount: number): number {
  // 10s, 30s, 60s, 120s...
  const backoffs = [10000, 30000, 60000, 120000];
  return backoffs[Math.min(blockCount, backoffs.length - 1)];
}

export interface SearchProtectionResult {
  allowed: boolean;
  reason?: 'duplicate' | 'cycling' | 'throttled';
  message?: string;
  waitMs?: number;
}

/**
 * Check if a search should be blocked due to abuse patterns
 */
export function checkSearchAbuse(
  origin: string,
  destination: string,
  departureDate: string,
  sessionId: string
): SearchProtectionResult {
  const now = Date.now();

  // Check exponential backoff for repeat offenders
  const blockData = getBlockData(sessionId);
  if (blockData.blockedUntil > now) {
    const waitMs = blockData.blockedUntil - now;
    return {
      allowed: false,
      reason: 'throttled',
      message: `You've been temporarily blocked. Please wait ${Math.ceil(waitMs / 1000)} seconds.`,
      waitMs,
    };
  }
  
  // Check for duplicate searches
  const searchKey = `${origin}-${destination}-${departureDate}-${sessionId}`;
  const existing = recentSearches.get(searchKey);
  
  if (existing && now - existing.lastSearch < DUPLICATE_WINDOW_MS) {
    existing.count++;
    existing.lastSearch = now;
    
    if (existing.count > MAX_DUPLICATES) {
      // Apply exponential backoff
      const newBlockData = { count: blockData.count + 1, blockedUntil: now + getBackoffMs(blockData.count) };
      setBlockData(sessionId, newBlockData);
      return {
        allowed: false,
        reason: 'duplicate',
        message: "You've searched this route multiple times. Please wait a moment.",
        waitMs: getBackoffMs(blockData.count),
      };
    }
  } else {
    recentSearches.set(searchKey, { count: 1, lastSearch: now });
  }

  // Check for rapid cycling (changing search params too fast)
  const cycleKey = sessionId;
  const cycleData = cyclingTracker.get(cycleKey) || { changes: 0, lastChange: 0 };
  
  if (now - cycleData.lastChange < 2000) { // Less than 2 seconds since last change
    cycleData.changes++;
    
    if (cycleData.changes > MAX_CYCLING_CHANGES) {
      const newBlockData = { count: blockData.count + 1, blockedUntil: now + getBackoffMs(blockData.count) };
      setBlockData(sessionId, newBlockData);
      return {
        allowed: false,
        reason: 'cycling',
        message: 'Please slow down. Too many searches in a short time.',
        waitMs: getBackoffMs(blockData.count),
      };
    }
  } else if (now - cycleData.lastChange > CYCLING_WINDOW_MS) {
    // Reset after window expires
    cycleData.changes = 1;
  }
  
  cycleData.lastChange = now;
  cyclingTracker.set(cycleKey, cycleData);

  // Cleanup old entries periodically
  cleanupOldEntries(now);

  return { allowed: true };
}

/**
 * Cleanup old tracker entries to prevent memory leaks
 */
function cleanupOldEntries(now: number) {
  // Run cleanup every ~100 calls (1% probability)
  if (Math.random() > 0.01) return;
  
  for (const [key, value] of recentSearches) {
    if (now - value.lastSearch > DUPLICATE_WINDOW_MS * 2) {
      recentSearches.delete(key);
    }
  }
  
  for (const [key, value] of cyclingTracker) {
    if (now - value.lastChange > CYCLING_WINDOW_MS * 2) {
      cyclingTracker.delete(key);
    }
  }
}

/**
 * Clear search protection data for a specific session
 * Useful when user explicitly resets or logs out
 */
export function clearSearchProtection(sessionId: string) {
  for (const key of recentSearches.keys()) {
    if (key.endsWith(sessionId)) {
      recentSearches.delete(key);
    }
  }
  cyclingTracker.delete(sessionId);
}

/**
 * Check if error is a search protection error
 */
export function isSearchProtectionError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('too many') || 
           error.message.includes('wait a moment') ||
           error.message.includes('slow down');
  }
  return false;
}
