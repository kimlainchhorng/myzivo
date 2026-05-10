import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Hash, ImageIcon, Inbox, Link as LinkIcon, Users } from "lucide-react";
import { useChannel } from "@/hooks/useChannel";
import { ChannelHeader } from "@/components/channels/ChannelHeader";
import { ChannelPostCard } from "@/components/channels/ChannelPostCard";
import { ChannelPostComposer } from "@/components/channels/ChannelPostComposer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getChannelShareUrl } from "@/lib/getPublicOrigin";
import { shareContent } from "@/lib/native/share";
import { copyText } from "@/lib/native/clipboard";
import { toast } from "sonner";

type ViewTab = "posts" | "media" | "links";

export default function ChannelPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ViewTab>("posts");
  const [controlOpen, setControlOpen] = useState(false);
  const { channel, posts, isSubscribed, notificationsOn, role, loading, userId, subscribe, unsubscribe, setNotifications, refresh } =
    useChannel(handle);

  const sortedPosts = [...posts].sort((a, b) => Number(!!b.is_pinned) - Number(!!a.is_pinned));

  const pinnedPost = sortedPosts.find((p) => p.is_pinned);

  const filteredPosts =
    activeTab === "posts"
      ? sortedPosts
      : activeTab === "media"
        ? sortedPosts.filter((p) =>
            Array.isArray(p.media) &&
            p.media.some((m: any) => {
              if (!m?.url) return false;
              const type = String(m?.type || "").toLowerCase();
              return type.startsWith("image") || type.startsWith("video");
            }),
          )
        : sortedPosts.filter((p) => /https?:\/\//i.test(p.body || ""));

  useEffect(() => {
    if (!channel?.id) return;
    try {
      setControlOpen(localStorage.getItem(`zivo:channel:control-open:${channel.id}`) === "1");
    } catch {
      setControlOpen(false);
    }
  }, [channel?.id]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!channel) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Channel not found.</div>;
  }

  const isOwner = userId === channel.owner_id;
  const canPost = isOwner || role === "admin" || role === "owner";
  const canViewComments = isSubscribed || canPost;
  const showInlineJoin = !isSubscribed && !canPost && filteredPosts.length === 0;

  const shareChannel = async () => {
    const url = getChannelShareUrl(channel.handle);
    try {
      const result = await shareContent({
        title: `${channel.name} on ZIVO`,
        text: `Join @${channel.handle} on ZIVO`,
        url,
        dialogTitle: "Share channel",
      });
      if (result.shared || result.cancelled) return;
    } catch {
      // fall through to clipboard fallback
    }

    try {
      await copyText(url);
      toast.success("Channel link copied");
    } catch {
      toast.error("Could not copy channel link");
    }
  };

  return (
    <div className="zivo-shell-mobile mx-auto max-w-2xl pt-safe pb-20">
      <div className="zivo-sticky-mobile-header z-20 px-3 py-2">
        <div className="flex items-center gap-2">
        <button type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/channels"))}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{channel.name}</p>
            <p className="text-[11px] text-muted-foreground truncate inline-flex items-center gap-1">
              <Users className="w-3 h-3" /> {channel.subscriber_count.toLocaleString()} subscriber{channel.subscriber_count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 rounded-xl bg-muted/60 p-1">
          {([
            { id: "posts", label: "Posts", icon: Hash },
            { id: "media", label: "Media", icon: ImageIcon },
            { id: "links", label: "Links", icon: LinkIcon },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-8 rounded-lg text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/75 hover:text-foreground",
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", !active && "opacity-90")} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <ChannelHeader
        channel={channel}
        isSubscribed={isSubscribed}
        isOwner={isOwner}
        notificationsOn={notificationsOn}
        onSubscribe={subscribe}
        onUnsubscribe={unsubscribe}
        onSetNotifications={setNotifications}
      />

      {pinnedPost && (
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className="w-full text-left border-b border-border/40 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Pinned message</p>
          <p className="text-[12px] text-foreground/90 truncate mt-0.5">{pinnedPost.body || "Pinned post"}</p>
        </button>
      )}

      <div className="space-y-3 p-4">
        {canPost && activeTab === "posts" && <ChannelPostComposer channelId={channel.id} onPosted={refresh} />}
        {filteredPosts.map((p) => (
            <ChannelPostCard
              key={p.id}
              post={p}
              canManage={canPost}
              canComment={canViewComments}
              protectContent={!canPost && !controlOpen}
              onPinChanged={refresh}
            />
          ))}
        {filteredPosts.length === 0 && (() => {
          const EmptyIcon = activeTab === "media" ? ImageIcon : activeTab === "links" ? LinkIcon : Inbox;
          const emptyTitle =
            activeTab === "posts" ? "No posts yet" : activeTab === "media" ? "No media shared yet" : "No links shared yet";
          const emptySubtitle =
            activeTab === "posts"
              ? canPost
                ? "Share something with your subscribers to get started."
                : "New posts from this channel will show up here."
              : activeTab === "media"
                ? "Photos and videos posted to this channel will appear here."
                : "Links shared in posts will appear here.";
          return (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <EmptyIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{emptySubtitle}</p>
              {activeTab === "posts" && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => void shareChannel()}>
                    Share Channel
                  </Button>
                  {!isSubscribed && !canPost && !showInlineJoin && (
                    <Button type="button" size="sm" onClick={subscribe}>
                      Join Channel
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {showInlineJoin && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-background/95 backdrop-blur p-3 flex items-center justify-between gap-3 shadow-sm">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold truncate">Join @{channel.handle}</p>
              <p className="text-[11px] text-muted-foreground truncate">Get new posts and channel updates.</p>
            </div>
            <Button onClick={subscribe} className="shrink-0">Join</Button>
          </div>
        )}
      </div>

      {!isSubscribed && !canPost && !showInlineJoin && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-3">
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-background/95 backdrop-blur p-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold truncate">Join @{channel.handle}</p>
              <p className="text-[11px] text-muted-foreground truncate">Get new posts and channel updates.</p>
            </div>
            <Button onClick={subscribe} className="shrink-0">Join</Button>
          </div>
        </div>
      )}
    </div>
  );
}
