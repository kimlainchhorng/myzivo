/**
 * ZIVO A/B Testing Framework
 * 
 * Lightweight, client-side A/B testing for continuous revenue optimization.
 * Handles variant assignment, tracking, and analytics.
 * 
 * IMPORTANT: All variants MUST maintain affiliate disclosure compliance.
 */

// ============================================
// CORE TYPES
// ============================================

export type ServiceType = 'flights' | 'hotels' | 'cars' | 'activities' | 'transfers' | 'esim';

export interface ABExperiment {
  id: string;
  name: string;
  description: string;
  service: ServiceType | 'all';
  variants: ABVariant[];
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetPercentage: number; // 0-100, percentage of users in experiment
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Relative weight for distribution (e.g., 50/50 = both have weight 1)
  config: Record<string, any>;
}

export interface ABAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: number;
  userId: string;
}

export interface ABEvent {
  experimentId: string;
  variantId: string;
  eventType: 'impression' | 'click' | 'conversion';
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

// ============================================
// EXPERIMENT DEFINITIONS
// ============================================

export const AB_EXPERIMENTS: ABExperiment[] = [
  // CTA Text Testing - Flights
  {
    id: 'flights_cta_text',
    name: 'Flight CTA Text Optimization',
    description: 'Test different CTA texts for flight booking buttons',
    service: 'flights',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'view_deal', name: 'View Deal', weight: 1, config: { primaryText: 'View Deal', secondaryText: 'Compare Prices' } },
      { id: 'book_flight', name: 'Book Flight', weight: 1, config: { primaryText: 'Book Flight', secondaryText: 'See Options' } },
    ],
  },
  
  // CTA Text Testing - Hotels
  {
    id: 'hotels_cta_text',
    name: 'Hotel CTA Text Optimization',
    description: 'Test different CTA texts for hotel booking buttons',
    service: 'hotels',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'view_hotel', name: 'View Hotel', weight: 1, config: { primaryText: 'View Hotel', secondaryText: 'Check Availability' } },
      { id: 'book_hotel', name: 'Book Hotel', weight: 1, config: { primaryText: 'Book Hotel', secondaryText: 'View Deals' } },
    ],
  },
  
  // CTA Text Testing - Cars
  {
    id: 'cars_cta_text',
    name: 'Car Rental CTA Text Optimization',
    description: 'Test different CTA texts for car rental buttons',
    service: 'cars',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'rent_car', name: 'Rent a Car', weight: 1, config: { primaryText: 'Rent a Car', secondaryText: 'Compare Rentals' } },
      { id: 'view_deals', name: 'View Deals', weight: 1, config: { primaryText: 'View Rental Deals', secondaryText: 'See All Options' } },
    ],
  },
  
  // CTA Color Testing
  {
    id: 'cta_color_scheme',
    name: 'CTA Color Scheme',
    description: 'Test primary vs secondary color schemes for CTAs',
    service: 'all',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { 
        id: 'primary_gradient', 
        name: 'Primary Gradient', 
        weight: 1, 
        config: { 
          flights: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700',
          hotels: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
          cars: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600',
        } 
      },
      { 
        id: 'emerald_accent', 
        name: 'Emerald Accent', 
        weight: 1, 
        config: { 
          flights: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
          hotels: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
          cars: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
        } 
      },
    ],
  },
  
  // CTA Placement Testing
  {
    id: 'cta_placement',
    name: 'CTA Placement Position',
    description: 'Test CTA placement on result cards',
    service: 'all',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'right', name: 'Right Side', weight: 1, config: { placement: 'right' } },
      { id: 'bottom', name: 'Bottom', weight: 1, config: { placement: 'bottom' } },
    ],
  },
  
  // Sticky CTA Testing (Mobile)
  {
    id: 'sticky_cta_mobile',
    name: 'Mobile Sticky CTA',
    description: 'Test sticky vs non-sticky mobile CTA',
    service: 'all',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'sticky', name: 'Sticky', weight: 1, config: { isSticky: true } },
      { id: 'non_sticky', name: 'Non-Sticky', weight: 1, config: { isSticky: false } },
    ],
  },
  
  // Result Sorting Logic
  {
    id: 'result_sorting',
    name: 'Default Result Sorting',
    description: 'Test which default sort order drives more clicks',
    service: 'all',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { id: 'cheapest', name: 'Cheapest First', weight: 1, config: { sortBy: 'price', sortOrder: 'asc' } },
      { id: 'best_value', name: 'Best Value', weight: 1, config: { sortBy: 'value', sortOrder: 'desc' } },
      { id: 'popular', name: 'Most Popular', weight: 1, config: { sortBy: 'popularity', sortOrder: 'desc' } },
    ],
  },
  
  // Add-On Order Testing
  {
    id: 'addon_order',
    name: 'Add-On Section Order',
    description: 'Test which add-on order gets more clicks',
    service: 'all',
    isActive: true,
    startDate: '2026-01-31',
    targetPercentage: 100,
    variants: [
      { 
        id: 'transfers_first', 
        name: 'Transfers First', 
        weight: 1, 
        config: { order: ['transfers', 'activities', 'esim', 'luggage', 'compensation'] } 
      },
      { 
        id: 'esim_first', 
        name: 'eSIM First', 
        weight: 1, 
        config: { order: ['esim', 'transfers', 'activities', 'luggage', 'compensation'] } 
      },
      { 
        id: 'activities_first', 
        name: 'Activities First', 
        weight: 1, 
        config: { order: ['activities', 'transfers', 'esim', 'luggage', 'compensation'] } 
      },
    ],
  },
];

// ============================================
// USER ID & SESSION MANAGEMENT
// ============================================

const AB_USER_ID_KEY = 'zivo_ab_user_id';
const AB_ASSIGNMENTS_KEY = 'zivo_ab_assignments';
const AB_EVENTS_KEY = 'zivo_ab_events';

export function getABUserId(): string {
  let userId = localStorage.getItem(AB_USER_ID_KEY);
  if (!userId) {
    userId = `ab_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(AB_USER_ID_KEY, userId);
  }
  return userId;
}

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('zivo_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('zivo_session_id', sessionId);
  }
  return sessionId;
}

// ============================================
// VARIANT ASSIGNMENT (Sticky per user)
// ============================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getVariantAssignment(experiment: ABExperiment, userId: string): ABVariant {
  // Check for stored assignment first (sticky assignment)
  const stored = getStoredAssignments();
  const existingAssignment = stored.find(a => a.experimentId === experiment.id && a.userId === userId);
  
  if (existingAssignment) {
    const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
    if (variant) return variant;
  }
  
  // Deterministic assignment based on user ID + experiment ID
  const combinedHash = hashString(`${userId}_${experiment.id}`);
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  const normalizedHash = combinedHash % totalWeight;
  
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (normalizedHash < cumulative) {
      // Store assignment
      storeAssignment({
        experimentId: experiment.id,
        variantId: variant.id,
        assignedAt: Date.now(),
        userId,
      });
      return variant;
    }
  }
  
  // Fallback to first variant
  return experiment.variants[0];
}

function getStoredAssignments(): ABAssignment[] {
  try {
    return JSON.parse(localStorage.getItem(AB_ASSIGNMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function storeAssignment(assignment: ABAssignment): void {
  const assignments = getStoredAssignments();
  const existingIndex = assignments.findIndex(
    a => a.experimentId === assignment.experimentId && a.userId === assignment.userId
  );
  
  if (existingIndex >= 0) {
    assignments[existingIndex] = assignment;
  } else {
    assignments.push(assignment);
  }
  
  localStorage.setItem(AB_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

// ============================================
// EVENT TRACKING
// ============================================

export function trackABEvent(
  experimentId: string,
  variantId: string,
  eventType: ABEvent['eventType'],
  metadata?: Record<string, any>
): void {
  const event: ABEvent = {
    experimentId,
    variantId,
    eventType,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    metadata,
  };
  
  // Store locally
  const events = getStoredEvents();
  events.push(event);
  
  // Keep only last 1000 events to prevent localStorage overflow
  const trimmedEvents = events.slice(-1000);
  localStorage.setItem(AB_EVENTS_KEY, JSON.stringify(trimmedEvents));
  
  // Log for debugging
  console.log('[A/B Test Event]', {
    experiment: experimentId,
    variant: variantId,
    type: eventType,
    ...metadata,
  });
}

function getStoredEvents(): ABEvent[] {
  try {
    return JSON.parse(localStorage.getItem(AB_EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

export interface ABExperimentStats {
  experimentId: string;
  experimentName: string;
  variants: {
    variantId: string;
    variantName: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number; // Click-through rate
    cvr: number; // Conversion rate
  }[];
  totalImpressions: number;
  totalClicks: number;
  winningVariant?: string;
  confidence?: number;
}

export function getABAnalytics(): ABExperimentStats[] {
  const events = getStoredEvents();
  const stats: ABExperimentStats[] = [];
  
  for (const experiment of AB_EXPERIMENTS) {
    if (!experiment.isActive) continue;
    
    const experimentEvents = events.filter(e => e.experimentId === experiment.id);
    
    const variantStats = experiment.variants.map(variant => {
      const variantEvents = experimentEvents.filter(e => e.variantId === variant.id);
      const impressions = variantEvents.filter(e => e.eventType === 'impression').length;
      const clicks = variantEvents.filter(e => e.eventType === 'click').length;
      const conversions = variantEvents.filter(e => e.eventType === 'conversion').length;
      
      return {
        variantId: variant.id,
        variantName: variant.name,
        impressions,
        clicks,
        conversions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cvr: clicks > 0 ? (conversions / clicks) * 100 : 0,
      };
    });
    
    const totalImpressions = variantStats.reduce((sum, v) => sum + v.impressions, 0);
    const totalClicks = variantStats.reduce((sum, v) => sum + v.clicks, 0);
    
    // Simple winner detection (highest CTR with min 100 impressions)
    const eligibleVariants = variantStats.filter(v => v.impressions >= 100);
    const winningVariant = eligibleVariants.length > 0
      ? eligibleVariants.reduce((best, v) => v.ctr > best.ctr ? v : best).variantId
      : undefined;
    
    stats.push({
      experimentId: experiment.id,
      experimentName: experiment.name,
      variants: variantStats,
      totalImpressions,
      totalClicks,
      winningVariant,
    });
  }
  
  return stats;
}

// ============================================
// PUBLIC API
// ============================================

export function getExperiment(experimentId: string): ABExperiment | undefined {
  return AB_EXPERIMENTS.find(e => e.id === experimentId && e.isActive);
}

export function getActiveExperiments(service?: ServiceType): ABExperiment[] {
  return AB_EXPERIMENTS.filter(e => 
    e.isActive && (e.service === 'all' || e.service === service)
  );
}

export function getUserVariant(experimentId: string): ABVariant | undefined {
  const experiment = getExperiment(experimentId);
  if (!experiment) return undefined;
  
  const userId = getABUserId();
  return getVariantAssignment(experiment, userId);
}

// ============================================
// CLEAR DATA (For testing/admin)
// ============================================

export function clearABData(): void {
  localStorage.removeItem(AB_USER_ID_KEY);
  localStorage.removeItem(AB_ASSIGNMENTS_KEY);
  localStorage.removeItem(AB_EVENTS_KEY);
}
