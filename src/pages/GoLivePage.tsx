/**
 * GoLivePage — Broadcast a real live stream.
 *
 * 100% real:
 * - Creates a row in `live_streams` when going live
 * - Subscribes to real `live_comments`, `live_viewers`, `live_likes`, `live_gift_displays`
 * - Marks stream as `ended` on stop
 * - Coin balance + Add Coin sheet wired to `user_coin_balances` + `recharge_coins` RPC
 *
 * Removed (per spec): PK battles, treasure chest, AR stickers, polls, super chat,
 * leaderboard popup, hashtags, BG music picker, screen effects, stream rating,
 * fake viewers / likes / gifts simulators.
 */
import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Radio from "lucide-react/dist/esm/icons/radio";
import Camera from "lucide-react/dist/esm/icons/camera";
import CameraOff from "lucide-react/dist/esm/icons/camera-off";
import Mic from "lucide-react/dist/esm/icons/mic";
import MicOff from "lucide-react/dist/esm/icons/mic-off";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Users from "lucide-react/dist/esm/icons/users";
import Heart from "lucide-react/dist/esm/icons/heart";
import X from "lucide-react/dist/esm/icons/x";
import Gift from "lucide-react/dist/esm/icons/gift";
import Eye from "lucide-react/dist/esm/icons/eye";
import Music from "lucide-react/dist/esm/icons/music";
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2";
import ChefHat from "lucide-react/dist/esm/icons/chef-hat";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import PaintBucket from "lucide-react/dist/esm/icons/paintbrush";
import Plane from "lucide-react/dist/esm/icons/plane";
import Globe from "lucide-react/dist/esm/icons/globe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCoinBalance } from "@/hooks/useCoinBalance";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";

const CoinRechargeSheet = lazy(() => import("@/components/live/CoinRechargeSheet"));

type LivePhase = "setup" | "countdown" | "live" | "ended";

interface ChatRow { id: string; user_id: string; user_name: string; text: string; created_at: string; isGift?: boolean }

const TOPICS = [
  { name: "General", icon: Globe },
  { name: "Music", icon: Music },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Cooking", icon: ChefHat },
  { name: "Tech", icon: Laptop },
  { name: "Fitness", icon: Dumbbell },
  { name: "Art", icon: PaintBucket },
  { name: "Travel", icon: Plane },
];

export default function GoLivePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { balance: coinBalance, recharge } = useCoinBalance();
  const hostDisplayName = userProfile?.full_name || user?.email?.split("@")[0] || "Host";

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<LivePhase>("setup");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("General");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [giftsReceived, setGiftsReceived] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatRow[]>([]);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // ── Camera ──
  const startCamera = useCallback(async () => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [startCamera]);

  const toggleCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((p) => !p);
  }, []);

  const toggleMic = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((p) => !p);
  }, []);

  const flipCamera = useCallback(() => setFacingMode((p) => (p === "user" ? "environment" : "user")), []);

  // ── Go live: create live_streams row ──
  const goLive = useCallback(async () => {
    if (!user?.id) { toast.error("Please sign in"); return; }
    const streamTitle = title.trim() || "My Live Stream";
    setTitle(streamTitle);
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    const iv = setInterval(async () => {
      c -= 1;
      if (c <= 0) {
        clearInterval(iv);
        const { data, error } = await (supabase as any)
          .from("live_streams")
          .insert({
            user_id: user.id,
            title: streamTitle,
            topic,
            host_name: hostDisplayName,
            host_avatar: userProfile?.avatar_url ?? null,
            status: "live",
            started_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error) {
          toast.error("Failed to start", { description: error.message });
          setPhase("setup");
          return;
        }
        setStreamId(data.id);
        setPhase("live");
        toast.success("You're live!");
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [title, topic, user?.id, hostDisplayName, userProfile?.avatar_url]);

  // ── Realtime subscriptions for the active stream ──
  useEffect(() => {
    if (!streamId) return;
    const channel = supabase
      .channel(`go-live-${streamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_comments", filter: `stream_id=eq.${streamId}` },
        async (payload: any) => {
          const row = payload.new;
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", row.user_id)
            .maybeSingle();
          setChatMessages((prev) => [
            ...prev.slice(-39),
            { id: row.id, user_id: row.user_id, user_name: (prof as any)?.full_name || "Guest", text: row.content, created_at: row.created_at },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_viewers", filter: `stream_id=eq.${streamId}` },
        () => setViewerCount((v) => v + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_viewers", filter: `stream_id=eq.${streamId}` },
        () => setViewerCount((v) => Math.max(0, v - 1))
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_likes", filter: `stream_id=eq.${streamId}` },
        () => setLikes((l) => l + 1)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_gift_displays", filter: `stream_id=eq.${streamId}` },
        (payload: any) => {
          const g = payload.new;
          setCoinsEarned((c) => c + g.coins);
          setGiftsReceived((n) => n + 1);
          setChatMessages((prev) => [
            ...prev.slice(-39),
            { id: `gift-${g.id}`, user_id: g.sender_id, user_name: g.sender_name, text: `sent ${g.gift_name}`, created_at: g.created_at, isGift: true },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${streamId}` },
        (payload: any) => {
          const r = payload.new;
          if (typeof r.viewer_count === "number") setViewerCount(r.viewer_count);
          if (typeof r.like_count === "number") setLikes(r.like_count);
          if (typeof r.coins_earned === "number") setCoinsEarned(r.coins_earned);
          if (typeof r.gifts_received === "number") setGiftsReceived(r.gifts_received);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [streamId]);

  // Stream timer
  useEffect(() => {
    if (phase !== "live") return;
    const i = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const endActiveStream = useCallback(async (options?: { keepalive?: boolean }) => {
    if (!streamId) return;

    const endedAt = new Date().toISOString();

    try {
      if (options?.keepalive) {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        await fetch(`${SUPABASE_URL}/rest/v1/live_streams?id=eq.${streamId}&status=eq.live`, {
          method: "PATCH",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${accessToken ?? SUPABASE_PUBLISHABLE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ status: "ended", ended_at: endedAt }),
        });

        return;
      }

      await (supabase as any)
        .from("live_streams")
        .update({ status: "ended", ended_at: endedAt })
        .eq("id", streamId)
        .eq("status", "live");
    } catch (error) {
      console.warn("[GoLivePage] failed to end stream", error);
    }
  }, [streamId]);

  const endStream = useCallback(async () => {
    await endActiveStream();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStreamId(null);
    setPhase("ended");
  }, [endActiveStream]);

  // NOTE: We intentionally DO NOT auto-end the stream on unmount, page refresh,
  // tab close, or navigation. The host's stream stays "live" until they
  // explicitly tap End / X. This lets them refresh, lose connection, or hide
  // the studio panel without dropping their broadcast.

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── SETUP / COUNTDOWN / ENDED screens ──
  if (phase === "setup" || phase === "countdown") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <video ref={videoRef} autoPlay muted playsInline className={cn("absolute inset-0 w-full h-full object-cover", facingMode === "user" && "scale-x-[-1]")} />
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center px-6">
              <CameraOff className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Camera unavailable. Check permissions.</p>
              <Button onClick={startCamera} className="mt-4" variant="outline">Retry</Button>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {phase === "setup" && (
          <>
            <div className="relative z-10 flex items-center gap-2 px-3 pt-2" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}>
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-white font-bold flex-1 text-center mr-9">Go Live</h1>
            </div>

            <div className="relative z-10 mt-auto px-4 pb-6 space-y-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you streaming?"
                maxLength={80}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
              />

              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {TOPICS.map((t) => {
                  const Ico = t.icon;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setTopic(t.name)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors",
                        topic === t.name ? "bg-red-500 border-red-400 text-white" : "bg-white/10 border-white/20 text-white/70"
                      )}
                    >
                      <Ico className="h-3.5 w-3.5" /> {t.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 py-2">
                <button onClick={toggleCamera} className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  {cameraOn ? <Camera className="h-5 w-5 text-white" /> : <CameraOff className="h-5 w-5 text-white/50" />}
                </button>
                <button onClick={toggleMic} className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  {micOn ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white/50" />}
                </button>
                <button onClick={flipCamera} className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-white" />
                </button>
              </div>

              <Button onClick={goLive} disabled={!user} className="w-full h-14 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-lg shadow-red-500/40">
                <Radio className="h-5 w-5 mr-2" /> {user ? "Go Live" : "Sign in to go live"}
              </Button>
            </div>
          </>
        )}

        {phase === "countdown" && (
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-white font-black text-[10rem] drop-shadow-[0_0_30px_rgba(255,80,80,0.6)]"
            >
              {countdown}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ── ENDED summary ──
  if (phase === "ended") {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
          <Radio className="h-9 w-9 text-red-400" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-1">Stream Ended</h2>
        <p className="text-white/60 text-sm mb-8">{formatTime(elapsed)} broadcast time</p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
          <Stat label="Viewers" value={viewerCount} icon={<Eye className="h-4 w-4" />} />
          <Stat label="Likes" value={likes} icon={<Heart className="h-4 w-4 text-red-400" />} />
          <Stat label="Gifts" value={giftsReceived} icon={<Gift className="h-4 w-4 text-amber-300" />} />
          <Stat label="Coins" value={coinsEarned} icon={<img src={goldCoinIcon} alt="" className="h-4 w-4" />} />
        </div>

        <Button onClick={() => navigate("/live")} className="w-full max-w-sm h-12 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold">
          Done
        </Button>
      </div>
    );
  }

  // ── LIVE screen ──
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video ref={videoRef} autoPlay muted playsInline className={cn("absolute inset-0 w-full h-full object-cover", facingMode === "user" && "scale-x-[-1]")} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-2 px-3 pt-2" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}>
        <div className="flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-1 shadow-lg">
          <Radio className="h-3 w-3 text-white animate-pulse" />
          <span className="text-white text-[10px] font-black tracking-wider">LIVE</span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Eye className="h-3 w-3 text-white/70" />
          <span className="text-[11px] text-white font-medium">{viewerCount}</span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Heart className="h-3 w-3 text-red-400 fill-red-400" />
          <span className="text-[11px] text-white font-medium">{likes}</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-amber-500/30">
          <img src={goldCoinIcon} alt="" className="h-3 w-3" />
          <span className="text-[11px] text-amber-300 font-bold">{coinsEarned}</span>
        </div>
        <div className="flex-1" />
        <span className="text-white/70 text-[10px] font-mono bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">{formatTime(elapsed)}</span>
        <button onClick={() => setShowEndConfirm(true)} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Title */}
      <div className="relative z-10 px-4 mt-2">
        <p className="text-white text-xs font-medium drop-shadow truncate">{title} · {topic}</p>
      </div>

      {/* Chat */}
      <div className="absolute left-0 right-16 z-10" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}>
        <div className="pl-3 pr-3 max-h-[200px] overflow-y-auto scrollbar-hide space-y-1.5 flex flex-col items-start">
          {chatMessages.length === 0 ? (
            <div className="text-[11px] text-white/40 italic px-2">Waiting for viewers…</div>
          ) : (
            chatMessages.slice(-10).map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "rounded-2xl px-2.5 py-1.5 max-w-full backdrop-blur-sm",
                  m.isGift ? "bg-amber-500/30 border border-amber-500/50" : "bg-black/40"
                )}
              >
                <span className="text-[10px] font-bold text-amber-300 mr-1.5">{m.user_name}</span>
                <span className="text-[11px] text-white">{m.text}</span>
              </motion.div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Right tools */}
      <div className="absolute right-3 z-10 flex flex-col gap-2.5 items-center" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)" }}>
        <button onClick={toggleMic} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          {micOn ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-red-400" />}
        </button>
        <button onClick={toggleCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          {cameraOn ? <Camera className="h-4 w-4 text-white" /> : <CameraOff className="h-4 w-4 text-red-400" />}
        </button>
        <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <RotateCcw className="h-4 w-4 text-white" />
        </button>
        <button onClick={() => setShowRechargeSheet(true)} className="w-10 h-10 rounded-full bg-amber-500/30 border border-amber-500/40 backdrop-blur-sm flex flex-col items-center justify-center">
          <img src={goldCoinIcon} alt="" className="h-4 w-4" />
          <span className="text-[7px] text-amber-200 -mt-0.5">+Coin</span>
        </button>
      </div>

      {/* End confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 rounded-3xl p-6 w-full max-w-sm border border-white/10">
              <h3 className="text-white font-bold text-lg mb-1">End stream?</h3>
              <p className="text-white/60 text-sm mb-5">You can't restart the same broadcast.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEndConfirm(false)} className="flex-1 rounded-full">Keep going</Button>
                <Button onClick={() => { setShowEndConfirm(false); endStream(); }} className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white">End</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <CoinRechargeSheet
          open={showRechargeSheet}
          onClose={() => setShowRechargeSheet(false)}
          currentBalance={coinBalance}
          onPurchase={async (coins) => {
            try { await recharge(coins); } catch (e: any) { throw new Error(e?.message ?? "Recharge failed"); }
          }}
        />
      </Suspense>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-1">{icon} {label}</div>
      <div className="text-white text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
