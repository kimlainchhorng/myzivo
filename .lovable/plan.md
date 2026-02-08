
# Get Help Button & Support Flow Enhancement

## Overview
Enhance the order detail help flow to create tickets and redirect to the ticket detail page for real-time conversation with support.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `support_tickets` table | ✅ Complete | Has `order_id`, `ticket_type`, `subject`, `category`, `status` |
| `ticket_replies` table | ✅ Complete | Messages with `ticket_id`, `user_id`, `message`, `is_admin` |
| Ticket creation hook | ✅ Complete | `useCreateEatsTicket` in `src/hooks/useEatsSupport.ts` |
| User tickets list | ✅ Complete | `UserSupportTicketsPage` at `/support/tickets` |
| Ticket detail page | ✅ Complete | `TicketDetailPage` at `/support/tickets/:id` |
| Realtime chat | ✅ Complete | `useTicketChatRealtime` subscribes to `ticket_replies` |
| Help modal on order | ✅ Exists | `HelpModal` on `EatsOrderDetail.tsx` |
| My tickets hook | ✅ Complete | `useMyTickets` filters by `user_id` |

### Missing / Needs Update
| Feature | Status |
|---------|--------|
| Redirect after ticket creation | ❌ `HelpModal` shows success but doesn't redirect |
| Clickable ticket cards | ❌ `UserSupportTicketsPage` cards not linked to detail |
| "Get Help" button prominence | ⚠️ Currently just icon in header |

---

## Implementation Plan

### A) Update HelpModal to Redirect After Ticket Creation

Modify the success flow to navigate to the ticket detail page.

**File to Modify:** `src/components/eats/HelpModal.tsx`

**Changes:**
1. After ticket creation success, add a "View Ticket" button
2. Auto-close modal and navigate to `/support/tickets/:ticketId`

```typescript
// In the success state, add navigation
<Button
  onClick={() => {
    handleClose();
    navigate(`/support/tickets/${createdTicketId}`);
  }}
  className="w-full h-12 rounded-xl bg-orange-500..."
>
  View Ticket
</Button>
```

### B) Add Ticket ID to Creation Response

Update `useCreateEatsTicket` to store the ticket ID for navigation.

**File to Modify:** `src/components/eats/HelpModal.tsx`

**Changes:**
1. Store `createdTicketId` (already have `createdTicketNumber`)
2. Use the returned ticket data's `id` field

### C) Make Ticket Cards Clickable on List Page

Update `UserSupportTicketsPage` to link tickets to their detail page.

**File to Modify:** `src/pages/support/UserSupportTicketsPage.tsx`

**Changes:**
1. Wrap `TicketCard` with `Link` to `/support/tickets/:id`
2. Add hover states and cursor pointer

```typescript
<Link to={`/support/tickets/${ticket.id}`}>
  <TicketCard ticket={ticket} />
</Link>
```

### D) Add Prominent "Get Help" Button to Order Detail

Add a visible button in the order actions area (not just header icon).

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

**Changes:**
1. Add "Get Help" button below order items or in actions section
2. Use the `HelpCircle` icon with clear label
3. Style consistent with 2026 dark theme

**New Button Location (after price breakdown):**
```typescript
{/* Help Actions */}
<motion.div className="bg-zinc-900/80...">
  <Button 
    variant="outline"
    onClick={() => setHelpModalOpen(true)}
    className="w-full h-12 rounded-xl border-orange-500/30 text-orange-400"
  >
    <HelpCircle className="w-5 h-5 mr-2" />
    Get Help with This Order
  </Button>
</motion.div>
```

### E) Enhance HelpModal with Better Flow

Update the modal to provide smoother UX.

**File to Modify:** `src/components/eats/HelpModal.tsx`

**Changes:**
1. Store ticket ID from response
2. On success, show "View Ticket" and "Done" buttons
3. "View Ticket" navigates to `/support/tickets/:id`
4. Auto-redirect after 3 seconds (optional)

### F) Verify Realtime Already Working

The existing infrastructure handles realtime:
- `useTicketChatRealtime` in `src/hooks/useSupportChat.ts` subscribes to `ticket_replies`
- `TicketChat` component uses this for live updates
- New messages trigger toast notifications

No changes needed — already functional.

---

## File Changes Summary

### Modified Files
| File | Changes |
|------|---------|
| `src/components/eats/HelpModal.tsx` | Add ticket ID storage, redirect to detail page |
| `src/pages/support/UserSupportTicketsPage.tsx` | Make ticket cards clickable links |
| `src/pages/EatsOrderDetail.tsx` | Add prominent "Get Help" button below order content |

---

## User Flow

```text
User views order at /eats/orders/:id
    ↓
Clicks "Get Help with This Order" button
    ↓
HelpModal opens with issue categories
    ↓
Selects category (e.g., "Missing Item")
    ↓
Enters optional description
    ↓
Clicks "Submit"
    ↓
useCreateEatsTicket inserts to support_tickets
    ↓
Success: Ticket created
    ↓
Clicks "View Ticket"
    ↓
Navigates to /support/tickets/:ticket_id
    ↓
TicketDetailPage loads with TicketChat
    ↓
User can send messages, receives realtime replies
```

---

## Support List Page Flow

```text
User navigates to /support/tickets
    ↓
UserSupportTicketsPage loads
    ↓
useMyTickets fetches tickets WHERE user_id = auth.uid()
    ↓
Displays tickets with status badges
    ↓
User clicks a ticket card
    ↓
Navigates to /support/tickets/:id
    ↓
Live chat with support team
```

---

## Technical Notes

### Realtime Already Configured
The `useTicketChatRealtime` hook subscribes to:
```typescript
supabase.channel(`ticket-chat-${ticketId}`)
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "ticket_replies",
    filter: `ticket_id=eq.${ticketId}`,
  }, ...)
```

### Ticket Creation Fields
Current `useCreateEatsTicket` inserts:
- `ticket_number`: ZE-XXXXXX
- `user_id`: Current user
- `order_id`: The food order ID
- `subject`: Category label + restaurant name
- `description`: User's message
- `category`: "eats"
- `priority`: "high" for refunds, "normal" otherwise
- `status`: "open"

Can add `ticket_type` if needed for filtering.

---

## Summary

This implementation:

1. **Redirects to ticket detail** after creating from order page
2. **Makes ticket cards clickable** to navigate to detail view
3. **Adds prominent "Get Help" button** on order detail page
4. **Leverages existing realtime** chat infrastructure
5. **Maintains consistent UX** with 2026 dark glass theme
