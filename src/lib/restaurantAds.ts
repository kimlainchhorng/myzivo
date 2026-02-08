/**
 * Restaurant Ads Data Library
 * Core functions for managing restaurant ad campaigns
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// INTERFACES
// ============================================

export interface RestaurantAd {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string | null;
  placement: 'search' | 'homepage' | 'carousel' | 'all';
  dailyBudget: number;
  totalBudget: number | null;
  spent: number;
  costPerClick: number;
  impressions: number;
  clicks: number;
  ordersFromAds: number;
  startDate: string | null;
  endDate: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'exhausted';
  isApproved: boolean;
  createdAt: string;
  createdBy: string | null;
}

export interface AdStats {
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalOrders: number;
  totalRevenue: number;
  ctr: number;
  conversionRate: number;
  roas: number;
}

export interface SponsoredRestaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine_type: string | null;
  rating: number | null;
  delivery_time_min: number | null;
  delivery_fee: number | null;
  address: string | null;
  is_open: boolean | null;
  status: string | null;
  adId: string;
  isSponsored: true;
}

export interface AdFilters {
  status?: string;
  placement?: string;
  isApproved?: boolean;
  restaurantId?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  impressions: number;
  clicks: number;
}

export interface FraudSignal {
  adId: string;
  restaurantName: string;
  signalType: 'high_ctr_no_orders' | 'click_bombing' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high';
  details: string;
  clickCount: number;
  orderCount: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapAdRow(row: any): RestaurantAd {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurants?.name,
    name: row.name,
    placement: row.placement || 'search',
    dailyBudget: Number(row.daily_budget) || 0,
    totalBudget: row.total_budget ? Number(row.total_budget) : null,
    spent: Number(row.spent) || 0,
    costPerClick: Number(row.cost_per_click) || 0.25,
    impressions: row.impressions || 0,
    clicks: row.clicks || 0,
    ordersFromAds: row.orders_from_ads || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status || 'draft',
    isApproved: row.is_approved ?? true,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

// ============================================
// MERCHANT FUNCTIONS
// ============================================

export async function getRestaurantAds(restaurantId: string): Promise<RestaurantAd[]> {
  const { data, error } = await supabase
    .from("restaurant_ads")
    .select("*, restaurants(name)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAdRow);
}

export async function getAdById(adId: string): Promise<RestaurantAd | null> {
  const { data, error } = await supabase
    .from("restaurant_ads")
    .select("*, restaurants(name)")
    .eq("id", adId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return mapAdRow(data);
}

export async function createAd(ad: Partial<RestaurantAd> & { restaurantId: string }): Promise<RestaurantAd> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("restaurant_ads")
    .insert({
      restaurant_id: ad.restaurantId,
      name: ad.name || "New Campaign",
      placement: ad.placement || "search",
      daily_budget: ad.dailyBudget || 5,
      total_budget: ad.totalBudget,
      cost_per_click: ad.costPerClick || 0.25,
      start_date: ad.startDate || new Date().toISOString(),
      end_date: ad.endDate,
      status: ad.status || "draft",
      is_approved: true,
      created_by: user?.id,
    })
    .select("*, restaurants(name)")
    .single();

  if (error) throw error;
  return mapAdRow(data);
}

export async function updateAd(id: string, updates: Partial<RestaurantAd>): Promise<void> {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.placement !== undefined) updateData.placement = updates.placement;
  if (updates.dailyBudget !== undefined) updateData.daily_budget = updates.dailyBudget;
  if (updates.totalBudget !== undefined) updateData.total_budget = updates.totalBudget;
  if (updates.costPerClick !== undefined) updateData.cost_per_click = updates.costPerClick;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.isApproved !== undefined) updateData.is_approved = updates.isApproved;

  const { error } = await supabase
    .from("restaurant_ads")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;
}

export async function pauseAd(id: string): Promise<void> {
  const { error } = await supabase
    .from("restaurant_ads")
    .update({ status: "paused", paused_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function resumeAd(id: string): Promise<void> {
  const { error } = await supabase
    .from("restaurant_ads")
    .update({ status: "active", paused_at: null })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAd(id: string): Promise<void> {
  const { error } = await supabase
    .from("restaurant_ads")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getAdStats(adId: string): Promise<AdStats> {
  const { data: ad } = await supabase
    .from("restaurant_ads")
    .select("impressions, clicks, spent, orders_from_ads")
    .eq("id", adId)
    .single();

  const { data: conversions } = await supabase
    .from("ad_conversions")
    .select("revenue_cents")
    .eq("ad_id", adId);

  const totalRevenue = (conversions || []).reduce((sum, c) => sum + c.revenue_cents, 0) / 100;
  const impressions = ad?.impressions || 0;
  const clicks = ad?.clicks || 0;
  const spent = Number(ad?.spent) || 0;
  const orders = ad?.orders_from_ads || 0;

  return {
    totalImpressions: impressions,
    totalClicks: clicks,
    totalSpent: spent,
    totalOrders: orders,
    totalRevenue,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    conversionRate: clicks > 0 ? (orders / clicks) * 100 : 0,
    roas: spent > 0 ? totalRevenue / spent : 0,
  };
}

export async function getMerchantAdStats(restaurantId: string): Promise<AdStats> {
  const { data: ads } = await supabase
    .from("restaurant_ads")
    .select("id, impressions, clicks, spent, orders_from_ads")
    .eq("restaurant_id", restaurantId);

  const adIds = (ads || []).map(a => a.id);
  
  const { data: conversions } = await supabase
    .from("ad_conversions")
    .select("revenue_cents")
    .in("ad_id", adIds.length > 0 ? adIds : ['00000000-0000-0000-0000-000000000000']);

  const totalRevenue = (conversions || []).reduce((sum, c) => sum + c.revenue_cents, 0) / 100;
  const impressions = (ads || []).reduce((sum, a) => sum + (a.impressions || 0), 0);
  const clicks = (ads || []).reduce((sum, a) => sum + (a.clicks || 0), 0);
  const spent = (ads || []).reduce((sum, a) => sum + Number(a.spent || 0), 0);
  const orders = (ads || []).reduce((sum, a) => sum + (a.orders_from_ads || 0), 0);

  return {
    totalImpressions: impressions,
    totalClicks: clicks,
    totalSpent: spent,
    totalOrders: orders,
    totalRevenue,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    conversionRate: clicks > 0 ? (orders / clicks) * 100 : 0,
    roas: spent > 0 ? totalRevenue / spent : 0,
  };
}

export async function getMerchantBalance(restaurantId: string): Promise<number> {
  const { data } = await supabase
    .from("merchant_balances")
    .select("pending")
    .eq("restaurant_id", restaurantId)
    .single();

  return Number(data?.pending) || 0;
}

// ============================================
// CUSTOMER-FACING FUNCTIONS
// ============================================

export async function getActiveAdsForPlacement(placement: string): Promise<SponsoredRestaurant[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("restaurant_ads")
    .select(`
      id,
      restaurant_id,
      restaurants (
        id,
        name,
        description,
        image_url,
        cuisine_type,
        rating,
        delivery_time_min,
        delivery_fee,
        address,
        is_open,
        status
      )
    `)
    .eq("status", "active")
    .eq("is_approved", true)
    .or(`placement.eq.${placement},placement.eq.all`)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .limit(3);

  if (error) throw error;

  return (data || [])
    .filter(d => d.restaurants)
    .map(d => ({
      ...(d.restaurants as any),
      adId: d.id,
      isSponsored: true as const,
    }));
}

export async function recordImpression(adId: string, userId: string | null): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const effectiveUserId = userId || user?.id;

  // Get restaurant_id and current impressions from ad
  const { data: ad } = await supabase
    .from("restaurant_ads")
    .select("restaurant_id, impressions")
    .eq("id", adId)
    .single();

  if (!ad) return;

  // Insert impression
  await supabase.from("ad_impressions").insert({
    ad_id: adId,
    restaurant_id: ad.restaurant_id,
    user_id: effectiveUserId,
  });

  // Update ad impressions count
  await supabase
    .from("restaurant_ads")
    .update({ impressions: (ad.impressions || 0) + 1 })
    .eq("id", adId);
}

export async function recordClick(adId: string, userId: string | null): Promise<string | null> {
  try {
    const response = await supabase.functions.invoke("track-ad-event", {
      body: { adId, eventType: "click", userId },
    });

    if (response.error) throw response.error;
    return response.data?.clickId || null;
  } catch (error) {
    console.error("Failed to record click:", error);
    return null;
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function getAllAds(filters?: AdFilters): Promise<RestaurantAd[]> {
  let query = supabase
    .from("restaurant_ads")
    .select("*, restaurants(name)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.placement) {
    query = query.eq("placement", filters.placement);
  }
  if (filters?.isApproved !== undefined) {
    query = query.eq("is_approved", filters.isApproved);
  }
  if (filters?.restaurantId) {
    query = query.eq("restaurant_id", filters.restaurantId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapAdRow);
}

export async function approveAd(id: string): Promise<void> {
  const { error } = await supabase
    .from("restaurant_ads")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) throw error;
}

export async function rejectAd(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("restaurant_ads")
    .update({ is_approved: false, status: "paused" })
    .eq("id", id);

  if (error) throw error;
}

export async function getAdsRevenue(dateRange?: DateRange): Promise<{ total: number; byDay: DailyRevenue[] }> {
  let query = supabase
    .from("ad_billing_events")
    .select("amount_cents, created_at")
    .eq("event_type", "click_charge");

  if (dateRange) {
    query = query
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  const total = (data || []).reduce((sum, e) => sum + e.amount_cents, 0) / 100;

  // Group by day
  const byDayMap = new Map<string, DailyRevenue>();
  (data || []).forEach(e => {
    const date = e.created_at.split("T")[0];
    const existing = byDayMap.get(date) || { date, revenue: 0, impressions: 0, clicks: 0 };
    existing.revenue += e.amount_cents / 100;
    existing.clicks += 1;
    byDayMap.set(date, existing);
  });

  return {
    total,
    byDay: Array.from(byDayMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export async function getFraudSignals(): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];

  // High CTR but no orders
  const { data: highCtrNoOrders } = await supabase
    .from("restaurant_ads")
    .select("id, name, clicks, orders_from_ads, restaurants(name)")
    .gt("clicks", 50)
    .eq("orders_from_ads", 0)
    .eq("status", "active");

  (highCtrNoOrders || []).forEach(ad => {
    signals.push({
      adId: ad.id,
      restaurantName: (ad.restaurants as any)?.name || "Unknown",
      signalType: "high_ctr_no_orders",
      severity: ad.clicks > 200 ? "high" : "medium",
      details: `${ad.clicks} clicks but 0 orders`,
      clickCount: ad.clicks,
      orderCount: 0,
    });
  });

  // Click bombing detection would require more complex queries
  // This is a simplified version

  return signals;
}

export async function getActiveAdCount(): Promise<number> {
  const { count } = await supabase
    .from("restaurant_ads")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return count || 0;
}

export async function getPendingApprovalCount(): Promise<number> {
  const { count } = await supabase
    .from("restaurant_ads")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false)
    .neq("status", "draft");

  return count || 0;
}
