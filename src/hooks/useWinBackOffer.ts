/**
 * Win-Back Offer Hook
 * Detects customer inactivity and returns the appropriate win-back tier and promo code.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WinBackTier = "gentle" | "small" | "strong" | null;

interface WinBackOffer {
  tier: WinBackTier;
  promoCode: string | null;
  discountLabel: string | null;
  daysSinceLastOrder: number | null;
  isLoading: boolean;
}

export function useWinBackOffer(): WinBackOffer {
  const { user } = useAuth();
  const [tier, setTier] = useState<WinBackTier>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountLabel, setDiscountLabel] = useState<string | null>(null);
  const [daysSinceLastOrder, setDaysSinceLastOrder] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const detect = async () => {
      try {
        // 1. Get most recent delivered order
        const { data: lastOrder } = await supabase
          .from("food_orders")
          .select("created_at")
          .eq("customer_id", user.id)
          .eq("status", "delivered")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const daysSince = lastOrder
          ? Math.floor((Date.now() - new Date(lastOrder.created_at).getTime()) / 86400000)
          : 999; // No orders = treat as 30+

        setDaysSinceLastOrder(daysSince);

        // Determine tier
        let detectedTier: WinBackTier = null;
        if (daysSince >= 30) detectedTier = "strong";
        else if (daysSince >= 14) detectedTier = "small";
        else if (daysSince >= 7) detectedTier = "gentle";

        if (!detectedTier) {
          setIsLoading(false);
          return;
        }

        // 2. Check deduplication (7-day cooldown per tier)
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: recentLog } = await supabase
          .from("automated_message_log")
          .select("id")
          .eq("user_id", user.id)
          .eq("trigger_type", "winback")
          .eq("trigger_ref", detectedTier)
          .gte("sent_at", sevenDaysAgo)
          .limit(1)
          .maybeSingle();

        if (recentLog) {
          // Already shown recently, still set tier for checkout auto-apply but skip banner log
          setTier(detectedTier);
        } else {
          setTier(detectedTier);
          // Log the display
          await supabase.from("automated_message_log").insert({
            user_id: user.id,
            trigger_type: "winback",
            trigger_ref: detectedTier,
            channel: "in_app",
            message_preview: `Win-back banner shown: ${detectedTier}`,
          });
        }

        // 3. Fetch matching promo (for small/strong tiers)
        if (detectedTier === "small" || detectedTier === "strong") {
          const { data: promos } = await supabase
            .from("promotions")
            .select("code, discount_value, discount_type, name")
            .eq("is_active", true)
            .or("name.ilike.%winback%,name.ilike.%win-back%")
            .order("discount_value", { ascending: false });

          if (promos && promos.length > 0) {
            const match = detectedTier === "strong"
              ? promos.find((p) => p.discount_value > 15) || promos[0]
              : promos.find((p) => p.discount_value <= 15) || promos[promos.length - 1];

            setPromoCode(match.code);
            setDiscountLabel(
              match.discount_type === "percentage"
                ? `${match.discount_value}% off`
                : `$${match.discount_value} off`
            );
          }
        }
      } catch (err) {
        console.error("Win-back detection failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    detect();
  }, [user]);

  return { tier, promoCode, discountLabel, daysSinceLastOrder, isLoading };
}
