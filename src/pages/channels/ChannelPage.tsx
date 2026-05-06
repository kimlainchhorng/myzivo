import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useChannel } from "@/hooks/useChannel";
import { ChannelHeader } from "@/components/channels/ChannelHeader";
import { ChannelPostCard } from "@/components/channels/ChannelPostCard";
import { ChannelPostComposer } from "@/components/channels/ChannelPostComposer";

export default function ChannelPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { channel, posts, isSubscribed, role, loading, userId, subscribe, unsubscribe, refresh } =
    useChannel(handle);

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!channel) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Channel not found.</div>;
  }

  const isOwner = userId === channel.owner_id;
  const canPost = isOwner || role === "admin" || role === "owner";

  return (
    <div className="mx-auto max-w-2xl pt-safe">
      <div className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border/40 px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/channels"))}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium truncate">@{channel.handle}</span>
      </div>
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        isOwner={isOwner}
        onSubscribe={subscribe}
        onUnsubscribe={unsubscribe}
      />
      <div className="space-y-3 p-4">
        {canPost && <ChannelPostComposer channelId={channel.id} onPosted={refresh} />}
        {[...posts]
          .sort((a, b) => Number(!!b.is_pinned) - Number(!!a.is_pinned))
          .map((p) => (
            <ChannelPostCard
              key={p.id}
              post={p}
              canManage={canPost}
              canComment={isSubscribed || canPost}
              onPinChanged={refresh}
            />
          ))}
        {posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
}
