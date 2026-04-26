import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChannelPost } from "@/hooks/useChannel";

const REACTIONS = ["👍", "❤️", "🔥", "🎉", "👏"];

interface Props {
  post: ChannelPost;
}

interface MediaItem {
  url: string;
  type?: string;
}

export function ChannelPostCard({ post }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>(
    (post.reactions_count as Record<string, number>) ?? {}
  );
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const media: MediaItem[] = useMemo(
    () => (Array.isArray(post.media) ? (post.media as MediaItem[]).filter((m) => m?.url) : []),
    [post.media]
  );

  useEffect(() => {
    if (counted || !ref.current) return;
    const obs = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setCounted(true);
          try {
            await supabase.rpc("record_channel_post_view" as any, { _post_id: post.id });
          } catch {}
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [counted, post.id]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === "ArrowRight")
        setLightboxIdx((i) => (i === null ? null : Math.min(media.length - 1, i + 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, media.length]);

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

  // Pick a layout class based on count for a tight, IG-style grid.
  const gridClass = (() => {
    switch (media.length) {
      case 0:
        return "";
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2"; // first spans 2 cols
      default:
        return "grid-cols-3";
    }
  })();

  return (
    <>
      <div ref={ref} className="rounded-lg border border-border bg-card p-4">
        {post.body && <p className="whitespace-pre-wrap text-sm">{post.body}</p>}

        {media.length > 0 && (
          <div className={`mt-3 grid gap-1.5 ${gridClass}`}>
            {media.slice(0, 6).map((m, i) => {
              const isFirstOfThree = media.length === 3 && i === 0;
              const isOverflow = media.length > 6 && i === 5;
              return (
                <button
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className={`relative overflow-hidden rounded-md bg-muted ${
                    isFirstOfThree ? "col-span-2 aspect-[2/1]" : "aspect-square"
                  }`}
                  aria-label={`Open image ${i + 1}`}
                >
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                  />
                  {isOverflow && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-lg font-semibold text-foreground">
                      +{media.length - 6}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => react(e)}
                className="rounded-full bg-muted px-2 py-1 text-xs hover:bg-muted/70"
              >
                {e}
                {reactions[e] ? (
                  <span className="ml-1 text-muted-foreground">{reactions[e]}</span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {post.view_count}
            </span>
            {post.published_at && (
              <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            className="absolute right-4 top-4 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
              className="absolute left-4 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {lightboxIdx < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          <img
            src={media[lightboxIdx].url}
            alt=""
            className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {media.length > 1 && (
            <div className="absolute bottom-6 rounded-full bg-card/80 px-3 py-1 text-xs text-foreground">
              {lightboxIdx + 1} / {media.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
