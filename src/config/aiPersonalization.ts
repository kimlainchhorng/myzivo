/**
 * AI PERSONALIZATION & SMART RECOMMENDATIONS CONFIG
 * Central configuration for intelligent user experiences
 */

// ============================================
// SMART SEARCH RECOMMENDATIONS
// ============================================

export const SMART_SEARCH_CONFIG = {
  // Nearby airport suggestions
  nearbyAirportRadius: 100, // miles
  showNearbyAirports: true,
  
  // Flexible date suggestions
  flexibleDateWindow: 3, // days
  showFlexibleDates: true,
  
  // Alternative route suggestions
  showAlternatives: true,
  maxAlternatives: 3,
};

export const FLEXIBLE_DATE_SAVINGS = [
  { dayShift: -2, avgSavingsPercent: 18, label: "2 days earlier" },
  { dayShift: -1, avgSavingsPercent: 12, label: "1 day earlier" },
  { dayShift: 1, avgSavingsPercent: 15, label: "1 day later" },
  { dayShift: 2, avgSavingsPercent: 20, label: "2 days later" },
];

export const DAY_OF_WEEK_SAVINGS = {
  0: { name: "Sunday", avgSavings: 5 },
  1: { name: "Monday", avgSavings: 10 },
  2: { name: "Tuesday", avgSavings: 25 }, // Best
  3: { name: "Wednesday", avgSavings: 22 },
  4: { name: "Thursday", avgSavings: 8 },
  5: { name: "Friday", avgSavings: 0 }, // Worst
  6: { name: "Saturday", avgSavings: 3 },
};

// ============================================
// PERSONALIZED HOMEPAGE CONTENT
// ============================================

export const GUEST_HOMEPAGE_CONTENT = {
  trendingDestinations: [
    { code: "CUN", name: "Cancun", country: "Mexico", avgPrice: 289 },
    { code: "PAR", name: "Paris", country: "France", avgPrice: 549 },
    { code: "TYO", name: "Tokyo", country: "Japan", avgPrice: 899 },
    { code: "BCN", name: "Barcelona", country: "Spain", avgPrice: 449 },
    { code: "DXB", name: "Dubai", country: "UAE", avgPrice: 699 },
  ],
  popularRoutes: [
    { origin: "LAX", destination: "CUN", label: "Los Angeles → Cancun" },
    { origin: "JFK", destination: "CDG", label: "New York → Paris" },
    { origin: "SFO", destination: "NRT", label: "San Francisco → Tokyo" },
    { origin: "ORD", destination: "LHR", label: "Chicago → London" },
    { origin: "MIA", destination: "SJU", label: "Miami → San Juan" },
  ],
  bestValueDeals: [
    { destination: "Mexico City", avgPrice: 199, savingsPercent: 45 },
    { destination: "Lisbon", avgPrice: 349, savingsPercent: 35 },
    { destination: "Bangkok", avgPrice: 499, savingsPercent: 40 },
    { destination: "Istanbul", avgPrice: 399, savingsPercent: 30 },
  ],
};

export const LOGGED_IN_SECTIONS = [
  { id: "recent_searches", title: "Continue Searching", priority: 1 },
  { id: "price_alerts", title: "Your Price Alerts", priority: 2 },
  { id: "recommended", title: "Recommended for You", priority: 3 },
  { id: "deals", title: "Deals Based on Your Preferences", priority: 4 },
];

// ============================================
// SMART SORTING & RESULT BADGES
// ============================================

export type SortCriterion = "best" | "price" | "duration" | "departure";

export const DEFAULT_SORT_ORDER: SortCriterion[] = ["best", "price", "duration"];

export const RESULT_BADGES = {
  bestValue: {
    id: "best_value",
    label: "Best Value",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    tooltip: "Best combination of price, duration, and quality",
  },
  cheapest: {
    id: "cheapest",
    label: "Cheapest",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/30",
    tooltip: "Lowest price option available",
  },
  fastest: {
    id: "fastest",
    label: "Fastest",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    tooltip: "Shortest travel time",
  },
  mostPopular: {
    id: "most_popular",
    label: "Most Popular",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    tooltip: "Frequently booked by travelers",
  },
  flexibleFare: {
    id: "flexible_fare",
    label: "Flexible Fare",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/30",
    tooltip: "Free cancellation or changes available",
  },
  directFlight: {
    id: "direct_flight",
    label: "Direct",
    color: "bg-primary/10 text-primary border-primary/30",
    tooltip: "Non-stop flight",
  },
};

// ============================================
// PRICE CONFIDENCE INDICATORS
// ============================================

export const PRICE_CONFIDENCE_THRESHOLDS = {
  good: -10, // 10% or more below average
  average: 10, // Within 10% of average
  high: 10, // More than 10% above average
};

export const PRICE_CONFIDENCE_CONFIG = {
  good: {
    label: "Good Price",
    description: "Below average price for this route",
    color: "emerald",
    icon: "TrendingDown",
  },
  average: {
    label: "Average",
    description: "Within normal price range",
    color: "amber",
    icon: "Minus",
  },
  high: {
    label: "High Price",
    description: "Above average price for this route",
    color: "red",
    icon: "TrendingUp",
  },
};

// ============================================
// BEHAVIOR-BASED SUGGESTIONS
// ============================================

export const BEHAVIOR_SUGGESTION_TYPES = [
  {
    id: "similar_destinations",
    title: "Similar Destinations",
    description: "Based on your search history",
    priority: 1,
  },
  {
    id: "seasonal_alternatives",
    title: "Seasonal Picks",
    description: "Great destinations for this time of year",
    priority: 2,
  },
  {
    id: "budget_friendly",
    title: "Budget-Friendly Routes",
    description: "Matching your typical price range",
    priority: 3,
  },
  {
    id: "also_viewed",
    title: "Also Viewed",
    description: "Travelers who searched this route also viewed",
    priority: 4,
  },
];

// ============================================
// SMART ALERT TIMING
// ============================================

export const ALERT_TIMING_CONFIG = {
  // Minimum price drop to notify
  minPriceDropPercent: 10,
  
  // Maximum alerts per day per user
  maxAlertsPerDay: 3,
  
  // Cooldown between alerts for same route (hours)
  alertCooldownHours: 24,
  
  // Group similar alerts
  groupAlerts: true,
  groupWindowMinutes: 60,
};

export const ALERT_COPY = {
  priceDrop: "Price dropped ${amount} on your saved route!",
  lowStock: "Only a few seats left at this price",
  priceRise: "Prices are rising — book soon to lock in",
  notification: "We notify you only when it matters.",
};

// ============================================
// AI TRANSPARENCY & SAFETY
// ============================================

export const AI_DISCLAIMERS = {
  general: "AI suggestions are estimates and do not guarantee prices. Final prices are confirmed by travel partners.",
  priceConfidence: "Based on recent pricing trends from partners.",
  recommendations: "Personalized suggestions based on your search history.",
  predictions: "Price predictions are estimates based on historical data and may not reflect actual future prices.",
};

// ============================================
// FUTURE AI FEATURES (UI READY)
// ============================================

export const FUTURE_AI_FEATURES = [
  {
    id: "ai_trip_planner",
    title: "AI Trip Planner",
    description: "Let AI build your perfect itinerary",
    icon: "Sparkles",
    status: "beta" as const,
    link: "/trip-planner",
  },
  {
    id: "budget_trips",
    title: "Budget-Based Trips",
    description: "Tell us your budget, we find the destination",
    icon: "DollarSign",
    status: "coming_soon" as const,
  },
  {
    id: "interest_planner",
    title: "Interest-Based Travel",
    description: "Travel plans based on your hobbies",
    icon: "Heart",
    status: "coming_soon" as const,
  },
  {
    id: "smart_bundles",
    title: "Smart Bundles",
    description: "AI-optimized flight + hotel packages",
    icon: "Package",
    status: "coming_soon" as const,
  },
];

export type FeatureStatus = "live" | "beta" | "coming_soon";
