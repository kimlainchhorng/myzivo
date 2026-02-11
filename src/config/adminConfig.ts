/**
 * Admin Configuration
 * Centralized config for admin dashboard settings
 */

// Authorized admin emails - DEFENSE-IN-DEPTH only.
// The authoritative source is the `user_roles` table via `check_user_role` RPC.
// This client-side list is an additional UI-level check, NOT a security boundary.
export const ADMIN_EMAILS = [
  "admin@zivo.com",
  "ops@zivo.com",
  "support@zivo.com",
  "chhorngkimlain1@gmail.com",
  // Add more authorized admin emails here
];

// Commission rates
export const PLATFORM_COMMISSION_RATE = 0.15; // 15% platform fee
export const DRIVER_SHARE_RATE = 0.85; // 85% driver earnings

// Ride status options for filtering
export const RIDE_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "en_route", label: "En Route" },
  { value: "arrived", label: "Arrived" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

// Payout status options
export const PAYOUT_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
] as const;

// Required environment variables
export const REQUIRED_ENV_VARS = [
  { 
    key: "VITE_SUPABASE_URL", 
    description: "Supabase project URL",
    example: "https://xxxxxxxxxxxx.supabase.co"
  },
  { 
    key: "VITE_SUPABASE_ANON_KEY", 
    description: "Supabase anonymous/public key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
] as const;

// Check if email is authorized admin
export const isAuthorizedAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
