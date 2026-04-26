/**
 * PinnedMessageBanner — Top-of-chat banner showing the latest pinned message
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Pin from "lucide-react/dist/esm/icons/pin";
import X from "lucide-react/dist/esm/icons/x";

interface Props {
  conversationId: string;
  onJumpTo?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  canUnpin?: boolean;
}

export default function PinnedMessageBanner({ conversationId, onJumpTo, onUnpin, canUnpin }: Props) {
  const [pinned, setPinned] = useState<{ id: string; message: string | null } | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("pinned_messages")
        .select("message_id, direct_messages:message_id (id, message)")
        .eq("conversation_id", conversationId)
        .order("pinned_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (data?.direct_messages) {
        setPinned({ id: data.direct_messages.id, message: data.direct_messages.message });
      } else {
        setPinned(null);
      }
    };
    load();
    const channel = (supabase as any)
      .channel(`pinned-${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pinned_messages", filter: `conversation_id=eq.${conversationId}` }, load)
      .subscribe();
    return () => {
      mounted = false;
      (supabase as any).removeChannel(channel);
    };
  }, [conversationId]);

  if (!pinned) return null;

  return (
    <button
      onClick={() => pinned && onJumpTo?.(pinned.id)}
      className="w-full flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/20 text-left"
    >
      <Pin className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-primary">Pinned</div>
        <div className="text-sm truncate">{pinned.message || "Attachment"}</div>
      </div>
      {canUnpin && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnpin?.(pinned.id); }}
          className="p-1 rounded hover:bg-muted"
          aria-label="Unpin"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </button>
  );
}
