/**
 * Session Security Utilities
 * Idle timeout, session age enforcement, and activity tracking
 */

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

const LAST_ACTIVITY_KEY = 'zivo-last-activity';
const SESSION_START_KEY = 'zivo-session-start';

/**
 * Record user activity timestamp
 */
export function recordActivity(): void {
  try {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Record session start time
 */
export function recordSessionStart(): void {
  try {
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
    }
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Check if session has been idle too long
 */
export function isSessionIdle(): boolean {
  try {
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    return Date.now() - Number(lastActivity) > IDLE_TIMEOUT_MS;
  } catch {
    return false;
  }
}

/**
 * Check if session has exceeded max age
 */
export function isSessionExpired(): boolean {
  try {
    const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) return false;
    return Date.now() - Number(sessionStart) > SESSION_MAX_AGE_MS;
  } catch {
    return false;
  }
}

/**
 * Clear all session security artifacts
 */
export function clearSessionArtifacts(): void {
  try {
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.removeItem(SESSION_START_KEY);
    // Clear any abuse tracking data
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('zivo-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Set up activity listeners (call once on app mount)
 * Returns cleanup function
 */
export function setupActivityTracking(onSessionInvalid: () => void): () => void {
  // Record initial activity
  recordActivity();
  recordSessionStart();

  // Activity event handler (throttled)
  let lastRecorded = Date.now();
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastRecorded > 10000) { // Throttle to every 10s
      lastRecorded = now;
      recordActivity();
    }
  };

  // Attach listeners
  window.addEventListener('mousemove', handleActivity, { passive: true });
  window.addEventListener('keydown', handleActivity, { passive: true });
  window.addEventListener('touchstart', handleActivity, { passive: true });
  window.addEventListener('scroll', handleActivity, { passive: true });

  // Periodic check
  const interval = setInterval(() => {
    if (isSessionIdle() || isSessionExpired()) {
      onSessionInvalid();
    }
  }, ACTIVITY_CHECK_INTERVAL_MS);

  return () => {
    window.removeEventListener('mousemove', handleActivity);
    window.removeEventListener('keydown', handleActivity);
    window.removeEventListener('touchstart', handleActivity);
    window.removeEventListener('scroll', handleActivity);
    clearInterval(interval);
  };
}
