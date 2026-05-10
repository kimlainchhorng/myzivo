import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Users, BadgeCheck, Globe2, Lock, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { SubscribeButton } from "./SubscribeButton";
import type { Channel } from "@/hooks/useChannel";

interface Props {
  channel: Channel;
  isSubscribed: boolean;
  isOwner: boolean;
  notificationsOn?: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onSetNotifications?: (next: boolean) => void | Promise<void>;
}

export function ChannelHeader({ channel, isSubscribed, isOwner, notificationsOn = true, onSubscribe, onUnsubscribe, onSetNotifications }: Props) {
  const memberLabel = `${channel.subscriber_count.toLocaleString()} subscriber${channel.subscriber_count === 1 ? "" : "s"}`;
  const showInlineSubscribe = isSubscribed || isOwner;

  return (
    <div className="border-b border-border/50 bg-card/70">
      <div
        className="h-24 sm:h-28 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted bg-cover bg-center"
        style={channel.banner_url ? { backgroundImage: `url(${channel.banner_url})` } : undefined}
        aria-hidden
      />
      <div className="px-4 pb-3 sm:pb-4">
        <div className="-mt-10 sm:-mt-12">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-md">
            <AvatarImage src={channel.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold">
              {channel.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mt-2.5 sm:mt-3">
          <h1 className="text-[20px] sm:text-[22px] leading-tight font-bold inline-flex items-center gap-1.5">
            {channel.name}
            {(channel as any).is_verified && (
              <BadgeCheck
                className="h-5 w-5 text-sky-500 fill-sky-500/15"
                aria-label="Verified channel"
              />
            )}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Megaphone className="h-3.5 w-3.5" /> @{channel.handle}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              {channel.is_public ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {channel.is_public ? "Public" : "Private"}
            </span>
          </div>

          {channel.description && (
            <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/90">{channel.description}</p>
          )}

          <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {memberLabel}
          </div>

          <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
            {showInlineSubscribe && (
              <SubscribeButton
                className="h-9 px-4"
                isSubscribed={isSubscribed}
                notificationsOn={notificationsOn}
                onSubscribe={onSubscribe}
                onUnsubscribe={onUnsubscribe}
                onSetNotifications={onSetNotifications}
              />
            )}
            {isOwner && (
              <Button asChild variant="outline" size="sm" className="h-9 px-3 gap-1">
                <Link to={`/c/${channel.handle}/manage`}>
                  <Settings className="h-4 w-4" /> Manage
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
