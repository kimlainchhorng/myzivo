
# Franchise / Partner RBAC (Multi-tenant Roles + Permissions) Implementation Plan

## Overview

Implement a complete multi-tenant RBAC system enabling franchises/partners to have their own teams with granular permissions. Each tenant (brand/franchise/partner) can manage their own staff with roles like Tenant Owner, Admin, Dispatcher, Support Agent, Finance, Merchant Manager, and Viewer.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `tenants` table | Missing | Need to create multi-tenant foundation |
| `tenant_id` on core tables | Missing | Need to add tenant scoping |
| `user_roles` table | Exists | Global platform roles (admin, support, etc.) |
| `app_role` enum | Exists | Has admin, super_admin, operations, finance, support, driver, merchant, customer |
| `has_role()` RPC | Exists | Used for global role checks |
| `is_admin()` RPC | Exists | Checks platform-level admin status |
| Dispatch Team page | Missing | No team management UI |
| Tenant-aware RLS | Missing | Need to implement |

---

## Architecture

```text
Platform Level (ZIVO)
├── super_admin - Full platform access
├── admin - Platform administration
├── operations - Platform operations
├── finance - Platform finance
└── support - Platform support

Tenant Level (Franchise/Partner)
├── tenants table - Brand/franchise entities
│   └── tenant_memberships - User-to-tenant assignments with roles
│       └── role_permissions - What each role can do per tenant
│
├── Tenant Roles:
│   ├── owner - Full tenant control
│   ├── admin - Manage team, settings
│   ├── dispatcher - Order dispatch, driver assignment
│   ├── support - Customer support, view orders
│   ├── finance - Payouts, refunds, analytics
│   ├── merchant_manager - Merchant onboarding, promotions
│   └── viewer - Read-only analytics access

└── Permissions (granular keys):
    ├── tenant.manage_settings
    ├── tenant.manage_users
    ├── orders.dispatch
    ├── orders.override_status
    ├── payouts.manage
    ├── refunds.manage
    ├── analytics.view
    ├── support.manage
    ├── merchants.manage
    ├── drivers.manage
    ├── promotions.manage
    └── zones.manage
```

---

## Database Changes

### 1. Create `tenants` Table

```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  region_id UUID REFERENCES regions(id),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id)
);

CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenants_region ON tenants(region_id);
```

### 2. Create `tenant_roles` Enum

```sql
CREATE TYPE public.tenant_role AS ENUM (
  'owner',
  'admin', 
  'dispatcher',
  'support',
  'finance',
  'merchant_manager',
  'viewer'
);
```

### 3. Create `tenant_memberships` Table

```sql
CREATE TABLE public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  CONSTRAINT unique_tenant_user UNIQUE (tenant_id, user_id)
);

CREATE INDEX idx_tenant_memberships_tenant ON tenant_memberships(tenant_id, is_active);
CREATE INDEX idx_tenant_memberships_user ON tenant_memberships(user_id, is_active);
```

### 4. Create `permissions` Table (Seed Data)

```sql
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed permission keys
INSERT INTO permissions (key, description, category) VALUES
  ('tenant.manage_settings', 'Manage tenant settings and branding', 'tenant'),
  ('tenant.manage_users', 'Invite, edit, and remove team members', 'tenant'),
  ('orders.dispatch', 'View and dispatch orders to drivers', 'orders'),
  ('orders.override_status', 'Override order status manually', 'orders'),
  ('orders.view', 'View orders (read-only)', 'orders'),
  ('payouts.manage', 'Process and manage driver payouts', 'finance'),
  ('refunds.manage', 'Process customer refunds', 'finance'),
  ('analytics.view', 'View analytics and reports', 'analytics'),
  ('support.manage', 'Handle support tickets and chat', 'support'),
  ('merchants.manage', 'Onboard and manage merchants', 'merchants'),
  ('drivers.manage', 'Manage drivers and assignments', 'drivers'),
  ('promotions.manage', 'Create and manage promotions', 'marketing'),
  ('zones.manage', 'Configure zones, surge, and pricing', 'operations');
```

### 5. Create `role_permissions` Table (Default Mappings)

```sql
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role tenant_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  CONSTRAINT unique_role_permission UNIQUE (tenant_id, role, permission_key)
);

CREATE INDEX idx_role_permissions_tenant ON role_permissions(tenant_id, role);
```

### 6. Create `tenant_invitations` Table

```sql
CREATE TABLE public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role tenant_role NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  CONSTRAINT unique_pending_invite UNIQUE (tenant_id, email)
);

CREATE INDEX idx_tenant_invitations_token ON tenant_invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_tenant_invitations_email ON tenant_invitations(email) WHERE accepted_at IS NULL;
```

### 7. Add `tenant_id` to Core Tables

```sql
-- Add tenant_id to core operational tables
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE refund_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE driver_payouts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_food_orders_tenant ON food_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trips_tenant ON trips(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant ON drivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_tenant ON restaurants(tenant_id);
```

---

## RPC Functions

### 1. `get_my_tenant_permissions(p_tenant_id UUID)`

Returns all permission keys for the current user within a specific tenant.

```sql
CREATE OR REPLACE FUNCTION get_my_tenant_permissions(p_tenant_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_user_role tenant_role;
  v_permissions TEXT[];
BEGIN
  -- Get user's role in this tenant
  SELECT role INTO v_user_role
  FROM tenant_memberships
  WHERE tenant_id = p_tenant_id
    AND user_id = auth.uid()
    AND is_active = true;

  IF v_user_role IS NULL THEN
    RETURN ARRAY[]::TEXT[];
  END IF;

  -- Owner has all permissions
  IF v_user_role = 'owner' THEN
    SELECT ARRAY_AGG(key) INTO v_permissions FROM permissions;
    RETURN v_permissions;
  END IF;

  -- Get permissions for this role (tenant-specific or defaults)
  SELECT ARRAY_AGG(rp.permission_key) INTO v_permissions
  FROM role_permissions rp
  WHERE (rp.tenant_id = p_tenant_id OR rp.tenant_id IS NULL)
    AND rp.role = v_user_role;

  RETURN COALESCE(v_permissions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';
```

### 2. `has_tenant_permission(p_tenant_id UUID, p_permission TEXT)`

Checks if current user has a specific permission in a tenant.

```sql
CREATE OR REPLACE FUNCTION has_tenant_permission(
  p_tenant_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_permission = ANY(get_my_tenant_permissions(p_tenant_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';
```

### 3. `get_my_tenants()`

Returns all tenants the current user belongs to with their role.

```sql
CREATE OR REPLACE FUNCTION get_my_tenants()
RETURNS TABLE (
  tenant_id UUID,
  tenant_name TEXT,
  tenant_slug TEXT,
  tenant_logo TEXT,
  user_role tenant_role,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.logo_url,
    tm.role,
    tm.is_active
  FROM tenant_memberships tm
  JOIN tenants t ON t.id = tm.tenant_id
  WHERE tm.user_id = auth.uid()
    AND tm.is_active = true
    AND t.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';
```

### 4. `accept_tenant_invitation(p_token TEXT)`

Accepts an invitation and creates membership.

```sql
CREATE OR REPLACE FUNCTION accept_tenant_invitation(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_invitation RECORD;
  v_membership_id UUID;
BEGIN
  -- Find valid invitation
  SELECT * INTO v_invitation
  FROM tenant_invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Create membership
  INSERT INTO tenant_memberships (tenant_id, user_id, role, invited_by, invited_at, accepted_at)
  VALUES (v_invitation.tenant_id, auth.uid(), v_invitation.role, v_invitation.invited_by, v_invitation.created_at, now())
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    accepted_at = now()
  RETURNING id INTO v_membership_id;

  -- Mark invitation as accepted
  UPDATE tenant_invitations SET accepted_at = now() WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'membership_id', v_membership_id,
    'tenant_id', v_invitation.tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### 5. `seed_default_role_permissions(p_tenant_id UUID)`

Seeds default permissions for a new tenant.

```sql
CREATE OR REPLACE FUNCTION seed_default_role_permissions(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Admin: all except payouts
  INSERT INTO role_permissions (tenant_id, role, permission_key)
  SELECT p_tenant_id, 'admin', key FROM permissions
  WHERE key NOT IN ('payouts.manage', 'refunds.manage')
  ON CONFLICT DO NOTHING;

  -- Dispatcher
  INSERT INTO role_permissions (tenant_id, role, permission_key) VALUES
    (p_tenant_id, 'dispatcher', 'orders.dispatch'),
    (p_tenant_id, 'dispatcher', 'orders.view'),
    (p_tenant_id, 'dispatcher', 'drivers.manage')
  ON CONFLICT DO NOTHING;

  -- Support
  INSERT INTO role_permissions (tenant_id, role, permission_key) VALUES
    (p_tenant_id, 'support', 'support.manage'),
    (p_tenant_id, 'support', 'orders.view'),
    (p_tenant_id, 'support', 'refunds.manage')
  ON CONFLICT DO NOTHING;

  -- Finance
  INSERT INTO role_permissions (tenant_id, role, permission_key) VALUES
    (p_tenant_id, 'finance', 'analytics.view'),
    (p_tenant_id, 'finance', 'payouts.manage'),
    (p_tenant_id, 'finance', 'refunds.manage')
  ON CONFLICT DO NOTHING;

  -- Merchant Manager
  INSERT INTO role_permissions (tenant_id, role, permission_key) VALUES
    (p_tenant_id, 'merchant_manager', 'merchants.manage'),
    (p_tenant_id, 'merchant_manager', 'promotions.manage'),
    (p_tenant_id, 'merchant_manager', 'orders.view')
  ON CONFLICT DO NOTHING;

  -- Viewer
  INSERT INTO role_permissions (tenant_id, role, permission_key) VALUES
    (p_tenant_id, 'viewer', 'analytics.view'),
    (p_tenant_id, 'viewer', 'orders.view')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

---

## RLS Policies

### Tenants Table

```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all
CREATE POLICY "Platform admins can manage tenants" ON tenants
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can see tenants they belong to
CREATE POLICY "Members can view their tenants" ON tenants
  FOR SELECT TO authenticated
  USING (id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid() AND is_active = true));

-- Tenant owners can update their tenant
CREATE POLICY "Owners can update tenant" ON tenants
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_tenant_permission(id, 'tenant.manage_settings'));
```

### Tenant Memberships Table

```sql
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Platform admins full access
CREATE POLICY "Platform admins can manage memberships" ON tenant_memberships
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can see their own memberships
CREATE POLICY "Users can view own memberships" ON tenant_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Tenant admins can manage memberships
CREATE POLICY "Tenant admins can manage members" ON tenant_memberships
  FOR ALL TO authenticated
  USING (public.has_tenant_permission(tenant_id, 'tenant.manage_users'));
```

### Food Orders (Example Tenant-Scoped Table)

```sql
-- Add tenant-aware policy
CREATE POLICY "Tenant members can view orders" ON food_orders
  FOR SELECT TO authenticated
  USING (
    -- Platform admins
    public.is_admin(auth.uid())
    -- Tenant members with order viewing permission
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'orders.view'))
    -- Order owners
    OR customer_id = auth.uid()
    -- Assigned drivers
    OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    -- Restaurant owners
    OR public.is_restaurant_owner(restaurant_id)
  );

CREATE POLICY "Dispatchers can update orders" ON food_orders
  FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'orders.dispatch'))
  );
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/XXXXX.sql` | Create | All tables, RPCs, RLS policies |
| `src/hooks/useTenantContext.ts` | Create | Current tenant state + permissions |
| `src/hooks/useTenantMembers.ts` | Create | Team member CRUD operations |
| `src/hooks/useTenantInvitations.ts` | Create | Invite management hooks |
| `src/contexts/TenantContext.tsx` | Create | Tenant provider with current tenant |
| `src/pages/dispatch/DispatchTeam.tsx` | Create | Team list with invite/role management |
| `src/pages/dispatch/DispatchTeamInvite.tsx` | Create | Invite form page |
| `src/pages/dispatch/DispatchRoles.tsx` | Create | Role permission matrix editor |
| `src/pages/AcceptInvite.tsx` | Create | Accept invitation flow |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Team nav, permission-gate items |
| `src/components/team/TeamMemberCard.tsx` | Create | Member display with actions |
| `src/components/team/InviteMemberDialog.tsx` | Create | Invite modal |
| `src/components/team/RolePermissionMatrix.tsx` | Create | Permissions grid editor |
| `src/App.tsx` | Modify | Add team routes + invite accept |

---

## Component Specifications

### DispatchTeam Page

**Route:** `/dispatch/team`

**Features:**
- List all team members with name, email, role, status
- Search/filter by name or role
- Actions per member (permission-gated):
  - Change role (dropdown)
  - Deactivate member
  - Remove member
- "Invite Member" button (opens dialog)
- Pending invitations section

**Layout:**
```text
+----------------------------------------------------------+
|  Team                                    [+ Invite Member]|
+----------------------------------------------------------+
|  [Search...]            [All Roles v]                     |
+----------------------------------------------------------+
|  ACTIVE MEMBERS (5)                                       |
|  +------------------------------------------------------+ |
|  | [Avatar] John Smith              Owner    [Actions v]| |
|  |          john@company.com        Since Dec 2025      | |
|  +------------------------------------------------------+ |
|  | [Avatar] Sarah Jones             Dispatcher [Actions]| |
|  |          sarah@company.com       Since Jan 2026      | |
|  +------------------------------------------------------+ |
|                                                           |
|  PENDING INVITATIONS (2)                                  |
|  +------------------------------------------------------+ |
|  | mike@company.com    Admin    Expires in 5 days [X]   | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

### InviteMemberDialog Component

**Features:**
- Email input
- Role selector dropdown
- "Send Invitation" button
- Generates invite link option

### DispatchRoles Page (Optional Advanced)

**Route:** `/dispatch/roles`

**Features:**
- Permission matrix editor
- Toggle permissions per role
- Save changes

---

## Sidebar Permission Gating

Update `DispatchSidebar.tsx` to show/hide items based on permissions:

```typescript
// Navigation items with required permissions
const navItems = [
  { label: "Dashboard", path: "/dispatch", permission: null }, // Always visible
  { label: "Orders", path: "/dispatch/orders", permission: "orders.view" },
  { label: "Batches", path: "/dispatch/batches", permission: "orders.dispatch" },
  { label: "Drivers", path: "/dispatch/drivers", permission: "drivers.manage" },
  { label: "Merchants", path: "/dispatch/merchants", permission: "merchants.manage" },
  { label: "Payouts", path: "/dispatch/payouts", permission: "payouts.manage" },
  { label: "Analytics", path: "/dispatch/analytics", permission: "analytics.view" },
  { label: "Support", path: "/dispatch/support", permission: "support.manage" },
  { label: "Zones", path: "/dispatch/zones", permission: "zones.manage" },
  { label: "Team", path: "/dispatch/team", permission: "tenant.manage_users" },
  { label: "Settings", path: "/dispatch/settings", permission: "tenant.manage_settings" },
];
```

---

## Tenant Context Hook

```typescript
// src/hooks/useTenantContext.ts
interface TenantContext {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  permissions: string[];
  isLoading: boolean;
  switchTenant: (tenantId: string) => void;
  hasPermission: (key: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
}
```

---

## Accept Invitation Flow

**Route:** `/accept-invite?token=...`

1. User clicks invite link in email
2. If not logged in, redirect to login with return URL
3. After login, call `accept_tenant_invitation(token)`
4. Show success message
5. Redirect to dispatch dashboard

---

## Default Role Permissions Matrix

| Permission | Owner | Admin | Dispatcher | Support | Finance | Merchant Mgr | Viewer |
|------------|-------|-------|------------|---------|---------|--------------|--------|
| tenant.manage_settings | Yes | Yes | - | - | - | - | - |
| tenant.manage_users | Yes | Yes | - | - | - | - | - |
| orders.dispatch | Yes | Yes | Yes | - | - | - | - |
| orders.override_status | Yes | Yes | Yes | - | - | - | - |
| orders.view | Yes | Yes | Yes | Yes | - | Yes | Yes |
| payouts.manage | Yes | - | - | - | Yes | - | - |
| refunds.manage | Yes | - | - | Yes | Yes | - | - |
| analytics.view | Yes | Yes | - | - | Yes | - | Yes |
| support.manage | Yes | Yes | - | Yes | - | - | - |
| merchants.manage | Yes | Yes | - | - | - | Yes | - |
| drivers.manage | Yes | Yes | Yes | - | - | - | - |
| promotions.manage | Yes | Yes | - | - | - | Yes | - |
| zones.manage | Yes | Yes | - | - | - | - | - |

---

## Implementation Order

1. **Database migration** - Create all tables, enums, functions, RLS policies
2. **TenantContext provider** - Core tenant state management
3. **useTenantContext hook** - Permissions and tenant switching
4. **useTenantMembers hook** - CRUD for team members
5. **useTenantInvitations hook** - Invitation management
6. **TeamMemberCard component** - Member display
7. **InviteMemberDialog component** - Invite modal
8. **DispatchTeam page** - Main team management
9. **AcceptInvite page** - Invitation acceptance flow
10. **Update DispatchSidebar** - Permission gating
11. **Update App.tsx** - Add routes
12. **DispatchRoles page** (optional) - Role permission editor

---

## Testing Checklist

- [ ] Create new tenant with owner
- [ ] Invite user by email creates invitation
- [ ] Invitation email link works
- [ ] Accepting invitation creates membership
- [ ] User sees only permitted nav items
- [ ] Role change updates permissions immediately
- [ ] Deactivating member removes access
- [ ] Platform admins can access all tenants
- [ ] Tenant-scoped data isolated correctly
- [ ] RLS prevents cross-tenant data access
- [ ] Owner cannot be removed or demoted
