/**
 * Flights Launch Settings Types
 * Types for the 3-phase Flights launch system with incident management
 * Phases: Internal Test → Private Beta → Public Live
 */

export type FlightsLaunchStatus = 'test' | 'live';

/**
 * 3-tier launch phase system
 */
export type FlightsLaunchPhase = 'internal_test' | 'private_beta' | 'public_live';

export const LAUNCH_PHASE_CONFIG: Record<FlightsLaunchPhase, { 
  label: string; 
  description: string; 
  color: string;
  icon: string;
}> = {
  internal_test: {
    label: 'Internal Test',
    description: 'Admins only. Testing with sandbox/test keys.',
    color: 'bg-slate-500/20 text-slate-600 border-slate-500/30',
    icon: '🔒',
  },
  private_beta: {
    label: 'Private Beta',
    description: 'Invited users only. Real payments, monitored closely.',
    color: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
    icon: '🧪',
  },
  public_live: {
    label: 'Public Live',
    description: 'Open to all users. Full production mode.',
    color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    icon: '🚀',
  },
};

/**
 * Incident reason codes for structured pause categorization
 */
export type IncidentReasonCode = 
  | 'airline_outage'      // Airline system outage
  | 'pricing_issue'       // Pricing inconsistency
  | 'payment_issue'       // Payment provider issue
  | 'maintenance'         // Scheduled maintenance
  | 'duffel_outage'       // Duffel API down
  | 'failure_spike'       // Auto-pause due to failure threshold
  | 'other';              // Other

export const INCIDENT_REASONS: { code: IncidentReasonCode; label: string; description: string }[] = [
  { code: 'airline_outage', label: 'Airline System Outage', description: 'Airline GDS or booking system is down' },
  { code: 'pricing_issue', label: 'Pricing Inconsistency', description: 'Fare discrepancies or incorrect prices' },
  { code: 'payment_issue', label: 'Payment Provider Issue', description: 'Stripe or payment processing problem' },
  { code: 'duffel_outage', label: 'Duffel API Outage', description: 'Duffel ticketing API not responding' },
  { code: 'maintenance', label: 'Scheduled Maintenance', description: 'Planned system maintenance' },
  { code: 'failure_spike', label: 'Failure Spike', description: 'Multiple booking failures detected' },
  { code: 'other', label: 'Other', description: 'Other issue requiring pause' },
];

export interface FlightsLaunchSettings {
  id: string;
  status: FlightsLaunchStatus;
  status_changed_at: string | null;
  status_changed_by: string | null;
  
  // 3-tier launch phase
  launch_phase: FlightsLaunchPhase;
  beta_invite_required: boolean;
  beta_invite_code: string | null;
  
  // Launch announcement
  launch_announcement_enabled: boolean;
  launch_announcement_text: string | null;
  
  // Pre-launch checklist
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
  refund_flow_tested: boolean;
  
  // Post-launch tracking
  first_booking_at: string | null;
  first_ticket_issued_at: string | null;
  first_failure_at: string | null;
  
  // Emergency controls
  emergency_pause: boolean;
  emergency_pause_reason: string | null;
  emergency_pause_at: string | null;
  emergency_pause_by: string | null;
  
  // Incident tracking
  incident_reason_code: IncidentReasonCode | null;
  incident_started_at: string | null;
  incident_notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface FlightsLaunchChecklist {
  seller_of_travel_verified: boolean;
  terms_privacy_linked: boolean;
  support_email_configured: boolean;
  stripe_live_enabled: boolean;
  duffel_live_configured: boolean;
  refund_flow_tested: boolean;
}

export interface FlightsGoLivePayload {
  status: 'live';
  status_changed_at: string;
  status_changed_by: string;
}

export interface FlightIncidentLog {
  id: string;
  incident_type: 'manual_pause' | 'auto_pause' | 'failure_spike' | 'api_outage';
  reason_code: IncidentReasonCode;
  description: string | null;
  started_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  affected_bookings_count: number;
  affected_booking_ids: string[];
  failure_count_trigger: number | null;
  customers_notified: number;
  customers_resolved: number;
  created_at: string;
  updated_at: string;
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
