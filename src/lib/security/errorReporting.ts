/**
 * Global Error Reporting
 * Catches unhandled errors and tracks frequency for attack pattern detection
 */

const ERROR_WINDOW_MS = 60000; // 1 minute
const MAX_ERRORS_PER_WINDOW = 50; // Threshold for attack pattern

let errorTimestamps: number[] = [];

/**
 * Track error frequency to detect potential attacks
 */
function trackErrorFrequency(): boolean {
  const now = Date.now();
  errorTimestamps.push(now);
  
  // Prune old timestamps
  errorTimestamps = errorTimestamps.filter(t => now - t < ERROR_WINDOW_MS);
  
  return errorTimestamps.length >= MAX_ERRORS_PER_WINDOW;
}

/**
 * Set up global error handlers
 * Call once during app initialization
 */
export function setupGlobalErrorHandlers(): void {
  // Unhandled errors
  window.addEventListener('error', (event) => {
    const isAttackPattern = trackErrorFrequency();

    console.error('[ErrorReporting] Unhandled error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      isAttackPattern,
    });

    if (isAttackPattern) {
      console.warn('[ErrorReporting] High error frequency detected - possible attack pattern');
    }
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const isAttackPattern = trackErrorFrequency();

    const reason = event.reason instanceof Error 
      ? event.reason.message 
      : String(event.reason);

    console.error('[ErrorReporting] Unhandled rejection:', {
      reason,
      isAttackPattern,
    });

    if (isAttackPattern) {
      console.warn('[ErrorReporting] High rejection frequency detected - possible attack pattern');
    }
  });
}
