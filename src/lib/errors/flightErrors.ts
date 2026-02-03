/**
 * Flight Error Message Transformation
 * Converts technical API errors to user-friendly messages
 * 
 * NEVER expose internal error details to users
 */

const ERROR_MAP: Record<string, string> = {
  // Network errors
  'failed to fetch': "We're having trouble retrieving flights. Please try again shortly.",
  'network error': "Connection issue. Please check your internet and try again.",
  'timeout': "Search is taking longer than expected. Please try again.",
  'aborted': "Search was cancelled. Please try again.",
  
  // Rate limiting
  'rate limit': "Too many searches. Please wait a moment and try again.",
  'too many': "Too many searches. Please wait a moment and try again.",
  'slow down': "Please slow down. Too many searches in a short time.",
  
  // Duffel API errors  
  'duffel_api_key not configured': "Flight search is temporarily unavailable. Please try again later.",
  'duffel api error': "We're having trouble retrieving flights. Please try again shortly.",
  'invalid api key': "Flight search is temporarily unavailable. Please try again later.",
  'unauthorized': "Flight search is temporarily unavailable. Please try again later.",
  
  // Offer errors
  'offer not found': "This fare is no longer available. Please search again.",
  'offer expired': "This offer has expired. Please search again for current prices.",
  'no longer available': "This fare is no longer available. Please search again.",
  'no offers': "No flights available for these dates. Try different dates or airports.",
  'price has changed': "The price has changed. Please search again for updated fares.",
  
  // Payment errors
  'payment failed': "Payment could not be processed. Please try a different payment method.",
  'card declined': "Your card was declined. Please try a different payment method.",
  'insufficient funds': "Your payment method has insufficient funds.",
  'expired card': "Your card has expired. Please use a different payment method.",
  
  // Booking errors
  'booking failed': "We couldn't complete your booking. Please try again or contact support.",
  'ticketing failed': "There was an issue issuing your ticket. Our team has been notified.",
  'passenger validation': "Please check passenger information and try again.",
  
  // Input validation
  'invalid origin': "Please enter a valid departure airport.",
  'invalid destination': "Please enter a valid arrival airport.",
  'invalid date': "Please select valid travel dates.",
  'missing required': "Please fill in all required fields.",
};

const GENERIC_ERROR = "Something went wrong. Please try again or contact support.";

/**
 * Transform a technical error message into a user-friendly message
 */
export function transformFlightError(technicalError: string): string {
  const lowerError = technicalError.toLowerCase();
  
  // Check for matching patterns
  for (const [pattern, userMessage] of Object.entries(ERROR_MAP)) {
    if (lowerError.includes(pattern.toLowerCase())) {
      return userMessage;
    }
  }
  
  // Check if it's already a user-friendly message (starts with capital, ends with period)
  if (/^[A-Z].*\.$/.test(technicalError) && !technicalError.includes('Error:')) {
    return technicalError;
  }
  
  // Return generic error for unrecognized technical errors
  console.warn('[FlightErrors] Unmapped error:', technicalError);
  return GENERIC_ERROR;
}

/**
 * Check if an error is retryable (user should try again)
 */
export function isRetryableError(error: string): boolean {
  const retryable = ['timeout', 'network', 'fetch', 'temporarily', 'try again'];
  const lowerError = error.toLowerCase();
  return retryable.some(pattern => lowerError.includes(pattern));
}

/**
 * Check if error requires a new search (offer expired/changed)
 */
export function requiresNewSearch(error: string): boolean {
  const searchRequired = ['no longer available', 'expired', 'price has changed', 'search again'];
  const lowerError = error.toLowerCase();
  return searchRequired.some(pattern => lowerError.includes(pattern));
}

/**
 * Get error severity for UI display
 */
export function getErrorSeverity(error: string): 'warning' | 'error' | 'info' {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('rate limit') || lowerError.includes('slow down')) {
    return 'warning';
  }
  
  if (lowerError.includes('no flights') || lowerError.includes('try different')) {
    return 'info';
  }
  
  return 'error';
}
