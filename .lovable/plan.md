
# Live Support Chat — Implementation Plan

## Overview
Add a real-time live support chat page at `/support/chat` where customers can contact support agents directly from the app. The chat will show connection status ("Connecting...", "Agent joined", "Conversation ended") and support sending messages with optional image attachments.

---

## Current State Analysis

### Existing Infrastructure
| Component | Location | Purpose |
|-----------|----------|---------|
| `TicketChat` | `src/components/support/TicketChat.tsx` | Chat interface for support tickets |
| `TicketChatInput` | `src/components/support/TicketChatInput.tsx` | Message input with send button |
| `TicketChatMessage` | `src/components/support/TicketChatMessage.tsx` | Individual message bubble |
| `useSupportChat` | `src/hooks/useSupportChat.ts` | Real-time ticket messaging hooks |
| `LiveChatWidget` | `src/components/shared/LiveChatWidget.tsx` | Floating chat widget (mock only) |
| `AdminLiveChat` | `src/components/admin/AdminLiveChat.tsx` | Admin-side chat interface (mock data) |
| `support_tickets` table | Supabase | Stores tickets with status, priority, SLA |
| `ticket_replies` table | Supabase | Stores messages for tickets |

### Access Points to Add
1. Help button in main menu (existing `/help` page and app navigation)
2. Help button on order screens (EatsOrderDetail, ride pages)

---

## Database Design

### New Tables Required

**`live_chat_sessions`**
```sql
CREATE TABLE live_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  guest_name TEXT,
  status TEXT DEFAULT 'waiting', -- waiting, active, ended
  agent_id UUID REFERENCES profiles(id),
  agent_joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ended_by TEXT, -- 'user' | 'agent' | 'timeout'
  context_type TEXT, -- 'order' | 'ride' | 'general' | 'eats'
  context_id UUID, -- related order/ride ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_chat_user ON live_chat_sessions(user_id);
CREATE INDEX idx_live_chat_agent ON live_chat_sessions(agent_id);
CREATE INDEX idx_live_chat_status ON live_chat_sessions(status);
```

**`live_chat_messages`**
```sql
CREATE TABLE live_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_type TEXT NOT NULL, -- 'user' | 'agent' | 'system'
  message TEXT,
  image_url TEXT, -- optional image attachment
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_chat_msg_session ON live_chat_messages(session_id);
```

---

## Implementation Plan

### 1) Create Database Tables and RLS

**File:** SQL migration via Supabase dashboard

**RLS Policies:**
- Users can read/write their own sessions and messages
- Agents can read/write sessions assigned to them
- System can update any session

### 2) Create useLiveChat Hook

**File to Create:** `src/hooks/useLiveChat.ts`

**Purpose:** Manage live chat sessions and messages with real-time updates.

```typescript
export type ChatSessionStatus = "waiting" | "active" | "ended";

export interface LiveChatSession {
  id: string;
  user_id: string | null;
  status: ChatSessionStatus;
  agent_id: string | null;
  agent_joined_at: string | null;
  ended_at: string | null;
  context_type: string | null;
  context_id: string | null;
  created_at: string;
}

export interface LiveChatMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_type: "user" | "agent" | "system";
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Hooks:
export function useCreateChatSession();    // Start new chat
export function useActiveChatSession();    // Get user's active session
export function useChatMessages(sessionId); // Fetch messages
export function useSendChatMessage();       // Send a message
export function useEndChatSession();        // End chat
export function useChatSessionRealtime(sessionId); // Real-time status updates
export function useChatMessagesRealtime(sessionId); // Real-time messages
```

**Key Features:**
- Real-time status subscription (detects when agent joins)
- Real-time message subscription
- Auto-scroll on new messages
- System messages for status changes

### 3) Create LiveSupportChatPage

**File to Create:** `src/pages/support/LiveSupportChatPage.tsx`

**Route:** `/support/chat`

**UI States:**

**State 1: Connecting (waiting for agent)**
```text
+----------------------------------------------------------+
| ← Live Chat                                              |
+----------------------------------------------------------+
|                                                          |
|     [animated spinner/wave]                              |
|                                                          |
|     Connecting...                                        |
|     Finding an available agent                           |
|                                                          |
|     Estimated wait: ~2 min                               |
|                                                          |
|     [Cancel]                                             |
+----------------------------------------------------------+
```

**State 2: Agent Joined (active chat)**
```text
+----------------------------------------------------------+
| ← Live Chat                               [End Chat]     |
+----------------------------------------------------------+
| [Agent Joined]                                           |
| Hi! I'm Sarah from ZIVO Support. How can I help?         |
+----------------------------------------------------------+
| Messages scroll area                                     |
|                                                          |
| [Agent bubble]   Hi! How can I help you today?           |
|                                                          |
|                  I need help with my order  [User bubble]|
|                                                          |
+----------------------------------------------------------+
| [📎] [Type a message...                        ] [Send]  |
+----------------------------------------------------------+
```

**State 3: Conversation Ended**
```text
+----------------------------------------------------------+
|     Conversation ended                                   |
|                                                          |
|     [✓] Chat transcript saved                            |
|                                                          |
|     Need more help?                                      |
|     [Start New Chat]  [View Tickets]                     |
+----------------------------------------------------------+
```

**Props/Features:**
- Optional `contextType` and `contextId` from query params (e.g., `/support/chat?context=eats&orderId=xxx`)
- Quick reply buttons for common issues
- Image attachment support (optional, using Supabase Storage)
- Status indicator showing connection state

### 4) Create ChatStatusBanner Component

**File to Create:** `src/components/support/ChatStatusBanner.tsx`

**Purpose:** Visual indicator for chat connection status.

```typescript
interface ChatStatusBannerProps {
  status: "waiting" | "active" | "ended";
  agentName?: string;
  onCancel?: () => void;
}
```

**Status Messages:**
| Status | Message | Color |
|--------|---------|-------|
| waiting | "Connecting..." | Amber/Yellow |
| active | "Agent joined" | Emerald/Green |
| ended | "Conversation ended" | Zinc/Gray |

### 5) Create LiveChatInput Component

**File to Create:** `src/components/support/LiveChatInput.tsx`

**Purpose:** Message input with optional image attachment.

**Features:**
- Text input with auto-resize
- Send on Enter (Shift+Enter for newline)
- Image attachment button (uploads to Supabase Storage)
- Disabled when chat is not active

### 6) Create LiveChatMessage Component

**File to Create:** `src/components/support/LiveChatMessage.tsx`

**Purpose:** Individual message bubble with support for images.

**Props:**
```typescript
interface LiveChatMessageProps {
  message: string | null;
  imageUrl: string | null;
  senderType: "user" | "agent" | "system";
  createdAt: string;
}
```

**System Messages:** Styled differently for "Agent joined", "Chat ended", etc.

### 7) Add Help Button to Order Screens

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx`
- `src/components/eats/HelpModal.tsx`

**Changes:**
Add "Live Chat" option to HelpModal that navigates to `/support/chat?context=eats&orderId={orderId}`

```typescript
// Add to helpOptions array
{
  id: "live_chat",
  icon: MessageCircle,
  title: "Live Chat",
  description: "Chat with a support agent now",
  action: () => navigate(`/support/chat?context=eats&orderId=${orderId}`),
}
```

### 8) Add Route to App.tsx

**File to Modify:** `src/App.tsx`

**Add:**
```typescript
const LiveSupportChatPage = lazy(() => import("./pages/support/LiveSupportChatPage"));

// In routes
<Route path="/support/chat" element={<ProtectedRoute><LiveSupportChatPage /></ProtectedRoute>} />
```

### 9) Update types.ts (if tables created)

After creating tables, regenerate Supabase types to include `live_chat_sessions` and `live_chat_messages`.

---

## File Summary

### New Files (6)
| File | Purpose |
|------|---------|
| `src/pages/support/LiveSupportChatPage.tsx` | Main live chat page at /support/chat |
| `src/hooks/useLiveChat.ts` | Hooks for chat sessions, messages, real-time |
| `src/components/support/ChatStatusBanner.tsx` | Status indicator (Connecting/Agent joined/Ended) |
| `src/components/support/LiveChatInput.tsx` | Message input with image attachment |
| `src/components/support/LiveChatMessage.tsx` | Individual message bubble |
| SQL migration | Create live_chat_sessions and live_chat_messages tables |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add /support/chat route |
| `src/components/eats/HelpModal.tsx` | Add "Live Chat" option |
| `src/integrations/supabase/types.ts` | Will be regenerated after table creation |

---

## Access Points Summary

| Location | Component | Action |
|----------|-----------|--------|
| Help page | `/help` | Add "Live Chat" card linking to /support/chat |
| Main menu | AppMore / MobileAccount | Add "Live Chat" menu item |
| Eats Order | HelpModal | Add "Live Chat" option |
| Rides | RiderHelpPage | Add "Live Chat" option |
| Floating widget | LiveChatWidget | Update to use real chat system |

---

## Real-time Flow

```text
User opens /support/chat
        ↓
Create session (status: 'waiting')
        ↓
Subscribe to session changes
        ↓
[System message: "Connecting..."]
        ↓
Admin assigns self to session
  → Update session (status: 'active', agent_id)
        ↓
[System message: "Agent joined"]
        ↓
Real-time message exchange
        ↓
Agent or user ends chat
  → Update session (status: 'ended')
        ↓
[System message: "Conversation ended"]
```

---

## Status Messages

| Event | Display Text |
|-------|--------------|
| Session created | "Connecting..." |
| Waiting for agent | "Finding an available agent" |
| Agent joins | "Agent joined" |
| Agent sends first message | "Hi! I'm [Name] from ZIVO Support. How can I help?" |
| User ends chat | "You ended the chat" |
| Agent ends chat | "The agent ended the chat" |
| Timeout (15 min idle) | "Chat ended due to inactivity" |

---

## Summary

This implementation provides:

1. **Live chat at /support/chat**: Full-featured chat page with real-time messaging
2. **Access from Help modal**: Easy entry from order screens and help pages
3. **Connection status display**: Clear "Connecting...", "Agent joined", "Conversation ended" states
4. **Real-time updates**: Powered by Supabase Realtime subscriptions
5. **Optional image attachments**: Upload images to Supabase Storage
6. **Context awareness**: Passes order/ride context to chat for faster support

The system integrates with the existing ticket/support infrastructure while providing the real-time chat experience customers expect.
