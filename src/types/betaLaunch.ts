/**
 * Beta Launch Types
 * Types for the beta launch checklist and status tracking
 */

export type BetaLaunchState = 'not_ready' | 'ready_for_beta' | 'beta_live' | 'paused';

export interface BetaLaunchStatus {
  id: string;
  status: BetaLaunchState;
  activated_at: string | null;
  paused_at: string | null;
  notes: string | null;
  activated_by: string | null;
  paused_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BetaChecklist {
  id: string;
  // Day 1: Platform Check
  day1_homepage_loads: boolean;
  day1_cars_page_loads: boolean;
  day1_list_car_page_loads: boolean;
  day1_login_works: boolean;
  day1_owner_routing_works: boolean;
  day1_renter_routing_works: boolean;
  day1_admin_routing_works: boolean;
  day1_footer_links_work: boolean;
  day1_completed_at: string | null;
  day1_completed_by: string | null;
  
  // Day 2: Payments & Insurance
  day2_stripe_test_payment: boolean;
  day2_stripe_connect_payout: boolean;
  day2_commission_deducted: boolean;
  day2_insurance_disclosure_visible: boolean;
  day2_completed_at: string | null;
  day2_completed_by: string | null;
  
  // Day 3: Owner Flow
  day3_owner_signup_works: boolean;
  day3_vehicle_upload_works: boolean;
  day3_2018_rule_enforced: boolean;
  day3_admin_approval_works: boolean;
  day3_owner_dashboard_shows_data: boolean;
  day3_completed_at: string | null;
  day3_completed_by: string | null;
  
  // Day 4: Renter Flow
  day4_renter_signup_works: boolean;
  day4_license_verification_works: boolean;
  day4_booking_blocked_without_verification: boolean;
  day4_confirmation_email_works: boolean;
  day4_completed_at: string | null;
  day4_completed_by: string | null;
  
  // Day 5: Disputes & Failsafes
  day5_damage_report_works: boolean;
  day5_dispute_panel_loads: boolean;
  day5_payout_hold_works: boolean;
  day5_cancellation_works: boolean;
  day5_completed_at: string | null;
  day5_completed_by: string | null;
  
  // Day 6: City Launch Control
  day6_city_status_live: boolean;
  day6_only_live_city_cars_shown: boolean;
  day6_non_live_cities_blocked: boolean;
  day6_waitlist_shown_when_beta: boolean;
  day6_completed_at: string | null;
  day6_completed_by: string | null;
  
  // Day 7: Beta Go Live
  day7_first_renters_invited: boolean;
  day7_bookings_enabled: boolean;
  day7_first_transaction_monitored: boolean;
  day7_support_contact_visible: boolean;
  day7_completed_at: string | null;
  day7_completed_by: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  description?: string;
}

export interface DayConfig {
  day: number;
  title: string;
  description: string;
  items: ChecklistItem[];
  completedAtKey: string;
  completedByKey: string;
}

export const CHECKLIST_DAYS: DayConfig[] = [
  {
    day: 1,
    title: "Platform Check",
    description: "Verify core website and app functionality",
    items: [
      { key: "day1_homepage_loads", label: "Website homepage loads correctly", description: "Test the / route" },
      { key: "day1_cars_page_loads", label: "/cars page loads correctly", description: "Public vehicle browse page" },
      { key: "day1_list_car_page_loads", label: "/list-your-car page loads correctly", description: "Owner signup landing page" },
      { key: "day1_login_works", label: "Login/signup works", description: "Test email and OAuth login" },
      { key: "day1_owner_routing_works", label: "Owner routes to /owner/dashboard", description: "After login as owner" },
      { key: "day1_renter_routing_works", label: "Renter routes to /renter/dashboard", description: "After login as renter" },
      { key: "day1_admin_routing_works", label: "Admin routes to /admin", description: "After login as admin" },
      { key: "day1_footer_links_work", label: "Footer legal links work", description: "Terms, Privacy, Cookies, etc." },
    ],
    completedAtKey: "day1_completed_at",
    completedByKey: "day1_completed_by",
  },
  {
    day: 2,
    title: "Payments & Insurance",
    description: "Verify Stripe and insurance disclosures",
    items: [
      { key: "day2_stripe_test_payment", label: "Stripe test payment completed", description: "Process a test card payment" },
      { key: "day2_stripe_connect_payout", label: "Stripe Connect owner payout tested", description: "Verify owner receives payout" },
      { key: "day2_commission_deducted", label: "Commission deducted correctly (20%)", description: "Check platform fee calculation" },
      { key: "day2_insurance_disclosure_visible", label: "Insurance disclosure visible at checkout", description: "Verify insurance terms shown" },
    ],
    completedAtKey: "day2_completed_at",
    completedByKey: "day2_completed_by",
  },
  {
    day: 3,
    title: "Owner Flow Test",
    description: "Verify complete owner onboarding and dashboard",
    items: [
      { key: "day3_owner_signup_works", label: "Owner signup works", description: "Complete owner registration" },
      { key: "day3_vehicle_upload_works", label: "Vehicle upload works", description: "Add a vehicle with photos" },
      { key: "day3_2018_rule_enforced", label: "2018+ rule enforced", description: "Older vehicles should be rejected" },
      { key: "day3_admin_approval_works", label: "Admin approval works", description: "Approve/reject owner from admin" },
      { key: "day3_owner_dashboard_shows_data", label: "Owner dashboard shows car & earnings", description: "Verify data display" },
    ],
    completedAtKey: "day3_completed_at",
    completedByKey: "day3_completed_by",
  },
  {
    day: 4,
    title: "Renter Flow Test",
    description: "Verify complete renter booking flow",
    items: [
      { key: "day4_renter_signup_works", label: "Renter signup works", description: "Complete renter registration" },
      { key: "day4_license_verification_works", label: "Driver license verification works", description: "Upload and verify license" },
      { key: "day4_booking_blocked_without_verification", label: "Booking blocked until verified", description: "Unverified renters cannot book" },
      { key: "day4_confirmation_email_works", label: "Booking confirmation email works", description: "Email sent after booking" },
    ],
    completedAtKey: "day4_completed_at",
    completedByKey: "day4_completed_by",
  },
  {
    day: 5,
    title: "Disputes & Failsafes",
    description: "Verify dispute handling and safety controls",
    items: [
      { key: "day5_damage_report_works", label: "Damage report submission works", description: "Submit and view damage report" },
      { key: "day5_dispute_panel_loads", label: "Admin dispute panel loads", description: "View disputes in admin" },
      { key: "day5_payout_hold_works", label: "Payout hold works when dispute exists", description: "Payouts blocked during disputes" },
      { key: "day5_cancellation_works", label: "Booking cancellation works", description: "Cancel a booking successfully" },
    ],
    completedAtKey: "day5_completed_at",
    completedByKey: "day5_completed_by",
  },
  {
    day: 6,
    title: "City Launch Control",
    description: "Verify geographic launch controls",
    items: [
      { key: "day6_city_status_live", label: "City launch status set to LIVE", description: "At least one city is live" },
      { key: "day6_only_live_city_cars_shown", label: "Only LIVE city cars appear in search", description: "Non-live cities hidden" },
      { key: "day6_non_live_cities_blocked", label: "Non-live cities blocked", description: "Cannot book in non-live cities" },
      { key: "day6_waitlist_shown_when_beta", label: "Waitlist shown when beta mode ON", description: "Renter waitlist works" },
    ],
    completedAtKey: "day6_completed_at",
    completedByKey: "day6_completed_by",
  },
  {
    day: 7,
    title: "Beta Go Live",
    description: "Final checks before opening to beta users",
    items: [
      { key: "day7_first_renters_invited", label: "First renters invited", description: "Send beta invites" },
      { key: "day7_bookings_enabled", label: "Bookings enabled", description: "Booking flow is active" },
      { key: "day7_first_transaction_monitored", label: "First transactions monitored", description: "Watch initial bookings" },
      { key: "day7_support_contact_visible", label: "Support contact visible", description: "Help/support info shown" },
    ],
    completedAtKey: "day7_completed_at",
    completedByKey: "day7_completed_by",
  },
];
