

# ZIVO Flights Integration - Phase 2: Data & Admin Completion

## Summary

Complete the remaining OTA integration tasks: connect My Trips Dashboard to real booking data, enhance Admin Panel with ticketing controls, update TrendingDealsSection for OTA model, and clean up legacy branding.

---

## Phase 1: Connect MyTripsDashboard to Real Data

**File: `src/components/flight/MyTripsDashboard.tsx`**

### Current State
- Uses `MOCK_TRIPS` array (lines 88-180) with hardcoded demo data
- Already imports `useFlightBookings` from hook but doesn't use it
- Interface matches database structure partially

### Changes Required

1. **Remove MOCK_TRIPS array** (lines 88-180)

2. **Use real `useFlightBookings()` hook** in component:
```typescript
const { data: bookings, isLoading, error } = useFlightBookings();
```

3. **Map database records to Trip interface**:
```typescript
const trips: Trip[] = useMemo(() => {
  if (!bookings) return [];
  return bookings.map(booking => ({
    id: booking.id,
    bookingRef: booking.booking_reference,
    status: mapBookingStatus(booking),
    ticketingStatus: booking.ticketing_status,
    pnr: booking.pnr,
    ticketNumbers: booking.ticket_numbers as string[],
    route: {
      origin: getAirportCity(booking.origin),
      originCode: booking.origin || '',
      destination: getAirportCity(booking.destination),
      destCode: booking.destination || '',
    },
    departureDate: new Date(booking.departure_date || booking.created_at),
    returnDate: booking.return_date ? new Date(booking.return_date) : undefined,
    airline: 'Multiple Airlines', // Would need to store in DB or fetch
    airlineCode: 'ML',
    flightNumber: booking.flight_id?.slice(0, 8) || '',
    passengers: booking.total_passengers,
    totalAmount: booking.total_amount,
    boardingPassAvailable: booking.ticketing_status === 'issued',
    fareClass: (booking.cabin_class || 'economy') as any,
    isRealPrice: true,
  }));
}, [bookings]);
```

4. **Add loading and empty states**:
```typescript
if (isLoading) return <LoadingState />;
if (!bookings?.length) return <EmptyTripsState />;
```

5. **Add "Request Refund" action** for eligible bookings:
```typescript
{canRequestRefund(booking) && (
  <DropdownMenuItem onClick={() => onRequestRefund?.(trip)}>
    <CreditCard className="w-4 h-4 mr-2" />
    Request Refund
  </DropdownMenuItem>
)}
```

6. **Display PNR and Ticket Numbers** in expanded view when available

---

## Phase 2: Enhance Admin Flight Management

**File: `src/components/admin/AdminFlightManagement.tsx`**

### Current State
- Has Flights, Bookings, Airlines tabs
- Bookings table shows basic status (confirmed/pending/cancelled)
- Missing: ticketing_status, PNR, ticket_numbers, retry/refund actions

### Changes Required

1. **Update FlightBooking type** to include new fields:
```typescript
type FlightBooking = {
  // existing...
  ticketing_status: string | null;
  pnr: string | null;
  ticket_numbers: string[] | null;
  payment_status: string | null;
  refund_status: string | null;
  origin: string | null;
  destination: string | null;
};
```

2. **Add "Ticketing" tab** for ticketing logs:
```typescript
<TabsTrigger value="ticketing" className="gap-2">
  <Ticket className="h-4 w-4" />
  Ticketing Logs
</TabsTrigger>
```

3. **Add ticketing status column** to Bookings table:
```typescript
<TableHead>Ticketing</TableHead>
// ...
<TableCell>{getTicketingBadge(booking.ticketing_status)}</TableCell>
```

4. **Create getTicketingBadge helper**:
```typescript
const getTicketingBadge = (status: string | null) => {
  switch (status) {
    case 'issued':
      return <Badge className="bg-emerald-500/10 text-emerald-500">Issued</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>;
    case 'failed':
      return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
    case 'pending':
      return <Badge className="bg-amber-500/10 text-amber-500">Pending</Badge>;
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>;
  }
};
```

5. **Add admin actions**:
```typescript
<DropdownMenuItem onClick={() => handleRetryTicketing(booking.id)}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Retry Ticketing
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleProcessRefund(booking.id)}>
  <CreditCard className="h-4 w-4 mr-2" />
  Process Refund
</DropdownMenuItem>
```

6. **Add mutations for admin actions**:
```typescript
const retryTicketing = useMutation({
  mutationFn: async (bookingId: string) => {
    const { error } = await supabase.functions.invoke('issue-flight-ticket', {
      body: { bookingId },
    });
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success('Ticketing retry initiated');
    queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
  },
});

const processRefund = useMutation({
  mutationFn: async (bookingId: string) => {
    const { error } = await supabase.functions.invoke('process-flight-refund', {
      body: { bookingId, action: 'process', reason: 'Admin processed' },
    });
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success('Refund processed');
    queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
  },
});
```

7. **Add Ticketing Logs query and tab content**:
```typescript
const { data: ticketingLogs } = useQuery({
  queryKey: ['admin-ticketing-logs'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('flight_ticketing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  },
});
```

---

## Phase 3: Update TrendingDealsSection

**File: `src/components/monetization/TrendingDealsSection.tsx`**

### Current State
- Uses affiliate tracking (`trackAffiliateClick`)
- Opens external URL via `window.open`
- Shows "indicative" price disclaimer

### Changes Required

1. **Update for OTA model** - navigate to internal search:
```typescript
const handleDealClick = (deal: TrendingDeal) => {
  // Internal navigation for OTA model
  const params = new URLSearchParams({
    origin: deal.fromCode,
    dest: deal.toCode,
  });
  navigate(`/flights/results?${params.toString()}`);
};
```

2. **Remove affiliate tracking imports**:
```typescript
// REMOVE: import { trackAffiliateClick } from "@/lib/affiliateTracking";
// REMOVE: import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
```

3. **Update CTA button**:
```typescript
<Button onClick={() => handleDealClick(deal)}>
  Search Flights
  <ArrowRight className="w-3 h-3" />  // Not ExternalLink
</Button>
```

4. **Update footer disclaimer**:
```typescript
<p className="text-[9px] text-muted-foreground mt-2">
  *Prices shown are examples. Final prices confirmed at checkout.
</p>
// REMOVE: "ZIVO may earn a commission from bookings."
```

---

## Phase 4: Branding Cleanup (Hizivo → ZIVO)

### Files with Hizivo/Hizovo References (105 files total)

**High Priority Files** (user-facing):

| File | Changes |
|------|---------|
| `src/pages/app/hizovo/HizovoHome.tsx` | Rename component, update branding |
| `src/components/shared/GlobalTrustBar.tsx` | "Hizivo does not issue..." → ZIVO MoR text |
| `src/components/cross-sell/TravelCrossSell.tsx` | `hizovo.com` → `hizivo.com` or remove |
| `src/pages/legal/PartnerDisclosure.tsx` | Update all Hizivo references |
| `src/components/Footer.tsx` | Already updated, verify |
| `src/components/app/HizovoAppLayout.tsx` | Rename to ZivoAppLayout |

**Pattern to Replace**:
- "Hizivo" → "ZIVO"
- "Hizovo" → "ZIVO"  
- "hizovo.com" → "hizivo.com" (or actual domain)
- "Hizivo does not issue tickets" → "ZIVO sells tickets as a sub-agent..."

**Note**: This is a large-scale change across 105 files. Recommend doing this as a separate batch operation.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/flight/MyTripsDashboard.tsx` | MODIFY | Connect to real booking data |
| `src/components/admin/AdminFlightManagement.tsx` | MODIFY | Add ticketing status, logs tab, admin actions |
| `src/components/monetization/TrendingDealsSection.tsx` | MODIFY | Remove affiliate tracking, use internal navigation |
| `src/components/shared/GlobalTrustBar.tsx` | MODIFY | Update to MoR language |
| Multiple files (105) | MODIFY | Branding cleanup (Hizivo → ZIVO) |

---

## Post-Implementation Verification

1. Navigate to My Trips - verify real bookings display (or empty state if none)
2. Admin Panel - verify ticketing status column shows for each booking
3. Admin Panel - test Retry Ticketing and Process Refund buttons
4. Admin Panel - verify Ticketing Logs tab shows API call history
5. TrendingDealsSection - verify internal navigation (no external redirect)
6. Search for "Hizivo" in codebase - confirm all replaced with "ZIVO"
7. Flight checkout flow - complete test booking to verify data flows to My Trips

---

## Technical Notes

### Database Fields Available

From `flight_bookings` table:
- `booking_reference` ✓
- `pnr` ✓
- `ticketing_status` ✓
- `ticket_numbers` (JSON) ✓
- `origin` ✓
- `destination` ✓
- `departure_date` ✓
- `return_date` ✓
- `total_amount` ✓
- `total_passengers` ✓
- `cabin_class` ✓
- `payment_status` ✓
- `refund_status` ✓

### Hook Already Available

`useFlightBookings()` - returns user's bookings from database
`useRequestFlightRefund()` - mutation for refund requests
`canRequestRefund()` - helper to check eligibility
`getTicketingStatusInfo()` - status display helper

