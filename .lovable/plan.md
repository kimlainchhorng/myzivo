

# Service Status Messages — Context-Aware Banners

## Current State

The system already has:
- A `service_health_status` table tracking 12 services (flights, hotels, payments, eats, rides, dispatch, etc.)
- A `useSystemStatus` hook that detects degraded services but returns a **single generic message** regardless of which service is affected
- A `SystemStatusBanner` component that displays that generic message in a dismissible amber banner

**The gap**: The banner always says "Some services may be temporarily slower than usual" — it never tells customers *what* is actually impacted.

## What Changes

Upgrade the hook and banner to show **service-specific messages** based on which services are degraded.

### Message Mapping

| Degraded Service Key(s) | Banner Message |
|---|---|
| `eats`, `rides`, `dispatch` | "High demand in your area -- delivery times may be longer." |
| `payments` | "Payment processing delays -- please try again shortly." |
| Both categories | Shows the more urgent one (payments) |
| Other services | Falls back to existing generic message |

### File Changes

| File | Action | What |
|---|---|---|
| `src/hooks/useSystemStatus.ts` | Update | Return the list of degraded `service_key` values and derive a context-specific `incidentMessage` based on which services are affected |
| `src/components/shared/SystemStatusBanner.tsx` | Update | Use the new context-specific message; use a credit-card icon for payment issues vs. the existing warning triangle for delivery delays |

### Technical Detail

**`useSystemStatus.ts`** changes:
- Query now also selects `service_key`
- New logic derives the message:
  - If any degraded service key is `payments` -> payment delay message
  - If any degraded service key is `eats`, `rides`, or `dispatch` -> high demand / delivery delay message  
  - Otherwise -> existing generic fallback
- Returns a new `incidentType` field (`"delivery"` | `"payment"` | `"general"`) so the banner can pick the right icon

**`SystemStatusBanner.tsx`** changes:
- Reads `incidentType` from the hook
- Shows `CreditCard` icon (from lucide) for payment issues, keeps `AlertTriangle` for delivery/general
- No other behavioral changes — dismissal, 1-hour expiry, and layout remain the same

This is a minimal update to two existing files with no new files, hooks, or routes needed.

