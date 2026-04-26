/**
 * MyChannelsStrip — horizontal scrollable strip of channels the user is
 * subscribed to, with a final "Discover" tile. Shown inside the Chat Hub.
 */
import { useNavigate } from "react-router-dom";
import Megaphone from "lucide-react/dist/esm/icons/megaphone";
import Compass from "lucide-react/dist/esm/icons/compass";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyChannels } from "@/hooks/useMyChannels";
import { formatDistanceToNow } from "date-fns";

export default function MyChannelsStrip() {
  const nav = useNavigate();
  const { channels, loading } = useMyChannels();

  return (
    <div className="px-1 pt-1">
      <div className="flex items-center justify-between px-2 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Channels</span>
        </div>
        <button
          onClick={() => nav("/channels")}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          Discover
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {loading && (
          <div className="text-[12px] text-muted-foreground px-3 py-2">Loading…</div>
        )}
        {!loading && channels.length === 0 && (
          <button
            onClick={() => nav("/channels")}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/50 border border-border/30 text-[12px] text-muted-foreground whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" />
            Find channels to follow
          </button>
        )}
        {channels.slice(0, 12).map((c) => (
          <button
            key={c.id}
            onClick={() => nav(`/channel/${c.handle}`)}
            className="flex flex-col items-center gap-1 w-[72px] shrink-0 group"
          >
            <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-active:scale-95 transition-transform">
              <AvatarImage src={c.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {c.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10.5px] font-medium text-foreground truncate w-full text-center leading-tight">
              {c.name}
            </span>
            {c.last_post_at && (
              <span className="text-[9px] text-muted-foreground leading-none">
                {formatDistanceToNow(new Date(c.last_post_at), { addSuffix: false })}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => nav("/channels/new")}
          className="flex flex-col items-center gap-1 w-[72px] shrink-0 group"
        >
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center border border-dashed border-border group-active:scale-95 transition-transform">
            <Compass className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-[10.5px] font-medium text-muted-foreground leading-tight">More</span>
        </button>
      </div>
    </div>
  );
}
