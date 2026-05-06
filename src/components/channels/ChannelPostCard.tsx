import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, X, ChevronLeft, ChevronRight, Pin, PinOff, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { ChannelPost } from "@/hooks/useChannel";

const ChannelPostComments = lazy(() => import("./ChannelPostComments"));
const ChannelPostInsights = lazy(() => import("./ChannelPostInsights"));

const REACTIONS = ["👍", "❤️", "🔥", "🎉", "👏"];

interface Props {
  post: ChannelPost;
  /** True if the viewer can pin/delete posts on this channel. */
  canManage?: boolean;
  /** True if the viewer can comment (subscribed or manager). */
  canComment?: boolean;
  /** Called after pin toggles so the parent can re-order the list. */
  onPinChanged?: () => void;
}

interface MediaItem {
  url: string;
  type?: string;
}

export function ChannelPostCard({ post, canManage = false, canComment = true, onPinChanged }: Props) {
  const navigate = useNavigate();
  const [pinning, setPinning] = useState(false);

  // Build a deep link to this post so it can be forwarded into a DM. The
  // /c/:handle route doesn't yet support a #post anchor, so we send a plain
  // channel link + the body excerpt as the message preview.
  async function forwardToDm() {
    const handle = (post as any).channel_handle as string | undefined;
    const path = handle ? `/c/${handle}` : `/c/?post=${post.id}`;
    const url = `${window.location.origin}${path}`;
    const excerpt = (post.body ?? "").slice(0, 240);
    const prefill = excerpt ? `${excerpt}\n\n${url}` : url;
    try {
      await navigator.clipboard?.writeText(prefill);
    } catch {
      /* clipboard may be blocked in iframes */
    }
    try {
      sessionStorage.setItem("pendingForwardPrefill", prefill);
    } catch {
      /* private mode */
    }
    toast.success("Pick a chat — the post will be pre-filled.");
    navigate("/chat");
  }

  async function togglePin() {
    setPinning(true);
    try {
      const { error } = await (supabase as any).rpc("toggle_channel_post_pin", { p_post_id: post.id });
      if (error) throw error;
      onPinChanged?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not pin");
    } finally {
      setPinning(false);
    }
  }

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
      <div ref={ref} className={`rounded-lg border bg-card p-4 ${post.is_pinned ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
        {(post.is_pinned || canManage) && (
          <div className="mb-2 flex items-center justify-between gap-2">
            {post.is_pinned ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            ) : <span />}
            {canManage && (
              <button
                type="button"
                onClick={togglePin}
                disabled={pinning}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                aria-label={post.is_pinned ? "Unpin post" : "Pin post"}
              >
                {post.is_pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                {post.is_pinned ? "Unpin" : "Pin"}
              </button>
            )}
          </div>
        )}
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
            <button
              type="button"
              onClick={forwardToDm}
              className="inline-flex items-center gap-1 hover:text-foreground active:scale-95 transition"
              aria-label="Forward to chat"
              title="Forward to chat"
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {post.view_count}
            </span>
            {post.published_at && (
              <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
            )}
          </div>
        </div>

        {canManage && (
          <Suspense fallback={null}>
            <ChannelPostInsights post={post} />
          </Suspense>
        )}

        {(post.comments_enabled !== false) && (
          <Suspense fallback={null}>
            <ChannelPostComments
              postId={post.id}
              channelId={post.channel_id}
              initialCount={post.comments_count ?? 0}
              canComment={canComment}
              canModerate={canManage}
            />
          </Suspense>
        )}
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
