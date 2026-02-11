/**
 * PLATFORM DEFENSIBILITY & COMPETITIVE MOAT CONFIGURATION
 * Long-term advantages that make ZIVO difficult to copy
 */

// ============================================
// DATA MOAT (CORE ADVANTAGE)
// ============================================

export const DATA_MOAT = {
  id: 'data',
  title: 'Data Moat',
  subtitle: 'Core Advantage',
  icon: 'database',
  description: 'Proprietary data that compounds over time',
  
  dataAssets: [
    {
      type: 'search_demand',
      label: 'Search Demand by Route',
      description: 'Real-time intent signals across thousands of city pairs',
      value: 'Millions of searches/month',
    },
    {
      type: 'price_alerts',
      label: 'Price Alert Behavior',
      description: 'User price sensitivity and trigger points',
      value: 'Historical alert conversions',
    },
    {
      type: 'booking_conversion',
      label: 'Booking Conversion by Provider',
      description: 'Partner performance benchmarking',
      value: 'Conversion rate optimization',
    },
    {
      type: 'seasonal_trends',
      label: 'Seasonal Travel Trends',
      description: 'Predictive demand forecasting',
      value: 'Multi-year patterns',
    },
  ],
  
  applications: [
    'Optimize SEO pages for high-value routes',
    'Improve personalized recommendations',
    'Prioritize partner integrations',
    'Dynamic pricing intelligence',
  ],
  
  disclosure: 'Insights are anonymized and aggregated.',
};

// ============================================
// SEO FOOTPRINT
// ============================================

export const SEO_MOAT = {
  id: 'seo',
  title: 'SEO Footprint at Scale',
  icon: 'globe',
  description: 'Defensive SEO that takes years to replicate',
  
  assets: [
    {
      type: 'route_pages',
      label: 'Route Landing Pages',
      count: '10,000+',
      description: 'Programmatic city-to-city flight pages',
    },
    {
      type: 'airport_pages',
      label: 'Airport Pages',
      count: '500+',
      description: 'Comprehensive airport guides and deals',
    },
    {
      type: 'city_combinations',
      label: 'City + Airport Combos',
      count: '25,000+',
      description: 'Every viable route combination',
    },
    {
      type: 'travel_guides',
      label: 'Evergreen Guides',
      count: '1,000+',
      description: 'Destination content that ranks for years',
    },
  ],
  
  competitorBarrier: 'Competitors must spend years (and millions) to catch up.',
  
  metrics: {
    indexedPages: 35000,
    organicTrafficShare: 65,
    domainAuthority: 45,
    keywordsRanking: 15000,
  },
};

// ============================================
// MULTI-VERTICAL ECOSYSTEM
// ============================================

export const ECOSYSTEM_MOAT = {
  id: 'ecosystem',
  title: 'Multi-Vertical Ecosystem',
  icon: 'layers',
  description: 'ZIVO is not just flights — it\'s a complete travel platform',
  
  verticals: [
    { id: 'flights', name: 'Flights', status: 'live', icon: 'plane' },
    { id: 'hotels', name: 'Hotels', status: 'live', icon: 'building-2' },
    { id: 'cars', name: 'Car Rental', status: 'live', icon: 'car' },
    { id: 'activities', name: 'Activities', status: 'live', icon: 'target' },
    { id: 'business', name: 'Business Travel', status: 'planned', icon: 'briefcase' },
    { id: 'ai_planning', name: 'AI Trip Planning', status: 'beta', icon: 'brain' },
    { id: 'rides', name: 'Rides', status: 'roadmap', icon: 'car-taxi-front' },
    { id: 'eats', name: 'Eats', status: 'roadmap', icon: 'utensils-crossed' },
    { id: 'move', name: 'Move (Logistics)', status: 'roadmap', icon: 'package' },
  ],
  
  benefits: [
    { title: 'Switching Costs', description: 'Users invested in one vertical stay for others' },
    { title: 'User Lifetime Value', description: 'Cross-sell increases LTV by 3-5x' },
    { title: 'Partner Dependence', description: 'Ecosystem makes ZIVO essential to partners' },
  ],
};

// ============================================
// USER ACCOUNT LOCK-IN
// ============================================

export const USER_LOCKIN_MOAT = {
  id: 'user_lockin',
  title: 'User Account Lock-In',
  icon: 'user',
  description: 'Stored value that keeps users coming back',
  
  storedValue: [
    {
      type: 'travelers',
      label: 'Saved Travelers',
      description: 'Passport, preferences, TSA info stored securely',
      retentionImpact: 'high',
    },
    {
      type: 'alerts',
      label: 'Price Alerts',
      description: 'Active watchlist for future trips',
      retentionImpact: 'high',
    },
    {
      type: 'preferences',
      label: 'Travel Preferences',
      description: 'Cabin class, airline preferences, seat selection',
      retentionImpact: 'medium',
    },
    {
      type: 'history',
      label: 'Booking History',
      description: 'Past trips for re-booking and receipts',
      retentionImpact: 'medium',
    },
    {
      type: 'loyalty',
      label: 'ZIVO Miles',
      description: 'Earned rewards redeemable across services',
      retentionImpact: 'critical',
    },
  ],
  
  result: 'Users return instead of starting fresh elsewhere.',
};

// ============================================
// PARTNER RELATIONSHIPS
// ============================================

export const PARTNER_MOAT = {
  id: 'partners',
  title: 'Partner Relationships',
  icon: 'handshake',
  description: 'Strategic advantages through partner network',
  
  advantages: [
    {
      title: 'Multiple Affiliate Partners',
      description: 'No single-partner dependency risk',
    },
    {
      title: 'Provider Redundancy',
      description: 'Fallback options for every service',
    },
    {
      title: 'Proven Conversion Traffic',
      description: 'Track record of high-quality referrals',
    },
  ],
  
  partnerValue: [
    { reason: 'Clean Traffic', description: 'Low bot and fraud rates' },
    { reason: 'Low Fraud', description: 'Verified users and risk scoring' },
    { reason: 'High Intent Users', description: 'Travelers ready to book' },
  ],
};

// ============================================
// BRAND TRUST & COMPLIANCE
// ============================================

export const TRUST_MOAT = {
  id: 'trust',
  title: 'Brand Trust & Compliance',
  icon: 'shield',
  description: 'Trust is hard to copy quickly',
  
  pillars: [
    {
      title: 'Transparent Pricing',
      description: 'No hidden fees, clear partner attribution',
      icon: 'dollar-sign',
    },
    {
      title: 'Clean Legal Posture',
      description: 'Proper licensing, updated policies, regulatory ready',
      icon: 'scale',
    },
    {
      title: 'Affiliate-Safe Messaging',
      description: 'No misleading claims, compliant copy',
      icon: 'check-circle',
    },
    {
      title: 'Enterprise-Ready Compliance',
      description: 'GDPR, CCPA, SOC 2 preparation',
      icon: 'building',
    },
  ],
};

// ============================================
// TECH & PROCESS MOAT
// ============================================

export const TECH_MOAT = {
  id: 'tech',
  title: 'Tech & Process Moat',
  icon: 'code',
  description: 'Internal advantages that compound',
  
  advantages: [
    {
      title: 'Scalable Templates',
      description: 'Generate 1000s of pages from templates',
    },
    {
      title: 'Automation Systems',
      description: 'Reduce manual ops to near-zero',
    },
    {
      title: 'Analytics-Driven Decisions',
      description: 'Data informs every product choice',
    },
    {
      title: 'Risk & Fraud Controls',
      description: 'Protect revenue and partner trust',
    },
  ],
};

// ============================================
// AI-READY FOUNDATION
// ============================================

export const AI_MOAT = {
  id: 'ai',
  title: 'AI-Ready Foundation',
  icon: 'brain',
  description: 'Built to leverage AI at every layer',
  
  capabilities: [
    {
      title: 'Layer AI on Real Demand',
      description: 'AI recommendations backed by actual search data',
    },
    {
      title: 'Personalize at Scale',
      description: 'Individual experiences for millions of users',
    },
    {
      title: 'Optimize Monetization',
      description: 'AI-driven pricing and partner prioritization',
    },
  ],
  
  futureApplications: [
    'Conversational trip planning',
    'Dynamic package bundling',
    'Predictive price recommendations',
    'Automated content generation',
  ],
};

// ============================================
// COMPLETE MOAT SUMMARY
// ============================================

export const ALL_MOATS = [
  DATA_MOAT,
  SEO_MOAT,
  ECOSYSTEM_MOAT,
  USER_LOCKIN_MOAT,
  PARTNER_MOAT,
  TRUST_MOAT,
  TECH_MOAT,
  AI_MOAT,
];

export const MOAT_SUMMARY = {
  headline: 'ZIVO is defensible through data, scale, ecosystem depth, and trust — not just features.',
  
  keyPoints: [
    'Data compounds with every search',
    'SEO takes years to replicate',
    'Ecosystem creates switching costs',
    'Trust is built over time',
  ],
};
