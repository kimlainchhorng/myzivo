/**
 * useChatDraft — Syncs message drafts across devices via Supabase
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useChatDraft(userId: string | undefined, chatPartnerId: string) {
  const [draft, setDraft] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const loaded = useRef(false);

  // Load draft on mount
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("chat_drafts")
        .select("draft_text")
        .eq("user_id", userId)
        .eq("chat_partner_id", chatPartnerId)
        .maybeSingle();
      if (data?.draft_text) {
        setDraft(data.draft_text);
      }
      loaded.current = true;
    };
    load();
  }, [userId, chatPartnerId]);

  // Save draft with debounce
  const updateDraft = useCallback((text: string) => {
    setDraft(text);
    if (!userId || !loaded.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (text.trim()) {
        await (supabase as any)
          .from("chat_drafts")
          .upsert({
            user_id: userId,
            chat_partner_id: chatPartnerId,
            draft_text: text,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,chat_partner_id" });
      } else {
        await (supabase as any)
          .from("chat_drafts")
          .delete()
          .eq("user_id", userId)
          .eq("chat_partner_id", chatPartnerId);
      }
    }, 1000);
  }, [userId, chatPartnerId]);

  const clearDraft = useCallback(async () => {
    setDraft("");
    if (!userId) return;
    await (supabase as any)
      .from("chat_drafts")
      .delete()
      .eq("user_id", userId)
      .eq("chat_partner_id", chatPartnerId);
  }, [userId, chatPartnerId]);

  return { draft, updateDraft, clearDraft };
}
