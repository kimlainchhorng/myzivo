/**
 * Smart Offers Hook
 * Unified trigger-based offer engine combining inactivity, frequency, and zone campaign signals.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBehavior } from './useUserBehavior';
import { RecommendedDeal } from './useRecommendedDeals';

export type TriggerType = 'inactivity' | 'low_frequency' | 'campaign' | 'general';

export interface SmartOffer extends RecommendedDeal {
  triggerType: TriggerType;
  triggerLabel: string | null; // "For You", "In Your Area", null
  campaignName: string | null;
}

type InactivityTier = 'gentle' | 'small' | 'strong' | null;

function getInactivityTier(daysSince: number): InactivityTier {
  if (daysSince >= 30) return 'strong';
  if (daysSince >= 14) return 'small';
  if (daysSince >= 7) return 'gentle';
  return null;
}

type FrequencyBucket = 'low' | 'medium' | 'active';

function getFrequencyBucket(count: number): FrequencyBucket {
  if (count <= 1) return 'low';
  if (count <= 3) return 'medium';
  return 'active';
}

function buildDiscountLabel(type: string | null, value: number): string {
  if (type === 'free_delivery') return 'Free Delivery';
  if (type === 'percent' || type === 'percentage') return `${value}% OFF`;
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

function getSectionTitle(
  triggerReason: TriggerType,
  cityName: string | null,
): string {
  switch (triggerReason) {
    case 'campaign':
      return cityName ? `Offers in ${cityName}` : 'Limited-time offers for you';
    case 'inactivity':
      return 'Limited-time offers for you';
    case 'low_frequency':
      return "Deals you don't want to miss";
    default:
      return "Today's best offers";
  }
}

function getSectionSubtitle(triggerReason: TriggerType, cityName: string | null): string {
  switch (triggerReason) {
    case 'campaign':
      return cityName ? `Hot in ${cityName}` : 'Curated offers for your area';
    case 'inactivity':
      return 'We picked these just for you';
    case 'low_frequency':
      return 'Great savings waiting for you';
    default:
      return 'Trending deals right now';
  }
}

export function useSmartOffers(limit = 6) {
  const { user } = useAuth();
  const { profile, getRecommendations, hasHistory } = useUserBehavior();

  // 1. Fetch user profile (city/zone)
  const { data: userProfile } = useQuery({
    queryKey: ['smart-offers-profile', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('selected_city_name, zone_id')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data as { selected_city_name: string | null; zone_id: string | null } | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 2a. Last order date (inactivity)
  const { data: lastOrderDate } = useQuery({
    queryKey: ['smart-offers-last-order', user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('food_orders')
        .select('created_at')
        .eq('customer_id', user!.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.created_at as string | null ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 2b. Order count last 30 days (frequency)
  const { data: recentOrderCount } = useQuery({
    queryKey: ['smart-offers-order-count', user?.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const { count } = await (supabase as any)
        .from('food_orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', user!.id)
        .eq('status', 'delivered')
        .gte('created_at', thirtyDaysAgo);
      return (count ?? 0) as number;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 2c. Active zone campaigns
  const { data: zoneCampaigns } = useQuery({
    queryKey: ['smart-offers-campaigns', userProfile?.selected_city_name],
    queryFn: async () => {
      const now = new Date().toISOString();
      let query = (supabase as any)
        .from('marketing_campaigns')
        .select('id, name, promo_code_id, target_city, campaign_type')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now);

      if (userProfile?.selected_city_name) {
        query = query.or(`target_city.eq.${userProfile.selected_city_name},target_city.is.null`);
      }

      const { data } = await query;
      return (data ?? []) as Array<{
        id: string;
        name: string;
        promo_code_id: string | null;
        target_city: string | null;
        campaign_type: string;
      }>;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // 2d. Active promotions (same as useRecommendedDeals)
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['smart-offers-promos'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('id, name, description, code, discount_type, discount_value, applicable_services, ends_at, merchant_id, min_order_amount, is_active, starts_at, usage_count, usage_limit')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Score and merge
  const result = useMemo(() => {
    if (!promotions || promotions.length === 0) {
      return {
        offers: [] as SmartOffer[],
        triggerReason: 'general' as TriggerType,
        sectionTitle: "Today's best offers",
        sectionSubtitle: 'Trending deals right now',
        isLoading,
        hasOffers: false,
        hasHistory,
      };
    }

    const daysSinceLastOrder = lastOrderDate
      ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / 86400000)
      : 999;

    const inactivityTier = user ? getInactivityTier(daysSinceLastOrder) : null;
    const frequencyBucket = user ? getFrequencyBucket(recentOrderCount ?? 0) : 'active';

    // Campaign promo IDs for boost + dedup
    const campaignPromoIds = new Set(
      (zoneCampaigns ?? []).filter(c => c.promo_code_id).map(c => c.promo_code_id!)
    );
    const campaignNameMap = new Map(
      (zoneCampaigns ?? []).filter(c => c.promo_code_id).map(c => [c.promo_code_id!, c.name])
    );

    const recommendations = getRecommendations();
    const recentDestinations = recommendations.recentDestinations;
    const budgetTier = profile.preferences.budgetTier;
    const hour = new Date().getHours();

    // Filter valid promos
    const validPromos = promotions.filter(
      p => p.usage_limit === null || (p.usage_count ?? 0) < p.usage_limit
    );

    const scored: SmartOffer[] = validPromos.map(p => {
      const serviceType = deriveServiceType(p.applicable_services);
      let score = 50;

      // Destination match
      if (p.description) {
        const descLower = p.description.toLowerCase();
        if (recentDestinations.some(d => descLower.includes(d.toLowerCase()))) {
          score += 20;
        }
      }

      // Service boost
      if (serviceType === 'eats' || serviceType === 'flights') score += 5;

      // Time-of-day
      const isMealTime = (hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 21);
      const isEveningBrowse = hour >= 19 && hour <= 23;
      if (serviceType === 'eats' && isMealTime) score += 10;
      if (['flights', 'hotels', 'cars'].includes(serviceType) && isEveningBrowse) score += 10;

      // Budget alignment
      const discountPct = (p.discount_type === 'percent' || p.discount_type === 'percentage') ? p.discount_value : 0;
      if (budgetTier === 'budget' && discountPct > 30) score += 10;
      else if (budgetTier === 'mid' && discountPct >= 15 && discountPct <= 30) score += 10;
      else if (budgetTier === 'luxury' && discountPct < 15 && discountPct > 0) score += 10;

      // Urgency
      if (p.ends_at) {
        const hoursLeft = (new Date(p.ends_at).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursLeft > 0 && hoursLeft <= 24) score += 15;
        else if (hoursLeft > 24 && hoursLeft <= 48) score += 5;
      }

      // --- Trigger boosts ---
      let triggerType: TriggerType = 'general';
      let triggerLabel: string | null = null;
      let campaignName: string | null = null;

      // Campaign match (highest priority)
      if (campaignPromoIds.has(p.id)) {
        score += 20;
        triggerType = 'campaign';
        triggerLabel = 'In Your Area';
        campaignName = campaignNameMap.get(p.id) ?? null;
      }

      // Inactivity boost
      if (inactivityTier && triggerType === 'general') {
        score += 25;
        triggerType = 'inactivity';
        triggerLabel = 'For You';
      }

      // Low frequency + high discount boost
      if (frequencyBucket === 'low' && discountPct >= 15 && triggerType === 'general') {
        score += 15;
        triggerType = 'low_frequency';
        triggerLabel = 'For You';
      }

      return {
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
        score,
        href: buildHref(serviceType, p.merchant_id, p.code),
        triggerType,
        triggerLabel,
        campaignName,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topOffers = scored.slice(0, limit);

    // Determine primary trigger reason from top offers
    const primaryTrigger: TriggerType =
      topOffers.find(o => o.triggerType === 'campaign')?.triggerType ??
      topOffers.find(o => o.triggerType === 'inactivity')?.triggerType ??
      topOffers.find(o => o.triggerType === 'low_frequency')?.triggerType ??
      'general';

    const cityName = userProfile?.selected_city_name ?? null;

    return {
      offers: topOffers,
      triggerReason: primaryTrigger,
      sectionTitle: getSectionTitle(primaryTrigger, cityName),
      sectionSubtitle: getSectionSubtitle(primaryTrigger, cityName),
      isLoading,
      hasOffers: topOffers.length > 0,
      hasHistory,
    };
  }, [promotions, lastOrderDate, recentOrderCount, zoneCampaigns, userProfile, profile, getRecommendations, limit, isLoading, user, hasHistory]);

  return result;
}
