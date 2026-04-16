/**
 * LiveStreamPage — Browse and watch live streams
 * Full-screen immersive watcher experience with gifts, reactions & engagement
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useGiftAnimationQueue } from "@/hooks/useGiftAnimationQueue";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Radio from "lucide-react/dist/esm/icons/radio";
import Users from "lucide-react/dist/esm/icons/users";
import Eye from "lucide-react/dist/esm/icons/eye";
import Heart from "lucide-react/dist/esm/icons/heart";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Send from "lucide-react/dist/esm/icons/send";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Wifi from "lucide-react/dist/esm/icons/wifi";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off";
import Gift from "lucide-react/dist/esm/icons/gift";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import X from "lucide-react/dist/esm/icons/x";
import Crown from "lucide-react/dist/esm/icons/crown";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import Clapperboard from "lucide-react/dist/esm/icons/clapperboard";
import Flame from "lucide-react/dist/esm/icons/flame";
import Star from "lucide-react/dist/esm/icons/star";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import ThumbsUp from "lucide-react/dist/esm/icons/thumbs-up";
import Laugh from "lucide-react/dist/esm/icons/laugh";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Medal from "lucide-react/dist/esm/icons/medal";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { lazy, Suspense } from "react";
const ZivoMobileNav = lazy(() => import("@/components/app/ZivoMobileNav"));
const GiftAnimationOverlay = lazy(() => import("@/components/live/GiftAnimationOverlay"));
const CoinRechargeSheet = lazy(() => import("@/components/live/CoinRechargeSheet"));
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { giftImages, preloadGiftImages } from "@/config/giftIcons";
import { hasGiftVideo, giftAnimationVideos, preloadGiftAnimations } from "@/config/giftAnimations";
import { giftCatalog, getLevelColor, getLevelBg, type GiftItem } from "@/config/giftCatalog";
import { playGiftSound, playPremiumGiftSound, playLegendaryGiftSound } from "@/utils/giftSounds";
import { ReactionIcon, StreamTopicIcon } from "@/utils/reactionIcons";

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

/* ─────────── Watcher Component ─────────── */
function LiveWatcher({ stream, onLeave }: { stream: LiveStream; onLeave: () => void }) {
  // Preload gift video URLs in background when entering live stream
  useEffect(() => { preloadGiftAnimations(); preloadGiftImages(); }, []);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; isGift?: boolean; isSystem?: boolean; avatar?: string; level?: number; giftIcon?: string }[]>([
    { id: "sys-1", user: "System", text: `Welcome to ${stream.host_name}'s stream!`, isSystem: true },
  ]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [giftQty, setGiftQty] = useState(1);
  const [giftTab, setGiftTab] = useState<"gifts" | "interactive" | "exclusive">("gifts");
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [viewerCount, setViewerCount] = useState(stream.viewer_count || Math.floor(Math.random() * 500) + 50);
  const [likes, setLikes] = useState(0);
  const [muted, setMuted] = useState(false);
  const [giftNotifQueue, setGiftNotifQueue] = useState<{ id: string; sender: string; giftName: string; coins: number; icon: string }[]>([]);
  const [topGifters, setTopGifters] = useState<{ name: string; coins: number }[]>([
    { name: "Luna", coins: 520 },
    { name: "Kai", coins: 310 },
    { name: "Mia", coins: 180 },
  ]);
  const [elapsed, setElapsed] = useState(0);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [superChatMsg, setSuperChatMsg] = useState<{ id: string; user: string; text: string; coins: number } | null>(null);
  const [showViewerList, setShowViewerList] = useState(false);
  // ── Gift-sent flyout ──
  const [sentGiftFlyout, setSentGiftFlyout] = useState<{ id: string; giftName: string; coins: number; qty: number; combo: number; tier: number } | null>(null);
  // ── Gift animation overlay for premium gifts ──
  const { activeGift: activeGiftAnim, comboCount: giftCombo, enqueue: enqueueGiftAnim, onComplete: onGiftAnimComplete } = useGiftAnimationQueue();
  // ── Coin balance & recharge ──
  const [coinBalance, setCoinBalance] = useState(1250);
  // ── My level — increases when sending gifts ──
  const [myLevel, setMyLevel] = useState(1);
  const [myTotalCoinsGifted, setMyTotalCoinsGifted] = useState(0);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  // ── Combo multiplier text ──
  const [comboMultiplierText, setComboMultiplierText] = useState<{ text: string; id: string } | null>(null);
  // ── Recent gifts ──
  const [recentGifts, setRecentGifts] = useState<GiftItem[]>([]);
  const lastGiftRef = useRef<{ name: string; time: number }>({ name: "", time: 0 });
  // ── Active Poll (from host) ──
  const [activePoll, setActivePoll] = useState<{ question: string; options: string[]; votes: number[]; totalVotes: number; voted: number | null } | null>(null);
  const [fakeViewers] = useState(() => [
    { name: "Luna", level: 28, badge: "Top Fan" },
    { name: "Kai", level: 15, badge: null },
    { name: "Mia", level: 22, badge: "Top Fan" },
    { name: "Nora", level: 8, badge: null },
    { name: "Zara", level: 45, badge: "VIP" },
    { name: "Leo", level: 12, badge: null },
    { name: "Aria", level: 33, badge: null },
    { name: "Alex", level: 6, badge: null },
    { name: "Jordan", level: 19, badge: null },
    { name: "Sam", level: 10, badge: null },
    { name: "Taylor", level: 4, badge: null },
    { name: "Morgan", level: 7, badge: null },
  ]);
  // ── NEW: Host level (derived from top gifter coins) ──
  const hostLevel = useMemo(() => Math.min(99, Math.floor(topGifters.reduce((a, b) => a + b.coins, 0) / 20) + 1), [topGifters]);
  const lastTapRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pinnedMessage = useMemo(() => `Welcome to ${stream.host_name}'s stream! Be respectful and have fun!`, [stream.host_name]);
  const quickReactions = useMemo(() => ["heart", "fire", "star", "clap", "laugh"], []);

  const allGifts = useMemo(() => giftCatalog, []);

  const fakeViewerNames = useMemo(() => ["Luna", "Kai", "Mia", "Nora", "Zara", "Leo", "Aria", "Alex", "Jordan", "Sam"], []);

  // Simulate chat messages + viewer joins
  useEffect(() => {
    const msgs = [
      "Hi everyone!", "Love this stream!", "Love this!", "You're amazing!",
      "First time here!", "Let's gooo!", "So cool!", "Where are you from?",
      "Can you do a shoutout?", "This is fire!", "Following!", "Best stream ever",
    ];
    const chatInterval = setInterval(() => {
      const name = fakeViewerNames[Math.floor(Math.random() * fakeViewerNames.length)];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const level = Math.floor(Math.random() * 30) + 1;
      setChatMessages(prev => [...prev.slice(-30), {
        id: Date.now().toString(),
        user: name,
        text: msg,
        level,
      }]);
    }, 2500 + Math.random() * 3000);

    // Viewer join notifications
    const joinInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const joiner = fakeViewerNames[Math.floor(Math.random() * fakeViewerNames.length)];
        setChatMessages(prev => [...prev.slice(-30), {
          id: `join-${Date.now()}`,
          user: joiner,
          text: "joined the stream",
          isSystem: true,
        }]);
      }
    }, 6000 + Math.random() * 4000);

    return () => { clearInterval(chatInterval); clearInterval(joinInterval); };
  }, [fakeViewerNames]);

  // Simulate viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + (Math.random() > 0.4 ? 1 : -1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Stream elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate gift notifications from other viewers
  useEffect(() => {
    const allPool = [...allGifts.gifts, ...allGifts.interactive.slice(0, 3)];
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const sender = fakeViewerNames[Math.floor(Math.random() * fakeViewerNames.length)];
        const gift = allPool[Math.floor(Math.random() * allPool.length)];
        const notif = { id: Date.now().toString(), sender, giftName: gift.name, coins: gift.coins, icon: gift.icon };
        setGiftNotifQueue(prev => [...prev.slice(-2), notif]);
        // Play tier-appropriate sound for simulated gifts
        if (gift.coins >= 20000) {
          playLegendaryGiftSound();
        } else if (gift.coins >= 500) {
          playPremiumGiftSound();
        } else {
          playGiftSound(1, gift.coins);
        }
        // Trigger premium animation for high-value simulated gifts (rare)
        if (hasGiftVideo(gift.name) && Math.random() < 0.5) {
          enqueueGiftAnim({ name: gift.name, coins: gift.coins, senderName: sender });
          setShowGiftPanel(false);
          setSelectedGift(null);
        }
        // Update top gifters
        setTopGifters(prev => {
          const existing = prev.find(g => g.name === sender);
          if (existing) {
            return prev.map(g => g.name === sender ? { ...g, coins: g.coins + gift.coins } : g).sort((a, b) => b.coins - a.coins);
          }
          return [...prev, { name: sender, coins: gift.coins }].sort((a, b) => b.coins - a.coins).slice(0, 5);
        });
        // Add to chat
        setChatMessages(prev => [...prev.slice(-30), {
          id: `vgift-${Date.now()}`,
          user: sender,
          text: `sent ${gift.name}`,
          isGift: true,
          level: Math.floor(Math.random() * 20) + 1,
          giftIcon: giftImages[gift.name],
        }]);
        setTimeout(() => {
          setGiftNotifQueue(prev => prev.filter(n => n.id !== notif.id));
        }, 4000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fakeViewerNames, allGifts]);

  // Simulate super chats from viewers
  useEffect(() => {
    const superChatMsgs = ["Love this stream!", "Keep going!", "You're the best!", "Shoutout please!", "Amazing content!"];
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        const user = fakeViewerNames[Math.floor(Math.random() * fakeViewerNames.length)];
        const text = superChatMsgs[Math.floor(Math.random() * superChatMsgs.length)];
        const coins = [50, 100, 200, 500][Math.floor(Math.random() * 4)];
        setSuperChatMsg({ id: `sc-${Date.now()}`, user, text, coins });
        setTimeout(() => setSuperChatMsg(null), 5000);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [fakeViewerNames]);


  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), user: "You", text: chatInput, level: myLevel }]);
    setChatInput("");
  }, [chatInput]);

  const sendReaction = useCallback((emoji: string) => {
    const id = Date.now().toString() + Math.random();
    const x = 60 + Math.random() * 30;
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);
    setLikes(prev => prev + 1);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2200);
  }, []);

  const sendGift = useCallback(() => {
    if (!selectedGift) return;
    const totalCoins = selectedGift.coins * giftQty;

    // Check balance
    if (totalCoins > coinBalance) {
      toast.error("Not enough coins!", { description: "Top up your balance to send this gift." });
      setShowRechargeSheet(true);
      return;
    }

    // Deduct coins
    setCoinBalance(prev => prev - totalCoins);

    // Level up from gifting — every 50 coins gifted = 1 level
    setMyTotalCoinsGifted(prev => {
      const newTotal = prev + totalCoins;
      const newLevel = Math.min(99, Math.floor(newTotal / 50) + 1);
      setMyLevel(newLevel);
      return newTotal;
    });

    // Haptic feedback
    try { navigator.vibrate?.(giftQty > 1 ? [50, 30, 50] : [50]); } catch {} // eslint-disable-line no-empty

    // Chat message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: "You",
      text: giftQty > 1 ? `sent ${selectedGift.name} x${giftQty}` : `sent ${selectedGift.name}`,
      isGift: true,
      level: Math.min(99, Math.floor((myTotalCoinsGifted + totalCoins) / 50) + 1),
      giftIcon: giftImages[selectedGift.name],
    }]);

    // Track recent gifts (unique, max 4)
    setRecentGifts(prev => {
      const filtered = prev.filter(g => g.name !== selectedGift.name);
      return [selectedGift, ...filtered].slice(0, 4);
    });

    // Floating reaction
    sendReaction("gift");

    // Combo tracking — same gift within 5s increments combo
    const now = Date.now();
    let newCombo = 1;
    if (lastGiftRef.current.name === selectedGift.name && now - lastGiftRef.current.time < 5000) {
      newCombo = giftCombo + 1;
    }
    lastGiftRef.current = { name: selectedGift.name, time: now };

    // Combo Multiplier Visual
    if (newCombo >= 2) {
      const comboLabels = ["", "", "COMBO x2", "COMBO x3", "COMBO x4", "MEGA x5", "ULTRA x6", "SUPREME x7"];
      const label = newCombo < comboLabels.length ? comboLabels[newCombo] : `GODLIKE x${newCombo}`;
      setComboMultiplierText({ text: label, id: `combo-${now}` });
      setTimeout(() => setComboMultiplierText(null), 2500);
    }

    // Gift-sent flyout — skip when full-screen video animation will play (it has its own banner)
    const hasVideoAnim = Boolean(hasGiftVideo(selectedGift.name));
    if (!hasVideoAnim) {
      const flyoutId = `sent-${Date.now()}`;
      const effectiveTier = Math.max(giftQty, newCombo * giftQty);
      setSentGiftFlyout({ id: flyoutId, giftName: selectedGift.name, coins: totalCoins, qty: giftQty, combo: newCombo, tier: effectiveTier });
      setTimeout(() => setSentGiftFlyout(cur => cur?.id === flyoutId ? null : cur), 2500);
    }

    // Play sound
    if (selectedGift.coins >= 20000) {
      playLegendaryGiftSound();
    } else if (hasGiftVideo(selectedGift.name)) {
      playPremiumGiftSound();
    } else {
      playGiftSound(newCombo, selectedGift.coins);
    }

    // Trigger premium animation for gifts with video — auto-close panel for immersive experience
    if (hasGiftVideo(selectedGift.name)) {
      enqueueGiftAnim({ name: selectedGift.name, coins: totalCoins, senderName: "You", combo: newCombo });
      setShowGiftPanel(false);
      setSelectedGift(null);
    }

    // Update top gifters
    setTopGifters(prev => {
      const existing = prev.find(g => g.name === "You");
      if (existing) {
        return prev.map(g => g.name === "You" ? { ...g, coins: g.coins + totalCoins } : g).sort((a, b) => b.coins - a.coins);
      }
      return [...prev, { name: "You", coins: totalCoins }].sort((a, b) => b.coins - a.coins).slice(0, 5);
    });

    setGiftQty(1);
    // Keep gift panel open — user closes manually via X
  }, [selectedGift, giftQty, giftCombo, sendReaction, coinBalance, enqueueGiftAnim]);

  const votePoll = useCallback((optIndex: number) => {
    setActivePoll(prev => {
      if (!prev || prev.voted !== null) return prev;
      const newVotes = [...prev.votes];
      newVotes[optIndex] += 1;
      return { ...prev, votes: newVotes, totalVotes: prev.totalVotes + 1, voted: optIndex };
    });
    toast.success("Vote submitted!");
  }, []);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : `Following ${stream.host_name}!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: stream.title, text: `Watch ${stream.host_name} live on ZIVO!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return "from-amber-400 to-yellow-500";
    if (level >= 10) return "from-violet-400 to-purple-500";
    if (level >= 5) return "from-sky-400 to-blue-500";
    return "from-zinc-400 to-zinc-500";
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDoubleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.width / 2 : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.height / 2 : (e as React.MouseEvent).clientY;
      const heart = { id: Date.now().toString(), x: clientX - rect.left, y: clientY - rect.top };
      setDoubleTapHeart(heart);
      sendReaction("heart");
      setTimeout(() => setDoubleTapHeart(null), 1000);
    }
    lastTapRef.current = now;
  }, [sendReaction]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Full-screen video background — double tap to like */}
      <div className="absolute inset-0" onClick={handleDoubleTap} onTouchEnd={handleDoubleTap}>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-black to-rose-900/60" />
        <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-primary/15 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 select-none">
          <StreamTopicIcon topic={stream.thumbnail_emoji} className="h-32 w-32" />
        </div>
        {/* Double-tap heart animation */}
        <AnimatePresence>
          {doubleTapHeart && (
            <motion.div
              key={doubleTapHeart.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0, y: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute text-5xl pointer-events-none z-40"
              style={{ left: doubleTapHeart.x - 24, top: doubleTapHeart.y - 24 }}
            >
              <Heart className="h-12 w-12 text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Top bar (overlay) ── */}
      <div className="relative z-20 flex items-center gap-2 px-3 pt-2" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}>
        {/* Host info pill */}
        <button onClick={onLeave} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="h-8 w-8 border-2 border-red-500 shrink-0">
              <AvatarImage src={stream.host_avatar || undefined} />
              <AvatarFallback className="bg-red-500/20 text-red-400 text-xs font-bold">
                {stream.host_name[0]}
              </AvatarFallback>
            </Avatar>
            {/* Host Level Badge */}
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 text-[6px] font-bold px-1 py-0.5 rounded-full border",
              hostLevel >= 30 ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-amber-300/50" :
              hostLevel >= 15 ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-blue-300/50" :
              "bg-white/20 text-white/80 border-white/20"
            )}>
              {hostLevel}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">{stream.host_name}</p>
            <p className="text-white/50 text-[10px] leading-tight">{stream.topic}</p>
          </div>
          <button
            onClick={handleFollow}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
              isFollowing
                ? "bg-white/10 text-white/70"
                : "bg-red-500 text-white"
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Viewer count */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Eye className="h-3 w-3 text-white/70" />
          <span className="text-[11px] text-white font-medium">{viewerCount.toLocaleString()}</span>
        </div>
      </div>

      {/* LIVE badge + stream title + duration */}
      <div className="relative z-10 px-4 mt-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 text-white border-0 text-[10px] gap-1 px-2 py-0.5 animate-pulse">
            <Radio className="h-2.5 w-2.5" /> LIVE
          </Badge>
          <p className="text-white/80 text-xs font-medium truncate flex-1">{stream.title}</p>
          <span className="text-white/50 text-[10px] font-mono">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* ── Top Gifters Mini-Widget ── */}
      {topGifters.length > 0 && (
        <div className="relative z-10 px-4 mt-1.5">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 w-fit">
            <Crown className="h-3 w-3 text-amber-400" />
            {topGifters.slice(0, 3).map((g, i) => (
              <div key={g.name} className="flex items-center gap-0.5">
                <Medal className={cn("h-3 w-3", i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : "text-orange-400")} />
                <span className="text-[9px] text-white/70 truncate max-w-[50px]">{g.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pinned Message ── */}
      <div className="relative z-10 px-3 mt-1.5">
        <div className="flex items-center gap-1.5 bg-primary/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5 max-w-[90%]">
          <span className="text-[9px] font-bold bg-primary/30 text-primary px-1 py-0.5 rounded shrink-0">PINNED</span>
          <p className="text-[10px] text-white/80 line-clamp-2">{pinnedMessage}</p>
        </div>
      </div>

      {/* ── Gift notifications (left side, gold gradient like streamer) ── */}
      <div className="absolute left-2 z-30 flex flex-col gap-2 items-start w-[200px]" style={{ top: "calc(env(safe-area-inset-top, 0px) + 100px)" }}>
        <AnimatePresence>
          {giftNotifQueue.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ x: -200, opacity: 0, scale: 0.7 }}
              animate={{ x: 0, opacity: idx === 0 ? 1 : 0.7 - idx * 0.15, scale: idx === 0 ? 1 : 0.92 - idx * 0.04 }}
              exit={{ x: -200, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 18, stiffness: 220 }}
              className="w-full"
            >
              <div
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl"
                style={{
                  background: idx === 0
                    ? "linear-gradient(260deg, rgba(120,80,10,0.9) 0%, rgba(180,130,30,0.75) 50%, rgba(220,170,50,0.45) 90%, transparent 100%)"
                    : "linear-gradient(260deg, rgba(80,60,10,0.7) 0%, rgba(140,100,20,0.5) 60%, transparent 100%)",
                  backdropFilter: "blur(10px)",
                  boxShadow: idx === 0 ? "0 4px 20px rgba(255,170,0,0.3)" : "0 2px 10px rgba(255,170,0,0.1)",
                  border: "1px solid rgba(255,200,80,0.15)",
                }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0 ring-1 ring-amber-300/30">
                  {notif.sender[0]}
                </div>
                {giftImages[notif.giftName] && (
                  <motion.img
                    src={giftImages[notif.giftName]}
                    alt=""
                    className="w-6 h-6 object-contain -ml-2 mb-[-4px] relative z-10"
                    style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-[10px] font-bold truncate leading-tight">{notif.sender}</p>
                  <p className="text-amber-100/70 text-[9px] leading-tight">sent <span className="text-white font-semibold">{notif.giftName}</span></p>
                </div>
                <div className="flex items-center gap-0.5 bg-black/30 rounded-full px-1.5 py-0.5 shrink-0">
                  <img src={goldCoinIcon} alt="" className="w-2.5 h-2.5" />
                  <span className="text-amber-200 text-[9px] font-bold">{notif.coins.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Floating reactions ── */}
      <div className="absolute right-4 bottom-48 z-30 w-14 pointer-events-none">
        <AnimatePresence>
          {floatingReactions.map((r, i) => {
            const randomScale = 0.8 + Math.random() * 0.8;
            const randomDrift = (Math.random() - 0.5) * 50;
            const randomDur = 1.8 + Math.random() * 1.2;
            return (
              <motion.div
                key={r.id}
                initial={{ y: 0, opacity: 1, scale: 0.3, rotate: -15 + Math.random() * 30 }}
                animate={{
                  y: -220 - Math.random() * 80,
                  opacity: [1, 1, 0.8, 0],
                  scale: [0.3, randomScale, randomScale * 0.9, randomScale * 0.5],
                  x: [0, randomDrift * 0.3, randomDrift],
                  rotate: [0, -10 + Math.random() * 20],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: randomDur, ease: "easeOut" }}
                className="absolute bottom-0 text-2xl"
                style={{ left: `${r.x - 60}%` }}
              >
                <ReactionIcon name={r.emoji} className="h-6 w-6" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Right sidebar actions (TikTok Live style) ── */}
      <div className="absolute right-3 z-20 flex flex-col gap-2.5 items-center" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 160px)" }}>
        {/* Mute */}
        <button onClick={() => setMuted(!muted)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          {muted ? <VolumeX className="h-4 w-4 text-white/70" /> : <Volume2 className="h-4 w-4 text-white/70" />}
        </button>
        {/* Share */}
        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Share2 className="h-4 w-4 text-white" />
        </button>
        {/* Ranking / Leaderboard */}
        <button
          onClick={() => setShowRanking(!showRanking)}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-[7px] text-amber-300 -mt-0.5">Rank</span>
        </button>
        {/* Heart / Like */}
        <button
          onClick={() => sendReaction("heart")}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <Heart className="h-4 w-4 text-red-400 fill-red-400" />
          {likes > 0 && <span className="text-[8px] text-white/60 -mt-0.5">{likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>}
        </button>
        {/* Viewer list */}
        <button
          onClick={() => setShowViewerList(!showViewerList)}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <Users className="h-4 w-4 text-white/70" />
          <span className="text-[7px] text-white/50 -mt-0.5">{viewerCount > 999 ? `${(viewerCount / 1000).toFixed(1)}k` : viewerCount}</span>
        </button>
        {/* Gift (large, primary CTA) */}
        <button
          onClick={() => setShowGiftPanel(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse"
        >
          <Gift className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* ── Viewer List Panel ── */}
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
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-white/70" />
                <span className="text-xs font-bold text-white">Viewers</span>
                <span className="text-[9px] text-white/40 bg-white/10 rounded-full px-1.5">{viewerCount}</span>
              </div>
              <button onClick={() => setShowViewerList(false)} className="text-white/40">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-2 space-y-0.5 max-h-[250px] overflow-y-auto scrollbar-hide">
              {fakeViewers.slice(0, Math.min(fakeViewers.length, 12)).map((v) => (
                <div key={v.name} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                    {v.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-white font-medium truncate block">{v.name}</span>
                  </div>
                  <span className={cn(
                    "text-[8px] px-1 py-0.5 rounded font-bold bg-gradient-to-r text-white shrink-0",
                    v.level >= 20 ? "from-amber-400 to-yellow-500" : v.level >= 10 ? "from-violet-400 to-purple-500" : "from-zinc-400 to-zinc-500"
                  )}>Lv.{v.level}</span>
                  {v.badge && (
                    <span className="text-[7px] text-amber-300 font-bold shrink-0">{v.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ranking/Leaderboard Panel ── */}
      <AnimatePresence>
        {showRanking && (
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute right-2 z-40 w-52 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">Top Gifters</span>
              </div>
              <button onClick={() => setShowRanking(false)} className="text-white/40">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {topGifters.length === 0 ? (
                <p className="text-[10px] text-white/40 text-center py-3">No gifts yet — be the first!</p>
              ) : (
                topGifters.map((g, i) => (
                  <div key={g.name} className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl",
                    i === 0 ? "bg-amber-500/15" : "bg-white/5"
                  )}>
                    <Medal className={cn("h-4 w-4", i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : "text-orange-400")} />
                    <span className="text-[11px] text-white font-medium flex-1 truncate">{g.name}</span>
                    <div className="flex items-center gap-0.5">
                      <img src={goldCoinIcon} alt="" className="w-3 h-3" />
                      <span className="text-[10px] text-amber-300 font-bold">{g.coins.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Viewer's own rank hint */}
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <p className="text-[9px] text-white/40 text-center">Send gifts to climb the rankings!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Super Chat floating ── */}
      <AnimatePresence>
        {superChatMsg && (
          <motion.div
            key={superChatMsg.id}
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute left-3 right-16 z-30 bg-gradient-to-r from-amber-500/30 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl px-3 py-2"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 160px)" }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-bold bg-amber-500/40 text-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" /> SUPER CHAT</span>
              <span className="text-[10px] text-amber-300 font-bold">{superChatMsg.user}</span>
              <div className="flex items-center gap-0.5 ml-auto">
                <img src={goldCoinIcon} alt="" className="w-3 h-3" />
                <span className="text-[9px] text-amber-300 font-bold">{superChatMsg.coins}</span>
              </div>
            </div>
            <p className="text-[11px] text-white">{superChatMsg.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat overlay (bottom-left) ── */}
      <div className="absolute left-0 right-16 z-20" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)" }}>
        {/* Poll widget for voting */}
        <AnimatePresence>
          {activePoll && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="px-3 mb-2"
            >
              <div className="bg-zinc-950/80 backdrop-blur-xl rounded-2xl p-3.5 border border-blue-500/15 shadow-lg shadow-blue-500/5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      className="text-[10px] font-black text-blue-400 uppercase tracking-wider bg-blue-500/10 rounded-full px-2 py-0.5 border border-blue-500/20"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      POLL
                    </motion.span>
                  </div>
                  <span className="text-[9px] text-white/30 font-medium">{activePoll.totalVotes} votes</span>
                </div>
                <p className="text-white text-[13px] font-semibold mb-3">{activePoll.question}</p>
                <div className="space-y-2">
                  {activePoll.options.map((opt, i) => {
                    const pct = activePoll.totalVotes > 0 ? Math.round((activePoll.votes[i] / activePoll.totalVotes) * 100) : 0;
                    const isVoted = activePoll.voted === i;
                    const isWinning = pct === Math.max(...activePoll.votes.map((v, vi) => activePoll.totalVotes > 0 ? Math.round((v / activePoll.totalVotes) * 100) : 0));
                    return (
                      <button
                        key={i}
                        onClick={() => votePoll(i)}
                        disabled={activePoll.voted !== null}
                        className="relative w-full text-left group"
                      >
                        <div className={cn(
                          "h-8 rounded-xl overflow-hidden border transition-all",
                          isVoted ? "border-blue-400/40 bg-blue-500/10 shadow-sm shadow-blue-500/10" :
                          "border-white/8 bg-white/5 hover:bg-white/8"
                        )}>
                          <motion.div
                            className={cn(
                              "h-full rounded-xl",
                              isWinning && activePoll.voted !== null ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/20" : "bg-blue-500/20"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: "spring", damping: 20, delay: i * 0.05 }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className={cn("text-[11px] font-medium", isVoted ? "text-white" : "text-white/70")}>{opt}</span>
                          <span className={cn("text-[10px] font-bold tabular-nums", isVoted ? "text-blue-300" : "text-white/40")}>{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {activePoll.voted !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] text-blue-300/40 text-center mt-2"
                  >
                    ✓ Voted for "{activePoll.options[activePoll.voted]}"
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages — improved staggered animations */}
        <div className="pl-3 pr-16 max-h-[180px] overflow-y-auto scrollbar-hide space-y-2 mask-gradient-top flex flex-col items-start">
          {chatMessages.slice(-8).map((msg, idx) => {
            const isJoin = msg.isSystem && msg.text.includes("joined");
            const isTopFan = topGifters.length > 0 && msg.user === topGifters[0].name;
            const isMe = msg.user === "You";
            const lv = msg.level || 0;

            // Tier-driven color palette
            const tier = lv >= 60 ? "legendary" : lv >= 40 ? "mythic" : lv >= 30 ? "epic" : lv >= 20 ? "rare" : lv >= 10 ? "uncommon" : "common";
            const tierColors = {
              legendary: { 
                bg: "linear-gradient(110deg, rgba(180,120,0,0.55) 0%, rgba(120,60,0,0.4) 50%, rgba(80,30,0,0.3) 100%)",
                border: "rgba(255,200,50,0.4)", avatarBg: "linear-gradient(135deg, #D4A020, #B8860B)", 
                badgeBg: "linear-gradient(135deg, #FFD700, #FFA500)", badgeText: "#1a0800", badgeShadow: "0 0 8px rgba(255,200,0,0.5)",
                nameColor: "#FFD700", ring: "rgba(255,200,50,0.35)",
              },
              mythic: { 
                bg: "linear-gradient(110deg, rgba(160,40,60,0.5) 0%, rgba(100,20,40,0.35) 50%, rgba(60,10,30,0.25) 100%)",
                border: "rgba(255,100,120,0.3)", avatarBg: "linear-gradient(135deg, #E8475F, #C0392B)",
                badgeBg: "linear-gradient(135deg, #FF6B7F, #E8475F)", badgeText: "#1a0008", badgeShadow: "0 0 6px rgba(255,100,120,0.4)",
                nameColor: "#FF9EAB", ring: "rgba(255,100,120,0.25)",
              },
              epic: { 
                bg: "linear-gradient(110deg, rgba(90,40,160,0.45) 0%, rgba(60,20,120,0.3) 50%, rgba(40,10,80,0.2) 100%)",
                border: "rgba(167,139,250,0.3)", avatarBg: "linear-gradient(135deg, #9B59B6, #7D3C98)",
                badgeBg: "linear-gradient(135deg, #A78BFA, #8B5CF6)", badgeText: "#0a0020", badgeShadow: "0 0 6px rgba(167,139,250,0.4)",
                nameColor: "#C4B5FD", ring: "rgba(167,139,250,0.2)",
              },
              rare: { 
                bg: "linear-gradient(110deg, rgba(30,80,160,0.4) 0%, rgba(20,50,120,0.28) 50%, rgba(10,30,80,0.18) 100%)",
                border: "rgba(96,165,250,0.25)", avatarBg: "linear-gradient(135deg, #3B82F6, #2563EB)",
                badgeBg: "linear-gradient(135deg, #60A5FA, #3B82F6)", badgeText: "#001030", badgeShadow: "0 0 5px rgba(96,165,250,0.3)",
                nameColor: "#93C5FD", ring: "",
              },
              uncommon: { 
                bg: "linear-gradient(110deg, rgba(20,100,60,0.35) 0%, rgba(10,70,40,0.22) 50%, rgba(5,40,25,0.14) 100%)",
                border: "rgba(74,222,128,0.2)", avatarBg: "linear-gradient(135deg, #22C55E, #16A34A)",
                badgeBg: "linear-gradient(135deg, #4ADE80, #22C55E)", badgeText: "#002010", badgeShadow: "",
                nameColor: "#86EFAC", ring: "",
              },
              common: { 
                bg: "linear-gradient(110deg, rgba(40,40,50,0.5) 0%, rgba(30,30,38,0.4) 100%)",
                border: "rgba(255,255,255,0.06)", avatarBg: "linear-gradient(135deg, #555, #444)",
                badgeBg: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))", badgeText: "#aaa", badgeShadow: "",
                nameColor: "rgba(255,255,255,0.7)", ring: "",
              },
            };
            const tc = tierColors[tier];

            if (msg.isSystem) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-white/30 italic pl-1"
                >
                  <span className="text-white/50 font-medium">{msg.user}</span> {msg.text}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -24, y: 6 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 300, delay: idx * 0.015 }}
                className="relative w-fit max-w-[88%] sm:max-w-[320px] rounded-[18px]"
                style={{
                  background: msg.isGift
                    ? "linear-gradient(110deg, rgba(180,120,0,0.5) 0%, rgba(120,60,0,0.35) 50%, rgba(60,30,0,0.2) 100%)"
                    : tc.bg,
                  border: `1px solid ${msg.isGift ? "rgba(255,200,50,0.35)" : tc.border}`,
                  boxShadow: lv >= 30
                    ? `inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.3)`
                    : lv >= 10
                    ? `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.15)`
                    : undefined,
                }}
              >
                {/* Shine sweep for 30+ */}
                {lv >= 30 && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    initial={{ x: "-100%" }}
                    animate={{ x: "250%" }}
                    transition={{ duration: 2, delay: 1 + idx * 0.15, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 52%, transparent 60%)",
                      width: "35%",
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2 px-2.5 py-[5px]">
                  {/* Avatar — 3D gradient per tier */}
                  <div className="relative shrink-0">
                    <div
                      className="h-[22px] w-[22px] rounded-full flex items-center justify-center"
                      style={{
                        background: msg.isGift ? "linear-gradient(135deg, #D4A020, #B8860B)" : tc.avatarBg,
                        boxShadow: lv >= 20 ? `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)` : `0 1px 4px rgba(0,0,0,0.3)`,
                      }}
                    >
                      <span className="text-[8px] text-white font-bold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{msg.user[0]}</span>
                    </div>
                    {/* Glow ring for high tiers */}
                    {tc.ring && (
                      <div className="absolute inset-[-3px] rounded-full animate-pulse" style={{ border: `1.5px solid ${tc.ring}` }} />
                    )}
                  </div>

                  <div className="min-w-0 flex flex-wrap items-center gap-x-[6px] gap-y-[2px] flex-1">
                    {/* Level badge — 3D embossed pill */}
                    <span
                      className="text-[7px] font-black px-[6px] py-[2px] rounded-full shrink-0 tracking-wider"
                      style={{
                        background: msg.isGift ? "linear-gradient(135deg, #FFD700, #FFA500)" : tc.badgeBg,
                        color: msg.isGift ? "#1a0800" : tc.badgeText,
                        boxShadow: tc.badgeShadow
                          ? `${tc.badgeShadow}, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)`
                          : "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.1)",
                        textShadow: lv >= 20 ? "0 1px 0 rgba(255,255,255,0.2)" : undefined,
                      }}
                    >
                      Lv.{lv || 1}
                    </span>

                    {/* Top Fan / VIP badges */}
                    {isTopFan && (
                      <span
                        className="text-[7px] font-bold px-[6px] py-[2px] rounded-full shrink-0 flex items-center gap-[2px]"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,200,50,0.5), rgba(255,160,0,0.35))",
                          color: "#FFF3C4",
                          border: "1px solid rgba(255,200,50,0.35)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 6px rgba(255,200,0,0.3)",
                        }}
                      >
                        <Star className="h-[7px] w-[7px] fill-amber-200 text-amber-200" /> Top Fan
                      </span>
                    )}
                    {!isTopFan && lv >= 50 && (
                      <span
                        className="text-[7px] font-bold px-[6px] py-[2px] rounded-full shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,80,50,0.5), rgba(255,40,0,0.35))",
                          color: "#FFD0C0",
                          border: "1px solid rgba(255,80,50,0.3)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 6px rgba(255,80,50,0.3)",
                        }}
                      >
                        🔥 VIP
                      </span>
                    )}

                    {/* Name */}
                    <span className="text-[10px] font-bold min-w-0 break-words" style={{ color: msg.isGift ? "#FFD700" : isMe ? "#7DF9A0" : tc.nameColor, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {msg.user}
                    </span>

                    {/* Gift icon inline */}
                    {msg.isGift && msg.giftIcon && (
                      <motion.img
                        src={msg.giftIcon}
                        alt=""
                        className="h-5 w-5 object-contain shrink-0"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,200,0,0.5))" }}
                      />
                    )}

                    {/* Message text — inline with name & badges, wraps naturally */}
                    <span className={cn("text-[10px] break-words leading-[1.3]", msg.isGift ? "text-amber-200 font-medium" : "text-white/85")}>
                      {msg.text}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Quick reactions — enhanced with haptic-feel press animations */}
        <div className="flex items-center gap-1.5 px-3 mt-2">
          {quickReactions.map((key) => (
            <motion.button
              key={key}
              onClick={() => sendReaction(key)}
              whileTap={{ scale: 0.7 }}
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-sm border border-white/5 active:bg-white/10 transition-colors"
            >
              <ReactionIcon name={key} className="h-4 w-4" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Chat input bar (bottom) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 py-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              placeholder="Say something..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              className="w-full px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/10"
            />
          </div>
          <button
            onClick={() => setShowGiftPanel(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20"
          >
            <Gift className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={sendChat}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* ── Gift Panel (bottom sheet) ── */}
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
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header with coin balance */}
            <div className="overflow-hidden border-b border-white/5 py-2 px-4 flex items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-amber-500/15 rounded-full px-2.5 py-1 border border-amber-500/20">
                  <img src={goldCoinIcon} alt="coins" className="w-4 h-4" />
                  <span className="text-amber-300 text-[11px] font-bold">{coinBalance.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setShowRechargeSheet(true)}
                  className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 active:scale-90 transition-transform"
                >
                  <span className="text-amber-300 text-xs font-bold leading-none">+</span>
                </button>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-white/40 whitespace-nowrap animate-[marquee_8s_linear_infinite]">
                  Send gifts to support your favorite creators! &nbsp;&nbsp;&nbsp; Send gifts to support your favorite creators!
                </p>
              </div>
              <button onClick={() => { setShowGiftPanel(false); setSelectedGift(null); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <X className="h-3.5 w-3.5 text-white/60" />
              </button>
            </div>

            {/* Gift grid */}
            <div className="overflow-y-auto px-2 py-3" style={{ maxHeight: selectedGift ? "calc(55vh - 210px)" : "calc(55vh - 140px)" }}>
              <div className="grid grid-cols-4 gap-1.5">
                {allGifts[giftTab].map((gift) => (
                  <button
                    key={gift.name}
                    onClick={() => { setSelectedGift(selectedGift?.name === gift.name ? null : gift); setGiftQty(1); }}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl transition-all",
                      selectedGift?.name === gift.name
                        ? "bg-amber-500/15 ring-2 ring-amber-500/40 scale-105"
                        : "hover:bg-white/5 active:scale-90"
                    )}
                  >
                    {gift.badge && (
                      <span className={cn(
                        "absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded-full z-10",
                        gift.badge === "Popular" ? "bg-pink-500 text-white" :
                        gift.badge === "NEW" ? "bg-red-500 text-white" :
                        gift.badge === "Ultimate" ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white" :
                        gift.badge === "Legendary" ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white" :
                        gift.badge === "Supreme" ? "bg-gradient-to-r from-rose-500 to-red-600 text-white" :
                        gift.badge === "Luxury" ? "bg-gradient-to-r from-slate-400 to-zinc-500 text-white" :
                        "bg-blue-500/80 text-white"
                      )}>
                        {gift.badge}
                      </span>
                    )}
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

            {/* Selected gift send bar */}
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
                        <span className={cn("text-[9px] font-bold ml-1", getLevelColor(selectedGift.level))}>Lv.{selectedGift.level}</span>
                        {selectedGift.coins >= 500 && (
                          <span className="text-[9px] text-red-400 font-medium ml-1">Premium</span>
                        )}
                      </div>
                    </div>
                    {/* Quantity selector — scrollable pill strip */}
                    <div className="flex gap-1 shrink-0 overflow-x-auto max-w-[180px] no-scrollbar snap-x snap-mandatory py-0.5">
                      {[1, 3, 5, 10, 20, 33, 50, 66, 99].map((q) => (
                        <button
                          key={q}
                          onClick={() => setGiftQty(q)}
                          className={cn(
                            "min-w-[34px] h-7 rounded-full text-[10px] font-bold transition-all snap-center shrink-0 px-1.5",
                            giftQty === q
                              ? q >= 50
                                ? "bg-gradient-to-r from-red-500/40 to-rose-500/30 text-rose-200 border border-rose-400/50 shadow-sm shadow-rose-500/20"
                                : q >= 10
                                  ? "bg-gradient-to-r from-amber-500/40 to-yellow-500/30 text-amber-200 border border-amber-400/50 shadow-sm shadow-amber-500/20"
                                  : "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                          )}
                        >
                          {q}x
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={sendGift}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2.5 shadow-lg active:scale-90 transition-all shrink-0",
                        selectedGift.coins >= 500
                          ? "bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/25"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/25"
                      )}
                    >
                      <Send className="h-3.5 w-3.5 text-white" />
                      <span className="text-white text-xs font-bold">
                        {giftQty > 1 ? `x${giftQty}` : selectedGift.coins >= 500 ? "Send!" : "Send"}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom tabs */}
            <div className="flex items-center border-t border-white/10 px-2 py-2 gap-1">
              {(["gifts", "interactive", "exclusive"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setGiftTab(tab); setSelectedGift(null); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors",
                    giftTab === tab ? "text-white bg-white/10" : "text-white/40"
                  )}
                >
                  {tab === "gifts" ? "Gifts" : tab === "interactive" ? "Interactive" : "Exclusive"}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => setShowRechargeSheet(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
              >
                <img src={goldCoinIcon} alt="" className="w-4 h-4" />
                <span className="text-[11px] text-white font-bold">Recharge</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gift-sent flyout ── */}
      <AnimatePresence>
        {sentGiftFlyout && (
          <motion.div
            key={sentGiftFlyout.id}
            initial={{ x: 300, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", damping: 16, stiffness: 200 }}
            className="fixed right-3 z-[99999]"
            style={{ top: 120 }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
              style={{
                background: sentGiftFlyout.tier >= 50
                  ? "linear-gradient(135deg, rgba(239,68,68,0.95) 0%, rgba(220,38,38,0.85) 50%, rgba(185,28,28,0.7) 100%)"
                  : sentGiftFlyout.tier >= 20
                    ? "linear-gradient(135deg, rgba(245,158,11,0.95) 0%, rgba(217,119,6,0.85) 50%, rgba(180,83,9,0.7) 100%)"
                    : sentGiftFlyout.tier >= 5
                      ? "linear-gradient(135deg, rgba(168,85,247,0.95) 0%, rgba(139,92,246,0.85) 50%, rgba(109,40,217,0.7) 100%)"
                      : sentGiftFlyout.tier >= 3
                        ? "linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.85) 50%, rgba(29,78,216,0.7) 100%)"
                        : "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.8) 50%, rgba(4,120,87,0.6) 100%)",
                backdropFilter: "blur(12px)",
                boxShadow: sentGiftFlyout.tier >= 50
                  ? "0 4px 24px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : sentGiftFlyout.tier >= 20
                    ? "0 4px 24px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : sentGiftFlyout.tier >= 5
                      ? "0 4px 24px rgba(168,85,247,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : sentGiftFlyout.tier >= 3
                        ? "0 4px 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "0 4px 24px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: sentGiftFlyout.tier >= 50
                  ? "1px solid rgba(239,68,68,0.4)"
                  : sentGiftFlyout.tier >= 20
                    ? "1px solid rgba(245,158,11,0.4)"
                    : sentGiftFlyout.tier >= 5
                      ? "1px solid rgba(168,85,247,0.4)"
                      : sentGiftFlyout.tier >= 3
                        ? "1px solid rgba(59,130,246,0.3)"
                        : "1px solid rgba(16,185,129,0.3)",
              }}
            >
              {giftImages[sentGiftFlyout.giftName] ? (
                <motion.img
                  src={giftImages[sentGiftFlyout.giftName]}
                  alt=""
                  className={cn("object-contain", sentGiftFlyout.tier >= 20 ? "w-10 h-10" : "w-8 h-8")}
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                  animate={sentGiftFlyout.tier >= 50
                    ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1.1, 1.25, 1] }
                    : sentGiftFlyout.tier >= 5
                      ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.05, 1.15, 1] }
                      : { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }
                  }
                  transition={{ duration: sentGiftFlyout.tier >= 20 ? 0.7 : 0.5 }}
                />
              ) : (
                <Gift className="h-6 w-6 text-amber-300" />
              )}
              <div>
                <p className="text-white text-[11px] font-bold">
                  <CheckCircle className="h-3 w-3 inline mr-0.5" />
                  {sentGiftFlyout.tier >= 50 ? " 🔥 COMBO!" : sentGiftFlyout.tier >= 20 ? " ⚡ Combo!" : sentGiftFlyout.tier >= 5 ? " 💜 Combo!" : sentGiftFlyout.tier >= 3 ? " 💙 Hit!" : " Gift Sent!"}
                  {sentGiftFlyout.combo > 1 && <span className="ml-1 text-yellow-200">x{sentGiftFlyout.combo}</span>}
                  {sentGiftFlyout.qty > 1 && <span className={cn("ml-1", sentGiftFlyout.tier >= 50 ? "text-yellow-200" : sentGiftFlyout.tier >= 20 ? "text-amber-200" : sentGiftFlyout.tier >= 5 ? "text-purple-200" : sentGiftFlyout.tier >= 3 ? "text-blue-200" : "text-emerald-200")}>×{sentGiftFlyout.qty}</span>}
                </p>
                <div className="flex items-center gap-1">
                  <img src={goldCoinIcon} alt="" className="w-3 h-3" />
                  <span className={cn("text-[10px] font-semibold", sentGiftFlyout.tier >= 50 ? "text-yellow-100" : sentGiftFlyout.tier >= 20 ? "text-amber-100" : sentGiftFlyout.tier >= 5 ? "text-purple-100" : "text-emerald-100")}>{sentGiftFlyout.coins.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Combo Multiplier Overlay ── */}
      <AnimatePresence>
        {comboMultiplierText && (
          <motion.div
            key={comboMultiplierText.id}
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 12, stiffness: 300 }}
            className="fixed left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ top: "40%" }}
          >
            <span
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400"
              style={{
                textShadow: "0 0 40px rgba(255,200,0,0.6), 0 0 80px rgba(255,150,0,0.3)",
                WebkitTextStroke: "1px rgba(255,200,80,0.3)",
              }}
            >
              {comboMultiplierText.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen gift animation overlay */}
      <GiftAnimationOverlay
        activeGift={activeGiftAnim}
        onComplete={onGiftAnimComplete}
        giftPanelOpen={showGiftPanel}
        comboCount={giftCombo}
      />

      {/* Coin Recharge Sheet */}
      <CoinRechargeSheet
        open={showRechargeSheet}
        onClose={() => setShowRechargeSheet(false)}
        currentBalance={coinBalance}
        onPurchase={(coins) => setCoinBalance(prev => prev + coins)}
      />
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function LiveStreamPage() {
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo streams shown when no DB data
  const demoStreams: LiveStream[] = useMemo(() => [
    { id: "demo-1", host_id: "d1", host_name: "Sofia", host_avatar: null, title: "Late Night Chill & Chat", topic: "Music", viewer_count: 1247, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "music" },
    { id: "demo-2", host_id: "d2", host_name: "Tyler Gaming", host_avatar: null, title: "Ranked Grind — Road to Diamond", topic: "Gaming", viewer_count: 3891, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "gamepad" },
    { id: "demo-3", host_id: "d3", host_name: "Chef Amara", host_avatar: null, title: "Making Pasta from Scratch", topic: "Cooking", viewer_count: 682, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "chef" },
    { id: "demo-4", host_id: "d4", host_name: "Zen Yoga", host_avatar: null, title: "Morning Flow — 30 Min Session", topic: "Fitness", viewer_count: 415, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "dumbbell" },
    { id: "demo-5", host_id: "d5", host_name: "DJ Pulse", host_avatar: null, title: "House Mix Live from Miami", topic: "Music", viewer_count: 5200, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "music" },
    { id: "demo-6", host_id: "d6", host_name: "ArtByLuna", host_avatar: null, title: "Painting a Sunset — Oil on Canvas", topic: "Art", viewer_count: 328, status: "scheduled", started_at: new Date(Date.now() + 3600000).toISOString(), thumbnail_emoji: "palette" },
  ], []);

  const { data: dbStreams = [], isLoading } = useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      // Single query — fetch sessions with host profiles in parallel
      const sessionsPromise = (supabase as any)
        .from("ama_sessions")
        .select("id, host_id, title, topic, viewer_count, question_count, status, starts_at, ends_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      const [{ data: amaSessions }] = await Promise.all([sessionsPromise]);

      if (!amaSessions?.length) return [] as LiveStream[];

      const hostIds = [...new Set((amaSessions as any[]).map((s: any) => s.host_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", hostIds as string[]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const topicEmojis: Record<string, string> = {
        "music": "music", "gaming": "gamepad", "cooking": "chef", "tech": "laptop",
        "fitness": "dumbbell", "art": "palette", "travel": "plane", "fashion": "shirt",
        "education": "book", "business": "briefcase", "comedy": "laugh", "sports": "ball",
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
          thumbnail_emoji: topicEmojis[topicKey] || "tv",
        } as LiveStream;
      });
    },
    staleTime: 30_000, // 30s cache — streams don't change that fast
    gcTime: 2 * 60_000,
  });

  // Use DB streams if available, otherwise show demos
  const streams = dbStreams.length > 0 ? dbStreams : demoStreams;

  const filteredStreams = streams.filter((s) => {
    if (filter === "live" && s.status !== "live") return false;
    if (filter === "scheduled" && s.status !== "scheduled") return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.host_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const liveCount = streams.filter((s) => s.status === "live").length;
  const handleGoLive = () => navigate("/go-live");

  // ── Active stream viewer ──
  if (activeStream) {
    return <LiveWatcher stream={activeStream} onLeave={() => setActiveStream(null)} />;
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
              {f === "all" ? "All" : f === "live" ? <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live{liveCount > 0 ? ` (${liveCount})` : ""}</span> : "Scheduled"}
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
                  <StreamTopicIcon topic={stream.thumbnail_emoji} className="h-12 w-12 group-hover:scale-110 transition-transform" />
                  {stream.status === "live" && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-[10px] gap-1 animate-pulse">
                      <Radio className="h-2.5 w-2.5" /> LIVE
                    </Badge>
                  )}
                  {/* Hot badge for high viewer streams */}
                  {stream.status === "live" && stream.viewer_count >= 3000 && (
                  <Badge className="absolute top-3 left-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-[10px] gap-0.5 ml-1">
                      <Flame className="h-2.5 w-2.5" /> Hot
                    </Badge>
                  )}
                  {/* Daily Pick for first stream */}
                  {i === 0 && stream.status === "live" && (
                    <Badge className="absolute top-10 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[9px] gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-white" /> Daily Pick
                    </Badge>
                  )}
                  {stream.status === "scheduled" && (
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-[10px] gap-0.5">
                      <CalendarDays className="h-2.5 w-2.5" /> Scheduled
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
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-muted-foreground truncate">{stream.host_name} · {stream.topic}</p>
                      {stream.status === "live" && (
                        <span className="text-[9px] text-muted-foreground/60 shrink-0">• streaming now</span>
                      )}
                    </div>
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
