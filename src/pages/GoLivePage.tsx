/**
 * GoLivePage — Broadcast a live stream with camera, title, and chat
 * Premium 2026 redesign with enhanced visuals
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import GiftAnimationOverlay from "@/components/live/GiftAnimationOverlay";
import { playGiftSound, playPremiumGiftSound } from "@/utils/giftSounds";
import { giftAnimationVideos } from "@/config/giftAnimations";
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
import Send from "lucide-react/dist/esm/icons/send";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import X from "lucide-react/dist/esm/icons/x";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Zap from "lucide-react/dist/esm/icons/zap";
import Gift from "lucide-react/dist/esm/icons/gift";
import Eye from "lucide-react/dist/esm/icons/eye";
import Shield from "lucide-react/dist/esm/icons/shield";
import Wifi from "lucide-react/dist/esm/icons/wifi";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { giftImages } from "@/config/giftIcons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type LivePhase = "setup" | "countdown" | "live" | "ended";

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
  const [peakViewers, setPeakViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; isGift?: boolean; isSystem?: boolean; isPinned?: boolean; avatar?: string; level?: number }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [cameraError, setCameraError] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [giftsReceived, setGiftsReceived] = useState(0);
  const [giftTab, setGiftTab] = useState<"gifts" | "interactive" | "exclusive">("gifts");
  const [beautyMode, setBeautyMode] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [streamQuality, setStreamQuality] = useState<"HD" | "SD">("HD");
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [activeGiftAnim, setActiveGiftAnim] = useState<{ name: string; coins: number; senderName?: string } | null>(null);
  const [giftCombo, setGiftCombo] = useState(0);
  const [viewerGiftNotif, setViewerGiftNotif] = useState<{ id: string; sender: string; giftName: string; coins: number } | null>(null);
  const lastGiftRef = useRef<{ name: string; time: number }>({ name: "", time: 0 });
  const [topGifters, setTopGifters] = useState<Record<string, number>>({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [streamGoal] = useState(500);
  const [giftStreakFlash, setGiftStreakFlash] = useState(false);
  const [goalCelebrated, setGoalCelebrated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [newFollower, setNewFollower] = useState<string | null>(null);
  const [viewerPulse, setViewerPulse] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [newFollowersCount, setNewFollowersCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const lastGiftTimeRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fakeFollowers = useRef(Math.floor(Math.random() * 800) + 200);

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

  const quickReactions = useMemo(() => ["❤️", "🔥", "😍", "👏", "😂", "🎵", "💯", "✨"], []);

  const topicConfig = useMemo(() => [
    { name: "General", icon: "🌐" },
    { name: "Music", icon: "🎵" },
    { name: "Gaming", icon: "🎮" },
    { name: "Cooking", icon: "🍳" },
    { name: "Tech", icon: "💻" },
    { name: "Fitness", icon: "💪" },
    { name: "Art", icon: "🎨" },
    { name: "Travel", icon: "✈️" },
    { name: "Fashion", icon: "👗" },
    { name: "Comedy", icon: "😂" },
    { name: "Education", icon: "📚" },
    { name: "Sports", icon: "⚽" },
  ], []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraOn((p) => !p);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMicOn((p) => !p);
    }
  }, []);

  const flipCamera = useCallback(() => {
    setFacingMode((p) => (p === "user" ? "environment" : "user"));
  }, []);

  const goLive = useCallback(() => {
    const streamTitle = title.trim() || "My Live Stream";
    if (!title.trim()) {
      setTitle(streamTitle);
    }
    // Start countdown
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(iv);
        setPhase("live");
        setChatMessages([{
          id: "welcome",
          user: "ZIVO",
          text: `Welcome to "${streamTitle}"! Be respectful and have fun 🎉`,
          isSystem: true,
          isPinned: true,
          avatar: "bg-red-500",
        }]);
        toast.success("You're live! 🔴");
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [title]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);


  // Simulate viewers & likes
  useEffect(() => {
    if (phase !== "live") return;
    const names = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Riley", "Casey", "Mia", "Luna", "Kai"];
    const msgs = ["🔥🔥🔥", "This is amazing!", "Hello from NYC!", "Love this!", "First time here ❤️", "Keep going!", "Wow 😍", "👏👏👏", "You're amazing!", "Can't stop watching 🤩"];
    const avatarColors = ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500"];

    let lastViewer = 0, lastLike = 0, lastElapsed = 0, lastChat = 0;
    let raf: number;
    const tick = (now: number) => {
      if (!lastViewer) { lastViewer = lastLike = lastElapsed = lastChat = now; }

      if (now - lastElapsed >= 1000) {
        setElapsed((p) => p + 1);
        lastElapsed = now;
      }
      if (now - lastViewer >= 3000) {
        setViewerCount((p) => {
          const delta = Math.random() > 0.4 ? Math.floor(Math.random() * 3) : -Math.floor(Math.random() * 2);
          const next = Math.max(0, Math.min(50, p + delta));
          setPeakViewers((pk) => Math.max(pk, next));
          if (next !== p) { setViewerPulse(true); setTimeout(() => setViewerPulse(false), 600); }
          const milestones = [10, 25, 50, 100, 250, 500];
          for (const m of milestones) {
            if (next >= m && p < m && m > lastMilestoneRef.current) {
              lastMilestoneRef.current = m;
              setChatMessages((prev) => [
                ...prev.slice(-20),
                { id: `milestone-${m}`, user: "🎉", text: `${m} viewers! Amazing!`, isSystem: true },
              ]);
              toast.success(`🎉 ${m} viewers milestone reached!`);
              break;
            }
          }
          // Viewer join notification (occasionally)
          if (delta > 0 && Math.random() > 0.6) {
            const joinName = names[Math.floor(Math.random() * names.length)];
            setChatMessages((prev) => [
              ...prev.slice(-20),
              { id: `join-${now}`, user: joinName, text: "joined the stream 👋", isSystem: true, avatar: avatarColors[Math.floor(Math.random() * avatarColors.length)] },
            ]);
          }
          return next;
        });
        lastViewer = now;
      }
      if (now - lastLike >= 2500) {
        if (Math.random() > 0.5) setLikes((p) => p + 1);
        lastLike = now;
      }
      if (now - lastChat >= 3500) {
        if (Math.random() > 0.5) {
          const name = names[Math.floor(Math.random() * names.length)];
          setChatMessages((prev) => [
            ...prev.slice(-20),
            {
              id: now.toString(),
              user: name,
              text: msgs[Math.floor(Math.random() * msgs.length)],
              avatar: avatarColors[Math.floor(Math.random() * avatarColors.length)],
              level: Math.floor(Math.random() * 50) + 1,
            },
          ]);
        }
        lastChat = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Simulate new follower notifications every 20-40s
  useEffect(() => {
    if (phase !== "live") return;
    const followerNames = ["Sophia", "Ethan", "Olivia", "Mason", "Ava", "Liam", "Emma", "Noah"];
    let timer: ReturnType<typeof setTimeout>;
    const scheduleFollower = () => {
      timer = setTimeout(() => {
        const name = followerNames[Math.floor(Math.random() * followerNames.length)];
        setNewFollower(name);
        fakeFollowers.current += 1;
        setNewFollowersCount((p) => p + 1);
        setTimeout(() => setNewFollower(null), 3000);
        scheduleFollower();
      }, 20000 + Math.random() * 20000);
    };
    scheduleFollower();
    return () => clearTimeout(timer);
  }, [phase]);
  // Simulate random viewer gifts every 15-30s
  useEffect(() => {
    if (phase !== "live") return;
    const giftNames = ["Baby Dragon", "Cute Panda", "Lucky Cat", "Crystal Unicorn", "King Cobra"];
    const giftCoins = [1, 1, 1, 10, 5];
    const viewers = ["Luna", "Kai", "Mia", "Nora", "Zara", "Leo", "Aria"];
    let timerRef: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 25000 + Math.random() * 25000;
      timerRef = setTimeout(() => {
        const idx = Math.floor(Math.random() * giftNames.length);
        const sender = viewers[Math.floor(Math.random() * viewers.length)];
        const notif = { id: Date.now().toString(), sender, giftName: giftNames[idx], coins: giftCoins[idx] };
        setViewerGiftNotif(notif);
        setGiftsReceived((p) => p + 1);
        setCoinsEarned((p) => p + giftCoins[idx]);
        setTopGifters((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + giftCoins[idx] }));
        playGiftSound(1);
        // Gift streak flash
        const now = Date.now();
        if (now - lastGiftTimeRef.current < 8000) {
          setGiftStreakFlash(true);
          setTimeout(() => setGiftStreakFlash(false), 1500);
        }
        lastGiftTimeRef.current = now;
        setTimeout(() => setViewerGiftNotif((cur) => cur?.id === notif.id ? null : cur), 4000);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timerRef);
  }, [phase]);

  const endStream = useCallback(() => {
    setShowEndConfirm(false);
    setPhase("ended");
    streamRef.current?.getTracks().forEach((t) => t.stop());
    toast("Stream ended", { description: `Duration: ${formatTime(elapsed)} · ${peakViewers} peak viewers`, duration: 3000 });
  }, [elapsed, peakViewers]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev.slice(-20), { id: Date.now().toString(), user: "You (Host)", text: chatInput, avatar: "bg-red-500" }]);
    setChatInput("");
  }, [chatInput]);

  const spawnFloatingReaction = useCallback((emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 60 - 30;
    setFloatingReactions((prev) => [...prev.slice(-8), { id, emoji, x }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 2500);
  }, []);

  // Goal celebration
  useEffect(() => {
    if (coinsEarned >= streamGoal && !goalCelebrated) {
      setGoalCelebrated(true);
      toast.success("🎉 Stream goal reached! Amazing!", { duration: 5000 });
      ["🎉", "🥳", "✨", "🎊", "💎"].forEach((e, i) => {
        setTimeout(() => spawnFloatingReaction(e), i * 200);
      });
    }
  }, [coinsEarned, streamGoal, goalCelebrated, spawnFloatingReaction]);

  const sendReaction = useCallback((emoji: string) => {
    spawnFloatingReaction(emoji);
    setLikes((p) => p + 1);
  }, [spawnFloatingReaction]);

  const sendGift = useCallback((gift: { icon: string; name: string; coins: number }) => {
    // Haptic feedback on mobile
    try { navigator.vibrate?.(50); } catch {} // eslint-disable-line no-empty
    const senders = ["Alex", "Jordan", "Sam", "Taylor", "Morgan"];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    setGiftsReceived((p) => p + 1);
    setCoinsEarned((p) => p + gift.coins);
    setTopGifters((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + gift.coins }));
    spawnFloatingReaction(gift.icon);
    // Gift streak flash
    const now2 = Date.now();
    if (now2 - lastGiftTimeRef.current < 8000) {
      setGiftStreakFlash(true);
      setTimeout(() => setGiftStreakFlash(false), 1500);
    }
    lastGiftTimeRef.current = now2;
    
    // Combo tracking — same gift within 5s increments combo
    const now = Date.now();
    let newCombo = 1;
    if (lastGiftRef.current.name === gift.name && now - lastGiftRef.current.time < 5000) {
      newCombo = giftCombo + 1;
      setGiftCombo(newCombo);
    } else {
      setGiftCombo(1);
    }
    lastGiftRef.current = { name: gift.name, time: now };
    
    // Play sound effects
    const isPremium = !!giftAnimationVideos[gift.name];
    if (isPremium) {
      playPremiumGiftSound();
    } else {
      playGiftSound(newCombo);
    }
    
    setActiveGiftAnim({ name: gift.name, coins: gift.coins, senderName: sender });
  }, [spawnFloatingReaction, giftCombo]);

  // ── Ended screen ──
  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex flex-col items-center p-6 pt-10 pb-24 text-center overflow-y-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }} className="space-y-6 w-full max-w-sm">
          {/* Animated success icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Radio className="h-8 w-8 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Stream Ended</h1>
            <p className="text-white/50 text-sm mt-1">{title || "Untitled Stream"}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{formatTime(elapsed)}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Duration</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <Eye className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{peakViewers}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Peak Viewers</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <Heart className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{likes}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Reactions</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl p-4 border border-amber-500/20">
              <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-amber-300">{coinsEarned}</p>
              <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">Coins Earned</p>
            </div>
          </div>

          {/* Engagement summary */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Gifts Received</span>
              <span className="text-sm font-semibold text-white">{giftsReceived} 🎁</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Chat Messages</span>
              <span className="text-sm font-semibold text-white">{chatMessages.length} 💬</span>
            </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">New Followers</span>
               <span className="text-sm font-semibold text-purple-400">{newFollowersCount} 💜</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">Engagement Rate</span>
               <span className="text-sm font-semibold text-green-400">
                 {peakViewers > 0 ? Math.min(95, Math.round((giftsReceived / peakViewers) * 40 + (likes / Math.max(1, elapsed / 30)) * 5)) : 0}% 📊
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">Avg Watch Time</span>
               <span className="text-sm font-semibold text-white">{formatTime(Math.round(elapsed * 0.6))} ⏱️</span>
             </div>
          </div>

          {/* Top Gifters on ended screen */}
          {Object.keys(topGifters).length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-2xl p-4 border border-amber-500/15 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Top Gifters</span>
              </div>
              {Object.entries(topGifters)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, coins], i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span className="text-sm">{medals[i]}</span>
                      <span className="text-xs text-white/80 font-medium flex-1">{name}</span>
                      <span className="text-xs text-amber-300 font-bold">{coins.toLocaleString()} 🪙</span>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate("/live")} className="rounded-full flex-1 border-white/20 text-white hover:bg-white/10">
              Back to Live
            </Button>
            <Button
              onClick={() => {
                setPhase("setup"); setElapsed(0); setViewerCount(0); setPeakViewers(0);
                setLikes(0); setChatMessages([]); setGiftsReceived(0); setCoinsEarned(0); setTopGifters({}); setGiftStreakFlash(false); setShowLeaderboard(false); setGoalCelebrated(false); setGiftCombo(0); setNewFollowersCount(0); setShareCount(0); setNewFollower(null); lastMilestoneRef.current = 0; startCamera();
              }}
              className="rounded-full flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
            >
              Go Live Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Setup & Live ──
  return (
    <div className={cn("min-h-screen bg-black flex flex-col relative overflow-hidden transition-shadow duration-500", giftStreakFlash && "shadow-[inset_0_0_60px_rgba(255,170,0,0.3)]")} style={giftStreakFlash ? { boxShadow: "inset 0 0 80px rgba(255,170,0,0.25), 0 0 40px rgba(255,170,0,0.1)" } : undefined}>
      {/* Camera preview */}
      <div className="absolute inset-0 z-0">
        {cameraError ? (
          <div className="w-full h-full bg-gradient-to-br from-violet-950/80 via-black to-rose-950/60 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                <CameraOff className="h-8 w-8 text-white/20" />
              </div>
              <div>
                <p className="text-white/50 text-sm font-medium">Camera unavailable</p>
                <p className="text-white/30 text-xs mt-1">Check permissions or try another device</p>
              </div>
              <Button size="sm" variant="outline" onClick={startCamera} className="text-white border-white/20 rounded-full">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover bg-black",
              facingMode === "user" && "scale-x-[-1]",
              beautyMode && "brightness-105 contrast-[1.02] saturate-[1.1]"
            )}
          />
        )}
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        {/* Double-tap to heart */}
        {phase === "live" && (
           <div
             className="absolute inset-0 z-[1]"
             onDoubleClick={() => {
               spawnFloatingReaction("❤️");
             }}
           />
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-2 px-4 pt-3" style={{ paddingTop: "max(calc(env(safe-area-inset-top, 0px) + 12px), 12px)" }}>
        <button
          onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); phase === "live" ? setShowEndConfirm(true) : navigate(-1); }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10"
        >
          {phase === "live" ? <X className="h-5 w-5 text-white" /> : <ArrowLeft className="h-5 w-5 text-white" />}
        </button>

        {phase === "live" && (
          <>
            <div className="flex items-center gap-1.5 bg-red-500 rounded-full px-2.5 py-1 shadow-lg shadow-red-500/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
            </div>
            <div className={cn("flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 transition-all", viewerPulse && "scale-110 bg-green-500/20 border-green-500/30")}>
              <Eye className="h-3 w-3 text-white/70" />
              <span className={cn("text-white text-xs font-medium transition-colors", viewerPulse && "text-green-300")}>{viewerCount.toLocaleString()}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
                <Wifi className="h-3 w-3 text-green-400" />
                <span className="text-white/70 text-[10px] font-medium">{streamQuality}</span>
              </div>
              <span className="text-white/70 text-xs font-mono bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                {formatTime(elapsed)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Live host info bar */}
      {phase === "live" && (
        <div className="relative z-10 px-4 mt-3">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20">
              {user?.email?.[0]?.toUpperCase() || "Z"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{title}</p>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-[10px]">{topic}</span>
                <span className="text-white/25 text-[10px]">·</span>
                <span className="text-white/40 text-[10px]">{fakeFollowers.current.toLocaleString()} followers</span>
                {giftsReceived > 0 && (
                  <span className="text-amber-300 text-[10px] flex items-center gap-0.5">
                    <img src={goldCoinIcon} alt="" className="w-3 h-3" /> {coinsEarned}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setShareCount((p) => p + 1);
                if (navigator.share) {
                  navigator.share({ title: `Watch ${title} live on ZIVO!`, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Stream link copied!");
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5"
            >
              <Share2 className="h-4 w-4 text-white/60" />
            </button>
            <button
              onClick={() => setShowChat((p) => !p)}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center", showChat ? "bg-white/15" : "bg-white/5")}
            >
              <MessageCircle className="h-4 w-4 text-white/60" />
            </button>
          </div>

          {/* Stream Goal Progress Bar */}
          <div className="mt-2 bg-black/30 backdrop-blur-md rounded-xl px-3 py-2 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/50 font-medium">🎯 Stream Goal</span>
              <span className="text-[10px] text-amber-300 font-bold">{Math.min(coinsEarned, streamGoal)}/{streamGoal}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((coinsEarned / streamGoal) * 100, 100)}%` }}
                transition={{ type: "spring", damping: 20 }}
              />
            </div>
            {coinsEarned >= streamGoal && (
              <p className="text-[9px] text-amber-300 mt-1 text-center animate-pulse">🎉 Goal reached!</p>
            )}
          </div>
        </div>
      )}

      {/* Setup form */}
      {phase === "setup" && (
        <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-6 space-y-3">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-3">
            {/* Stream setup card */}
            <div className="bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-4 space-y-4 border border-white/10 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold text-sm">Stream Setup</span>
                  <p className="text-white/30 text-[10px]">Configure your broadcast</p>
                </div>
              </div>

              {/* Title input */}
              <div className="relative">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your stream a title..."
                  maxLength={100}
                  className="bg-zinc-800/80 border-zinc-700/50 text-white placeholder:text-zinc-500 text-sm rounded-xl h-11 pl-4 pr-12 focus:border-red-500/50 focus:ring-red-500/20"
                />
                {title.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">{title.length}/100</span>
                )}
              </div>

              {/* Topic chips */}
              <div>
                <p className="text-zinc-400 text-xs mb-2 font-medium">Topic</p>
                <div className="flex flex-wrap gap-1.5">
                  {topicConfig.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTopic(t.name)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1",
                        topic === t.name
                          ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                      )}
                    >
                      <span className="text-[10px]">{t.icon}</span> {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings toggles — separated row with divider */}
              <div className="border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBeautyMode((p) => !p)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      beautyMode
                        ? "bg-pink-500/15 text-pink-300 border-pink-500/30"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:text-zinc-400"
                    )}
                  >
                    <Sparkles className="h-3 w-3" /> Beauty
                  </button>
                  <button
                    onClick={() => setStreamQuality((p) => p === "HD" ? "SD" : "HD")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      streamQuality === "HD"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700/50"
                    )}
                  >
                    <Wifi className="h-3 w-3" /> {streamQuality}
                  </button>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700/50 hover:text-zinc-400 transition-all"
                  >
                    <Shield className="h-3 w-3" /> Private
                  </button>
                </div>
              </div>
            </div>

            {/* Camera controls */}
            <div className="flex justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={toggleCamera}
                  className={cn(
                    "w-13 h-13 rounded-2xl flex items-center justify-center transition-all",
                    cameraOn
                      ? "bg-zinc-800/80 hover:bg-zinc-700/80 text-white"
                      : "bg-red-500/30 text-red-300"
                  )}
                  style={{ width: 52, height: 52 }}
                >
                  {cameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                </button>
                <span className="text-[9px] text-zinc-500">{cameraOn ? "Camera" : "Off"}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={toggleMic}
                  className={cn(
                    "w-13 h-13 rounded-2xl flex items-center justify-center transition-all",
                    micOn
                      ? "bg-zinc-800/80 hover:bg-zinc-700/80 text-white"
                      : "bg-red-500/30 text-red-300"
                  )}
                  style={{ width: 52, height: 52 }}
                >
                  {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <span className="text-[9px] text-zinc-500">{micOn ? "Audio" : "Muted"}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button onClick={flipCamera} className="rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 flex items-center justify-center text-white transition-all" style={{ width: 52, height: 52 }}>
                  <RotateCcw className="h-5 w-5" />
                </button>
                <span className="text-[9px] text-zinc-500">Flip</span>
              </div>
            </div>

            {/* Go Live button */}
            <Button
              onClick={goLive}
              className="w-full rounded-2xl h-13 bg-gradient-to-r from-red-500 via-red-500 to-rose-500 hover:from-red-600 hover:via-red-600 hover:to-rose-600 text-white text-[15px] font-bold gap-2.5 shadow-xl shadow-red-500/30 border-0 transition-all active:scale-[0.98]"
              style={{ height: 52 }}
            >
              <Zap className="h-5 w-5" /> Go Live
            </Button>
          </motion.div>
        </div>
      )}

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="text-8xl font-black text-white drop-shadow-[0_0_40px_rgba(255,50,50,0.5)]"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Live phase */}
      {phase === "live" && (
        <div className="relative z-10 flex-1 flex flex-col justify-end">
          {/* New follower notification */}
          <AnimatePresence>
            {newFollower && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-[170px] left-3 z-30"
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-500/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-purple-400/20 shadow-lg shadow-purple-500/20">
                  <Users className="h-3.5 w-3.5 text-white" />
                  <span className="text-white text-[11px] font-semibold">{newFollower}</span>
                  <span className="text-white/60 text-[11px]">followed you</span>
                  <span className="text-sm">💜</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Floating reactions */}
          <AnimatePresence initial={false}>
            {floatingReactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -280, x: r.x }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-40 right-6 text-2xl pointer-events-none z-30 will-change-transform"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Viewer gift notification — animated toast at top */}
          <AnimatePresence>
            {viewerGiftNotif && (
              <motion.div
                key={viewerGiftNotif.id}
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="absolute top-[210px] left-3 right-16 z-30"
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                  style={{
                    background: "linear-gradient(95deg, rgba(120,80,10,0.85) 0%, rgba(180,130,30,0.7) 40%, rgba(220,170,50,0.4) 80%, transparent 100%)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 20px rgba(255,170,0,0.25)",
                    border: "1px solid rgba(255,200,80,0.15)",
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {viewerGiftNotif.sender[0]}
                  </div>
                  {giftImages[viewerGiftNotif.giftName] && (
                    <img src={giftImages[viewerGiftNotif.giftName]} alt="" className="w-7 h-7 object-contain -ml-3 mb-[-6px] relative z-10" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[11px] font-bold truncate">{viewerGiftNotif.sender}</p>
                    <p className="text-amber-100/80 text-[10px]">sent <span className="text-white font-semibold">{viewerGiftNotif.giftName}</span></p>
                  </div>
                  <div className="flex items-center gap-0.5 bg-black/25 rounded-full px-2 py-0.5">
                    <span className="text-[8px]">🪙</span>
                    <span className="text-amber-200 text-[10px] font-bold">{viewerGiftNotif.coins}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Side actions — separated with clear spacing */}
          <div className="absolute right-2 bottom-52 flex flex-col gap-2 items-center z-30">
            {/* Live hardware controls — compact row */}
            <div className="flex flex-col gap-1.5 items-center">
              <button onClick={flipCamera} className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5">
                <RotateCcw className="h-3.5 w-3.5 text-white/60" />
              </button>
              <button onClick={toggleCamera} className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", cameraOn ? "bg-black/30" : "bg-red-500/30")}>
                {cameraOn ? <Camera className="h-3.5 w-3.5 text-white/60" /> : <CameraOff className="h-3.5 w-3.5 text-red-300" />}
              </button>
              <button onClick={toggleMic} className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", micOn ? "bg-black/30" : "bg-red-500/30")}>
                {micOn ? <Mic className="h-3.5 w-3.5 text-white/60" /> : <MicOff className="h-3.5 w-3.5 text-red-300" />}
              </button>
            </div>

            <div className="w-5 border-t border-white/10" />

            {/* Engagement actions */}
            <button onClick={() => setShowLeaderboard((p) => !p)} className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5">
              <Trophy className="h-4 w-4 text-amber-400" />
            </button>

            <div className="flex flex-col items-center">
              <button onClick={() => sendReaction("❤️")} className="w-11 h-11 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5 relative">
                <Heart className="h-5 w-5 text-red-400" />
              </button>
              <span className="text-white text-[9px] mt-0.5 font-medium">{likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
            </div>

            <button onClick={() => setShowGiftPanel(true)} className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-amber-500/20 relative" data-testid="gift-btn">
              <Gift className="h-5 w-5 text-yellow-300" />
              {giftsReceived > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">{giftsReceived > 99 ? "99+" : giftsReceived}</span>
              )}
            </button>
          </div>


          {/* Quick reaction bar — leave room for side action buttons */}
          <div className="px-3 pr-[60px] mb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center shrink-0 active:scale-75 transition-transform text-lg border border-white/5"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat messages overlay */}
          {showChat && (
            <div className="relative px-4 mb-2 max-h-[200px]">
              {/* Gradient fade at top */}
              <div className="absolute top-0 left-4 right-4 h-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none rounded-t-2xl" />
              <div className="overflow-y-auto max-h-[200px] space-y-1.5 pointer-events-none scroll-smooth scrollbar-hide">
                {/* Pinned message */}
                {chatMessages.find((m) => m.isPinned) && (
                  <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 w-fit max-w-[85%] bg-red-500/15 border border-red-500/20 mb-1">
                    <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Pinned</span>
                    <span className="text-[11px] text-white/70">{chatMessages.find((m) => m.isPinned)?.text}</span>
                  </div>
                )}
                {chatMessages.filter((m) => !m.isPinned).slice(-8).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-1.5 w-fit max-w-[80%] animate-in slide-in-from-left-3 fade-in duration-200",
                      msg.isGift ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/20" :
                      msg.isSystem ? "bg-transparent" :
                      "bg-black/40 backdrop-blur-sm"
                    )}
                  >
                    {!msg.isSystem && (
                      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center shrink-0", msg.avatar || "bg-primary/20")}>
                        <span className="text-[9px] text-white font-bold">{msg.user[0]}</span>
                      </div>
                    )}
                    {/* Level badge */}
                    {msg.level && (
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                        msg.level >= 30 ? "bg-amber-500/30 text-amber-300" :
                        msg.level >= 15 ? "bg-blue-500/30 text-blue-300" :
                        "bg-white/10 text-white/50"
                      )}>
                        Lv.{msg.level}
                      </span>
                    )}
                    <span className={cn("text-xs font-medium", msg.isSystem ? "text-white/40 italic" : "text-white/80")}>{msg.user}</span>
                    <span className={cn("text-xs", msg.isGift ? "text-amber-300" : msg.isSystem ? "text-white/30 italic" : "text-white/90")}>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* Chat input + End button */}
          <div className="px-3 pb-4 flex gap-2 items-center" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 16px), 16px)" }}>
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Say something..."
              className="bg-white/10 border-white/10 text-white placeholder:text-white/30 text-sm rounded-2xl flex-1 h-10 focus:border-white/20"
            />
            <Button size="icon" onClick={sendChat} className="rounded-2xl bg-white/15 hover:bg-white/25 shrink-0 h-10 w-10">
              <Send className="h-4 w-4 text-white" />
            </Button>
            <Button onClick={() => setShowEndConfirm(true)} size="sm" className="rounded-2xl text-xs font-bold shrink-0 bg-red-500/80 hover:bg-red-500 text-white h-10 px-4">
              End
            </Button>
          </div>

          {/* Gift panel overlay */}
          <AnimatePresence>
            {showGiftPanel && (
              <motion.div
                initial={{ y: 400 }}
                animate={{ y: 0 }}
                exit={{ y: 400 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-zinc-900/98 backdrop-blur-xl rounded-t-3xl border-t border-white/10"
                style={{ maxHeight: "55vh" }}
              >
                {/* Handle bar */}
                <div className="flex justify-center py-2">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Coin balance + Scrolling banner */}
                <div className="overflow-hidden border-b border-white/5 py-2 px-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-500/15 rounded-full px-2.5 py-1 border border-amber-500/20 shrink-0">
                    <img src={goldCoinIcon} alt="coins" className="w-4 h-4" />
                    <span className="text-amber-300 text-[11px] font-bold">{coinsEarned.toLocaleString()}</span>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs text-white/40 whitespace-nowrap animate-[marquee_8s_linear_infinite]">
                      Unlock Gifts and Coin rewards with your first purchase &nbsp;&nbsp;&nbsp; Unlock Gifts and Coin rewards with your first purchase
                    </p>
                  </div>
                  <button onClick={() => setShowGiftPanel(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <X className="h-3.5 w-3.5 text-white/60" />
                  </button>
                </div>

                {/* Gift grid */}
                <div className="overflow-y-auto px-2 py-3" style={{ maxHeight: "calc(55vh - 120px)" }}>
                  <div className="grid grid-cols-4 gap-1.5">
                    {allGifts[giftTab].map((gift) => (
                      <button
                        key={gift.name}
                        onClick={() => sendGift(gift)}
                        className="relative flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl hover:bg-white/5 active:scale-90 transition-all"
                      >
                        {gift.badge && (
                          <span className={cn(
                            "absolute top-1 right-1 text-[7px] font-bold px-1.5 py-0.5 rounded-full z-10",
                            gift.badge === "Popular" ? "bg-pink-500 text-white" :
                            gift.badge === "NEW" ? "bg-red-500 text-white" :
                            gift.badge === "Unlock" ? "bg-pink-500 text-white" :
                            "bg-blue-500/80 text-white"
                          )}>
                            {gift.badge}
                          </span>
                        )}
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br overflow-hidden", gift.bg)}>
                          {giftImages[gift.name] ? (
                            <img src={giftImages[gift.name]} alt={gift.name} className="w-10 h-10 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-3xl">{gift.icon}</span>
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

                {/* Bottom tabs */}
                <div className="flex items-center border-t border-white/10 px-2 py-2 gap-1" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 8px), 8px)" }}>
                  {(["gifts", "interactive", "exclusive"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGiftTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors",
                        giftTab === tab ? "text-white bg-white/10" : "text-white/40"
                      )}
                    >
                      {tab === "gifts" ? "🎁 Gifts" : tab === "interactive" ? "⚡ Interactive" : "👑 Exclusive"}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-amber-500/20">
                    <span className="text-sm">🪙</span>
                    <span className="text-[11px] text-white font-bold">Recharge</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Top Gifter Leaderboard — positioned at page level */}
      <AnimatePresence>
        {phase === "live" && showLeaderboard && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed right-3 z-50 w-44"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 210px)" }}
          >
            <div
              className="rounded-2xl px-3 py-2.5 space-y-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(30,20,50,0.95) 0%, rgba(40,25,60,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,200,80,0.15)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Top Gifters</span>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3 w-3" />
                </button>
              </div>
              {Object.keys(topGifters).length === 0 ? (
                <p className="text-[10px] text-white/30 text-center py-2">No gifters yet — be the first! 🎁</p>
              ) : (
                Object.entries(topGifters)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([name, coins], i) => {
                    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                    const colors = ["text-amber-300", "text-gray-300", "text-orange-400", "text-white/60", "text-white/60"];
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-sm">{medals[i]}</span>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">{name[0]}</span>
                        </div>
                        <span className="text-[11px] text-white/80 font-medium truncate flex-1">{name}</span>
                        <span className={cn("text-[10px] font-bold", colors[i])}>{coins.toLocaleString()}</span>
                      </div>
                    );
                  })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End stream confirmation dialog */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 22 }}
              className="bg-zinc-900 rounded-3xl p-6 mx-6 max-w-sm w-full border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <Radio className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-white text-lg font-bold text-center">End Stream?</h3>
              <p className="text-white/50 text-sm text-center mt-1.5 mb-5">
                You have {viewerCount} viewers watching. Are you sure you want to end?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowEndConfirm(false)}
                  variant="outline"
                  className="flex-1 rounded-2xl border-white/20 text-white hover:bg-white/10"
                >
                  Keep Going
                </Button>
                <Button
                  onClick={endStream}
                  className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white"
                >
                  End Stream
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen gift animation overlay */}
      <GiftAnimationOverlay
        activeGift={activeGiftAnim}
        onComplete={() => { setActiveGiftAnim(null); setGiftCombo(0); }}
        giftPanelOpen={showGiftPanel}
        comboCount={giftCombo}
      />
    </div>
  );
}
