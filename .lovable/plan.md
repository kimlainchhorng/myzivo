
# Support System + Live Chat Implementation Plan

## Overview

Implement a complete support ticketing system with real-time live chat functionality, allowing Drivers, Merchants, and Customers to create support tickets and chat with admin/dispatch staff.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `support_tickets` table | Exists | Full schema with SLA, escalation, priority, status, user_id, driver_id, restaurant_id, order_id |
| `ticket_replies` table | Exists | Stores messages with is_admin flag |
| `useSupportTickets.ts` hook | Exists | Comprehensive hooks for CRUD, SLA, escalation |
| `useRiderSupport.ts` hook | Exists | Rider-specific ticket creation |
| `AdminSupportTickets.tsx` | Exists | Admin panel support management |
| `AdminSupportDashboard.tsx` | Exists | Full SLA-based dashboard with chat |
| User ticket pages | Exists | `/help/*`, `/support/tickets` pages |
| Dispatch sidebar | Missing support | No "Support" nav item |
| Live chat in user pages | Missing | Users can create tickets but no chat interface |
| Real-time subscriptions | Partially exists | Not fully integrated for support |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                User/Driver/Merchant                              │
│         Creates ticket + sends messages                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   support_tickets                                │
│                        +                                         │
│                   ticket_replies                                 │
│                                                                  │
│  Realtime subscription broadcasts new messages                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Admin/Dispatch Inbox                                │
│        /dispatch/support + /dispatch/support/:id                 │
│                                                                  │
│  • Filter by status/priority                                    │
│  • Real-time message updates                                    │
│  • Assign, escalate, resolve tickets                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Add `last_message_at` and `role` to `support_tickets` (if missing)

The existing table already has comprehensive columns. We need to verify and add:

```sql
-- Add last_message_at column for sorting by recent activity
ALTER TABLE support_tickets 
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT now();

-- Add role column to identify submitter type
ALTER TABLE support_tickets 
  ADD COLUMN IF NOT EXISTS submitter_role TEXT DEFAULT 'customer';

-- Create index for efficient inbox queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message 
  ON support_tickets(status, last_message_at DESC);

-- Create index for ticket_replies by ticket
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_created 
  ON ticket_replies(ticket_id, created_at);
```

### 2. Trigger to update `last_message_at`

```sql
CREATE OR REPLACE FUNCTION update_ticket_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets 
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_ticket_last_message
  AFTER INSERT ON ticket_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_last_message();
```

### 3. RLS Policies (verify existing or enhance)

The existing RLS should already handle:
- Admin can read/write all tickets
- Non-admin can read/write only their own tickets (user_id = auth.uid())
- For drivers: driver_id matches their driver record
- For merchants: restaurant_id matches their restaurant

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useSupportChat.ts` | Create | Real-time chat hooks with Supabase subscriptions |
| `src/pages/dispatch/DispatchSupport.tsx` | Create | Admin support inbox with filters |
| `src/pages/dispatch/DispatchSupportTicket.tsx` | Create | Ticket detail with live chat |
| `src/components/support/TicketChat.tsx` | Create | Reusable chat interface component |
| `src/components/support/TicketChatInput.tsx` | Create | Message input with send button |
| `src/components/support/TicketChatMessage.tsx` | Create | Individual message bubble |
| `src/pages/support/TicketDetailPage.tsx` | Create | User-facing ticket detail with chat |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add "Support" nav item |
| `src/App.tsx` | Modify | Add dispatch/support routes |
| Database migration | Create | Add columns, triggers, indexes |

---

## Component Specifications

### 1. useSupportChat Hook

**File: `src/hooks/useSupportChat.ts`**

```typescript
// Real-time hooks for support chat
export function useTicketMessages(ticketId: string) {
  // Fetch messages using ticket_replies table
  // Real-time subscription for new messages
}

export function useSendTicketMessage() {
  // Mutation to insert into ticket_replies
  // Automatically updates last_message_at
}

export function useTicketChatRealtime(
  ticketId: string,
  onNewMessage: (message) => void
) {
  // Supabase realtime subscription
  // Channel: ticket-chat-{ticketId}
}

export function useUnreadTicketCount() {
  // Count tickets with unread messages (for badge)
}
```

### 2. DispatchSupport Page (Inbox)

**Route:** `/dispatch/support`

**Features:**
- Filter tabs: All | Open | In Progress | Waiting | Resolved
- Search by ticket number, subject, order ID
- Sort by last_message_at (most recent first)
- Priority badges (urgent, high, normal, low)
- Unread indicator (new messages since last admin view)
- Click to open ticket detail

**Layout:**
```text
┌─────────────────────────────────────────────────────┐
│  Support Inbox                         [Search...]  │
├─────────────────────────────────────────────────────┤
│  [All] [Open 5] [In Progress 3] [Waiting] [Resolved]│
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐│
│  │ #ZS-123456  ● Urgent                           ││
│  │ Can't complete my delivery order               ││
│  │ Customer • 5 min ago            [→]            ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ #ZS-123457                                     ││
│  │ Payment not received                           ││
│  │ Driver • 2 hours ago            [→]            ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 3. DispatchSupportTicket Page (Detail + Chat)

**Route:** `/dispatch/support/:id`

**Layout:**
```text
┌──────────────────────────────────────────────────────────┐
│  ← Back     #ZS-123456                    [Actions ▼]    │
├──────────────────────────────────────────────────────────┤
│  Subject: Can't complete my delivery order               │
│  Status: [Open ▼]  Priority: [Urgent ▼]  SLA: 45m        │
│  Customer: john@email.com  •  Order: #ORD-789            │
├──────────────────────────────────────────────────────────┤
│                     CONVERSATION                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [Customer] 5:30 PM                                │  │
│  │  I tried to place an order but payment failed...  │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │                              [Admin] 5:35 PM       │  │
│  │     Thank you for reaching out. Let me check...   │  │
│  └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│  [Templates ▼]  [____Type your message____]  [Send →]    │
└──────────────────────────────────────────────────────────┘
```

**Actions Menu:**
- Assign to me
- Change status (Open, In Progress, Waiting, Resolved, Closed)
- Change priority
- Add tags
- View order (if order_id exists)
- Escalate

### 4. TicketChat Component (Reusable)

Used by both admin and user ticket detail pages.

**Props:**
```typescript
interface TicketChatProps {
  ticketId: string;
  currentUserType: 'customer' | 'driver' | 'merchant' | 'admin';
  readOnly?: boolean;
}
```

**Features:**
- Auto-scroll to latest message
- Real-time updates via subscription
- Typing indicator (optional)
- Message timestamps
- Sender role badges

### 5. TicketDetailPage (User-facing)

**Route:** `/support/tickets/:id` or `/help/tickets/:id`

**Features:**
- Ticket summary (status, created, subject)
- Chat interface (using TicketChat component)
- User can send messages
- Status updates shown in chat
- Close ticket option (if status allows)

### 6. Sidebar Update

Add to `DispatchSidebar.tsx`:

```typescript
{
  label: "Support",
  path: "/dispatch/support",
  icon: Headphones,
}
```

Position after "Quality" and before "Settings".

---

## Notifications Integration

When a new ticket is created:
1. Insert notification for all admin users (channel: in_app)
2. Title: "New Support Ticket"
3. Body: "{role} submitted: {subject}"

When a new message arrives:
1. If sender is user → notify assigned admin
2. If sender is admin → notify ticket owner (user_id)
3. Channel: in_app (email/SMS optional)

**Database trigger or edge function:**

```sql
-- On ticket_replies insert
-- Notify the other party via notifications table
```

---

## Real-time Subscriptions

### Ticket List (Inbox)

```typescript
supabase
  .channel('dispatch-support-tickets')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'support_tickets'
  }, handleTicketChange)
  .subscribe()
```

### Ticket Messages (Chat)

```typescript
supabase
  .channel(`ticket-chat-${ticketId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'ticket_replies',
    filter: `ticket_id=eq.${ticketId}`
  }, handleNewMessage)
  .subscribe()
```

---

## Route Registration

**App.tsx additions:**

```typescript
// Lazy imports
const DispatchSupport = lazy(() => import("./pages/dispatch/DispatchSupport"));
const DispatchSupportTicket = lazy(() => import("./pages/dispatch/DispatchSupportTicket"));
const TicketDetailPage = lazy(() => import("./pages/support/TicketDetailPage"));

// Routes under dispatch
<Route path="support" element={<DispatchSupport />} />
<Route path="support/:id" element={<DispatchSupportTicket />} />

// User-facing ticket detail
<Route path="/support/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
```

---

## Implementation Order

1. **Database migration** - Add last_message_at column, triggers, indexes
2. **useSupportChat hook** - Real-time message hooks
3. **TicketChat components** - Reusable chat UI
4. **DispatchSupport page** - Admin inbox
5. **DispatchSupportTicket page** - Admin ticket detail with chat
6. **TicketDetailPage** - User-facing ticket detail
7. **Update DispatchSidebar** - Add Support nav
8. **Update App.tsx** - Add routes
9. **Notification triggers** - Create notifications on new tickets/messages

---

## Message Types

Messages in `ticket_replies` will have `is_admin` flag:
- `is_admin = false`: Message from user/driver/merchant
- `is_admin = true`: Message from admin/dispatch

For display, we map to:
- User messages: left-aligned, muted background
- Admin messages: right-aligned, primary background

---

## Security Considerations

| Access | Control |
|--------|---------|
| Create ticket | Any authenticated user |
| View ticket | Owner (user_id) or admin |
| Send message | Owner or admin (for that ticket) |
| Update ticket status | Admin only |
| Assign ticket | Admin only |
| View all tickets | Admin only |

---

## Testing Checklist

- [ ] User can create ticket from help page
- [ ] Driver can create ticket linked to their account
- [ ] Merchant can create ticket linked to restaurant
- [ ] Ticket appears in dispatch inbox
- [ ] Admin can filter by status/priority
- [ ] Admin can search tickets
- [ ] Admin can open ticket detail
- [ ] Admin can send message
- [ ] Message appears in real-time for both parties
- [ ] User receives notification on admin reply
- [ ] Admin receives notification on user message
- [ ] Status changes work correctly
- [ ] Priority changes work correctly
- [ ] SLA countdown displays correctly
- [ ] Escalation flow works
- [ ] Close ticket works
