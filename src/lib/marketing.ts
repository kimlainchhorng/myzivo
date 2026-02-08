/**
 * Marketing Automation Data Library
 * Campaign CRUD, targeting, and execution functions
 */
import { supabase } from "@/integrations/supabase/client";

// ============= Types =============

export interface CampaignTargetCriteria {
  last_order_days_ago?: number;
  min_total_orders?: number;
  max_total_orders?: number;
  city?: string;
  membership_status?: string;
  restaurant_id?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  title: string | null;
  campaign_type: "promo" | "push" | "winback" | "restaurant_boost";
  status: "draft" | "scheduled" | "running" | "completed" | "paused";
  target_audience: "all" | "inactive" | "city" | "segment" | "restaurant_customers";
  target_criteria: CampaignTargetCriteria;
  message: string | null;
  notification_title: string | null;
  notification_body: string | null;
  promo_code_id: string | null;
  credits_amount: number;
  start_date: string | null;
  end_date: string | null;
  push_enabled: boolean;
  email_enabled: boolean;
  target_city: string | null;
  target_restaurant_id: string | null;
  executed_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CampaignStats {
  users_targeted: number;
  notifications_sent: number;
  orders_generated: number;
  revenue_generated: number;
  conversion_rate: number;
}

export interface TargetedUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  total_orders: number;
  last_order_date: string | null;
}

export interface CampaignDelivery {
  id: string;
  campaign_id: string;
  user_id: string;
  status: "pending" | "sent" | "failed" | "converted";
  sent_at: string | null;
  converted_at: string | null;
  created_at: string;
}

export interface UserPromoWallet {
  id: string;
  user_id: string;
  promo_code_id: string;
  campaign_id: string | null;
  assigned_at: string;
  used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  promo_code?: {
    code: string;
    discount_type: string;
    discount_value: number;
  };
}

// ============= Campaign CRUD =============

export async function getCampaigns(): Promise<MarketingCampaign[]> {
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }

  return (data || []).map(mapCampaignFromDB);
}

export async function getCampaign(id: string): Promise<MarketingCampaign | null> {
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Error fetching campaign:", error);
    throw error;
  }

  return data ? mapCampaignFromDB(data) : null;
}

export async function createCampaign(
  campaign: Partial<MarketingCampaign>
): Promise<MarketingCampaign> {
  const { data: userData } = await supabase.auth.getUser();
  
  const insertData: Record<string, unknown> = {
    name: campaign.name || "Untitled Campaign",
    campaign_type: campaign.campaign_type || "push",
    status: campaign.status || "draft",
    target_audience: campaign.target_audience || "all",
  };
  
  // Add optional fields
  if (campaign.title) insertData.title = campaign.title;
  if (campaign.target_criteria) insertData.target_criteria = campaign.target_criteria;
  if (campaign.message) insertData.message = campaign.message;
  if (campaign.notification_title) insertData.notification_title = campaign.notification_title;
  if (campaign.notification_body) insertData.notification_body = campaign.notification_body;
  if (campaign.promo_code_id) insertData.promo_code_id = campaign.promo_code_id;
  if (campaign.credits_amount) insertData.credits_amount = campaign.credits_amount;
  if (campaign.start_date) insertData.start_date = campaign.start_date;
  if (campaign.end_date) insertData.end_date = campaign.end_date;
  if (campaign.push_enabled !== undefined) insertData.push_enabled = campaign.push_enabled;
  if (campaign.email_enabled !== undefined) insertData.email_enabled = campaign.email_enabled;
  if (campaign.target_city) insertData.target_city = campaign.target_city;
  if (campaign.target_restaurant_id) insertData.target_restaurant_id = campaign.target_restaurant_id;
  if (userData.user?.id) insertData.created_by = userData.user.id;

  const { data, error } = await supabase
    .from("marketing_campaigns")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }

  return mapCampaignFromDB(data as Record<string, unknown>);
}

export async function updateCampaign(
  id: string,
  updates: Partial<MarketingCampaign>
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.campaign_type !== undefined) updateData.campaign_type = updates.campaign_type;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.target_audience !== undefined) updateData.target_audience = updates.target_audience;
  if (updates.target_criteria !== undefined) updateData.target_criteria = updates.target_criteria;
  if (updates.message !== undefined) updateData.message = updates.message;
  if (updates.notification_title !== undefined) updateData.notification_title = updates.notification_title;
  if (updates.notification_body !== undefined) updateData.notification_body = updates.notification_body;
  if (updates.promo_code_id !== undefined) updateData.promo_code_id = updates.promo_code_id;
  if (updates.credits_amount !== undefined) updateData.credits_amount = updates.credits_amount;
  if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
  if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
  if (updates.push_enabled !== undefined) updateData.push_enabled = updates.push_enabled;
  if (updates.email_enabled !== undefined) updateData.email_enabled = updates.email_enabled;
  if (updates.target_city !== undefined) updateData.target_city = updates.target_city;
  if (updates.target_restaurant_id !== undefined) updateData.target_restaurant_id = updates.target_restaurant_id;

  const { error } = await supabase
    .from("marketing_campaigns")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from("marketing_campaigns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
}

// ============= Campaign Stats =============

export async function getCampaignStats(id: string): Promise<CampaignStats> {
  // Get stats from marketing_campaign_stats table
  const { data: statsData } = await supabase
    .from("marketing_campaign_stats")
    .select("*")
    .eq("campaign_id", id)
    .single();

  // Get delivery counts
  const { data: deliveries } = await supabase
    .from("campaign_deliveries")
    .select("status")
    .eq("campaign_id", id);

  const users_targeted = deliveries?.length || 0;
  const notifications_sent = deliveries?.filter(d => d.status === "sent" || d.status === "converted").length || 0;
  const orders_generated = statsData?.orders_generated || deliveries?.filter(d => d.status === "converted").length || 0;
  const revenue_generated = statsData?.revenue_generated || 0;

  return {
    users_targeted,
    notifications_sent,
    orders_generated,
    revenue_generated: Number(revenue_generated),
    conversion_rate: notifications_sent > 0 ? (orders_generated / notifications_sent) * 100 : 0,
  };
}

export async function getAggregateMarketingStats(): Promise<{
  active_campaigns: number;
  total_users_reached: number;
  total_orders_generated: number;
  total_revenue_impact: number;
}> {
  // Get active campaigns count
  const { data: activeCampaigns } = await supabase
    .from("marketing_campaigns")
    .select("id")
    .eq("status", "running");

  // Get aggregate stats
  const { data: allStats } = await supabase
    .from("marketing_campaign_stats")
    .select("users_targeted, orders_generated, revenue_generated");

  const totals = (allStats || []).reduce(
    (acc, stat) => ({
      users: acc.users + (stat.users_targeted || 0),
      orders: acc.orders + (stat.orders_generated || 0),
      revenue: acc.revenue + Number(stat.revenue_generated || 0),
    }),
    { users: 0, orders: 0, revenue: 0 }
  );

  return {
    active_campaigns: activeCampaigns?.length || 0,
    total_users_reached: totals.users,
    total_orders_generated: totals.orders,
    total_revenue_impact: totals.revenue,
  };
}

// ============= Targeting Engine =============

export async function getTargetedUsers(
  criteria: CampaignTargetCriteria,
  limit: number = 100
): Promise<TargetedUser[]> {
  // Start with all profiles
  let userIds: Set<string> | null = null;

  // Filter by last order date (inactive users)
  if (criteria.last_order_days_ago) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - criteria.last_order_days_ago);

    // Get users who HAVE ordered after cutoff (active users)
    const { data: activeOrders } = await supabase
      .from("food_orders")
      .select("customer_id")
      .gte("created_at", cutoffDate.toISOString())
      .eq("status", "completed");

    const activeUserIds = new Set(activeOrders?.map(o => o.customer_id) || []);

    // Get all users who have ever ordered
    const { data: allOrders } = await supabase
      .from("food_orders")
      .select("customer_id")
      .eq("status", "completed");

    // Inactive = ordered before but not after cutoff
    const allOrderUserIds = new Set(allOrders?.map(o => o.customer_id) || []);
    userIds = new Set([...allOrderUserIds].filter(id => !activeUserIds.has(id)));
  }

  // Filter by city
  if (criteria.city) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cityLocations } = await (supabase as any)
      .from("saved_locations")
      .select("user_id")
      .eq("city", criteria.city);
    
    const cityUserIds = new Set<string>((cityLocations || []).map((l: { user_id: string }) => l.user_id));
    
    if (userIds) {
      userIds = new Set<string>([...userIds].filter(id => cityUserIds.has(id)));
    } else {
      userIds = cityUserIds;
    }
  }

  // Filter by restaurant customers
  if (criteria.restaurant_id) {
    const { data: restaurantOrders } = await supabase
      .from("food_orders")
      .select("customer_id")
      .eq("restaurant_id", criteria.restaurant_id)
      .eq("status", "completed");

    const restaurantUserIds = new Set(restaurantOrders?.map(o => o.customer_id) || []);
    
    if (userIds) {
      userIds = new Set([...userIds].filter(id => restaurantUserIds.has(id)));
    } else {
      userIds = restaurantUserIds;
    }
  }

  // Build final query
  let query = supabase
    .from("profiles")
    .select("id, user_id, email, full_name, phone")
    .limit(limit);

  if (userIds && userIds.size > 0) {
    query = query.in("user_id", [...userIds]);
  }

  const { data: profiles } = await query;

  // Get order counts for each user
  const result: TargetedUser[] = [];
  
  for (const profile of profiles || []) {
    const { count } = await supabase
      .from("food_orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", profile.user_id)
      .eq("status", "completed");

    const totalOrders = count || 0;

    // Apply order count filters
    if (criteria.min_total_orders && totalOrders < criteria.min_total_orders) continue;
    if (criteria.max_total_orders && totalOrders > criteria.max_total_orders) continue;

    // Get last order date
    const { data: lastOrder } = await supabase
      .from("food_orders")
      .select("created_at")
      .eq("customer_id", profile.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    result.push({
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      total_orders: totalOrders,
      last_order_date: lastOrder?.created_at || null,
    });
  }

  return result;
}

export async function getTargetPreviewCount(
  criteria: CampaignTargetCriteria
): Promise<number> {
  const users = await getTargetedUsers(criteria, 1000);
  return users.length;
}

// ============= User Promo Wallet =============

export async function getUserPromoWallet(userId: string): Promise<UserPromoWallet[]> {
  const { data, error } = await supabase
    .from("user_promo_wallet")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching user promo wallet:", error);
    throw error;
  }

  // Fetch promo code details separately to avoid type recursion
  const results: UserPromoWallet[] = [];
  
  for (const item of data || []) {
    let promoCode: UserPromoWallet["promo_code"];
    
    if (item.promo_code_id) {
      const { data: codeData } = await supabase
        .from("promo_codes")
        .select("code, discount_type, discount_value")
        .eq("id", item.promo_code_id)
        .single();
      
      if (codeData) {
        promoCode = {
          code: codeData.code,
          discount_type: codeData.discount_type,
          discount_value: Number(codeData.discount_value),
        };
      }
    }

    results.push({
      id: item.id,
      user_id: item.user_id,
      promo_code_id: item.promo_code_id,
      campaign_id: item.campaign_id,
      assigned_at: item.assigned_at,
      used_at: item.used_at,
      expires_at: item.expires_at,
      is_active: item.is_active,
      promo_code: promoCode,
    });
  }

  return results;
}

export async function markPromoUsed(walletItemId: string): Promise<void> {
  const { error } = await supabase
    .from("user_promo_wallet")
    .update({ 
      used_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", walletItemId);

  if (error) {
    console.error("Error marking promo as used:", error);
    throw error;
  }
}

// ============= Campaign Deliveries =============

export async function getCampaignDeliveries(
  campaignId: string,
  limit: number = 50
): Promise<CampaignDelivery[]> {
  const { data, error } = await supabase
    .from("campaign_deliveries")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching deliveries:", error);
    throw error;
  }

  return (data || []).map(d => ({
    id: d.id,
    campaign_id: d.campaign_id,
    user_id: d.user_id,
    status: d.status as CampaignDelivery["status"],
    sent_at: d.sent_at,
    converted_at: d.converted_at,
    created_at: d.created_at,
  }));
}

// ============= Execute Campaign =============

export async function executeCampaign(campaignId: string): Promise<{
  success: boolean;
  users_targeted: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("execute-campaign", {
      body: { campaign_id: campaignId },
    });

    if (error) {
      return { success: false, users_targeted: 0, error: error.message };
    }

    return {
      success: true,
      users_targeted: data?.users_targeted || 0,
    };
  } catch (e) {
    return {
      success: false,
      users_targeted: 0,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

// ============= Helpers =============

function mapCampaignFromDB(data: Record<string, unknown>): MarketingCampaign {
  return {
    id: data.id as string,
    name: data.name as string,
    title: data.title as string | null,
    campaign_type: (data.campaign_type || "push") as MarketingCampaign["campaign_type"],
    status: (data.status || "draft") as MarketingCampaign["status"],
    target_audience: (data.target_audience || "all") as MarketingCampaign["target_audience"],
    target_criteria: (data.target_criteria || {}) as CampaignTargetCriteria,
    message: data.message as string | null,
    notification_title: data.notification_title as string | null,
    notification_body: data.notification_body as string | null,
    promo_code_id: data.promo_code_id as string | null,
    credits_amount: (data.credits_amount || 0) as number,
    start_date: data.start_date as string | null,
    end_date: data.end_date as string | null,
    push_enabled: (data.push_enabled ?? true) as boolean,
    email_enabled: (data.email_enabled ?? false) as boolean,
    target_city: data.target_city as string | null,
    target_restaurant_id: data.target_restaurant_id as string | null,
    executed_at: data.executed_at as string | null,
    created_at: data.created_at as string,
    created_by: data.created_by as string | null,
  };
}
