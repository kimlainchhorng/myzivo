/**
 * Flights Launch Settings Types
 * Types for the Flights TEST → LIVE launch system
 */

export type FlightsLaunchStatus = 'test' | 'live';

export interface FlightsLaunchSettings {
  id: string;
  status: FlightsLaunchStatus;
  status_changed_at: string | null;
  status_changed_by: string | null;
  
  // Pre-launch checklist
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
  
  // Post-launch tracking
  first_booking_at: string | null;
  first_ticket_issued_at: string | null;
  first_failure_at: string | null;
  
  // Emergency controls
  emergency_pause: boolean;
  emergency_pause_reason: string | null;
  emergency_pause_at: string | null;
  emergency_pause_by: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface FlightsLaunchChecklist {
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
}

export interface FlightsGoLivePayload {
  status: 'live';
  status_changed_at: string;
  status_changed_by: string;
}

export interface ChecklistItem {
  key: keyof FlightsLaunchChecklist;
  label: string;
  description: string;
}

export const LAUNCH_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    key: 'seller_of_travel_verified',
    label: 'Seller of Travel page verified',
    description: 'SOT registration info displayed at /legal/seller-of-travel',
  },
  {
    key: 'terms_privacy_linked',
    label: 'Terms & Privacy linked',
    description: 'Legal pages accessible and linked from checkout',
  },
  {
    key: 'support_email_configured',
    label: 'Support email configured',
    description: 'Customer support contact available',
  },
  {
    key: 'stripe_live_enabled',
    label: 'Stripe LIVE enabled',
    description: 'Production Stripe API key configured',
  },
  {
    key: 'duffel_live_configured',
    label: 'Duffel LIVE configured',
    description: 'Production Duffel API key set in environment',
  },
];
