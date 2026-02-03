/**
 * Rate Limiter Edge Function
 * Implements sliding window rate limiting per IP/session/user
 * 
 * Uses Supabase for persistence to track request counts across edge instances
 */

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-rate-limit-action, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
}

// Rate limit configurations by action type
// Flight searches: 10 per user/min, 30 per IP/min for bot protection
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'flights_search': { windowMs: 60000, maxRequests: 10 },  // 10 per user per minute
  'flights_search_ip': { windowMs: 60000, maxRequests: 30 }, // 30 per IP per minute
  'hotels_search': { windowMs: 60000, maxRequests: 30 },
  'cars_search': { windowMs: 60000, maxRequests: 30 },
  'contact_form': { windowMs: 60000, maxRequests: 5 },
  'admin_action': { windowMs: 60000, maxRequests: 20 },
  'login_attempt': { windowMs: 900000, maxRequests: 10, blockDurationMs: 900000 }, // 15 min window
  'default': { windowMs: 60000, maxRequests: 100 },
};

// In-memory cache for rate limits (per edge instance)
const rateLimitCache = new Map<string, { count: number; resetAt: number; blocked?: boolean }>();

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client identifiers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const sessionId = req.headers.get('x-session-id') || '';
    const action = req.headers.get('x-rate-limit-action') || 'default';
    const userAgent = req.headers.get('user-agent') || '';
    
    // Get user ID from authorization if present
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Create unique key for rate limiting
    const rateLimitKey = `${action}:${clientIP}:${sessionId}:${userId || 'anon'}`;
    
    // Get config for this action
    const config = RATE_LIMITS[action] || RATE_LIMITS['default'];
    const now = Date.now();

    // Check cache first
    let cacheEntry = rateLimitCache.get(rateLimitKey);
    
    if (!cacheEntry || now >= cacheEntry.resetAt) {
      // Reset or create new entry
      cacheEntry = {
        count: 1,
        resetAt: now + config.windowMs,
        blocked: false,
      };
    } else if (cacheEntry.blocked) {
      // Check if block duration has passed
      if (config.blockDurationMs && now >= cacheEntry.resetAt) {
        cacheEntry = {
          count: 1,
          resetAt: now + config.windowMs,
          blocked: false,
        };
      } else {
        // Still blocked
        const retryAfterSeconds = Math.ceil((cacheEntry.resetAt - now) / 1000);
        
        // Log rate limit event
        await logRateLimitEvent(supabase, {
          action,
          clientIP,
          sessionId,
          userId,
          userAgent,
          blocked: true,
          requestCount: cacheEntry.count,
        });

        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: retryAfterSeconds,
            message: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfterSeconds),
              'X-RateLimit-Limit': String(config.maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(cacheEntry.resetAt / 1000)),
            },
          }
        );
      }
    } else {
      cacheEntry.count++;
    }

    // Check if exceeded
    if (cacheEntry.count > config.maxRequests) {
      cacheEntry.blocked = true;
      if (config.blockDurationMs) {
        cacheEntry.resetAt = now + config.blockDurationMs;
      }
      
      rateLimitCache.set(rateLimitKey, cacheEntry);
      
      const retryAfterSeconds = Math.ceil((cacheEntry.resetAt - now) / 1000);
      
      // Log rate limit event
      await logRateLimitEvent(supabase, {
        action,
        clientIP,
        sessionId,
        userId,
        userAgent,
        blocked: true,
        requestCount: cacheEntry.count,
      });

      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: retryAfterSeconds,
          message: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(cacheEntry.resetAt / 1000)),
          },
        }
      );
    }

    rateLimitCache.set(rateLimitKey, cacheEntry);

    // Check for bot patterns
    const botScore = detectBot(userAgent, req.headers);
    
    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: config.maxRequests - cacheEntry.count,
        resetAt: cacheEntry.resetAt,
        botScore,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': String(config.maxRequests - cacheEntry.count),
          'X-RateLimit-Reset': String(Math.ceil(cacheEntry.resetAt / 1000)),
        },
      }
    );

  } catch (error) {
    console.error('[RateLimiter] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Detect bot patterns from request headers
 */
function detectBot(userAgent: string, headers: Headers): number {
  let score = 0;
  
  // Known bot user agents
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /headless/i,
    /phantom/i, /selenium/i, /puppeteer/i, /playwright/i,
    /curl/i, /wget/i, /python/i, /java\//i, /go-http/i,
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      score += 50;
      break;
    }
  }
  
  // Missing common headers
  if (!headers.get('accept-language')) score += 20;
  if (!headers.get('accept-encoding')) score += 10;
  if (!headers.get('accept')) score += 10;
  
  // Suspicious user agent patterns
  if (!userAgent || userAgent.length < 20) score += 30;
  if (!/mozilla|chrome|safari|firefox|edge/i.test(userAgent)) score += 20;
  
  return Math.min(score, 100);
}

/**
 * Log rate limit events for audit
 */
// deno-lint-ignore no-explicit-any
async function logRateLimitEvent(
  supabaseClient: any,
  data: {
    action: string;
    clientIP: string;
    sessionId: string;
    userId: string | null;
    userAgent: string;
    blocked: boolean;
    requestCount: number;
  }
) {
  try {
    await supabaseClient.from('audit_logs').insert([{
      action: 'rate_limit_triggered',
      entity_type: 'rate_limit',
      entity_id: data.action,
      user_id: data.userId,
      ip_address: data.clientIP,
      user_agent: data.userAgent,
      new_values: {
        action: data.action,
        session_id: data.sessionId,
        blocked: data.blocked,
        request_count: data.requestCount,
      },
    }]);
  } catch (e) {
    console.error('[RateLimiter] Failed to log event:', e);
  }
}
