/**
 * GoLivePage — Broadcast a live stream with camera, title, and chat
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Radio, Camera, CameraOff, Mic, MicOff, RotateCcw,
  Users, Heart, MessageCircle, Send, Share2, X, Sparkles, Zap, Gift, Star, Crown, Flame, ThumbsUp
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type LivePhase = "setup" | "live" | "ended";

export default function GoLivePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<LivePhase>("setup");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("General");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; isGift?: boolean }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [giftsReceived, setGiftsReceived] = useState(0);

  const gifts = [
    { emoji: "🌹", name: "Rose", coins: 1 },
    { emoji: "💎", name: "Diamond", coins: 5 },
    { emoji: "🎉", name: "Party", coins: 10 },
    { emoji: "🚀", name: "Rocket", coins: 50 },
    { emoji: "👑", name: "Crown", coins: 100 },
    { emoji: "🦁", name: "Lion", coins: 200 },
    { emoji: "🌈", name: "Rainbow", coins: 500 },
    { emoji: "🏆", name: "Trophy", coins: 1000 },
  ];

  const quickReactions = ["❤️", "🔥", "😍", "👏", "😂", "🎵", "💯", "✨"];

  const topics = ["General", "Music", "Gaming", "Cooking", "Tech", "Fitness", "Art", "Travel", "Fashion", "Comedy"];

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
      console.warn("Camera access denied or unavailable");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  // Toggle camera
  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraOn((p) => !p);
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMicOn((p) => !p);
    }
  };

  // Flip camera
  const flipCamera = () => {
    setFacingMode((p) => (p === "user" ? "environment" : "user"));
  };

  // Go live
  const goLive = () => {
    if (!title.trim()) {
      toast.error("Please add a title for your stream");
      return;
    }
    setPhase("live");
    toast.success("You're live! 🔴");
  };

  // Simulate viewers & likes while live
  useEffect(() => {
    if (phase !== "live") return;
    const viewerInterval = setInterval(() => {
      setViewerCount((p) => {
        const delta = Math.random() > 0.4 ? Math.floor(Math.random() * 3) : -Math.floor(Math.random() * 2);
        return Math.max(0, p + delta);
      });
    }, 3000);

    const likeInterval = setInterval(() => {
      if (Math.random() > 0.5) setLikes((p) => p + 1);
    }, 2500);

    const elapsedInterval = setInterval(() => setElapsed((p) => p + 1), 1000);

    // Simulate chat messages
    const chatInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Riley", "Casey"];
        const msgs = ["🔥🔥🔥", "This is amazing!", "Hello from NYC!", "Love this!", "First time here ❤️", "Keep going!", "Wow 😍", "👏👏👏"];
        setChatMessages((prev) => [
          ...prev.slice(-20),
          { id: Date.now().toString(), user: names[Math.floor(Math.random() * names.length)], text: msgs[Math.floor(Math.random() * msgs.length)] },
        ]);
      }
    }, 4000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(likeInterval);
      clearInterval(elapsedInterval);
      clearInterval(chatInterval);
    };
  }, [phase]);

  // End stream
  const endStream = () => {
    setPhase("ended");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    toast("Stream ended", { description: `Duration: ${formatTime(elapsed)} · ${viewerCount} viewers` });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev.slice(-20), { id: Date.now().toString(), user: "You (Host)", text: chatInput }]);
    setChatInput("");
  };

  const spawnFloatingReaction = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 60 - 30;
    setFloatingReactions((prev) => [...prev.slice(-12), { id, emoji, x }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 2500);
  };

  const sendReaction = (emoji: string) => {
    spawnFloatingReaction(emoji);
    setLikes((p) => p + 1);
  };

  const sendGift = (gift: { emoji: string; name: string; coins: number }) => {
    setGiftsReceived((p) => p + 1);
    spawnFloatingReaction(gift.emoji);
    // Add gift message to chat
    const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan"];
    const sender = names[Math.floor(Math.random() * names.length)];
    setChatMessages((prev) => [
      ...prev.slice(-20),
      { id: Date.now().toString(), user: sender, text: `sent ${gift.emoji} ${gift.name} (${gift.coins} coins)`, isGift: true },
    ]);
    toast(`${gift.emoji} ${gift.name} sent!`, { description: `${gift.coins} coins` });
    setShowGiftPanel(false);
  };

  // ── Ended screen ──
  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Radio className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Stream Ended</h1>
          <div className="flex gap-5 justify-center text-center flex-wrap">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatTime(elapsed)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{viewerCount}</p>
              <p className="text-xs text-muted-foreground">Peak Viewers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{likes}</p>
              <p className="text-xs text-muted-foreground">Reactions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{giftsReceived}</p>
              <p className="text-xs text-muted-foreground">Gifts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/live")} className="rounded-full flex-1">
              Back to Live
            </Button>
            <Button onClick={() => { setPhase("setup"); setElapsed(0); setViewerCount(0); setLikes(0); setChatMessages([]); startCamera(); }} className="rounded-full flex-1 bg-red-500 hover:bg-red-600 text-white">
              Go Live Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Setup & Live ──
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Camera preview */}
      <div className="absolute inset-0 z-0">
        {cameraError ? (
          <div className="w-full h-full bg-gradient-to-br from-violet-900/50 via-black to-rose-900/40 flex items-center justify-center">
            <div className="text-center space-y-3">
              <CameraOff className="h-12 w-12 text-white/30 mx-auto" />
              <p className="text-white/50 text-sm">Camera unavailable</p>
              <Button size="sm" variant="outline" onClick={startCamera} className="text-white border-white/20">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn("w-full h-full object-contain bg-black", facingMode === "user" && "scale-x-[-1]")}
          />
        )}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-2 px-4 pt-3" style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 12px), 12px)" }}>
        <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); phase === "live" ? endStream() : navigate(-1); }} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          {phase === "live" ? <X className="h-5 w-5 text-white" /> : <ArrowLeft className="h-5 w-5 text-white" />}
        </button>

        {phase === "live" && (
          <>
            <Badge className="bg-red-500 text-white border-0 gap-1 animate-pulse">
              <Radio className="h-3 w-3" /> LIVE
            </Badge>
            <Badge variant="secondary" className="bg-white/15 text-white border-0 gap-1 backdrop-blur-sm">
              <Users className="h-3 w-3" /> {viewerCount}
            </Badge>
            <span className="text-white/70 text-xs font-mono ml-auto">{formatTime(elapsed)}</span>
          </>
        )}
      </div>

      {/* Setup form (only in setup phase) */}
      {phase === "setup" && (
        <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-8 space-y-4">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 space-y-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-red-400" />
                <span className="text-white font-semibold text-sm">Stream Setup</span>
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your stream a title..."
                maxLength={100}
                className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-sm rounded-xl"
              />

              {/* Topic chips */}
              <div>
                <p className="text-white/50 text-xs mb-2">Topic</p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                        topic === t ? "bg-red-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Camera controls */}
            <div className="flex justify-center gap-4">
              <button onClick={toggleCamera} className={cn("w-12 h-12 rounded-full flex items-center justify-center", cameraOn ? "bg-white/20" : "bg-red-500/60")}>
                {cameraOn ? <Camera className="h-5 w-5 text-white" /> : <CameraOff className="h-5 w-5 text-white" />}
              </button>
              <button onClick={toggleMic} className={cn("w-12 h-12 rounded-full flex items-center justify-center", micOn ? "bg-white/20" : "bg-red-500/60")}>
                {micOn ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
              </button>
              <button onClick={flipCamera} className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Go Live button */}
            <Button onClick={goLive} className="w-full rounded-full h-12 bg-red-500 hover:bg-red-600 text-white text-base font-bold gap-2 shadow-lg shadow-red-500/30">
              <Zap className="h-5 w-5" /> Go Live
            </Button>
          </motion.div>
        </div>
      )}

      {/* Live phase: chat overlay + actions */}
      {phase === "live" && (
        <div className="relative z-10 flex-1 flex flex-col justify-end">
          {/* Floating reactions */}
          <AnimatePresence>
            {floatingReactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -280, x: r.x, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="absolute bottom-44 right-8 text-2xl pointer-events-none z-30"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Side actions */}
          <div className="absolute right-3 bottom-52 flex flex-col gap-3 items-center z-20">
            <button onClick={() => sendReaction("❤️")} className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
              <Heart className="h-5 w-5 text-red-400" />
            </button>
            <span className="text-white text-[10px] -mt-1">{likes}</span>

            <button onClick={() => setShowGiftPanel(true)} className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/40 to-yellow-500/40 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
              <Gift className="h-5 w-5 text-yellow-300" />
            </button>
            {giftsReceived > 0 && <span className="text-yellow-300 text-[10px] -mt-1">{giftsReceived}</span>}

            <button onClick={() => { navigator.share?.({ title: `Watch ${title} live on ZIVO!`, url: window.location.href }).catch(() => {}); }} className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Quick reaction bar */}
          <div className="px-4 mb-2 flex gap-1 overflow-x-auto scrollbar-hide">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center shrink-0 active:scale-75 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat messages overlay */}
          <div className="px-4 mb-2 max-h-[180px] overflow-y-auto space-y-2 pointer-events-none">
            <AnimatePresence initial={false}>
              {chatMessages.slice(-8).map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit max-w-[80%]",
                    msg.isGift ? "bg-amber-500/20 border border-amber-500/30" : "bg-black/30"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">{msg.user[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white/80 font-medium">{msg.user}</span>
                  <span className={cn("text-xs", msg.isGift ? "text-amber-300" : "text-white")}>{msg.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Chat input + End button */}
          <div className="px-3 pb-4 flex gap-2 items-center" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 16px), 16px)" }}>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Comment..."
              className="bg-white/10 border-white/10 text-white placeholder:text-white/40 text-sm rounded-full flex-1"
            />
            <Button size="icon" onClick={sendChat} className="rounded-full bg-white/15 hover:bg-white/25 shrink-0">
              <Send className="h-4 w-4 text-white" />
            </Button>
            <Button onClick={endStream} size="sm" variant="destructive" className="rounded-full text-xs font-bold shrink-0">
              End
            </Button>
          </div>

          {/* Gift panel overlay */}
          <AnimatePresence>
            {showGiftPanel && (
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-400" /> Send a Gift
                    </h3>
                    <button onClick={() => setShowGiftPanel(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {gifts.map((gift) => (
                      <button
                        key={gift.name}
                        onClick={() => sendGift(gift)}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
                      >
                        <span className="text-2xl">{gift.emoji}</span>
                        <span className="text-[10px] text-white/60">{gift.name}</span>
                        <span className="text-[10px] text-yellow-400 font-semibold">{gift.coins}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>Coins are for fun — no real money involved</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
