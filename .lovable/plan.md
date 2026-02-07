
# Audit Log + Compliance + Admin Action History Implementation Plan

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `audit_logs` table | Exists | Lacks tenant_id, severity, summary, actor_role |
| `src/lib/security/auditLog.ts` | Exists | Basic logging functions without tenant context |
| `TenantContext` | Exists | Provides currentTenant and hasPermission |
| Permissions table | Exists | Has analytics.view, tenant.manage_settings |
| Dispatch sidebar | Exists | Can be extended with Audit nav item |
| Critical actions | Not logged | useRideManagement, useTenantMembers, etc. lack audit logging |

## Architecture Overview

```text
Audit System Architecture:

Client Action (Dispatch UI)
    │
    ▼
┌─────────────────────────────────────────────┐
│  log_audit RPC (SECURITY DEFINER)           │
│  - Auto-captures actor_id, tenant_id        │
│  - Captures before/after snapshots          │
│  - Assigns severity level                   │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  tenant_audit_log table                     │
│  - Immutable (no update/delete policies)   │
│  - Tenant-scoped RLS                        │
│  - Indexed for fast filtering               │
└─────────────────────────────────────────────┘
    │
    ├── Critical severity → Create admin_alert
    │
    ▼
┌─────────────────────────────────────────────┐
│  Dispatch UI                                │
│  - /dispatch/audit (list + filters)         │
│  - /dispatch/audit/:id (detail + diff)      │
│  - /dispatch/alerts (optional alerts panel) │
│  - CSV export                               │
└─────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Create `tenant_audit_log` Table (New Multi-tenant Table)

Keeping the existing `audit_logs` table for platform-level logs, creating a new tenant-scoped table:

```sql
CREATE TABLE public.tenant_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  summary TEXT NOT NULL,
  before_values JSONB,
  after_values JSONB,
  metadata JSONB DEFAULT '{}'
);

-- Performance indexes
CREATE INDEX idx_tenant_audit_log_tenant_time ON tenant_audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_tenant_audit_log_entity ON tenant_audit_log(tenant_id, entity_type, entity_id);
CREATE INDEX idx_tenant_audit_log_action ON tenant_audit_log(tenant_id, action);
CREATE INDEX idx_tenant_audit_log_severity ON tenant_audit_log(tenant_id, severity);
CREATE INDEX idx_tenant_audit_log_actor ON tenant_audit_log(tenant_id, actor_id);
```

### 2. Create `admin_alerts` Table

```sql
CREATE TABLE public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  title TEXT NOT NULL,
  body TEXT,
  audit_log_id UUID REFERENCES tenant_audit_log(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolve_notes TEXT
);

CREATE INDEX idx_admin_alerts_tenant ON admin_alerts(tenant_id, created_at DESC);
CREATE INDEX idx_admin_alerts_unresolved ON admin_alerts(tenant_id) WHERE resolved_at IS NULL;
```

### 3. Add `audit.view` Permission

```sql
INSERT INTO permissions (key, description, category) VALUES
  ('audit.view', 'View audit logs and compliance history', 'compliance'),
  ('alerts.manage', 'View and resolve admin alerts', 'compliance')
ON CONFLICT (key) DO NOTHING;

-- Add to admin/owner roles by default
INSERT INTO role_permissions (tenant_id, role, permission_key)
SELECT NULL, 'admin', 'audit.view'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'admin' AND permission_key = 'audit.view');

INSERT INTO role_permissions (tenant_id, role, permission_key)
SELECT NULL, 'admin', 'alerts.manage'
WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'admin' AND permission_key = 'alerts.manage');
```

---

## RPC Functions

### 1. `log_audit` - Main Logging RPC

```sql
CREATE OR REPLACE FUNCTION public.log_audit(
  p_tenant_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_summary TEXT DEFAULT '',
  p_before_values JSONB DEFAULT NULL,
  p_after_values JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_actor_role TEXT;
BEGIN
  -- Get actor's role in tenant
  SELECT role::TEXT INTO v_actor_role
  FROM tenant_memberships
  WHERE tenant_id = p_tenant_id AND user_id = auth.uid() AND is_active = true
  LIMIT 1;

  -- Insert audit log
  INSERT INTO tenant_audit_log (
    tenant_id, actor_id, actor_role, action, entity_type, entity_id,
    severity, summary, before_values, after_values, metadata,
    user_agent, ip_address
  ) VALUES (
    p_tenant_id, auth.uid(), v_actor_role, p_action, p_entity_type, p_entity_id,
    p_severity, p_summary, p_before_values, p_after_values, p_metadata,
    current_setting('request.headers', true)::jsonb->>'user-agent',
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
  )
  RETURNING id INTO v_log_id;

  -- Auto-create alert for critical actions
  IF p_severity = 'critical' THEN
    INSERT INTO admin_alerts (tenant_id, severity, title, body, audit_log_id)
    VALUES (
      p_tenant_id,
      'critical',
      p_action || ' on ' || p_entity_type,
      p_summary,
      v_log_id
    );
  END IF;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 2. Action-Specific RPCs (with built-in logging)

#### `admin_assign_driver`
```sql
CREATE OR REPLACE FUNCTION public.admin_assign_driver(
  p_tenant_id UUID,
  p_order_id UUID,
  p_driver_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_before JSONB;
  v_after JSONB;
  v_driver_name TEXT;
BEGIN
  -- Capture before state
  SELECT jsonb_build_object('driver_id', driver_id, 'status', status)
  INTO v_before FROM food_orders WHERE id = p_order_id;

  -- Get driver name for summary
  SELECT full_name INTO v_driver_name FROM drivers WHERE id = p_driver_id;

  -- Perform update
  UPDATE food_orders
  SET driver_id = p_driver_id, status = 'assigned', updated_at = now()
  WHERE id = p_order_id;

  -- Capture after state
  SELECT jsonb_build_object('driver_id', driver_id, 'status', status)
  INTO v_after FROM food_orders WHERE id = p_order_id;

  -- Log audit
  PERFORM log_audit(
    p_tenant_id, 'assign_driver', 'order', p_order_id,
    format('Assigned driver %s to order', COALESCE(v_driver_name, p_driver_id::text)),
    v_before, v_after, 'info'
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

#### `admin_override_order_status`
```sql
CREATE OR REPLACE FUNCTION public.admin_override_order_status(
  p_tenant_id UUID,
  p_order_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_before JSONB;
  v_after JSONB;
BEGIN
  SELECT jsonb_build_object('status', status) INTO v_before FROM food_orders WHERE id = p_order_id;

  UPDATE food_orders SET status = p_new_status, updated_at = now() WHERE id = p_order_id;

  SELECT jsonb_build_object('status', status) INTO v_after FROM food_orders WHERE id = p_order_id;

  PERFORM log_audit(
    p_tenant_id, 'override_status', 'order', p_order_id,
    format('Status changed from %s to %s. Reason: %s', v_before->>'status', p_new_status, COALESCE(p_reason, 'N/A')),
    v_before, v_after, 'warning',
    jsonb_build_object('reason', p_reason)
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

#### `admin_issue_refund`
```sql
CREATE OR REPLACE FUNCTION public.admin_issue_refund(
  p_tenant_id UUID,
  p_order_id UUID,
  p_amount NUMERIC,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_before JSONB;
  v_after JSONB;
BEGIN
  SELECT jsonb_build_object('payment_status', payment_status, 'total', total_amount)
  INTO v_before FROM food_orders WHERE id = p_order_id;

  UPDATE food_orders
  SET payment_status = 'refunded', refund_amount = p_amount, updated_at = now()
  WHERE id = p_order_id;

  SELECT jsonb_build_object('payment_status', payment_status, 'refund_amount', refund_amount)
  INTO v_after FROM food_orders WHERE id = p_order_id;

  PERFORM log_audit(
    p_tenant_id, 'issue_refund', 'order', p_order_id,
    format('Refund of $%.2f issued. Reason: %s', p_amount, p_reason),
    v_before, v_after, 'critical',
    jsonb_build_object('amount', p_amount, 'reason', p_reason)
  );

  RETURN jsonb_build_object('success', true, 'refund_amount', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

#### `admin_update_member_role`
```sql
CREATE OR REPLACE FUNCTION public.admin_update_member_role(
  p_tenant_id UUID,
  p_membership_id UUID,
  p_new_role TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_before JSONB;
  v_after JSONB;
  v_user_email TEXT;
BEGIN
  SELECT jsonb_build_object('role', role), user_id INTO v_before, v_user_email
  FROM tenant_memberships WHERE id = p_membership_id;

  UPDATE tenant_memberships SET role = p_new_role::tenant_role, updated_at = now()
  WHERE id = p_membership_id;

  SELECT jsonb_build_object('role', role) INTO v_after FROM tenant_memberships WHERE id = p_membership_id;

  PERFORM log_audit(
    p_tenant_id, 'change_member_role', 'role', p_membership_id,
    format('Role changed from %s to %s', v_before->>'role', p_new_role),
    v_before, v_after, 'critical'
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

---

## RLS Policies

### Tenant Audit Log (Immutable)
```sql
ALTER TABLE tenant_audit_log ENABLE ROW LEVEL SECURITY;

-- Read access for users with audit.view permission
CREATE POLICY "Users with audit.view can read logs" ON tenant_audit_log
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.has_tenant_permission(tenant_id, 'audit.view')
    OR public.has_tenant_permission(tenant_id, 'tenant.manage_settings')
  );

-- Insert only via RPC (SECURITY DEFINER functions)
CREATE POLICY "System can insert logs" ON tenant_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- NO UPDATE or DELETE policies - logs are immutable
```

### Admin Alerts
```sql
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with alerts.manage can read alerts" ON admin_alerts
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.has_tenant_permission(tenant_id, 'alerts.manage')
  );

CREATE POLICY "Users with alerts.manage can resolve alerts" ON admin_alerts
  FOR UPDATE TO authenticated
  USING (public.has_tenant_permission(tenant_id, 'alerts.manage'))
  WITH CHECK (resolved_at IS NOT NULL); -- Only allow setting resolved fields

-- NO DELETE policy - alerts are kept for history
```

---

## Frontend Implementation

### Files to Create

| File | Description |
|------|-------------|
| `src/hooks/useAuditLog.ts` | Fetch/filter audit logs with pagination |
| `src/hooks/useAdminAlerts.ts` | Fetch/resolve alerts |
| `src/lib/auditHelpers.ts` | Client-side audit helper for calling log_audit RPC |
| `src/pages/dispatch/DispatchAudit.tsx` | Audit log list with filters |
| `src/pages/dispatch/DispatchAuditDetail.tsx` | Single log detail with JSON diff |
| `src/pages/dispatch/DispatchAlerts.tsx` | Alerts panel (optional) |
| `src/components/audit/AuditLogTable.tsx` | Reusable audit table |
| `src/components/audit/JsonDiffViewer.tsx` | Before/after JSON diff display |
| `src/components/audit/AuditFilters.tsx` | Filter controls |
| `src/components/audit/AuditExportButton.tsx` | CSV export functionality |

### Hook: `useAuditLog.ts`

```typescript
export interface AuditLogFilters {
  dateFrom?: Date;
  dateTo?: Date;
  severity?: 'info' | 'warning' | 'critical' | 'all';
  entityType?: string;
  action?: string;
  actorId?: string;
  search?: string;
}

export function useAuditLog(tenantId: string | null, filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-log', tenantId, filters],
    queryFn: async () => {
      let query = supabase
        .from('tenant_audit_log')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);
      // Apply filters...
      return query;
    },
    enabled: !!tenantId,
  });
}
```

### Helper: `auditHelpers.ts`

```typescript
export async function logAuditAction(params: {
  tenantId: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}) {
  return supabase.rpc('log_audit', {
    p_tenant_id: params.tenantId,
    p_action: params.action,
    p_entity_type: params.entityType,
    p_entity_id: params.entityId || null,
    p_summary: params.summary,
    p_before_values: params.before || null,
    p_after_values: params.after || null,
    p_severity: params.severity || 'info',
    p_metadata: params.metadata || {}
  });
}
```

### Page: `DispatchAudit.tsx`

Features:
- Date range picker
- Severity filter (info/warning/critical)
- Entity type dropdown (order, driver, merchant, etc.)
- Actor filter (team member dropdown)
- Search by summary/action
- Paginated table with columns: Time, Severity badge, Actor, Action, Entity, Summary
- Click row to view detail
- Export CSV button

### Page: `DispatchAuditDetail.tsx`

Features:
- Full metadata display
- JSON diff viewer (before/after side-by-side)
- Link to related entity (order, driver, etc.)
- Export single log button
- Back to list navigation

---

## Sidebar & Routes Update

### Update `DispatchSidebar.tsx`

Add new nav items:
```typescript
{
  label: "Audit Log",
  path: "/dispatch/audit",
  icon: FileText,
  permission: "audit.view",
},
{
  label: "Alerts",
  path: "/dispatch/alerts",
  icon: AlertCircle,
  permission: "alerts.manage",
},
```

### Update `App.tsx`

Add routes:
```typescript
<Route path="audit" element={<DispatchAudit />} />
<Route path="audit/:id" element={<DispatchAuditDetail />} />
<Route path="alerts" element={<DispatchAlerts />} />
```

---

## CSV Export Implementation

```typescript
function exportAuditToCSV(logs: AuditLog[]) {
  const headers = ['Timestamp', 'Severity', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Summary'];
  const rows = logs.map(log => [
    log.created_at,
    log.severity,
    log.actor_role || 'Unknown',
    log.action,
    log.entity_type,
    log.entity_id || '',
    log.summary
  ]);
  
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  downloadFile(csv, `audit-log-${Date.now()}.csv`, 'text/csv');
}
```

---

## Integration with Existing Hooks

Update existing hooks to call audit logging:

### `useTenantMembers.ts` - Add audit on role change
```typescript
const updateRole = useMutation({
  mutationFn: async ({ memberId, role }) => {
    // Use RPC instead of direct update for audit logging
    const { error } = await supabase.rpc('admin_update_member_role', {
      p_tenant_id: tenantId,
      p_membership_id: memberId,
      p_new_role: role
    });
    if (error) throw error;
  },
  // ...
});
```

### `usePaymentAdmin.ts` - Add audit on refund
```typescript
// Update to call admin_issue_refund RPC
```

### `usePricing.ts` - Add audit on pricing change
```typescript
// Call logAuditAction after successful pricing update
```

---

## Severity Classification

| Action | Entity Type | Severity | Auto-Alert |
|--------|-------------|----------|------------|
| Assign driver | order | info | No |
| Override status | order | warning | No |
| Issue refund | order | critical | Yes |
| Create payout | payout | critical | Yes |
| Change member role | role | critical | Yes |
| Update permissions | permission | critical | Yes |
| Update tenant settings | tenant | warning | No |
| Change pricing | pricing | warning | No |
| Update zone | zone | warning | No |
| Resolve dispute | dispute | warning | No |

---

## Implementation Order

1. **Database migration** - Create tenant_audit_log, admin_alerts tables, add permissions
2. **RPC functions** - log_audit + action-specific RPCs
3. **RLS policies** - Immutable audit logs, alert access
4. **useAuditLog hook** - Fetch with filters and pagination
5. **auditHelpers.ts** - Client helper for logging
6. **DispatchAudit page** - List with filters
7. **AuditLogTable component** - Reusable table
8. **DispatchAuditDetail page** - Detail with diff viewer
9. **JsonDiffViewer component** - Before/after display
10. **CSV export** - Download functionality
11. **DispatchAlerts page** (optional) - Alert management
12. **Update DispatchSidebar** - Add Audit/Alerts nav
13. **Update App.tsx** - Add routes
14. **Integrate existing hooks** - Add audit calls to critical actions

---

## Testing Checklist

- [ ] Audit logs are created for all critical actions
- [ ] Logs capture correct before/after snapshots
- [ ] Severity levels are assigned correctly
- [ ] Critical actions auto-create alerts
- [ ] Filters work correctly (date, severity, entity, actor)
- [ ] Pagination works for large log sets
- [ ] JSON diff viewer displays changes clearly
- [ ] CSV export includes all visible columns
- [ ] RLS prevents access to other tenants' logs
- [ ] Logs cannot be updated or deleted
- [ ] Alerts can be resolved with notes
- [ ] Navigation shows only to users with audit.view permission
