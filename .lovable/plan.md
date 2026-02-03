

# LIVE Switch, Launch Guardrails & Public Readiness Lock for ZIVO Flights

## Summary

This plan implements a controlled TEST → LIVE switch for ZIVO Flights, allowing safe transition from Duffel sandbox to production while enforcing pre-launch requirements, blocking public bookings in TEST mode, and enabling post-launch monitoring.

---

## Current State Analysis

| Requirement | Status | Details |
|-------------|--------|---------|
| **Global FLIGHTS_STATUS config** | Missing | Only `FLIGHTS_MODE` (OTA vs Affiliate) exists |
| **Duffel environment detection** | Exists | `duffelConfig.ts` has `isSandboxMode()` / `isLiveMode()` |
| **Public booking block in TEST** | Missing | Anyone can currently checkout in sandbox |
| **Pre-LIVE checklist** | Exists (for cars) | `beta_launch_checklist` table pattern can be adapted |
| **Admin LIVE switch UI** | Missing | Need dedicated flights launch control page |
| **Launch confirmation modal** | Missing | No safety confirmation before going live |
| **Post-launch monitoring** | Partial | `FlightStatusPage` shows stats but no first-booking alerts |

---

## Implementation Plan

### Phase 1: Create Flights Launch Settings Types & Database

**Goal:** Define a dedicated flights launch configuration table and types.

**File:** `src/types/flightsLaunch.ts` (NEW)

```typescript
/**
 * Flights Launch Settings Types
 * Types for the Flights TEST → LIVE launch system
 */

export type FlightsLaunchStatus = 'test' | 'live';

export interface FlightsLaunchSettings {
  id: string;
  status: FlightsLaunchStatus;
  status_changed_at: string | null;
  status_changed_by: string | null;
  
  // Pre-launch checklist
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
  
  // Post-launch tracking
  first_booking_at: string | null;
  first_ticket_issued_at: string | null;
  first_failure_at: string | null;
  
  // Emergency controls
  emergency_pause: boolean;
  emergency_pause_reason: string | null;
  emergency_pause_at: string | null;
  emergency_pause_by: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface FlightsLaunchChecklist {
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
}

export interface FlightsGoLivePayload {
  status: 'live';
  status_changed_at: string;
  status_changed_by: string;
}
```

**Database:** Create `flights_launch_settings` table

```sql
CREATE TABLE public.flights_launch_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'test' CHECK (status IN ('test', 'live')),
  status_changed_at TIMESTAMPTZ,
  status_changed_by UUID REFERENCES auth.users(id),
  
  -- Pre-launch checklist
  seller_of_travel_verified BOOLEAN DEFAULT false,
  terms_privacy_linked BOOLEAN DEFAULT false,
  support_email_configured BOOLEAN DEFAULT false,
  stripe_live_enabled BOOLEAN DEFAULT false,
  duffel_live_configured BOOLEAN DEFAULT false,
  
  -- Post-launch tracking
  first_booking_at TIMESTAMPTZ,
  first_ticket_issued_at TIMESTAMPTZ,
  first_failure_at TIMESTAMPTZ,
  
  -- Emergency controls
  emergency_pause BOOLEAN DEFAULT false,
  emergency_pause_reason TEXT,
  emergency_pause_at TIMESTAMPTZ,
  emergency_pause_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admins only for write, all can read
ALTER TABLE public.flights_launch_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read flight launch settings"
ON public.flights_launch_settings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update flight launch settings"
ON public.flights_launch_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.flights_launch_settings (id) VALUES (gen_random_uuid());
```

---

### Phase 2: Create Flights Launch Status Hook

**Goal:** Provide React hooks to read and update flights launch status.

**File:** `src/hooks/useFlightsLaunchStatus.ts` (NEW)

```typescript
/**
 * Flights Launch Status Hooks
 * Read and update flights TEST/LIVE status with pre-launch checklist validation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { FlightsLaunchSettings, FlightsLaunchChecklist } from "@/types/flightsLaunch";

export function useFlightsLaunchSettings() {
  return useQuery({
    queryKey: ["flights-launch-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights_launch_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as unknown as FlightsLaunchSettings;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useFlightsCanBook() {
  const { data: settings, isLoading } = useFlightsLaunchSettings();
  const { isAdmin } = useAuth();

  // Admins can always book (for testing)
  // Public users can only book when status is 'live'
  const canBook = isAdmin || settings?.status === 'live';
  const isTestMode = settings?.status === 'test';
  const isPaused = settings?.emergency_pause === true;

  return {
    canBook: canBook && !isPaused,
    isTestMode,
    isPaused,
    pauseReason: settings?.emergency_pause_reason,
    isLoading,
  };
}

export function useGoLive() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settingsId: string) => {
      const { error } = await supabase
        .from("flights_launch_settings")
        .update({
          status: 'live',
          status_changed_at: new Date().toISOString(),
          status_changed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
      toast.success("🚀 ZIVO Flights is now LIVE!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to go live");
    },
  });
}

export function useEmergencyPause() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ settingsId, pause, reason }: { 
      settingsId: string; 
      pause: boolean; 
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("flights_launch_settings")
        .update({
          emergency_pause: pause,
          emergency_pause_reason: pause ? reason : null,
          emergency_pause_at: pause ? new Date().toISOString() : null,
          emergency_pause_by: pause ? user?.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (error) throw error;
    },
    onSuccess: (_, { pause }) => {
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
      toast[pause ? 'warning' : 'success'](
        pause ? "⚠️ Flight bookings paused" : "✅ Flight bookings resumed"
      );
    },
  });
}

// Validate pre-launch checklist
export function validateLaunchChecklist(settings: FlightsLaunchSettings | undefined): {
  ready: boolean;
  checklist: { item: string; done: boolean }[];
  blockers: string[];
} {
  if (!settings) {
    return { ready: false, checklist: [], blockers: ['Settings not loaded'] };
  }

  const checklist = [
    { item: 'Seller of Travel page verified', done: settings.seller_of_travel_verified },
    { item: 'Terms & Privacy linked', done: settings.terms_privacy_linked },
    { item: 'Support email configured', done: settings.support_email_configured },
    { item: 'Stripe LIVE enabled', done: settings.stripe_live_enabled },
    { item: 'Duffel LIVE configured', done: settings.duffel_live_configured },
  ];

  const blockers = checklist.filter(c => !c.done).map(c => c.item);

  return {
    ready: blockers.length === 0,
    checklist,
    blockers,
  };
}
```

---

### Phase 3: Update Checkout to Block Public Users in TEST Mode

**Goal:** Prevent public users from completing checkout when flights are in TEST mode.

**File:** `src/pages/FlightCheckout.tsx` (MODIFY)

Add booking permission check at the top of the component:

```typescript
import { useFlightsCanBook } from '@/hooks/useFlightsLaunchStatus';

const FlightCheckout = () => {
  // ... existing code ...
  
  const { canBook, isTestMode, isPaused, pauseReason, isLoading: bookingCheckLoading } = useFlightsCanBook();
  const { isAdmin } = useAuth();

  // Block public users in TEST mode
  if (!bookingCheckLoading && !canBook) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Bookings Coming Soon – ZIVO" description="Flight bookings will open soon." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                {isPaused ? (
                  <>
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Bookings Temporarily Paused</h1>
                    <p className="text-muted-foreground mb-6">
                      {pauseReason || "Flight bookings are temporarily paused. Please try again later."}
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Bookings Coming Soon</h1>
                    <p className="text-muted-foreground mb-6">
                      Flights are in beta testing. Bookings will open soon.
                    </p>
                  </>
                )}
                <Button onClick={() => navigate('/flights')} className="gap-2">
                  <Plane className="w-4 h-4" />
                  Browse Flights
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ... rest of existing checkout code ...
};
```

Also update `FlightTravelerInfo.tsx` with the same check before proceeding to checkout.

---

### Phase 4: Create Flights Launch Control Admin Page

**Goal:** Admin-only page to manage TEST/LIVE switch with pre-launch checklist.

**File:** `src/pages/admin/FlightsLaunchControl.tsx` (NEW)

```typescript
/**
 * Flights Launch Control - Admin Dashboard
 * Manage TEST → LIVE transition with pre-launch checklist
 */

import { useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useFlightsLaunchSettings, 
  useGoLive, 
  useEmergencyPause,
  validateLaunchChecklist 
} from "@/hooks/useFlightsLaunchStatus";
import {
  Plane, Shield, CheckCircle, XCircle, AlertTriangle,
  Rocket, Pause, Play, Loader2, FileText, Mail, CreditCard
} from "lucide-react";
import { format } from "date-fns";

const FlightsLaunchControl = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: settings, isLoading } = useFlightsLaunchSettings();
  const goLive = useGoLive();
  const emergencyPause = useEmergencyPause();
  
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  
  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Navigate to="/flights" replace />;
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { ready, checklist, blockers } = validateLaunchChecklist(settings);
  const isLive = settings?.status === 'live';
  const isPaused = settings?.emergency_pause;

  const handleGoLive = async () => {
    if (!settings?.id || !ready) return;
    await goLive.mutateAsync(settings.id);
    setShowGoLiveModal(false);
    setConfirmChecked(false);
  };

  const handlePauseToggle = async () => {
    if (!settings?.id) return;
    await emergencyPause.mutateAsync({
      settingsId: settings.id,
      pause: !isPaused,
      reason: pauseReason,
    });
    setPauseReason("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Flights Launch Control | Admin" description="Manage ZIVO Flights TEST/LIVE status." />
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Plane className="w-6 h-6 text-primary" />
                Flights Launch Control
              </h1>
              <p className="text-muted-foreground">Manage TEST → LIVE transition</p>
            </div>
            <Badge 
              variant={isLive ? "default" : "outline"}
              className={isLive 
                ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" 
                : "bg-amber-500/20 text-amber-600 border-amber-500/30"
              }
            >
              {isLive ? 'LIVE' : 'TEST MODE'}
            </Badge>
          </div>

          {/* Emergency Pause Banner */}
          {isPaused && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Emergency Pause Active:</strong> {settings?.emergency_pause_reason || "Bookings are paused"}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-xl font-bold">{isLive ? 'LIVE' : 'TEST'}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Last Changed</p>
                  <p className="text-sm font-medium">
                    {settings?.status_changed_at 
                      ? format(new Date(settings.status_changed_at), 'MMM d, yyyy HH:mm')
                      : 'Never'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Public Booking</p>
                  <p className="text-xl font-bold text-emerald-500">
                    {isLive && !isPaused ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pre-Launch Checklist */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Pre-Launch Checklist
              </CardTitle>
              <CardDescription>
                All items must be verified before going LIVE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {item.done ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span>{item.item}</span>
                    </div>
                    {/* Admin can toggle checklist items */}
                  </div>
                ))}
              </div>

              {ready ? (
                <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All requirements met - Ready for LIVE
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {blockers.length} item(s) remaining before LIVE
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              {!isLive ? (
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => setShowGoLiveModal(true)}
                  disabled={!ready}
                >
                  <Rocket className="w-5 h-5" />
                  Go LIVE
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={isPaused ? "default" : "destructive"}
                  className="w-full gap-2"
                  onClick={handlePauseToggle}
                  disabled={emergencyPause.isPending}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      Resume Bookings
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Emergency Pause
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Go LIVE Confirmation Modal */}
      <Dialog open={showGoLiveModal} onOpenChange={setShowGoLiveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Go LIVE Confirmation
            </DialogTitle>
            <DialogDescription>
              This will enable real airline bookings and real payments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. Real customers will be able to book flights and pay with real money.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              <Checkbox
                id="confirm-live"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(checked === true)}
              />
              <Label htmlFor="confirm-live" className="leading-relaxed cursor-pointer">
                I understand this will enable real bookings, real payments, and real airline ticket issuance. I have verified all checklist items.
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoLiveModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGoLive}
              disabled={!confirmChecked || goLive.isPending}
              className="gap-2"
            >
              {goLive.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Going LIVE...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Confirm Go LIVE
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FlightsLaunchControl;
```

---

### Phase 5: Add Post-Launch Monitoring & Alerts

**Goal:** Track first booking, first ticket, first failure after going LIVE.

**File:** `supabase/functions/issue-flight-ticket/index.ts` (MODIFY)

Add post-launch event tracking:

```typescript
// After successful ticket issuance:
// Check if this is the first ticket after go-live
const { data: launchSettings } = await supabase
  .from("flights_launch_settings")
  .select("first_ticket_issued_at")
  .limit(1)
  .single();

if (!launchSettings?.first_ticket_issued_at) {
  await supabase
    .from("flights_launch_settings")
    .update({ first_ticket_issued_at: new Date().toISOString() })
    .neq("first_ticket_issued_at", null); // Only update if null

  // Create admin alert for first ticket
  await supabase
    .from("flight_admin_alerts")
    .insert({
      alert_type: "first_ticket_issued",
      severity: "low",
      message: `🎉 First LIVE ticket issued! Booking: ${bookingRef}`,
      booking_id: bookingId,
    });
}

// On failure:
if (!launchSettings?.first_failure_at && isLiveMode) {
  await supabase
    .from("flights_launch_settings")
    .update({ first_failure_at: new Date().toISOString() })
    .is("first_failure_at", null);

  await supabase
    .from("flight_admin_alerts")
    .insert({
      alert_type: "first_live_failure",
      severity: "critical",
      message: `⚠️ First LIVE failure! Booking: ${bookingRef} - ${error}`,
      booking_id: bookingId,
    });
}
```

---

### Phase 6: Update Edge Functions for LIVE Mode Enforcement

**Goal:** Ensure edge functions respect launch status.

**File:** `supabase/functions/create-flight-checkout/index.ts` (MODIFY)

Add launch status check before processing:

```typescript
// Check flights launch status
const { data: launchSettings } = await supabase
  .from("flights_launch_settings")
  .select("status, emergency_pause")
  .limit(1)
  .single();

// Check if user is admin (can bypass test mode)
const { data: isAdminData } = await supabase.rpc("has_role", {
  _user_id: userId,
  _role: "admin",
});
const isAdmin = isAdminData === true;

// Block non-admins in TEST mode
if (launchSettings?.status === 'test' && !isAdmin) {
  throw new Error("Flight bookings are not yet available. Check back soon!");
}

// Block all bookings if emergency paused
if (launchSettings?.emergency_pause) {
  throw new Error("Flight bookings are temporarily paused. Please try again later.");
}

// Track first booking if this is LIVE mode
if (launchSettings?.status === 'live') {
  const { data: existing } = await supabase
    .from("flights_launch_settings")
    .select("first_booking_at")
    .limit(1)
    .single();

  if (!existing?.first_booking_at) {
    await supabase
      .from("flights_launch_settings")
      .update({ first_booking_at: new Date().toISOString() })
      .is("first_booking_at", null);
  }
}
```

---

### Phase 7: Add Route to App.tsx

**File:** `src/App.tsx` (MODIFY)

Add route for the new admin page:

```typescript
import FlightsLaunchControl from "@/pages/admin/FlightsLaunchControl";

// In routes:
<Route path="/admin/flights/launch" element={<FlightsLaunchControl />} />
```

---

### Phase 8: Update FlightStatusPage with Launch Control Link

**File:** `src/pages/admin/FlightStatusPage.tsx` (MODIFY)

Add navigation to launch control:

```typescript
// In header buttons:
<Button variant="outline" asChild className="gap-2">
  <Link to="/admin/flights/launch">
    <Rocket className="w-4 h-4" />
    Launch Control
  </Link>
</Button>
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/flightsLaunch.ts` | CREATE | Types for flights launch settings |
| `src/hooks/useFlightsLaunchStatus.ts` | CREATE | Hooks for reading/updating launch status |
| `src/pages/admin/FlightsLaunchControl.tsx` | CREATE | Admin page for TEST/LIVE switch |
| `src/pages/FlightCheckout.tsx` | MODIFY | Block public users in TEST mode |
| `src/pages/FlightTravelerInfo.tsx` | MODIFY | Block public users in TEST mode |
| `supabase/functions/create-flight-checkout/index.ts` | MODIFY | Server-side launch status enforcement |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Post-launch event tracking |
| `src/pages/admin/FlightStatusPage.tsx` | MODIFY | Add launch control link |
| `src/App.tsx` | MODIFY | Add launch control route |

---

## Database Changes

Create `flights_launch_settings` table with:
- Status (test/live)
- Pre-launch checklist booleans
- Post-launch tracking timestamps
- Emergency pause controls
- RLS policies for admin-only writes

---

## LIVE Mode Rules Summary

| Rule | TEST Mode | LIVE Mode |
|------|-----------|-----------|
| Public search | ✅ Enabled | ✅ Enabled |
| Public booking | ❌ Blocked | ✅ Enabled |
| Admin booking | ✅ Enabled | ✅ Enabled |
| Sandbox helpers | ✅ Visible | ❌ Hidden |
| Test routes | ✅ Available | ❌ Hidden |
| Stripe mode | Test | Live |
| Duffel mode | Sandbox | Live |
| Offer verification | Skipped | Enforced |
| Strict validation | Relaxed | Enforced |

---

## Pre-Launch Checklist Items

1. Seller of Travel page exists (`/legal/seller-of-travel`)
2. Terms & Privacy pages linked and accessible
3. Support email configured (`support@hizivo.com`)
4. Stripe LIVE keys configured
5. Duffel LIVE API key configured

---

## Post-Launch Monitoring Events

| Event | Trigger | Alert Level |
|-------|---------|-------------|
| First LIVE booking | First checkout in LIVE mode | Info |
| First LIVE ticket | First successful ticket issuance | Info |
| First LIVE failure | First ticketing failure in LIVE | Critical |

---

## Testing Checklist

1. **TEST Mode (Public User)**
   - [ ] Can search flights
   - [ ] Cannot proceed past traveler info
   - [ ] Sees "Bookings Coming Soon" message

2. **TEST Mode (Admin)**
   - [ ] Can search flights
   - [ ] Can complete checkout
   - [ ] Can test full booking flow

3. **Launch Control Page**
   - [ ] Shows pre-launch checklist
   - [ ] Blocks Go LIVE until all items checked
   - [ ] Shows confirmation modal with checkbox
   - [ ] Updates status after confirmation

4. **LIVE Mode**
   - [ ] Public users can book
   - [ ] First booking event recorded
   - [ ] First ticket event recorded
   - [ ] Emergency pause works

5. **Emergency Pause**
   - [ ] Blocks all new bookings
   - [ ] Shows pause reason to users
   - [ ] Resume re-enables bookings

