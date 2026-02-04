/**
 * Personalization Engine Hook
 * Uses behavior data for recommendations
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBehavior } from './useUserBehavior';
import { PersonalizationContext } from '@/types/behaviorAnalytics';

// Mock trending destinations for guests
const TRENDING_DESTINATIONS = [
  'Cancun', 'Paris', 'Tokyo', 'Dubai', 'London',
  'Barcelona', 'Bali', 'New York', 'Miami', 'Rome'
];

const POPULAR_ROUTES = [
  { origin: 'LAX', destination: 'CUN', label: 'Los Angeles → Cancun' },
  { origin: 'JFK', destination: 'CDG', label: 'New York → Paris' },
  { origin: 'SFO', destination: 'NRT', label: 'San Francisco → Tokyo' },
  { origin: 'ORD', destination: 'LHR', label: 'Chicago → London' },
  { origin: 'MIA', destination: 'SJU', label: 'Miami → San Juan' },
];

const BEST_VALUE_DESTINATIONS = [
  { name: 'Mexico City', avgPrice: 199, savings: '45%' },
  { name: 'Lisbon', avgPrice: 349, savings: '35%' },
  { name: 'Bangkok', avgPrice: 499, savings: '40%' },
  { name: 'Istanbul', avgPrice: 399, savings: '30%' },
];

export function usePersonalization() {
  const { user } = useAuth();
  const { profile, hasHistory, getRecommendations } = useUserBehavior();

  const context = useMemo<PersonalizationContext>(() => {
    const isLoggedIn = !!user;
    const recommendations = getRecommendations();

    return {
      isLoggedIn,
      hasSearchHistory: hasHistory,
      behaviorProfile: hasHistory ? profile : null,
      recommendedDestinations: hasHistory 
        ? recommendations.recentDestinations 
        : TRENDING_DESTINATIONS.slice(0, 5),
      priceAlertsSummary: {
        active: 0, // Would come from saved searches
        recentDrops: 0,
      },
    };
  }, [user, profile, hasHistory, getRecommendations]);

  // Get content for logged-in users
  const getPersonalizedContent = useMemo(() => {
    if (!context.isLoggedIn || !context.hasSearchHistory) {
      return null;
    }

    const recommendations = getRecommendations();
    return {
      recentRoutes: recommendations.topRoutes.slice(0, 3),
      recommendedDestinations: recommendations.recentDestinations,
      budgetTier: recommendations.budgetTier,
      preferredAirlines: recommendations.preferredAirlines,
    };
  }, [context.isLoggedIn, context.hasSearchHistory, getRecommendations]);

  // Get content for guests
  const getGuestContent = useMemo(() => ({
    trendingDestinations: TRENDING_DESTINATIONS,
    popularRoutes: POPULAR_ROUTES,
    bestValueDestinations: BEST_VALUE_DESTINATIONS,
  }), []);

  return {
    context,
    getPersonalizedContent,
    getGuestContent,
    isLoggedIn: context.isLoggedIn,
    hasSearchHistory: context.hasSearchHistory,
  };
}
