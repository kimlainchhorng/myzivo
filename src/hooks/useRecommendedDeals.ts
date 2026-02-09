/**
 * Recommended Deals Hook
 * Fetches promotions and scores them by user behavior, time of day, and budget tier
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserBehavior } from './useUserBehavior';

export interface RecommendedDeal {
  id: string;
  name: string;
  description: string | null;
  code: string;
  discountLabel: string;
  discountValue: number;
  discountType: string | null;
  serviceType: string;
  expiresAt: string | null;
  merchantId: string | null;
  minOrderAmount: number | null;
  score: number;
  href: string;
}

type PromotionRow = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  discount_type: string | null;
  discount_value: number;
  applicable_services: string[] | null;
  ends_at: string | null;
  merchant_id: string | null;
  min_order_amount: number | null;
  is_active: boolean | null;
  starts_at: string | null;
  usage_count: number | null;
  usage_limit: number | null;
};

function buildDiscountLabel(type: string | null, value: number): string {
  if (type === 'free_delivery') return 'Free Delivery';
  if (type === 'percent') return `${value}% OFF`;
  return `$${value} OFF`;
}

function deriveServiceType(services: string[] | null): string {
  if (!services || services.length === 0) return 'general';
  return services[0];
}

function buildHref(serviceType: string, merchantId: string | null, code: string): string {
  switch (serviceType) {
    case 'eats':
      return merchantId ? `/eats/restaurant/${merchantId}` : '/eats';
    case 'rides':
      return `/rides?promo=${encodeURIComponent(code)}`;
    case 'flights':
    case 'hotels':
    case 'cars':
      return '/deals';
    default:
      return '/deals';
  }
}

function scoreDeal(
  deal: RecommendedDeal,
  recentDestinations: string[],
  budgetTier: 'budget' | 'mid' | 'luxury',
  hour: number
): number {
  let score = 50;

  // +20 if destination matches recent searches
  if (deal.description) {
    const descLower = deal.description.toLowerCase();
    if (recentDestinations.some(d => descLower.includes(d.toLowerCase()))) {
      score += 20;
    }
  }

  // +15 if service category matches most-searched (simplified: boost eats if user searches food often)
  // This is a simplified heuristic since we track travel searches
  if (deal.serviceType === 'eats' || deal.serviceType === 'flights') {
    score += 5;
  }

  // +10 time-of-day alignment
  const isMealTime = (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 21);
  const isEveningBrowse = hour >= 19 && hour <= 23;
  if (deal.serviceType === 'eats' && isMealTime) score += 10;
  if (['flights', 'hotels', 'cars'].includes(deal.serviceType) && isEveningBrowse) score += 10;

  // +10 budget tier alignment
  const discountPct = deal.discountType === 'percent' ? deal.discountValue : 0;
  if (budgetTier === 'budget' && discountPct > 30) score += 10;
  else if (budgetTier === 'mid' && discountPct >= 15 && discountPct <= 30) score += 10;
  else if (budgetTier === 'luxury' && discountPct < 15 && discountPct > 0) score += 10;

  // Urgency boost
  if (deal.expiresAt) {
    const hoursLeft = (new Date(deal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft > 0 && hoursLeft <= 24) score += 15;
    else if (hoursLeft > 24 && hoursLeft <= 48) score += 5;
  }

  return score;
}

export function useRecommendedDeals(limit = 6) {
  const { profile, hasHistory, getRecommendations } = useUserBehavior();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['recommended-deals'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('id, name, description, code, discount_type, discount_value, applicable_services, ends_at, merchant_id, min_order_amount, is_active, starts_at, usage_count, usage_limit')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;
      return (data as PromotionRow[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const deals = useMemo<RecommendedDeal[]>(() => {
    if (!promotions || promotions.length === 0) return [];

    const recommendations = getRecommendations();
    const recentDestinations = recommendations.recentDestinations;
    const budgetTier = profile.preferences.budgetTier;
    const hour = new Date().getHours();

    // Filter out deals that hit usage limits
    const validPromos = promotions.filter(p =>
      p.usage_limit === null || (p.usage_count ?? 0) < p.usage_limit
    );

    const mapped: RecommendedDeal[] = validPromos.map(p => {
      const serviceType = deriveServiceType(p.applicable_services);
      const deal: RecommendedDeal = {
        id: p.id,
        name: p.name,
        description: p.description,
        code: p.code,
        discountLabel: buildDiscountLabel(p.discount_type, p.discount_value),
        discountValue: p.discount_value,
        discountType: p.discount_type,
        serviceType,
        expiresAt: p.ends_at,
        merchantId: p.merchant_id,
        minOrderAmount: p.min_order_amount,
        score: 0,
        href: buildHref(serviceType, p.merchant_id, p.code),
      };

      deal.score = scoreDeal(deal, recentDestinations, budgetTier, hour);
      return deal;
    });

    return mapped
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [promotions, profile, getRecommendations, limit]);

  return {
    deals,
    isLoading,
    hasHistory,
    hasDeals: deals.length > 0,
  };
}
