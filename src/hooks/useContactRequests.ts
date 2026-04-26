/**
 * useContactRequests — incoming/outgoing contact requests with realtime updates.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ContactRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export function useContactRequests() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<ContactRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setIncoming([]); setOutgoing([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("contact_requests")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const rows: ContactRequest[] = (data ?? []) as any;
    const ids = Array.from(new Set(rows.map((r) => (r.from_user_id === user.id ? r.to_user_id : r.from_user_id))));
    let profiles: Record<string, ContactRequest["profile"]> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .in("user_id", ids);
      profs?.forEach((p: any) => { profiles[p.user_id] = p; });
    }
    const decorate = (r: ContactRequest): ContactRequest => ({
      ...r,
      profile: profiles[r.from_user_id === user.id ? r.to_user_id : r.from_user_id] ?? null,
    });
    setIncoming(rows.filter((r) => r.to_user_id === user.id && r.status === "pending").map(decorate));
    setOutgoing(rows.filter((r) => r.from_user_id === user.id).map(decorate));
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`contact-requests-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_requests" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, refresh]);

  const send = useCallback(async (toUserId: string, message?: string) => {
    if (!user) return { ok: false, error: "Not signed in" };
    const { error } = await (supabase as any).from("contact_requests").insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      message: message ?? null,
      status: "pending",
    });
    if (error) return { ok: false, error: error.message };
    await refresh();
    return { ok: true };
  }, [user, refresh]);

  const accept = useCallback(async (id: string) => {
    if (!user) return;
    const req = incoming.find((r) => r.id === id);
    const { error } = await (supabase as any)
      .from("contact_requests")
      .update({ status: "accepted" })
      .eq("id", id);
    if (error) return;
    // create reciprocal contact entries
    if (req) {
      await supabase.from("user_contacts").upsert([
        { owner_id: user.id, contact_user_id: req.from_user_id, added_via: "request" },
        { owner_id: req.from_user_id, contact_user_id: user.id, added_via: "request" },
      ]);
    }
    await refresh();
  }, [user, incoming, refresh]);

  const decline = useCallback(async (id: string) => {
    await (supabase as any).from("contact_requests").update({ status: "declined" }).eq("id", id);
    await refresh();
  }, [refresh]);

  const cancel = useCallback(async (id: string) => {
    await (supabase as any).from("contact_requests").delete().eq("id", id);
    await refresh();
  }, [refresh]);

  return { incoming, outgoing, loading, refresh, send, accept, decline, cancel };
}
