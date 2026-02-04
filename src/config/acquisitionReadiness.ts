/**
 * EXIT STRATEGY & ACQUISITION READINESS CONFIGURATION
 * Internal documentation for investors, acquirers, and strategic partners
 */

// ============================================
// POTENTIAL ACQUIRERS
// ============================================

export const POTENTIAL_ACQUIRERS = {
  categories: [
    {
      type: 'ota',
      label: 'Online Travel Agencies',
      examples: ['Booking Holdings', 'Expedia Group', 'Trip.com'],
      interest: 'Traffic acquisition, market expansion, SEO footprint',
    },
    {
      type: 'airline',
      label: 'Airline Groups',
      examples: ['United Airlines', 'Delta', 'Lufthansa Group'],
      interest: 'Direct customer acquisition, ancillary revenue',
    },
    {
      type: 'hotel',
      label: 'Hotel Chains',
      examples: ['Marriott', 'Hilton', 'Accor'],
      interest: 'Direct booking channel, loyalty integration',
    },
    {
      type: 'superapp',
      label: 'Mobility / Super-App Companies',
      examples: ['Uber', 'Grab', 'Didi'],
      interest: 'Travel vertical expansion, ecosystem synergy',
    },
    {
      type: 'fintech',
      label: 'Fintech & Payments',
      examples: ['Visa', 'Mastercard', 'Klarna'],
      interest: 'Travel spending data, payment volume',
    },
    {
      type: 'media',
      label: 'Media & Deal Platforms',
      examples: ['NerdWallet', 'Bankrate', 'Red Ventures'],
      interest: 'Travel content monetization, affiliate revenue',
    },
  ],
  
  valueProposition: {
    traffic: 'High-intent travel traffic with strong conversion signals',
    data: 'Rich demand data and travel intent signals',
    seo: 'Scalable SEO footprint across travel verticals',
    ecosystem: 'Multi-vertical travel and mobility platform',
    compliance: 'Clean regulatory record and proper licensing',
  },
};

// ============================================
// VALUE DRIVERS
// ============================================

export const VALUE_DRIVERS = [
  {
    id: 'traffic',
    title: 'High-Intent Traffic',
    description: 'Organic and paid traffic from users actively searching for travel',
    metric: 'Monthly Active Users',
    importance: 'critical',
  },
  {
    id: 'revenue',
    title: 'Affiliate Revenue',
    description: 'Commission-based revenue with strong unit economics',
    metric: 'Revenue Per User',
    importance: 'critical',
  },
  {
    id: 'risk',
    title: 'Low Operating Risk',
    description: 'Referral model with no inventory or ticket liability',
    metric: 'Operating Margin',
    importance: 'high',
  },
  {
    id: 'liability',
    title: 'No Inventory Liability',
    description: 'Partners handle fulfillment, payments, and customer service',
    metric: 'Liability Exposure',
    importance: 'high',
  },
  {
    id: 'seo',
    title: 'Scalable SEO Pages',
    description: 'Programmatic landing pages for thousands of routes',
    metric: 'Indexed Pages',
    importance: 'high',
  },
  {
    id: 'compliance',
    title: 'Clean Compliance Record',
    description: 'Proper licensing, disclosures, and regulatory adherence',
    metric: 'Compliance Score',
    importance: 'critical',
  },
];

// ============================================
// KEY METRICS FOR ACQUIRERS
// ============================================

export const ACQUIRER_METRICS = {
  traffic: [
    { id: 'mau', label: 'Monthly Active Users', format: 'number' },
    { id: 'dau', label: 'Daily Active Users', format: 'number' },
    { id: 'sessions', label: 'Monthly Sessions', format: 'number' },
    { id: 'pageviews', label: 'Monthly Pageviews', format: 'number' },
    { id: 'organic_share', label: 'Organic Traffic Share', format: 'percent' },
    { id: 'paid_share', label: 'Paid Traffic Share', format: 'percent' },
    { id: 'direct_share', label: 'Direct Traffic Share', format: 'percent' },
  ],
  
  revenue: [
    { id: 'mrr', label: 'Monthly Revenue', format: 'currency' },
    { id: 'arr', label: 'Annual Revenue Run Rate', format: 'currency' },
    { id: 'revenue_growth', label: 'Revenue Growth (MoM)', format: 'percent' },
    { id: 'revenue_per_user', label: 'Revenue Per User', format: 'currency' },
    { id: 'aov', label: 'Average Booking Value', format: 'currency' },
    { id: 'take_rate', label: 'Effective Take Rate', format: 'percent' },
  ],
  
  engagement: [
    { id: 'booking_volume', label: 'Monthly Bookings', format: 'number' },
    { id: 'search_volume', label: 'Monthly Searches', format: 'number' },
    { id: 'conversion_rate', label: 'Search to Booking Rate', format: 'percent' },
    { id: 'click_through_rate', label: 'Click-Through Rate', format: 'percent' },
    { id: 'return_user_rate', label: 'Return User Rate', format: 'percent' },
    { id: 'avg_session_duration', label: 'Avg Session Duration', format: 'duration' },
  ],
  
  compliance: [
    { id: 'seller_of_travel', label: 'Seller of Travel License', format: 'status' },
    { id: 'gdpr_compliant', label: 'GDPR Compliant', format: 'status' },
    { id: 'ccpa_compliant', label: 'CCPA Compliant', format: 'status' },
    { id: 'affiliate_good_standing', label: 'Affiliate Good Standing', format: 'status' },
    { id: 'chargeback_rate', label: 'Chargeback Rate', format: 'percent' },
    { id: 'complaint_rate', label: 'Complaint Rate', format: 'percent' },
  ],
};

// ============================================
// BRAND POSITIONING
// ============================================

export const BRAND_POSITIONING = {
  primary: 'A travel and mobility demand engine',
  avoid: 'Just a flight comparison site',
  
  taglines: [
    'The travel demand platform',
    'Where travel intent converts',
    'Multi-vertical travel marketplace',
    'Travel discovery and booking hub',
  ],
  
  differentiators: [
    'Multi-service ecosystem (flights, hotels, cars, activities)',
    'Clean affiliate-only revenue model',
    'No inventory or liability risk',
    'Scalable programmatic SEO',
    'Global expansion ready',
    'Regulatory compliance built-in',
  ],
};

// ============================================
// EXIT PATHS
// ============================================

export const EXIT_PATHS = [
  {
    id: 'acquisition',
    label: 'Full Acquisition',
    description: 'Complete sale to strategic or financial buyer',
    timeline: '6-12 months',
    valuation: 'Highest',
  },
  {
    id: 'partnership',
    label: 'Strategic Partnership',
    description: 'Deep integration with major travel or tech company',
    timeline: '3-6 months',
    valuation: 'Medium',
  },
  {
    id: 'investment',
    label: 'Minority Investment',
    description: 'Strategic or financial investor takes minority stake',
    timeline: '3-6 months',
    valuation: 'Medium-High',
  },
  {
    id: 'independent',
    label: 'Independent Growth',
    description: 'Continue building value as standalone company',
    timeline: 'Ongoing',
    valuation: 'Compounding',
  },
];

// ============================================
// DUE DILIGENCE READINESS
// ============================================

export const DUE_DILIGENCE_CHECKLIST = {
  financials: [
    'Monthly revenue reports',
    'Affiliate commission statements',
    'Operating expense breakdown',
    'Unit economics analysis',
    'Cash flow statements',
    'Revenue forecasts',
  ],
  
  legal: [
    'Corporate structure documents',
    'Seller of Travel licenses',
    'Partner agreements',
    'Terms of Service',
    'Privacy Policy',
    'IP ownership documentation',
  ],
  
  technical: [
    'Architecture documentation',
    'Codebase access',
    'Infrastructure overview',
    'Security audit reports',
    'API documentation',
    'Data flow diagrams',
  ],
  
  operations: [
    'Team structure',
    'Key personnel',
    'Vendor relationships',
    'Customer support metrics',
    'Compliance history',
    'Risk assessments',
  ],
};

// ============================================
// VALUATION FACTORS
// ============================================

export const VALUATION_FACTORS = {
  multiples: {
    revenue: { low: 3, mid: 5, high: 8, metric: 'x ARR' },
    traffic: { low: 0.5, mid: 1, high: 2, metric: '$ per MAU' },
    bookings: { low: 10, mid: 25, high: 50, metric: '$ per annual booking' },
  },
  
  premiums: [
    { factor: 'High growth rate (>50% YoY)', premium: '+20-30%' },
    { factor: 'Clean compliance record', premium: '+10-15%' },
    { factor: 'Strong organic traffic', premium: '+15-25%' },
    { factor: 'Multi-vertical platform', premium: '+10-20%' },
    { factor: 'Global expansion ready', premium: '+10-15%' },
  ],
  
  discounts: [
    { factor: 'Single partner dependency', discount: '-20-30%' },
    { factor: 'Regulatory issues', discount: '-30-50%' },
    { factor: 'High paid traffic dependency', discount: '-10-20%' },
    { factor: 'Key person dependency', discount: '-15-25%' },
  ],
};
