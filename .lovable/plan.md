
# In-App Chat System for Eats Orders

## Overview
Build a 3-party chat system (Customer, Driver, Merchant) for each Eats order using existing Supabase tables and realtime infrastructure.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `order_chats` table | ✅ Exists | `id`, `order_id`, `created_at` |
| `chat_members` table | ✅ Exists | `chat_id`, `user_id`, `role`, `created_at` |
| `chat_messages` table | ✅ Exists | `id`, `chat_id`, `sender_id`, `sender_type`, `message`, `attachment_url`, `order_id`, `is_read`, `created_at` |
| `chat_reads` table | ✅ Exists | `chat_id`, `user_id`, `last_read_at` |
| `chat_read_receipts` table | ✅ Exists | `order_id`, `user_id`, `last_read_at` |
| `useTripChat` hook | ✅ Exists | Realtime chat for ride trips (can adapt pattern) |
| `useSupportChat` hook | ✅ Exists | Support ticket chat (similar pattern) |
| `TripChatModal` component | ✅ Exists | Full chat UI with quick replies, typing indicator |
| `notifications` table | ✅ Exists | In-app notifications with realtime |
| Storage buckets | ✅ Exists | `p2p-documents`, `avatars` — can add `chat-attachments` |
| Realtime patterns | ✅ Established | Channel subscriptions for messages |

### Missing
| Feature | Status |
|---------|--------|
| `useEatsOrderChat` hook | ❌ Need dedicated hook for Eats order chat |
| Chat table mapping file | ❌ Need `chatTables.ts` for consistency |
| Chat pages for each role | ❌ No `/eats/orders/[id]/chat`, etc. |
| Chat button on order detail | ❌ No entry point to chat |
| Unread chat badge in nav | ❌ No chat unread count |
| Photo attachment upload | ❌ Need storage bucket + upload logic |
| Read-only mode logic | ❌ Block sending for delivered/cancelled |
| New message notifications | ❌ Need to insert to `notifications` on send |

---

## Implementation Plan

### A) Create Chat Table Mapping File

Central reference for chat-related tables.

**File to Create:** `src/lib/chatTables.ts`

```typescript
export const CHAT_TABLES = {
  orderChats: "order_chats",
  chatMembers: "chat_members",
  chatMessages: "chat_messages",
  chatReads: "chat_reads",
  chatReadReceipts: "chat_read_receipts",
} as const;

export const CHAT_ROLES = {
  customer: "customer",
  driver: "driver",
  merchant: "merchant",
  admin: "admin",
} as const;

export type ChatRole = typeof CHAT_ROLES[keyof typeof CHAT_ROLES];

export const QUICK_REPLIES = {
  customer: [
    "Where are you?",
    "Please leave at door",
    "Call me when you arrive",
    "I'm coming down now",
  ],
  driver: [
    "Arriving in 5 min",
    "Just picked up your order",
    "I'm at the door",
    "Can't find your address",
  ],
  merchant: [
    "Preparing your order now",
    "Order is ready for pickup",
    "Slight delay, 10 more min",
    "We're out of an item, calling you",
  ],
} as const;

// Order statuses that allow sending messages
export const CHAT_ACTIVE_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
] as const;
```

### B) Create `useEatsOrderChat` Hook

Main hook for chat functionality with realtime, read receipts, and typing indicator.

**File to Create:** `src/hooks/useEatsOrderChat.ts`

**Features:**
- Fetch or create chat for an order
- Fetch messages with realtime subscription
- Send message mutation with notification insertion
- Upload attachment to storage
- Mark messages as read
- Check if chat is read-only (order completed/cancelled)
- Typing indicator via broadcast channel
- Unread count query

**Implementation Outline:**
```typescript
export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: "customer" | "driver" | "merchant" | "admin";
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

export function useEatsOrderChat(orderId: string | undefined, myRole: ChatRole) {
  // 1. Get or create order_chats row
  const chatQuery = useQuery(...)
  
  // 2. Ensure current user is in chat_members
  const ensureMembership = useMutation(...)
  
  // 3. Fetch messages
  const messagesQuery = useQuery(...)
  
  // 4. Subscribe to realtime inserts
  useChatRealtime(chatId, onNewMessage)
  
  // 5. Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ message, attachmentFile }) => {
      // Upload attachment if present
      // Insert message
      // Insert notification for other participants
    }
  })
  
  // 6. Upload attachment
  const uploadAttachment = async (file: File) => {
    // Upload to chat-attachments bucket
    // Return public URL
  }
  
  // 7. Mark as read
  const markRead = useMutation(...)
  
  // 8. Typing indicator
  const { isOtherTyping, sendTypingStatus } = useTypingIndicator(chatId, myRole)
  
  // 9. Read-only check based on order status
  const isReadOnly = !CHAT_ACTIVE_STATUSES.includes(orderStatus)
  
  return {
    messages,
    sendMessage,
    uploadAttachment,
    markRead,
    isOtherTyping,
    sendTypingStatus,
    isReadOnly,
    isLoading
  }
}
```

### C) Create `useEatsUnreadChats` Hook

Count unread messages across all active orders for badge display.

**File to Create:** `src/hooks/useEatsUnreadChats.ts`

**Features:**
- Query active orders for current user
- Count messages where `created_at > last_read_at` for each chat
- Return total unread count
- Realtime subscription for updates

```typescript
export function useEatsUnreadChats() {
  // For customer: count unread from their active orders
  // For driver: count unread from assigned orders
  // For merchant: count unread from restaurant orders
  
  return { unreadCount, refetch }
}
```

### D) Create Chat Page Component

Full-page chat UI that works for all roles.

**File to Create:** `src/components/eats/OrderChatPage.tsx`

**Features:**
- Message list with avatars, timestamps, read receipts
- Quick reply buttons based on role
- Photo attachment button (single image)
- Typing indicator
- Read-only banner when order completed
- Auto-scroll on new messages
- Participant list header (who's in the chat)

**UI Layout:**
```
┌──────────────────────────────────────────┐
│ ← Order #ZE-12345               [Info]   │
│ Customer • Driver • Merchant             │
├──────────────────────────────────────────┤
│                                          │
│  [Merchant] 2:30 PM                      │
│  ┌────────────────────────────┐          │
│  │ Preparing your order now   │          │
│  └────────────────────────────┘          │
│                                          │
│                    [You] 2:31 PM         │
│         ┌────────────────────────────┐   │
│         │ Great, thanks!        ✓✓   │   │
│         └────────────────────────────┘   │
│                                          │
│  [Driver] 2:35 PM                        │
│  ┌────────────────────────────┐          │
│  │ I'm at the restaurant now  │          │
│  └────────────────────────────┘          │
│                                          │
│  Driver is typing...                     │
│                                          │
├──────────────────────────────────────────┤
│ [Where are you?] [Leave at door] [Call]  │
├──────────────────────────────────────────┤
│ [📷] [Type a message...        ] [Send]  │
└──────────────────────────────────────────┘
```

### E) Create Route Pages for Each Role

Create dedicated pages that render the chat component with appropriate role.

**Files to Create:**

1. **Customer:** `src/pages/eats/EatsOrderChatPage.tsx`
   - Route: `/eats/orders/:id/chat`
   - Role: `customer`
   - Validates user is order owner

2. **Driver:** `src/pages/driver/DriverOrderChatPage.tsx`
   - Route: `/driver/orders/:id/chat`
   - Role: `driver`
   - Validates user is assigned driver

3. **Merchant:** `src/pages/merchant/MerchantOrderChatPage.tsx`
   - Route: `/merchant/orders/:id/chat`
   - Role: `merchant`
   - Validates user owns the restaurant

4. **Admin (optional):** `src/pages/admin/AdminOrderChatPage.tsx`
   - Route: `/admin/orders/:id/chat`
   - Role: `admin`
   - Read-only with moderation tools

### F) Add Chat Button to Order Detail Pages

Update existing order detail pages with a chat entry point.

**Files to Modify:**

1. **Customer Order Detail:** `src/pages/EatsOrderDetail.tsx`
   - Add "Message" button next to driver info card
   - Show unread badge if new messages

2. **Driver Orders:** `src/components/driver/EatsOrderCard.tsx`
   - Add "Chat" button in action row
   - Show unread badge

3. **Merchant Orders:** `src/components/restaurant/RestaurantOrders.tsx`
   - Add chat icon/button per order row
   - Show unread indicator

**Chat Button Component:**
```typescript
interface ChatButtonProps {
  orderId: string;
  unreadCount?: number;
  className?: string;
}

export function OrderChatButton({ orderId, unreadCount, className }: ChatButtonProps) {
  const navigate = useNavigate();
  
  return (
    <Button onClick={() => navigate(`/eats/orders/${orderId}/chat`)}>
      <MessageCircle className="w-4 h-4" />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </Button>
  );
}
```

### G) Add Storage Bucket for Attachments

Create a storage bucket for chat photo attachments.

**Migration to Create:**
```sql
-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own attachments
CREATE POLICY "Users can upload chat attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view chat attachments
CREATE POLICY "Public can view chat attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');
```

### H) Add RLS Policies for Chat Tables

Ensure proper security for chat data.

**RLS Policies to Add:**

```sql
-- order_chats: Members can read
CREATE POLICY "Members can read order_chats"
ON order_chats FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT chat_id FROM chat_members WHERE user_id = auth.uid()
  )
);

-- chat_members: Members can read their own membership
CREATE POLICY "Users can read their chat memberships"
ON chat_members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- chat_messages: Members can read/write
CREATE POLICY "Members can read messages"
ON chat_messages FOR SELECT
TO authenticated
USING (
  chat_id IN (
    SELECT chat_id FROM chat_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can insert messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  chat_id IN (
    SELECT chat_id FROM chat_members WHERE user_id = auth.uid()
  )
);

-- chat_reads: Users can update their own read receipts
CREATE POLICY "Users can manage their read receipts"
ON chat_reads FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### I) Update App.tsx with New Routes

Add the chat page routes.

**File to Modify:** `src/App.tsx`

```typescript
// New imports
const EatsOrderChatPage = lazy(() => import("./pages/eats/EatsOrderChatPage"));
const DriverOrderChatPage = lazy(() => import("./pages/driver/DriverOrderChatPage"));
const MerchantOrderChatPage = lazy(() => import("./pages/merchant/MerchantOrderChatPage"));

// New routes
<Route path="/eats/orders/:id/chat" element={<ProtectedRoute><EatsOrderChatPage /></ProtectedRoute>} />
<Route path="/driver/orders/:id/chat" element={<ProtectedRoute><DriverOrderChatPage /></ProtectedRoute>} />
<Route path="/merchant/orders/:id/chat" element={<ProtectedRoute><MerchantOrderChatPage /></ProtectedRoute>} />
```

### J) Add New Message Notifications

Insert notification when a message is sent to notify other participants.

**Logic in `sendMessage` mutation:**
```typescript
// After inserting message, notify other participants
const otherMembers = chatMembers.filter(m => m.user_id !== user.id);

for (const member of otherMembers) {
  await supabase.from("notifications").insert({
    user_id: member.user_id,
    channel: "in_app",
    category: "transactional",
    template: "order_chat_message",
    title: `New message - Order #${orderNumber}`,
    body: message.substring(0, 80) + (message.length > 80 ? "..." : ""),
    action_url: `/eats/orders/${orderId}/chat`,
    metadata: {
      order_id: orderId,
      sender_role: myRole,
      message_preview: message.substring(0, 80),
    },
  });
}
```

### K) Add Unread Badge to Bottom Nav

Show unread chat count in the Eats navigation.

**File to Modify:** `src/components/eats/EatsBottomNav.tsx`

Add a "Messages" nav item or combine with Alerts:
```typescript
const { unreadCount: chatUnread } = useEatsUnreadChats();

// Option A: Add as separate nav item
{
  icon: <MessageCircle className="w-5 h-5" />,
  label: "Chat",
  path: "/eats/messages", // Or show in Orders tab
  badge: chatUnread > 0 ? chatUnread : undefined,
}

// Option B: Combine with alerts badge
const totalAlerts = unreadCount + chatUnread;
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/chatTables.ts` | Table mapping and constants |
| `src/hooks/useEatsOrderChat.ts` | Main chat hook with realtime |
| `src/hooks/useEatsUnreadChats.ts` | Unread count for badges |
| `src/components/eats/OrderChatPage.tsx` | Reusable chat UI component |
| `src/components/eats/OrderChatButton.tsx` | Chat entry button with badge |
| `src/pages/eats/EatsOrderChatPage.tsx` | Customer chat route |
| `src/pages/driver/DriverOrderChatPage.tsx` | Driver chat route |
| `src/pages/merchant/MerchantOrderChatPage.tsx` | Merchant chat route |

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add chat routes |
| `src/pages/EatsOrderDetail.tsx` | Add chat button |
| `src/components/driver/EatsOrderCard.tsx` | Add chat button |
| `src/components/restaurant/RestaurantOrders.tsx` | Add chat icon per order |
| `src/components/eats/EatsBottomNav.tsx` | Add unread chat badge |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Create `chat-attachments` storage bucket | Photo upload support |
| Add RLS policies for chat tables | Security for multi-party chat |

---

## Chat Membership Flow

```
Order Placed
    ↓
Create order_chats row (order_id)
    ↓
Add customer to chat_members (role: customer)
    ↓
Add merchant to chat_members (role: merchant)
    ↓
Driver Assigned → Add driver to chat_members (role: driver)
    ↓
All 3 parties can now message each other
    ↓
Order Delivered/Cancelled → Chat becomes read-only
```

---

## Realtime Flow

```
User sends message
    ↓
Insert to chat_messages
    ↓
Supabase realtime broadcasts INSERT event
    ↓
All connected clients receive via channel subscription
    ↓
queryClient.setQueryData updates cache instantly
    ↓
UI re-renders with new message
    ↓
For non-connected users: notification inserted
```

---

## Read Receipt Flow

```
User opens chat page
    ↓
Call markRead mutation
    ↓
Upsert chat_reads (chat_id, user_id, last_read_at)
    ↓
When rendering messages:
  - Compare message.created_at vs chat_reads.last_read_at
  - Show ✓✓ if all other members have read
```

---

## Summary

This implementation adds:

1. **Central Chat Hook**: `useEatsOrderChat` with realtime messages, typing indicator, read receipts
2. **Chat Pages**: Dedicated routes for customer, driver, merchant
3. **Modern Chat UI**: Bubbles, timestamps, quick replies, photo attachment
4. **Unread Badges**: Count shown in nav and on order cards
5. **Notifications**: In-app alerts when new messages arrive
6. **Read-Only Mode**: Block sending when order is delivered/cancelled
7. **RLS Security**: Only chat members can read/write messages
8. **Photo Attachments**: Single image upload via storage bucket
