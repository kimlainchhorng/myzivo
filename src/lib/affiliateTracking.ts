// Affiliate tracking utilities for flight bookings

export interface AffiliateClick {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  flightId: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  price: number;
  passengers: number;
  cabinClass: string;
  affiliatePartner: string;
  referralUrl: string;
  userAgent: string;
  source: string;
  ctaType?: 'top_cta' | 'result_card' | 'sticky_cta' | 'compare_prices' | 'no_results_fallback' | 'partner_selector' | 'exit_intent' | 'cross_sell' | 'popular_route' | 'trending_deal';
  serviceType?: 'flights' | 'hotels' | 'car_rental' | 'activities' | 'transfers' | 'esim' | 'luggage' | 'compensation';
  device?: 'mobile' | 'desktop' | 'tablet';
  route?: string;
}

// Generate session ID for tracking
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("affiliate_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("affiliate_session_id", sessionId);
  }
  return sessionId;
};

// Detect device type
export const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Track affiliate click with CTA type for analytics
export const trackAffiliateClick = (data: Omit<AffiliateClick, "id" | "timestamp" | "sessionId" | "userAgent" | "device">) => {
  const click: AffiliateClick = {
    ...data,
    id: `click_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date(),
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    device: getDeviceType(),
    route: data.origin && data.destination ? `${data.origin}-${data.destination}` : undefined,
  };

  // Store locally for demo (in production, send to backend)
  const clicks = JSON.parse(localStorage.getItem("affiliate_clicks") || "[]");
  clicks.push(click);
  localStorage.setItem("affiliate_clicks", JSON.stringify(clicks));

  // Log for analytics with CTA type
  console.log("[Affiliate Tracking]", {
    ctaType: click.ctaType,
    serviceType: click.serviceType,
    partner: click.affiliatePartner,
    source: click.source,
    device: click.device,
    route: click.route,
  });

  // In production, you would send to your analytics endpoint:
  // await fetch('/api/track-affiliate', { method: 'POST', body: JSON.stringify(click) });

  return click;
};

// Track page view for session analytics
export const trackPageView = (page: string, metadata?: Record<string, any>) => {
  const views = JSON.parse(localStorage.getItem("page_views") || "[]");
  views.push({
    id: `view_${Date.now()}`,
    sessionId: getSessionId(),
    page,
    timestamp: new Date(),
    device: getDeviceType(),
    ...metadata,
  });
  localStorage.setItem("page_views", JSON.stringify(views));
};

// Get affiliate clicks for analytics
export const getAffiliateClicks = (): AffiliateClick[] => {
  const clicks = JSON.parse(localStorage.getItem("affiliate_clicks") || "[]");
  return clicks.map((c: any) => ({
    ...c,
    timestamp: new Date(c.timestamp),
  }));
};

// Build affiliate URL with tracking params
export const buildAffiliateUrl = (params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  partner?: string;
}): string => {
  const { origin, destination, departDate, returnDate, passengers, cabinClass, partner = "skyscanner" } = params;
  
  const trackingId = `zivo_${Date.now()}`;
  
  switch (partner) {
    case "skyscanner":
      const dateFormatted = departDate.replace(/-/g, "").substring(2);
      let url = `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${dateFormatted}/`;
      if (returnDate) {
        url += `${returnDate.replace(/-/g, "").substring(2)}/`;
      }
      url += `?adultsv2=${passengers}&cabinclass=${cabinClass}&ref=zivo&utm_source=zivo&utm_medium=affiliate&utm_campaign=flights`;
      return url;
      
    case "kayak":
      return `https://www.kayak.com/flights/${origin}-${destination}/${departDate}${returnDate ? `/${returnDate}` : ""}/${passengers}adults?sort=bestflight_a&fs=cabin=${cabinClass}&utm_source=zivo&utm_medium=affiliate`;
      
    case "google_flights":
      return `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}%20on%20${departDate}&curr=USD&utm_source=zivo`;
      
    default:
      return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${departDate.replace(/-/g, "").substring(2)}/?adultsv2=${passengers}`;
  }
};

// Analytics aggregation with enhanced metrics
export const getAffiliateAnalytics = () => {
  const clicks = getAffiliateClicks();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayClicks = clicks.filter(c => new Date(c.timestamp) >= today);
  const weekClicks = clicks.filter(c => new Date(c.timestamp) >= thisWeekStart);
  const monthClicks = clicks.filter(c => new Date(c.timestamp) >= thisMonthStart);

  const totalRevenue = clicks.reduce((sum, c) => sum + (c.price * c.passengers * 0.02), 0); // 2% commission estimate
  const todayRevenue = todayClicks.reduce((sum, c) => sum + (c.price * c.passengers * 0.02), 0);

  const topAirlines = clicks.reduce((acc, c) => {
    acc[c.airline] = (acc[c.airline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoutes = clicks.reduce((acc, c) => {
    const route = `${c.origin}-${c.destination}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clicksByPartner = clicks.reduce((acc, c) => {
    acc[c.affiliatePartner] = (acc[c.affiliatePartner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // New: Clicks by CTA type
  const clicksByCTA = clicks.reduce((acc, c) => {
    const cta = c.ctaType || 'unknown';
    acc[cta] = (acc[cta] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // New: Device breakdown
  const clicksByDevice = clicks.reduce((acc, c) => {
    const device = c.device || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // New: CTR by CTA type (requires page views)
  const pageViews = JSON.parse(localStorage.getItem("page_views") || "[]");
  const resultsViews = pageViews.filter((v: any) => v.page === 'flight_results').length;
  const conversionRate = resultsViews > 0 ? (clicks.length / resultsViews * 100).toFixed(2) : 0;

  return {
    totalClicks: clicks.length,
    todayClicks: todayClicks.length,
    weekClicks: weekClicks.length,
    monthClicks: monthClicks.length,
    totalRevenue,
    todayRevenue,
    avgOrderValue: clicks.length > 0 ? clicks.reduce((sum, c) => sum + c.price, 0) / clicks.length : 0,
    topAirlines: Object.entries(topAirlines).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topRoutes: Object.entries(topRoutes).sort((a, b) => b[1] - a[1]).slice(0, 5),
    clicksByPartner,
    clicksByCTA,
    clicksByDevice,
    conversionRate,
    resultsViews,
    recentClicks: clicks.slice(-10).reverse(),
  };
};
