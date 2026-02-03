
# ZIVO Production Launch, Go-Live & Scale System

## Overview

This plan implements a comprehensive Production Launch Dashboard that consolidates all pre-launch verification, live booking tests, and post-launch monitoring into a unified admin interface. The system will ensure ZIVO can safely transition from staging to production with complete visibility into all critical systems.

## Architecture

The Production Launch system builds on existing infrastructure:
- Uses existing `src/config/environment.ts` (already locked to production mode)
- Integrates with existing launch systems (`useLaunchSettings`, `useFlightsLaunchStatus`)
- Extends existing admin modules pattern
- Leverages existing Disaster Recovery, Compliance, and Automation dashboards

---

## Technical Scope

### 1. Database Schema (Migration)

New tables to support production launch tracking:

```text
production_launch_checklist
- id, category, item_key, item_title, item_description
- is_verified, verified_at, verified_by
- is_critical, verification_notes, evidence_url
- created_at, updated_at

production_test_bookings
- id, service_type (hotel | activity | transfer | flight)
- test_status (pending | success | failed)
- booking_reference, supplier_confirmation
- payment_captured, amount_cents, currency
- email_sent, admin_visible, my_trips_visible
- error_message, tested_by, tested_at
- created_at

launch_phase_log
- id, phase (pre_launch | soft_launch | full_launch | scaling)
- started_at, completed_at, started_by
- notes, metrics_snapshot

launch_monitoring_alerts
- id, alert_type (booking_failure | payment_failure | api_outage | fraud_spike | refund_spike)
- severity (info | warning | critical)
- message, details, acknowledged, acknowledged_by
- created_at
```

Seed data for checklist items across 8 categories matching the specification.

### 2. Environment Verification System

A component that validates all critical environment settings:

```text
Environment Switch Panel
+-------------------------------------------------+
| API MODE VERIFICATION                           |
|-------------------------------------------------|
| Hotelbeds Hotels    | LIVE ✓ | HOTELBEDS_BASE_URL |
| Hotelbeds Activities| LIVE ✓ | verified         |
| Hotelbeds Transfers | LIVE ✓ | verified         |
| Stripe              | LIVE ✓ | STRIPE_MODE      |
| Duffel (Flights)    | LIVE ✓ | DUFFEL_MODE      |
| Email (Resend)      | LIVE ✓ | RESEND_API_KEY   |
+-------------------------------------------------+
| Debug/Test Checks                               |
|-------------------------------------------------|
| Test badges hidden  | ✓ SHOW_TEST_BADGE=false   |
| Debug logs disabled | ✓ Production mode         |
| Sandbox UI hidden   | ✓ shouldShowDebugUI=false |
+-------------------------------------------------+
```

### 3. Live Booking Test Runner

An interactive panel to execute and verify real test bookings:

```text
LIVE BOOKING VERIFICATION
+-------------------------------------------------+
| Service      | Status  | Payment | Supplier | Email |
|--------------|---------|---------|----------|-------|
| Hotel        | Pending | -       | -        | -     |
| Activity     | Success | $19.00  | HB12345  | Sent  |
| Transfer     | Success | $35.00  | HB67890  | Sent  |
| Flight       | -       | (Duffel partner handles) |
+-------------------------------------------------+
| [Run Hotel Test] [Run Activity Test] [Run All] |
+-------------------------------------------------+
```

Each test will:
1. Create a low-value real booking via edge function
2. Verify payment capture in Stripe
3. Verify supplier confirmation
4. Verify confirmation email sent
5. Verify order appears in My Trips
6. Verify order visible in Admin dashboard

### 4. Pre-Launch Checklist Dashboard

Interactive checklist with 8 categories from the specification:

**Category A: Environment Switch**
- All APIs switched to LIVE mode
- Test banners disabled
- Debug logging disabled
- Sandbox endpoints disabled

**Category B: Final Booking Tests**
- Hotel booking verified
- Activity booking verified
- Transfer booking verified
- Payment success confirmed
- Supplier confirmation received
- Email delivery confirmed
- My Trips display verified
- Admin visibility confirmed

**Category C: Legal & Trust**
- Terms of Service published
- Privacy Policy published
- Refund & Cancellation Policy published
- Company legal name visible
- Support email displayed
- Partner disclosure visible

**Category D: Security**
- HTTPS enforced
- Rate limits active
- Admin routes protected
- API keys in env only
- Backups enabled

**Category E: Support Readiness**
- Support inbox active
- Auto-replies enabled
- SLA timers active
- Escalation contacts set

**Category F: Monitoring & Alerts**
- Booking failure alerts enabled
- Payment failure alerts enabled
- Supplier API monitoring active
- Fraud detection active
- High refund alerts enabled

**Category G: Soft Launch Config**
- Soft launch phase defined (24-72h)
- Traffic controls ready
- Monitoring dashboard accessible

**Category H: Full Launch Config**
- Paid ads ready to enable
- SEO pages published
- Public announcement prepared

### 5. Launch Phase Manager

Controls for managing launch phases:

```text
LAUNCH PHASE CONTROL
+-------------------------------------------------+
| Current Phase: PRE_LAUNCH                       |
|-------------------------------------------------|
| ○ Pre-Launch    - Final verification            |
| ● Soft Launch   - Limited traffic (24-72h)      |
| ○ Full Launch   - Public + paid ads             |
| ○ Scaling       - Optimizing for growth         |
+-------------------------------------------------+
| Blockers: 2 items incomplete                    |
| [View Blockers] [Advance Phase]                 |
+-------------------------------------------------+
```

### 6. Post-Launch Monitoring Panel

Real-time metrics for the first 7 days:

```text
POST-LAUNCH MONITORING (Day 3 of 7)
+-------------------------------------------------+
| Metric                | Today | Yesterday | Δ   |
|-----------------------|-------|-----------|-----|
| Bookings              | 47    | 32        | +46%|
| Revenue               | $8,420| $5,100    | +65%|
| Failed Bookings       | 2     | 1         | +1  |
| Failed Payments       | 0     | 0         | -   |
| Refund Rate           | 2.1%  | 3.1%      | -1% |
| Fraud Flags           | 1     | 0         | +1  |
+-------------------------------------------------+
| ALERTS (3 active)                               |
| ⚠ High refund request from user@email.com      |
| ⚠ Hotelbeds response time >2s                  |
| ✓ All systems operational                       |
+-------------------------------------------------+
```

### 7. React Query Hooks

New hook file: `src/hooks/useProductionLaunch.ts`

```text
Hooks:
- useProductionLaunchChecklist() - fetch/update checklist items
- useProductionTestBookings() - manage test booking runs
- useLaunchPhase() - current phase and controls
- usePostLaunchMetrics() - real-time monitoring data
- useLaunchMonitoringAlerts() - active alerts
- useAdvanceLaunchPhase() - mutation to progress phases
- useRunTestBooking() - trigger a live test booking
```

### 8. Admin Dashboard Page

New page: `src/pages/admin/modules/launch/ProductionLaunchDashboard.tsx`

Tabbed interface:
- **Overview**: Phase status, blockers, quick actions
- **Environment**: API mode verification, debug checks
- **Checklist**: All 8 category checklists with verification
- **Test Bookings**: Live booking test runner
- **Monitoring**: Post-launch metrics and alerts
- **Logs**: Phase transition history

### 9. Route Registration

Add to `App.tsx`:
```text
/admin/production-launch → ProductionLaunchDashboard
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/xxx_production_launch.sql` | Create |
| `src/types/productionLaunch.ts` | Create |
| `src/hooks/useProductionLaunch.ts` | Create |
| `src/integrations/supabase/types.ts` | Update (auto) |
| `src/pages/admin/modules/launch/ProductionLaunchDashboard.tsx` | Create |
| `src/components/launch/EnvironmentVerificationPanel.tsx` | Create |
| `src/components/launch/LaunchChecklistPanel.tsx` | Create |
| `src/components/launch/TestBookingRunner.tsx` | Create |
| `src/components/launch/PostLaunchMonitoringPanel.tsx` | Create |
| `src/components/launch/LaunchPhaseControl.tsx` | Create |
| `src/App.tsx` | Update (add route) |

---

## Integration Points

1. **Environment Config**: Reads from `src/config/environment.ts` to verify production mode
2. **Compliance**: Links to `/admin/compliance` for legal verification
3. **Disaster Recovery**: Links to DR dashboard for backup status
4. **Automation**: Links to automation dashboard for alert configuration
5. **Support**: Links to support dashboard for SLA verification
6. **Flights Launch**: Integrates with existing `useFlightsLaunchStatus` for flights-specific checks

---

## Security Considerations

- All launch controls require admin authentication
- Phase transitions logged with user ID and timestamp
- Test bookings use real but low-value amounts ($10-50)
- Environment checks validate secrets exist without exposing values
- All actions logged to `launch_phase_log`

---

## Success Criteria

After implementation, admins can:
1. Verify all APIs are in LIVE mode with one click
2. Run and verify real test bookings for each service
3. Track all 40+ checklist items across 8 categories
4. Progress through launch phases with blocker awareness
5. Monitor post-launch metrics in real-time
6. Receive and acknowledge critical alerts
7. Review complete launch history and audit trail
