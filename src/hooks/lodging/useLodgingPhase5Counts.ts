import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLodgingCatalog } from "./useLodgingCatalog";
import { useLodgeHousekeeping } from "./useLodgeHousekeeping";

export interface LodgingPhase5Counts {
  mealPlansCount: number;
  staffCount: number;
  channelConnectionsCount: number;
  promotionsCount: number;
  housekeepingCount: number;
  reviewsAwaitingReply: number;
  isLoading: boolean;
}

export function useLodgingPhase5Counts(storeId: string): LodgingPhase5Counts {
  const enabled = Boolean(storeId);
  const mealPlans = useLodgingCatalog<{ id: string; active?: boolean }>("lodging_meal_plans", storeId);
  const promotions = useLodgingCatalog<{ id: string; active?: boolean }>("lodging_promotions", storeId);
  const channels = useLodgingCatalog<{ id: string; active?: boolean }>("lodging_channel_connections", storeId);
  const reviews = useLodgingCatalog<{ id: string; reply?: string | null }>("lodging_reviews", storeId);
  const housekeeping = useLodgeHousekeeping(storeId);

  const staff = useQuery({
    queryKey: ["lodging_staff_count", storeId],
    enabled,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("store_employees")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const activeRows = (rows: { active?: boolean }[] | undefined) =>
    (rows || []).filter((r) => r.active !== false).length;

  const reviewsAwaitingReply = (reviews.list.data || []).filter(
    (r: any) => !r.reply,
  ).length;

  const housekeepingCount = (housekeeping.data || []).length;

  return {
    mealPlansCount: activeRows(mealPlans.list.data),
    staffCount: staff.data ?? 0,
    channelConnectionsCount: activeRows(channels.list.data),
    promotionsCount: activeRows(promotions.list.data),
    housekeepingCount,
    reviewsAwaitingReply,
    isLoading:
      mealPlans.list.isLoading ||
      promotions.list.isLoading ||
      channels.list.isLoading ||
      reviews.list.isLoading ||
      staff.isLoading,
  };
}
