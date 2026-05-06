import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Users, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscribeButton } from "./SubscribeButton";
import type { Channel } from "@/hooks/useChannel";

interface Props {
  channel: Channel;
  isSubscribed: boolean;
  isOwner: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

export function ChannelHeader({ channel, isSubscribed, isOwner, onSubscribe, onUnsubscribe }: Props) {
  return (
    <div className="border-b border-border bg-card">
      <div
        className="h-40 w-full bg-gradient-to-br from-primary/30 to-accent/30"
        style={
          channel.banner_url
            ? { backgroundImage: `url(${channel.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />
      <div className="px-4 pb-4">
        <div className="-mt-10 flex items-end justify-between">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={channel.avatar_url ?? undefined} />
            <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {isOwner && (
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link to={`/c/${channel.handle}/manage`}>
                  <Settings className="h-4 w-4" /> Manage
                </Link>
              </Button>
            )}
            <SubscribeButton
              isSubscribed={isSubscribed}
              onSubscribe={onSubscribe}
              onUnsubscribe={onUnsubscribe}
            />
          </div>
        </div>
        <div className="mt-3">
          <h1 className="text-xl font-bold inline-flex items-center gap-1.5">
            {channel.name}
            {(channel as any).is_verified && (
              <BadgeCheck
                className="h-5 w-5 text-sky-500 fill-sky-500/15"
                aria-label="Verified channel"
              />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">@{channel.handle}</p>
          {channel.description && (
            <p className="mt-2 text-sm">{channel.description}</p>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {channel.subscriber_count} subscriber{channel.subscriber_count === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}
