
# Beta Launch Checklist Implementation Plan

## Overview
Add a comprehensive day-by-day beta launch checklist that guides admins through a safe, controlled beta launch. This will be a new admin module accessible via the existing Admin Panel navigation.

---

## Database Schema

### New Table: `beta_launch_status`
Tracks the overall beta launch state and history.

```sql
CREATE TYPE beta_launch_state AS ENUM ('not_ready', 'ready_for_beta', 'beta_live', 'paused');

CREATE TABLE beta_launch_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status beta_launch_state NOT NULL DEFAULT 'not_ready',
  activated_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  notes TEXT,
  activated_by UUID REFERENCES auth.users(id),
  paused_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE beta_launch_status ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can read beta launch status"
  ON beta_launch_status FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update beta launch status"
  ON beta_launch_status FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert initial row
INSERT INTO beta_launch_status (status, notes) 
VALUES ('not_ready', 'Initial state');
```

### New Table: `beta_launch_checklist`
Stores the checklist state for each day's items.

```sql
CREATE TABLE beta_launch_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Day 1: Platform Check
  day1_homepage_loads BOOLEAN DEFAULT false,
  day1_cars_page_loads BOOLEAN DEFAULT false,
  day1_list_car_page_loads BOOLEAN DEFAULT false,
  day1_login_works BOOLEAN DEFAULT false,
  day1_owner_routing_works BOOLEAN DEFAULT false,
  day1_renter_routing_works BOOLEAN DEFAULT false,
  day1_admin_routing_works BOOLEAN DEFAULT false,
  day1_footer_links_work BOOLEAN DEFAULT false,
  day1_completed_at TIMESTAMPTZ,
  day1_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 2: Payments & Insurance
  day2_stripe_test_payment BOOLEAN DEFAULT false,
  day2_stripe_connect_payout BOOLEAN DEFAULT false,
  day2_commission_deducted BOOLEAN DEFAULT false,
  day2_insurance_disclosure_visible BOOLEAN DEFAULT false,
  day2_completed_at TIMESTAMPTZ,
  day2_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 3: Owner Flow
  day3_owner_signup_works BOOLEAN DEFAULT false,
  day3_vehicle_upload_works BOOLEAN DEFAULT false,
  day3_2018_rule_enforced BOOLEAN DEFAULT false,
  day3_admin_approval_works BOOLEAN DEFAULT false,
  day3_owner_dashboard_shows_data BOOLEAN DEFAULT false,
  day3_completed_at TIMESTAMPTZ,
  day3_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 4: Renter Flow
  day4_renter_signup_works BOOLEAN DEFAULT false,
  day4_license_verification_works BOOLEAN DEFAULT false,
  day4_booking_blocked_without_verification BOOLEAN DEFAULT false,
  day4_confirmation_email_works BOOLEAN DEFAULT false,
  day4_completed_at TIMESTAMPTZ,
  day4_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 5: Disputes & Failsafes
  day5_damage_report_works BOOLEAN DEFAULT false,
  day5_dispute_panel_loads BOOLEAN DEFAULT false,
  day5_payout_hold_works BOOLEAN DEFAULT false,
  day5_cancellation_works BOOLEAN DEFAULT false,
  day5_completed_at TIMESTAMPTZ,
  day5_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 6: City Launch Control
  day6_city_status_live BOOLEAN DEFAULT false,
  day6_only_live_city_cars_shown BOOLEAN DEFAULT false,
  day6_non_live_cities_blocked BOOLEAN DEFAULT false,
  day6_waitlist_shown_when_beta BOOLEAN DEFAULT false,
  day6_completed_at TIMESTAMPTZ,
  day6_completed_by UUID REFERENCES auth.users(id),
  
  -- Day 7: Beta Go Live
  day7_first_renters_invited BOOLEAN DEFAULT false,
  day7_bookings_enabled BOOLEAN DEFAULT false,
  day7_first_transaction_monitored BOOLEAN DEFAULT false,
  day7_support_contact_visible BOOLEAN DEFAULT false,
  day7_completed_at TIMESTAMPTZ,
  day7_completed_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE beta_launch_checklist ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can read beta checklist"
  ON beta_launch_checklist FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update beta checklist"
  ON beta_launch_checklist FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert initial row
INSERT INTO beta_launch_checklist DEFAULT VALUES;
```

---

## Files to Create

### 1. `src/hooks/useBetaLaunchChecklist.ts`
React Query hooks for managing the beta launch checklist.

```typescript
// Key exports:
- useBetaLaunchStatus() - Fetch current beta status
- useBetaChecklist() - Fetch checklist items
- useUpdateChecklistItem() - Toggle individual items
- useUpdateBetaStatus() - Change overall status
- useBetaLaunchProgress() - Calculate completion percentage
```

### 2. `src/types/betaLaunch.ts`
TypeScript types for the beta launch feature.

```typescript
export type BetaLaunchState = 'not_ready' | 'ready_for_beta' | 'beta_live' | 'paused';

export interface BetaLaunchStatus {
  id: string;
  status: BetaLaunchState;
  activated_at: string | null;
  paused_at: string | null;
  notes: string | null;
}

export interface BetaChecklist {
  // Day 1-7 fields
}

export interface DayProgress {
  day: number;
  title: string;
  description: string;
  completed: number;
  total: number;
  isComplete: boolean;
  completedAt?: string;
  completedBy?: string;
}
```

### 3. `src/pages/admin/modules/AdminBetaLaunchModule.tsx`
Main admin module component with the full checklist UI.

**Layout:**
- Status banner at top (Not Ready / Ready for Beta / Beta Live / Paused)
- Progress overview (7 days, completion %)
- Day-by-day accordion sections with checkboxes
- Action buttons: "Mark Beta as LIVE", "Pause Beta"
- Notes/history section

---

## Files to Modify

### 1. `src/pages/admin/AdminPanel.tsx`
Add new navigation item and module rendering.

```typescript
// Add to navItems array:
{ id: "beta-launch", label: "Beta Launch", icon: Rocket }

// Add to renderModule switch:
case "beta-launch":
  return <AdminBetaLaunchModule />;
```

---

## UI Component Structure

### Status Banner
Displays current beta state with color coding:
- **Not Ready** - Gray/muted
- **Ready for Beta** - Yellow/amber
- **Beta Live** - Green
- **Paused** - Orange/red

### Day Cards (Accordion)
Each day shows:
- Day number and title
- Progress indicator (3/5 items complete)
- Expandable checklist items
- Completion timestamp when all items checked

### Checklist Items
Each item is a checkbox with:
- Item description
- Optional tooltip/help text
- Auto-saves on toggle
- Shows who completed it (admin email)

### Action Buttons
- **Mark Beta as LIVE** - Only enabled when all 7 days complete
- **Pause Beta** - Emergency stop, captures reason
- **Resume Beta** - Restores from paused state

---

## Day-by-Day Checklist Details

### Day 1: Platform Check
| Item | Database Field |
|------|----------------|
| Website homepage loads correctly | `day1_homepage_loads` |
| /cars page loads correctly | `day1_cars_page_loads` |
| /list-your-car page loads correctly | `day1_list_car_page_loads` |
| Login/signup works | `day1_login_works` |
| Owner routes correctly to /owner/dashboard | `day1_owner_routing_works` |
| Renter routes correctly to /renter/dashboard | `day1_renter_routing_works` |
| Admin routes correctly to /admin | `day1_admin_routing_works` |
| Footer legal links work (Terms, Privacy, etc.) | `day1_footer_links_work` |

### Day 2: Payments & Insurance
| Item | Database Field |
|------|----------------|
| Stripe test payment completed | `day2_stripe_test_payment` |
| Stripe Connect owner payout tested | `day2_stripe_connect_payout` |
| Commission deducted correctly (20%) | `day2_commission_deducted` |
| Insurance disclosure visible at checkout | `day2_insurance_disclosure_visible` |

### Day 3: Owner Flow Test
| Item | Database Field |
|------|----------------|
| Owner signup works | `day3_owner_signup_works` |
| Vehicle upload works | `day3_vehicle_upload_works` |
| 2018+ rule enforced | `day3_2018_rule_enforced` |
| Admin approval works | `day3_admin_approval_works` |
| Owner dashboard shows car & earnings | `day3_owner_dashboard_shows_data` |

### Day 4: Renter Flow Test
| Item | Database Field |
|------|----------------|
| Renter signup works | `day4_renter_signup_works` |
| Driver license verification works | `day4_license_verification_works` |
| Booking blocked until verification approved | `day4_booking_blocked_without_verification` |
| Booking confirmation email works | `day4_confirmation_email_works` |

### Day 5: Disputes & Failsafes
| Item | Database Field |
|------|----------------|
| Damage report submission works | `day5_damage_report_works` |
| Admin dispute panel loads | `day5_dispute_panel_loads` |
| Payout hold works when dispute exists | `day5_payout_hold_works` |
| Booking cancellation works | `day5_cancellation_works` |

### Day 6: City Launch Control
| Item | Database Field |
|------|----------------|
| City launch status set to LIVE | `day6_city_status_live` |
| Only LIVE city cars appear in search | `day6_only_live_city_cars_shown` |
| Non-live cities blocked | `day6_non_live_cities_blocked` |
| Waitlist shown when renter beta mode is ON | `day6_waitlist_shown_when_beta` |

### Day 7: Beta Go Live
| Item | Database Field |
|------|----------------|
| First renters invited | `day7_first_renters_invited` |
| Bookings enabled | `day7_bookings_enabled` |
| First transactions monitored | `day7_first_transaction_monitored` |
| Support contact visible | `day7_support_contact_visible` |

---

## Route Structure

No separate route needed. The beta launch checklist will be accessible as a module within the existing `/admin` route via the sidebar navigation, similar to other admin modules like "City Launch" and "Renter Invites".

Optional: Add `/admin/beta-launch` as an alias that auto-selects this module.

---

## Technical Notes

### Status Transitions
```
not_ready -> ready_for_beta (when all days complete)
ready_for_beta -> beta_live (admin clicks "Mark Beta as LIVE")
beta_live -> paused (admin clicks "Pause Beta")
paused -> beta_live (admin clicks "Resume Beta")
```

### Computed Progress
The module will calculate overall progress by counting completed items across all 7 days. Each day can also show individual progress (e.g., "Day 1: 6/8 complete").

### Audit Trail
Completion timestamps and user IDs are captured for each day to maintain an audit trail of who verified each section.

### Integration with Existing Systems
- Reads city launch status from `p2p_launch_cities` table
- Reads beta mode from `system_settings` table  
- Reads renter invite counts from `p2p_renter_invites` table
- Can link to existing admin modules for quick access

---

## Summary

This implementation adds a focused, day-by-day beta launch checklist that:
1. Uses the existing admin panel infrastructure
2. Stores checklist state in the database with proper RLS
3. Provides clear status visibility (Not Ready / Ready / Live / Paused)
4. Includes emergency pause functionality
5. Maintains an audit trail of who completed each section
6. Integrates with existing city launch and beta invite systems
