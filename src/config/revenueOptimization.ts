/**
 * REVENUE OPTIMIZATION CONFIGURATION
 * 
 * Smart provider badges, bundles, and upsell strategies
 * Designed to increase ARPU while maintaining transparency
 */

// ============================================
// PROVIDER BADGES (Smart Prioritization)
// ============================================

export type ProviderBadgeType = 
  | 'best-deal' 
  | 'most-flexible' 
  | 'official-airline'
  | 'most-booked'
  | 'best-value'
  | 'fastest';

export interface ProviderBadge {
  type: ProviderBadgeType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: number; // Higher = shown first
}

export const PROVIDER_BADGES: Record<ProviderBadgeType, ProviderBadge> = {
  'best-deal': {
    type: 'best-deal',
    label: 'Best Deal',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: 'DollarSign',
    priority: 100,
  },
  'most-flexible': {
    type: 'most-flexible',
    label: 'Most Flexible',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    icon: 'RefreshCw',
    priority: 90,
  },
  'official-airline': {
    type: 'official-airline',
    label: 'Official Airline',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    icon: 'Plane',
    priority: 80,
  },
  'most-booked': {
    type: 'most-booked',
    label: 'Most Booked',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: 'Users',
    priority: 70,
  },
  'best-value': {
    type: 'best-value',
    label: 'Best Value',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    icon: 'Star',
    priority: 85,
  },
  'fastest': {
    type: 'fastest',
    label: 'Fastest',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    icon: 'Zap',
    priority: 60,
  },
};

// ============================================
// BUNDLE CONFIGURATIONS
// ============================================

export type BundleType = 'flight-only' | 'flight-hotel' | 'flight-hotel-car';

export interface BundleOption {
  type: BundleType;
  label: string;
  services: ('flight' | 'hotel' | 'car')[];
  savingsPercentage: number;
  icon: string;
  recommended?: boolean;
}

export const BUNDLE_OPTIONS: BundleOption[] = [
  {
    type: 'flight-only',
    label: 'Flight Only',
    services: ['flight'],
    savingsPercentage: 0,
    icon: 'Plane',
  },
  {
    type: 'flight-hotel',
    label: 'Flight + Hotel',
    services: ['flight', 'hotel'],
    savingsPercentage: 15,
    icon: 'Package',
    recommended: true,
  },
  {
    type: 'flight-hotel-car',
    label: 'Flight + Hotel + Car',
    services: ['flight', 'hotel', 'car'],
    savingsPercentage: 25,
    icon: 'Briefcase',
  },
];

export const BUNDLE_COPY = {
  headline: "Bundle and save more with our partners",
  subheadline: "Complete your trip with additional services",
  disclaimer: "Bundle savings are estimated. Final pricing confirmed at checkout with our travel partners.",
};

// ============================================
// HOTEL ROOM BADGES
// ============================================

export interface RoomBadge {
  type: 'most-booked' | 'best-value' | 'recommended';
  label: string;
  color: string;
  bgColor: string;
}

export const ROOM_BADGES: Record<string, RoomBadge> = {
  'most-booked': {
    type: 'most-booked',
    label: 'Most Booked',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  'best-value': {
    type: 'best-value',
    label: 'Best Value',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  'recommended': {
    type: 'recommended',
    label: 'Recommended',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
};

// ============================================
// EXIT-INTENT CAPTURE
// ============================================

export const EXIT_INTENT_CONFIG = {
  /** Delay before showing (ms) */
  delay: 500,
  /** Only show once per session */
  showOncePerSession: true,
  /** Cookie/localStorage key */
  storageKey: 'zivo_exit_intent_shown',
  
  copy: {
    headline: "Prices may change — track this route",
    subheadline: "Get notified when prices drop for your search",
    priceAlertCTA: "Set Price Alert",
    saveSearchCTA: "Save Search",
    dismiss: "No thanks",
  },
  
  /** Points earned for setting price alert */
  priceAlertPoints: 50,
};

// ============================================
// FLEXIBLE TICKET OPTIONS
// ============================================

export interface FlexibleTicketOption {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  disclaimer: string;
}

export const FLEXIBLE_TICKET_OPTIONS: FlexibleTicketOption[] = [
  {
    id: 'standard',
    name: 'Standard Fare',
    description: 'Non-refundable ticket',
    price: 0,
    features: ['Standard check-in', 'Carry-on included'],
    disclaimer: 'Change and cancellation fees apply per airline policy.',
  },
  {
    id: 'flexible',
    name: 'Flexible Fare',
    description: 'Change dates with reduced fees',
    price: 45,
    features: [
      'One free date change',
      'Priority check-in',
      'Carry-on + personal item',
    ],
    disclaimer: 'Flexible options depend on airline fare rules.',
  },
  {
    id: 'refundable',
    name: 'Fully Refundable',
    description: 'Full refund if plans change',
    price: 89,
    features: [
      'Unlimited date changes',
      'Full refund available',
      'Priority boarding',
      'Extra legroom (subject to availability)',
    ],
    disclaimer: 'Refund terms subject to airline policy. Processing time may apply.',
  },
];

// ============================================
// METRICS TO TRACK
// ============================================

export const REVENUE_METRICS = {
  /** Revenue per booking */
  revenuePerBooking: 'revenue_per_booking',
  /** Revenue per user */
  revenuePerUser: 'revenue_per_user',
  /** Add-on attach rate */
  addonAttachRate: 'addon_attach_rate',
  /** Bundle conversion % */
  bundleConversion: 'bundle_conversion',
  /** Insurance attach rate */
  insuranceAttachRate: 'insurance_attach_rate',
  /** Exit intent conversion */
  exitIntentConversion: 'exit_intent_conversion',
};

// ============================================
// COMPLIANCE COPY
// ============================================

export const REVENUE_COMPLIANCE = {
  insurance: "Travel insurance is optional and provided by third-party partners. ZIVO is not an insurer.",
  flexible: "Flexible options depend on airline fare rules.",
  extras: "Extras are provided by rental partners. Pricing may vary.",
  bundle: "Bundle pricing is estimated. Final prices confirmed with travel partners at checkout.",
  neverHide: "All available options are shown. We highlight deals but never hide cheaper options.",
};
