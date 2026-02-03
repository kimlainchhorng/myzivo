/**
 * Duffel Environment Configuration
 * Provides helper routes for sandbox testing and environment detection
 * 
 * LIVE MODE: When DUFFEL_ENV=live, strict validation is enforced
 * SANDBOX MODE: Test routes available, debug UI enabled
 */

// Sandbox test routes that reliably return results in Duffel test mode
export const DUFFEL_SANDBOX_ROUTES = [
  { from: 'LHR', to: 'CDG', label: 'London → Paris' },
  { from: 'SFO', to: 'LAX', label: 'San Francisco → Los Angeles' },
  { from: 'JFK', to: 'BOS', label: 'New York → Boston' },
  { from: 'LAX', to: 'SFO', label: 'Los Angeles → San Francisco' },
  { from: 'LHR', to: 'JFK', label: 'London → New York' },
  { from: 'CDG', to: 'AMS', label: 'Paris → Amsterdam' },
] as const;

/**
 * Check if we're in Duffel sandbox mode
 * This is set from the edge function response or sessionStorage
 */
export function isSandboxMode(): boolean {
  // Check sessionStorage first (set from edge function response)
  const storedEnv = sessionStorage.getItem('duffel_env');
  if (storedEnv) {
    return storedEnv === 'sandbox' || storedEnv === 'test';
  }
  
  // In development mode, assume sandbox
  return import.meta.env.MODE === 'development';
}

/**
 * Check if we're in Duffel LIVE mode
 */
export function isLiveMode(): boolean {
  const stored = sessionStorage.getItem('duffel_env');
  return stored === 'live';
}

/**
 * Set the Duffel environment from edge function response
 */
export function setDuffelEnvironment(env: string): void {
  sessionStorage.setItem('duffel_env', env);
}

/**
 * Get current Duffel environment
 */
export function getDuffelEnvironment(): 'sandbox' | 'live' | 'unknown' {
  const stored = sessionStorage.getItem('duffel_env');
  if (stored === 'live') return 'live';
  if (stored === 'sandbox' || stored === 'test') return 'sandbox';
  return import.meta.env.MODE === 'development' ? 'sandbox' : 'unknown';
}

/**
 * Whether to show debug UI (only in sandbox mode)
 */
export function shouldShowDebugUI(): boolean {
  return isSandboxMode();
}

/**
 * Whether to show sandbox-specific UI elements
 * Requires BOTH sandbox mode AND admin status
 */
export function shouldShowSandboxUI(isAdmin: boolean): boolean {
  return isSandboxMode() && isAdmin;
}

/**
 * Whether to enforce strict validation (live mode requires stricter checks)
 */
export function shouldEnforceStrictValidation(): boolean {
  return isLiveMode();
}
