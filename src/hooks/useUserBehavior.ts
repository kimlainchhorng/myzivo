/**
 * User Behavior Intelligence Hook
 * Anonymized tracking for personalization
 */

import { useState, useEffect, useCallback } from 'react';
import { UserBehaviorProfile, SearchPattern } from '@/types/behaviorAnalytics';

const STORAGE_KEY = 'zivo_behavior_profile';

const defaultProfile: UserBehaviorProfile = {
  searchPatterns: {
    topRoutes: [],
    preferredDays: [],
    avgAdvanceBooking: 14,
    recentSearches: [],
  },
  preferences: {
    airlines: [],
    hotelChains: [],
    budgetTier: 'mid',
    travelStyle: [],
    cabinClass: 'economy',
  },
  engagement: {
    searchFrequency: 0,
    conversionRate: 0,
    avgSessionTime: 0,
    lastActiveAt: new Date().toISOString(),
  },
};

export function useUserBehavior() {
  const [profile, setProfile] = useState<UserBehaviorProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  // Persist profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Storage full or disabled
    }
  }, [profile]);

  // Track a search
  const trackSearch = useCallback((search: Omit<SearchPattern, 'searchedAt'>) => {
    setProfile((prev) => {
      const route = `${search.origin}-${search.destination}`;
      const newSearch: SearchPattern = {
        ...search,
        route,
        searchedAt: new Date().toISOString(),
      };

      // Keep last 20 searches
      const recentSearches = [newSearch, ...prev.searchPatterns.recentSearches].slice(0, 20);

      // Update top routes (count occurrences)
      const routeCounts: Record<string, number> = {};
      recentSearches.forEach((s) => {
        routeCounts[s.route] = (routeCounts[s.route] || 0) + 1;
      });
      const topRoutes = Object.entries(routeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route]) => route);

      return {
        ...prev,
        searchPatterns: {
          ...prev.searchPatterns,
          recentSearches,
          topRoutes,
        },
        engagement: {
          ...prev.engagement,
          searchFrequency: prev.engagement.searchFrequency + 1,
          lastActiveAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Track airline preference
  const trackAirlinePreference = useCallback((airline: string) => {
    setProfile((prev) => {
      const airlines = [airline, ...prev.preferences.airlines.filter((a) => a !== airline)].slice(0, 5);
      return {
        ...prev,
        preferences: { ...prev.preferences, airlines },
      };
    });
  }, []);

  // Track budget tier based on search prices
  const trackBudgetPreference = useCallback((avgPrice: number) => {
    setProfile((prev) => {
      let budgetTier: 'budget' | 'mid' | 'luxury' = 'mid';
      if (avgPrice < 200) budgetTier = 'budget';
      else if (avgPrice > 600) budgetTier = 'luxury';

      return {
        ...prev,
        preferences: { ...prev.preferences, budgetTier },
      };
    });
  }, []);

  // Clear behavior data
  const clearBehaviorData = useCallback(() => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Get personalized recommendations
  const getRecommendations = useCallback(() => {
    const { recentSearches, topRoutes } = profile.searchPatterns;

    // Extract unique destinations from recent searches
    const destinations = [...new Set(recentSearches.map((s) => s.destination))].slice(0, 5);

    return {
      topRoutes,
      recentDestinations: destinations,
      budgetTier: profile.preferences.budgetTier,
      preferredAirlines: profile.preferences.airlines,
    };
  }, [profile]);

  return {
    profile,
    trackSearch,
    trackAirlinePreference,
    trackBudgetPreference,
    clearBehaviorData,
    getRecommendations,
    hasHistory: profile.searchPatterns.recentSearches.length > 0,
  };
}
