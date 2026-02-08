/**
 * Central table mapping for ZIVO Eats
 * Used by both customer app and merchant app for consistency
 */

export const EATS_TABLES = {
  restaurants: "restaurants",
  menuItems: "menu_items",
  orders: "food_orders",
  orderItems: null, // Items stored as JSONB in food_orders.items
  reviews: "eats_reviews",
  promoCodes: "promo_codes",
  drivers: "drivers",
  addresses: "saved_locations",
  notifications: "notifications",
} as const;

// Merchant dashboard URL (separate Lovable project)
export const MERCHANT_APP_URL = "https://zivorestaurant.lovable.app";

// Order statuses that trigger merchant notifications
export const MERCHANT_ALERT_STATUSES = ["placed", "pending"] as const;

// Status that customer orders start with (for merchant to see)
export const INITIAL_ORDER_STATUS = "placed" as const;
