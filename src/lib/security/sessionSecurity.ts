/**
 * Session Security - Idle timeout & max session age enforcement
 * 30-minute idle timeout, 24-hour max session age
 */

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_START_KEY = "zivo_session_start";
const LAST_ACTIVITY_KEY = "zivo_last_activity";

function now(): number {
  return Date.now();
}

export function setupActivityTracking(onExpire: () => void): () => void {
  // Record session start if not already set
  if (!sessionStorage.getItem(SESSION_START_KEY)) {
    sessionStorage.setItem(SESSION_START_KEY, String(now()));
  }
  sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now()));

  // Track user activity
  const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  const updateActivity = () => {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
  };

  activityEvents.forEach((event) =>
    window.addEventListener(event, updateActivity, { passive: true })
  );

  // Check session validity every 60 seconds
  const interval = setInterval(() => {
    const sessionStart = Number(sessionStorage.getItem(SESSION_START_KEY) || now());
    const lastActivity = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY) || now());
    const currentTime = now();

    // Check max session age (24 hours)
    if (currentTime - sessionStart > MAX_SESSION_AGE_MS) {
      console.warn("[SessionSecurity] Max session age exceeded (24h)");
      onExpire();
      return;
    }

    // Check idle timeout (30 minutes)
    if (currentTime - lastActivity > IDLE_TIMEOUT_MS) {
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
  sessionStorage.removeItem(SESSION_START_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}
