/**
 * HIZIVO CONVERSION TRACKING
 * 
 * Compliant event tracking for Google Ads & Meta Ads
 * ONLY tracks HIZIVO-side events (NOT partner bookings)
 * 
 * DO NOT add payment_completed or purchase_value events
 * Hizivo is NOT the merchant of record
 */

export type ConversionEvent = 
  | 'page_view'
  | 'travel_search_submitted'
  | 'offer_viewed'
  | 'partner_checkout_initiated';

export type ServiceType = 'flights' | 'hotels' | 'cars';

interface TrackingParams {
  service: ServiceType;
  eventData?: Record<string, string | number | boolean>;
}

// ============================================
// GTAG (Google Ads) HELPER
// ============================================

function sendGtagEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
    console.log('[ConversionTracking] gtag:', eventName, params);
  }
}

// ============================================
// META PIXEL HELPER
// ============================================

function sendMetaEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params);
    console.log('[ConversionTracking] fbq:', eventName, params);
  }
}

// ============================================
// TIKTOK PIXEL HELPER
// ============================================

function sendTikTokEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(eventName, params);
    console.log('[ConversionTracking] ttq:', eventName, params);
  }
}

// ============================================
// MAIN TRACKING FUNCTIONS
// ============================================

/**
 * Track page view on landing pages
 * Standard event for all platforms
 */
export function trackPageView({ service, eventData = {} }: TrackingParams) {
  const params = {
    service,
    page_type: 'landing_page',
    ...eventData,
  };

  // Google Analytics
  sendGtagEvent('page_view', params);

  // Meta Pixel - PageView is auto-tracked but we add custom params
  sendMetaEvent('PageView', params);

  // TikTok
  sendTikTokEvent('ViewContent', params);

  console.log('[ConversionTracking] page_view:', params);
}

/**
 * Track when user submits a travel search
 * Key conversion event for intent signal
 */
export function trackSearchSubmitted({ service, eventData = {} }: TrackingParams) {
  const params = {
    service,
    event_category: 'engagement',
    event_label: `${service}_search`,
    ...eventData,
  };

  // Google - custom event
  sendGtagEvent('travel_search_submitted', params);

  // Meta - Search event
  sendMetaEvent('Search', {
    content_type: service,
    ...eventData,
  });

  // TikTok
  sendTikTokEvent('Search', {
    content_type: service,
    ...eventData,
  });

  console.log('[ConversionTracking] travel_search_submitted:', params);
}

/**
 * Track when user views an offer/result
 * Shows interest in specific option
 */
export function trackOfferViewed({ service, eventData = {} }: TrackingParams) {
  const params = {
    service,
    event_category: 'engagement',
    event_label: `${service}_offer_viewed`,
    ...eventData,
  };

  // Google
  sendGtagEvent('offer_viewed', params);

  // Meta - ViewContent
  sendMetaEvent('ViewContent', {
    content_type: service,
    ...eventData,
  });

  // TikTok
  sendTikTokEvent('ViewContent', {
    content_type: service,
    ...eventData,
  });

  console.log('[ConversionTracking] offer_viewed:', params);
}

/**
 * Track when user initiates partner checkout
 * HIGHEST VALUE conversion event (but NOT a purchase!)
 * This is the last event we track before user leaves Hizivo
 */
export function trackPartnerCheckoutInitiated({ service, eventData = {} }: TrackingParams) {
  const params = {
    service,
    event_category: 'conversion',
    event_label: `${service}_partner_checkout`,
    value: 1, // Placeholder value for optimization
    currency: 'USD',
    ...eventData,
  };

  // Google - InitiateCheckout equivalent (not purchase!)
  sendGtagEvent('partner_checkout_initiated', params);
  
  // Also send as a conversion goal for Google Ads
  sendGtagEvent('conversion', {
    send_to: 'AW-CONVERSION_ID/PARTNER_CHECKOUT', // Replace with actual
    ...params,
  });

  // Meta - InitiateCheckout
  sendMetaEvent('InitiateCheckout', {
    content_type: service,
    num_items: 1,
    ...eventData,
  });

  // TikTok - InitiateCheckout
  sendTikTokEvent('InitiateCheckout', {
    content_type: service,
    quantity: 1,
    ...eventData,
  });

  console.log('[ConversionTracking] partner_checkout_initiated:', params);
}

// ============================================
// AD PLATFORM SPECIFIC UTILS
// ============================================

/**
 * Get UTM parameters from current URL
 */
export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  
  return utm;
}

/**
 * Detect ad platform from URL params
 */
export function detectAdPlatform(): 'google' | 'meta' | 'tiktok' | 'direct' {
  if (typeof window === 'undefined') return 'direct';
  
  const params = new URLSearchParams(window.location.search);
  const source = (params.get('utm_source') || '').toLowerCase();
  const gclid = params.get('gclid');
  const fbclid = params.get('fbclid');
  const ttclid = params.get('ttclid');
  
  if (gclid || source.includes('google')) return 'google';
  if (fbclid || source.includes('facebook') || source.includes('instagram') || source.includes('meta')) return 'meta';
  if (ttclid || source.includes('tiktok')) return 'tiktok';
  
  return 'direct';
}

/**
 * Check if user came from paid ads
 */
export function isPaidTraffic(): boolean {
  const platform = detectAdPlatform();
  return platform !== 'direct';
}
