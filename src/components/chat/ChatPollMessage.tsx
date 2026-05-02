/**
 * ChatPollMessage — Renders a poll inside the message stream.
 *
 * Bridges the gap between the `direct_messages` row (which only carries the
 * poll id in its `message` column when `message_type === "poll"`) and the
 * standalone ChatPollBubble vote UI (which expects the poll's full metadata
 * already loaded). Fetches once per poll id and caches via react-query so
 * scrolling doesn't refetch.
 */
import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

const ChatPollBubble = lazy(() => import("./ChatPollBubble"));

interface PollRow {
  id: string;
  creator_id: string;
  question: string;
  options: { text: string }[];
  is_anonymous: boolean | null;
}

interface CreatorRow {
  user_id: string;
  full_name: string | null;
}

interface Props {
  pollId: string;
  isMe: boolean;
}

export default function ChatPollMessage({ pollId, isMe }: Props) {
  const { data: poll, isLoading } = useQuery({
    queryKey: ["chat-poll", pollId],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("chat_polls")
        .select("id, creator_id, question, options, is_anonymous")
        .eq("id", pollId)
        .maybeSingle();
      if (!data) return null;
      return data as PollRow;
    },
  });

  // Resolve the creator's display name in a separate query so the poll body
  // can render immediately while the name fills in.
  const { data: creator } = useQuery({
    queryKey: ["chat-poll-creator", poll?.creator_id],
    enabled: !!poll?.creator_id,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", poll!.creator_id)
        .maybeSingle();
      return (data ?? null) as CreatorRow | null;
    },
  });

  if (isLoading) {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl bg-card border border-border/40 p-3 max-w-[280px] flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading poll…</span>
        </div>
      </div>
    );
  }

  if (!poll) {
    // Poll was deleted or never persisted — render a quiet placeholder
    // rather than the raw poll id (which is what the message column holds).
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl bg-muted/40 border border-border/30 p-3 max-w-[280px]">
          <span className="text-xs italic text-muted-foreground">📊 Poll unavailable</span>
        </div>
      </div>
    );
  }

  const options = Array.isArray(poll.options)
    ? (poll.options.filter((o: any) => o && typeof o.text === "string") as { text: string }[])
    : [];

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <Suspense fallback={null}>
        <ChatPollBubble
          pollId={poll.id}
          question={poll.question}
          options={options}
          isAnonymous={!!poll.is_anonymous}
          creatorName={creator?.full_name || (isMe ? "You" : "Creator")}
        />
      </Suspense>
    </div>
  );
}
