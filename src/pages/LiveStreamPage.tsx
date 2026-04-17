/**
 * LiveStreamPage — Browse live streams + immersive watcher.
 *
 * 100% real data:
 * - Stream list comes from `live_streams` (no demo / mock fallback)
 * - Watcher subscribes to `live_comments`, `live_viewers`, `live_likes`,
 *   `live_gift_displays` via Supabase Realtime
 * - Coin balance comes from `user_coin_balances`
 * - Gifts are sent via the `send_live_gift` RPC (atomic debit + credit)
 * - Recharge calls the `recharge_coins` RPC (the Add Coin sheet is the only
 *   way to add coins, per product spec)
 */
import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Radio from "lucide-react/dist/esm/icons/radio";
import Eye from "lucide-react/dist/esm/icons/eye";
import Heart from "lucide-react/dist/esm/icons/heart";
import Send from "lucide-react/dist/esm/icons/send";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Wifi from "lucide-react/dist/esm/icons/wifi";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off";
import Gift from "lucide-react/dist/esm/icons/gift";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import X from "lucide-react/dist/esm/icons/x";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import Clapperboard from "lucide-react/dist/esm/icons/clapperboard";
import Flame from "lucide-react/dist/esm/icons/flame";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCoinBalance } from "@/hooks/useCoinBalance";
import { useGiftAnimationQueue } from "@/hooks/useGiftAnimationQueue";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { giftImages, preloadGiftImages } from "@/config/giftIcons";
import { hasGiftVideo, preloadGiftAnimations } from "@/config/giftAnimations";
import { giftCatalog, getLevelColor, type GiftItem } from "@/config/giftCatalog";
import { playGiftSound, playPremiumGiftSound, playLegendaryGiftSound } from "@/utils/giftSounds";

const ZivoMobileNav = lazy(() => import("@/components/app/ZivoMobileNav"));
const GiftAnimationOverlay = lazy(() => import("@/components/live/GiftAnimationOverlay"));
const CoinRechargeSheet = lazy(() => import("@/components/live/CoinRechargeSheet"));

interface LiveStream {
  id: string;
  user_id: string;
  host_name: string;
  host_avatar: string | null;
  title: string;
  topic: string;
  viewer_count: number;
  like_count: number;
  status: "live" | "scheduled" | "ended";
  started_at: string;
}

interface ChatMsg {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  text: string;
  created_at: string;
}

/* ─────────── Watcher Component ─────────── */
function LiveWatcher({ stream, onLeave }: { stream: LiveStream; onLeave: () => void }) {
  const { user } = useAuth();
  const { balance: coinBalance, recharge } = useCoinBalance();

  useEffect(() => {
    preloadGiftAnimations();
    preloadGiftImages();
  }, []);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [giftQty, setGiftQty] = useState(1);
  const [giftTab, setGiftTab] = useState<"gifts" | "interactive" | "exclusive">("gifts");
  const [floatingHearts, setFloatingHearts] = useState<{ id: string; x: number }[]>([]);
  const [viewerCount, setViewerCount] = useState(stream.viewer_count || 0);
  const [likes, setLikes] = useState(stream.like_count || 0);
  const [muted, setMuted] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [sending, setSending] = useState(false);
  const [showViewerList, setShowViewerList] = useState(false);
  const [viewerNames, setViewerNames] = useState<{ user_id: string; name: string; avatar: string | null }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [streamEnded, setStreamEnded] = useState(stream.status === "ended");

  const lastTapRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { activeGift: activeGiftAnim, comboCount: giftCombo, enqueue: enqueueGiftAnim, onComplete: onGiftAnimComplete } = useGiftAnimationQueue();
  const allGifts = useMemo(() => giftCatalog, []);

  // ── Stream timer ──
  useEffect(() => {
    const startedAt = new Date(stream.started_at).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [stream.started_at]);

  // ── Initial load: chat history + viewer names + viewer count ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: comments }, { data: viewers }, { data: streamRow }] = await Promise.all([
        (supabase as any)
          .from("live_comments")
          .select("id, user_id, content, created_at")
          .eq("stream_id", stream.id)
          .order("created_at", { ascending: false })
          .limit(40),
        (supabase as any)
          .from("live_viewers")
          .select("user_id")
          .eq("stream_id", stream.id),
        (supabase as any)
          .from("live_streams")
          .select("viewer_count, like_count")
          .eq("id", stream.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;

      if (streamRow) {
        if (typeof streamRow.viewer_count === "number") setViewerCount(streamRow.viewer_count);
        if (typeof streamRow.like_count === "number") setLikes(streamRow.like_count);
      }

      // Resolve user names for both chat + viewers
      const userIds = new Set<string>();
      (comments ?? []).forEach((c: any) => userIds.add(c.user_id));
      (viewers ?? []).forEach((v: any) => userIds.add(v.user_id));
      let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (userIds.size) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, avatar_url")
          .in("user_id", Array.from(userIds));
        for (const p of profs ?? []) {
          profileMap.set((p as any).user_id, { full_name: (p as any).full_name, avatar_url: (p as any).avatar_url });
        }
      }

      setChatMessages(
        ((comments ?? []) as any[]).reverse().map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          user_name: profileMap.get(c.user_id)?.full_name || "Guest",
          user_avatar: profileMap.get(c.user_id)?.avatar_url ?? null,
          text: c.content,
          created_at: c.created_at,
        }))
      );

      setViewerNames(
        ((viewers ?? []) as any[]).map((v: any) => ({
          user_id: v.user_id,
          name: profileMap.get(v.user_id)?.full_name || "Guest",
          avatar: profileMap.get(v.user_id)?.avatar_url ?? null,
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [stream.id]);

  // ── Join as viewer (insert + delete on leave) ──
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      await (supabase as any)
        .from("live_viewers")
        .insert({ stream_id: stream.id, user_id: user.id })
        .then(() => null, () => null); // ignore duplicates
    })();
    return () => {
      if (!active) return;
      (supabase as any)
        .from("live_viewers")
        .delete()
        .eq("stream_id", stream.id)
        .eq("user_id", user.id)
        .then(() => null, () => null);
      active = false;
    };
  }, [stream.id, user?.id]);

  // ── Realtime: chat, viewers, likes, gifts ──
  useEffect(() => {
    const channel = supabase
      .channel(`live-${stream.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_comments", filter: `stream_id=eq.${stream.id}` },
        async (payload: any) => {
          const row = payload.new;
          // Lookup author name
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", row.user_id)
            .maybeSingle();
          setChatMessages((prev) => [
            ...prev.slice(-39),
            {
              id: row.id,
              user_id: row.user_id,
              user_name: (prof as any)?.full_name || "Guest",
              user_avatar: (prof as any)?.avatar_url ?? null,
              text: row.content,
              created_at: row.created_at,
            },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_viewers", filter: `stream_id=eq.${stream.id}` },
        () => setViewerCount((v) => v + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_viewers", filter: `stream_id=eq.${stream.id}` },
        () => setViewerCount((v) => Math.max(0, v - 1))
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_likes", filter: `stream_id=eq.${stream.id}` },
        () => {
          setLikes((l) => l + 1);
          setFloatingHearts((prev) => [
            ...prev,
            { id: `h-${Date.now()}-${Math.random()}`, x: 60 + Math.random() * 30 },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_gift_displays", filter: `stream_id=eq.${stream.id}` },
        (payload: any) => {
          const g = payload.new;
          // Premium animation when applicable
          if (hasGiftVideo(g.gift_name)) {
            enqueueGiftAnim({ name: g.gift_name, coins: g.coins, senderName: g.sender_name });
          } else {
            // Sound feedback for everyone else's gifts too
            if (g.coins >= 20000) playLegendaryGiftSound();
            else if (g.coins >= 500) playPremiumGiftSound();
            else playGiftSound(1, g.coins);
          }
          // Add to chat as a "gift" line
          setChatMessages((prev) => [
            ...prev.slice(-39),
            {
              id: `gift-${g.id}`,
              user_id: g.sender_id,
              user_name: g.sender_name,
              user_avatar: null,
              text: `sent ${g.gift_name}`,
              created_at: g.created_at,
            },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${stream.id}` },
        (payload: any) => {
          const next = payload.new;
          if (next?.status === "ended") setStreamEnded(true);
          if (typeof next?.viewer_count === "number") setViewerCount(next.viewer_count);
          if (typeof next?.like_count === "number") setLikes(next.like_count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stream.id, enqueueGiftAnim]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-clear floating hearts
  useEffect(() => {
    if (!floatingHearts.length) return;
    const t = setTimeout(() => setFloatingHearts((p) => p.slice(1)), 2200);
    return () => clearTimeout(t);
  }, [floatingHearts]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !user?.id) {
      if (!user?.id) toast.error("Sign in to chat");
      return;
    }
    const content = chatInput.trim();
    setChatInput("");
    const { error } = await (supabase as any)
      .from("live_comments")
      .insert({ stream_id: stream.id, user_id: user.id, content });
    if (error) toast.error("Failed to send", { description: error.message });
  }, [chatInput, stream.id, user?.id]);

  const sendLike = useCallback(async () => {
    if (!user?.id) {
      toast.error("Sign in to like");
      return;
    }
    const { error } = await (supabase as any)
      .from("live_likes")
      .insert({ stream_id: stream.id, user_id: user.id });
    if (error && !String(error.message).includes("duplicate")) {
      toast.error("Failed to like");
    }
  }, [stream.id, user?.id]);

  const sendGift = useCallback(async () => {
    if (!selectedGift || !user?.id) {
      if (!user?.id) toast.error("Sign in to send gifts");
      return;
    }
    const totalCoins = selectedGift.coins * giftQty;
    if (totalCoins > coinBalance) {
      toast.error("Not enough coins!", { description: "Top up your balance to send this gift." });
      setShowRechargeSheet(true);
      return;
    }
    setSending(true);
    try {
      const tier = selectedGift.coins >= 20000 ? "legendary" : selectedGift.coins >= 500 ? "premium" : "standard";
      const { error } = await (supabase as any).rpc("send_live_gift", {
        p_stream_id: stream.id,
        p_gift_name: selectedGift.name,
        p_gift_icon: selectedGift.icon,
        p_coins: selectedGift.coins,
        p_tier: tier,
        p_quantity: giftQty,
      });
      if (error) throw error;
      try { navigator.vibrate?.(giftQty > 1 ? [50, 30, 50] : [50]); } catch { /* noop */ }
      // Sound for the sender (others get one via realtime handler)
      if (selectedGift.coins >= 20000) playLegendaryGiftSound();
      else if (hasGiftVideo(selectedGift.name)) playPremiumGiftSound();
      else playGiftSound(1, selectedGift.coins);
      setGiftQty(1);
    } catch (e: any) {
      toast.error("Couldn't send gift", { description: e?.message ?? "Please try again." });
    } finally {
      setSending(false);
    }
  }, [selectedGift, giftQty, coinBalance, stream.id, user?.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: stream.title, text: `Watch ${stream.host_name} live on ZIVO!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDoubleTap = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.width / 2 : (e as React.MouseEvent).clientX;
        const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.height / 2 : (e as React.MouseEvent).clientY;
        setDoubleTapHeart({ id: Date.now().toString(), x: clientX - rect.left, y: clientY - rect.top });
        sendLike();
        setTimeout(() => setDoubleTapHeart(null), 1000);
      }
      lastTapRef.current = now;
    },
    [sendLike]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Background */}
      <div className="absolute inset-0" onClick={handleDoubleTap} onTouchEnd={handleDoubleTap}>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-black to-rose-900/60" />
        <AnimatePresence>
          {doubleTapHeart && (
            <motion.div
              key={doubleTapHeart.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0, y: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute pointer-events-none z-40"
              style={{ left: doubleTapHeart.x - 24, top: doubleTapHeart.y - 24 }}
            >
              <Heart className="h-12 w-12 text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top bar */}
      <div
        className="relative z-20 flex items-center gap-2 px-3 pt-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
      >
        <button onClick={onLeave} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex-1 min-w-0">
          <Avatar className="h-8 w-8 border-2 border-red-500 shrink-0">
            <AvatarImage src={stream.host_avatar || undefined} />
            <AvatarFallback className="bg-red-500/20 text-red-400 text-xs font-bold">
              {stream.host_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">{stream.host_name}</p>
            <p className="text-white/50 text-[10px] leading-tight">{stream.topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Eye className="h-3 w-3 text-white/70" />
          <span className="text-[11px] text-white font-medium">{viewerCount.toLocaleString()}</span>
        </div>
      </div>

      {/* LIVE badge + title */}
      <div className="relative z-10 px-4 mt-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 text-white border-0 text-[10px] gap-1 px-2 py-0.5 animate-pulse">
            <Radio className="h-2.5 w-2.5" /> LIVE
          </Badge>
          <p className="text-white/80 text-xs font-medium truncate flex-1">{stream.title}</p>
          <span className="text-white/50 text-[10px] font-mono">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Floating like hearts */}
      <div className="absolute right-4 bottom-48 z-30 w-14 pointer-events-none">
        <AnimatePresence>
          {floatingHearts.map((r) => {
            const randomScale = 0.8 + Math.random() * 0.8;
            const randomDrift = (Math.random() - 0.5) * 50;
            const randomDur = 1.8 + Math.random() * 1.2;
            return (
              <motion.div
                key={r.id}
                initial={{ y: 0, opacity: 1, scale: 0.3 }}
                animate={{
                  y: -220 - Math.random() * 80,
                  opacity: [1, 1, 0.8, 0],
                  scale: [0.3, randomScale, randomScale * 0.9, randomScale * 0.5],
                  x: [0, randomDrift * 0.3, randomDrift],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: randomDur, ease: "easeOut" }}
                className="absolute bottom-0"
                style={{ left: `${r.x - 60}%` }}
              >
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Right sidebar actions */}
      <div
        className="absolute right-3 z-20 flex flex-col gap-2.5 items-center"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 160px)" }}
      >
        <button onClick={() => setMuted(!muted)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          {muted ? <VolumeX className="h-4 w-4 text-white/70" /> : <Volume2 className="h-4 w-4 text-white/70" />}
        </button>
        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Share2 className="h-4 w-4 text-white" />
        </button>
        <button onClick={sendLike} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
          <Heart className="h-4 w-4 text-red-400 fill-red-400" />
          {likes > 0 && <span className="text-[8px] text-white/60 -mt-0.5">{likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>}
        </button>
        <button onClick={() => setShowViewerList((s) => !s)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
          <Eye className="h-4 w-4 text-white/70" />
          <span className="text-[7px] text-white/50 -mt-0.5">{viewerCount > 999 ? `${(viewerCount / 1000).toFixed(1)}k` : viewerCount}</span>
        </button>
        <button onClick={() => setShowGiftPanel(true)} className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
          <Gift className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Viewer list */}
      <AnimatePresence>
        {showViewerList && (
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute right-2 z-40 w-56 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-xs font-bold text-white">Viewers ({viewerCount})</span>
              <button onClick={() => setShowViewerList(false)} className="text-white/40">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-2 space-y-0.5 max-h-[250px] overflow-y-auto">
              {viewerNames.length === 0 ? (
                <p className="text-[10px] text-white/40 text-center py-3">No viewers yet</p>
              ) : (
                viewerNames.slice(0, 25).map((v) => (
                  <div key={v.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5">
                    <Avatar className="h-6 w-6"><AvatarImage src={v.avatar || undefined} /><AvatarFallback className="text-[9px]">{v.name[0]}</AvatarFallback></Avatar>
                    <span className="text-[11px] text-white font-medium truncate">{v.name}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat overlay */}
      <div className="absolute left-0 right-16 z-20" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}>
        <div className="pl-3 pr-16 max-h-[180px] overflow-y-auto scrollbar-hide space-y-2 flex flex-col items-start">
          {chatMessages.length === 0 ? (
            <div className="text-[11px] text-white/40 italic px-2 py-1">Be the first to say hi 👋</div>
          ) : (
            chatMessages.slice(-8).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-sm rounded-2xl px-2.5 py-1.5 max-w-full"
              >
                <span className="text-[10px] font-bold text-amber-300 mr-1.5">{msg.user_name}</span>
                <span className="text-[11px] text-white">{msg.text}</span>
              </motion.div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom input */}
      <div className="absolute left-0 right-0 z-30 px-3 pb-3 flex items-center gap-2" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0px)" }}>
        <div className="flex-1 relative">
          <input
            placeholder={user ? "Say something..." : "Sign in to chat"}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            disabled={!user}
            className="w-full px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/10 disabled:opacity-50"
          />
        </div>
        <button onClick={() => setShowGiftPanel(true)} className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <Gift className="h-4 w-4 text-white" />
        </button>
        <button onClick={sendChat} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Send className="h-4 w-4 text-primary-foreground" />
        </button>
      </div>

      {/* Gift panel */}
      <AnimatePresence>
        {showGiftPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-zinc-900/98 backdrop-blur-xl rounded-t-3xl border-t border-white/10"
            style={{ maxHeight: "55vh", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
          >
            <div className="flex justify-center py-2"><div className="w-10 h-1 rounded-full bg-white/20" /></div>

            <div className="border-b border-white/5 py-2 px-4 flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-amber-500/15 rounded-full px-2.5 py-1 border border-amber-500/20">
                  <img src={goldCoinIcon} alt="coins" className="w-4 h-4" />
                  <span className="text-amber-300 text-[11px] font-bold">{coinBalance.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setShowRechargeSheet(true)}
                  className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 active:scale-90 transition-transform"
                  aria-label="Add coins"
                >
                  <span className="text-amber-300 text-xs font-bold leading-none">+</span>
                </button>
              </div>
              <div className="flex-1" />
              <button onClick={() => { setShowGiftPanel(false); setSelectedGift(null); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <X className="h-3.5 w-3.5 text-white/60" />
              </button>
            </div>

            <div className="overflow-y-auto px-2 py-3" style={{ maxHeight: selectedGift ? "calc(55vh - 210px)" : "calc(55vh - 140px)" }}>
              <div className="grid grid-cols-4 gap-1.5">
                {allGifts[giftTab].map((gift) => (
                  <button
                    key={gift.name}
                    onClick={() => { setSelectedGift(selectedGift?.name === gift.name ? null : gift); setGiftQty(1); }}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl transition-all",
                      selectedGift?.name === gift.name ? "bg-amber-500/15 ring-2 ring-amber-500/40 scale-105" : "hover:bg-white/5 active:scale-90"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br overflow-hidden relative", gift.bg)}>
                      {giftImages[gift.name] ? (
                        <img src={giftImages[gift.name]} alt={gift.name} className="w-10 h-10 object-contain" loading="lazy" />
                      ) : (
                        <span className="text-3xl">{gift.icon}</span>
                      )}
                      {hasGiftVideo(gift.name) && (
                        <span className="absolute bottom-0.5 left-0.5 text-[7px] bg-black/50 text-white/80 px-1 py-0.5 rounded-md font-bold backdrop-blur-sm flex items-center"><Clapperboard className="h-2 w-2" /></span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/70 truncate w-full text-center leading-tight mt-0.5">{gift.name}</span>
                    <div className="flex items-center gap-0.5">
                      <span className={cn("text-[8px] font-bold", getLevelColor(gift.level))}>Lv.{gift.level}</span>
                      <img src={goldCoinIcon} alt="coin" className="w-3 h-3 object-contain" loading="lazy" />
                      <span className="text-[10px] text-yellow-400 font-semibold">{gift.coins.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {selectedGift && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br overflow-hidden shrink-0", selectedGift.coins >= 100 ? "from-amber-400 to-orange-500" : "from-violet-400 to-purple-500")}>
                      {giftImages[selectedGift.name] ? (
                        <img src={giftImages[selectedGift.name]} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-xl">{selectedGift.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{selectedGift.name}</p>
                      <div className="flex items-center gap-1">
                        <img src={goldCoinIcon} alt="" className="w-3 h-3" />
                        <span className="text-amber-300 text-[11px] font-bold">{(selectedGift.coins * giftQty).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 overflow-x-auto max-w-[180px] no-scrollbar snap-x snap-mandatory py-0.5">
                      {[1, 3, 5, 10, 20, 33, 50, 99].map((q) => (
                        <button
                          key={q}
                          onClick={() => setGiftQty(q)}
                          className={cn(
                            "min-w-[34px] h-7 rounded-full text-[10px] font-bold transition-all snap-center shrink-0 px-1.5",
                            giftQty === q ? "bg-amber-500/30 text-amber-300 border border-amber-500/40" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                          )}
                        >
                          {q}x
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={sendGift}
                      disabled={sending}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2.5 shadow-lg active:scale-90 transition-all shrink-0 disabled:opacity-50",
                        selectedGift.coins >= 500 ? "bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/25" : "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/25"
                      )}
                    >
                      <Send className="h-3.5 w-3.5 text-white" />
                      <span className="text-white text-xs font-bold">{sending ? "..." : giftQty > 1 ? `x${giftQty}` : "Send"}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center border-t border-white/10 px-2 py-2 gap-1">
              {(["gifts", "interactive", "exclusive"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setGiftTab(tab); setSelectedGift(null); }}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors", giftTab === tab ? "text-white bg-white/10" : "text-white/40")}
                >
                  {tab === "gifts" ? "Gifts" : tab === "interactive" ? "Interactive" : "Exclusive"}
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => setShowRechargeSheet(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
                <img src={goldCoinIcon} alt="" className="w-4 h-4" />
                <span className="text-[11px] text-white font-bold">Add Coin</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <GiftAnimationOverlay
          activeGift={activeGiftAnim}
          onComplete={onGiftAnimComplete}
          giftPanelOpen={showGiftPanel}
          comboCount={giftCombo}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CoinRechargeSheet
          open={showRechargeSheet}
          onClose={() => setShowRechargeSheet(false)}
          currentBalance={coinBalance}
          onPurchase={async (coins) => {
            try {
              await recharge(coins);
            } catch (e: any) {
              throw new Error(e?.message ?? "Recharge failed");
            }
          }}
        />
      </Suspense>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function LiveStreamPage() {
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: streams = [], isLoading, refetch } = useQuery({
    queryKey: ["live-streams-real"],
    queryFn: async (): Promise<LiveStream[]> => {
      const { data: rows } = await (supabase as any)
        .from("live_streams")
        .select("id, user_id, title, topic, viewer_count, like_count, status, started_at, host_name, host_avatar")
        .in("status", ["live", "scheduled"])
        .order("started_at", { ascending: false })
        .limit(50);
      if (!rows?.length) return [];

      // Resolve missing host names from profiles
      const missing = (rows as any[]).filter((r) => !r.host_name).map((r) => r.user_id);
      const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (missing.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", missing);
        for (const p of (profs ?? []) as any[]) profileMap.set(p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url });
      }

      return (rows as any[]).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title || "Live Stream",
        topic: r.topic || "General",
        viewer_count: r.viewer_count ?? 0,
        like_count: r.like_count ?? 0,
        status: (r.status === "live" ? "live" : r.status === "scheduled" ? "scheduled" : "ended") as LiveStream["status"],
        started_at: r.started_at,
        host_name: r.host_name || profileMap.get(r.user_id)?.full_name || "Creator",
        host_avatar: r.host_avatar || profileMap.get(r.user_id)?.avatar_url || null,
      }));
    },
    staleTime: 15_000,
    gcTime: 60_000,
  });

  // Realtime: refetch when any stream changes
  useEffect(() => {
    const ch = supabase
      .channel("live-streams-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  const filteredStreams = streams.filter((s) => {
    if (filter === "live" && s.status !== "live") return false;
    if (filter === "scheduled" && s.status !== "scheduled") return false;
    if (
      searchQuery &&
      !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.host_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const liveCount = streams.filter((s) => s.status === "live").length;
  const handleGoLive = () => navigate("/go-live");

  if (activeStream) {
    return <LiveWatcher stream={activeStream} onLeave={() => setActiveStream(null)} />;
  }

  const topicPhotos: Record<string, string> = {
    Music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=70&auto=format&fit=crop",
    Gaming: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=70&auto=format&fit=crop",
    Cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=70&auto=format&fit=crop",
    Fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=70&auto=format&fit=crop",
    Art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=70&auto=format&fit=crop",
    Travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=70&auto=format&fit=crop",
    Tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70&auto=format&fit=crop",
    Fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=70&auto=format&fit=crop",
    Comedy: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=70&auto=format&fit=crop",
    Education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=70&auto=format&fit=crop",
    Sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=70&auto=format&fit=crop",
    General: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=70&auto=format&fit=crop",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30" style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 0.5rem), 0.5rem)" }}>
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

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {(["all", "live", "scheduled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors",
                filter === f ? "bg-red-500 text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {f === "all" ? "All" : f === "live" ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live{liveCount > 0 ? ` (${liveCount})` : ""}
                </span>
              ) : "Scheduled"}
            </button>
          ))}
        </div>
      </div>

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
          filteredStreams.map((stream, i) => {
            const photo = topicPhotos[stream.topic] || topicPhotos.General;
            return (
              <motion.div key={stream.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <button
                  onClick={() => {
                    if (stream.status === "ended") { toast.info("This stream has ended"); return; }
                    setActiveStream(stream);
                  }}
                  className="w-full text-left bg-card rounded-2xl border border-border/30 overflow-hidden hover:border-red-500/30 transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img src={photo} alt={stream.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
                    {stream.status === "live" && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-[10px] gap-1 animate-pulse shadow-lg">
                        <Radio className="h-2.5 w-2.5" /> LIVE
                      </Badge>
                    )}
                    {stream.status === "live" && stream.viewer_count >= 1000 && (
                      <Badge className="absolute top-3 left-[68px] bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-[10px] gap-0.5 shadow-lg">
                        <Flame className="h-2.5 w-2.5" /> Hot
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 pr-20">
                      <h3 className="font-bold text-white text-sm truncate drop-shadow-lg">{stream.title}</h3>
                      <p className="text-[11px] text-white/80 truncate drop-shadow">{stream.topic}</p>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                      <Eye className="h-3 w-3 text-white/80" />
                      <span className="text-[11px] text-white font-semibold">{stream.viewer_count.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-red-500/30">
                      <AvatarImage src={stream.host_avatar || undefined} />
                      <AvatarFallback className="bg-red-500/10 text-red-500 text-xs font-bold">{stream.host_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm truncate">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{stream.host_name} · {stream.topic}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      <Suspense fallback={null}>
        <ZivoMobileNav />
      </Suspense>
    </div>
  );
}
