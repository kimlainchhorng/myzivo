
# Admin Interoperability: Support & Deep Links

## Overview
Add support ticket creation directly from order detail, log order placement events, and provide shareable order links for support scenarios.

---

## Current State Analysis

### Already Implemented
| Feature | Status | Location |
|---------|--------|----------|
| HelpModal | ✅ Exists | `src/components/eats/HelpModal.tsx` — redirects to `/support` page |
| Support Tickets | ✅ Exists | `support_tickets` table with `order_id` column |
| useCreateTicket | ✅ Exists | `src/hooks/useSupportTickets.ts` — creates tickets with `order_id` |
| order_events table | ✅ Exists | Has `order_id`, `type`, `actor_id`, `actor_role`, `data` columns |
| Order mutations logging | ✅ Status changes logged | `useEatsOrderMutations.ts` logs status updates |
| EatsOrderDetail page | ✅ Exists | Has "Get Help" button → opens HelpModal |

### Missing
| Feature | Status |
|---------|--------|
| Quick ticket creation from order page | ❌ HelpModal redirects away, doesn't create inline |
| `order_placed` event logging | ❌ Order creation doesn't log to `order_events` |
| Share order link button | ❌ No copy-to-clipboard functionality |

---

## Implementation Plan

### 1. Enhance HelpModal with Quick Ticket Creation

Currently the HelpModal just navigates to `/support`. Add an option to create a quick support ticket inline with pre-filled order context.

**File to Modify:**
- `src/components/eats/HelpModal.tsx`

**Changes:**
- Add a quick issue submission form (optional text input)
- Create ticket directly using `useCreateTicket` hook
- Pre-fill `order_id` and `category: "eats"` 
- Show success confirmation and ticket number

**New Props:**
```typescript
interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantPhone?: string | null;
  restaurantName?: string;
  customerId?: string;
}
```

### 2. Add "Share Order Link" Button

Add a button to copy order deep link to clipboard for customer support or sharing.

**File to Modify:**
- `src/pages/EatsOrderDetail.tsx`

**Add:**
- Share button in header (next to help button)
- Uses `navigator.clipboard.writeText()` with toast confirmation
- Link format: `https://hizivo.com/eats/orders/{id}`

**UI Location:**
```text
+----------------------------------+
| [← Back]  Order Details  [↗][?] |
+----------------------------------+
```
The `↗` share icon copies the link.

### 3. Log `order_placed` Event on Order Creation

When customer places order, insert a row to `order_events` for audit trail.

**File to Modify:**
- `src/hooks/useEatsOrders.ts` — in `useCreateFoodOrder` mutation

**Add after successful insert:**
```typescript
// Log order_placed event
await supabase.from("order_events").insert({
  order_id: order.id,
  type: "order_placed",
  actor_id: customerId,
  actor_role: "customer",
  data: {
    restaurant_id: input.restaurant_id,
    total_amount: input.total,
    item_count: input.items.length,
  },
});
```

### 4. Create Quick Support Ticket Hook

Create a simplified hook specifically for Eats order support.

**File to Create:**
- `src/hooks/useEatsSupport.ts`

**Contents:**
```typescript
export function useCreateEatsTicket() {
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      message, 
      category 
    }: { 
      orderId: string; 
      message: string; 
      category: "order_issue" | "refund" | "missing_item" | "other" 
    }) => {
      const ticketNumber = `ZE-${Date.now().toString().slice(-6)}`;
      
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumber,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          order_id: orderId,
          subject: `Order Issue - ${category}`,
          description: message,
          category: "eats",
          priority: category === "refund" ? "high" : "normal",
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useEatsSupport.ts` | Quick ticket creation hook for Eats orders |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/eats/HelpModal.tsx` | Add quick ticket creation form, use `useCreateEatsTicket` |
| `src/pages/EatsOrderDetail.tsx` | Add share button to copy order link |
| `src/hooks/useEatsOrders.ts` | Log `order_placed` event in `useCreateFoodOrder` |

---

## UI/UX Flow

### Share Order Link
```text
User taps share icon (↗) in header
    ↓
Copy "https://hizivo.com/eats/orders/{id}" to clipboard
    ↓
Toast: "Order link copied to clipboard"
```

### Quick Support Ticket
```text
User taps "?" help icon
    ↓
HelpModal opens with options:
  - Report an Issue → Shows text input
  - Request Refund → Shows text input
  - Contact Support → Navigate to /support
  - Call Restaurant → tel: link
    ↓
User types message and taps Submit
    ↓
Ticket created with pre-filled order_id
    ↓
Toast: "Ticket ZE-123456 created. We'll get back to you soon."
```

### Order Placed Event
```text
Customer taps "Place Order"
    ↓
Order inserted to food_orders
    ↓
order_events row inserted:
  {
    order_id: "{order_id}",
    type: "order_placed",
    actor_id: "{customer_id}",
    actor_role: "customer",
    data: {
      restaurant_id: "...",
      total_amount: 45.99,
      item_count: 3
    }
  }
```

---

## Deep Link Format

The shareable deep link uses the production domain:

```
https://hizivo.com/eats/orders/{order_id}
```

This works because the route `/eats/orders/:id` already exists and handles the `EatsOrderDetail` page.

---

## Summary

This update adds:

1. **Quick Ticket Creation**: HelpModal can create support tickets inline with order context
2. **Order Event Logging**: `order_placed` event recorded for audit trail when customer places order
3. **Share Order Link**: Copy button for support scenarios with `https://hizivo.com/eats/orders/{id}`

These features enable admin support teams to:
- View order history via deep links
- See full audit trail in `order_events` table
- Receive tickets with `order_id` pre-linked
