// useAdminPromos
// Admin-only CRUD on zivo_service_promo_codes. RLS already restricts
// writes to admins via public.is_admin(auth.uid()).

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ZivoServicePromo {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "flat" | "free_delivery";
  discount_percent: number | null;
  discount_flat_cents: number | null;
  max_discount_cents: number | null;
  min_subtotal_cents: number;
  applies_to: "all" | "ride" | "delivery";
  first_order_only: boolean;
  max_total_redemptions: number | null;
  max_per_customer: number;
  current_redemptions: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PromoDraft = Omit<ZivoServicePromo, "id" | "current_redemptions" | "created_at" | "updated_at">;

export function useAdminPromos() {
  const [promos, setPromos] = useState<ZivoServicePromo[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: e } = await supabase.from("zivo_service_promo_codes")
      .select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (e) { setError(e.message); return; }
    if (data) setPromos(data as unknown as ZivoServicePromo[]);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const create = useCallback(async (draft: PromoDraft) => {
    setError(null);
    const { error: e } = await supabase.from("zivo_service_promo_codes").insert({
      ...draft, code: draft.code.toUpperCase().trim(),
    });
    if (e) { setError(e.message); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const update = useCallback(async (id: string, patch: Partial<PromoDraft>) => {
    setError(null);
    const { error: e } = await supabase.from("zivo_service_promo_codes").update(patch).eq("id", id);
    if (e) { setError(e.message); return false; }
    await refresh();
    return true;
  }, [refresh]);

  const toggleActive = useCallback(async (id: string, is_active: boolean) => {
    return update(id, { is_active });
  }, [update]);

  return { promos, isLoading, error, create, update, toggleActive, refresh };
}
