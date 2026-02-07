
# Rider Ride Status Notifications

## Summary

Add real-time status change notifications with visual banners and sound/vibration feedback on key transitions. Banners display at the top of ride pages with status-specific messaging, while notification sounds and haptic feedback provide alerts for `assigned` and `arrived` events.

---

## Current Behavior

| Feature | Current | Issue |
|---------|---------|-------|
| Status updates | Toast notifications only | No persistent visual feedback |
| Sound feedback | Driver/restaurant side only | Rider has no audio alerts |
| Vibration | Available via `useNativeFeatures` | Not triggered on status changes |
| Status banners | Only on `arrived` in DriverPage | Missing for other statuses |

---

## Implementation Approach

### 1. Create `useRideStatusNotifications` Hook

Central hook that:
- Listens for status changes from `RideStore`
- Plays sound via `useNotificationSound`
- Triggers haptic feedback via `useNativeFeatures`
- Manages notification banner state

### 2. Create `RideStatusBanner` Component

Animated banner component that shows status-specific messages:
- `assigned` → "Driver is on the way"
- `arrived` → "Driver has arrived"  
- `in_trip` → "Trip started"
- `completed` → "Trip completed"

### 3. Add Sound/Vibration Triggers

On `assigned` and `arrived`:
- Play `statusUpdate` sound
- Trigger haptic `notification(success)`

### 4. Integrate into Ride Pages

Add banner component to:
- `RideSearchingPage.tsx` (assigned)
- `RideDriverPage.tsx` (arrived)
- `RideTripPage.tsx` (in_trip, completed)

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useRideStatusNotifications.ts` | Create | Hook for status change detection + alerts |
| `src/components/ride/RideStatusBanner.tsx` | Create | Animated status banner component |
| `src/hooks/useRideRealtime.ts` | Modify | Add onStatusChangeWithNotify callback |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Integrate banner + sound/haptic |
| `src/pages/ride/RideDriverPage.tsx` | Modify | Integrate banner + sound/haptic |
| `src/pages/ride/RideTripPage.tsx` | Modify | Integrate banner |

---

## Technical Details

### New Hook: `useRideStatusNotifications`

```typescript
import { useEffect, useRef, useCallback, useState } from "react";
import { useRideStore } from "@/stores/rideStore";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import { RideStatus } from "@/types/rideTypes";

interface StatusNotification {
  status: RideStatus;
  message: string;
  subMessage?: string;
  type: "info" | "success" | "warning";
}

const STATUS_MESSAGES: Record<string, StatusNotification> = {
  assigned: {
    status: "assigned",
    message: "Driver is on the way",
    subMessage: "Your driver has accepted the ride",
    type: "info",
  },
  arrived: {
    status: "arrived",
    message: "Driver has arrived",
    subMessage: "Please meet your driver at the pickup location",
    type: "success",
  },
  in_trip: {
    status: "in_trip",
    message: "Trip started",
    subMessage: "Enjoy your ride",
    type: "info",
  },
  completed: {
    status: "completed",
    message: "Trip completed",
    subMessage: "Thank you for riding with ZIVO",
    type: "success",
  },
};

export const useRideStatusNotifications = () => {
  const { state } = useRideStore();
  const { playStatusUpdateSound } = useNotificationSound();
  const { hapticNotification, isNative } = useNativeFeatures();
  const prevStatusRef = useRef<RideStatus | null>(null);
  const [activeNotification, setActiveNotification] = useState<StatusNotification | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const triggerNotification = useCallback((status: RideStatus) => {
    const notification = STATUS_MESSAGES[status];
    if (!notification) return;

    setActiveNotification(notification);
    setShowBanner(true);

    // Play sound for assigned and arrived
    if (status === "assigned" || status === "arrived") {
      playStatusUpdateSound();
      hapticNotification("success");
    }

    // Auto-hide banner after 5 seconds (except for arrived which persists)
    if (status !== "arrived") {
      setTimeout(() => setShowBanner(false), 5000);
    }
  }, [playStatusUpdateSound, hapticNotification]);

  // Monitor status changes
  useEffect(() => {
    if (prevStatusRef.current !== state.status && state.status !== "idle") {
      triggerNotification(state.status);
    }
    prevStatusRef.current = state.status;
  }, [state.status, triggerNotification]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  return {
    activeNotification,
    showBanner,
    dismissBanner,
  };
};
```

### New Component: `RideStatusBanner`

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { Car, Check, Navigation, Clock, X } from "lucide-react";
import { RideStatus } from "@/types/rideTypes";

interface RideStatusBannerProps {
  status: RideStatus;
  message: string;
  subMessage?: string;
  isVisible: boolean;
  onDismiss?: () => void;
  persistent?: boolean;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  assigned: Car,
  arrived: Check,
  in_trip: Navigation,
  completed: Check,
};

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-primary",
  arrived: "bg-green-500",
  in_trip: "bg-blue-500",
  completed: "bg-green-500",
};

const RideStatusBanner = ({
  status,
  message,
  subMessage,
  isVisible,
  onDismiss,
  persistent = false,
}: RideStatusBannerProps) => {
  const Icon = STATUS_ICONS[status] || Car;
  const bgColor = STATUS_COLORS[status] || "bg-primary";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white safe-top`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{message}</p>
                {subMessage && (
                  <p className="text-sm text-white/80">{subMessage}</p>
                )}
              </div>
            </div>
            {!persistent && onDismiss && (
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RideStatusBanner;
```

### Integration: `useRideRealtime.ts`

Add sound/haptic triggers directly in the existing `handleStatusChange`:

```typescript
// At top of file
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";

// In hook
const { playStatusUpdateSound } = useNotificationSound();
const { hapticNotification } = useNativeFeatures();

// In handleStatusChange callback
const handleStatusChange = useCallback(
  (newStatus: RideStatus, dbStatus: string) => {
    console.log(`[Realtime] Status changed: ${dbStatus} → ${newStatus}`);
    
    // Update store with new status
    setStatus(newStatus);
    
    // Play sound and haptic for key status changes
    if (newStatus === "assigned" || newStatus === "arrived") {
      playStatusUpdateSound();
      hapticNotification("success");
    }

    // Handle navigation based on status
    switch (newStatus) {
      // ... existing switch cases
    }
  },
  [navigate, setStatus, playStatusUpdateSound, hapticNotification]
);
```

### Page Integrations

**RideSearchingPage.tsx:**
```typescript
import RideStatusBanner from "@/components/ride/RideStatusBanner";
import { useRideStatusNotifications } from "@/hooks/useRideStatusNotifications";

// In component
const { activeNotification, showBanner, dismissBanner } = useRideStatusNotifications();

// In JSX
{activeNotification && activeNotification.status === "assigned" && (
  <RideStatusBanner
    status={activeNotification.status}
    message={activeNotification.message}
    subMessage={activeNotification.subMessage}
    isVisible={showBanner}
    onDismiss={dismissBanner}
  />
)}
```

**RideDriverPage.tsx:**
Already has the arrival banner - add sound/haptic trigger for `arrived` status.

**RideTripPage.tsx:**
```typescript
// Add in_trip and completed banners
{activeNotification && (
  <RideStatusBanner
    status={activeNotification.status}
    message={activeNotification.message}
    subMessage={activeNotification.subMessage}
    isVisible={showBanner && ["in_trip", "completed"].includes(activeNotification.status)}
    onDismiss={dismissBanner}
  />
)}
```

---

## Sound & Haptic Triggers

| Status | Sound | Haptic | Duration |
|--------|-------|--------|----------|
| `assigned` | `statusUpdate` | `notification(success)` | Immediate |
| `arrived` | `statusUpdate` | `notification(success)` | Immediate |
| `in_trip` | None | None | - |
| `completed` | None | None | - |

---

## Banner Behavior

| Status | Position | Auto-hide | Dismissible |
|--------|----------|-----------|-------------|
| `assigned` | Fixed top | 5 seconds | Yes |
| `arrived` | In card (existing) | No | No |
| `in_trip` | Fixed top | 5 seconds | Yes |
| `completed` | Fixed top | 5 seconds | Yes |

---

## Data Flow

```text
Status change in DB (driver accepts/arrives)
        │
        ▼
Supabase Realtime fires
        │
        ▼
useRideRealtime receives update
        │
        ├───────────────────────────────────────┐
        ▼                                       ▼
Update RideStore status                 Trigger sound + haptic
        │                               (assigned/arrived only)
        ▼
useRideStatusNotifications detects change
        │
        ▼
Show RideStatusBanner with message
        │
        ▼
Auto-hide after 5s (or persist for arrived)
```

---

## No Changes To

- Existing toast notifications (supplementary)
- Map visualizations
- Driver info card layout
- Receipt modal
- Progress bar styling
