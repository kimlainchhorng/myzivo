

# AI Support Assistant — Implementation Plan

## Overview
Replace the existing static `LiveChatWidget` with a real AI-powered support assistant using Lovable AI (already configured). The assistant will answer common questions about orders, ETAs, payments, and troubleshooting, with a clear escalation path to human support.

---

## Current State

| What Exists | Details |
|-------------|---------|
| `LiveChatWidget` | Static mock — hardcoded bot reply, no AI |
| `LOVABLE_API_KEY` | Already provisioned as a Supabase secret |
| `ai-trip-suggestions` edge function | Working Lovable AI pattern to follow |
| Support ticket system | Full ticket CRUD with `support_tickets` table |
| Eats/Rider support hooks | `useEatsSupport`, `useRiderSupport` for ticket creation |

### What's Missing
- No AI-powered chat — widget just returns a canned response
- No streaming — messages appear all at once
- No escalation flow from AI to human support ticket
- No context awareness (order status, user info)

---

## Implementation Plan

### 1) Create `ai-support-chat` Edge Function

**File:** `supabase/functions/ai-support-chat/index.ts`

A streaming edge function that:
- Accepts conversation `messages` array and optional `context` (recent orders, user tier)
- Sends to Lovable AI gateway with a ZIVO support system prompt
- Streams SSE response back to client
- Handles 429/402 errors gracefully

**System prompt covers:**
- Order status explanations (placed, confirmed, preparing, out for delivery, delivered)
- ETA explanation (prep time + delivery time, surge delays)
- Payment help (refunds take 5-10 business days, contact partner for flights)
- Basic troubleshooting (app issues, login problems, missing items)
- When to escalate: safety issues, complex refunds, account problems
- Always offer "Connect to human support" when unsure

### 2) Rewrite `LiveChatWidget` with Streaming AI

**File to Modify:** `src/components/shared/LiveChatWidget.tsx`

Replace the static mock with:
- Real streaming chat using `fetch` + SSE parsing (same pattern as useful-context docs)
- Typing indicator while AI streams
- Auto-scroll to latest message
- Updated quick replies: "Order status", "Payment help", "ETA info", "Talk to human"
- "Connect to human support" button always visible at bottom
- Rate limit / credit error handling with user-friendly toasts

### 3) Add Escalation Flow

**Within `LiveChatWidget`:**

When user clicks "Talk to human" or AI suggests escalation:
- Show a small form: category selector + optional message
- Create a support ticket via existing `support_tickets` table
- Show ticket number confirmation
- Transition chat header to "Connecting to agent..."

### 4) Register Edge Function in Config

**File to Modify:** `supabase/config.toml`

Add:
```
[functions.ai-support-chat]
verify_jwt = false
```

---

## File Summary

### New Files (1)
| File | Purpose |
|------|---------|
| `supabase/functions/ai-support-chat/index.ts` | Streaming AI support edge function |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/components/shared/LiveChatWidget.tsx` | Full rewrite: streaming AI chat + escalation |
| `supabase/config.toml` | Register new edge function |

---

## Chat Flow

```text
User opens chat widget
       |
       v
  Welcome message: "Hi! I'm ZIVO AI Assistant."
  Quick replies: [Order status] [Payment help] [ETA info] [Talk to human]
       |
       v
  User sends message (or taps quick reply)
       |
       v
  POST to ai-support-chat edge function (streaming)
       |
       ├── AI streams response token by token
       ├── Typing indicator shown during stream
       └── Response rendered progressively
       |
       v
  If AI suggests escalation or user taps "Talk to human":
       |
       ├── Show category picker (Payment, Order, Safety, Other)
       ├── Create support ticket in DB
       ├── Show: "Ticket ZS-XXXXXX created. A human agent will reply shortly."
       └── Chat remains open for continued AI help
```

---

## AI System Prompt Summary

The edge function system prompt will instruct the AI to:
- Be concise, friendly, and helpful
- Answer from ZIVO's known policies (order flow, ETA calculation, refund timelines)
- Never make up specific order details — say "I can help explain how X works" rather than fabricating data
- Suggest "Connect to human support" for: safety concerns, complex disputes, account issues, anything it cannot confidently answer
- Keep responses under 150 words
- Use simple language, no jargon

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Rate limit (429) | Toast: "AI busy, please try again in a moment" |
| Credits exhausted (402) | Toast: "Service temporarily unavailable" |
| Network error | Show retry button, keep previous messages |
| User not logged in | AI still works; escalation prompts login |
| Very long conversation | Send last 20 messages to AI (context window management) |
| User spams messages | Disable send button while AI is streaming |
