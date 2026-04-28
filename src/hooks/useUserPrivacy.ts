/**
 * useUserPrivacy — read/write privacy preferences (last seen, calls, messages, read receipts).
 * Backed by public.user_privacy.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PrivacyScope = "everyone" | "contacts" | "nobody";

export type UserPrivacy = {
  last_seen_scope: PrivacyScope;
  call_scope: PrivacyScope;
  message_scope: PrivacyScope;
  read_receipts: boolean;
};

const defaults: UserPrivacy = {
  last_seen_scope: "everyone",
  call_scope: "everyone",
  message_scope: "everyone",
  read_receipts: true,
};

export function useUserPrivacy(targetUserId?: string) {
  const { user } = useAuth();
  const uid = targetUserId ?? user?.id ?? null;
  const [privacy, setPrivacy] = useState<UserPrivacy>(defaults);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!uid) {
      setPrivacy(defaults);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_privacy")
      .select("last_seen_scope, call_scope, message_scope, read_receipts")
      .eq("user_id", uid)
      .maybeSingle();
    setPrivacy(data ? (data as UserPrivacy) : defaults);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (patch: Partial<UserPrivacy>) => {
      if (!user) return { ok: false as const, error: "Not signed in" };
      const next = { ...privacy, ...patch };
      setPrivacy(next);
      const { error } = await supabase
        .from("user_privacy")
        .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    },
    [user, privacy],
  );

  return { privacy, loading, refresh, save };
}
