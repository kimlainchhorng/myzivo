import { useParams } from "react-router-dom";
import { useChannel } from "@/hooks/useChannel";
import { ChannelHeader } from "@/components/channels/ChannelHeader";
import { ChannelPostCard } from "@/components/channels/ChannelPostCard";
import { ChannelPostComposer } from "@/components/channels/ChannelPostComposer";

export default function ChannelPage() {
  const { handle } = useParams<{ handle: string }>();
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
      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        isOwner={isOwner}
        onSubscribe={subscribe}
        onUnsubscribe={unsubscribe}
      />
      <div className="space-y-3 p-4">
        {canPost && <ChannelPostComposer channelId={channel.id} onPosted={refresh} />}
        {posts.map((p) => (
          <ChannelPostCard key={p.id} post={p} />
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
