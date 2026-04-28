/**
 * useChatDraft — debounced cloud-synced composer draft for a single thread.
 * Backed by public.chat_drafts (existing schema: chat_partner_id, draft_text).
 *
 * We reuse `chat_partner_id` to store any thread id (`dm:<uid>`, `group:<gid>`, `channel:<cid>`).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useChatDraft(threadId: string | null) {
  const { user } = useAuth();
  const [body, setBody] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setBody("");
    if (!user || !threadId) {
      setLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("chat_drafts")
        .select("draft_text")
        .eq("user_id", user.id)
        .eq("chat_partner_id", threadId)
        .maybeSingle();
      if (cancelled) return;
      setBody((data?.draft_text as string) ?? "");
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, threadId]);

  const flush = useCallback(
    async (value: string) => {
      if (!user || !threadId) return;
      if (value.trim().length === 0) {
        await supabase.from("chat_drafts").delete().eq("user_id", user.id).eq("chat_partner_id", threadId);
        return;
      }
      await supabase.from("chat_drafts").upsert(
        { user_id: user.id, chat_partner_id: threadId, draft_text: value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,chat_partner_id" },
      );
    },
    [user, threadId],
  );

  // Debounced auto-save
  const update = useCallback(
    (value: string) => {
      setBody(value);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flush(value), 500);
    },
    [flush],
  );

  const clear = useCallback(async () => {
    setBody("");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await flush("");
  }, [flush]);

  return { body, setBody: update, clear, loaded };
}
