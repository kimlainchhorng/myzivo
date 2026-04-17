/**
 * StoreLiveStreamSection — Live streaming hub for store owners.
 * Shows stream stats and a "Go Live" entry point that opens /go-live in a new tab.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Radio, Eye, Heart, Gift, Play, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Props {
  storeId: string;
  storeName?: string;
}

interface StreamRow {
  id: string;
  title: string | null;
  status: string | null;
  viewer_count: number | null;
  like_count: number | null;
  gift_count: number | null;
  started_at: string | null;
  ended_at: string | null;
  thumbnail_url: string | null;
}

export default function StoreLiveStreamSection({ storeId, storeName }: Props) {
  const { data: streams, isLoading } = useQuery({
    queryKey: ["store-live-streams", storeId],
    queryFn: async (): Promise<StreamRow[]> => {
      const { data, error } = await (supabase as any)
        .from("live_streams")
        .select("id, title, status, viewer_count, like_count, gift_count, started_at, ended_at, thumbnail_url")
        .eq("store_id", storeId)
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) {
        console.warn("[StoreLiveStreamSection] fetch error", error);
        return [];
      }
      return (data ?? []) as StreamRow[];
    },
  });

  const liveNow = streams?.filter((s) => s.status === "live") ?? [];
  const past = streams?.filter((s) => s.status !== "live") ?? [];

  const totalViews = streams?.reduce((sum, s) => sum + (s.viewer_count ?? 0), 0) ?? 0;
  const totalLikes = streams?.reduce((sum, s) => sum + (s.like_count ?? 0), 0) ?? 0;
  const totalGifts = streams?.reduce((sum, s) => sum + (s.gift_count ?? 0), 0) ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero / Go Live */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Live Streaming</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
                Broadcast live to your customers — showcase products, host Q&amp;A, or run flash sales.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.open("/go-live", "_blank")}
            className="gap-2 shrink-0 h-12 sm:h-10 w-full sm:w-auto rounded-xl text-sm font-semibold touch-manipulation active:scale-[0.98]"
          >
            <Video className="w-4 h-4" />
            Go Live Now
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard icon={Radio} label="Streams" value={streams?.length ?? 0} color="text-primary" />
        <StatCard icon={Eye} label="Total Views" value={totalViews} color="text-blue-500" />
        <StatCard icon={Heart} label="Total Likes" value={totalLikes} color="text-red-500" />
        <StatCard icon={Gift} label="Gifts Received" value={totalGifts} color="text-amber-500" />
      </div>

      {/* Live now */}
      {liveNow.length > 0 && (
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
            {liveNow.map((s) => (
              <StreamRowCard key={s.id} stream={s} live />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past streams */}
      <Card>
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-sm sm:text-base">Recent Streams</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : past.length === 0 ? (
            <div className="py-8 sm:py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No streams yet for {storeName || "this store"}.</p>
              <p className="text-xs text-muted-foreground">Tap "Go Live Now" to start your first broadcast.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {past.map((s) => (
                <StreamRowCard key={s.id} stream={s} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="pt-3.5 pb-3.5 px-3 sm:pt-5 sm:pb-5 sm:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{label}</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

function StreamRowCard({ stream, live }: { stream: StreamRow; live?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like");
      const { error } = await (supabase as any)
        .from("live_likes")
        .insert({ stream_id: stream.id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-live-streams"] });
      toast.success("Liked ❤️");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openWatcher = () => window.open(`/live/${stream.id}`, "_blank");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openWatcher}
      onKeyDown={(e) => { if (e.key === "Enter") openWatcher(); }}
      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/40 active:scale-[0.99] transition-all cursor-pointer touch-manipulation min-h-[64px]"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        {live && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive text-destructive-foreground">LIVE</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate flex-1">
            {stream.title || "Untitled stream"}
          </p>
          {live ? (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] shrink-0">Live</Badge>
          ) : (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] shrink-0">Ended</Badge>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1 tabular-nums"><Eye className="w-3 h-3" />{stream.viewer_count ?? 0}</span>
          <span className="flex items-center gap-1 tabular-nums"><Heart className="w-3 h-3" />{stream.like_count ?? 0}</span>
          <span className="flex items-center gap-1 tabular-nums"><Gift className="w-3 h-3" />{stream.gift_count ?? 0}</span>
          {stream.started_at && (
            <span className="truncate hidden xs:inline">{formatDistanceToNow(new Date(stream.started_at), { addSuffix: true })}</span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
        disabled={likeMutation.isPending}
        title="Like this stream"
        aria-label="Like stream"
        className="shrink-0 h-11 w-11 rounded-full active:scale-90 touch-manipulation"
      >
        <Heart className={cn("w-5 h-5", likeMutation.isPending ? "text-muted-foreground" : "text-red-500 fill-red-500/20")} />
      </Button>
    </div>
  );
}

