
# Add Better Error Handling for Supabase Connection and Trip Insert Failures

## Summary

This update adds robust error handling throughout the ride booking flow, including:
- Specific error messages for different failure types
- Retry functionality for failed operations
- User-friendly error states with clear recovery options
- Connection health monitoring with visual indicators

## Current State

| Area | Current Handling |
|------|------------------|
| Trip insert (`createRideInDb`) | Returns `null` on failure, logs to console |
| Realtime subscription | Generic "Connection error" toast |
| Cancel operation | No error feedback if cancel fails |
| Confirm page | Shows "Failed to create ride" toast, no retry option |
| Network issues | Silently falls back to demo mode |

## Improvements

### 1. Enhanced Error Types and Messages

Create a dedicated error handling module that categorizes Supabase errors and provides user-friendly messages.

**Error Categories:**
- **Network errors** - Device offline, timeout
- **Authentication errors** - Session expired, unauthorized
- **Database errors** - RLS policy violation, constraint errors
- **Rate limiting** - Too many requests
- **Unknown errors** - Fallback handling

### 2. Retry Logic with Exponential Backoff

Add automatic retry for transient failures with configurable retry counts.

```text
Retry Strategy:
┌─────────────────────────────────────┐
│ Attempt 1: Immediate               │
│ Attempt 2: Wait 1 second           │
│ Attempt 3: Wait 2 seconds          │
│ Attempt 4: Wait 4 seconds          │
│ Max attempts: 3 (configurable)     │
└─────────────────────────────────────┘
```

### 3. Connection Health Banner

Add a reusable connection status component that shows:
- Connection lost warning
- Retry button
- Automatic reconnection attempts

### 4. Enhanced Confirm Page Error Handling

Improve the ride confirmation flow:
- Show specific error messages based on failure type
- Add "Retry" button when insert fails
- Option to continue in demo mode explicitly
- Disable proceed button during retry

### 5. Realtime Subscription Error Recovery

Add automatic reconnection for dropped realtime subscriptions:
- Detect disconnection
- Attempt reconnection with backoff
- Show connection status in searching screen

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabaseErrors.ts` | Create | Error categorization and retry utilities |
| `src/components/ride/ConnectionErrorBanner.tsx` | Create | Reusable connection error banner |
| `src/lib/supabaseRide.ts` | Modify | Add retry logic, enhanced error returns |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Better error UI, retry button |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Connection error banner, retry logic |
| `src/hooks/useRideRealtime.ts` | Modify | Reconnection logic, error states |

---

## Technical Details

### New Error Handling Module (`src/lib/supabaseErrors.ts`)

```typescript
// Error types for categorization
export type SupabaseErrorType = 
  | 'network'
  | 'auth'
  | 'database'
  | 'rate_limit'
  | 'unknown';

export interface SupabaseErrorInfo {
  type: SupabaseErrorType;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  originalError?: unknown;
}

// Categorize errors from Supabase responses
export function categorizeError(error: unknown): SupabaseErrorInfo {
  // Check for network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: error.message,
      userMessage: 'Unable to connect. Check your internet connection.',
      isRetryable: true,
    };
  }
  
  // Check for Supabase-specific errors
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; message?: string; status?: number };
    
    // Auth errors
    if (err.status === 401 || err.code === 'PGRST301') {
      return {
        type: 'auth',
        message: err.message || 'Unauthorized',
        userMessage: 'Session expired. Please sign in again.',
        isRetryable: false,
      };
    }
    
    // Rate limiting
    if (err.status === 429) {
      return {
        type: 'rate_limit',
        message: 'Rate limited',
        userMessage: 'Too many requests. Please wait a moment.',
        isRetryable: true,
      };
    }
    
    // RLS or database errors
    if (err.code?.startsWith('PGRST') || err.code?.startsWith('23')) {
      return {
        type: 'database',
        message: err.message || 'Database error',
        userMessage: 'Unable to save your request. Please try again.',
        isRetryable: true,
      };
    }
  }
  
  return {
    type: 'unknown',
    message: String(error),
    userMessage: 'Something went wrong. Please try again.',
    isRetryable: true,
    originalError: error,
  };
}

// Retry with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<{ data: T | null; error: SupabaseErrorInfo | null; attempts: number }> {
  const { maxAttempts = 3, baseDelayMs = 1000 } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      return { data: result, error: null, attempts: attempt };
    } catch (err) {
      const errorInfo = categorizeError(err);
      
      // Don't retry non-retryable errors
      if (!errorInfo.isRetryable || attempt === maxAttempts) {
        return { data: null, error: errorInfo, attempts: attempt };
      }
      
      // Wait with exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { 
    data: null, 
    error: { type: 'unknown', message: 'Max retries exceeded', userMessage: 'Request failed after multiple attempts.', isRetryable: false },
    attempts: maxAttempts 
  };
}
```

### Connection Error Banner Component

```typescript
// src/components/ride/ConnectionErrorBanner.tsx
const ConnectionErrorBanner = ({ 
  error,
  onRetry,
  isRetrying = false 
}: {
  error: SupabaseErrorInfo;
  onRetry?: () => void;
  isRetrying?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-sm px-4 py-3"
  >
    <div className="flex items-center justify-between text-sm text-white max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>{error.userMessage}</span>
      </div>
      {onRetry && error.isRetryable && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium"
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      )}
    </div>
  </motion.div>
);
```

### Enhanced createRideInDb with Retry

```typescript
// Updated return type with full error info
export interface CreateRideResult {
  tripId: string | null;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

export const createRideInDb = async (
  payload: CreateRideDbPayload,
  options?: { enableRetry?: boolean }
): Promise<CreateRideResult> => {
  const { enableRetry = true } = options || {};
  
  const operation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("trips")
      .insert({ ... })
      .select("id")
      .single();
    
    if (error) throw error;
    return data?.id || null;
  };
  
  if (enableRetry) {
    const result = await withRetry(operation);
    return {
      tripId: result.data,
      error: result.error,
      attempts: result.attempts,
    };
  }
  
  // Single attempt without retry
  try {
    const tripId = await operation();
    return { tripId, error: null, attempts: 1 };
  } catch (err) {
    return { tripId: null, error: categorizeError(err), attempts: 1 };
  }
};
```

### Enhanced RideConfirmPage Error Handling

```typescript
// State additions
const [error, setError] = useState<SupabaseErrorInfo | null>(null);
const [retryCount, setRetryCount] = useState(0);

const handleConfirm = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  setError(null);

  try {
    // Create local ride first
    createRide({ ... });

    // Try database insert with retry
    const result = await createRideInDb(payload, { enableRetry: true });

    if (result.tripId) {
      setTripId(result.tripId);
      navigate("/ride/searching");
    } else if (result.error) {
      setError(result.error);
      setRetryCount(prev => prev + 1);
      
      // Show appropriate toast
      if (result.error.type === 'network') {
        toast.error("Connection failed", {
          description: result.error.userMessage,
          action: { label: "Retry", onClick: handleConfirm }
        });
      } else {
        toast.error(result.error.userMessage);
      }
    }
  } catch (err) {
    const errorInfo = categorizeError(err);
    setError(errorInfo);
    toast.error(errorInfo.userMessage);
  } finally {
    setIsSubmitting(false);
  }
};

// Continue in demo mode option
const handleContinueDemo = () => {
  setError(null);
  toast.info("Continuing in demo mode");
  navigate("/ride/searching");
};

// Add to JSX after confirm button when error exists
{error && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-400 font-medium">
          {error.userMessage}
        </p>
        <div className="flex gap-2 mt-3">
          {error.isRetryable && (
            <button onClick={handleConfirm} className="...">
              Try Again
            </button>
          )}
          <button onClick={handleContinueDemo} className="...">
            Continue Offline
          </button>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

### Enhanced Realtime with Reconnection

```typescript
// In useRideRealtime.ts - add reconnection logic
const [connectionError, setConnectionError] = useState<SupabaseErrorInfo | null>(null);
const [isReconnecting, setIsReconnecting] = useState(false);
const reconnectAttemptsRef = useRef(0);
const maxReconnectAttempts = 5;

const reconnect = useCallback(async () => {
  if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
    setConnectionError({
      type: 'network',
      message: 'Max reconnection attempts',
      userMessage: 'Unable to reconnect. Tap to retry.',
      isRetryable: true,
    });
    return;
  }
  
  setIsReconnecting(true);
  reconnectAttemptsRef.current++;
  
  // Exponential backoff
  const delay = 1000 * Math.pow(2, reconnectAttemptsRef.current - 1);
  await new Promise(r => setTimeout(r, delay));
  
  // Attempt to resubscribe
  if (cleanupRef.current) {
    cleanupRef.current();
  }
  cleanupRef.current = subscribeToRide(tripId, callbacks);
  setIsReconnecting(false);
}, [tripId, callbacks]);

// Return connection state for UI
return {
  isConnected,
  isRealtime,
  isDemoMode: !isConnected,
  connectionError,
  isReconnecting,
  reconnect,
};
```

---

## User Experience Flow

```text
Normal Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User taps "Pay & Request"                            │
│ 2. Loading state shown on button                        │
│ 3. Retry automatically if first attempt fails           │
│ 4. Success → Navigate to searching                      │
│ 5. Realtime connects → Waiting for driver               │
└─────────────────────────────────────────────────────────┘

Error Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User taps "Pay & Request"                            │
│ 2. Auto-retry fails after 3 attempts                    │
│ 3. Error panel appears with:                            │
│    - Clear error message                                │
│    - "Try Again" button                                 │
│    - "Continue Offline" option                          │
│ 4. User chooses action                                  │
│    - Retry: Attempts again                              │
│    - Offline: Proceeds in demo mode                     │
└─────────────────────────────────────────────────────────┘

Realtime Error Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User is on searching screen                          │
│ 2. Connection drops                                     │
│ 3. Red banner appears: "Connection lost"                │
│ 4. Auto-reconnect attempts (with backoff)               │
│ 5. Success → Banner disappears                          │
│    OR                                                   │
│ 5. Max retries → "Tap to retry" option                  │
└─────────────────────────────────────────────────────────┘
```

---

## Error Message Examples

| Scenario | User Message |
|----------|--------------|
| No internet | "Unable to connect. Check your internet connection." |
| Session expired | "Session expired. Please sign in again." |
| Rate limited | "Too many requests. Please wait a moment." |
| RLS violation | "Unable to save your request. Please try again." |
| Timeout | "Request timed out. Tap to retry." |
| Unknown | "Something went wrong. Please try again." |
