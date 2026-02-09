/**
 * Central table and constants mapping for ZIVO Eats Order Chat
 * Used by customer, driver, and merchant apps
 */

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

export type ChatRole = (typeof CHAT_ROLES)[keyof typeof CHAT_ROLES];

export const QUICK_REPLIES: Record<ChatRole, readonly string[]> = {
  customer: [
    "Where are you?",
    "Please leave at door",
    "Call me when you arrive",
    "I'm coming down now",
    "Need help",
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
  admin: [],
} as const;

// Order statuses that allow sending messages (chat is read-only otherwise)
export const CHAT_ACTIVE_STATUSES = [
  "placed",
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
] as const;

export type ChatActiveStatus = (typeof CHAT_ACTIVE_STATUSES)[number];

/**
 * Check if an order status allows chat messaging
 */
export function isChatActive(status: string | undefined): boolean {
  if (!status) return false;
  return (CHAT_ACTIVE_STATUSES as readonly string[]).includes(status);
}
