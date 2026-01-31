/**
 * ZIVO Creator Tracking
 * 
 * Tracking for influencer/creator referral traffic.
 * Supports TikTok, YouTube, Instagram, and blog creators.
 */

export type CreatorPlatform = 'tiktok' | 'youtube' | 'instagram' | 'blog' | 'other';
export type CreatorService = 'flights' | 'hotels' | 'cars' | 'extras';

// SubID registry for creators - DO NOT CHANGE without Business Ops approval
export const CREATOR_SUBIDS = {
  tiktok: 'zivo_creator_tiktok',
  youtube: 'zivo_creator_youtube',
  instagram: 'zivo_creator_instagram',
  blog: 'zivo_creator_blog',
  other: 'zivo_creator_organic',
} as const;

interface CreatorPageView {
  timestamp: string;
  service: CreatorService;
  platform: CreatorPlatform;
  creatorId?: string;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
}

interface CreatorSearchClick {
  timestamp: string;
  service: CreatorService;
  platform: CreatorPlatform;
  creatorId?: string;
  device: 'mobile' | 'desktop' | 'tablet';
}

interface CreatorOutboundClick {
  timestamp: string;
  service: CreatorService;
  platform: CreatorPlatform;
  creatorId?: string;
  device: 'mobile' | 'desktop' | 'tablet';
  partner: string;
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

export function detectCreatorPlatform(): CreatorPlatform {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref')?.toLowerCase() || '';
  const source = params.get('src')?.toLowerCase() || '';
  const referrer = document.referrer.toLowerCase();
  
  if (ref.includes('tiktok') || source.includes('tiktok') || referrer.includes('tiktok')) return 'tiktok';
  if (ref.includes('youtube') || source.includes('youtube') || referrer.includes('youtube')) return 'youtube';
  if (ref.includes('instagram') || source.includes('instagram') || referrer.includes('instagram')) return 'instagram';
  if (ref.includes('blog') || source.includes('blog')) return 'blog';
  return 'other';
}

export function getCreatorId(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get('creator') || params.get('c') || undefined;
}

export function getCreatorSubId(platform: CreatorPlatform, creatorId?: string): string {
  const baseSubId = CREATOR_SUBIDS[platform] || CREATOR_SUBIDS.other;
  return creatorId ? `${baseSubId}_${creatorId}` : baseSubId;
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEYS = {
  pageViews: 'creator_page_views',
  searchClicks: 'creator_search_clicks',
  outboundClicks: 'creator_outbound_clicks',
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
  if (existing.length > 1000) existing.shift();
  localStorage.setItem(key, JSON.stringify(existing));
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

export function trackCreatorPageView(service: CreatorService) {
  const platform = detectCreatorPlatform();
  const creatorId = getCreatorId();
  
  const pageView: CreatorPageView = {
    timestamp: new Date().toISOString(),
    service,
    platform,
    creatorId,
    device: getDeviceType(),
    referrer: document.referrer,
  };
  
  storeData(STORAGE_KEYS.pageViews, pageView);
  
  // Store creator attribution for session
  sessionStorage.setItem('creator_platform', platform);
  if (creatorId) sessionStorage.setItem('creator_id', creatorId);
  
  console.log('[CreatorTracking] Page view:', pageView);
}

export function trackCreatorSearchClick(service: CreatorService) {
  const platform = (sessionStorage.getItem('creator_platform') as CreatorPlatform) || detectCreatorPlatform();
  const creatorId = sessionStorage.getItem('creator_id') || getCreatorId();
  
  const searchClick: CreatorSearchClick = {
    timestamp: new Date().toISOString(),
    service,
    platform,
    creatorId: creatorId || undefined,
    device: getDeviceType(),
  };
  
  storeData(STORAGE_KEYS.searchClicks, searchClick);
  console.log('[CreatorTracking] Search click:', searchClick);
}

export function trackCreatorOutboundClick(service: CreatorService, partner: string) {
  const platform = (sessionStorage.getItem('creator_platform') as CreatorPlatform) || detectCreatorPlatform();
  const creatorId = sessionStorage.getItem('creator_id') || getCreatorId();
  
  const outboundClick: CreatorOutboundClick = {
    timestamp: new Date().toISOString(),
    service,
    platform,
    creatorId: creatorId || undefined,
    device: getDeviceType(),
    partner,
  };
  
  storeData(STORAGE_KEYS.outboundClicks, outboundClick);
  console.log('[CreatorTracking] Outbound click:', outboundClick);
}

// ============================================
// ANALYTICS
// ============================================

export function getCreatorAnalytics() {
  const pageViews = getStoredData<CreatorPageView>(STORAGE_KEYS.pageViews);
  const searchClicks = getStoredData<CreatorSearchClick>(STORAGE_KEYS.searchClicks);
  const outboundClicks = getStoredData<CreatorOutboundClick>(STORAGE_KEYS.outboundClicks);
  
  // By platform
  const byPlatform = outboundClicks.reduce((acc, c) => {
    acc[c.platform] = (acc[c.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // By creator
  const byCreator = outboundClicks.reduce((acc, c) => {
    const key = c.creatorId || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // By service
  const byService = outboundClicks.reduce((acc, c) => {
    acc[c.service] = (acc[c.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalPageViews: pageViews.length,
    totalSearchClicks: searchClicks.length,
    totalOutboundClicks: outboundClicks.length,
    byPlatform,
    byCreator,
    byService,
  };
}
