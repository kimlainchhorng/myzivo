

# Programmatic SEO Route Layout & Admin Fulfillment Hub

## Overview

Implement two major 2026 feature upgrades:
1. **Programmatic SEO Route Pages**: Enhanced `/flights/jfk-to-lhr` style pages with vertical scroll reveal animations, Ken Burns 2.0 effect, and "Direct NDC Pricing" trust badge
2. **Admin Fulfillment Hub**: Agentic dashboard that proactively surfaces bookings needing attention with supplier health pulse, PNR lifecycle timeline, and margin tracking

---

## Part 1: Programmatic SEO Destination Routes

### Current State

The existing `FlightRoutePage.tsx` provides a solid SEO landing page but lacks:
- Scroll-triggered animations
- Enhanced Ken Burns (zoom + pan) effect
- "Direct NDC Pricing" badge to signal non-affiliate model

### Proposed Enhancements

#### A. Vertical Scroll Reveal System

Create a reusable scroll reveal component using Framer Motion's `whileInView`:

| Element | Animation | Trigger |
|---------|-----------|---------|
| H1 Title | Fade up + slight scale | On mount |
| Route Map | Slide in + draw path | When 30% visible |
| Booking Tips | Staggered fade-in | When in viewport |
| Price Alert CTA | Scale pop | When 50% visible |
| Related Routes | Horizontal slide | When in viewport |

#### B. Ken Burns 2.0 Effect

Upgrade the existing hero image animation to include:
- **Subtle zoom**: Scale from 1.0 → 1.05 (gentler than current 1.2)
- **Pan movement**: Slight X/Y translate during animation
- **Duration**: 15-20 seconds for subtle, premium feel

```text
Initial: scale(1.0), translate(0, 0)
Animate: scale(1.05), translate(-2%, -1%)
Duration: 20s ease-in-out
```

#### C. "Direct NDC Pricing" Trust Badge

Add a prominent badge signaling ZIVO is not an affiliate site:

```text
┌─────────────────────────────────────────┐
│  ⚡ DIRECT NDC PRICING                  │
│  Not an affiliate — real airline rates  │
└─────────────────────────────────────────┘
```

Placement: Below hero, above search form

#### D. Animated Route Map

Create an SVG-based route visualization with scroll-triggered path animation:

```text
    ✈️ JFK ─────────────────> LHR
         ╰─── 3,451 miles ───╯
```

The path line draws as user scrolls, with plane icon animating along the path.

### Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/components/ui/scroll-reveal.tsx` | NEW: Reusable scroll animation wrapper |
| `src/components/seo/AnimatedRouteMap.tsx` | NEW: SVG route visualization |
| `src/components/seo/DirectNDCBadge.tsx` | NEW: Trust badge component |
| `src/pages/seo/FlightRoutePage.tsx` | MODIFY: Add scroll reveals + Ken Burns 2.0 |
| `src/components/seo/AnimatedCityHero.tsx` | MODIFY: Upgrade Ken Burns effect |

---

## Part 2: Admin Fulfillment Hub

### Current State

The admin dashboard (`TravelOperationsCenter.tsx`) has basic order management but lacks the "agentic" 2026 approach that proactively surfaces issues.

### Proposed Enhancements

#### A. Real-Time Supplier Health Pulse

Add animated pulse indicators showing live API latency:

| Supplier | Indicator | Latency Thresholds |
|----------|-----------|-------------------|
| Duffel | 🟢 Pulse | <500ms = Green, 500-1000ms = Yellow, >1000ms = Red |
| Hotelbeds | 🟢 Pulse | <800ms = Green, 800-1500ms = Yellow, >1500ms = Red |
| RateHawk | 🟢 Pulse | <800ms = Green |

Features:
- Animated pulse ring effect
- Live latency display (e.g., "245ms")
- Auto-refresh every 30 seconds
- Click to view full health history

#### B. PNR Life-Cycle Timeline

Visual timeline showing booking progression:

```text
┌─────────────────────────────────────────────────────────────────┐
│  Payment         Supplier          PNR             Ticket      │
│  Authorized      Notified          Received        Issued      │
│     ✓              ✓                 ⏳              ○          │
│   10:45 AM       10:46 AM         Pending           —          │
│                                                                 │
│  ━━━━━━━●━━━━━━━━━━●━━━━━━━━━━○━━━━━━━━━━○━━━━━━━               │
└─────────────────────────────────────────────────────────────────┘
```

States:
- ✓ Complete (green)
- ⏳ In Progress (animated yellow)
- ○ Pending (gray)
- ✗ Failed (red with alert)

#### C. Margin Tracker

Per-booking profitability calculator:

```text
┌─────────────────────────────────────┐
│  Booking #FL-12345                  │
│  ─────────────────────────────────  │
│  Sale Price:        $1,245.00       │
│  Supplier Cost:     -$1,089.50      │
│  Stripe Fee (2.9%): -$36.11         │
│  Platform Fee:      -$12.45         │
│  ─────────────────────────────────  │
│  Net Margin:        $106.94 (8.6%)  │
│                     ██████████░░░░  │
└─────────────────────────────────────┘
```

Features:
- Real-time calculation
- Visual margin bar
- Alert when margin < 5%
- Aggregate margin KPI in dashboard

#### D. Agentic Alert Cards

Proactive cards that surface issues before they become problems:

| Alert Type | Trigger | Priority |
|------------|---------|----------|
| "Pending PNR" | PNR not received within 5 min of payment | High |
| "Ticketing Delay" | Ticket not issued within 15 min | High |
| "Low Margin Booking" | Margin < 5% | Medium |
| "Supplier Degraded" | Latency > threshold | Medium |
| "Payment Mismatch" | Stripe amount ≠ order total | Critical |

Display format:
```text
┌─ 🔴 CRITICAL ──────────────────────┐
│  PNR Delay: Booking #FL-12345      │
│  Payment received 8 min ago        │
│  No PNR from Duffel yet            │
│                                    │
│  [View Booking] [Contact Supplier] │
└────────────────────────────────────┘
```

### Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/components/admin/SupplierHealthPulse.tsx` | NEW: Live API health indicator |
| `src/components/admin/PNRTimeline.tsx` | NEW: Booking lifecycle visualization |
| `src/components/admin/MarginTracker.tsx` | NEW: Profitability calculator |
| `src/components/admin/AgenticAlertCard.tsx` | NEW: Proactive issue cards |
| `src/pages/admin/FulfillmentHub.tsx` | NEW: Combined agentic dashboard |
| `src/hooks/useSupplierHealth.ts` | NEW: Health check hook |
| `src/hooks/useBookingMargins.ts` | NEW: Margin calculation hook |
| `src/pages/admin/TravelOperationsCenter.tsx` | MODIFY: Add new modules |

---

## Technical Implementation Details

### Scroll Reveal Component

```typescript
// Framer Motion wrapper for scroll-triggered animations
<ScrollReveal 
  animation="fade-up"   // fade-up, scale, slide-left
  threshold={0.3}       // 30% visibility trigger
  delay={0.1}           // stagger offset
>
  <BookingTipCard />
</ScrollReveal>
```

### Ken Burns 2.0 Motion Values

```typescript
// Enhanced Ken Burns with pan
const kenBurns2 = {
  initial: { scale: 1, x: 0, y: 0 },
  animate: { 
    scale: [1, 1.05, 1.03],
    x: [0, "-1%", "-2%"],
    y: [0, "-0.5%", "-1%"],
  },
  transition: { 
    duration: 20,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "reverse"
  }
};
```

### Supplier Health Polling

```typescript
// Auto-refresh supplier health every 30s
const { data: health } = useQuery({
  queryKey: ['supplier-health'],
  queryFn: fetchSupplierStatus,
  refetchInterval: 30000,
});
```

---

## Implementation Order

### Phase 1: Scroll Reveal Foundation
1. Create `ScrollReveal.tsx` utility component
2. Create `AnimatedRouteMap.tsx` SVG component
3. Create `DirectNDCBadge.tsx` trust badge

### Phase 2: Flight Route Page Upgrade
4. Update `FlightRoutePage.tsx` with scroll reveals
5. Enhance `AnimatedCityHero.tsx` with Ken Burns 2.0
6. Add route map animation
7. Integrate NDC badge

### Phase 3: Admin Fulfillment Hub
8. Create `SupplierHealthPulse.tsx` with pulse animation
9. Create `PNRTimeline.tsx` lifecycle component
10. Create `MarginTracker.tsx` calculator
11. Create `AgenticAlertCard.tsx` proactive cards
12. Create `FulfillmentHub.tsx` combined view
13. Add hooks for health and margin data

### Phase 4: Integration
14. Update admin routing to include new hub
15. Test all animations and real-time updates
16. Verify mobile responsiveness

---

## Files Summary

### New Files (12)
| File | Type |
|------|------|
| `src/components/ui/scroll-reveal.tsx` | UI Component |
| `src/components/seo/AnimatedRouteMap.tsx` | SEO Component |
| `src/components/seo/DirectNDCBadge.tsx` | SEO Component |
| `src/components/admin/SupplierHealthPulse.tsx` | Admin Component |
| `src/components/admin/PNRTimeline.tsx` | Admin Component |
| `src/components/admin/MarginTracker.tsx` | Admin Component |
| `src/components/admin/AgenticAlertCard.tsx` | Admin Component |
| `src/pages/admin/FulfillmentHub.tsx` | Admin Page |
| `src/hooks/useSupplierHealth.ts` | Data Hook |
| `src/hooks/useBookingMargins.ts` | Data Hook |
| `src/components/admin/index.ts` | Index Export |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/pages/seo/FlightRoutePage.tsx` | Add scroll reveals, NDC badge, route map |
| `src/components/seo/AnimatedCityHero.tsx` | Ken Burns 2.0 upgrade |
| `src/pages/admin/TravelOperationsCenter.tsx` | Link to Fulfillment Hub |
| `src/App.tsx` | Add admin route for Fulfillment Hub |

