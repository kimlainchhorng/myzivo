

# Duffel OTA Search Reliability + Admin Debug Tools

## Summary

This plan improves Duffel OTA search reliability by enhancing airport validation, adding sandbox-specific helper suggestions, implementing server-side logging for search diagnostics, and creating an admin debug panel for flight searches.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Airport Autocomplete | Partial | Uses `LocationAutocomplete` with local `airports.ts` dataset. Validation exists but allows free-text fallback. |
| Duffel Integration | Working | Edge function `duffel-flights` with proper API calls. Hook `useDuffelFlights` handles requests. |
| No Results Handling | Basic | Shows generic "No flights available" message via `EmptyResults` component. No sandbox-specific guidance. |
| Search Logging | None | No database logging of Duffel requests/responses for debugging. |
| Admin Debug | Partial | `TravelLogsPage` exists for partner redirects, but no Duffel-specific debug panel. |
| Flexible Dates | None | No date flexibility toggle in search form. |

---

## Implementation Plan

### Phase 1: Strengthen Airport Validation

**Goal:** Ensure only valid IATA codes from autocomplete can be used for search.

#### 1.1 Update FlightSearchFormPro Validation

**File:** `src/components/search/FlightSearchFormPro.tsx`

Modify the `validate()` function to strictly require a valid `LocationOption` selection:

```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  // STRICT: Must have selected airport from autocomplete
  if (!fromOption) {
    newErrors.from = "Please choose an airport from the list.";
  }

  if (!toOption) {
    newErrors.to = "Please choose an airport from the list.";
  }

  // Same origin/destination check
  if (fromOption && toOption && fromOption.value === toOption.value) {
    newErrors.to = "Destination must differ from origin";
  }

  // Date validation...
};
```

Remove the fallback regex matching `fromDisplay.match(/\([A-Z]{3}\)/)` that currently allows free-text entries.

#### 1.2 Update isFormValid Check

Ensure the search button is only enabled when proper `LocationOption` objects are selected:

```typescript
const isFormValid = useMemo(() => {
  const hasFrom = !!fromOption; // Strict - must have selected option
  const hasTo = !!toOption;     // Strict - must have selected option
  const hasDepart = !!departDate;
  const hasReturn = tripType === "oneway" || !!returnDate;
  return hasFrom && hasTo && hasDepart && hasReturn;
}, [fromOption, toOption, departDate, returnDate, tripType]);
```

---

### Phase 2: Sandbox Test Mode Suggestions

**Goal:** When `DUFFEL_ENV = sandbox` and results = 0, show helpful test route suggestions.

#### 2.1 Create Environment Config Helper

**File:** `src/config/duffelConfig.ts` (NEW)

```typescript
/**
 * Duffel Environment Configuration
 * Provides helper routes for sandbox testing
 */

// This is set at build time or from edge function response
export const DUFFEL_SANDBOX_ROUTES = [
  { from: 'LHR', to: 'CDG', label: 'London → Paris' },
  { from: 'SFO', to: 'LAX', label: 'San Francisco → Los Angeles' },
  { from: 'JFK', to: 'BOS', label: 'New York → Boston' },
  { from: 'LAX', to: 'SFO', label: 'Los Angeles → San Francisco' },
  { from: 'LHR', to: 'JFK', label: 'London → New York' },
  { from: 'CDG', to: 'AMS', label: 'Paris → Amsterdam' },
];

export function isSandboxMode(): boolean {
  // Check if we're in sandbox (this would be returned from edge function)
  return import.meta.env.MODE === 'development' || 
         sessionStorage.getItem('duffel_env') === 'sandbox';
}
```

#### 2.2 Create Sandbox Helper Component

**File:** `src/components/flight/SandboxTestHelper.tsx` (NEW)

```typescript
/**
 * SandboxTestHelper Component
 * Shows helpful test route suggestions when in Duffel sandbox mode
 * Only displays when no results and sandbox environment detected
 */

import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DUFFEL_SANDBOX_ROUTES } from "@/config/duffelConfig";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";

interface SandboxTestHelperProps {
  onTryRoute: (origin: string, destination: string) => void;
  className?: string;
}

export default function SandboxTestHelper({ onTryRoute, className }: SandboxTestHelperProps) {
  const navigate = useNavigate();

  const handleQuickSearch = (from: string, to: string) => {
    const departDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const returnDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
    
    const params = new URLSearchParams({
      origin: from,
      dest: to,
      depart: departDate,
      return: returnDate,
      passengers: '1',
      cabin: 'economy',
    });
    
    navigate(`/flights/results?${params.toString()}`);
  };

  return (
    <Alert className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Duffel Sandbox Mode</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          The Duffel sandbox has limited test inventory. Try these routes for reliable results:
        </p>
        <div className="flex flex-wrap gap-2">
          {DUFFEL_SANDBOX_ROUTES.slice(0, 4).map((route) => (
            <Button
              key={`${route.from}-${route.to}`}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch(route.from, route.to)}
              className="gap-2"
            >
              {route.from} <ArrowRight className="w-3 h-3" /> {route.to}
            </Button>
          ))}
        </div>
        <Badge variant="secondary" className="text-xs">
          Sandbox data may not reflect real availability
        </Badge>
      </AlertDescription>
    </Alert>
  );
}
```

#### 2.3 Update NoFlightsFound Component

**File:** `src/components/flight/NoFlightsFound.tsx`

Add sandbox helper banner when in test mode:

```typescript
import SandboxTestHelper from "./SandboxTestHelper";
import { isSandboxMode } from "@/config/duffelConfig";

export default function NoFlightsFound({ ... }) {
  const navigate = useNavigate();
  const showSandboxHelper = isSandboxMode();

  return (
    <Card className="p-8 sm:p-12 text-center">
      {/* Existing icon and message */}
      
      {/* Sandbox Helper Banner - Only in test mode */}
      {showSandboxHelper && (
        <SandboxTestHelper 
          onTryRoute={(from, to) => {
            // Navigate with test route
          }}
          className="mb-6 text-left"
        />
      )}

      {/* Rest of existing component */}
    </Card>
  );
}
```

#### 2.4 Update Duffel Edge Function to Return Environment

**File:** `supabase/functions/duffel-flights/index.ts`

Add environment indicator to response:

```typescript
// At the end of createOfferRequest function
return {
  offer_request_id: offerRequest.id,
  offers: transformOffers(offerRequest.offers || []),
  created_at: offerRequest.created_at,
  environment: Deno.env.get('DUFFEL_ENV') || 'test', // Add this
};
```

---

### Phase 3: Server-Side Search Logging

**Goal:** Log every Duffel search request and response for debugging.

#### 3.1 Create Database Table

**SQL Migration:**

```sql
CREATE TABLE flight_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Search parameters
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  passengers INTEGER NOT NULL DEFAULT 1,
  cabin_class TEXT NOT NULL DEFAULT 'economy',
  
  -- Duffel response
  duffel_request_id TEXT,
  duffel_status_code INTEGER,
  duffel_error TEXT,
  offers_count INTEGER DEFAULT 0,
  
  -- Timing
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Environment
  environment TEXT DEFAULT 'sandbox'
);

-- Index for admin queries
CREATE INDEX idx_flight_search_logs_created ON flight_search_logs(created_at DESC);
CREATE INDEX idx_flight_search_logs_route ON flight_search_logs(origin_iata, destination_iata);
CREATE INDEX idx_flight_search_logs_errors ON flight_search_logs(duffel_error) WHERE duffel_error IS NOT NULL;

-- RLS: Admin-only access
ALTER TABLE flight_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to flight logs"
ON flight_search_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

#### 3.2 Update Duffel Edge Function with Logging

**File:** `supabase/functions/duffel-flights/index.ts`

Add logging after each search:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Add at start of function
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// In createOfferRequest, after Duffel call
async function logSearch(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  requestId?: string;
  statusCode: number;
  error?: string;
  offersCount: number;
  responseTimeMs: number;
}) {
  try {
    await supabase.from('flight_search_logs').insert({
      origin_iata: params.origin,
      destination_iata: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate,
      passengers: params.passengers,
      cabin_class: params.cabinClass,
      duffel_request_id: params.requestId,
      duffel_status_code: params.statusCode,
      duffel_error: params.error,
      offers_count: params.offersCount,
      response_time_ms: params.responseTimeMs,
      environment: Deno.env.get('DUFFEL_ENV') || 'sandbox',
    });
  } catch (err) {
    console.error('[Logging] Failed to log search:', err);
  }
}
```

---

### Phase 4: Admin Flight Debug Panel

**Goal:** Create `/admin/flights/debug` page for diagnosing search issues.

#### 4.1 Create Admin Debug Hook

**File:** `src/hooks/useFlightSearchLogs.ts` (NEW)

```typescript
/**
 * Hook for fetching flight search logs (admin only)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlightSearchLog {
  id: string;
  origin_iata: string;
  destination_iata: string;
  departure_date: string;
  return_date: string | null;
  passengers: number;
  cabin_class: string;
  duffel_request_id: string | null;
  duffel_status_code: number | null;
  duffel_error: string | null;
  offers_count: number;
  response_time_ms: number | null;
  environment: string;
  created_at: string;
}

export function useFlightSearchLogs(limit = 50) {
  return useQuery({
    queryKey: ['flight-search-logs', limit],
    queryFn: async (): Promise<FlightSearchLog[]> => {
      const { data, error } = await supabase
        .from('flight_search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as FlightSearchLog[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useFlightSearchStats() {
  return useQuery({
    queryKey: ['flight-search-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_flight_search_stats');
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
}
```

#### 4.2 Create Admin Debug Page

**File:** `src/pages/admin/FlightDebugPage.tsx` (NEW)

Key features:
- Table showing last 50 searches (origin, dest, dates, passengers, cabin, timestamp)
- Status column: success/failed with offer count
- Error column: Duffel error message if any
- "Replay Search" button (sandbox only) - opens a new search with same params
- Filter by: error status, route, date range
- Stats summary: total searches, success rate, avg response time

#### 4.3 Add Route

**File:** `src/App.tsx`

Add route for admin debug page:

```typescript
{
  path: "/admin/flights/debug",
  element: <FlightDebugPage />,
}
```

---

### Phase 5: Flexible Dates Toggle

**Goal:** Add simple date flexibility suggestion for users.

#### 5.1 Add Flexible Dates Toggle to Search Form

**File:** `src/components/search/FlightSearchFormPro.tsx`

Add a toggle near the date pickers:

```typescript
const [flexibleDates, setFlexibleDates] = useState(false);

// In the dates row
<div className="flex items-center gap-2 mt-2">
  <Switch
    id="flexible-dates"
    checked={flexibleDates}
    onCheckedChange={setFlexibleDates}
  />
  <Label htmlFor="flexible-dates" className="text-xs text-muted-foreground">
    Flexible dates (±3 days)
  </Label>
</div>
```

When enabled, pass `flexible: true` in URL params. Results page can show alternative date suggestions.

#### 5.2 Update Results Page for Flexible Dates

Show alternative date cards when `flexible=true` is in URL:

```typescript
// In FlightResults.tsx
const isFlexibleSearch = searchParams.get('flexible') === 'true';

// After no results or in a sidebar
{isFlexibleSearch && (
  <AlternativeDatesCard
    currentDate={departureDate}
    onSelectDate={(newDate) => {
      // Navigate with new date
    }}
  />
)}
```

---

### Phase 6: Enhanced No Results UI

**Goal:** Improve the empty results experience with actionable options.

#### 6.1 Update EmptyResults Component

**File:** `src/components/results/EmptyResults.tsx`

Add "Try nearby airports" and "Try flexible dates" buttons:

```typescript
{service === "flights" && (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    <Button
      variant="outline"
      onClick={() => onTryNearbyAirports?.()}
      className="gap-2"
    >
      <MapPin className="w-4 h-4" />
      Try nearby airports
    </Button>
    <Button
      variant="outline"
      onClick={() => onTryFlexibleDates?.()}
      className="gap-2"
    >
      <Calendar className="w-4 h-4" />
      Try flexible dates
    </Button>
  </div>
)}
```

These buttons should reopen the edit search modal with modified parameters.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/search/FlightSearchFormPro.tsx` | MODIFY | Strict airport validation, flexible dates toggle |
| `src/config/duffelConfig.ts` | CREATE | Sandbox routes config, environment helper |
| `src/components/flight/SandboxTestHelper.tsx` | CREATE | Test route suggestion component |
| `src/components/flight/NoFlightsFound.tsx` | MODIFY | Add sandbox helper integration |
| `supabase/functions/duffel-flights/index.ts` | MODIFY | Add logging, return environment |
| `src/hooks/useFlightSearchLogs.ts` | CREATE | Admin log fetching hook |
| `src/pages/admin/FlightDebugPage.tsx` | CREATE | Admin debug dashboard |
| `src/components/results/EmptyResults.tsx` | MODIFY | Add actionable buttons for flights |
| `src/App.tsx` | MODIFY | Add admin debug route |
| **Database Migration** | CREATE | `flight_search_logs` table with RLS |

---

## Database Migration

```sql
-- New table for flight search logging
CREATE TABLE flight_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  passengers INTEGER NOT NULL DEFAULT 1,
  cabin_class TEXT NOT NULL DEFAULT 'economy',
  duffel_request_id TEXT,
  duffel_status_code INTEGER,
  duffel_error TEXT,
  offers_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  environment TEXT DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flight_search_logs_created ON flight_search_logs(created_at DESC);
CREATE INDEX idx_flight_search_logs_route ON flight_search_logs(origin_iata, destination_iata);

-- RLS: Admin-only
ALTER TABLE flight_search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to flight logs"
ON flight_search_logs FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));
```

---

## Security Checklist

1. **Duffel API Key** - Only in edge function (server-side)
2. **No API URLs exposed** - All calls go through edge function
3. **Admin-only debug access** - RLS enforced on logs table
4. **No affiliate fallback** - OTA mode remains locked

---

## Testing Requirements

1. **Airport Validation**
   - Verify free-text entries are blocked
   - Confirm "Please choose an airport from the list" error shows
   - Test autocomplete selection works correctly

2. **Sandbox Helper**
   - Verify banner only shows in sandbox mode
   - Test quick search buttons navigate correctly
   - Confirm no affiliate language appears

3. **Logging**
   - Trigger searches and verify logs appear in database
   - Check error cases are logged with messages
   - Verify response times are captured

4. **Admin Debug Panel**
   - Access `/admin/flights/debug` as admin
   - Verify log table displays correctly
   - Test "Replay Search" button functionality

