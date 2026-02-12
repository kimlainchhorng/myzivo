/**
 * useDriverRatings Hook
 * Fetches and aggregates a driver's own ratings from trips
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, format } from "date-fns";

export interface DriverRatingStats {
  avgRating: number;
  totalRated: number;
  trend7d: number; // positive = improving
  trend30d: number;
  distribution: number[]; // index 0 = 1-star count, etc.
  categoryAverages: {
    driving: number;
    cleanliness: number;
    friendliness: number;
    navigation: number;
  };
  recentFeedback: Array<{
    id: string;
    rating: number;
    feedback: string | null;
    createdAt: string;
    tags: string[];
  }>;
}

export const useDriverRatings = (driverId?: string) => {
  return useQuery({
    queryKey: ["driver-ratings", driverId],
    enabled: !!driverId,
    queryFn: async (): Promise<DriverRatingStats> => {
      const now = new Date();
      const days7Ago = format(startOfDay(subDays(now, 7)), "yyyy-MM-dd'T'HH:mm:ss");
      const days30Ago = format(startOfDay(subDays(now, 30)), "yyyy-MM-dd'T'HH:mm:ss");

      const { data, error } = await supabase
        .from("trips")
        .select("id, rating, feedback, rating_categories, rating_tags, created_at")
        .eq("driver_id", driverId!)
        .eq("status", "completed")
        .not("rating", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const trips = data || [];
      const ratings = trips.map((t) => t.rating as number);
      const avgRating = ratings.length > 0
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
        : 0;

      // Distribution
      const distribution = [0, 0, 0, 0, 0];
      ratings.forEach((r) => { distribution[r - 1]++; });

      // Trends
      const ratings7d = trips.filter((t) => t.created_at >= days7Ago).map((t) => t.rating as number);
      const ratings30d = trips.filter((t) => t.created_at >= days30Ago).map((t) => t.rating as number);
      const olderRatings = trips.filter((t) => t.created_at < days7Ago).map((t) => t.rating as number);

      const avg7d = ratings7d.length > 0 ? ratings7d.reduce((a, b) => a + b, 0) / ratings7d.length : avgRating;
      const avgOlder = olderRatings.length > 0 ? olderRatings.reduce((a, b) => a + b, 0) / olderRatings.length : avgRating;
      const avg30d = ratings30d.length > 0 ? ratings30d.reduce((a, b) => a + b, 0) / ratings30d.length : avgRating;

      // Category averages from JSONB
      const catTotals = { driving: 0, cleanliness: 0, friendliness: 0, navigation: 0 };
      const catCounts = { driving: 0, cleanliness: 0, friendliness: 0, navigation: 0 };

      trips.forEach((t) => {
        const cats = t.rating_categories as Record<string, number> | null;
        if (cats) {
          (Object.keys(catTotals) as Array<keyof typeof catTotals>).forEach((key) => {
            if (cats[key]) {
              catTotals[key] += cats[key];
              catCounts[key]++;
            }
          });
        }
      });

      const categoryAverages = {
        driving: catCounts.driving > 0 ? Number((catTotals.driving / catCounts.driving).toFixed(1)) : 0,
        cleanliness: catCounts.cleanliness > 0 ? Number((catTotals.cleanliness / catCounts.cleanliness).toFixed(1)) : 0,
        friendliness: catCounts.friendliness > 0 ? Number((catTotals.friendliness / catCounts.friendliness).toFixed(1)) : 0,
        navigation: catCounts.navigation > 0 ? Number((catTotals.navigation / catCounts.navigation).toFixed(1)) : 0,
      };

      // Recent feedback (last 10 with comments)
      const recentFeedback = trips
        .filter((t) => t.feedback)
        .slice(0, 10)
        .map((t) => ({
          id: t.id,
          rating: t.rating as number,
          feedback: t.feedback,
          createdAt: t.created_at,
          tags: (t.rating_tags as string[]) || [],
        }));

      return {
        avgRating,
        totalRated: ratings.length,
        trend7d: Number((avg7d - avgOlder).toFixed(2)),
        trend30d: Number((avg30d - avgOlder).toFixed(2)),
        distribution,
        categoryAverages,
        recentFeedback,
      };
    },
    refetchInterval: 60000,
  });
};
