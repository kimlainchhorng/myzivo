/**
 * ZIVO Ad Tracking
 * 
 * Safe, compliant tracking for paid advertising campaigns.
 * Tracks only ZIVO-side events, NOT partner bookings.
 */

export type AdPlatform = 'google' | 'meta' | 'tiktok' | 'direct';
export type AdService = 'flights' | 'hotels' | 'cars' | 'transfers' | 'activities';

interface AdPageView {
  timestamp: string;
  service: AdService;
  platform: AdPlatform;
  device: 'mobile' | 'desktop' | 'tablet';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

interface AdSearchClick {
  timestamp: string;
  service: AdService;
  platform: AdPlatform;
  device: 'mobile' | 'desktop' | 'tablet';
  searchParams?: Record<string, string>;
}

interface AdOutboundClick {
  timestamp: string;
  service: AdService;
  platform: AdPlatform;
  device: 'mobile' | 'desktop' | 'tablet';
  partner: string;
  ctaType: string;
}

// ============================================
// HELPERS
// ============================================

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  return utm;
}

function detectPlatform(): AdPlatform {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source')?.toLowerCase() || '';
  
  if (source.includes('google') || source.includes('gclid')) return 'google';
  if (source.includes('facebook') || source.includes('instagram') || source.includes('meta')) return 'meta';
  if (source.includes('tiktok')) return 'tiktok';
  return 'direct';
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEYS = {
  pageViews: 'ad_page_views',
  searchClicks: 'ad_search_clicks',
  outboundClicks: 'ad_outbound_clicks',
};

function getStoredData<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function storeData<T>(key: string, data: T) {
  const existing = getStoredData<T>(key);
  existing.push(data);
  // Keep only last 500 entries
  if (existing.length > 500) existing.shift();
  localStorage.setItem(key, JSON.stringify(existing));
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track ad landing page view
 */
export function trackAdPageView(service: AdService) {
  const utm = getUtmParams();
  
  const pageView: AdPageView = {
    timestamp: new Date().toISOString(),
    service,
    platform: detectPlatform(),
    device: getDeviceType(),
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmContent: utm.utm_content,
  };
  
  storeData(STORAGE_KEYS.pageViews, pageView);
  
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_page_view', {
      service,
      platform: pageView.platform,
      ...utm,
    });
  }
  
  console.log('[AdTracking] Page view:', pageView);
}

/**
 * Track search button click on ad landing page
 */
export function trackAdSearchClick(service: AdService, searchParams?: Record<string, string>) {
  const searchClick: AdSearchClick = {
    timestamp: new Date().toISOString(),
    service,
    platform: detectPlatform(),
    device: getDeviceType(),
    searchParams,
  };
  
  storeData(STORAGE_KEYS.searchClicks, searchClick);
  
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ad_search_click', {
      service,
      platform: searchClick.platform,
    });
  }
  
  console.log('[AdTracking] Search click:', searchClick);
}

/**
 * Track outbound affiliate click (SAFE - only tracks leaving ZIVO)
 */
export function trackAdOutboundClick(service: AdService, partner: string, ctaType: string) {
  const outboundClick: AdOutboundClick = {
    timestamp: new Date().toISOString(),
    service,
    platform: detectPlatform(),
    device: getDeviceType(),
    partner,
    ctaType,
  };
  
  storeData(STORAGE_KEYS.outboundClicks, outboundClick);
  
  // Send to Google Analytics if available (conversion tracking)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual IDs
      value: 1,
      currency: 'USD',
    });
    
    (window as any).gtag('event', 'ad_outbound_click', {
      service,
      partner,
      cta_type: ctaType,
    });
  }
  
  console.log('[AdTracking] Outbound click:', outboundClick);
}

// ============================================
// ANALYTICS
// ============================================

export function getAdAnalytics() {
  const pageViews = getStoredData<AdPageView>(STORAGE_KEYS.pageViews);
  const searchClicks = getStoredData<AdSearchClick>(STORAGE_KEYS.searchClicks);
  const outboundClicks = getStoredData<AdOutboundClick>(STORAGE_KEYS.outboundClicks);
  
  // Calculate metrics
  const totalPageViews = pageViews.length;
  const totalSearchClicks = searchClicks.length;
  const totalOutboundClicks = outboundClicks.length;
  
  const searchCTR = totalPageViews > 0 ? (totalSearchClicks / totalPageViews * 100) : 0;
  const outboundCTR = totalSearchClicks > 0 ? (totalOutboundClicks / totalSearchClicks * 100) : 0;
  
  // By platform
  const byPlatform = outboundClicks.reduce((acc, c) => {
    acc[c.platform] = (acc[c.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // By service
  const byService = outboundClicks.reduce((acc, c) => {
    acc[c.service] = (acc[c.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // By device
  const byDevice = outboundClicks.reduce((acc, c) => {
    acc[c.device] = (acc[c.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalPageViews,
    totalSearchClicks,
    totalOutboundClicks,
    searchCTR,
    outboundCTR,
    byPlatform,
    byService,
    byDevice,
  };
}
