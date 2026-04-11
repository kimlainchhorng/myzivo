/**
 * LiveStreamPage — Browse and watch live streams
 * Accessible from Reels header, Feed top, and Create Post "Live" button
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Radio, Users, Eye, Heart, MessageCircle, Send, Search, Plus, Wifi, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

interface LiveStream {
  id: string;
  host_id: string;
  host_name: string;
  host_avatar: string | null;
  title: string;
  topic: string;
  viewer_count: number;
  status: "live" | "scheduled" | "ended";
  started_at: string;
  thumbnail_emoji: string;
}

export default function LiveStreamPage() {
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; avatar?: string }[]>([]);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real AMA sessions as live streams
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      const { data: amaSessions } = await (supabase as any)
        .from("ama_sessions")
        .select("id, host_id, title, topic, viewer_count, question_count, status, starts_at, ends_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!amaSessions?.length) return [] as LiveStream[];

      const hostIds = [...new Set((amaSessions as any[]).map((s: any) => s.host_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", hostIds as string[]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const topicEmojis: Record<string, string> = {
        "music": "🎵", "gaming": "🎮", "cooking": "🍳", "tech": "💻",
        "fitness": "💪", "art": "🎨", "travel": "✈️", "fashion": "👗",
        "education": "📚", "business": "💼", "comedy": "😂", "sports": "⚽",
      };

      return (amaSessions as any[]).map((s: any) => {
        const profile = profileMap.get(s.host_id);
        const topicKey = (s.topic || "").toLowerCase();
        return {
          id: s.id,
          host_id: s.host_id,
          host_name: profile?.full_name || "Creator",
          host_avatar: profile?.avatar_url || null,
          title: s.title || "Live Stream",
          topic: s.topic || "General",
          viewer_count: s.viewer_count || 0,
          status: s.status === "active" ? "live" : s.status === "scheduled" ? "scheduled" : "ended",
          started_at: s.starts_at || s.created_at,
          thumbnail_emoji: topicEmojis[topicKey] || "📺",
        } as LiveStream;
      });
    },
    staleTime: 15_000,
  });

  const filteredStreams = streams.filter((s) => {
    if (filter === "live" && s.status !== "live") return false;
    if (filter === "scheduled" && s.status !== "scheduled") return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.host_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const liveCount = streams.filter((s) => s.status === "live").length;

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: "You", text: chatInput },
    ]);
    setChatInput("");
  };

  const handleGoLive = () => {
    navigate("/go-live");
  };

  // ── Active stream viewer ──
  if (activeStream) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        {/* Video area */}
        <div className="relative aspect-[9/16] max-h-[60vh] bg-gradient-to-br from-violet-900/80 via-black to-rose-900/60 flex items-center justify-center overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-rose-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="text-7xl">{activeStream.thumbnail_emoji}</div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white border-0 gap-1 animate-pulse">
                <Radio className="h-3 w-3" /> LIVE
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-0">
                <Eye className="h-3 w-3" /> {activeStream.viewer_count.toLocaleString()}
              </Badge>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => setActiveStream(null)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-20"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Stream info */}
        <div className="px-4 py-3 border-b border-white/10 bg-zinc-900">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-red-500">
              <AvatarImage src={activeStream.host_avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {activeStream.host_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-sm truncate">{activeStream.title}</h2>
              <p className="text-white/50 text-xs">{activeStream.host_name} · {activeStream.topic}</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setActiveStream(null)}
              className="rounded-full text-xs"
            >
              Leave
            </Button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-950 max-h-[300px]">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2 py-8">
              <MessageCircle className="h-8 w-8" />
              <p className="text-sm">Chat is live — say something!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                    {msg.user[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-bold text-white/70">{msg.user}</span>
                  <p className="text-sm text-white">{msg.text}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Chat input */}
        <div className="p-3 border-t border-white/10 bg-zinc-900 flex gap-2 pb-safe">
          <Input
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
          />
          <Button size="icon" onClick={sendChat} className="shrink-0 rounded-full bg-primary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Stream browser ──
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30"
        style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.5rem)" }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5">
          <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <Radio className="h-5 w-5 text-red-500" />
          <h1 className="text-lg font-bold text-foreground flex-1">Live</h1>
          {liveCount > 0 && (
            <Badge className="bg-red-500 text-white border-0 text-xs gap-1 animate-pulse">
              <Wifi className="h-3 w-3" /> {liveCount} Live
            </Badge>
          )}
          <Button size="sm" onClick={handleGoLive} className="rounded-full gap-1.5 bg-red-500 hover:bg-red-600 text-white">
            <Plus className="h-4 w-4" /> Go Live
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live streams..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {(["all", "live", "scheduled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors",
                filter === f
                  ? "bg-red-500 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {f === "all" ? "All" : f === "live" ? `🔴 Live${liveCount > 0 ? ` (${liveCount})` : ""}` : "📅 Scheduled"}
            </button>
          ))}
        </div>
      </div>

      {/* Stream list */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3">
              <Radio className="h-8 w-8 text-red-500 animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading streams...</p>
            </div>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <WifiOff className="h-9 w-9 text-red-500/40" />
            </div>
            <p className="text-base font-bold text-foreground mb-1">No live streams</p>
            <p className="text-sm text-muted-foreground mb-5">
              {filter === "live" ? "No one is streaming right now." : "Check back later for upcoming streams."}
            </p>
            <Button onClick={handleGoLive} className="rounded-full gap-1.5 bg-red-500 hover:bg-red-600 text-white">
              <Radio className="h-4 w-4" /> Start Your Own
            </Button>
          </div>
        ) : (
          filteredStreams.map((stream, i) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => {
                  if (stream.status === "ended") {
                    toast.info("This stream has ended");
                    return;
                  }
                  setActiveStream(stream);
                }}
                className="w-full text-left bg-card rounded-2xl border border-border/30 overflow-hidden hover:border-red-500/30 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-violet-900/30 via-background to-rose-900/20 flex items-center justify-center">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{stream.thumbnail_emoji}</div>
                  {stream.status === "live" && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-[10px] gap-1 animate-pulse">
                      <Radio className="h-2.5 w-2.5" /> LIVE
                    </Badge>
                  )}
                  {stream.status === "scheduled" && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-[10px]">
                      📅 Scheduled
                    </Badge>
                  )}
                  {stream.status === "ended" && (
                    <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground border-0 text-[10px]">
                      Ended
                    </Badge>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Eye className="h-3 w-3 text-white/70" />
                    <span className="text-[11px] text-white font-medium">{stream.viewer_count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-red-500/30">
                    <AvatarImage src={stream.host_avatar || undefined} />
                    <AvatarFallback className="bg-red-500/10 text-red-500 text-xs font-bold">
                      {stream.host_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm truncate">{stream.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{stream.host_name} · {stream.topic}</p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
