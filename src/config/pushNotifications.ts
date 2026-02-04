/**
 * Push Notification Configuration
 * Templates and preferences for ZIVO notifications
 */

export const PUSH_NOTIFICATION_TYPES = {
  PRICE_DROP: {
    id: "price_drop",
    title: "Price Drop Alert! 📉",
    body: "Prices for {route} dropped to ${price}!",
    icon: "bell",
    category: "alerts",
  },
  BOOKING_CONFIRMED: {
    id: "booking_confirmed",
    title: "Booking Confirmed ✅",
    body: "Your {service} booking is confirmed. Ref: {reference}",
    icon: "check-circle",
    category: "bookings",
  },
  TRIP_REMINDER: {
    id: "trip_reminder",
    title: "Trip Reminder 🗓️",
    body: "Your flight to {destination} departs in 24 hours.",
    icon: "plane",
    category: "reminders",
  },
  TRIP_CHECKIN: {
    id: "trip_checkin",
    title: "Check-in Open ✈️",
    body: "Online check-in is now available for your {airline} flight to {destination}.",
    icon: "clipboard-check",
    category: "reminders",
  },
  DEAL_ALERT: {
    id: "deal_alert",
    title: "Deal Alert! 🔥",
    body: "Flash sale: Flights to {destination} from ${price}.",
    icon: "flame",
    category: "marketing",
  },
  BOOKING_UPDATE: {
    id: "booking_update",
    title: "Booking Update",
    body: "There's an update to your {service} booking. Tap to view details.",
    icon: "info",
    category: "bookings",
  },
  PAYMENT_SUCCESS: {
    id: "payment_success",
    title: "Payment Successful 💳",
    body: "Your payment of ${amount} has been processed.",
    icon: "credit-card",
    category: "payments",
  },
  REFUND_PROCESSED: {
    id: "refund_processed",
    title: "Refund Processed",
    body: "Your refund of ${amount} has been processed and will appear in 5-10 business days.",
    icon: "refresh-cw",
    category: "payments",
  },
} as const;

export type NotificationType = keyof typeof PUSH_NOTIFICATION_TYPES;

export interface NotificationPreferences {
  priceAlerts: boolean;
  bookingConfirmations: boolean;
  tripReminders: boolean;
  dealAlerts: boolean;
  marketing: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  priceAlerts: true,
  bookingConfirmations: true,
  tripReminders: true,
  dealAlerts: true,
  marketing: false, // Opt-in for marketing
};

/**
 * Notification categories with descriptions
 */
export const NOTIFICATION_CATEGORIES = {
  alerts: {
    label: "Price Alerts",
    description: "Get notified when prices drop for routes you're tracking.",
  },
  bookings: {
    label: "Booking Updates",
    description: "Confirmations, changes, and updates to your bookings.",
  },
  reminders: {
    label: "Trip Reminders",
    description: "Check-in reminders and trip notifications.",
  },
  payments: {
    label: "Payment Notifications",
    description: "Payment confirmations and refund updates.",
  },
  marketing: {
    label: "Deals & Promotions",
    description: "Flash sales, exclusive deals, and special offers.",
  },
} as const;

/**
 * Helper to format notification body with dynamic values
 */
export function formatNotificationBody(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

/**
 * Storage keys for notification preferences
 */
export const NOTIFICATION_STORAGE_KEYS = {
  PREFERENCES: "zivo_notification_preferences",
  PUSH_TOKEN: "zivo_push_token",
  PERMISSION_ASKED: "zivo_notification_permission_asked",
} as const;
