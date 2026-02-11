/**
 * ZIVO Revenue Analytics
 * 
 * Comprehensive analytics for tracking affiliate performance,
 * revenue, clicks, and user engagement across all services.
 */

import { getAffiliateClicks, AffiliateClick } from './affiliateTracking';

// ============================================
// TYPES
// ============================================

export interface ProductPerformance {
  product: string;
  displayName: string;
  clicks: number;
  ctr: number;
  estimatedRevenue: number;
  topSubId: string;
  icon: string;
  color: string;
}

export interface PagePerformance {
  page: string;
  displayName: string;
  clicks: number;
  topCTALocation: string;
  views: number;
  conversionRate: number;
}

export interface SubIdReport {
  subId: string;
  clicks: number;
  percentage: number;
  product: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalClicks: number;
  estimatedRevenue: number;
  topProduct: string;
  topSubId: string;
  deviceBreakdown: DeviceBreakdown;
  productPerformance: ProductPerformance[];
  pagePerformance: PagePerformance[];
  subIdReport: SubIdReport[];
}

// ============================================
// CONSTANTS
// ============================================

export const PRODUCT_CONFIG: Record<string, { displayName: string; icon: string; color: string; commissionRate: number }> = {
  flights: { displayName: 'Flights', icon: 'plane', color: 'bg-sky-500', commissionRate: 0.02 },
  hotels: { displayName: 'Hotels', icon: 'building-2', color: 'bg-amber-500', commissionRate: 0.04 },
  car_rental: { displayName: 'Car Rental', icon: 'car', color: 'bg-violet-500', commissionRate: 0.05 },
  transfers: { displayName: 'Airport Transfers', icon: 'car-taxi-front', color: 'bg-orange-500', commissionRate: 0.08 },
  activities: { displayName: 'Activities / Things To Do', icon: 'ticket', color: 'bg-emerald-500', commissionRate: 0.06 },
  esim: { displayName: 'eSIM / Travel Internet', icon: 'smartphone', color: 'bg-cyan-500', commissionRate: 0.12 },
  luggage: { displayName: 'Luggage Storage', icon: 'luggage', color: 'bg-pink-500', commissionRate: 0.10 },
  compensation: { displayName: 'Compensation Services', icon: 'scale', color: 'bg-red-500', commissionRate: 0.20 },
};

export const SUBID_REGISTRY: Record<string, { displayName: string; product: string }> = {
  'zivo_flights': { displayName: 'Flights - Primary', product: 'flights' },
  'zivo_flights_results': { displayName: 'Flights - Results Page', product: 'flights' },
  'zivo_flights_sticky': { displayName: 'Flights - Sticky CTA', product: 'flights' },
  'zivo_hotels': { displayName: 'Hotels - Primary', product: 'hotels' },
  'zivo_hotels_results': { displayName: 'Hotels - Results Page', product: 'hotels' },
  'zivo_cars': { displayName: 'Cars - Primary', product: 'car_rental' },
  'zivo_cars_results': { displayName: 'Cars - Results Page', product: 'car_rental' },
  'zivo_transfers': { displayName: 'Transfers - Primary', product: 'transfers' },
  'zivo_activities': { displayName: 'Activities - Primary', product: 'activities' },
  'zivo_esim': { displayName: 'eSIM - Primary', product: 'esim' },
  'zivo_luggage': { displayName: 'Luggage - Primary', product: 'luggage' },
  'zivo_compensation': { displayName: 'Compensation - Primary', product: 'compensation' },
};

// ============================================
// DATA FETCHERS
// ============================================

export function getClicksForPeriod(startDate: Date, endDate: Date): AffiliateClick[] {
  const clicks = getAffiliateClicks();
  return clicks.filter(click => {
    const clickDate = new Date(click.timestamp);
    return clickDate >= startDate && clickDate <= endDate;
  });
}

export function getClicksForMonth(year: number, month: number): AffiliateClick[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  return getClicksForPeriod(startDate, endDate);
}

export function getClicksLast7Days(): AffiliateClick[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return getClicksForPeriod(startDate, endDate);
}

export function getClicksThisMonth(): AffiliateClick[] {
  const now = new Date();
  return getClicksForMonth(now.getFullYear(), now.getMonth());
}

// ============================================
// ANALYTICS CALCULATORS
// ============================================

export function calculateProductPerformance(clicks: AffiliateClick[]): ProductPerformance[] {
  const pageViews = JSON.parse(localStorage.getItem("page_views") || "[]");
  const products = Object.keys(PRODUCT_CONFIG);
  
  return products.map(product => {
    const config = PRODUCT_CONFIG[product];
    const productClicks = clicks.filter(c => c.serviceType === product);
    const productViews = pageViews.filter((v: any) => 
      v.page?.includes(product) || v.page?.includes(product.replace('_', '-'))
    ).length;
    
    // Calculate estimated revenue based on average order value and commission
    const estimatedRevenue = productClicks.reduce((sum, c) => {
      const orderValue = c.price || 100; // Default $100 if no price
      return sum + (orderValue * config.commissionRate);
    }, 0);
    
    // Find top subId
    const subIdCounts = productClicks.reduce((acc, c) => {
      const subId = c.source || 'unknown';
      acc[subId] = (acc[subId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSubId = Object.entries(subIdCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return {
      product,
      displayName: config.displayName,
      clicks: productClicks.length,
      ctr: productViews > 0 ? (productClicks.length / productViews * 100) : 0,
      estimatedRevenue,
      topSubId,
      icon: config.icon,
      color: config.color,
    };
  }).sort((a, b) => b.clicks - a.clicks);
}

export function calculatePagePerformance(clicks: AffiliateClick[]): PagePerformance[] {
  const pageViews = JSON.parse(localStorage.getItem("page_views") || "[]");
  
  const pages = [
    { page: 'homepage', displayName: 'Homepage', patterns: ['/', 'home'] },
    { page: 'flight_results', displayName: 'Flights Results', patterns: ['flight', 'flights'] },
    { page: 'hotel_results', displayName: 'Hotels Results', patterns: ['hotel', 'hotels'] },
    { page: 'car_results', displayName: 'Car Rental Results', patterns: ['car', 'cars', 'rent'] },
    { page: 'extras', displayName: 'Add-ons / Extras', patterns: ['extras', 'travel-extras'] },
  ];
  
  return pages.map(pageInfo => {
    // Filter clicks by source/page
    const pageClicks = clicks.filter(c => 
      pageInfo.patterns.some(p => 
        c.source?.toLowerCase().includes(p) || 
        c.ctaType?.toLowerCase().includes(p.replace('_', ''))
      )
    );
    
    // Filter page views
    const views = pageViews.filter((v: any) => 
      pageInfo.patterns.some(p => v.page?.toLowerCase().includes(p))
    ).length;
    
    // Find best CTA location
    const ctaCounts = pageClicks.reduce((acc, c) => {
      const cta = c.ctaType || 'unknown';
      acc[cta] = (acc[cta] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCTA = Object.entries(ctaCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return {
      page: pageInfo.page,
      displayName: pageInfo.displayName,
      clicks: pageClicks.length,
      topCTALocation: topCTA,
      views,
      conversionRate: views > 0 ? (pageClicks.length / views * 100) : 0,
    };
  }).sort((a, b) => b.clicks - a.clicks);
}

export function calculateSubIdReport(clicks: AffiliateClick[]): SubIdReport[] {
  const totalClicks = clicks.length;
  const subIdCounts: Record<string, number> = {};
  
  clicks.forEach(click => {
    const subId = click.source || 'unknown';
    subIdCounts[subId] = (subIdCounts[subId] || 0) + 1;
  });
  
  // Get previous period for trend
  const last7Days = getClicksLast7Days();
  const prev7DaysStart = new Date();
  prev7DaysStart.setDate(prev7DaysStart.getDate() - 14);
  const prev7DaysEnd = new Date();
  prev7DaysEnd.setDate(prev7DaysEnd.getDate() - 7);
  const prevPeriod = getClicksForPeriod(prev7DaysStart, prev7DaysEnd);
  
  const prevSubIdCounts: Record<string, number> = {};
  prevPeriod.forEach(click => {
    const subId = click.source || 'unknown';
    prevSubIdCounts[subId] = (prevSubIdCounts[subId] || 0) + 1;
  });
  
  // Build report with all known subIds
  const allSubIds = new Set([
    ...Object.keys(SUBID_REGISTRY),
    ...Object.keys(subIdCounts),
  ]);
  
  return Array.from(allSubIds).map(subId => {
    const currentCount = subIdCounts[subId] || 0;
    const prevCount = prevSubIdCounts[subId] || 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentCount > prevCount * 1.1) trend = 'up';
    else if (currentCount < prevCount * 0.9) trend = 'down';
    
    const registry = SUBID_REGISTRY[subId];
    
    return {
      subId,
      clicks: currentCount,
      percentage: totalClicks > 0 ? (currentCount / totalClicks * 100) : 0,
      product: registry?.product || 'unknown',
      trend,
    };
  }).sort((a, b) => b.clicks - a.clicks);
}

export function calculateDeviceBreakdown(clicks: AffiliateClick[]): DeviceBreakdown {
  const breakdown = { mobile: 0, desktop: 0, tablet: 0 };
  
  clicks.forEach(click => {
    const device = click.device || 'desktop';
    if (device in breakdown) {
      breakdown[device as keyof DeviceBreakdown]++;
    }
  });
  
  return breakdown;
}

export function calculateEstimatedRevenue(clicks: AffiliateClick[]): number {
  return clicks.reduce((sum, click) => {
    const product = click.serviceType || 'flights';
    const config = PRODUCT_CONFIG[product] || PRODUCT_CONFIG.flights;
    const orderValue = click.price || 150; // Default average
    return sum + (orderValue * config.commissionRate);
  }, 0);
}

// ============================================
// REPORT GENERATORS
// ============================================

export function generateMonthlyReport(year: number, month: number): MonthlyReport {
  const clicks = getClicksForMonth(year, month);
  const productPerformance = calculateProductPerformance(clicks);
  const pagePerformance = calculatePagePerformance(clicks);
  const subIdReport = calculateSubIdReport(clicks);
  const deviceBreakdown = calculateDeviceBreakdown(clicks);
  const estimatedRevenue = calculateEstimatedRevenue(clicks);
  
  const topProduct = productPerformance[0]?.product || 'flights';
  const topSubId = subIdReport[0]?.subId || 'unknown';
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  return {
    month: monthNames[month],
    year,
    totalClicks: clicks.length,
    estimatedRevenue,
    topProduct,
    topSubId,
    deviceBreakdown,
    productPerformance,
    pagePerformance,
    subIdReport,
  };
}

export function getOverviewStats() {
  const monthClicks = getClicksThisMonth();
  const weekClicks = getClicksLast7Days();
  const estimatedRevenueMonth = calculateEstimatedRevenue(monthClicks);
  
  const productPerformance = calculateProductPerformance(monthClicks);
  const topProduct = productPerformance[0];
  
  return {
    totalClicksMonth: monthClicks.length,
    totalClicksWeek: weekClicks.length,
    estimatedRevenue: estimatedRevenueMonth,
    topEarningProduct: topProduct?.displayName || 'N/A',
    topEarningProductRevenue: topProduct?.estimatedRevenue || 0,
    deviceBreakdown: calculateDeviceBreakdown(monthClicks),
  };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export function exportToCSV(report: MonthlyReport): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`ZIVO Monthly Revenue Report - ${report.month} ${report.year}`);
  lines.push('');
  
  // Overview
  lines.push('OVERVIEW');
  lines.push(`Total Clicks,${report.totalClicks}`);
  lines.push(`Estimated Revenue,$${report.estimatedRevenue.toFixed(2)}`);
  lines.push(`Top Product,${report.topProduct}`);
  lines.push(`Top SubID,${report.topSubId}`);
  lines.push('');
  
  // Device Breakdown
  lines.push('DEVICE BREAKDOWN');
  lines.push(`Mobile,${report.deviceBreakdown.mobile}`);
  lines.push(`Desktop,${report.deviceBreakdown.desktop}`);
  lines.push(`Tablet,${report.deviceBreakdown.tablet}`);
  lines.push('');
  
  // Product Performance
  lines.push('PRODUCT PERFORMANCE');
  lines.push('Product,Clicks,CTR,Estimated Revenue,Top SubID');
  report.productPerformance.forEach(p => {
    lines.push(`${p.displayName},${p.clicks},${p.ctr.toFixed(2)}%,$${p.estimatedRevenue.toFixed(2)},${p.topSubId}`);
  });
  lines.push('');
  
  // Page Performance
  lines.push('PAGE PERFORMANCE');
  lines.push('Page,Clicks,Top CTA Location,Views,Conversion Rate');
  report.pagePerformance.forEach(p => {
    lines.push(`${p.displayName},${p.clicks},${p.topCTALocation},${p.views},${p.conversionRate.toFixed(2)}%`);
  });
  lines.push('');
  
  // SubID Report
  lines.push('SUBID REPORT');
  lines.push('SubID,Clicks,% of Total,Product,Trend');
  report.subIdReport.forEach(s => {
    lines.push(`${s.subId},${s.clicks},${s.percentage.toFixed(2)}%,${s.product},${s.trend}`);
  });
  
  return lines.join('\n');
}

export function downloadCSV(report: MonthlyReport) {
  const csv = exportToCSV(report);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zivo-revenue-report-${report.month.toLowerCase()}-${report.year}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
