import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChannelPost } from "@/hooks/useChannel";

const REACTIONS = ["👍", "❤️", "🔥", "🎉", "👏"];

interface Props {
  post: ChannelPost;
}

export function ChannelPostCard({ post }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>(
    (post.reactions_count as Record<string, number>) ?? {}
  );

  useEffect(() => {
    if (counted || !ref.current) return;
    const obs = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        setCounted(true);
        try {
          await supabase.rpc("record_channel_post_view" as any, { _post_id: post.id });
        } catch {}
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [counted, post.id]);

  const react = async (emoji: string) => {
    setReactions((r) => ({ ...r, [emoji]: (r[emoji] ?? 0) + 1 }));
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("channel_post_reactions").upsert({
      post_id: post.id,
      user_id: u.user.id,
      emoji,
    });
  };

  const media = Array.isArray(post.media) ? post.media : [];

  return (
    <div ref={ref} className="rounded-lg border border-border bg-card p-4">
      {post.body && <p className="whitespace-pre-wrap text-sm">{post.body}</p>}
      {media.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {media.map((m: any, i: number) => (
            <img key={i} src={m.url} alt="" className="rounded-md object-cover" />
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => react(e)}
              className="rounded-full bg-muted px-2 py-1 text-xs hover:bg-muted/70"
            >
              {e} {reactions[e] ? <span className="ml-1 text-muted-foreground">{reactions[e]}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.view_count}</span>
          {post.published_at && (
            <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
          )}
        </div>
      </div>
    </div>
  );
}
