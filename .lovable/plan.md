
# Live Support Join in Order Chat

## Overview

Two chat systems exist side by side but never connect:
- **Order Chat** (`order_chats` / `chat_messages`): 3-party chat between Customer, Driver, Merchant
- **Live Support Chat** (`live_chat_sessions` / `live_chat_messages`): Separate 1:1 support chat

The goal is to let customers tap "Request Support" inside the order chat, which creates a `live_chat_sessions` record linked to that order. When a support agent picks it up, the agent is added to the existing `chat_members` table as role `admin`, and a system message appears in the order chat: "Support is joining the chat..." followed by "Support agent joined."

This keeps both systems in sync -- the support queue sees the request, and all messages flow through the existing order chat channel.

## What Changes

### 1. New hook: `useOrderSupportRequest` (new file)

Handles the full lifecycle of requesting support inside an order chat:
- **Request**: Creates a `live_chat_sessions` row with `context_type = 'order_chat'` and `context_id = orderId`, status `waiting`
- **Status tracking**: Subscribes to real-time updates on that session (waiting, active, ended)
- **Agent join detection**: When the session status changes to `active`, inserts the agent as an `admin` member in `chat_members` and posts a system message to `chat_messages`
- **Check existing**: On mount, checks if there is already an active/waiting support session for this order

### 2. New component: `RequestSupportButton` (new file)

A button placed in the order chat header that shows three states:
- **Default**: "Request Support" with a headset icon
- **Waiting**: "Support is joining..." with a spinner (after request, before agent joins)
- **Active**: "Support joined" checkmark badge (agent is in the chat)

Includes a confirmation dialog before requesting to prevent accidental taps.

### 3. Update `OrderChatPage.tsx`

- Import and render `RequestSupportButton` in the header bar (next to the read-only badge area)
- When support status changes to `active`, show a toast notification: "A support agent has joined the chat"

### 4. Update `chatTables.ts`

- Add a "Request Support" quick reply option for the `customer` role
- No changes to `CHAT_ROLES` needed -- `admin` role already exists

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useOrderSupportRequest.ts` | Create | Hook to request, track, and detect agent join |
| `src/components/eats/RequestSupportButton.tsx` | Create | Header button with waiting/active states |
| `src/components/eats/OrderChatPage.tsx` | Update | Add RequestSupportButton to header, toast on agent join |
| `src/lib/chatTables.ts` | Update | Add "Need help" to customer quick replies |

## Technical Details

### useOrderSupportRequest hook

```text
Input: orderId, chatId

On mount:
  Query live_chat_sessions WHERE context_type = 'order_chat' AND context_id = orderId AND status IN ('waiting', 'active')
  If found => set supportStatus to that session's status

requestSupport():
  1. Insert into live_chat_sessions: { user_id, context_type: 'order_chat', context_id: orderId, status: 'waiting' }
  2. Insert system message into chat_messages: { chat_id, sender_type: 'admin', message: 'Support has been requested. An agent will join shortly...' }
  3. Set local state to 'waiting'

Real-time subscription on the live_chat_sessions row:
  On UPDATE to status = 'active':
    1. Read agent_id from the session
    2. Insert into chat_members: { chat_id, user_id: agent_id, role: 'admin' }
    3. Insert system message: 'A support agent has joined the chat'
    4. Set local state to 'active'
    5. Fire onAgentJoined callback

  On UPDATE to status = 'ended':
    1. Insert system message: 'Support agent has left the chat'
    2. Set local state to 'ended'

Returns: { supportStatus, requestSupport, isRequesting, supportSessionId }
```

### RequestSupportButton component

```text
Props: orderId, chatId, onAgentJoined

Three visual states:
  null/ended => Button: "Request Support" (headset icon, outline variant)
  'waiting'  => Button: "Support joining..." (spinner, disabled, amber border)
  'active'   => Badge: "Support joined" (checkmark, emerald)

Confirmation dialog before requesting:
  Title: "Request live support?"
  Body: "A support agent will join this chat to help with your order."
  Actions: Cancel / Request Support
```

### Notification on agent join

When the real-time subscription detects `status = 'active'`:
- Toast notification: "Support agent joined" with a headset icon
- Insert a notification row into the `notifications` table for the customer so it appears in their notification center

### System messages in order chat

System messages use `sender_type: 'admin'` with `sender_id: null` and are rendered differently in the existing `MessageBubble` component. A small update adds a centered system-message style when `sender_id` is null and `sender_type` is `admin`.

### Edge Cases

- **Chat is read-only**: Hide the Request Support button when `isChatActive()` returns false
- **Support already requested**: Hook detects existing waiting/active session on mount and shows correct state
- **Agent never joins**: User can cancel the request (updates session to `ended`)
- **Multiple requests**: Only one active/waiting support session per order -- hook prevents duplicate requests
- **Agent leaves and re-requests**: After session ends, the button returns to default state and allows a new request
