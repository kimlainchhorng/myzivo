/**
 * useSuggestedContacts — "People you may know"
 * Sources: people who follow me but I don't follow back, recent DM partners not in contacts.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Suggested = {
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  reason: "follower" | "chat";
};

export function useSuggestedContacts() {
  const { user } = useAuth();
  const [items, setItems] = useState<Suggested[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);

    // Existing contacts (to exclude)
    const { data: existing } = await supabase
      .from("user_contacts")
      .select("contact_user_id")
      .eq("owner_id", user.id);
    const skip = new Set<string>((existing ?? []).map((r: any) => r.contact_user_id));
    skip.add(user.id);

    // Followers
    const { data: followers } = await (supabase as any)
      .from("follows")
      .select("follower_id")
      .eq("following_id", user.id)
      .limit(50);

    // Recent DM partners
    const { data: dms } = await (supabase as any)
      .from("direct_messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(60);

    const candidates = new Map<string, Suggested["reason"]>();
    (followers ?? []).forEach((r: any) => {
      if (r.follower_id && !skip.has(r.follower_id)) candidates.set(r.follower_id, "follower");
    });
    (dms ?? []).forEach((m: any) => {
      const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (other && !skip.has(other) && !candidates.has(other)) candidates.set(other, "chat");
    });

    const ids = Array.from(candidates.keys()).slice(0, 12);
    if (ids.length === 0) { setItems([]); setLoading(false); return; }

    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, username")
      .in("user_id", ids);

    const byId = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
    const result: Suggested[] = ids
      .map((id) => {
        const p: any = byId.get(id);
        if (!p) return null;
        return {
          user_id: id,
          full_name: p.full_name ?? null,
          username: p.username ?? null,
          avatar_url: p.avatar_url ?? null,
          reason: candidates.get(id)!,
        };
      })
      .filter(Boolean) as Suggested[];

    setItems(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, refresh };
}
