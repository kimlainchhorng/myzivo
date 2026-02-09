

# Batched Delivery Transparency

## Overview

Most of the infrastructure is already built. The `GroupedDeliveryBanner` already shows "Your driver is completing another nearby delivery" and the `EtaCountdown` already receives batch-specific ETA data with real-time updates. The main gap is that the `MultiStopTrackingProgress` component (fully built) is never rendered on the order detail page, and the `StatusTimeline` lacks batch context.

## What Already Works

- **Banner message**: `GroupedDeliveryBanner` displays contextual messages like "Your driver is completing another nearby delivery first" or "Driver has X stops before yours"
- **Dynamic ETA**: `EtaCountdown` receives `batchStopEta` and `batchPosition` from `useOrderBatchInfo`, which subscribes to real-time `batch_stops` changes
- **Badge**: `GroupedDeliveryBadge` shows "Grouped route" label in the header
- **Batch data hook**: `useOrderBatchInfo` fetches stop position, ETA, and current stop via a secure RPC

## What Changes

### 1. Wire `MultiStopTrackingProgress` into `EatsOrderDetail.tsx`

The component exists but is never rendered. Add it to the order detail page when `batchInfo.isBatched` is true and the order is active. It will show the visual stop-by-stop progress (Stop 1 delivered, heading to Stop 2, etc.) directly on the tracking page.

This requires mapping the batch info into the component's `TrackingStop[]` format. Since we only have the customer's stop details (not other customers' data, for privacy), we'll show numbered stops with status indicators -- delivered, current, or pending.

### 2. Add batch substep to `StatusTimeline`

Add a new optional prop to `StatusTimeline` for batch context. When the order is batched and out for delivery, inject a substep between "Picked Up" and "Delivered" showing "Delivering stop X of Y" with dynamic progress.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/pages/EatsOrderDetail.tsx` | Update | Import and render `MultiStopTrackingProgress` when order is batched |
| `src/components/eats/StatusTimeline.tsx` | Update | Add batch-aware substep showing multi-stop progress |

## Technical Details

### MultiStopTrackingProgress integration

Build a `TrackingStop[]` array from `batchInfo`:

```text
For i in 1..totalStops:
  if i < currentStopOrder -> status = "delivered"
  if i === currentStopOrder -> status = "current"  
  if i > currentStopOrder -> status = "pending"
  address = (i === customerStopOrder) ? order.delivery_address : "Stop i"
```

Place it between the GroupedDeliveryBanner and the ETA countdown for visual flow.

### StatusTimeline batch substep

Add two new optional props: `batchPosition` (current/total) and `isBatched`. When present and order status is `out_for_delivery`, render a substep under "Out for Delivery" showing "Stop X of Y -- delivering nearby order" or "Stop X of Y -- heading to you next".

## Edge Cases

- **Not batched**: No changes to current behavior (components hidden)
- **Customer is first stop**: `MultiStopTrackingProgress` shows their stop as current, no "another delivery" message
- **All stops delivered**: Progress shows completion state
- **Privacy**: Only stop numbers and the customer's own address are shown; other customers' addresses are not exposed

