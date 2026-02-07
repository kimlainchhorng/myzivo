
# Fraud Prevention, Risk Scoring, and Safety Controls Implementation Plan

## Current State Analysis

The project already has a **significant security foundation** that we will build upon:

| Component | Status | Notes |
|-----------|--------|-------|
| `security_events` table | Exists | Has event_type, severity, device_fingerprint, ip_address, user_agent, is_blocked |
| `admin_security_alerts` table | Exists | Linked to security_events, has resolution workflow |
| `trusted_devices` table | Exists | Device trust tracking per user |
| `login_sessions` table | Exists | Session tracking with IP, device fingerprint |
| `src/lib/security/botDetection.ts` | Exists | Device fingerprinting, bot detection, interaction tracking |
| `src/config/fraudPrevention.ts` | Exists | Full risk scoring config: thresholds, signals, velocity limits |
| `src/hooks/useRiskAssessment.ts` | Exists | Client-side risk scoring hook |
| `AdminFraudDetection.tsx` | Exists | Admin panel for fraud alerts |
| `log_security_event` RPC | Exists | Logs security events with auto-alert on critical |
| `check_login_anomaly` RPC | Exists | Login security checks |
| `validate_withdrawal` RPC | Exists | Withdrawal fraud checks |
| `detect_suspicious_activity` trigger | Exists | Auto-detects brute force, rapid withdrawals |
| Multi-tenant framework | Exists | tenants, has_tenant_permission() ready |
| Order risk fields | Missing | Need risk_level, risk_score on food_orders |
| Tenant-scoped risk tables | Missing | Need risk_events, risk_scores, blocked_entities |
| Velocity check RPC | Missing | Unified velocity checking |
| Safety dashboard in Dispatch | Missing | No /dispatch/safety route |

---

## Architecture Overview

```text
Fraud Prevention Flow:

User Action (Login / Order / Payment)
    │
    ├── Client: Device fingerprint + bot detection
    │   └── src/lib/security/botDetection.ts (exists)
    │
    ├── Client: Risk assessment
    │   └── useRiskAssessment hook (exists)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: check_velocity() RPC                          │
│  - Checks action frequency limits                       │
│  - Records risk_events if exceeded                      │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: compute_risk_score() RPC                      │
│  - Sums recent risk_events scores                       │
│  - Updates risk_scores table                            │
│  - Auto-blocks if score > 80                            │
└─────────────────────────────────────────────────────────┘
    │
    ├── If blocked → Deny action + show message
    │
    ├── If high risk → Flag for review
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Dispatch Safety Dashboard                              │
│  - /dispatch/safety (overview)                          │
│  - High-risk orders, blocked entities, risk events      │
│  - Actions: approve, block, reset score                 │
└─────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Create `risk_events` Table (Tenant-scoped)

```sql
CREATE TABLE public.risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES food_orders(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  score INT NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}',
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_risk_events_tenant_time ON risk_events(tenant_id, created_at DESC);
CREATE INDEX idx_risk_events_user ON risk_events(user_id, created_at DESC);
CREATE INDEX idx_risk_events_type ON risk_events(tenant_id, event_type);
```

### 2. Create `risk_scores` Table (User/Order Scoring)

```sql
CREATE TABLE public.risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INT DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'blocked')),
  last_evaluated TIMESTAMPTZ DEFAULT now(),
  score_breakdown JSONB DEFAULT '{}',
  CONSTRAINT unique_risk_score_user UNIQUE (user_id)
);

CREATE INDEX idx_risk_scores_tenant ON risk_scores(tenant_id, risk_level);
CREATE INDEX idx_risk_scores_level ON risk_scores(risk_level) WHERE risk_level IN ('high', 'blocked');
```

### 3. Create `blocked_entities` Table

```sql
CREATE TABLE public.blocked_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'driver', 'merchant', 'device', 'ip', 'card')),
  entity_value TEXT NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  CONSTRAINT unique_blocked_entity UNIQUE (tenant_id, entity_type, entity_value)
);

CREATE INDEX idx_blocked_active ON blocked_entities(tenant_id, entity_type, entity_value) WHERE is_active = true;
CREATE INDEX idx_blocked_expires ON blocked_entities(expires_at) WHERE expires_at IS NOT NULL AND is_active = true;
```

### 4. Create `device_sessions` Table

```sql
CREATE TABLE public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  is_trusted BOOLEAN DEFAULT false,
  trust_expires_at TIMESTAMPTZ,
  CONSTRAINT unique_device_session UNIQUE (user_id, device_fingerprint)
);

CREATE INDEX idx_device_sessions_user ON device_sessions(user_id, last_seen DESC);
CREATE INDEX idx_device_sessions_fingerprint ON device_sessions(device_fingerprint);
```

### 5. Add Risk Fields to `food_orders`

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_signals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX idx_food_orders_risk ON food_orders(risk_level) WHERE risk_level IN ('medium', 'high');
CREATE INDEX idx_food_orders_review ON food_orders(requires_review, review_status);
```

### 6. Add `safety.manage` Permission

```sql
INSERT INTO permissions (key, description, category) VALUES
  ('safety.manage', 'View and manage fraud prevention and risk controls', 'security')
ON CONFLICT (key) DO NOTHING;
```

---

## RPC Functions

### 1. `check_velocity` - Unified Velocity Checking

```sql
CREATE OR REPLACE FUNCTION public.check_velocity(
  p_user_id UUID,
  p_action TEXT,
  p_scope TEXT DEFAULT 'user',
  p_scope_value TEXT DEFAULT NULL,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_limit INT;
  v_window_ms INT;
  v_count INT;
  v_exceeded BOOLEAN := false;
  v_score INT := 0;
BEGIN
  -- Get limit config based on action
  SELECT 
    CASE p_action
      WHEN 'order_create' THEN 5
      WHEN 'payment_attempt' THEN 5
      WHEN 'payment_failed' THEN 3
      WHEN 'login_attempt' THEN 10
      ELSE 20
    END,
    CASE p_action
      WHEN 'order_create' THEN 300000 -- 5 minutes
      WHEN 'payment_attempt' THEN 3600000 -- 1 hour
      WHEN 'payment_failed' THEN 600000 -- 10 minutes
      WHEN 'login_attempt' THEN 300000 -- 5 minutes
      ELSE 3600000
    END
  INTO v_limit, v_window_ms;

  -- Count recent actions
  SELECT COUNT(*) INTO v_count
  FROM risk_events
  WHERE 
    CASE 
      WHEN p_scope = 'user' THEN user_id = p_user_id
      WHEN p_scope = 'ip' THEN ip_address = p_scope_value
      WHEN p_scope = 'device' THEN device_fingerprint = p_scope_value
      ELSE user_id = p_user_id
    END
    AND event_type = p_action
    AND created_at > now() - (v_window_ms || ' milliseconds')::INTERVAL;

  v_exceeded := v_count >= v_limit;
  
  IF v_exceeded THEN
    v_score := CASE 
      WHEN p_action = 'payment_failed' THEN 35
      WHEN p_action = 'login_attempt' THEN 30
      ELSE 25
    END;
    
    -- Record velocity breach event
    INSERT INTO risk_events (tenant_id, user_id, event_type, severity, score, details)
    VALUES (
      p_tenant_id, 
      p_user_id, 
      'velocity_limit',
      CASE WHEN v_count >= v_limit * 2 THEN 'critical' ELSE 'warning' END,
      v_score,
      jsonb_build_object('action', p_action, 'count', v_count, 'limit', v_limit)
    );
  END IF;

  RETURN jsonb_build_object(
    'exceeded', v_exceeded,
    'count', v_count,
    'limit', v_limit,
    'score_added', CASE WHEN v_exceeded THEN v_score ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 2. `compute_risk_score` - Recompute User Risk Score

```sql
CREATE OR REPLACE FUNCTION public.compute_risk_score(p_user_id UUID, p_tenant_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_total_score INT := 0;
  v_risk_level TEXT := 'low';
  v_breakdown JSONB;
BEGIN
  -- Sum scores from last 24h risk events
  SELECT 
    COALESCE(SUM(score), 0),
    jsonb_object_agg(event_type, COALESCE(type_score, 0))
  INTO v_total_score, v_breakdown
  FROM (
    SELECT event_type, SUM(score) as type_score
    FROM risk_events
    WHERE user_id = p_user_id
      AND created_at > now() - INTERVAL '24 hours'
    GROUP BY event_type
  ) subq;

  -- Determine risk level
  v_risk_level := CASE
    WHEN v_total_score > 80 THEN 'blocked'
    WHEN v_total_score > 50 THEN 'high'
    WHEN v_total_score > 20 THEN 'medium'
    ELSE 'low'
  END;

  -- Upsert risk score
  INSERT INTO risk_scores (tenant_id, user_id, total_score, risk_level, score_breakdown, last_evaluated)
  VALUES (p_tenant_id, p_user_id, v_total_score, v_risk_level, COALESCE(v_breakdown, '{}'), now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    risk_level = EXCLUDED.risk_level,
    score_breakdown = EXCLUDED.score_breakdown,
    last_evaluated = now();

  -- Auto-block if score exceeds threshold
  IF v_risk_level = 'blocked' AND p_tenant_id IS NOT NULL THEN
    INSERT INTO blocked_entities (tenant_id, entity_type, entity_value, reason)
    VALUES (p_tenant_id, 'user', p_user_id::TEXT, 'Auto-blocked: Risk score exceeded threshold')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'total_score', v_total_score,
    'risk_level', v_risk_level,
    'breakdown', v_breakdown
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 3. `check_blocked` - Check if Entity is Blocked

```sql
CREATE OR REPLACE FUNCTION public.check_blocked(
  p_tenant_id UUID,
  p_entity_type TEXT,
  p_entity_value TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_blocked RECORD;
BEGIN
  SELECT * INTO v_blocked
  FROM blocked_entities
  WHERE tenant_id = p_tenant_id
    AND entity_type = p_entity_type
    AND entity_value = p_entity_value
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  IF v_blocked IS NOT NULL THEN
    RETURN jsonb_build_object(
      'is_blocked', true,
      'reason', v_blocked.reason,
      'blocked_at', v_blocked.created_at
    );
  END IF;

  RETURN jsonb_build_object('is_blocked', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 4. `assess_order_risk` - Score Order at Creation

```sql
CREATE OR REPLACE FUNCTION public.assess_order_risk(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_user_score RECORD;
  v_signals TEXT[] := '{}';
  v_score INT := 0;
  v_risk_level TEXT := 'low';
  v_requires_review BOOLEAN := false;
  v_account_age INTERVAL;
  v_prev_order_count INT;
BEGIN
  SELECT * INTO v_order FROM food_orders WHERE id = p_order_id;
  IF v_order IS NULL THEN RETURN jsonb_build_object('error', 'Order not found'); END IF;

  -- Get user's risk score
  SELECT * INTO v_user_score FROM risk_scores WHERE user_id = v_order.customer_id;

  -- Check account age
  SELECT now() - created_at INTO v_account_age
  FROM auth.users WHERE id = v_order.customer_id;

  IF v_account_age < INTERVAL '1 day' THEN
    v_signals := array_append(v_signals, 'new_account');
    v_score := v_score + 10;
  END IF;

  -- Check order history
  SELECT COUNT(*) INTO v_prev_order_count
  FROM food_orders
  WHERE customer_id = v_order.customer_id
    AND status = 'completed'
    AND id != p_order_id;

  IF v_prev_order_count = 0 AND v_order.total_amount_cents > 5000 THEN
    v_signals := array_append(v_signals, 'high_value_first_order');
    v_score := v_score + 20;
  END IF;

  -- Add user's existing risk score
  IF v_user_score IS NOT NULL THEN
    v_score := v_score + LEAST(v_user_score.total_score / 2, 30);
    IF v_user_score.risk_level IN ('high', 'blocked') THEN
      v_signals := array_append(v_signals, 'high_risk_user');
    END IF;
  END IF;

  -- Determine final risk level
  v_risk_level := CASE
    WHEN v_score >= 50 THEN 'high'
    WHEN v_score >= 25 THEN 'medium'
    ELSE 'low'
  END;

  v_requires_review := v_risk_level IN ('high', 'medium');

  -- Update order
  UPDATE food_orders SET
    risk_score = v_score,
    risk_level = v_risk_level,
    risk_signals = v_signals,
    requires_review = v_requires_review,
    review_status = CASE WHEN v_requires_review THEN 'pending' ELSE NULL END
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'order_id', p_order_id,
    'risk_score', v_score,
    'risk_level', v_risk_level,
    'signals', v_signals,
    'requires_review', v_requires_review
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 5. `record_device_session` - Track Device Fingerprints

```sql
CREATE OR REPLACE FUNCTION public.record_device_session(
  p_user_id UUID,
  p_tenant_id UUID,
  p_device_fingerprint TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_existing RECORD;
  v_recent_devices INT;
  v_is_new_device BOOLEAN := false;
BEGIN
  -- Check if device exists for user
  SELECT * INTO v_existing
  FROM device_sessions
  WHERE user_id = p_user_id AND device_fingerprint = p_device_fingerprint;

  IF v_existing IS NULL THEN
    v_is_new_device := true;
    
    -- Count recent different devices
    SELECT COUNT(DISTINCT device_fingerprint) INTO v_recent_devices
    FROM device_sessions
    WHERE user_id = p_user_id
      AND last_seen > now() - INTERVAL '24 hours';

    IF v_recent_devices >= 3 THEN
      -- Multiple devices in short time - risk event
      INSERT INTO risk_events (tenant_id, user_id, event_type, severity, score, device_fingerprint, ip_address, details)
      VALUES (p_tenant_id, p_user_id, 'device_change', 'warning', 20, p_device_fingerprint, p_ip_address,
        jsonb_build_object('recent_device_count', v_recent_devices + 1));
    END IF;

    -- Insert new device
    INSERT INTO device_sessions (user_id, tenant_id, device_fingerprint, ip_address, user_agent)
    VALUES (p_user_id, p_tenant_id, p_device_fingerprint, p_ip_address, p_user_agent);
  ELSE
    -- Update existing device last_seen
    UPDATE device_sessions SET last_seen = now(), ip_address = COALESCE(p_ip_address, ip_address)
    WHERE id = v_existing.id;
  END IF;

  RETURN jsonb_build_object(
    'is_new_device', v_is_new_device,
    'device_fingerprint', p_device_fingerprint
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

---

## RLS Policies

### risk_events

```sql
ALTER TABLE risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read risk events" ON risk_events
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'safety.manage'))
  );

CREATE POLICY "System can insert risk events" ON risk_events
  FOR INSERT TO authenticated WITH CHECK (true);
```

### risk_scores

```sql
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read risk scores" ON risk_scores
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'safety.manage'))
  );
```

### blocked_entities

```sql
ALTER TABLE blocked_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked entities" ON blocked_entities
  FOR ALL TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'safety.manage'))
  );
```

### device_sessions

```sql
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices" ON device_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all devices" ON device_sessions
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'safety.manage'))
  );
```

---

## Frontend Implementation

### Files to Create

| File | Description |
|------|-------------|
| `src/hooks/useFraudPrevention.ts` | Risk events, scores, blocked entities management |
| `src/hooks/useDeviceSecurity.ts` | Device fingerprint + session tracking |
| `src/pages/dispatch/DispatchSafety.tsx` | Main safety dashboard |
| `src/components/safety/SafetyKPICards.tsx` | High-risk counts, blocked entities widgets |
| `src/components/safety/RiskyOrdersList.tsx` | Orders requiring review |
| `src/components/safety/RiskEventsTable.tsx` | Recent risk events |
| `src/components/safety/BlockedEntitiesPanel.tsx` | Blocked users/devices/IPs |
| `src/components/safety/RiskyUsersTable.tsx` | High-risk user list |
| `src/components/safety/OrderReviewDialog.tsx` | Approve/reject risky orders |

### Hook: `useFraudPrevention.ts`

```typescript
export function useFraudPrevention(tenantId: string | null) {
  // Risk events
  const riskEvents = useQuery({ ... });
  
  // Risk scores (high/blocked users)
  const riskyUsers = useQuery({ ... });
  
  // Blocked entities
  const blockedEntities = useQuery({ ... });
  
  // Orders requiring review
  const ordersForReview = useQuery({ ... });
  
  // Mutations
  const blockEntity = useMutation({ ... });
  const unblockEntity = useMutation({ ... });
  const approveOrder = useMutation({ ... });
  const rejectOrder = useMutation({ ... });
  const resetUserScore = useMutation({ ... });
  
  return { ... };
}
```

### Hook: `useDeviceSecurity.ts`

Integrates with existing botDetection.ts to:
- Generate device fingerprint on mount
- Record device session on login/order
- Check velocity before sensitive actions

```typescript
export function useDeviceSecurity() {
  const fingerprint = useMemo(() => getDeviceFingerprint(), []);
  
  const recordSession = async (userId: string, tenantId: string) => {
    return supabase.rpc('record_device_session', {
      p_user_id: userId,
      p_tenant_id: tenantId,
      p_device_fingerprint: fingerprint,
      p_ip_address: null, // Captured server-side
      p_user_agent: navigator.userAgent
    });
  };
  
  const checkVelocity = async (action: string, userId: string) => {
    return supabase.rpc('check_velocity', {
      p_user_id: userId,
      p_action: action
    });
  };
  
  return { fingerprint, recordSession, checkVelocity };
}
```

### Page: `DispatchSafety.tsx`

Layout:

```text
+------------------------------------------------------------------+
|  Safety & Fraud Prevention            [Date Range] [Export]      |
+------------------------------------------------------------------+
|  KPI Cards:                                                       |
|  [High-Risk Orders] [Blocked Users] [Risk Events Today] [Flags]  |
+------------------------------------------------------------------+
|  ORDERS REQUIRING REVIEW                                          |
|  +-------------------------------------------------------------+ |
|  | #1234 | John D. | $85.50 | High (52) | [Approve] [Reject]   | |
|  | #1235 | New User | $120 | Medium (35) | [Approve] [Reject]   | |
|  +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  RECENT RISK EVENTS              |  BLOCKED ENTITIES             |
|  +----------------------------+  | +----------------------------+|
|  | Time | User | Type | Score|  | | Type | Value | Reason      ||
|  | 2m ago | User A | velocity | | | user | abc123 | Auto-block ||
|  +----------------------------+  | +----------------------------+|
+------------------------------------------------------------------+
|  HIGH-RISK USERS                                                  |
|  +-------------------------------------------------------------+ |
|  | User | Score | Level | Last Event | [Block] [Reset Score]   | |
|  +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Integration Points

### 1. Order Creation Flow

Update order creation to:
1. Call `record_device_session` with fingerprint
2. Call `check_velocity('order_create', userId)`
3. Call `check_blocked` for user/device/IP
4. After insert, call `assess_order_risk(orderId)`

### 2. Payment Flow

Before payment attempt:
1. Call `check_velocity('payment_attempt', userId)`
2. Call `check_blocked('card', cardFingerprint)`
3. Record risk event on failure

### 3. Login Flow

On login:
1. Call `record_device_session`
2. Call `check_velocity('login_attempt', userId)`
3. Existing `check_login_anomaly` already handles anomaly detection

### 4. Dispatch UI

Update order cards to show risk badges:

```typescript
{order.risk_level === 'high' && (
  <Badge variant="destructive" className="gap-1">
    <ShieldAlert className="h-3 w-3" /> High Risk
  </Badge>
)}
{order.requires_review && order.review_status === 'pending' && (
  <Badge variant="outline" className="bg-amber-500/10">
    Needs Review
  </Badge>
)}
```

---

## Sidebar & Routes

### Update `DispatchSidebar.tsx`

Add Safety nav item:

```typescript
{
  label: "Safety",
  path: "/dispatch/safety",
  icon: ShieldAlert,
  permission: "safety.manage",
},
```

### Update `App.tsx`

Add route:

```typescript
<Route path="safety" element={<DispatchSafety />} />
```

---

## Implementation Order

1. **Database migration** - Create risk_events, risk_scores, blocked_entities, device_sessions tables
2. **Add order risk fields** - risk_level, risk_score, requires_review to food_orders
3. **RPC functions** - check_velocity, compute_risk_score, check_blocked, assess_order_risk, record_device_session
4. **RLS policies** - Tenant-scoped access control
5. **useFraudPrevention hook** - Core data fetching and mutations
6. **useDeviceSecurity hook** - Device fingerprint integration
7. **Safety dashboard components** - KPI cards, risk events, blocked entities
8. **DispatchSafety page** - Main dashboard
9. **Order review dialog** - Approve/reject workflow
10. **Update order creation** - Integrate risk assessment
11. **Update dispatch UI** - Add risk badges to order cards
12. **Update sidebar and routes**

---

## Testing Checklist

- [ ] Device fingerprint generated correctly
- [ ] Device session recorded on login/order
- [ ] Velocity limits trigger risk events
- [ ] Risk score computed correctly from events
- [ ] Auto-block when score > 80
- [ ] check_blocked prevents actions for blocked entities
- [ ] Order risk assessment runs on creation
- [ ] High-risk orders flagged for review
- [ ] Review approval updates order status
- [ ] Block/unblock entity works correctly
- [ ] Reset user score clears risk_scores
- [ ] Safety dashboard loads all data
- [ ] Risk badges show on order cards
- [ ] RLS prevents cross-tenant access
- [ ] Export functionality works

---

## Risk Event Types

| Event Type | Severity | Score | Trigger |
|------------|----------|-------|---------|
| `velocity_limit` | warning/critical | 25-35 | Action frequency exceeded |
| `payment_failed` | warning | 35 | Payment declined |
| `chargeback` | critical | 50 | Chargeback received |
| `suspicious_location` | warning | 20 | IP/delivery mismatch |
| `device_change` | warning | 20 | Multiple devices in 24h |
| `blocked_ip` | critical | 40 | Known bad IP |
| `manual_flag` | varies | varies | Admin flagged |
| `bot_detected` | critical | 50 | Automation detected |
