/**
 * LOYALTY DATA LIBRARY
 * Core functions for loyalty points, rewards, and admin management
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// INTERFACES
// ============================================

export interface LoyaltySettings {
  earnRate: { points_per_dollar: number; enabled: boolean };
  bonusRules: { first_order: number; membership_multiplier: number };
  tierThresholds: { explorer: number; traveler: number; elite: number };
  redemptionEnabled: boolean;
}

export interface PlatformReward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  rewardType: 'discount' | 'free_delivery' | 'credits' | 'perk';
  rewardValue: number;
  isActive: boolean;
  maxRedemptions: number | null;
  currentRedemptions: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  pointsAmount: number;
  balanceAfter: number;
  transactionType: 'earn' | 'redeem' | 'bonus' | 'adjust' | 'expire';
  source: string | null;
  referenceId: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface TopCustomer {
  userId: string;
  fullName: string;
  email: string;
  lifetimePoints: number;
  currentBalance: number;
  tier: string;
  totalOrders: number;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'applied' | 'expired' | 'cancelled';
  appliedToOrderId: string | null;
  createdAt: string;
  appliedAt: string | null;
  expiresAt: string | null;
  reward?: PlatformReward;
}

// ============================================
// POINTS BALANCE & HISTORY
// ============================================

export async function getPointsBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("loyalty_points")
    .select("points_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching points balance:", error);
    return 0;
  }

  return data?.points_balance ?? 0;
}

export async function getPointsHistory(
  userId: string,
  limit = 50
): Promise<PointsLedgerEntry[]> {
  const { data, error } = await supabase
    .from("points_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching points history:", error);
    return [];
  }

  return (data || []).map((entry) => ({
    id: entry.id,
    userId: entry.user_id,
    pointsAmount: entry.points_amount,
    balanceAfter: entry.balance_after,
    transactionType: entry.transaction_type as PointsLedgerEntry['transactionType'],
    source: entry.source,
    referenceId: entry.reference_id,
    description: entry.description,
    metadata: (entry.metadata as Record<string, unknown>) || {},
    createdAt: entry.created_at,
  }));
}

// ============================================
// LOYALTY SETTINGS (Admin)
// ============================================

export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const { data, error } = await supabase
    .from("loyalty_settings")
    .select("key, value");

  if (error) {
    console.error("Error fetching loyalty settings:", error);
  }

  const settings: LoyaltySettings = {
    earnRate: { points_per_dollar: 1, enabled: true },
    bonusRules: { first_order: 500, membership_multiplier: 1.5 },
    tierThresholds: { explorer: 0, traveler: 5000, elite: 25000 },
    redemptionEnabled: true,
  };

  if (data) {
    for (const row of data) {
      if (row.key === "earn_rate" && typeof row.value === 'object') {
        settings.earnRate = row.value as LoyaltySettings['earnRate'];
      } else if (row.key === "bonus_rules" && typeof row.value === 'object') {
        settings.bonusRules = row.value as LoyaltySettings['bonusRules'];
      } else if (row.key === "tier_thresholds" && typeof row.value === 'object') {
        settings.tierThresholds = row.value as LoyaltySettings['tierThresholds'];
      } else if (row.key === "redemption_enabled") {
        settings.redemptionEnabled = row.value === true || row.value === 'true';
      }
    }
  }

  return settings;
}

export async function updateLoyaltySettings(
  key: string,
  value: unknown
): Promise<void> {
  const { error } = await supabase
    .from("loyalty_settings")
    .update({ value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) {
    console.error("Error updating loyalty settings:", error);
    throw error;
  }
}

// ============================================
// PLATFORM REWARDS
// ============================================

export async function getAvailableRewards(): Promise<PlatformReward[]> {
  const { data, error } = await supabase
    .from("platform_rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    pointsRequired: r.points_required,
    rewardType: r.reward_type as PlatformReward['rewardType'],
    rewardValue: r.reward_value || 0,
    isActive: r.is_active ?? true,
    maxRedemptions: r.max_redemptions,
    currentRedemptions: r.current_redemptions ?? 0,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    createdAt: r.created_at,
  }));
}

export async function getAllRewards(): Promise<PlatformReward[]> {
  const { data, error } = await supabase
    .from("platform_rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    pointsRequired: r.points_required,
    rewardType: r.reward_type as PlatformReward['rewardType'],
    rewardValue: r.reward_value || 0,
    isActive: r.is_active ?? true,
    maxRedemptions: r.max_redemptions,
    currentRedemptions: r.current_redemptions ?? 0,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    createdAt: r.created_at,
  }));
}

export async function createReward(
  reward: Partial<PlatformReward>
): Promise<PlatformReward> {
  const { data, error } = await supabase
    .from("platform_rewards")
    .insert({
      name: reward.name || "New Reward",
      description: reward.description,
      points_required: reward.pointsRequired || 100,
      reward_type: reward.rewardType || "discount",
      reward_value: reward.rewardValue || 0,
      is_active: reward.isActive ?? true,
      max_redemptions: reward.maxRedemptions,
      valid_from: reward.validFrom,
      valid_until: reward.validUntil,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating reward:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    pointsRequired: data.points_required,
    rewardType: data.reward_type as PlatformReward['rewardType'],
    rewardValue: data.reward_value || 0,
    isActive: data.is_active ?? true,
    maxRedemptions: data.max_redemptions,
    currentRedemptions: data.current_redemptions ?? 0,
    validFrom: data.valid_from,
    validUntil: data.valid_until,
    createdAt: data.created_at,
  };
}

export async function updateReward(
  id: string,
  updates: Partial<PlatformReward>
): Promise<void> {
  const updateData: {
    updated_at: string;
    name?: string;
    description?: string | null;
    points_required?: number;
    reward_type?: string;
    reward_value?: number;
    is_active?: boolean;
    max_redemptions?: number | null;
    valid_from?: string | null;
    valid_until?: string | null;
  } = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.pointsRequired !== undefined) updateData.points_required = updates.pointsRequired;
  if (updates.rewardType !== undefined) updateData.reward_type = updates.rewardType;
  if (updates.rewardValue !== undefined) updateData.reward_value = updates.rewardValue;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.maxRedemptions !== undefined) updateData.max_redemptions = updates.maxRedemptions;
  if (updates.validFrom !== undefined) updateData.valid_from = updates.validFrom;
  if (updates.validUntil !== undefined) updateData.valid_until = updates.validUntil;

  const { error } = await supabase
    .from("platform_rewards")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating reward:", error);
    throw error;
  }
}

export async function deleteReward(id: string): Promise<void> {
  const { error } = await supabase
    .from("platform_rewards")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting reward:", error);
    throw error;
  }
}

// ============================================
// REWARD REDEMPTION
// ============================================

export async function redeemReward(
  userId: string,
  rewardId: string
): Promise<RewardRedemption> {
  // Get the reward
  const { data: reward, error: rewardError } = await supabase
    .from("platform_rewards")
    .select("*")
    .eq("id", rewardId)
    .single();

  if (rewardError || !reward) {
    throw new Error("Reward not found");
  }

  // Get current balance
  const { data: pointsData, error: pointsError } = await supabase
    .from("loyalty_points")
    .select("points_balance")
    .eq("user_id", userId)
    .single();

  if (pointsError || !pointsData) {
    throw new Error("Could not fetch points balance");
  }

  if (pointsData.points_balance < reward.points_required) {
    throw new Error("Insufficient points");
  }

  // Deduct points
  const newBalance = pointsData.points_balance - reward.points_required;

  const { error: updateError } = await supabase
    .from("loyalty_points")
    .update({ points_balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error("Failed to deduct points");
  }

  // Insert ledger entry
  await supabase.from("points_ledger").insert({
    user_id: userId,
    points_amount: -reward.points_required,
    balance_after: newBalance,
    transaction_type: "redeem",
    source: "reward",
    reference_id: rewardId,
    description: `Redeemed: ${reward.name}`,
  });

  // Create redemption record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

  const { data: redemption, error: redemptionError } = await supabase
    .from("reward_redemptions")
    .insert({
      user_id: userId,
      reward_id: rewardId,
      points_spent: reward.points_required,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (redemptionError) {
    throw new Error("Failed to create redemption record");
  }

  // Update reward redemption count
  await supabase
    .from("platform_rewards")
    .update({ current_redemptions: (reward.current_redemptions || 0) + 1 })
    .eq("id", rewardId);

  return {
    id: redemption.id,
    userId: redemption.user_id,
    rewardId: redemption.reward_id,
    pointsSpent: redemption.points_spent,
    status: redemption.status as RewardRedemption['status'],
    appliedToOrderId: redemption.applied_to_order_id,
    createdAt: redemption.created_at,
    appliedAt: redemption.applied_at,
    expiresAt: redemption.expires_at,
  };
}

export async function getUserRedemptions(
  userId: string
): Promise<RewardRedemption[]> {
  const { data, error } = await supabase
    .from("reward_redemptions")
    .select(`
      *,
      platform_rewards (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching redemptions:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    rewardId: r.reward_id,
    pointsSpent: r.points_spent,
    status: r.status as RewardRedemption['status'],
    appliedToOrderId: r.applied_to_order_id,
    createdAt: r.created_at,
    appliedAt: r.applied_at,
    expiresAt: r.expires_at,
    reward: r.platform_rewards ? {
      id: r.platform_rewards.id,
      name: r.platform_rewards.name,
      description: r.platform_rewards.description,
      pointsRequired: r.platform_rewards.points_required,
      rewardType: r.platform_rewards.reward_type as PlatformReward['rewardType'],
      rewardValue: r.platform_rewards.reward_value || 0,
      isActive: r.platform_rewards.is_active ?? true,
      maxRedemptions: r.platform_rewards.max_redemptions,
      currentRedemptions: r.platform_rewards.current_redemptions ?? 0,
      validFrom: r.platform_rewards.valid_from,
      validUntil: r.platform_rewards.valid_until,
      createdAt: r.platform_rewards.created_at,
    } : undefined,
  }));
}

// ============================================
// ADMIN: TOP CUSTOMERS
// ============================================

export async function getTopCustomers(limit = 20): Promise<TopCustomer[]> {
  const { data, error } = await supabase
    .from("loyalty_points")
    .select(`
      user_id,
      points_balance,
      lifetime_points,
      tier,
      profiles!inner (
        full_name,
        email
      )
    `)
    .order("lifetime_points", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }

  // Get order counts
  const userIds = (data || []).map((d) => d.user_id);
  const { data: orderCounts } = await supabase
    .from("food_orders")
    .select("customer_id")
    .in("customer_id", userIds)
    .eq("status", "completed");

  const orderCountMap: Record<string, number> = {};
  (orderCounts || []).forEach((o) => {
    orderCountMap[o.customer_id] = (orderCountMap[o.customer_id] || 0) + 1;
  });

  return (data || []).map((d) => {
    const profile = d.profiles as unknown as { full_name: string | null; email: string | null };
    return {
      userId: d.user_id,
      fullName: profile?.full_name || "Unknown",
      email: profile?.email || "",
      lifetimePoints: d.lifetime_points || 0,
      currentBalance: d.points_balance || 0,
      tier: d.tier || "explorer",
      totalOrders: orderCountMap[d.user_id] || 0,
    };
  });
}

// ============================================
// ADMIN: MANUAL POINTS ADJUSTMENT
// ============================================

export async function adjustPoints(
  userId: string,
  amount: number,
  reason: string,
  adminId?: string
): Promise<void> {
  // Get current balance
  const { data: pointsData, error: pointsError } = await supabase
    .from("loyalty_points")
    .select("points_balance, lifetime_points")
    .eq("user_id", userId)
    .single();

  if (pointsError) {
    // Create if not exists
    const { error: insertError } = await supabase
      .from("loyalty_points")
      .insert({
        user_id: userId,
        points_balance: Math.max(0, amount),
        lifetime_points: amount > 0 ? amount : 0,
        tier: "explorer",
      });

    if (insertError) {
      throw new Error("Failed to initialize points record");
    }

    // Insert ledger entry
    await supabase.from("points_ledger").insert({
      user_id: userId,
      points_amount: amount,
      balance_after: Math.max(0, amount),
      transaction_type: "adjust",
      source: "admin",
      description: reason,
      metadata: { admin_id: adminId },
    });

    return;
  }

  const currentBalance = pointsData.points_balance || 0;
  const newBalance = Math.max(0, currentBalance + amount);
  const lifetimeIncrease = amount > 0 ? amount : 0;

  // Update balance
  const { error: updateError } = await supabase
    .from("loyalty_points")
    .update({
      points_balance: newBalance,
      lifetime_points: (pointsData.lifetime_points || 0) + lifetimeIncrease,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    throw new Error("Failed to update points");
  }

  // Insert ledger entry
  await supabase.from("points_ledger").insert({
    user_id: userId,
    points_amount: amount,
    balance_after: newBalance,
    transaction_type: "adjust",
    source: "admin",
    description: reason,
    metadata: { admin_id: adminId },
  });
}

// ============================================
// ADMIN: PROGRAM STATS
// ============================================

export async function getLoyaltyProgramStats(): Promise<{
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeMembers: number;
  totalRedemptions: number;
}> {
  // Get total points issued (positive ledger entries)
  const { data: issuedData } = await supabase
    .from("points_ledger")
    .select("points_amount")
    .gt("points_amount", 0);

  const totalPointsIssued = (issuedData || []).reduce(
    (sum, e) => sum + e.points_amount,
    0
  );

  // Get total points redeemed (negative ledger entries)
  const { data: redeemedData } = await supabase
    .from("points_ledger")
    .select("points_amount")
    .lt("points_amount", 0);

  const totalPointsRedeemed = Math.abs(
    (redeemedData || []).reduce((sum, e) => sum + e.points_amount, 0)
  );

  // Get active members count
  const { count: activeMembers } = await supabase
    .from("loyalty_points")
    .select("id", { count: "exact", head: true })
    .gt("points_balance", 0);

  // Get total redemptions
  const { count: totalRedemptions } = await supabase
    .from("reward_redemptions")
    .select("id", { count: "exact", head: true });

  return {
    totalPointsIssued,
    totalPointsRedeemed,
    activeMembers: activeMembers || 0,
    totalRedemptions: totalRedemptions || 0,
  };
}
