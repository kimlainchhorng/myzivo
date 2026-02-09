
# Order Editing Window — Implementation Plan

## Overview
Allow customers to edit or cancel their order for a short window (2-3 minutes) after placing it. During this grace period, customers can:
1. Remove items from the order
2. Change item quantities  
3. Add a note to the order
4. Cancel the order entirely

The feature activates only when the order is still in "placed" (pending) status or within the grace period timer.

---

## Current State Analysis

### Data Available
| Field | Location | Purpose |
|-------|----------|---------|
| `placed_at` / `created_at` | `food_orders` | When order was placed (grace window start) |
| `status` | `food_orders` | Current order status (placed, confirmed, etc.) |
| `items` | `food_orders` | JSONB array of order items |
| `special_instructions` | `food_orders` | Order notes |
| `accepted_at` | `food_orders` | When restaurant confirmed (ends grace window) |

### Key Insight
The grace window should end when **either**:
1. Timer expires (2-3 minutes after `placed_at`)
2. Restaurant confirms the order (`status` changes from "placed" to "confirmed")

---

## Implementation Plan

### 1) Create useOrderEditWindow Hook

**File to Create:** `src/hooks/useOrderEditWindow.ts`

**Purpose:** Calculate remaining edit time and determine if editing is allowed.

```typescript
interface OrderEditWindowResult {
  // Window state
  isEditWindowOpen: boolean;
  canEdit: boolean;
  canCancel: boolean;
  
  // Timer
  remainingSeconds: number;
  remainingDisplay: string;  // "02:30" format
  
  // Closure reason
  closedReason: "expired" | "confirmed" | null;
}

interface UseOrderEditWindowOptions {
  placedAt: string | null | undefined;
  status: string;
  acceptedAt?: string | null;
  graceMinutes?: number;  // Default 2.5 minutes
}
```

**Key Logic:**
- Grace window = 2.5 minutes (150 seconds) from `placed_at`
- Window closes immediately if `status !== "placed"` (restaurant confirmed)
- Live countdown updates every second
- Returns formatted display time (MM:SS)

### 2) Create useOrderEditing Hook

**File to Create:** `src/hooks/useOrderEditing.ts`

**Purpose:** Provide mutation functions for editing orders within the grace window.

```typescript
interface OrderEditingResult {
  // Item mutations
  removeItem: (itemIndex: number) => Promise<void>;
  updateItemQuantity: (itemIndex: number, newQuantity: number) => Promise<void>;
  
  // Note mutation
  updateNote: (note: string) => Promise<void>;
  
  // Cancel mutation
  cancelOrder: (reason?: string) => Promise<void>;
  
  // States
  isUpdating: boolean;
  isCancelling: boolean;
}
```

**Validation:** All mutations will first verify the edit window is still open before proceeding.

### 3) Create OrderEditBanner Component

**File to Create:** `src/components/eats/OrderEditBanner.tsx`

**Purpose:** Prominent banner showing edit availability with countdown timer.

**UI Design:**
```
+-----------------------------------------------------+
| ✏️  You can edit or cancel this order               |
|                                                     |
| Editing available for: 02:30                        |
|                                                     |
| [Edit Items]                    [Cancel Order]      |
+-----------------------------------------------------+
```

**Props:**
```typescript
interface OrderEditBannerProps {
  remainingSeconds: number;
  remainingDisplay: string;
  onEditClick: () => void;
  onCancelClick: () => void;
  className?: string;
}
```

**Styling:**
| Time Remaining | Color | Animation |
|----------------|-------|-----------|
| > 60 seconds | Blue/Cyan | Subtle pulse |
| 30-60 seconds | Amber | Medium pulse |
| < 30 seconds | Red | Fast pulse + warning |

### 4) Create OrderEditSheet Component

**File to Create:** `src/components/eats/OrderEditSheet.tsx`

**Purpose:** Bottom sheet for editing order items and adding notes.

**UI Sections:**
1. **Timer Header** - Shows remaining time prominently
2. **Items List** - Each item with quantity controls and remove button
3. **Add Note** - Text area for order notes
4. **Save Button** - Commits changes

**Props:**
```typescript
interface OrderEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  items: OrderItem[];
  currentNote?: string;
  remainingDisplay: string;
  onRemoveItem: (index: number) => Promise<void>;
  onUpdateQuantity: (index: number, quantity: number) => Promise<void>;
  onUpdateNote: (note: string) => Promise<void>;
  isUpdating: boolean;
}
```

**Item Row UI:**
```
+-----------------------------------------------------+
| 🍔 Burger Deluxe                                    |
|    $12.99                                           |
|                                                     |
| [-]  2  [+]                              [🗑️ Remove]|
+-----------------------------------------------------+
```

### 5) Create CancelOrderDialog Component

**File to Create:** `src/components/eats/CancelOrderDialog.tsx`

**Purpose:** Confirmation dialog for order cancellation.

**UI Design:**
```
+-----------------------------------------------------+
| ⚠️ Cancel Order?                                    |
|                                                     |
| Are you sure you want to cancel this order?         |
|                                                     |
| (Optional reason)                                   |
| [________________________]                          |
|                                                     |
| [Keep Order]                    [Yes, Cancel]       |
+-----------------------------------------------------+
```

**Props:**
```typescript
interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => Promise<void>;
  isCancelling: boolean;
}
```

### 6) Create Edge Function for Order Updates

**File to Create:** `supabase/functions/update-eats-order/index.ts`

**Purpose:** Secure backend validation for order edits within grace window.

**Endpoints:**
```typescript
// POST /update-eats-order
{
  action: "update_items" | "update_note" | "cancel",
  orderId: string,
  items?: OrderItem[],        // For update_items
  note?: string,              // For update_note
  cancellation_reason?: string // For cancel
}
```

**Validation Rules:**
1. Order must belong to the authenticated user
2. Order status must be "placed" (not yet confirmed)
3. Order must be within grace window (< 2.5 min from `placed_at`)
4. Items array must have at least 1 item (can't remove all)
5. Recalculate totals after item changes

**Response:**
```typescript
{
  success: boolean,
  order?: UpdatedOrder,
  error?: string,
  reason?: "expired" | "confirmed" | "invalid"
}
```

### 7) Update EatsOrderDetail Page

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Integration:**
```typescript
// Track edit window state
const editWindow = useOrderEditWindow({
  placedAt: order?.placed_at || order?.created_at,
  status: order?.status || "",
  acceptedAt: order?.accepted_at,
});

// Order editing mutations
const orderEditing = useOrderEditing(order?.id);

// Sheet state
const [editSheetOpen, setEditSheetOpen] = useState(false);
const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

// Show edit banner when window is open
{editWindow.isEditWindowOpen && isActiveOrder && (
  <OrderEditBanner
    remainingSeconds={editWindow.remainingSeconds}
    remainingDisplay={editWindow.remainingDisplay}
    onEditClick={() => setEditSheetOpen(true)}
    onCancelClick={() => setCancelDialogOpen(true)}
  />
)}
```

**Placement:** Add banner immediately after the status banner, before other banners.

---

## File Summary

### New Files (6)
| File | Purpose |
|------|---------|
| `src/hooks/useOrderEditWindow.ts` | Calculate edit window state and countdown |
| `src/hooks/useOrderEditing.ts` | Mutation functions for order edits |
| `src/components/eats/OrderEditBanner.tsx` | "Edit or cancel" banner with countdown |
| `src/components/eats/OrderEditSheet.tsx` | Bottom sheet for item editing |
| `src/components/eats/CancelOrderDialog.tsx` | Cancellation confirmation dialog |
| `supabase/functions/update-eats-order/index.ts` | Secure backend for order updates |

### Modified Files (1)
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Integrate edit window, banner, sheet, and dialog |

---

## Grace Window Logic

```
Order Placed (placed_at)
    │
    ├─────────────────────────────────────────────┐
    │  GRACE WINDOW (2.5 minutes)                 │
    │                                             │
    │  ┌─────────────────────────────────────┐    │
    │  │ Customer can:                       │    │
    │  │  - Remove items                     │    │
    │  │  - Change quantities                │    │
    │  │  - Add note                         │    │
    │  │  - Cancel order                     │    │
    │  └─────────────────────────────────────┘    │
    │                                             │
    ├─────────────────────────────────────────────┤
    │                                             │
    ▼ Timer expires OR Restaurant confirms        ▼
    
WINDOW CLOSED
  - No more edits allowed
  - Banner disappears
  - Standard order flow continues
```

---

## Timer Display Format

| Time Remaining | Display | Color |
|----------------|---------|-------|
| 2:30 → 1:00 | "02:30" → "01:00" | Cyan/Blue |
| 1:00 → 0:30 | "00:59" → "00:30" | Amber/Yellow |
| 0:30 → 0:00 | "00:29" → "00:00" | Red + pulse |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Remove all items except 1 | Allow (minimum 1 item) |
| Try to remove last item | Block with toast "Order must have at least one item" |
| Restaurant confirms during edit | Close sheet, show toast "Order confirmed by restaurant" |
| Timer expires during edit | Close sheet, show toast "Edit window expired" |
| Reduce quantity to 0 | Same as remove item |
| Network error during update | Show retry button, don't close sheet |

---

## Price Recalculation

When items are modified:
```
subtotal = SUM(item.price × item.quantity)
delivery_fee = (unchanged)
service_fee = (unchanged or recalculate based on subtotal)
tax = subtotal × tax_rate
total = subtotal + delivery_fee + service_fee + tax
```

---

## Audit Trail

All edits are logged to `order_events` table:
```typescript
{
  order_id: orderId,
  type: "order_edited" | "order_cancelled_by_customer",
  actor_id: customerId,
  actor_role: "customer",
  data: {
    action: "item_removed" | "quantity_changed" | "note_updated" | "cancelled",
    previous_items: [...],
    new_items: [...],
    reason: "customer_request",
  }
}
```

---

## Summary

This implementation provides:

1. **Clear edit window**: 2.5 minute grace period after order placement
2. **Prominent countdown timer**: Visual urgency with color-coded countdown
3. **Easy editing**: Bottom sheet for item modifications and notes
4. **Safe cancellation**: Confirmation dialog with optional reason
5. **Secure backend**: Edge function validates window and recalculates totals
6. **Audit trail**: All edits logged for transparency
7. **Real-time awareness**: Window closes if restaurant confirms order

The feature respects both customer flexibility and restaurant workflow by limiting edits to the brief period before restaurant acknowledgment.
