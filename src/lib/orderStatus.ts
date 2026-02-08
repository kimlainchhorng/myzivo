/**
 * Central Order Status Constants & Helpers
 * Single source of truth for all Eats order status logic
 * Used by customer, merchant, driver, and admin apps
 */

// ============================================
// STANDARD EATS ORDER STATUSES
// Use these exact strings everywhere
// ============================================
export const EatsOrderStatus = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type EatsOrderStatusType = typeof EatsOrderStatus[keyof typeof EatsOrderStatus];

// All valid statuses in order
export const EATS_STATUS_ORDER: EatsOrderStatusType[] = [
  EatsOrderStatus.PLACED,
  EatsOrderStatus.CONFIRMED,
  EatsOrderStatus.PREPARING,
  EatsOrderStatus.READY,
  EatsOrderStatus.OUT_FOR_DELIVERY,
  EatsOrderStatus.DELIVERED,
];

// ============================================
// ACTOR ROLES FOR AUDIT TRAIL
// ============================================
export const ActorRole = {
  CUSTOMER: "customer",
  MERCHANT: "merchant",
  DRIVER: "driver",
  SYSTEM: "system",
  ADMIN: "admin",
} as const;

export type ActorRoleType = typeof ActorRole[keyof typeof ActorRole];

// ============================================
// STATUS TRANSITION RULES
// ============================================

// What statuses a MERCHANT can transition TO from each status
const MERCHANT_TRANSITIONS: Record<string, EatsOrderStatusType[]> = {
  [EatsOrderStatus.PLACED]: [EatsOrderStatus.CONFIRMED, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.CONFIRMED]: [EatsOrderStatus.PREPARING, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.PREPARING]: [EatsOrderStatus.READY, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.READY]: [], // Driver takes over from here
};

// What statuses a DRIVER can transition TO from each status
const DRIVER_TRANSITIONS: Record<string, EatsOrderStatusType[]> = {
  [EatsOrderStatus.READY]: [EatsOrderStatus.OUT_FOR_DELIVERY],
  [EatsOrderStatus.OUT_FOR_DELIVERY]: [EatsOrderStatus.DELIVERED],
};

// Admin can do anything except modify locked orders
const ADMIN_TRANSITIONS: Record<string, EatsOrderStatusType[]> = {
  [EatsOrderStatus.PLACED]: [EatsOrderStatus.CONFIRMED, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.CONFIRMED]: [EatsOrderStatus.PREPARING, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.PREPARING]: [EatsOrderStatus.READY, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.READY]: [EatsOrderStatus.OUT_FOR_DELIVERY, EatsOrderStatus.CANCELLED],
  [EatsOrderStatus.OUT_FOR_DELIVERY]: [EatsOrderStatus.DELIVERED, EatsOrderStatus.CANCELLED],
};

// ============================================
// LOCKED STATES - No modifications allowed
// ============================================
const LOCKED_STATUSES: EatsOrderStatusType[] = [
  EatsOrderStatus.DELIVERED,
  EatsOrderStatus.CANCELLED,
];

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Check if a merchant can update order from current to next status
 */
export function canMerchantUpdateStatus(current: string, next: string): boolean {
  if (isOrderLocked(current)) return false;
  const allowedTransitions = MERCHANT_TRANSITIONS[current] || [];
  return allowedTransitions.includes(next as EatsOrderStatusType);
}

/**
 * Check if a driver can update order from current to next status
 */
export function canDriverUpdateStatus(current: string, next: string): boolean {
  if (isOrderLocked(current)) return false;
  const allowedTransitions = DRIVER_TRANSITIONS[current] || [];
  return allowedTransitions.includes(next as EatsOrderStatusType);
}

/**
 * Check if an admin can update order from current to next status
 */
export function canAdminUpdateStatus(current: string, next: string): boolean {
  if (isOrderLocked(current)) return false;
  const allowedTransitions = ADMIN_TRANSITIONS[current] || [];
  return allowedTransitions.includes(next as EatsOrderStatusType);
}

/**
 * Get the next status options available for a given role
 */
export function getNextStatusOptions(role: ActorRoleType, currentStatus: string): EatsOrderStatusType[] {
  if (isOrderLocked(currentStatus)) return [];

  switch (role) {
    case ActorRole.MERCHANT:
      return MERCHANT_TRANSITIONS[currentStatus] || [];
    case ActorRole.DRIVER:
      return DRIVER_TRANSITIONS[currentStatus] || [];
    case ActorRole.ADMIN:
      return ADMIN_TRANSITIONS[currentStatus] || [];
    default:
      return [];
  }
}

/**
 * Check if an order is in a locked state (cannot be modified)
 */
export function isOrderLocked(status: string): boolean {
  return LOCKED_STATUSES.includes(status as EatsOrderStatusType);
}

/**
 * Validate if a transition is valid for any role
 */
export function isValidTransition(current: string, next: string, role: ActorRoleType): boolean {
  switch (role) {
    case ActorRole.MERCHANT:
      return canMerchantUpdateStatus(current, next);
    case ActorRole.DRIVER:
      return canDriverUpdateStatus(current, next);
    case ActorRole.ADMIN:
      return canAdminUpdateStatus(current, next);
    default:
      return false;
  }
}

// ============================================
// DISPLAY HELPERS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  [EatsOrderStatus.PLACED]: "Order Placed",
  [EatsOrderStatus.CONFIRMED]: "Confirmed",
  [EatsOrderStatus.PREPARING]: "Preparing",
  [EatsOrderStatus.READY]: "Ready for Pickup",
  [EatsOrderStatus.OUT_FOR_DELIVERY]: "Out for Delivery",
  [EatsOrderStatus.DELIVERED]: "Delivered",
  [EatsOrderStatus.CANCELLED]: "Cancelled",
  // Legacy mappings for backwards compatibility
  pending: "Order Placed",
  in_progress: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  completed: "Delivered",
};

/**
 * Get human-readable label for a status
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Get the appropriate CSS color class for a status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case EatsOrderStatus.PLACED:
      return "text-blue-400";
    case EatsOrderStatus.CONFIRMED:
      return "text-emerald-400";
    case EatsOrderStatus.PREPARING:
      return "text-yellow-400";
    case EatsOrderStatus.READY:
      return "text-orange-400";
    case EatsOrderStatus.OUT_FOR_DELIVERY:
      return "text-purple-400";
    case EatsOrderStatus.DELIVERED:
      return "text-green-400";
    case EatsOrderStatus.CANCELLED:
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
}

// ============================================
// TIMESTAMP FIELD MAPPING
// ============================================

const STATUS_TIMESTAMP_FIELDS: Record<string, string> = {
  [EatsOrderStatus.PLACED]: "placed_at",
  [EatsOrderStatus.CONFIRMED]: "accepted_at",
  [EatsOrderStatus.PREPARING]: "prepared_at",
  [EatsOrderStatus.READY]: "ready_at",
  [EatsOrderStatus.OUT_FOR_DELIVERY]: "picked_up_at",
  [EatsOrderStatus.DELIVERED]: "delivered_at",
  [EatsOrderStatus.CANCELLED]: "cancelled_at",
};

/**
 * Get the timestamp column name for a given status
 */
export function getStatusTimestampField(status: string): string {
  return STATUS_TIMESTAMP_FIELDS[status] || "updated_at";
}

// ============================================
// LEGACY STATUS MAPPING
// Maps old status values to new standard ones
// ============================================

const LEGACY_STATUS_MAP: Record<string, EatsOrderStatusType> = {
  pending: EatsOrderStatus.PLACED,
  in_progress: EatsOrderStatus.PREPARING,
  ready_for_pickup: EatsOrderStatus.READY,
  completed: EatsOrderStatus.DELIVERED,
};

/**
 * Normalize a legacy status to the standard format
 */
export function normalizeStatus(status: string): EatsOrderStatusType {
  if (Object.values(EatsOrderStatus).includes(status as EatsOrderStatusType)) {
    return status as EatsOrderStatusType;
  }
  return LEGACY_STATUS_MAP[status] || EatsOrderStatus.PLACED;
}

/**
 * Get the index of a status in the order flow (for timeline progress)
 */
export function getStatusIndex(status: string): number {
  const normalized = normalizeStatus(status);
  const index = EATS_STATUS_ORDER.indexOf(normalized);
  return index >= 0 ? index : 0;
}

// ============================================
// TOAST MESSAGES FOR STATUS CHANGES
// ============================================

export interface StatusMessage {
  title: string;
  description: string;
  type: "success" | "info" | "warning" | "error";
}

const STATUS_MESSAGES: Record<string, StatusMessage> = {
  [EatsOrderStatus.PLACED]: {
    title: "Order Placed",
    description: "Your order is being reviewed",
    type: "info",
  },
  [EatsOrderStatus.CONFIRMED]: {
    title: "Order Confirmed",
    description: "Restaurant has accepted your order",
    type: "success",
  },
  [EatsOrderStatus.PREPARING]: {
    title: "Preparing Your Order",
    description: "The restaurant is preparing your food",
    type: "info",
  },
  [EatsOrderStatus.READY]: {
    title: "Order Ready",
    description: "Your order is ready for pickup",
    type: "success",
  },
  [EatsOrderStatus.OUT_FOR_DELIVERY]: {
    title: "On the Way",
    description: "Your order is out for delivery",
    type: "info",
  },
  [EatsOrderStatus.DELIVERED]: {
    title: "Delivered",
    description: "Enjoy your meal!",
    type: "success",
  },
  [EatsOrderStatus.CANCELLED]: {
    title: "Order Cancelled",
    description: "Your order has been cancelled",
    type: "warning",
  },
};

/**
 * Get toast message for a status change
 */
export function getStatusMessage(status: string): StatusMessage | null {
  return STATUS_MESSAGES[status] || null;
}
