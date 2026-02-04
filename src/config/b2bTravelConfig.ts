/**
 * B2B TRAVEL SYSTEM CONFIGURATION
 * Enterprise & corporate travel management settings
 */

// ============================================
// BUSINESS ACCOUNT FEATURES
// ============================================

export const BUSINESS_FEATURES = [
  {
    id: "company_profile",
    name: "Company Profile",
    description: "Centralized business information and billing details",
    icon: "Building2",
  },
  {
    id: "multiple_travelers",
    name: "Multiple Travelers",
    description: "Add and manage team members with individual profiles",
    icon: "Users",
  },
  {
    id: "centralized_booking",
    name: "Centralized Booking View",
    description: "One dashboard for all company travel bookings",
    icon: "LayoutDashboard",
  },
  {
    id: "booking_history",
    name: "Booking History",
    description: "Complete record of all company travel",
    icon: "History",
  },
  {
    id: "travel_spend_visibility",
    name: "Travel Spend Visibility",
    description: "Real-time spending analytics and budget tracking",
    icon: "PieChart",
  },
];

// ============================================
// HIGH-VALUE BUSINESS ROUTES
// ============================================

export const HIGH_VALUE_ROUTES = [
  { origin: "NYC", destination: "LON", name: "New York ↔ London", category: "transatlantic" },
  { origin: "SFO", destination: "NYC", name: "San Francisco ↔ New York", category: "domestic" },
  { origin: "ORD", destination: "DFW", name: "Chicago ↔ Dallas", category: "domestic" },
  { origin: "LAX", destination: "NYC", name: "Los Angeles ↔ New York", category: "domestic" },
  { origin: "BOS", destination: "DCA", name: "Boston ↔ Washington DC", category: "domestic" },
  { origin: "SEA", destination: "SFO", name: "Seattle ↔ San Francisco", category: "domestic" },
  { origin: "ATL", destination: "MIA", name: "Atlanta ↔ Miami", category: "domestic" },
  { origin: "NYC", destination: "PAR", name: "New York ↔ Paris", category: "transatlantic" },
  { origin: "SFO", destination: "TYO", name: "San Francisco ↔ Tokyo", category: "transpacific" },
  { origin: "NYC", destination: "FRA", name: "New York ↔ Frankfurt", category: "transatlantic" },
];

// ============================================
// TEAM MANAGEMENT ROLES
// ============================================

export const TEAM_ROLES = [
  {
    id: "admin",
    name: "Travel Admin",
    permissions: ["manage_travelers", "view_bookings", "view_invoices", "manage_policy", "book_travel"],
  },
  {
    id: "booker",
    name: "Travel Booker",
    permissions: ["view_bookings", "book_travel"],
  },
  {
    id: "traveler",
    name: "Traveler",
    permissions: ["book_own_travel", "view_own_bookings"],
  },
  {
    id: "viewer",
    name: "Finance Viewer",
    permissions: ["view_bookings", "view_invoices"],
  },
];

// ============================================
// B2B REVENUE ADVANTAGES
// ============================================

export const B2B_REVENUE_ADVANTAGES = [
  {
    title: "Larger Booking Values",
    description: "Business travelers book premium fares and hotels",
    icon: "DollarSign",
    stat: "3x",
    statLabel: "higher avg value",
  },
  {
    title: "Repeat Monthly Usage",
    description: "Consistent travel patterns mean predictable revenue",
    icon: "RefreshCw",
    stat: "85%",
    statLabel: "repeat rate",
  },
  {
    title: "Predictable Volume",
    description: "Corporate accounts provide stable booking volume",
    icon: "TrendingUp",
    stat: "12+",
    statLabel: "trips/month avg",
  },
  {
    title: "Lower Churn",
    description: "Enterprise contracts ensure long-term relationships",
    icon: "Shield",
    stat: "95%",
    statLabel: "retention",
  },
];

// ============================================
// CORPORATE COMPLIANCE COPY
// ============================================

export const CORPORATE_COMPLIANCE = {
  mainDisclaimer: "ZIVO facilitates business travel bookings. Travel services are fulfilled by licensed providers.",
  invoiceDisclaimer: "Invoices and receipts are issued by travel providers.",
  paymentNote: "Payments are processed by licensed travel partners.",
  partnerDisclosure: "ZIVO connects businesses with trusted travel partners for booking and fulfillment.",
};

// ============================================
// COMPANY SIZE OPTIONS
// ============================================

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees", tier: "startup" },
  { value: "11-50", label: "11-50 employees", tier: "small" },
  { value: "51-200", label: "51-200 employees", tier: "medium" },
  { value: "201-500", label: "201-500 employees", tier: "large" },
  { value: "500+", label: "500+ employees", tier: "enterprise" },
];

// ============================================
// INDUSTRY OPTIONS
// ============================================

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Consulting",
  "Legal",
  "Manufacturing",
  "Retail & E-commerce",
  "Media & Entertainment",
  "Real Estate",
  "Education",
  "Non-Profit",
  "Government",
  "Other",
];
