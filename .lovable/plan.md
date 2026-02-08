
# Masked Phone Calling System for Eats Orders

## Overview
Implement privacy-protected calling between Customer, Driver, and Merchant during active Eats orders using Twilio Programmable Voice with proxy numbers.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Twilio SMS integration | ✅ Complete | `send-notification`, `process-order-notifications` edge functions |
| Twilio credentials pattern | ✅ Available | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| Rate limiter | ✅ Complete | `supabase/functions/rate-limiter/index.ts` |
| Direct call buttons | ✅ Exists | `DriverInfoCard`, `EatsOrderCard` use `tel:` links |
| Phone fields | ✅ Available | `profiles.phone`, `drivers.phone`, `restaurants.phone`, `food_orders.customer_phone` |
| Edge function patterns | ✅ Established | CORS headers, service role client, error handling |
| Order status tracking | ✅ Complete | `food_orders.status` with full lifecycle |

### Missing
| Feature | Status |
|---------|--------|
| `call_sessions` table | ❌ Need to create |
| `call_logs` table | ❌ Need to create |
| Twilio Voice edge functions | ❌ Need `eats-call-start`, `eats-twilio-voice`, `eats-twilio-status` |
| Proxy number management | ❌ Need `TWILIO_PROXY_NUMBER_POOL` secret |
| `useOrderCall` hook | ❌ Client-side call initiation |
| `MaskedCallButton` component | ❌ Replace direct `tel:` links |
| Rate limiting for calls | ❌ Max 3 calls per 5 min per order |

---

## Implementation Plan

### A) Database Schema

**New Tables:**

**1. `call_sessions`** — One per order, manages proxy number allocation
```sql
CREATE TABLE call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  customer_user_id uuid NOT NULL REFERENCES auth.users(id),
  driver_user_id uuid REFERENCES auth.users(id),
  merchant_user_id uuid NOT NULL REFERENCES auth.users(id),
  customer_phone text,
  driver_phone text,
  merchant_phone text,
  twilio_proxy_number text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**2. `call_logs`** — Track each call attempt
```sql
CREATE TABLE call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id uuid NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES food_orders(id),
  from_role text NOT NULL CHECK (from_role IN ('customer', 'driver', 'merchant')),
  to_role text NOT NULL CHECK (to_role IN ('customer', 'driver', 'merchant')),
  from_user_id uuid NOT NULL REFERENCES auth.users(id),
  to_user_id uuid REFERENCES auth.users(id),
  twilio_call_sid text,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer')),
  duration_seconds integer,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
```

**RLS Policies:**
- Participants can read their own call sessions/logs
- Only service role can insert/update call logs

### B) Secrets Required

| Secret | Purpose |
|--------|---------|
| `TWILIO_ACCOUNT_SID` | Already exists (SMS) |
| `TWILIO_AUTH_TOKEN` | Already exists (SMS) |
| `TWILIO_PROXY_NUMBER_POOL` | Comma-separated list of Twilio phone numbers for masking (e.g., `+14155551234,+14155555678`) |

### C) Edge Function: `eats-call-session`

Get or create a call session for an order.

**File:** `supabase/functions/eats-call-session/index.ts`

**Endpoint:** `POST /functions/v1/eats-call-session`

**Request:**
```json
{ "order_id": "uuid" }
```

**Logic:**
1. Validate user is order participant (customer, assigned driver, or restaurant owner)
2. Check order status is active (`confirmed`, `preparing`, `ready_for_pickup`, `out_for_delivery`)
3. Check for existing active session
4. If none, create new session:
   - Pick proxy number from pool (round-robin or least-recently-used)
   - Set `expires_at` = 2 hours from now
   - Populate participant user IDs and phone numbers
5. Return session with proxy number

**Response:**
```json
{
  "session_id": "uuid",
  "proxy_number": "+14155551234",
  "expires_at": "2026-02-08T23:00:00Z",
  "participants": {
    "customer": { "has_phone": true },
    "driver": { "has_phone": true },
    "merchant": { "has_phone": true }
  }
}
```

### D) Edge Function: `eats-call-start`

Initiate a masked call between two participants.

**File:** `supabase/functions/eats-call-start/index.ts`

**Endpoint:** `POST /functions/v1/eats-call-start`

**Request:**
```json
{
  "order_id": "uuid",
  "from_role": "customer",
  "to_role": "driver"
}
```

**Logic:**
1. Validate session exists and is active
2. Rate limit: max 3 calls per 5 minutes per order
3. Get caller's phone and callee's phone from session
4. Create call_log with status `initiated`
5. Use Twilio REST API to create call:
   - From: Proxy number
   - To: Caller's phone
   - URL: Webhook URL for TwiML (connects to callee)
6. Return call status

**Twilio Call Creation:**
```typescript
const call = await twilioClient.calls.create({
  from: proxyNumber,
  to: callerPhone,
  url: `${FUNCTION_BASE_URL}/eats-twilio-voice?session=${sessionId}&to_role=${toRole}`,
  statusCallback: `${FUNCTION_BASE_URL}/eats-twilio-status`,
  statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
});
```

### E) Edge Function: `eats-twilio-voice`

Twilio webhook that returns TwiML to connect the call.

**File:** `supabase/functions/eats-twilio-voice/index.ts`

**Endpoint:** `POST /functions/v1/eats-twilio-voice`

**Query Params:** `session`, `to_role`

**Logic:**
1. Validate request signature (Twilio security)
2. Look up session and get target phone
3. Return TwiML to dial the target

**TwiML Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you now. Your phone number is private.</Say>
  <Dial callerId="+14155551234" timeout="30">
    <Number>+1XXXXXXXXXX</Number>
  </Dial>
</Response>
```

### F) Edge Function: `eats-twilio-status`

Twilio status callback to update call_logs.

**File:** `supabase/functions/eats-twilio-status/index.ts`

**Endpoint:** `POST /functions/v1/eats-twilio-status`

**Logic:**
1. Parse Twilio callback data (`CallSid`, `CallStatus`, `CallDuration`)
2. Update call_log status
3. Handle completed/failed states

### G) Client Hook: `useOrderCall`

**File:** `src/hooks/useOrderCall.ts`

**Features:**
- Get or create call session on mount
- `startCall(toRole)` mutation
- Track call status
- Rate limit feedback
- Error handling

```typescript
export function useOrderCall(orderId: string | undefined, myRole: 'customer' | 'driver' | 'merchant') {
  const [session, setSession] = useState<CallSession | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  
  // Get or create session
  const sessionQuery = useQuery({...});
  
  // Start call mutation
  const startCallMutation = useMutation({
    mutationFn: async (toRole: string) => {
      const { data, error } = await supabase.functions.invoke('eats-call-start', {
        body: { order_id: orderId, from_role: myRole, to_role: toRole }
      });
      if (error) throw error;
      return data;
    },
  });
  
  return {
    session,
    startCall: startCallMutation.mutate,
    isStarting: startCallMutation.isPending,
    canCallCustomer: session?.participants.customer.has_phone,
    canCallDriver: session?.participants.driver?.has_phone,
    canCallMerchant: session?.participants.merchant.has_phone,
  };
}
```

### H) Component: `MaskedCallButton`

**File:** `src/components/eats/MaskedCallButton.tsx`

Replace direct `tel:` links with masked calling.

**Props:**
```typescript
interface MaskedCallButtonProps {
  orderId: string;
  myRole: 'customer' | 'driver' | 'merchant';
  targetRole: 'customer' | 'driver' | 'merchant';
  variant?: 'default' | 'icon';
  className?: string;
}
```

**UI:**
- Phone icon button
- Loading state while initiating
- Toast feedback for call status
- Disabled state if no phone or order inactive

### I) UI Integration Points

**1. Customer Order Detail (`EatsOrderDetail.tsx`):**
- Replace restaurant phone `tel:` with `<MaskedCallButton targetRole="merchant" />`
- Replace driver call in `DriverInfoCard` with `<MaskedCallButton targetRole="driver" />`

**2. Driver Order Card (`EatsOrderCard.tsx`):**
- Replace customer call button with `<MaskedCallButton targetRole="customer" />`
- Replace restaurant call button with `<MaskedCallButton targetRole="merchant" />`

**3. Merchant Orders (`RestaurantOrders.tsx`):**
- Add `<MaskedCallButton targetRole="customer" />` to order cards
- Add `<MaskedCallButton targetRole="driver" />` when driver assigned

### J) Rate Limiting

**In `eats-call-start`:**
```typescript
// Check rate limit: max 3 calls per 5 min per order
const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

const { count } = await supabase
  .from('call_logs')
  .select('*', { count: 'exact', head: true })
  .eq('order_id', orderId)
  .gte('created_at', fiveMinAgo);

if (count && count >= 3) {
  throw new Error('Rate limit: Maximum 3 calls per 5 minutes');
}
```

### K) Session Expiration & Cleanup

**Automatic Expiration:**
- Sessions expire 2 hours after creation
- Sessions end when order status becomes `delivered` or `cancelled`

**Cleanup Trigger:**
```sql
CREATE OR REPLACE FUNCTION expire_call_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('delivered', 'cancelled') AND OLD.status != NEW.status THEN
    UPDATE call_sessions
    SET status = 'ended', updated_at = now()
    WHERE order_id = NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expire_call_sessions
AFTER UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION expire_call_sessions();
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/eats-call-session/index.ts` | Get/create call session |
| `supabase/functions/eats-call-start/index.ts` | Initiate masked call |
| `supabase/functions/eats-twilio-voice/index.ts` | TwiML webhook |
| `supabase/functions/eats-twilio-status/index.ts` | Call status callback |
| `src/hooks/useOrderCall.ts` | Client call management |
| `src/components/eats/MaskedCallButton.tsx` | Privacy-protected call button |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Replace `tel:` links with MaskedCallButton |
| `src/components/eats/DriverInfoCard.tsx` | Replace call button with MaskedCallButton |
| `src/components/driver/EatsOrderCard.tsx` | Replace call buttons with MaskedCallButton |
| `src/components/restaurant/RestaurantOrders.tsx` | Add call buttons for customer/driver |
| `supabase/config.toml` | Add new function configs with `verify_jwt = false` for webhooks |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Create `call_sessions` table | Track proxy number allocation |
| Create `call_logs` table | Log call attempts |
| Add RLS policies | Participant access control |
| Add cleanup trigger | End sessions on order completion |

---

## Security Considerations

1. **Phone Number Privacy**: Real phone numbers never exposed to other parties
2. **Session Validation**: Only order participants can initiate calls
3. **Status-Based Access**: Calls only allowed during active order statuses
4. **Rate Limiting**: Prevent abuse with 3 calls per 5 min limit
5. **Webhook Validation**: Validate Twilio request signatures
6. **Expiration**: Sessions auto-expire after 2 hours or order completion
7. **RLS Policies**: Database-level access control

---

## Call Flow Diagram

```text
Customer taps "Call Driver"
    ↓
useOrderCall.startCall("driver")
    ↓
POST /eats-call-start
    ↓
Validate: session active, rate limit OK, phones available
    ↓
Create call_logs entry (status: initiated)
    ↓
Twilio API: Create call
  - From: +14155551234 (proxy)
  - To: Customer's phone
  - URL: /eats-twilio-voice?to_role=driver
    ↓
Twilio calls Customer's phone
    ↓
Customer answers → Twilio hits /eats-twilio-voice
    ↓
Return TwiML: <Dial> to Driver's phone (from proxy)
    ↓
Driver's phone rings → shows +14155551234 (proxy)
    ↓
Driver answers → connected!
    ↓
/eats-twilio-status updates call_logs
```

---

## Technical Notes

### Twilio Setup Required
1. Purchase 1+ Twilio phone numbers with Voice capability
2. Configure webhook URLs in Twilio console (or use dynamic TwiML)
3. Note: Twilio Proxy API is an alternative but more complex

### Proxy Number Pool Strategy
- Start with 1-3 numbers for MVP
- Use round-robin selection
- Each active session occupies a number
- Numbers can be reused after session ends

### Fallback Behavior
- If Twilio unavailable: Show error toast, don't expose raw numbers
- If no phone on file: Disable call button with "No phone number" tooltip

---

## Summary

This implementation adds:

1. **Database Infrastructure**: `call_sessions` and `call_logs` tables with proper RLS
2. **Edge Functions**: Session management, call initiation, Twilio webhooks
3. **Client Hook**: `useOrderCall` for managing call state
4. **UI Component**: `MaskedCallButton` replacing direct `tel:` links
5. **Rate Limiting**: Max 3 calls per 5 minutes per order
6. **Auto-Expiration**: Sessions end on order completion or after 2 hours
7. **Privacy Protection**: Real phone numbers never exposed between parties
