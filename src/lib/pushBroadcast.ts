/**
 * Push Broadcast Library
 * Data layer for managing push segments and campaigns
 */

import { supabase } from "@/integrations/supabase/client";

// ============ Types ============

export interface SegmentRules {
  // Role-based targeting
  roles?: ("customer" | "driver" | "merchant" | "admin")[];
  
  // Driver-specific
  driver_is_online?: boolean;
  driver_status?: "active" | "inactive" | "suspended";
  
  // Customer activity
  last_order_days_ago?: number;
  has_ordered_ever?: boolean;
  
  // Membership
  has_membership?: boolean;
  
  // Location
  city?: string;
}

export interface PushSegment {
  id: string;
  name: string;
  description: string | null;
  rules_json: SegmentRules;
  estimated_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PushCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  url: string | null;
  icon: string | null;
  segment_id: string | null;
  target_type: "segment" | "all" | "test";
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  send_at: string | null;
  sent_at: string | null;
  targeted_count: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  segment?: PushSegment;
}

export interface PushDeliveryLog {
  id: string;
  campaign_id: string;
  user_id: string;
  status: "sent" | "failed" | "skipped";
  error: string | null;
  skip_reason: string | null;
  created_at: string;
}

export interface PushStats {
  totalCampaigns: number;
  totalSent: number;
  totalFailed: number;
  totalSkipped: number;
  activeSegments: number;
  scheduledCampaigns: number;
  deliveryRate: number;
}

// ============ Segments CRUD ============

export async function getSegments(): Promise<PushSegment[]> {
  const { data, error } = await supabase
    .from("push_segments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as PushSegment[];
}

export async function getSegment(id: string): Promise<PushSegment | null> {
  const { data, error } = await supabase
    .from("push_segments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PushSegment;
}

export async function createSegment(
  segment: Partial<PushSegment>
): Promise<PushSegment> {
  const { data: user } = await supabase.auth.getUser();
  
  const insertData = {
    name: segment.name || "Untitled Segment",
    description: segment.description,
    rules_json: segment.rules_json || {},
    estimated_count: segment.estimated_count || 0,
    is_active: segment.is_active ?? true,
    created_by: user?.user?.id,
  };
  
  const { data, error } = await supabase
    .from("push_segments")
    .insert(insertData as any)
    .select()
    .single();

  if (error) throw error;
  return data as PushSegment;
}

export async function updateSegment(
  id: string,
  updates: Partial<PushSegment>
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.rules_json !== undefined) updateData.rules_json = updates.rules_json;
  if (updates.estimated_count !== undefined) updateData.estimated_count = updates.estimated_count;
  if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

  const { error } = await supabase
    .from("push_segments")
    .update(updateData as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSegment(id: string): Promise<void> {
  const { error } = await supabase
    .from("push_segments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ Segment User Resolution ============

export async function estimateSegmentSize(rules: SegmentRules): Promise<number> {
  const users = await resolveSegmentUsers(rules);
  return users.length;
}

export async function previewSegmentUsers(
  rules: SegmentRules,
  limit = 10
): Promise<{ user_id: string; email: string | null; full_name: string | null }[]> {
  const userIds = await resolveSegmentUsers(rules);
  
  if (userIds.length === 0) return [];
  
  const { data } = await supabase
    .from("profiles")
    .select("user_id, email, full_name")
    .in("user_id", userIds.slice(0, limit));
  
  return data || [];
}

async function resolveSegmentUsers(rules: SegmentRules): Promise<string[]> {
  const userIds = new Set<string>();
  
  // If roles specified, get users by role
  if (rules.roles && rules.roles.length > 0) {
    for (const role of rules.roles) {
      if (role === "driver") {
        // Get drivers
        let query = supabase.from("drivers").select("user_id");
        
        if (rules.driver_is_online !== undefined) {
          query = query.eq("is_online", rules.driver_is_online);
        }
        // Note: driver_status filter removed as DB uses different status values
        
        const { data } = await query;
        data?.forEach((d) => d.user_id && userIds.add(d.user_id));
      } else if (role === "merchant") {
        // Get restaurant owners
        const { data } = await supabase
          .from("restaurants")
          .select("owner_id")
          .not("owner_id", "is", null);
        data?.forEach((r) => r.owner_id && userIds.add(r.owner_id));
      } else if (role === "customer") {
        // Get users who have placed orders
        if (rules.has_ordered_ever || rules.last_order_days_ago) {
          const { data } = await supabase
            .from("food_orders")
            .select("customer_id")
            .not("customer_id", "is", null);
          
          const customerIds = [...new Set(data?.map((o) => o.customer_id).filter(Boolean))];
          
          if (rules.last_order_days_ago) {
            // Filter to inactive customers
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - rules.last_order_days_ago);
            
            const { data: recentOrders } = await supabase
              .from("food_orders")
              .select("customer_id")
              .gte("created_at", cutoffDate.toISOString());
            
            const activeCustomers = new Set(recentOrders?.map((o) => o.customer_id));
            customerIds.filter((id) => !activeCustomers.has(id)).forEach((id) => userIds.add(id!));
          } else {
            customerIds.forEach((id) => userIds.add(id!));
          }
        } else {
          // All profiles as customers
          const { data } = await supabase
            .from("profiles")
            .select("user_id")
            .limit(10000);
          data?.forEach((p) => userIds.add(p.user_id));
        }
      } else if (role === "admin") {
        const { data } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin"]);
        data?.forEach((r) => userIds.add(r.user_id));
      }
    }
  } else {
    // No roles specified - get all users
    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(10000);
    data?.forEach((p) => userIds.add(p.user_id));
  }
  
  // Filter by membership if specified
  if (rules.has_membership !== undefined) {
    // Check memberships table for active subscriptions
    const { data: members } = await supabase
      .from("memberships")
      .select("user_id")
      .eq("status", "active");
    
    const memberIds = new Set((members || []).map((m: { user_id: string }) => m.user_id));
    
    if (rules.has_membership) {
      // Keep only members
      const filtered = [...userIds].filter((id) => memberIds.has(id));
      userIds.clear();
      filtered.forEach((id) => userIds.add(id));
    } else {
      // Keep only non-members
      const filtered = [...userIds].filter((id) => !memberIds.has(id));
      userIds.clear();
      filtered.forEach((id) => userIds.add(id));
    }
  }
  
  // Filter by city if specified
  if (rules.city) {
    const { data: locations } = await supabase
      .from("saved_locations")
      .select("user_id")
      .ilike("city", `%${rules.city}%`);
    
    const cityUserIds = new Set(locations?.map((l) => l.user_id));
    const filtered = [...userIds].filter((id) => cityUserIds.has(id));
    userIds.clear();
    filtered.forEach((id) => userIds.add(id));
  }
  
  return [...userIds];
}

// ============ Campaigns CRUD ============

export async function getCampaigns(): Promise<PushCampaign[]> {
  const { data, error } = await supabase
    .from("push_campaigns")
    .select(`
      *,
      segment:push_segments(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as PushCampaign[];
}

export async function getCampaign(id: string): Promise<PushCampaign | null> {
  const { data, error } = await supabase
    .from("push_campaigns")
    .select(`
      *,
      segment:push_segments(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as PushCampaign;
}

export async function createCampaign(
  campaign: Partial<PushCampaign>
): Promise<PushCampaign> {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("push_campaigns")
    .insert({
      name: campaign.name || "Untitled Campaign",
      title: campaign.title || "",
      body: campaign.body || "",
      url: campaign.url,
      icon: campaign.icon,
      segment_id: campaign.segment_id,
      target_type: campaign.target_type || "segment",
      status: campaign.status || "draft",
      send_at: campaign.send_at,
      created_by: user?.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PushCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<PushCampaign>
): Promise<void> {
  const { error } = await supabase
    .from("push_campaigns")
    .update({
      name: updates.name,
      title: updates.title,
      body: updates.body,
      url: updates.url,
      icon: updates.icon,
      segment_id: updates.segment_id,
      target_type: updates.target_type,
      status: updates.status,
      send_at: updates.send_at,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from("push_campaigns")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function cancelCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from("push_campaigns")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "scheduled");

  if (error) throw error;
}

// ============ Campaign Execution ============

export async function sendCampaignNow(
  campaignId: string
): Promise<{ sent: number; failed: number; skipped: number }> {
  const { data, error } = await supabase.functions.invoke("send-segment-push", {
    body: { campaign_id: campaignId },
  });

  if (error) throw error;
  return data;
}

export async function scheduleCampaign(id: string, sendAt: Date): Promise<void> {
  const { error } = await supabase
    .from("push_campaigns")
    .update({
      status: "scheduled",
      send_at: sendAt.toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function sendTestPush(
  userId: string,
  title: string,
  body: string,
  url?: string
): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push-notification", {
    body: {
      user_id: userId,
      notification_type: "test",
      title,
      body,
      data: { type: "test", url },
    },
  });

  if (error) throw error;
}

// ============ Delivery Logs ============

export async function getCampaignDeliveryLogs(
  campaignId: string,
  limit = 100
): Promise<PushDeliveryLog[]> {
  const { data, error } = await supabase
    .from("push_delivery_log")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as PushDeliveryLog[];
}

// ============ Stats ============

export async function getPushStats(): Promise<PushStats> {
  const [campaigns, segments] = await Promise.all([
    supabase.from("push_campaigns").select("status, sent_count, failed_count, skipped_count"),
    supabase.from("push_segments").select("id").eq("is_active", true),
  ]);

  const campaignData = campaigns.data || [];
  const totalSent = campaignData.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalFailed = campaignData.reduce((sum, c) => sum + (c.failed_count || 0), 0);
  const totalSkipped = campaignData.reduce((sum, c) => sum + (c.skipped_count || 0), 0);
  const total = totalSent + totalFailed;
  
  return {
    totalCampaigns: campaignData.length,
    totalSent,
    totalFailed,
    totalSkipped,
    activeSegments: segments.data?.length || 0,
    scheduledCampaigns: campaignData.filter((c) => c.status === "scheduled").length,
    deliveryRate: total > 0 ? (totalSent / total) * 100 : 0,
  };
}
