/**
 * useQualityMetrics Hook
 * Fetches quality metrics and ratings data for dispatch dashboard
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { subDays, startOfDay, format } from "date-fns";

export interface QualityKPIs {
  avgDriverRating: number;
  avgDriverRating7d: number;
  avgDriverRating30d: number;
  avgMerchantRating: number;
  avgMerchantRating7d: number;
  avgMerchantRating30d: number;
  complaintRate: number;
  totalRatings: number;
  totalRatings7d: number;
}

export interface WorstPerformer {
  id: string;
  name: string;
  type: "driver" | "merchant";
  avgRating: number;
  ratingCount: number;
  complaintCount: number;
}

export interface LowRating {
  id: string;
  orderId: string;
  createdAt: string;
  driverName: string | null;
  merchantName: string | null;
  driverRating: number | null;
  merchantRating: number | null;
  tags: string[];
  comment: string | null;
  contactBack: boolean;
}

export interface RatingDistribution {
  rating: number;
  driverCount: number;
  merchantCount: number;
}

const NEGATIVE_TAGS = ["late", "rude", "cold_food", "wrong_item", "unsafe", "damaged"];

export const useQualityKPIs = () => {
  return useQuery({
    queryKey: ["quality-kpis"],
    queryFn: async (): Promise<QualityKPIs> => {
      const now = new Date();
      const days7Ago = format(startOfDay(subDays(now, 7)), "yyyy-MM-dd'T'HH:mm:ss");
      const days30Ago = format(startOfDay(subDays(now, 30)), "yyyy-MM-dd'T'HH:mm:ss");

      // Fetch all ratings
      const { data: allRatings, error } = await supabase
        .from("order_ratings")
        .select("driver_rating, merchant_rating, tags, created_at");

      if (error) throw error;

      const ratings = allRatings || [];
      const ratings7d = ratings.filter((r) => r.created_at >= days7Ago);
      const ratings30d = ratings.filter((r) => r.created_at >= days30Ago);

      // Calculate averages
      const calcAvg = (items: typeof ratings, field: "driver_rating" | "merchant_rating") => {
        const valid = items.filter((r) => r[field] !== null);
        if (valid.length === 0) return 0;
        return Number((valid.reduce((sum, r) => sum + (r[field] || 0), 0) / valid.length).toFixed(2));
      };

      // Calculate complaint rate (ratings with negative tags)
      const withComplaints = ratings.filter((r) => 
        r.tags && r.tags.some((t: string) => NEGATIVE_TAGS.includes(t))
      );
      const complaintRate = ratings.length > 0 
        ? Number(((withComplaints.length / ratings.length) * 100).toFixed(1))
        : 0;

      return {
        avgDriverRating: calcAvg(ratings, "driver_rating"),
        avgDriverRating7d: calcAvg(ratings7d, "driver_rating"),
        avgDriverRating30d: calcAvg(ratings30d, "driver_rating"),
        avgMerchantRating: calcAvg(ratings, "merchant_rating"),
        avgMerchantRating7d: calcAvg(ratings7d, "merchant_rating"),
        avgMerchantRating30d: calcAvg(ratings30d, "merchant_rating"),
        complaintRate,
        totalRatings: ratings.length,
        totalRatings7d: ratings7d.length,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useWorstPerformers = (limit = 10) => {
  return useQuery({
    queryKey: ["worst-performers", limit],
    queryFn: async (): Promise<WorstPerformer[]> => {
      // Get worst drivers (min 3 ratings)
      const { data: driverRatings } = await supabase
        .from("order_ratings")
        .select("driver_id, driver_rating, tags")
        .not("driver_id", "is", null)
        .not("driver_rating", "is", null);

      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, full_name");

      const driverMap = new Map(drivers?.map((d) => [d.id, d.full_name]) || []);

      // Aggregate driver stats
      const driverStats = new Map<string, { ratings: number[]; complaints: number }>();
      (driverRatings || []).forEach((r) => {
        if (!r.driver_id) return;
        const stat = driverStats.get(r.driver_id) || { ratings: [], complaints: 0 };
        stat.ratings.push(r.driver_rating!);
        if (r.tags?.some((t: string) => NEGATIVE_TAGS.includes(t))) {
          stat.complaints++;
        }
        driverStats.set(r.driver_id, stat);
      });

      const worstDrivers: WorstPerformer[] = [];
      driverStats.forEach((stat, driverId) => {
        if (stat.ratings.length >= 3) {
          const avgRating = stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length;
          worstDrivers.push({
            id: driverId,
            name: driverMap.get(driverId) || "Unknown Driver",
            type: "driver",
            avgRating: Number(avgRating.toFixed(2)),
            ratingCount: stat.ratings.length,
            complaintCount: stat.complaints,
          });
        }
      });

      // Get worst merchants
      const { data: merchantRatings } = await supabase
        .from("order_ratings")
        .select("restaurant_id, merchant_rating, tags")
        .not("restaurant_id", "is", null)
        .not("merchant_rating", "is", null);

      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name");

      const restaurantMap = new Map(restaurants?.map((r) => [r.id, r.name]) || []);

      const merchantStats = new Map<string, { ratings: number[]; complaints: number }>();
      (merchantRatings || []).forEach((r) => {
        if (!r.restaurant_id) return;
        const stat = merchantStats.get(r.restaurant_id) || { ratings: [], complaints: 0 };
        stat.ratings.push(r.merchant_rating!);
        if (r.tags?.some((t: string) => NEGATIVE_TAGS.includes(t))) {
          stat.complaints++;
        }
        merchantStats.set(r.restaurant_id, stat);
      });

      const worstMerchants: WorstPerformer[] = [];
      merchantStats.forEach((stat, merchantId) => {
        if (stat.ratings.length >= 3) {
          const avgRating = stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length;
          worstMerchants.push({
            id: merchantId,
            name: restaurantMap.get(merchantId) || "Unknown Restaurant",
            type: "merchant",
            avgRating: Number(avgRating.toFixed(2)),
            ratingCount: stat.ratings.length,
            complaintCount: stat.complaints,
          });
        }
      });

      // Combine and sort by avg rating (lowest first), then take limit
      return [...worstDrivers, ...worstMerchants]
        .sort((a, b) => a.avgRating - b.avgRating)
        .slice(0, limit);
    },
  });
};

export const useLowRatings = (limit = 20) => {
  return useQuery({
    queryKey: ["low-ratings", limit],
    queryFn: async (): Promise<LowRating[]> => {
      const { data, error } = await supabase
        .from("order_ratings")
        .select(`
          id,
          order_id,
          created_at,
          driver_rating,
          merchant_rating,
          tags,
          comment,
          contact_back,
          driver_id,
          restaurant_id
        `)
        .or("driver_rating.lte.2,merchant_rating.lte.2")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch driver and restaurant names
      const driverIds = [...new Set((data || []).map((r) => r.driver_id).filter(Boolean))];
      const restaurantIds = [...new Set((data || []).map((r) => r.restaurant_id).filter(Boolean))];

      const [driversRes, restaurantsRes] = await Promise.all([
        driverIds.length > 0
          ? supabase.from("drivers").select("id, full_name").in("id", driverIds)
          : { data: [] },
        restaurantIds.length > 0
          ? supabase.from("restaurants").select("id, name").in("id", restaurantIds)
          : { data: [] },
      ]);

      const driverMap = new Map((driversRes.data || []).map((d) => [d.id, d.full_name]));
      const restaurantMap = new Map((restaurantsRes.data || []).map((r) => [r.id, r.name]));

      return (data || []).map((r) => ({
        id: r.id,
        orderId: r.order_id,
        createdAt: r.created_at,
        driverName: r.driver_id ? driverMap.get(r.driver_id) || null : null,
        merchantName: r.restaurant_id ? restaurantMap.get(r.restaurant_id) || null : null,
        driverRating: r.driver_rating,
        merchantRating: r.merchant_rating,
        tags: r.tags || [],
        comment: r.comment,
        contactBack: r.contact_back || false,
      }));
    },
  });
};

export const useRatingDistribution = () => {
  return useQuery({
    queryKey: ["rating-distribution"],
    queryFn: async (): Promise<RatingDistribution[]> => {
      const { data, error } = await supabase
        .from("order_ratings")
        .select("driver_rating, merchant_rating");

      if (error) throw error;

      const dist: RatingDistribution[] = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        driverCount: 0,
        merchantCount: 0,
      }));

      (data || []).forEach((r) => {
        if (r.driver_rating) {
          dist[r.driver_rating - 1].driverCount++;
        }
        if (r.merchant_rating) {
          dist[r.merchant_rating - 1].merchantCount++;
        }
      });

      return dist;
    },
  });
};

// Real-time subscription for new ratings
export const useQualityRealtime = (onNewRating: () => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("quality-ratings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_ratings",
        },
        () => {
          console.log("[Quality] New rating received");
          onNewRating();
          queryClient.invalidateQueries({ queryKey: ["quality-kpis"] });
          queryClient.invalidateQueries({ queryKey: ["worst-performers"] });
          queryClient.invalidateQueries({ queryKey: ["low-ratings"] });
          queryClient.invalidateQueries({ queryKey: ["rating-distribution"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onNewRating]);
};
