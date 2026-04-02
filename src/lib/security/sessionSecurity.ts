/**
 * Session Security - Idle timeout & max session age enforcement
 * 
 * When "Remember me" is ON:  30-day max session, no idle timeout (trusted devices)
 * When "Remember me" is OFF: 30-minute idle timeout, 24-hour max session
 */

const REMEMBER_ME_KEY = "zivo_remember_me";
const SESSION_START_KEY = "zivo_session_start";
const LAST_ACTIVITY_KEY = "zivo_last_activity";

// Short session (Remember me OFF)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;        // 30 minutes
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Long session (Remember me ON) — trusted device, stay signed in
const MAX_SESSION_AGE_REMEMBERED_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function now(): number {
  return Date.now();
}

function isRemembered(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export function setupActivityTracking(onExpire: () => void): () => void {
  const remembered = isRemembered();

  // Use localStorage for remembered sessions (survives tab close),
  // sessionStorage for non-remembered (clears on tab close = auto logout)
  const storage = remembered ? localStorage : sessionStorage;

  // Record session start if not already set
  if (!storage.getItem(SESSION_START_KEY)) {
    storage.setItem(SESSION_START_KEY, String(now()));
  }
  storage.setItem(LAST_ACTIVITY_KEY, String(now()));

  // Track user activity
  const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  const updateActivity = () => {
    storage.setItem(LAST_ACTIVITY_KEY, String(now()));
  };

  activityEvents.forEach((event) =>
    window.addEventListener(event, updateActivity, { passive: true })
  );

  // Check session validity every 60 seconds
  const interval = setInterval(() => {
    const sessionStart = Number(storage.getItem(SESSION_START_KEY) || now());
    const lastActivity = Number(storage.getItem(LAST_ACTIVITY_KEY) || now());
    const currentTime = now();

    const maxAge = remembered ? MAX_SESSION_AGE_REMEMBERED_MS : MAX_SESSION_AGE_MS;

    // Check max session age
    if (currentTime - sessionStart > maxAge) {
      console.warn(`[SessionSecurity] Max session age exceeded (${remembered ? '7d' : '24h'})`);
      onExpire();
      return;
    }

    // Check idle timeout — only for non-remembered sessions
    if (!remembered && currentTime - lastActivity > IDLE_TIMEOUT_MS) {
      console.warn("[SessionSecurity] Idle timeout exceeded (30min)");
      onExpire();
      return;
    }
  }, 60_000);

  return () => {
    clearInterval(interval);
    activityEvents.forEach((event) =>
      window.removeEventListener(event, updateActivity)
    );
  };
}

export function clearSessionArtifacts(): void {
  // Clear from both storages
  sessionStorage.removeItem(SESSION_START_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem(SESSION_START_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}
