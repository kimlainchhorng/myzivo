
# Production Safety, Rate Limiting & Monitoring for ZIVO Flights

## Summary

This plan implements comprehensive production safety measures to prepare ZIVO Flights for public traffic under Duffel LIVE. It adds search rate limiting, bot protection, payment safety locks, system health monitoring, an admin system status page, and customer-friendly error messaging.

---

## Current State Analysis

| Requirement | Status | Details |
|-------------|--------|---------|
| **Rate limiting infrastructure** | ✅ Exists | `rate-limiter` edge function + client `rateLimiter.ts` |
| **Rate limiting for flights** | ⚠️ Partial | Config exists (`flights_search: 30/min`) but NOT integrated into `useDuffelFlightSearch` |
| **Bot detection** | ✅ Exists | Edge function has `detectBot()` with user-agent analysis |
| **Duplicate search detection** | ❌ Missing | No protection against rapid identical searches |
| **Payment safety (offer verification)** | ❌ Missing | No offer re-validation before checkout |
| **System health monitoring** | ⚠️ Partial | Generic `AdminSystemStatus` exists but no Duffel/Stripe-specific monitoring |
| **Flights system status page** | ✅ Exists | `/admin/flights/status` shows booking stats and alerts |
| **Customer-friendly errors** | ⚠️ Partial | Some errors shown but API errors can leak through |
| **Admin alerts for failures** | ✅ Exists | `flight_admin_alerts` table with severity levels |

---

## Implementation Plan

### Phase 1: Integrate Rate Limiting into Flight Search Hook

**Goal:** Enforce rate limits on every flight search call.

**File:** `src/hooks/useDuffelFlights.ts`

Add rate limit check before search:
```typescript
import { checkRateLimit, RateLimitError } from '@/lib/security/rateLimiter';

export function useDuffelFlightSearch(params: DuffelSearchParams & { enabled?: boolean }) {
  const { enabled = true, ...searchParams } = params;

  return useQuery({
    queryKey: ['duffel-flights', searchParams],
    queryFn: async (): Promise<DuffelSearchResult> => {
      // Rate limit check
      const rateLimitResult = await checkRateLimit('flights_search');
      if (!rateLimitResult.allowed) {
        throw new RateLimitError(
          'Too many searches. Please wait a moment and try again.',
          rateLimitResult.retryAfter
        );
      }

      // Existing search logic...
    },
    // ...
  });
}
```

**File:** `src/lib/security/rateLimiter.ts`

Update limits to match requirements (10 user, 30 IP):
```typescript
const CLIENT_LIMITS: Record<RateLimitAction, { windowMs: number; max: number }> = {
  flights_search: { windowMs: 60000, max: 10 },  // Changed from 30 to 10
  // ...
};
```

**File:** `supabase/functions/rate-limiter/index.ts`

Update server-side limits:
```typescript
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'flights_search': { windowMs: 60000, maxRequests: 10 },  // 10 per user/minute
  'flights_search_ip': { windowMs: 60000, maxRequests: 30 }, // 30 per IP/minute
  // ...
};
```

---

### Phase 2: Add Bot & Abuse Protection (Duplicate Search Detection)

**Goal:** Block repeated identical searches and detect rapid cycling behavior.

**File:** `src/lib/security/searchProtection.ts` (NEW)

Create a new module for search abuse protection:
```typescript
/**
 * Search Protection - Detect and block abusive search patterns
 */

// Track recent searches to detect duplicates
const recentSearches = new Map<string, { count: number; lastSearch: number }>();
const DUPLICATE_WINDOW_MS = 10000; // 10 seconds
const MAX_DUPLICATES = 3;

// Track rapid cycling (changing airports/dates rapidly)
const cyclingTracker = new Map<string, { changes: number; lastChange: number }>();
const CYCLING_WINDOW_MS = 30000; // 30 seconds
const MAX_CYCLING_CHANGES = 10;

export interface SearchProtectionResult {
  allowed: boolean;
  reason?: 'duplicate' | 'cycling' | 'throttled';
  message?: string;
  waitMs?: number;
}

export function checkSearchAbuse(
  origin: string,
  destination: string,
  departureDate: string,
  sessionId: string
): SearchProtectionResult {
  const now = Date.now();
  
  // Check for duplicate searches
  const searchKey = `${origin}-${destination}-${departureDate}-${sessionId}`;
  const existing = recentSearches.get(searchKey);
  
  if (existing && now - existing.lastSearch < DUPLICATE_WINDOW_MS) {
    existing.count++;
    existing.lastSearch = now;
    
    if (existing.count > MAX_DUPLICATES) {
      return {
        allowed: false,
        reason: 'duplicate',
        message: 'You\'ve searched this route multiple times. Please wait a moment.',
        waitMs: DUPLICATE_WINDOW_MS - (now - existing.lastSearch),
      };
    }
  } else {
    recentSearches.set(searchKey, { count: 1, lastSearch: now });
  }

  // Check for rapid cycling (changing search params too fast)
  const cycleKey = sessionId;
  const cycleData = cyclingTracker.get(cycleKey) || { changes: 0, lastChange: 0 };
  
  if (now - cycleData.lastChange < 2000) { // Less than 2 seconds since last change
    cycleData.changes++;
    
    if (cycleData.changes > MAX_CYCLING_CHANGES) {
      return {
        allowed: false,
        reason: 'cycling',
        message: 'Please slow down. Too many searches in a short time.',
        waitMs: CYCLING_WINDOW_MS - (now - cycleData.lastChange),
      };
    }
  } else if (now - cycleData.lastChange > CYCLING_WINDOW_MS) {
    // Reset after window expires
    cycleData.changes = 1;
  }
  
  cycleData.lastChange = now;
  cyclingTracker.set(cycleKey, cycleData);

  // Cleanup old entries periodically
  cleanupOldEntries(now);

  return { allowed: true };
}

function cleanupOldEntries(now: number) {
  // Run cleanup every 100 calls
  if (Math.random() > 0.01) return;
  
  for (const [key, value] of recentSearches) {
    if (now - value.lastSearch > DUPLICATE_WINDOW_MS * 2) {
      recentSearches.delete(key);
    }
  }
  
  for (const [key, value] of cyclingTracker) {
    if (now - value.lastChange > CYCLING_WINDOW_MS * 2) {
      cyclingTracker.delete(key);
    }
  }
}

export function clearSearchProtection(sessionId: string) {
  for (const key of recentSearches.keys()) {
    if (key.endsWith(sessionId)) {
      recentSearches.delete(key);
    }
  }
  cyclingTracker.delete(sessionId);
}
```

**File:** `src/hooks/useDuffelFlights.ts`

Integrate search protection:
```typescript
import { checkSearchAbuse } from '@/lib/security/searchProtection';
import { getSearchSessionId } from '@/config/trackingParams';

// In queryFn:
const sessionId = getSearchSessionId();
const abuseCheck = checkSearchAbuse(
  searchParams.origin,
  searchParams.destination,
  searchParams.departureDate,
  sessionId
);

if (!abuseCheck.allowed) {
  throw new Error(abuseCheck.message || 'Please wait before searching again.');
}
```

---

### Phase 3: Payment Safety Locks (Offer Verification)

**Goal:** Verify offer is still valid and price matches before creating PaymentIntent.

**File:** `supabase/functions/create-flight-checkout/index.ts`

Add offer verification before checkout:
```typescript
// After passenger validation, before creating booking:

// PAYMENT SAFETY: Verify offer is still valid
const DUFFEL_API_KEY = Deno.env.get("DUFFEL_API_KEY");
if (DUFFEL_API_KEY && isLiveMode) {
  console.log("[FlightCheckout] Verifying offer validity...");
  
  try {
    const offerResponse = await fetch(`https://api.duffel.com/air/offers/${offerId}`, {
      headers: {
        "Authorization": `Bearer ${DUFFEL_API_KEY}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
      },
    });

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json();
      console.error("[FlightCheckout] Offer verification failed:", errorData);
      throw new Error("This fare is no longer available. Please search again.");
    }

    const offerData = await offerResponse.json();
    const duffelOffer = offerData.data;

    // Verify price matches (with small tolerance for rounding)
    const duffelPrice = parseFloat(duffelOffer.total_amount);
    const expectedPrice = totalAmount * passengers.length;
    const priceDiff = Math.abs(duffelPrice - expectedPrice);
    
    if (priceDiff > 1) { // $1 tolerance
      console.error("[FlightCheckout] Price mismatch:", { duffelPrice, expectedPrice, priceDiff });
      throw new Error("The price has changed. Please search again for updated fares.");
    }

    // Verify offer hasn't expired
    const expiresAt = new Date(duffelOffer.expires_at);
    if (expiresAt < new Date()) {
      throw new Error("This offer has expired. Please search again.");
    }

    console.log("[FlightCheckout] Offer verified successfully");
  } catch (verifyError) {
    if (verifyError instanceof Error && verifyError.message.includes("no longer available")) {
      throw verifyError;
    }
    // Log but continue in sandbox mode
    if (!isLiveMode) {
      console.warn("[FlightCheckout] Offer verification skipped in sandbox");
    } else {
      throw verifyError;
    }
  }
}
```

---

### Phase 4: System Health Monitoring with Alerts

**Goal:** Monitor Duffel/Stripe health and create alerts for failures.

**File:** `src/hooks/useSystemHealth.ts` (NEW)

Create a hook for system health monitoring:
```typescript
/**
 * System Health Monitoring Hook
 * Tracks Duffel API, Stripe, and booking system health
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours, subMinutes } from "date-fns";

export interface FlightSystemHealth {
  duffel: {
    status: 'ok' | 'degraded' | 'down';
    errorRate: number;
    avgResponseTime: number;
    lastError?: string;
  };
  stripe: {
    status: 'ok' | 'degraded' | 'down';
    failedPayments: number;
    mode: 'test' | 'live' | 'unknown';
  };
  bookings: {
    status: 'ok' | 'warning' | 'critical';
    lastSuccessAt: string | null;
    failedToday: number;
    pendingTickets: number;
    paymentToFailureRate: number; // Payments that succeeded but ticketing failed
  };
  alerts: {
    critical: number;
    warning: number;
    unresolved: number;
  };
}

export function useFlightSystemHealth() {
  return useQuery({
    queryKey: ['flight-system-health'],
    queryFn: async (): Promise<FlightSystemHealth> => {
      const now = new Date();
      const oneHourAgo = subHours(now, 1);
      const twentyFourHoursAgo = subHours(now, 24);
      const fiveMinutesAgo = subMinutes(now, 5);

      // Get recent search logs for Duffel health
      const { data: searchLogs } = await supabase
        .from('flight_search_logs')
        .select('duffel_error, response_time_ms, created_at')
        .gte('created_at', oneHourAgo.toISOString());

      const errorSearches = searchLogs?.filter(s => s.duffel_error)?.length || 0;
      const totalSearches = searchLogs?.length || 0;
      const duffelErrorRate = totalSearches > 0 ? (errorSearches / totalSearches) * 100 : 0;
      const avgResponseTime = searchLogs?.length 
        ? searchLogs.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / searchLogs.length 
        : 0;

      // Get booking stats for last 24h
      const { data: bookings } = await supabase
        .from('flight_bookings')
        .select('id, payment_status, ticketing_status, created_at, ticketed_at')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      const failedBookings = bookings?.filter(b => 
        b.ticketing_status === 'failed' || b.payment_status === 'refunded'
      )?.length || 0;
      
      const pendingTickets = bookings?.filter(b => 
        b.ticketing_status === 'pending' || b.ticketing_status === 'processing'
      )?.length || 0;

      // Calculate payment success but ticketing failure rate
      const paidButFailed = bookings?.filter(b => 
        b.payment_status === 'paid' && b.ticketing_status === 'failed'
      )?.length || 0;
      const paidTotal = bookings?.filter(b => b.payment_status === 'paid')?.length || 0;
      const paymentToFailureRate = paidTotal > 0 ? (paidButFailed / paidTotal) * 100 : 0;

      // Get last successful booking
      const { data: lastSuccess } = await supabase
        .from('flight_bookings')
        .select('ticketed_at')
        .eq('ticketing_status', 'issued')
        .order('ticketed_at', { ascending: false })
        .limit(1)
        .single();

      // Get unresolved alerts
      const { data: alerts } = await supabase
        .from('flight_admin_alerts')
        .select('severity, resolved')
        .eq('resolved', false);

      const criticalAlerts = alerts?.filter(a => a.severity === 'critical')?.length || 0;
      const warningAlerts = alerts?.filter(a => a.severity === 'high' || a.severity === 'medium')?.length || 0;

      // Determine statuses
      const duffelStatus = duffelErrorRate > 50 ? 'down' : duffelErrorRate > 20 ? 'degraded' : 'ok';
      const bookingStatus = criticalAlerts > 0 ? 'critical' : failedBookings > 5 ? 'warning' : 'ok';

      return {
        duffel: {
          status: duffelStatus,
          errorRate: Math.round(duffelErrorRate * 10) / 10,
          avgResponseTime: Math.round(avgResponseTime),
          lastError: searchLogs?.find(s => s.duffel_error)?.duffel_error || undefined,
        },
        stripe: {
          status: 'ok', // Would need actual Stripe health check
          failedPayments: 0,
          mode: 'unknown',
        },
        bookings: {
          status: bookingStatus,
          lastSuccessAt: lastSuccess?.ticketed_at || null,
          failedToday: failedBookings,
          pendingTickets,
          paymentToFailureRate: Math.round(paymentToFailureRate * 10) / 10,
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          unresolved: alerts?.length || 0,
        },
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}
```

---

### Phase 5: Admin System Status Page

**Goal:** Create a dedicated `/admin/system/status` page for overall system health.

**File:** `src/pages/admin/SystemStatusPage.tsx` (NEW)

Create comprehensive system status page with:
- Duffel API status (OK/degraded/down) based on error rate
- Stripe status indicator
- Last successful flight booking timestamp
- Failed bookings count (24h)
- Active alert count
- Response latency trends

Key components:
```typescript
const SystemStatusPage = () => {
  const { data: health, isLoading } = useFlightSystemHealth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with overall status */}
      <div className="flex items-center gap-3">
        <h1>System Status</h1>
        <Badge variant={health?.alerts.critical > 0 ? "destructive" : "outline"}>
          {health?.alerts.critical > 0 ? "Issues Detected" : "All Systems Operational"}
        </Badge>
      </div>

      {/* Status Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Duffel API Status */}
        <Card>
          <CardContent>
            <p>Duffel API</p>
            <StatusBadge status={health?.duffel.status} />
            <p>Error Rate: {health?.duffel.errorRate}%</p>
            <p>Avg Response: {health?.duffel.avgResponseTime}ms</p>
          </CardContent>
        </Card>

        {/* Stripe Status */}
        <Card>
          <CardContent>
            <p>Stripe Payments</p>
            <StatusBadge status={health?.stripe.status} />
            <p>Mode: {health?.stripe.mode}</p>
          </CardContent>
        </Card>

        {/* Last Success */}
        <Card>
          <CardContent>
            <p>Last Issued Ticket</p>
            <p>{health?.bookings.lastSuccessAt ? formatRelative(new Date(health.bookings.lastSuccessAt)) : 'None'}</p>
          </CardContent>
        </Card>

        {/* Failed Bookings */}
        <Card>
          <CardContent>
            <p>Failed Bookings (24h)</p>
            <p className="text-destructive">{health?.bookings.failedToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Thresholds */}
      <AlertThresholdsCard />
    </div>
  );
};
```

**File:** `src/App.tsx`

Add route:
```typescript
<Route path="/admin/system/status" element={<SystemStatusPage />} />
```

---

### Phase 6: Customer-Friendly Error Messages

**Goal:** Replace all technical errors with user-friendly messages.

**File:** `src/hooks/useDuffelFlights.ts`

Add error message transformation:
```typescript
import { transformFlightError } from '@/lib/errors/flightErrors';

// In catch block:
if (error) {
  throw new Error(transformFlightError(error.message || 'Unknown error'));
}
```

**File:** `src/lib/errors/flightErrors.ts` (NEW)

Create error transformation utility:
```typescript
/**
 * Flight Error Message Transformation
 * Converts technical API errors to user-friendly messages
 */

const ERROR_MAP: Record<string, string> = {
  // Network errors
  'Failed to fetch': "We're having trouble retrieving flights. Please try again shortly.",
  'Network Error': "Connection issue. Please check your internet and try again.",
  'timeout': "Search is taking longer than expected. Please try again.",
  
  // Duffel API errors
  'DUFFEL_API_KEY not configured': "Flight search is temporarily unavailable. Please try again later.",
  'Duffel API error': "We're having trouble retrieving flights. Please try again shortly.",
  'rate limit': "Too many searches. Please wait a moment and try again.",
  
  // Offer errors
  'offer not found': "This fare is no longer available. Please search again.",
  'offer expired': "This offer has expired. Please search again for current prices.",
  'no offers': "No flights available for these dates. Try different dates or airports.",
  
  // Payment errors
  'payment failed': "Payment could not be processed. Please try a different payment method.",
  'card declined': "Your card was declined. Please try a different payment method.",
  
  // Booking errors
  'booking failed': "We couldn't complete your booking. Please try again or contact support.",
  'ticketing failed': "There was an issue issuing your ticket. Our team has been notified.",
};

const GENERIC_ERROR = "Something went wrong. Please try again or contact support.";

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

export function isRetryableError(error: string): boolean {
  const retryable = ['timeout', 'network', 'fetch', 'temporarily'];
  const lowerError = error.toLowerCase();
  return retryable.some(pattern => lowerError.includes(pattern));
}
```

**File:** `src/pages/FlightResults.tsx`

Update error display:
```typescript
import { transformFlightError, isRetryableError } from '@/lib/errors/flightErrors';

// In error state rendering:
{isError && (
  <Card className="max-w-lg mx-auto mt-12">
    <CardContent className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Unable to load flights</h3>
      <p className="text-muted-foreground mb-6">
        {transformFlightError(error?.message || 'Unknown error')}
      </p>
      {isRetryableError(error?.message || '') && (
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
)}
```

---

### Phase 7: Production Readiness When DUFFEL_ENV=live

**Goal:** Ensure all safety measures are automatically enforced in live mode.

**File:** `src/config/productionSafety.ts` (NEW)

Create production configuration:
```typescript
/**
 * Production Safety Configuration
 * Enforces strict rules when DUFFEL_ENV=live
 */

import { isLiveMode } from './duffelConfig';

export interface ProductionRules {
  enforceRateLimits: boolean;
  enforceBotProtection: boolean;
  enforceOfferVerification: boolean;
  enableFullLogging: boolean;
  showSandboxHelpers: boolean;
  allowMockData: boolean;
}

export function getProductionRules(): ProductionRules {
  const isLive = isLiveMode();

  return {
    enforceRateLimits: true, // Always enforce
    enforceBotProtection: true, // Always enforce
    enforceOfferVerification: isLive, // Only in live
    enableFullLogging: true, // Always log
    showSandboxHelpers: !isLive, // Only in sandbox
    allowMockData: !isLive, // Only in sandbox
  };
}

export function assertProductionSafe(operation: string): void {
  if (isLiveMode()) {
    console.log(`[PRODUCTION] ${operation}`);
  }
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useDuffelFlights.ts` | MODIFY | Add rate limiting and abuse protection |
| `src/lib/security/rateLimiter.ts` | MODIFY | Update limits to 10/user/min |
| `supabase/functions/rate-limiter/index.ts` | MODIFY | Update server limits, add IP-based limiting |
| `src/lib/security/searchProtection.ts` | CREATE | Bot/abuse protection for duplicate searches |
| `supabase/functions/create-flight-checkout/index.ts` | MODIFY | Add offer verification before payment |
| `src/hooks/useSystemHealth.ts` | CREATE | System health monitoring hook |
| `src/pages/admin/SystemStatusPage.tsx` | CREATE | Admin system status dashboard |
| `src/lib/errors/flightErrors.ts` | CREATE | User-friendly error message transformation |
| `src/pages/FlightResults.tsx` | MODIFY | Use friendly error messages |
| `src/config/productionSafety.ts` | CREATE | Production rules configuration |
| `src/App.tsx` | MODIFY | Add system status route |

---

## Database Changes

No schema changes required. Uses existing tables:
- `flight_search_logs` - Already has error and response time fields
- `flight_admin_alerts` - Already has severity and alert types
- `flight_bookings` - Already tracks payment/ticketing status

---

## Rate Limiting Summary

| Action | User Limit | IP Limit | Window |
|--------|-----------|----------|--------|
| `flights_search` | 10/min | 30/min | 60 seconds |
| Duplicate search | 3 identical | - | 10 seconds |
| Rapid cycling | 10 changes | - | 30 seconds |

---

## Error Message Examples

| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `Failed to fetch` | "We're having trouble retrieving flights. Please try again shortly." |
| `DUFFEL_API_KEY not configured` | "Flight search is temporarily unavailable. Please try again later." |
| `offer not found` | "This fare is no longer available. Please search again." |
| `payment failed` | "Payment could not be processed. Please try a different payment method." |
| `[Any unrecognized error]` | "Something went wrong. Please try again or contact support." |

---

## Admin System Status Alerts

Auto-generated alerts for:
- **Duffel API error spike** - When error rate exceeds 20%
- **Payment success but order failure** - When payment succeeds but ticketing fails
- **Search error rate high** - When >30% of searches fail
- **Long response times** - When avg response >5 seconds

---

## Testing Checklist

1. **Rate Limiting**
   - [ ] Search 11 times rapidly - should see rate limit message
   - [ ] Wait 60 seconds, search again - should work
   - [ ] Try identical search 4x in 10s - should be blocked

2. **Bot Protection**
   - [ ] Change airports rapidly 11 times in 30s - should throttle
   - [ ] Normal search pattern - should work fine

3. **Payment Safety**
   - [ ] Attempt checkout with expired offer - should show "no longer available"
   - [ ] Valid offer proceeds to Stripe checkout

4. **Error Messages**
   - [ ] Network error shows friendly message
   - [ ] API error shows friendly message
   - [ ] No technical details visible to users

5. **System Status Page**
   - [ ] Shows Duffel API status
   - [ ] Shows last successful booking
   - [ ] Shows failed bookings count
   - [ ] Admin-only access enforced
