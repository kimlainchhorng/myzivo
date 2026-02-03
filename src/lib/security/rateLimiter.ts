/**
 * Client-side Rate Limiter
 * Provides rate limiting utilities and API integration
 */

import { supabase } from '@/integrations/supabase/client';
import { getSearchSessionId } from '@/config/trackingParams';

export type RateLimitAction = 
  | 'flights_search' 
  | 'hotels_search' 
  | 'cars_search' 
  | 'contact_form' 
  | 'admin_action' 
  | 'login_attempt';

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
  message?: string;
  botScore?: number;
}

// Client-side rate limit tracking (fallback if edge function unavailable)
const clientRateLimits = new Map<string, { count: number; resetAt: number }>();

const CLIENT_LIMITS: Record<RateLimitAction, { windowMs: number; max: number }> = {
  flights_search: { windowMs: 60000, max: 10 },  // 10 searches per user per minute
  hotels_search: { windowMs: 60000, max: 30 },
  cars_search: { windowMs: 60000, max: 30 },
  contact_form: { windowMs: 60000, max: 5 },
  admin_action: { windowMs: 60000, max: 20 },
  login_attempt: { windowMs: 900000, max: 10 },
};

/**
 * Check rate limit for an action (calls edge function)
 */
export async function checkRateLimit(action: RateLimitAction): Promise<RateLimitResult> {
  const sessionId = getSearchSessionId();
  
  try {
    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      headers: {
        'x-rate-limit-action': action,
        'x-session-id': sessionId,
      },
    });

    if (error) {
      console.warn('[RateLimiter] Edge function error, using client fallback:', error);
      return checkClientRateLimit(action);
    }

    return data as RateLimitResult;
  } catch (e) {
    console.warn('[RateLimiter] Failed to check rate limit, using client fallback:', e);
    return checkClientRateLimit(action);
  }
}

/**
 * Client-side rate limit check (fallback)
 */
function checkClientRateLimit(action: RateLimitAction): RateLimitResult {
  const config = CLIENT_LIMITS[action];
  const key = `${action}:${getSearchSessionId()}`;
  const now = Date.now();

  let entry = clientRateLimits.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + config.windowMs };
  } else {
    entry.count++;
  }

  clientRateLimits.set(key, entry);

  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    };
  }

  return {
    allowed: true,
    remaining: config.max - entry.count,
  };
}

/**
 * Rate limit wrapper for async functions
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  action: RateLimitAction,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const result = await checkRateLimit(action);
    
    if (!result.allowed) {
      throw new RateLimitError(result.message || 'Rate limit exceeded', result.retryAfter);
    }

    return fn(...args);
  }) as T;
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
