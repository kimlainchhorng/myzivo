/**
 * Hook for fetching affiliate click statistics
 * Used in AdminOverview and other admin dashboards
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays } from "date-fns";

export interface ClickStats {
  today: number;
  week: number;
  month: number;
  byProduct: { product: string; count: number }[];
  byPartner: { partner: string; count: number }[];
  byCreator: { creator: string; count: number }[];
  bySource: { source: string; count: number }[];
}

async function fetchClickStats(): Promise<ClickStats> {
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfDay(subDays(now, 7)).toISOString();
  const monthStart = startOfDay(subDays(now, 30)).toISOString();
  
  // Fetch all clicks for the last 30 days
  const { data: clicks, error } = await supabase
    .from('affiliate_click_logs')
    .select('product, partner_id, creator, utm_source, created_at')
    .gte('created_at', monthStart)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[useClickStats] Failed to fetch:', error);
    throw error;
  }
  
  const allClicks = clicks || [];
  
  // Calculate time-based stats
  const today = allClicks.filter(c => c.created_at >= todayStart).length;
  const week = allClicks.filter(c => c.created_at >= weekStart).length;
  const month = allClicks.length;
  
  // Aggregate by product
  const productCounts: Record<string, number> = {};
  allClicks.forEach(c => {
    const key = c.product || 'unknown';
    productCounts[key] = (productCounts[key] || 0) + 1;
  });
  const byProduct = Object.entries(productCounts)
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Aggregate by partner
  const partnerCounts: Record<string, number> = {};
  allClicks.forEach(c => {
    const key = c.partner_id || 'unknown';
    partnerCounts[key] = (partnerCounts[key] || 0) + 1;
  });
  const byPartner = Object.entries(partnerCounts)
    .map(([partner, count]) => ({ partner, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Aggregate by creator (exclude nulls)
  const creatorCounts: Record<string, number> = {};
  allClicks.filter(c => c.creator).forEach(c => {
    const key = c.creator!;
    creatorCounts[key] = (creatorCounts[key] || 0) + 1;
  });
  const byCreator = Object.entries(creatorCounts)
    .map(([creator, count]) => ({ creator, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Aggregate by utm_source
  const sourceCounts: Record<string, number> = {};
  allClicks.forEach(c => {
    const key = c.utm_source || 'direct';
    sourceCounts[key] = (sourceCounts[key] || 0) + 1;
  });
  const bySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    today,
    week,
    month,
    byProduct,
    byPartner,
    byCreator,
    bySource,
  };
}

export function useClickStats() {
  return useQuery({
    queryKey: ['admin', 'click-stats'],
    queryFn: fetchClickStats,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
