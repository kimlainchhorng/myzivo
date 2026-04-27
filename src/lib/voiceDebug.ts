/**
 * voiceDebug — lightweight runtime debug switch for the voice-note pipeline.
 *
 * Toggle from the browser console:
 *   window.__zivoVoiceDebug(true)   // enable
 *   window.__zivoVoiceDebug(false)  // disable
 *   window.__zivoVoiceDebug()       // returns current state
 *
 * When enabled:
 *   - Failed voice bubbles show the full error reason inline (not just on hover).
 *   - Every upload attempt + insert attempt is logged to the console.
 *   - Persisted in localStorage so it survives reloads.
 */
const KEY = "zivo:voice-debug";

let cached: boolean | null = null;

export function isVoiceDebugEnabled(): boolean {
  if (cached !== null) return cached;
  try {
    cached = typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "1";
  } catch {
    cached = false;
  }
  return cached;
}

export function setVoiceDebugEnabled(on: boolean): void {
  cached = on;
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch { /* noop */ }
  // eslint-disable-next-line no-console
  console.log(`[voice-debug] ${on ? "enabled" : "disabled"}`);
}

export function vlog(...args: unknown[]): void {
  if (!isVoiceDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log("[voice]", ...args);
}

export function vwarn(...args: unknown[]): void {
  // Failures should always log regardless of the debug flag.
  // eslint-disable-next-line no-console
  console.warn("[voice]", ...args);
}

// Expose a console hook so non-developers can flip the flag without DevTools.
if (typeof window !== "undefined") {
  (window as unknown as { __zivoVoiceDebug?: (v?: boolean) => boolean }).__zivoVoiceDebug = (v?: boolean) => {
    if (typeof v === "boolean") setVoiceDebugEnabled(v);
    return isVoiceDebugEnabled();
  };
}
