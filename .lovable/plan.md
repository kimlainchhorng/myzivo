
# First City Launch Checklist - Implementation Plan

## Overview
Create a city-based launch checklist system that ensures ZIVO only goes live in specific cities when all required checks (legal, insurance, payments, supply, operations, support) are complete. This is an admin-only feature for controlled geographic expansion.

---

## Database Schema

### New Tables Required

#### 1. `p2p_launch_cities`
Stores each city ZIVO is preparing to launch or has launched.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | City name (e.g., "Los Angeles") |
| `state` | text | State code (e.g., "CA") |
| `launch_status` | enum | draft / ready / live / paused |
| `launched_at` | timestamp | When city went live |
| `paused_at` | timestamp | When city was paused |
| `created_by` | uuid | Admin who created |
| `created_at` | timestamp | Record created |
| `updated_at` | timestamp | Last updated |

#### 2. `p2p_launch_checklists`
Stores checklist completion state for each city.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `city_id` | uuid | FK to p2p_launch_cities |
| **Legal Section** | | |
| `legal_renter_terms` | boolean | Renter Terms published |
| `legal_owner_terms` | boolean | Owner Terms published |
| `legal_insurance_disclosure` | boolean | Insurance Disclosure published |
| `legal_damage_policy` | boolean | Damage Policy published |
| `legal_privacy_policy` | boolean | Privacy Policy published |
| **Insurance Section** | | |
| `insurance_provider_name` | text | Insurance provider name |
| `insurance_coverage_type` | text | Coverage type (Trip-based) |
| `insurance_confirmation_ref` | text | Coverage confirmation reference |
| `insurance_active` | boolean | Insurance coverage active |
| **Payments Section** | | |
| `payments_stripe_active` | boolean | Stripe Payments active |
| `payments_connect_enabled` | boolean | Stripe Connect enabled |
| `payments_test_payment` | boolean | Test payment completed |
| `payments_test_payout` | boolean | Test payout completed |
| **Operations Section** | | |
| `ops_dispute_tested` | boolean | Dispute workflow tested |
| `ops_damage_tested` | boolean | Damage reporting tested |
| `ops_cancellation_tested` | boolean | Cancellation tested |
| `ops_payout_delay_tested` | boolean | Payout delay logic tested |
| **Support Section** | | |
| `support_email` | text | Support email address |
| `support_emergency_procedure` | text | Emergency contact procedure |
| `support_confirmed` | boolean | Support process confirmed |
| **Computed Supply** | | |
| `min_approved_cars` | integer | Minimum cars required (default: 10) |
| `min_approved_owners` | integer | Minimum owners required (default: 5) |
| **Timestamps** | | |
| `updated_at` | timestamp | Last checklist update |
| `updated_by` | uuid | Admin who last updated |

#### 3. New Enum: `p2p_launch_status`
Values: `draft`, `ready`, `live`, `paused`

---

## File Structure

### New Files to Create

```text
src/pages/admin/modules/AdminCityLaunchModule.tsx     - Main module UI
src/hooks/useCityLaunch.ts                            - Data fetching hooks
src/types/cityLaunch.ts                               - TypeScript types
```

### Files to Modify

```text
src/pages/admin/AdminPanel.tsx                        - Add nav item + import module
src/hooks/useP2PBooking.ts                            - Filter by live city status
```

---

## Implementation Details

### 1. AdminCityLaunchModule.tsx

The main admin UI with the following sections:

**Header**
- Title: "City Launch Checklist"
- Description: "Prepare cities for P2P marketplace launch"
- "Add City" button (opens modal)

**City List (Cards)**
- Each city shows: Name, State, Status badge
- Quick stats: Approved owners count, approved vehicles count
- "View Checklist" button

**City Checklist View (Modal or Expanded Panel)**

Six collapsible sections:

1. **Legal & Compliance**
   - 5 checkboxes (Renter Terms, Owner Terms, Insurance Disclosure, Damage Policy, Privacy Policy)
   - Auto-check option: Link to verify page exists

2. **Insurance Setup**
   - Text fields: Provider name, Coverage type, Confirmation reference
   - Checkbox: Insurance active for city

3. **Payments & Payouts**
   - 4 checkboxes (Stripe Payments, Connect enabled, Test payment, Test payout)
   - Note: These are manual confirmations

4. **Owner Supply (Minimum)**
   - Display: Current approved owners in city vs. minimum (5)
   - Display: Current approved vehicles in city vs. minimum (10)
   - Status: Green checkmark or red warning
   - This section auto-calculates from database

5. **Operational Readiness**
   - 4 checkboxes (Dispute workflow, Damage reporting, Cancellation, Payout delay)

6. **Support & Contact**
   - Text fields: Support email, Emergency procedure
   - Checkbox: Support process confirmed

**Launch Controls**
- Progress indicator: X of 6 sections complete
- "Mark City as LIVE" button (disabled until all sections complete)
- Confirmation modal with warning text
- "Pause City" button (for live cities)

---

### 2. useCityLaunch.ts Hooks

```typescript
// Fetch all cities with their checklist status
useLaunchCities()

// Fetch single city with full checklist
useCityChecklist(cityId: string)

// Fetch owner/vehicle counts for a city
useCitySupplyStats(city: string, state: string)

// Create new city
useCreateLaunchCity()

// Update checklist items
useUpdateCityChecklist()

// Update city launch status
useUpdateCityStatus()
```

---

### 3. City Supply Stats Query

For the "Owner Supply" section, query the database:

```sql
-- Approved owners count for city
SELECT COUNT(*) FROM car_owner_profiles
WHERE city ILIKE '%Los Angeles%'
AND state = 'CA'
AND status = 'verified';

-- Approved vehicles count for city
SELECT COUNT(*) FROM p2p_vehicles
WHERE location_city ILIKE '%Los Angeles%'
AND location_state = 'CA'
AND approval_status = 'approved';
```

---

### 4. Vehicle Search Filtering by Live City

Modify `useP2PVehicleSearch` in `useP2PBooking.ts`:

When searching for vehicles:
1. Check if the city is in a "live" launch status
2. If city is not live, exclude those vehicles from results
3. This ensures only vehicles in launched cities appear in search

Implementation approach:
- Join or subquery against `p2p_launch_cities` table
- Filter by `launch_status = 'live'`

---

### 5. AdminPanel.tsx Updates

Add new navigation item:

```typescript
{ id: "city-launch", label: "City Launch", icon: MapPin }
```

Add to switch statement:

```typescript
case "city-launch":
  return <AdminCityLaunchModule />;
```

---

## UI Design

### City Card Layout

```text
+------------------------------------------+
|  Los Angeles, CA                [Draft]  |
|                                          |
|  Owners: 3/5     Vehicles: 7/10         |
|                                          |
|  [View Checklist]                        |
+------------------------------------------+
```

### Checklist Section Layout

```text
+------------------------------------------+
|  [v] Legal & Compliance            5/5   |
|  [v] Insurance Setup               1/1   |
|  [x] Payments & Payouts            2/4   |
|  [v] Owner Supply                  Met   |
|  [x] Operational Readiness         1/4   |
|  [v] Support & Contact             1/1   |
+------------------------------------------+
|  Overall Progress: 4/6 sections          |
|                                          |
|  [Mark City as LIVE] (disabled)          |
+------------------------------------------+
```

### Status Badges

| Status | Color |
|--------|-------|
| Draft | Gray |
| Ready | Yellow |
| Live | Green |
| Paused | Orange |

---

## Launch Confirmation Modal

When admin clicks "Mark City as LIVE":

```text
+------------------------------------------+
|  Launch Los Angeles, CA                  |
+------------------------------------------+
|  You are about to enable public          |
|  bookings for this city.                 |
|                                          |
|  This will:                              |
|  - Make cars in this city searchable     |
|  - Allow bookings and payments           |
|  - Trigger live operations               |
|                                          |
|  [Cancel]            [Confirm Launch]    |
+------------------------------------------+
```

---

## Failsafe: Pause City

When a live city is paused:
- `launch_status` changes to `paused`
- `paused_at` timestamp is set
- Vehicles in that city are hidden from search results
- New bookings are blocked
- Existing confirmed bookings remain valid

---

## Security Considerations

- All operations require admin role (checked in hooks via `useAuth().isAdmin`)
- RLS policies on new tables:
  - SELECT: Admin only
  - INSERT/UPDATE/DELETE: Admin only
- No public access to launch configuration data

---

## Database Migration Summary

```sql
-- Create launch status enum
CREATE TYPE p2p_launch_status AS ENUM ('draft', 'ready', 'live', 'paused');

-- Create cities table
CREATE TABLE p2p_launch_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  launch_status p2p_launch_status DEFAULT 'draft',
  launched_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, state)
);

-- Create checklists table
CREATE TABLE p2p_launch_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES p2p_launch_cities(id) ON DELETE CASCADE UNIQUE,
  -- Legal section
  legal_renter_terms BOOLEAN DEFAULT false,
  legal_owner_terms BOOLEAN DEFAULT false,
  legal_insurance_disclosure BOOLEAN DEFAULT false,
  legal_damage_policy BOOLEAN DEFAULT false,
  legal_privacy_policy BOOLEAN DEFAULT false,
  -- Insurance section
  insurance_provider_name TEXT,
  insurance_coverage_type TEXT DEFAULT 'Trip-based',
  insurance_confirmation_ref TEXT,
  insurance_active BOOLEAN DEFAULT false,
  -- Payments section
  payments_stripe_active BOOLEAN DEFAULT false,
  payments_connect_enabled BOOLEAN DEFAULT false,
  payments_test_payment BOOLEAN DEFAULT false,
  payments_test_payout BOOLEAN DEFAULT false,
  -- Operations section
  ops_dispute_tested BOOLEAN DEFAULT false,
  ops_damage_tested BOOLEAN DEFAULT false,
  ops_cancellation_tested BOOLEAN DEFAULT false,
  ops_payout_delay_tested BOOLEAN DEFAULT false,
  -- Support section
  support_email TEXT,
  support_emergency_procedure TEXT,
  support_confirmed BOOLEAN DEFAULT false,
  -- Supply minimums
  min_approved_cars INTEGER DEFAULT 10,
  min_approved_owners INTEGER DEFAULT 5,
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS policies (admin only)
ALTER TABLE p2p_launch_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_launch_checklists ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admin full access to launch cities"
  ON p2p_launch_cities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin full access to launch checklists"
  ON p2p_launch_checklists FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
```

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/types/cityLaunch.ts` | TypeScript types for city launch |
| Create | `src/hooks/useCityLaunch.ts` | Data hooks for city launch |
| Create | `src/pages/admin/modules/AdminCityLaunchModule.tsx` | Main admin UI |
| Modify | `src/pages/admin/AdminPanel.tsx` | Add nav item and module |
| Modify | `src/hooks/useP2PBooking.ts` | Filter vehicles by live city |
| Database | Migration | Create tables, enum, and RLS policies |

---

## Technical Notes

1. **Legal Auto-Check**: Could add automatic verification by checking if legal page routes return 200, but manual checkboxes are safer for admin accountability.

2. **Supply Stats**: Calculated live from `car_owner_profiles` and `p2p_vehicles` tables using city/state matching (case-insensitive).

3. **Launch Status Flow**: `draft` -> (all checks complete) -> `ready` -> (admin confirms) -> `live` -> (admin pauses) -> `paused`

4. **City Matching**: Uses `ILIKE` for flexible city name matching in supply stats query.
