/**
 * ZIVO Revenue Optimization Engine
 * 
 * Smart partner prioritization and add-on ordering based on conversion data.
 * Continuously learns from user behavior to maximize affiliate earnings.
 */

import { 
  FLIGHT_PARTNERS, 
  HOTEL_PARTNERS, 
  CAR_PARTNERS,
  TRANSFER_PARTNERS,
  ACTIVITY_PARTNERS,
  ESIM_PARTNERS,
  LUGGAGE_PARTNERS,
  COMPENSATION_PARTNERS,
  type AffiliatePartner 
} from '@/config/affiliateLinks';
import { getUserVariant, trackABEvent } from './abTesting';

// ============================================
// TYPES
// ============================================

export type ServiceCategory = 'flights' | 'hotels' | 'cars' | 'transfers' | 'activities' | 'esim' | 'luggage' | 'compensation';

interface PartnerPerformance {
  partnerId: string;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  rpc: number; // Revenue per click
  lastUpdated: number;
}

interface ConversionData {
  partnerId: string;
  service: ServiceCategory;
  timestamp: number;
  value: number;
  sessionId: string;
}

// ============================================
// STORAGE KEYS
// ============================================

const PARTNER_PERFORMANCE_KEY = 'zivo_partner_performance';
const CONVERSION_DATA_KEY = 'zivo_conversion_data';
const ADDON_CLICKS_KEY = 'zivo_addon_clicks';

// ============================================
// PARTNER REGISTRIES
// ============================================

const PARTNER_REGISTRIES: Record<ServiceCategory, AffiliatePartner[]> = {
  flights: FLIGHT_PARTNERS,
  hotels: HOTEL_PARTNERS,
  cars: CAR_PARTNERS,
  transfers: TRANSFER_PARTNERS,
  activities: ACTIVITY_PARTNERS,
  esim: ESIM_PARTNERS,
  luggage: LUGGAGE_PARTNERS,
  compensation: COMPENSATION_PARTNERS,
};

// ============================================
// PARTNER PRIORITY LOGIC
// ============================================

/**
 * Get partners sorted by revenue optimization score.
 * Prioritizes higher converting partners as primary CTA.
 */
export function getOptimizedPartners(service: ServiceCategory): AffiliatePartner[] {
  const partners = PARTNER_REGISTRIES[service] || [];
  const performance = getPartnerPerformance();
  
  // Calculate optimization score for each partner
  const scoredPartners = partners.map(partner => {
    const perf = performance.find(p => p.partnerId === partner.id);
    
    // Score calculation:
    // - Base priority (from config)
    // - CTR bonus (if we have data)
    // - RPC bonus (revenue per click)
    let score = partner.priority;
    
    if (perf && perf.clicks >= 10) {
      // CTR component (up to 20 points)
      score += Math.min(perf.ctr * 2, 20);
      
      // RPC component (up to 30 points)
      score += Math.min(perf.rpc * 10, 30);
      
      // Conversion rate component (up to 15 points)
      score += Math.min(perf.cvr, 15);
    }
    
    return { partner, score };
  });
  
  // Sort by score descending
  scoredPartners.sort((a, b) => b.score - a.score);
  
  return scoredPartners.map(s => s.partner);
}

/**
 * Get the primary (highest priority) partner for a service.
 */
export function getPrimaryPartner(service: ServiceCategory): AffiliatePartner {
  const optimized = getOptimizedPartners(service);
  return optimized[0] || PARTNER_REGISTRIES[service][0];
}

/**
 * Get secondary partners for "Compare prices" links.
 */
export function getSecondaryPartners(service: ServiceCategory, limit: number = 2): AffiliatePartner[] {
  const optimized = getOptimizedPartners(service);
  return optimized.slice(1, limit + 1);
}

// ============================================
// ADD-ON ORDERING
// ============================================

export type AddOnCategory = 'transfers' | 'activities' | 'esim' | 'luggage' | 'compensation' | 'cars';

interface AddOnClickData {
  category: AddOnCategory;
  clicks: number;
  lastClick: number;
}

/**
 * Get optimized add-on order based on A/B test and performance data.
 */
export function getOptimizedAddOnOrder(): AddOnCategory[] {
  // First check A/B test variant
  const variant = getUserVariant('addon_order');
  if (variant?.config.order) {
    return variant.config.order as AddOnCategory[];
  }
  
  // Fallback to performance-based ordering
  const clickData = getAddOnClickData();
  
  if (clickData.length === 0) {
    // Default order
    return ['transfers', 'activities', 'esim', 'luggage', 'compensation'];
  }
  
  // Sort by clicks descending
  const sortedCategories = [...clickData]
    .sort((a, b) => b.clicks - a.clicks)
    .map(d => d.category);
  
  // Ensure all categories are included
  const allCategories: AddOnCategory[] = ['transfers', 'activities', 'esim', 'luggage', 'compensation'];
  const remaining = allCategories.filter(c => !sortedCategories.includes(c));
  
  return [...sortedCategories, ...remaining];
}

/**
 * Track add-on click for optimization.
 */
export function trackAddOnClick(category: AddOnCategory): void {
  const data = getAddOnClickData();
  const existing = data.find(d => d.category === category);
  
  if (existing) {
    existing.clicks++;
    existing.lastClick = Date.now();
  } else {
    data.push({ category, clicks: 1, lastClick: Date.now() });
  }
  
  localStorage.setItem(ADDON_CLICKS_KEY, JSON.stringify(data));
  
  // Also track A/B event if in experiment
  const variant = getUserVariant('addon_order');
  if (variant) {
    trackABEvent('addon_order', variant.id, 'click', { category });
  }
}

function getAddOnClickData(): AddOnClickData[] {
  try {
    return JSON.parse(localStorage.getItem(ADDON_CLICKS_KEY) || '[]');
  } catch {
    return [];
  }
}

// ============================================
// PERFORMANCE TRACKING
// ============================================

/**
 * Track partner click for performance optimization.
 */
export function trackPartnerClick(service: ServiceCategory, partnerId: string): void {
  const performance = getPartnerPerformance();
  const existing = performance.find(p => p.partnerId === partnerId);
  
  if (existing) {
    existing.clicks++;
    existing.lastUpdated = Date.now();
    // Recalculate metrics
    existing.ctr = existing.clicks / Math.max(existing.clicks, 1) * 100;
    existing.rpc = existing.revenue / Math.max(existing.clicks, 1);
  } else {
    performance.push({
      partnerId,
      clicks: 1,
      conversions: 0,
      revenue: 0,
      ctr: 0,
      cvr: 0,
      rpc: 0,
      lastUpdated: Date.now(),
    });
  }
  
  savePartnerPerformance(performance);
}

/**
 * Track conversion (actual booking - would be called via webhook in production).
 */
export function trackConversion(service: ServiceCategory, partnerId: string, value: number): void {
  const performance = getPartnerPerformance();
  const existing = performance.find(p => p.partnerId === partnerId);
  
  if (existing) {
    existing.conversions++;
    existing.revenue += value;
    existing.cvr = (existing.conversions / existing.clicks) * 100;
    existing.rpc = existing.revenue / existing.clicks;
    existing.lastUpdated = Date.now();
  }
  
  savePartnerPerformance(performance);
  
  // Store conversion data
  const conversions = getConversionData();
  conversions.push({
    partnerId,
    service,
    timestamp: Date.now(),
    value,
    sessionId: sessionStorage.getItem('zivo_session_id') || 'unknown',
  });
  
  // Keep last 1000 conversions
  localStorage.setItem(CONVERSION_DATA_KEY, JSON.stringify(conversions.slice(-1000)));
}

function getPartnerPerformance(): PartnerPerformance[] {
  try {
    return JSON.parse(localStorage.getItem(PARTNER_PERFORMANCE_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePartnerPerformance(performance: PartnerPerformance[]): void {
  localStorage.setItem(PARTNER_PERFORMANCE_KEY, JSON.stringify(performance));
}

function getConversionData(): ConversionData[] {
  try {
    return JSON.parse(localStorage.getItem(CONVERSION_DATA_KEY) || '[]');
  } catch {
    return [];
  }
}

// ============================================
// ANALYTICS
// ============================================

export interface RevenueAnalytics {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgRPC: number;
  avgCVR: number;
  topPartners: { partnerId: string; revenue: number; clicks: number }[];
  topAddOns: { category: AddOnCategory; clicks: number }[];
  performanceByService: Record<ServiceCategory, { clicks: number; revenue: number }>;
}

export function getRevenueAnalytics(): RevenueAnalytics {
  const performance = getPartnerPerformance();
  const addOnClicks = getAddOnClickData();
  
  const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = performance.reduce((sum, p) => sum + p.conversions, 0);
  const totalRevenue = performance.reduce((sum, p) => sum + p.revenue, 0);
  
  // Top partners by revenue
  const topPartners = [...performance]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({ partnerId: p.partnerId, revenue: p.revenue, clicks: p.clicks }));
  
  // Top add-ons by clicks
  const topAddOns = [...addOnClicks]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map(a => ({ category: a.category, clicks: a.clicks }));
  
  // Performance by service (simplified - would need service mapping in production)
  const performanceByService: Record<ServiceCategory, { clicks: number; revenue: number }> = {
    flights: { clicks: 0, revenue: 0 },
    hotels: { clicks: 0, revenue: 0 },
    cars: { clicks: 0, revenue: 0 },
    transfers: { clicks: 0, revenue: 0 },
    activities: { clicks: 0, revenue: 0 },
    esim: { clicks: 0, revenue: 0 },
    luggage: { clicks: 0, revenue: 0 },
    compensation: { clicks: 0, revenue: 0 },
  };
  
  // Map partner IDs to services
  for (const [service, partners] of Object.entries(PARTNER_REGISTRIES)) {
    const partnerIds = partners.map(p => p.id);
    const servicePerf = performance.filter(p => partnerIds.includes(p.partnerId));
    performanceByService[service as ServiceCategory] = {
      clicks: servicePerf.reduce((sum, p) => sum + p.clicks, 0),
      revenue: servicePerf.reduce((sum, p) => sum + p.revenue, 0),
    };
  }
  
  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    avgRPC: totalClicks > 0 ? totalRevenue / totalClicks : 0,
    avgCVR: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    topPartners,
    topAddOns,
    performanceByService,
  };
}

// ============================================
// CLEAR DATA (For testing/admin)
// ============================================

export function clearRevenueData(): void {
  localStorage.removeItem(PARTNER_PERFORMANCE_KEY);
  localStorage.removeItem(CONVERSION_DATA_KEY);
  localStorage.removeItem(ADDON_CLICKS_KEY);
}
