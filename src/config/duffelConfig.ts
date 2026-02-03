/**
 * Duffel Environment Configuration
 * Provides helper routes for sandbox testing and environment detection
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
