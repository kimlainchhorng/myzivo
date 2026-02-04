/**
 * ZIVO Email Automation Configuration
 * 
 * Centralized config for all automated email types.
 * COMPLIANCE: Only informational, opt-in emails. No spam, no cashback, no pressure.
 */

// ================================
// EMAIL TYPES (SAFE & REQUIRED)
// ================================
export const EMAIL_TYPES = {
  // 1. Account Emails
  ACCOUNT_CONFIRMATION: {
    id: "account_confirmation",
    name: "Account Confirmation",
    description: "Sent on signup. Confirms account creation.",
    triggerEvent: "user.created",
    canDisable: false,
  },
  
  // 2. Booking Emails
  BOOKING_CONFIRMATION: {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    description: "Sent when booking is initiated. Informs user about partner processing.",
    triggerEvent: "booking.created",
    canDisable: false,
    template: {
      subject: "Your booking request has been received ✈️",
      bodyPreview: "Thank you for using ZIVO. Your booking is being processed by our travel partner.",
    },
  },
  BOOKING_STATUS: {
    id: "booking_status",
    name: "Booking Status Update",
    description: "Sent when booking status changes (confirmed, cancelled, etc.)",
    triggerEvent: "booking.status_changed",
    canDisable: false,
  },
  
  // 3. Price Alerts (Opt-in)
  PRICE_ALERT: {
    id: "price_alert",
    name: "Price Drop Alert",
    description: "Sent when tracked route price drops below threshold.",
    triggerEvent: "price.dropped",
    canDisable: true,
    requiresOptIn: true,
    template: {
      subject: "Price drop alert for your trip 👀",
      bodyPreview: "Good news! Prices for your tracked route have changed.",
      ctaText: "View updated prices",
    },
  },
  
  // 4. Trip Reminders
  TRIP_REMINDER: {
    id: "trip_reminder",
    name: "Upcoming Trip Reminder",
    description: "Sent 3-5 days before departure.",
    triggerEvent: "trip.reminder",
    canDisable: true,
    template: {
      subject: "Your trip is coming up 🗓️",
      bodyPreview: "Your trip is coming up. Check your booking details with your provider.",
      ctaText: "Manage booking",
    },
    timing: {
      daysBefore: [5, 3], // Send at 5 days and 3 days before
    },
  },
  
  // 5. Abandoned Search Recovery
  ABANDONED_SEARCH: {
    id: "abandoned_search",
    name: "Abandoned Search Reminder",
    description: "Sent 24-48h after user searched but didn't checkout.",
    triggerEvent: "search.abandoned",
    canDisable: true,
    template: {
      subject: "Still comparing prices for your trip?",
      bodyPreview: "Prices for your searched route may change. Compare options again before prices increase.",
      ctaText: "Compare prices",
    },
    timing: {
      delayMinutes: 45, // Initial delay before first email
      maxEmails: 1, // Only send once per search
    },
  },
} as const;

export type EmailTypeId = keyof typeof EMAIL_TYPES;

// ================================
// EMAIL COPY & COMPLIANCE
// ================================
export const EMAIL_COMPLIANCE = {
  // Required disclosures
  disclosures: {
    affiliate: "ZIVO may earn a commission when users book through partner links.",
    noTicketing: "ZIVO does not issue tickets. Travel services are provided by licensed partners.",
    priceVariability: "Prices may change until booking is completed.",
    partnerBooking: "Bookings are completed on partner sites.",
  },
  
  // Footer text
  footer: {
    companyName: "ZIVO",
    tagline: "Travel Search Platform",
    managePrefsCopy: "You can manage your email preferences anytime.",
    unsubscribeCopy: "Unsubscribe from these emails",
  },
  
  // Support routing
  supportRouting: {
    bookingIssues: "For booking changes, cancellations, or refunds, contact your travel partner directly.",
    websiteIssues: "For website or technical issues, contact ZIVO support.",
  },
};

// ================================
// BOOKING CONFIRMATION TEMPLATE
// ================================
export const BOOKING_CONFIRMATION_TEMPLATE = {
  subject: "Your booking request has been received ✈️",
  body: `
Thank you for using ZIVO.

Your booking is being processed by our travel partner.
You will receive confirmation once your ticket is issued.

Important: ZIVO does not issue tickets. Travel services are provided by licensed partners.
  `.trim(),
};

// ================================
// PRICE ALERT TEMPLATE  
// ================================
export const PRICE_ALERT_TEMPLATE = {
  subject: "Price drop alert for your trip 👀",
  body: `
Good news! Prices for your tracked route have changed.

Click below to view updated prices on ZIVO.

Note: Prices may change until booking is completed.
  `.trim(),
  cta: "View updated prices",
};

// ================================
// ABANDONED SEARCH TEMPLATE
// ================================
export const ABANDONED_SEARCH_TEMPLATE = {
  subject: "Still comparing prices for your trip?",
  body: `
Prices for your searched route may change.
Compare options again before prices increase.
  `.trim(),
  cta: "Compare prices",
};

// ================================
// TRIP REMINDER TEMPLATE
// ================================
export const TRIP_REMINDER_TEMPLATE = {
  subject: "Your trip is coming up 🗓️",
  body: `
Your trip is coming up.
Check your booking details with your provider.

For booking changes or cancellations, contact your travel partner directly.
  `.trim(),
  cta: "Manage booking",
};

// ================================
// SAFETY RULES
// ================================
export const EMAIL_SAFETY_RULES = {
  // What we ALWAYS do
  mustDo: [
    "Opt-in only for marketing emails",
    "Clear unsubscribe in every email",
    "Informational tone only",
    "No pressure language",
    "Include affiliate disclosure",
    "Route booking support to partners",
  ],
  
  // What we NEVER do
  neverDo: [
    "Send spam or daily promos",
    "Send cashback or incentive emails",
    "Use pressure tactics or countdown timers",
    "Claim to sell tickets directly",
    "Send without consent",
    "Make price guarantees",
  ],
};

// ================================
// EMAIL PREFERENCES SCHEMA
// ================================
export interface EmailPreferences {
  // Core (cannot disable)
  bookingConfirmations: true; // Always enabled
  bookingStatusUpdates: true; // Always enabled
  accountAlerts: true; // Always enabled
  
  // Opt-in/out
  priceAlerts: boolean;
  tripReminders: boolean;
  abandonedSearchReminders: boolean;
  newsletter: boolean;
  marketingEmails: boolean;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  bookingConfirmations: true,
  bookingStatusUpdates: true,
  accountAlerts: true,
  priceAlerts: true,
  tripReminders: true,
  abandonedSearchReminders: true,
  newsletter: false,
  marketingEmails: false,
};

// ================================
// PUSH NOTIFICATION TYPES
// ================================
export const PUSH_NOTIFICATION_TYPES = {
  PRICE_DROP: {
    id: "price_drop",
    title: "Price Drop Alert! 📉",
    body: "Prices for {{route}} may have dropped. Check updated prices.",
    canDisable: true,
  },
  BOOKING_CONFIRMED: {
    id: "booking_confirmed",
    title: "Booking Initiated ✅",
    body: "Your booking is being processed. Check your email for partner confirmation.",
    canDisable: false,
  },
  TRIP_REMINDER: {
    id: "trip_reminder",
    title: "Trip Reminder 🗓️",
    body: "Your trip to {{destination}} is in {{days}} days.",
    canDisable: true,
  },
} as const;

export const PUSH_NOTIFICATION_DISCLAIMER = 
  "Notifications are optional and can be turned off anytime.";
