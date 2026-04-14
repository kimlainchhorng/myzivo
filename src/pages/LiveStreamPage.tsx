/**
 * LiveStreamPage — Browse and watch live streams
 * Full-screen immersive watcher experience with gifts, reactions & engagement
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { giftImages } from "@/config/giftIcons";
import { giftAnimationVideos } from "@/config/giftAnimations";

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
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; isGift?: boolean; isSystem?: boolean; avatar?: string; level?: number }[]>([
    { id: "sys-1", user: "System", text: `Welcome to ${stream.host_name}'s stream! 🎉`, isSystem: true },
  ]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [selectedGift, setSelectedGift] = useState<{ icon: string; name: string; coins: number; badge?: string; bg?: string } | null>(null);
  const [giftQty, setGiftQty] = useState(1);
  const [giftTab, setGiftTab] = useState<"gifts" | "interactive" | "exclusive">("gifts");
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [viewerCount, setViewerCount] = useState(stream.viewer_count || Math.floor(Math.random() * 500) + 50);
  const [likes, setLikes] = useState(0);
  const [muted, setMuted] = useState(false);
  const [giftNotifQueue, setGiftNotifQueue] = useState<{ id: string; sender: string; giftName: string; coins: number; icon: string }[]>([]);
  const [topGifters, setTopGifters] = useState<{ name: string; coins: number }[]>([
    { name: "Luna ✨", coins: 520 },
    { name: "Kai 🔥", coins: 310 },
    { name: "Mia 💜", coins: 180 },
  ]);
  const [elapsed, setElapsed] = useState(0);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [superChatMsg, setSuperChatMsg] = useState<{ id: string; user: string; text: string; coins: number } | null>(null);
  // ── NEW: Viewer list panel ──
  const [showViewerList, setShowViewerList] = useState(false);
  const [fakeViewers] = useState(() => [
    { name: "Luna ✨", level: 28, badge: "⭐ Top Fan" },
    { name: "Kai 🔥", level: 15, badge: null },
    { name: "Mia 💜", level: 22, badge: "⭐ Top Fan" },
    { name: "Nora 🌸", level: 8, badge: null },
    { name: "Zara 💎", level: 45, badge: "👑 VIP" },
    { name: "Leo 🦁", level: 12, badge: null },
    { name: "Aria 🎵", level: 33, badge: null },
    { name: "Alex 🎮", level: 6, badge: null },
    { name: "Jordan 🏀", level: 19, badge: null },
    { name: "Sam 🌊", level: 10, badge: null },
    { name: "Taylor 🌺", level: 4, badge: null },
    { name: "Morgan 🎭", level: 7, badge: null },
  ]);
  // ── NEW: Host level (derived from top gifter coins) ──
  const hostLevel = useMemo(() => Math.min(99, Math.floor(topGifters.reduce((a, b) => a + b.coins, 0) / 20) + 1), [topGifters]);
  const lastTapRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pinnedMessage = useMemo(() => `Welcome to ${stream.host_name}'s stream! Be respectful and have fun 🎉`, [stream.host_name]);
  const quickReactions = useMemo(() => ["❤️", "🔥", "😍", "👏", "😂"], []);

  const allGifts = useMemo(() => ({
    gifts: [
      { icon: "🐉", name: "Baby Dragon", coins: 1, badge: "Popular", bg: "from-orange-400 to-red-400" },
      { icon: "🐼", name: "Cute Panda", coins: 1, bg: "from-green-300 to-emerald-300" },
      { icon: "🐍", name: "King Cobra", coins: 5, bg: "from-purple-400 to-violet-400" },
      { icon: "🦄", name: "Crystal Unicorn", coins: 10, bg: "from-pink-300 to-fuchsia-300" },
      { icon: "🔥", name: "Phoenix Rising", coins: 50, badge: "NEW", bg: "from-orange-500 to-red-500" },
      { icon: "💎", name: "Diamond Bear", coins: 99, bg: "from-sky-200 to-blue-200" },
      { icon: "🐱", name: "Lucky Cat", coins: 1, bg: "from-amber-200 to-yellow-200" },
      { icon: "🐺", name: "Mystic Wolf", coins: 30, bg: "from-blue-300 to-indigo-300" },
      { icon: "🦋", name: "Rainbow Butterfly", coins: 5, bg: "from-violet-300 to-pink-300" },
      { icon: "🐯", name: "Thunder Tiger", coins: 199, bg: "from-amber-400 to-orange-400" },
      { icon: "🦊", name: "Star Fox", coins: 10, bg: "from-orange-300 to-amber-300" },
      { icon: "🐧", name: "Ice Penguin", coins: 5, bg: "from-cyan-200 to-sky-200" },
      { icon: "🐰", name: "Magic Rabbit", coins: 15, bg: "from-purple-300 to-indigo-300" },
      { icon: "🐬", name: "Neon Dolphin", coins: 30, bg: "from-blue-400 to-cyan-400" },
      { icon: "🐍", name: "Snake Dance", coins: 20, bg: "from-green-400 to-lime-400" },
      { icon: "🐉", name: "Fire Dragon", coins: 299, badge: "Interaction", bg: "from-red-500 to-orange-500" },
    ],
    interactive: [
      { icon: "🐼", name: "Panda Party", coins: 100, badge: "NEW", bg: "from-green-300 to-teal-300" },
      { icon: "🏎️", name: "Luxury Lambo", coins: 2000, bg: "from-red-500 to-rose-500" },
      { icon: "🏎️", name: "Gold Ferrari", coins: 3000, bg: "from-yellow-400 to-amber-400" },
      { icon: "🚗", name: "Rolls Royce", coins: 5000, badge: "Luxury", bg: "from-gray-200 to-slate-200" },
      { icon: "💎", name: "Diamond Rain", coins: 1500, bg: "from-sky-300 to-blue-300" },
      { icon: "🪙", name: "Gold Fountain", coins: 999, bg: "from-yellow-300 to-amber-300" },
      { icon: "🐉", name: "Treasure Dragon", coins: 2500, bg: "from-green-400 to-emerald-400" },
      { icon: "🚁", name: "Gold Helicopter", coins: 3500, bg: "from-amber-400 to-yellow-400" },
      { icon: "🦢", name: "Sapphire Swan", coins: 699, bg: "from-blue-200 to-sky-200" },
      { icon: "🦅", name: "Emerald Eagle", coins: 1200, bg: "from-green-500 to-emerald-500" },
      { icon: "👑", name: "Royal Crown", coins: 888, bg: "from-yellow-400 to-amber-500" },
      { icon: "🐼", name: "Platinum Panda", coins: 1999, bg: "from-gray-300 to-slate-300" },
    ],
    exclusive: [
      { icon: "🐆", name: "Black Panther", coins: 4999, badge: "NEW", bg: "from-purple-900 to-indigo-900" },
      { icon: "🏎️", name: "Bugatti", coins: 9999, badge: "Luxury", bg: "from-blue-500 to-cyan-500" },
      { icon: "🐉", name: "Diamond Dragon", coins: 15000, bg: "from-sky-300 to-blue-300" },
      { icon: "🛥️", name: "Luxury Yacht", coins: 19999, bg: "from-blue-400 to-indigo-400" },
      { icon: "🏝️", name: "Private Island", coins: 29999, badge: "Ultimate", bg: "from-green-400 to-teal-400" },
    ],
  }), []);

  const fakeViewerNames = useMemo(() => ["Luna ✨", "Kai 🔥", "Mia 💜", "Nora 🌸", "Zara 💎", "Leo 🦁", "Aria 🎵", "Alex 🎮", "Jordan 🏀", "Sam 🌊"], []);

  // Simulate chat messages + viewer joins
  useEffect(() => {
    const msgs = [
      "Hi everyone! 👋", "Love this stream!", "❤️❤️❤️", "You're amazing!",
      "First time here 🎉", "Let's gooo!", "So cool!", "Where are you from?",
      "Can you do a shoutout?", "This is fire 🔥", "Following!", "Best stream ever",
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
          text: "joined the stream 👋",
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
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const sender = fakeViewerNames[Math.floor(Math.random() * fakeViewerNames.length)];
        const giftPool = allGifts.gifts;
        const gift = giftPool[Math.floor(Math.random() * 4)];
        const notif = { id: Date.now().toString(), sender, giftName: gift.name, coins: gift.coins, icon: gift.icon };
        setGiftNotifQueue(prev => [...prev.slice(-2), notif]);
        // Update top gifters
        setTopGifters(prev => {
          const existing = prev.find(g => g.name === sender);
          if (existing) {
            return prev.map(g => g.name === sender ? { ...g, coins: g.coins + gift.coins } : g).sort((a, b) => b.coins - a.coins);
          }
          return [...prev, { name: sender, coins: gift.coins }].sort((a, b) => b.coins - a.coins).slice(0, 3);
        });
        setTimeout(() => {
          setGiftNotifQueue(prev => prev.filter(n => n.id !== notif.id));
        }, 3000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fakeViewerNames, allGifts]);

  // Simulate super chats from viewers
  useEffect(() => {
    const superChatMsgs = ["Love this stream! 🔥", "Keep going! 💪", "You're the best! ⭐", "Shoutout please! 🎤", "Amazing content! 💯"];
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
    setChatMessages(prev => [...prev, { id: Date.now().toString(), user: "You", text: chatInput, level: 5 }]);
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
    toast.success(`🎁 Sent ${giftQty}x ${selectedGift.name}!`, { description: `${totalCoins} coins` });
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: "You",
      text: `sent ${giftQty}x ${selectedGift.name} 🎁`,
      isGift: true,
      level: 5,
    }]);
    setSelectedGift(null);
    setGiftQty(1);
    setShowGiftPanel(false);
  }, [selectedGift, giftQty]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : `Following ${stream.host_name}! ❤️`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: stream.title, text: `Watch ${stream.host_name} live on ZIVO!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! 🔗");
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
      sendReaction("❤️");
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-20 select-none">
          {stream.thumbnail_emoji}
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
              ❤️
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
                <span className="text-[9px] text-amber-300/80 font-bold">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
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

      {/* ── Gift notifications (left side, TikTok style) ── */}
      <div className="absolute left-3 z-30 flex flex-col gap-1.5" style={{ top: "calc(env(safe-area-inset-top, 0px) + 100px)" }}>
        <AnimatePresence>
          {giftNotifQueue.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full pr-3 pl-1.5 py-1"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">{notif.sender[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[10px] text-white/70 truncate max-w-[100px]">{notif.sender}</p>
                <p className="text-[10px] text-amber-300 font-bold">sent {notif.giftName}</p>
              </div>
              <div className="w-7 h-7 flex items-center justify-center">
                {giftImages[notif.icon] ? (
                  <img src={giftImages[notif.icon]} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-base">🎁</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Floating reactions ── */}
      <div className="absolute right-4 bottom-48 z-30 w-10 pointer-events-none">
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -200, opacity: 0, scale: 1.2, x: (Math.random() - 0.5) * 40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute bottom-0 text-2xl"
              style={{ left: `${r.x - 60}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
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
          onClick={() => sendReaction("❤️")}
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
                <p className="text-[10px] text-white/40 text-center py-3">No gifts yet — be the first! 🎁</p>
              ) : (
                topGifters.map((g, i) => (
                  <div key={g.name} className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl",
                    i === 0 ? "bg-amber-500/15" : "bg-white/5"
                  )}>
                    <span className="text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
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
              <p className="text-[9px] text-white/40 text-center">Send gifts to climb the rankings! 🏆</p>
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
              <span className="text-[9px] font-bold bg-amber-500/40 text-amber-200 px-1.5 py-0.5 rounded">💬 SUPER CHAT</span>
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
        {/* Messages */}
        <div className="px-3 max-h-[160px] overflow-y-auto scrollbar-hide space-y-1 mask-gradient-top flex flex-col">
          {chatMessages.slice(-7).map((msg) => {
            const isJoin = msg.isSystem && msg.text.includes("joined");
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex items-start gap-1.5 px-2 py-1 rounded-lg max-w-[85%] w-fit",
                  isJoin ? "bg-green-500/15" : msg.isSystem ? "bg-primary/20" : msg.isGift ? "bg-amber-500/20" : "bg-black/30 backdrop-blur-sm"
                )}
              >
                {msg.level && !msg.isSystem && (
                  <span className={cn("text-[8px] px-1 py-0.5 rounded font-bold bg-gradient-to-r text-white shrink-0 mt-0.5", getLevelColor(msg.level))}>
                    Lv.{msg.level}
                  </span>
                )}
                <div className="min-w-0">
                  <span className={cn("text-[11px] font-bold mr-1", isJoin ? "text-green-300" : msg.isSystem ? "text-primary" : msg.isGift ? "text-amber-300" : "text-white/70")}>
                    {msg.user}
                  </span>
                  <span className={cn("text-[11px] break-words", isJoin ? "text-green-200/70" : "text-white")}>{msg.text}</span>
                </div>
              </motion.div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Quick reactions */}
        <div className="flex items-center gap-1.5 px-3 mt-1.5">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-base hover:scale-110 transition-transform active:scale-95"
            >
              {emoji}
            </button>
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
                  <span className="text-amber-300 text-[11px] font-bold">1,250</span>
                </div>
                <button
                  onClick={() => toast.info("Top Up coming soon!", { description: "Purchase Z Coins" })}
                  className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 active:scale-90 transition-transform"
                >
                  <span className="text-amber-300 text-xs font-bold leading-none">+</span>
                </button>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-white/40 whitespace-nowrap animate-[marquee_8s_linear_infinite]">
                  ✨ Send gifts to support your favorite creators! &nbsp;&nbsp;&nbsp; ✨ Send gifts to support your favorite creators!
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
                      {giftAnimationVideos[gift.name] && (
                        <span className="absolute bottom-0.5 left-0.5 text-[7px] bg-black/50 text-white/80 px-1 py-0.5 rounded-md font-bold backdrop-blur-sm">🎬</span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/70 truncate w-full text-center leading-tight mt-0.5">{gift.name}</span>
                    <div className="flex items-center gap-0.5">
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
                        {selectedGift.coins >= 500 && (
                          <span className="text-[9px] text-red-400 font-medium ml-1">Premium</span>
                        )}
                      </div>
                    </div>
                    {/* Quantity selector */}
                    <div className="flex gap-1 shrink-0">
                      {[1, 5, 10, 99].map((q) => (
                        <button
                          key={q}
                          onClick={() => setGiftQty(q)}
                          className={cn(
                            "w-8 h-7 rounded-lg text-[10px] font-bold transition-all",
                            giftQty === q
                              ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                              : "bg-white/5 text-white/40 border border-white/10"
                          )}
                        >
                          x{q}
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
                  {tab === "gifts" ? "🎁 Gifts" : tab === "interactive" ? "⚡ Interactive" : "👑 Exclusive"}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={() => toast.info("Top Up coming soon!", { description: "Purchase Z Coins" })}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
              >
                <img src={goldCoinIcon} alt="" className="w-4 h-4" />
                <span className="text-[11px] text-white font-bold">Recharge</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    { id: "demo-1", host_id: "d1", host_name: "Sofia ✨", host_avatar: null, title: "Late Night Chill & Chat 🌙", topic: "Music", viewer_count: 1247, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "🎵" },
    { id: "demo-2", host_id: "d2", host_name: "Tyler Gaming", host_avatar: null, title: "Ranked Grind — Road to Diamond 💎", topic: "Gaming", viewer_count: 3891, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "🎮" },
    { id: "demo-3", host_id: "d3", host_name: "Chef Amara", host_avatar: null, title: "Making Pasta from Scratch 🍝", topic: "Cooking", viewer_count: 682, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "🍳" },
    { id: "demo-4", host_id: "d4", host_name: "Zen Yoga", host_avatar: null, title: "Morning Flow — 30 Min Session", topic: "Fitness", viewer_count: 415, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "💪" },
    { id: "demo-5", host_id: "d5", host_name: "DJ Pulse", host_avatar: null, title: "House Mix Live from Miami 🌴", topic: "Music", viewer_count: 5200, status: "live", started_at: new Date().toISOString(), thumbnail_emoji: "🎵" },
    { id: "demo-6", host_id: "d6", host_name: "ArtByLuna", host_avatar: null, title: "Painting a Sunset — Oil on Canvas", topic: "Art", viewer_count: 328, status: "scheduled", started_at: new Date(Date.now() + 3600000).toISOString(), thumbnail_emoji: "🎨" },
  ], []);

  const { data: dbStreams = [], isLoading } = useQuery({
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
                  {/* Hot badge for high viewer streams */}
                  {stream.status === "live" && stream.viewer_count >= 3000 && (
                    <Badge className="absolute top-3 left-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-[10px] gap-0.5 ml-1">
                      🔥 Hot
                    </Badge>
                  )}
                  {/* Daily Pick for first stream */}
                  {i === 0 && stream.status === "live" && (
                    <Badge className="absolute top-10 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-[9px] gap-0.5">
                      ⭐ Daily Pick
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
