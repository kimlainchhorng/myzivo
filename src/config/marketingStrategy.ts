/**
 * ZIVO OTA MARKETING STRATEGY CONFIGURATION
 * 
 * Traffic channels, ad copy, SEO rules, and launch targets
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// GOOGLE SEARCH ADS (HIGHEST INTENT)
// ============================================

export interface AdKeyword {
  keyword: string;
  intent: 'high' | 'medium' | 'low';
  category: 'flights' | 'hotels' | 'cars';
  matchType: 'exact' | 'phrase' | 'broad';
}

export const ALLOWED_KEYWORDS: AdKeyword[] = [
  // Flight keywords (high intent)
  { keyword: 'cheap flights to London', intent: 'high', category: 'flights', matchType: 'phrase' },
  { keyword: 'book flights NYC to LAX', intent: 'high', category: 'flights', matchType: 'phrase' },
  { keyword: 'last minute flight deals', intent: 'high', category: 'flights', matchType: 'phrase' },
  { keyword: 'book airline tickets online', intent: 'high', category: 'flights', matchType: 'phrase' },
  { keyword: 'flights from New York', intent: 'high', category: 'flights', matchType: 'phrase' },
  { keyword: 'international flights', intent: 'medium', category: 'flights', matchType: 'broad' },
  
  // Hotel keywords (high intent)
  { keyword: 'book hotels in Miami', intent: 'high', category: 'hotels', matchType: 'phrase' },
  { keyword: 'hotels in Las Vegas', intent: 'high', category: 'hotels', matchType: 'phrase' },
  { keyword: 'cheap hotels NYC', intent: 'high', category: 'hotels', matchType: 'phrase' },
  { keyword: 'book hotel rooms online', intent: 'high', category: 'hotels', matchType: 'phrase' },
  
  // Car rental keywords
  { keyword: 'rent a car LAX', intent: 'high', category: 'cars', matchType: 'phrase' },
  { keyword: 'car rental deals', intent: 'medium', category: 'cars', matchType: 'phrase' },
];

export const BLOCKED_KEYWORDS = [
  // Airline brand bidding (avoid unless explicitly allowed)
  'United Airlines',
  'Delta Airlines', 
  'American Airlines',
  'Southwest',
  'JetBlue',
  
  // Misleading claims
  'official airline',
  'guaranteed cheapest',
  'lowest price guarantee',
  'best price guarantee',
];

export interface AdCopy {
  id: string;
  category: 'flights' | 'hotels' | 'cars';
  headline: string;
  description: string;
  displayUrl: string;
  landingPath: string;
}

export const APPROVED_AD_COPY: AdCopy[] = [
  // Flight ads
  {
    id: 'flight_generic_1',
    category: 'flights',
    headline: 'Book Flights Online with ZIVO',
    description: 'Compare fares and book airline tickets securely. Tickets issued by ZIVO. Airline rules apply.',
    displayUrl: 'hizovo.com/flights',
    landingPath: '/flights',
  },
  {
    id: 'flight_deals_1',
    category: 'flights',
    headline: 'Compare Flight Prices | ZIVO',
    description: 'Search 500+ airlines. Book securely with instant confirmation. ZIVO is an online travel agency.',
    displayUrl: 'hizovo.com/flights',
    landingPath: '/flights',
  },
  {
    id: 'flight_route_1',
    category: 'flights',
    headline: 'Flights to {Destination} | ZIVO',
    description: 'Book airline tickets to {Destination}. Compare prices and book directly. Airline rules apply.',
    displayUrl: 'hizovo.com/flights/to/{destination}',
    landingPath: '/flights/to/{destination}',
  },
  
  // Hotel ads
  {
    id: 'hotel_generic_1',
    category: 'hotels',
    headline: 'Book Hotels Online | ZIVO',
    description: 'Compare hotel prices from trusted partners. Book securely. ZIVO is an online travel agency.',
    displayUrl: 'hizovo.com/hotels',
    landingPath: '/hotels',
  },
  {
    id: 'hotel_city_1',
    category: 'hotels',
    headline: 'Hotels in {City} | ZIVO',
    description: 'Find and book hotels in {City}. Real-time prices from trusted partners. Property rules apply.',
    displayUrl: 'hizovo.com/hotels/{city}',
    landingPath: '/hotels/in/{city}',
  },
  
  // Car rental ads
  {
    id: 'car_generic_1',
    category: 'cars',
    headline: 'Rent a Car Online | ZIVO',
    description: 'Compare car rental prices. Book securely through trusted partners. Rental rules apply.',
    displayUrl: 'hizovo.com/rent-car',
    landingPath: '/rent-car',
  },
];

// ============================================
// SEO PAGE STRUCTURE
// ============================================

export interface SEOPageTemplate {
  pattern: string;
  type: 'route' | 'destination' | 'city' | 'airport';
  category: 'flights' | 'hotels' | 'cars';
  requiredElements: string[];
  titleTemplate: string;
  descriptionTemplate: string;
}

export const SEO_PAGE_TEMPLATES: SEOPageTemplate[] = [
  // Flight route pages
  {
    pattern: '/flights/{origin}-to-{destination}',
    type: 'route',
    category: 'flights',
    requiredElements: ['search_box', 'route_info', 'fare_tips', 'booking_cta', 'faq'],
    titleTemplate: 'Flights from {Origin} to {Destination} | Book on ZIVO',
    descriptionTemplate: 'Book airline tickets from {Origin} to {Destination}. Compare prices and book securely with ZIVO, an online travel agency.',
  },
  {
    pattern: '/flights/to/{destination}',
    type: 'destination',
    category: 'flights',
    requiredElements: ['search_box', 'city_info', 'fare_tips', 'booking_cta'],
    titleTemplate: 'Flights to {Destination} | ZIVO',
    descriptionTemplate: 'Find and book flights to {Destination}. Compare airline prices. ZIVO is an online travel agency.',
  },
  
  // Hotel city pages
  {
    pattern: '/hotels/{city}',
    type: 'city',
    category: 'hotels',
    requiredElements: ['search_box', 'city_info', 'property_tips', 'booking_cta'],
    titleTemplate: 'Hotels in {City} | Book on ZIVO',
    descriptionTemplate: 'Compare and book hotels in {City}. Real-time prices from trusted partners. ZIVO is an online travel agency.',
  },
  
  // Car rental pages
  {
    pattern: '/rent-car/{location}',
    type: 'city',
    category: 'cars',
    requiredElements: ['search_box', 'location_info', 'rental_tips', 'booking_cta'],
    titleTemplate: 'Car Rentals in {Location} | ZIVO',
    descriptionTemplate: 'Rent a car in {Location}. Compare prices from top rental companies. ZIVO is an online travel agency.',
  },
];

export const SEO_SAFE_COPY = {
  /** Generic OTA statement for SEO pages */
  otaStatement: "Book airline tickets online with ZIVO, an online travel agency.",
  
  /** Hotel version */
  hotelStatement: "Compare and book hotels with ZIVO, an online travel agency.",
  
  /** Car rental version */
  carStatement: "Rent a car through ZIVO, an online travel agency.",
  
  /** Booking CTA */
  bookingCta: "Search & Book",
  
  /** Trust statement */
  trustStatement: "Secure booking. Instant confirmation.",
};

// ============================================
// META ADS (FACEBOOK/INSTAGRAM)
// ============================================

export interface MetaAdContent {
  id: string;
  objective: 'awareness' | 'traffic' | 'retargeting';
  headline: string;
  primaryText: string;
  cta: string;
  targetAudience: string[];
}

export const META_AD_CONTENT: MetaAdContent[] = [
  // Awareness content
  {
    id: 'awareness_tips_1',
    objective: 'awareness',
    headline: 'How to Book Flights Cheaper',
    primaryText: 'Compare prices across airlines before you book. Search with ZIVO to find the best fares.',
    cta: 'Learn More',
    targetAudience: ['travel_enthusiasts', 'frequent_travelers'],
  },
  {
    id: 'awareness_fees_1',
    objective: 'awareness',
    headline: 'Avoid Hidden Airline Fees',
    primaryText: 'ZIVO shows you the full price upfront. No surprises at checkout.',
    cta: 'Learn More',
    targetAudience: ['budget_travelers', 'deal_seekers'],
  },
  {
    id: 'awareness_timing_1',
    objective: 'awareness',
    headline: 'When to Book Flights',
    primaryText: 'Prices change daily. Compare real-time fares on ZIVO to find your best booking window.',
    cta: 'Search Flights',
    targetAudience: ['planners', 'vacation_travelers'],
  },
  
  // Retargeting content
  {
    id: 'retarget_cart_1',
    objective: 'retargeting',
    headline: 'Complete Your Booking',
    primaryText: 'Prices may change. Complete your booking today to lock in your fare.',
    cta: 'Book Now',
    targetAudience: ['cart_abandoners'],
  },
  {
    id: 'retarget_search_1',
    objective: 'retargeting',
    headline: 'Still Looking for Flights?',
    primaryText: 'Your search results are waiting. Compare updated prices on ZIVO.',
    cta: 'View Flights',
    targetAudience: ['search_abandoners'],
  },
];

// ============================================
// RETARGETING RULES
// ============================================

export interface RetargetingAudience {
  id: string;
  name: string;
  trigger: string;
  windowDays: number;
  message: string;
  priority: number;
}

export const RETARGETING_AUDIENCES: RetargetingAudience[] = [
  {
    id: 'checkout_abandoners',
    name: 'Checkout Abandoners',
    trigger: 'reached_checkout_but_exited',
    windowDays: 7,
    message: 'Prices may change. Complete your booking today.',
    priority: 1,
  },
  {
    id: 'search_abandoners',
    name: 'Search Abandoners',
    trigger: 'searched_but_no_click',
    windowDays: 14,
    message: 'Still looking? Compare updated prices.',
    priority: 2,
  },
  {
    id: 'offer_viewers',
    name: 'Offer Viewers',
    trigger: 'viewed_offer_but_no_checkout',
    windowDays: 7,
    message: 'Your flight is waiting. Book before prices change.',
    priority: 3,
  },
  {
    id: 'past_bookers',
    name: 'Past Bookers',
    trigger: 'completed_booking_30d_ago',
    windowDays: 90,
    message: 'Ready for your next trip? Search new destinations.',
    priority: 4,
  },
];

// ============================================
// EMAIL MARKETING RULES
// ============================================

export interface EmailType {
  id: string;
  name: string;
  allowed: boolean;
  requiresOptIn: boolean;
  description: string;
}

export const EMAIL_TYPES: EmailType[] = [
  // Allowed transactional emails
  { id: 'booking_confirmation', name: 'Booking Confirmation', allowed: true, requiresOptIn: false, description: 'Sent after successful booking' },
  { id: 'payment_receipt', name: 'Payment Receipt', allowed: true, requiresOptIn: false, description: 'Sent after payment capture' },
  { id: 'itinerary_update', name: 'Itinerary Update', allowed: true, requiresOptIn: false, description: 'Sent when booking changes' },
  { id: 'cancellation_confirm', name: 'Cancellation Confirmation', allowed: true, requiresOptIn: false, description: 'Sent after cancellation' },
  
  // Allowed marketing emails (opt-in required)
  { id: 'price_alerts', name: 'Price Alerts', allowed: true, requiresOptIn: true, description: 'Notify when prices drop for saved routes' },
  { id: 'abandoned_booking', name: 'Abandoned Booking Reminder', allowed: true, requiresOptIn: true, description: 'Remind user of incomplete booking' },
  { id: 'travel_tips', name: 'Travel Tips', allowed: true, requiresOptIn: true, description: 'Educational travel content' },
  
  // NEVER allowed
  { id: 'cashback_promo', name: 'Cashback Promises', allowed: false, requiresOptIn: false, description: 'DO NOT SEND - Compliance risk' },
  { id: 'fake_urgency', name: 'Fake Urgency', allowed: false, requiresOptIn: false, description: 'DO NOT SEND - Misleading' },
  { id: 'price_guarantee', name: 'Price Guarantee Claims', allowed: false, requiresOptIn: false, description: 'DO NOT SEND - Cannot guarantee' },
];

// ============================================
// TRUST SIGNALS (CONVERSION BOOST)
// ============================================

export const TRUST_SIGNALS = {
  /** Security signals */
  security: [
    'Secure payment',
    'SSL encrypted',
    'PCI compliant',
  ],
  
  /** Support signals */
  support: [
    'Customer support available',
    '24/7 booking assistance',
    'Email support',
  ],
  
  /** Pricing signals */
  pricing: [
    'Transparent pricing',
    'No hidden fees',
    'All taxes included',
  ],
  
  /** Compliance signals */
  compliance: [
    'Airline & supplier rules visible',
    'Clear cancellation policies',
    'Fare rules disclosed',
  ],
};

// ============================================
// DAILY LAUNCH TARGETS
// ============================================

export interface LaunchTarget {
  metric: string;
  week1Target: string;
  week2Target: string;
  scaleCondition: string;
}

export const LAUNCH_TARGETS: LaunchTarget[] = [
  {
    metric: 'Daily Visitors',
    week1Target: '50-100',
    week2Target: '100-200',
    scaleCondition: 'Stable checkout completion rate',
  },
  {
    metric: 'Daily Bookings',
    week1Target: '1-3',
    week2Target: '3-5',
    scaleCondition: 'Ticketing success rate > 98%',
  },
  {
    metric: 'Conversion Rate',
    week1Target: '1-2%',
    week2Target: '2-3%',
    scaleCondition: 'Consistent week-over-week',
  },
  {
    metric: 'Fraud Alert Rate',
    week1Target: '< 2%',
    week2Target: '< 1%',
    scaleCondition: 'Low false positive rate',
  },
];

export const SCALE_PREREQUISITES = [
  'Stable payment success rate (> 95%)',
  'Low fraud alerts (< 2%)',
  'Support response ready (< 4h avg)',
  'Ticketing success rate (> 98%)',
  'Chargeback rate (< 0.5%)',
];

// ============================================
// LANDING PAGE REQUIREMENTS
// ============================================

export interface LandingPageRequirement {
  page: string;
  requiredElements: string[];
  blockedElements: string[];
}

export const LANDING_PAGE_REQUIREMENTS: LandingPageRequirement[] = [
  {
    page: '/flights',
    requiredElements: [
      'Search form',
      'OTA disclosure',
      'Trust signals',
      'Clear pricing statement',
    ],
    blockedElements: [
      'Price guarantee claims',
      'Lowest price promises',
      'Competitor comparisons',
    ],
  },
  {
    page: '/hotels',
    requiredElements: [
      'Search form',
      'OTA disclosure',
      'Trust signals',
      'Partner attribution',
    ],
    blockedElements: [
      'Best price guarantee',
      'Misleading urgency timers',
    ],
  },
];
