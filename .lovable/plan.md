

# Mission Control Admin UI Implementation Plan

## Overview

Transform the ZIVO admin experience with a dense, high-contrast "Mission Control" layout designed for power users and operations staff. This implementation includes:

1. **Mission Control Layout** - Dark-themed, power-user workspace with collapsible glass sidebar and system health widget
2. **Booking Ledger Table** - Real-time live data stream with status indicators, hover actions, and profit visibility
3. **Booking Detail Panel** - Slide-over panel for quick issue resolution without page navigation

---

## Current State Analysis

### Existing Admin Layout
- Located at `src/layouts/AdminLayout.tsx` (345 lines)
- Uses light theme with standard sidebar navigation
- Features RBAC-based navigation filtering
- Mobile-responsive with Sheet component for mobile sidebar

### Existing Admin Components
- `FulfillmentHub.tsx`: Agentic dashboard with tabs for alerts, PNR lifecycle, supplier health
- `TravelOperationsCenter.tsx`: Comprehensive operations dashboard
- `SupplierHealthPulse.tsx`: API latency visualization with pulse indicators
- `TripDetailsDialog.tsx`: Modal for trip details (pattern for BookingDetailPanel)

### Design System
- CSS variables defined in `index.css` with dark mode support
- Glass effects via `vault-glass`, `glass-dark` classes
- Already has product accent colors (flights, hotels, cars, rides, eats)

---

## Part 1: Mission Control Layout

### Component: `MissionControlLayout.tsx`

A new alternative admin layout for power users:

**Visual Features:**
- Deep black background: `bg-[#050505]`
- Glass sidebar: `bg-zinc-900/50 backdrop-blur-xl`
- ZIVO.OPS branding with version indicator
- Integrated API latency widget in sidebar footer
- Sticky header with global status indicators

**Layout Structure:**
```text
+------------------+------------------------------------------+
| ZIVO.OPS         |  [Breadcrumb Path] [Settings] [Avatar]  |
| V2.4 SYSTEM ON   |                                          |
+------------------+------------------------------------------+
| [Dashboard]      |                                          |
| [Live Bookings]  |         MAIN CONTENT AREA                |
| [Inventory]      |         (children rendered here)         |
| [Travelers]      |                                          |
| [Resolutions]  2 |                                          |
+------------------+                                          |
| API LATENCY      |                                          |
| Duffel   124ms   |                                          |
| Hotelbeds 410ms  |                                          |
+------------------+------------------------------------------+
```

**Navigation Items:**
```typescript
const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
  { id: "bookings", icon: Plane, label: "Live Bookings" },
  { id: "inventory", icon: Hotel, label: "Inventory" },
  { id: "customers", icon: Users, label: "Travelers" },
  { id: "issues", icon: AlertCircle, label: "Resolutions", alert: 2 },
];
```

**System Health Widget:**
- Compact API latency display in sidebar footer
- Live pulse indicators from existing `useSupplierHealth` hook
- Color-coded latency bars (green < 200ms, amber 200-400ms, red > 400ms)

---

## Part 2: Booking Ledger Table

### Component: `BookingLedger.tsx`

A premium real-time booking table for operations:

**Visual Features:**
- Dark glass container: `bg-zinc-900/40 backdrop-blur-md`
- Status badges with color-coded backgrounds
- Supplier indicators with colored dots
- Net margin column in green monospace font
- Hover effects revealing row actions

**Table Columns:**
| Column | Content |
|--------|---------|
| Booking Ref | PNR code + relative timestamp |
| Passenger | Full name |
| Service | Route description |
| Supplier | Supplier name with colored dot |
| Status | TICKETED / PENDING / FAILED badge |
| Net Margin | Calculated profit in green |

**Filter Bar:**
- Search input (PNR, email, ticket number)
- Supplier dropdown filter
- Date range picker (optional)

**Row Actions (on hover):**
- Copy PNR to clipboard
- Quick email resend
- Open detail panel

**Status Color Mapping:**
```typescript
const getStatusColor = (status: string) => {
  switch(status) {
    case "TICKETED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "FAILED": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-zinc-800 text-zinc-400";
  }
};
```

---

## Part 3: Booking Detail Panel

### Component: `BookingDetailSlideOver.tsx`

A slide-over panel using Sheet component for booking management:

**Visual Features:**
- Full-height slide-over from right: `w-[480px]`
- Dark glass background: `bg-[#0A0A0A]`
- Status indicator with pulse animation
- PNR data block with copy-on-click

**Panel Sections:**

1. **Header**
   - Booking reference (large)
   - Status with animated pulse dot
   - Download PDF button

2. **PNR Data Block**
   - Airline PNR (selectable text)
   - Ticket Number (selectable text)
   - Supplier reference

3. **Quick Actions Grid**
   - Resend Email (blue accent)
   - Cancel Booking (red accent)
   - Modify Booking (amber)
   - Contact Passenger (gray)

4. **Agent Notes**
   - Textarea for internal notes
   - Auto-save to database
   - Timestamp display

5. **Agentic Check**
   - Pre-flight check before actions
   - "Refund eligibility: Checking..." state
   - Policy compliance indicator

---

## Technical Implementation Details

### Dark Theme CSS Classes

Add to `src/index.css`:
```css
/* Mission Control Theme */
.mission-control {
  --mc-background: #050505;
  --mc-sidebar: rgba(24, 24, 27, 0.5);
  --mc-card: rgba(24, 24, 27, 0.4);
  --mc-border: rgba(255, 255, 255, 0.05);
  --mc-text: #ffffff;
  --mc-text-muted: #71717a;
}

.bg-grid-white\/\[0\.02\] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9H0v9h9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
```

### Data Integration

Hook into existing data:
```typescript
// Use existing hooks
import { useSupplierHealth } from "@/hooks/useSupplierHealth";
import { useFlightSystemHealth } from "@/hooks/useFlightSystemHealth";

// For booking ledger - create new hook
import { useBookingLedger } from "@/hooks/useBookingLedger";
```

### Slide-Over Integration

Use existing Sheet component from Radix:
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Usage
<Sheet open={selectedBooking !== null} onOpenChange={() => setSelectedBooking(null)}>
  <SheetContent side="right" className="w-[480px] bg-[#0A0A0A] p-0">
    <BookingDetailSlideOver booking={selectedBooking} />
  </SheetContent>
</Sheet>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/layouts/MissionControlLayout.tsx` | Alternative dark admin layout |
| `src/components/admin/BookingLedger.tsx` | Real-time booking table |
| `src/components/admin/BookingDetailSlideOver.tsx` | Slide-over panel for booking management |
| `src/components/admin/MissionControlSidebar.tsx` | Extracted sidebar with health widget |
| `src/components/admin/LedgerFilters.tsx` | Filter bar for booking ledger |
| `src/hooks/useBookingLedger.ts` | Hook for fetching booking ledger data |

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add mission control theme classes and grid background |
| `src/components/admin/index.ts` | Export new components |
| `src/App.tsx` | Add optional route using MissionControlLayout |

---

## Implementation Order

### Phase 1: Foundation
1. Add Mission Control CSS theme classes
2. Create `MissionControlLayout.tsx` shell
3. Create `MissionControlSidebar.tsx` with nav and health widget

### Phase 2: Booking Ledger
4. Create `useBookingLedger.ts` hook
5. Create `LedgerFilters.tsx` component
6. Create `BookingLedger.tsx` table component

### Phase 3: Detail Panel
7. Create `BookingDetailSlideOver.tsx` with sections
8. Integrate with Sheet component
9. Add quick actions with agentic pre-checks

### Phase 4: Integration
10. Update exports and add routes
11. Wire up real-time data subscriptions
12. Test with existing FulfillmentHub data

---

## Route Configuration

Add optional Mission Control route:
```typescript
// In App.tsx routing
<Route path="/admin/ops" element={<MissionControlLayout />}>
  <Route index element={<BookingLedger />} />
  <Route path="inventory" element={<InventoryView />} />
  {/* etc */}
</Route>
```

---

## Files Summary

### New Files (6)
| File | Type |
|------|------|
| `src/layouts/MissionControlLayout.tsx` | Layout Component |
| `src/components/admin/BookingLedger.tsx` | Admin Component |
| `src/components/admin/BookingDetailSlideOver.tsx` | Admin Component |
| `src/components/admin/MissionControlSidebar.tsx` | Admin Component |
| `src/components/admin/LedgerFilters.tsx` | Admin Component |
| `src/hooks/useBookingLedger.ts` | Data Hook |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/index.css` | Add mission control theme and grid background |
| `src/components/admin/index.ts` | Export BookingLedger, BookingDetailSlideOver |
| `src/App.tsx` | Add /admin/ops route with MissionControlLayout |

