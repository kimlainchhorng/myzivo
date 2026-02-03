
# Test Mode Visibility Control for ZIVO Flights

## Summary

This plan restricts all sandbox/test-mode UI elements to admin users only, ensuring public users see a clean, production-ready Flights experience. When `DUFFEL_ENV` switches to live, all sandbox helpers automatically disappear.

---

## Current State Analysis

| Component | Current Behavior | Issue |
|-----------|------------------|-------|
| **Header Test Mode Badge** | Shows for admin + sandbox mode ✅ | Already correct |
| **SandboxTestHelper** | Shows for ANY user in sandbox mode | ❌ Public users see test language |
| **NoFlightsFound** | Shows sandbox helper for all users | ❌ Public users see "limited inventory" text |
| **FlightDebugPage** | Shows for all users who navigate to it | Should be admin-only access |
| **FlightStatusPage** | Shows sandbox badge for all users | Should be admin-only page |

---

## Implementation Plan

### Phase 1: Update duffelConfig with Admin-Aware Functions

**Goal:** Add a function that checks both sandbox mode AND admin status.

**File:** `src/config/duffelConfig.ts`

Add new function that can be used with admin check:
```typescript
/**
 * Whether to show sandbox-specific UI elements
 * Requires BOTH sandbox mode AND admin status
 */
export function shouldShowSandboxUI(isAdmin: boolean): boolean {
  return isSandboxMode() && isAdmin;
}
```

This keeps the logic centralized and easy to modify.

---

### Phase 2: Update NoFlightsFound Component

**Goal:** Only show SandboxTestHelper for admin users.

**File:** `src/components/flight/NoFlightsFound.tsx`

Changes:
1. Accept `isAdmin` prop (passed from parent)
2. Only show `SandboxTestHelper` when `isSandboxMode() && isAdmin`
3. Always show the clean public message for non-admins

```typescript
interface NoFlightsFoundProps {
  onClearFilters?: () => void;
  onModifySearch?: () => void;
  origin?: string;
  destination?: string;
  isAdmin?: boolean; // NEW: Admin status passed from parent
}

export default function NoFlightsFound({ 
  // ...
  isAdmin = false  // Default to false (public user)
}: NoFlightsFoundProps) {
  const showSandboxHelper = isSandboxMode() && isAdmin;
  // Rest of component unchanged, just uses new condition
}
```

---

### Phase 3: Update FlightResults Page to Pass Admin Status

**Goal:** Pass `isAdmin` from AuthContext to NoFlightsFound.

**File:** `src/pages/FlightResults.tsx` (or wherever NoFlightsFound is rendered)

```typescript
const { isAdmin } = useAuth();

// In render:
<NoFlightsFound
  origin={searchParams.get('origin') || undefined}
  destination={searchParams.get('dest') || undefined}
  onModifySearch={handleModifySearch}
  isAdmin={isAdmin}  // Pass admin status
/>
```

---

### Phase 4: Protect Admin Debug/Status Pages

**Goal:** Add access guards to admin-only pages.

**File:** `src/pages/admin/FlightDebugPage.tsx`

Add admin check at component level:
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function FlightDebugPage() {
  const { isAdmin, isLoading } = useAuth();
  
  // Redirect non-admins
  if (!isLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }
  
  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Rest of component...
}
```

**File:** `src/pages/admin/FlightStatusPage.tsx`

Same pattern - add admin guard:
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const FlightStatusPage = () => {
  const { isAdmin, isLoading } = useAuth();
  
  if (!isLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Rest of component...
}
```

---

### Phase 5: Clean Up SandboxTestHelper Component

**Goal:** Remove any references to "sandbox" in error messages that could leak to public.

**File:** `src/components/flight/SandboxTestHelper.tsx`

The component is already only shown when `showSandboxHelper` is true, so no changes needed to the component itself. However, we could make the language slightly less technical for admins:

Current:
> "Duffel Sandbox Mode"
> "The Duffel sandbox has limited test inventory"
> "Sandbox data may not reflect real availability"

Could simplify to (optional):
> "Test Environment"
> "Test inventory is limited. Try these routes for reliable results:"
> "Test data may differ from production"

This is optional polish - the key fix is in Phase 2 (gating with admin check).

---

### Phase 6: Ensure LIVE Mode Auto-Hides Everything

**Goal:** Verify that when `DUFFEL_ENV=live`, all sandbox UI automatically disappears.

**Already Correct:**
- `isSandboxMode()` returns `false` when env is `live`
- All sandbox UI is gated on `isSandboxMode()`
- No code changes needed - this is already working

**Verification:**
When `sessionStorage.setItem('duffel_env', 'live')`:
- Header badge disappears (already gated on `isAdmin && isSandboxMode()`)
- SandboxTestHelper disappears
- FlightStatusPage shows "LIVE Mode" badge
- FlightDebugPage hides sandbox quick routes

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/config/duffelConfig.ts` | MODIFY | Add `shouldShowSandboxUI(isAdmin)` helper |
| `src/components/flight/NoFlightsFound.tsx` | MODIFY | Accept `isAdmin` prop, gate sandbox helper |
| `src/pages/FlightResults.tsx` | MODIFY | Pass `isAdmin` to NoFlightsFound |
| `src/pages/admin/FlightDebugPage.tsx` | MODIFY | Add admin access guard |
| `src/pages/admin/FlightStatusPage.tsx` | MODIFY | Add admin access guard |
| `src/components/flight/SandboxTestHelper.tsx` | OPTIONAL | Simplify test language (polish) |

---

## Security Considerations

1. **Admin check is server-verified** ✅
   - `isAdmin` comes from `AuthContext` which calls `has_role()` RPC
   - Cannot be spoofed via client-side manipulation

2. **Debug pages are now protected** ✅
   - Non-admins redirected away from `/admin/flights/debug`
   - Non-admins redirected away from `/admin/flights/status`

3. **No sensitive data in public UI** ✅
   - Public users only see "No flights available" message
   - No sandbox routes, no test language

---

## Public User Experience

After implementation, non-admin users will see:

**No Results Screen:**
```
[Plane icon]
No flights available

No flights found for these dates. Try different dates or nearby airports.

[Clear Filters] [Modify Search]

Or explore other options for your trip:
[Hotels] [Cars] [Activities]
```

**No mentions of:**
- ❌ "Test Mode"
- ❌ "Sandbox"
- ❌ "Debug"
- ❌ "Limited test inventory"
- ❌ Duffel environment

---

## Admin User Experience

Admin users in sandbox mode will see:

**Header:** 
- "Test Mode" badge (already working)

**No Results Screen:**
- Full SandboxTestHelper with quick route buttons
- "Try routes like JFK–BOS, SFO–LAX, LHR–CDG"

**Admin Pages:**
- `/admin/flights/status` - Full status dashboard
- `/admin/flights/debug` - Search logs and replay tools

---

## Automatic LIVE Mode Behavior

When `DUFFEL_ENV` is switched to `live`:

| Element | Sandbox Mode | LIVE Mode |
|---------|--------------|-----------|
| Header Test Badge | ✓ (admins only) | Hidden |
| SandboxTestHelper | ✓ (admins only) | Hidden |
| Quick Test Routes | ✓ (admins only) | Hidden |
| Status Page Badge | "Sandbox Mode" | "LIVE Mode" |
| Debug Page Routes | ✓ (admins only) | Hidden |

**No code changes required to switch** - just update `DUFFEL_ENV` secret.

---

## Testing Checklist

1. **Public User (not logged in)**
   - [ ] Header shows NO test badge
   - [ ] No results shows clean message only
   - [ ] Cannot access `/admin/flights/debug`
   - [ ] Cannot access `/admin/flights/status`

2. **Logged in User (non-admin)**
   - [ ] Header shows NO test badge
   - [ ] No results shows clean message only
   - [ ] Redirected from admin pages

3. **Admin User (sandbox mode)**
   - [ ] Header shows "Test Mode" badge
   - [ ] No results shows SandboxTestHelper
   - [ ] Can access debug and status pages
   - [ ] Sees quick test routes

4. **Admin User (LIVE mode)**
   - [ ] Header shows NO test badge
   - [ ] No results shows clean message only
   - [ ] Status page shows "LIVE Mode"
   - [ ] Debug page hides quick routes
