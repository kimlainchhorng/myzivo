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
import Palette from "lucide-react/dist/esm/icons/palette";
import CalendarPlus from "lucide-react/dist/esm/icons/calendar-plus";
import Volume2 from "lucide-react/dist/esm/icons/volume-2";
import VolumeX from "lucide-react/dist/esm/icons/volume-x";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import Timer from "lucide-react/dist/esm/icons/timer";
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
  const [selectedGift, setSelectedGift] = useState<{ icon: string; name: string; coins: number } | null>(null);
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
  const [giftQty, setGiftQty] = useState(1);
  const [recentGifts, setRecentGifts] = useState<{ icon: string; name: string; coins: number }[]>([]);
  const [pinnedChatMsg, setPinnedChatMsg] = useState<string | null>(null);
  const [cameraFilter, setCameraFilter] = useState<"none" | "warm" | "cool" | "bw" | "vintage">("none");
  const [showViewerList, setShowViewerList] = useState(false);
  const [autoThank, setAutoThank] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [slowMode, setSlowMode] = useState(false);
  const [slowModeCooldown, setSlowModeCooldown] = useState(0);
  const [activePoll, setActivePoll] = useState<{ question: string; options: string[]; votes: number[]; totalVotes: number; expiresAt: number } | null>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const lastGiftTimeRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fakeFollowers = useRef(Math.floor(Math.random() * 800) + 200);

  // ── PK Battle Mode ──
  const [pkBattle, setPkBattle] = useState<{ active: boolean; hostScore: number; opponentScore: number; opponentName: string; endsAt: number; winner: string | null } | null>(null);
  // ── Treasure Chest / Lucky Draw ──
  const [treasureChest, setTreasureChest] = useState<{ active: boolean; countdown: number; participants: string[]; winner: string | null } | null>(null);
  // ── Multi-Guest Co-Host ──
  const [coHosts, setCoHosts] = useState<{ name: string; avatar: string }[]>([]);
  const [showGuestInvite, setShowGuestInvite] = useState(false);
  // ── VIP entrance ──
  const [vipEntrance, setVipEntrance] = useState<{ name: string; level: number } | null>(null);
  // ── Host level ──
  const hostLevel = useMemo(() => Math.min(99, Math.floor(coinsEarned / 50) + 1), [coinsEarned]);
  // ── Chat mute/ban ──
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());

  const cameraFilters: Record<string, string> = useMemo(() => ({
    none: "",
    warm: "sepia(0.25) saturate(1.3) brightness(1.05)",
    cool: "hue-rotate(15deg) saturate(0.9) brightness(1.05)",
    bw: "grayscale(1) contrast(1.1)",
    vintage: "sepia(0.4) contrast(0.9) brightness(1.1) hue-rotate(-10deg)",
  }), []);

  const fakeViewerNames = useMemo(() => ["Luna ✨", "Kai 🔥", "Mia 💜", "Nora 🌸", "Zara 💎", "Leo 🦁", "Aria 🎵", "Alex 🎮", "Jordan 🏀", "Sam 🌊"], []);

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
        setElapsed((p) => {
          const next = p + 1;
          // Duration milestones
          const durationMilestones: Record<number, string> = { 300: "⏱️ 5 minutes! Great start!", 900: "🔥 15 minutes! You're on fire!", 1800: "🏆 30 minutes! Incredible stream!", 3600: "👑 1 hour! Legendary broadcaster!" };
          if (durationMilestones[next]) {
            setChatMessages((prev) => [...prev.slice(-20), { id: `dur-${next}`, user: "🎯", text: durationMilestones[next], isSystem: true }]);
            toast.success(durationMilestones[next]);
          }
          return next;
        });
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
        // Add to chat feed
        setChatMessages((prev) => [
          ...prev.slice(-20),
          { id: `vgift-${Date.now()}`, user: sender, text: `sent ${giftNames[idx]} 🎁`, isGift: true, avatar: ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"][Math.floor(Math.random() * 5)] },
        ]);
        if (soundEnabled) playGiftSound(1);
        // Auto thank-you
        if (autoThank) {
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev.slice(-20),
              { id: `thx-${Date.now()}`, user: "You (Host)", text: `Thank you ${sender} for the ${giftNames[idx]}! ❤️`, avatar: "bg-red-500" },
            ]);
          }, 1500);
        }
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
    if (slowMode && slowModeCooldown > 0) {
      toast(`⏳ Slow mode: wait ${slowModeCooldown}s`, { duration: 1500 });
      return;
    }
    setChatMessages((prev) => [...prev.slice(-20), { id: Date.now().toString(), user: "You (Host)", text: chatInput, avatar: "bg-red-500" }]);
    setChatInput("");
    if (slowMode) {
      setSlowModeCooldown(5);
      const iv = setInterval(() => {
        setSlowModeCooldown((p) => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; });
      }, 1000);
    }
  }, [chatInput, slowMode, slowModeCooldown]);

  // Helper: get top gifter name
  const topGifterName = useMemo(() => {
    const entries = Object.entries(topGifters);
    if (entries.length === 0) return null;
    return entries.sort(([, a], [, b]) => b - a)[0][0];
  }, [topGifters]);

  // Create poll
  const createPoll = useCallback(() => {
    const q = pollQuestion.trim();
    const opts = pollOptions.filter((o) => o.trim());
    if (!q || opts.length < 2) { toast.error("Need a question and at least 2 options"); return; }
    setActivePoll({ question: q, options: opts, votes: opts.map(() => 0), totalVotes: 0, expiresAt: Date.now() + 60000 });
    setShowPollCreator(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setChatMessages((prev) => [...prev.slice(-20), { id: `poll-${Date.now()}`, user: "📊", text: `Poll: "${q}" — Vote now!`, isSystem: true }]);
    toast.success("📊 Poll created!");
    // Auto simulate votes
    const voteIv = setInterval(() => {
      setActivePoll((prev) => {
        if (!prev || Date.now() > prev.expiresAt) { clearInterval(voteIv); return null; }
        const idx = Math.floor(Math.random() * prev.options.length);
        const newVotes = [...prev.votes];
        newVotes[idx] += 1;
        return { ...prev, votes: newVotes, totalVotes: prev.totalVotes + 1 };
      });
    }, 3000 + Math.random() * 4000);
    setTimeout(() => clearInterval(voteIv), 60000);
  }, [pollQuestion, pollOptions]);

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

  // ── PK Battle simulation ──
  useEffect(() => {
    if (!pkBattle?.active || phase !== "live") return;
    const iv = setInterval(() => {
      setPkBattle((prev) => {
        if (!prev || !prev.active) return prev;
        if (Date.now() > prev.endsAt) {
          const winner = prev.hostScore >= prev.opponentScore ? "You" : prev.opponentName;
          setChatMessages((p) => [...p.slice(-20), { id: `pk-end-${Date.now()}`, user: "⚔️", text: `PK Battle ended! ${winner} wins! 🏆`, isSystem: true }]);
          toast.success(`⚔️ ${winner} won the PK Battle!`);
          return { ...prev, active: false, winner };
        }
        // Opponent scores randomly
        const oppDelta = Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0;
        return { ...prev, opponentScore: prev.opponentScore + oppDelta };
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [pkBattle?.active, phase]);

  // PK: gifts during battle add to host score
  const addPkScore = useCallback((coins: number) => {
    setPkBattle((prev) => prev?.active ? { ...prev, hostScore: prev.hostScore + coins } : prev);
  }, []);

  // ── Treasure Chest countdown ──
  useEffect(() => {
    if (!treasureChest?.active || treasureChest.winner) return;
    // Auto-add fake participants
    const joinIv = setInterval(() => {
      setTreasureChest((prev) => {
        if (!prev || !prev.active) return prev;
        const names = ["Luna", "Kai", "Mia", "Nora", "Leo", "Aria", "Zara", "Sam"];
        if (prev.participants.length < 8 && Math.random() > 0.4) {
          const n = names.filter((n) => !prev.participants.includes(n));
          if (n.length > 0) return { ...prev, participants: [...prev.participants, n[Math.floor(Math.random() * n.length)]] };
        }
        return prev;
      });
    }, 2000);
    // Countdown
    const cdIv = setInterval(() => {
      setTreasureChest((prev) => {
        if (!prev || !prev.active) return prev;
        if (prev.countdown <= 1) {
          const allP = prev.participants.length > 0 ? prev.participants : ["Lucky Viewer"];
          const winner = allP[Math.floor(Math.random() * allP.length)];
          const prize = [10, 25, 50, 100][Math.floor(Math.random() * 4)];
          setChatMessages((p) => [...p.slice(-20), { id: `chest-win-${Date.now()}`, user: "🎁", text: `${winner} won ${prize} Z Coins from the Treasure Chest! 🎉`, isSystem: true }]);
          toast.success(`🎁 ${winner} won ${prize} Z Coins!`);
          return { ...prev, active: false, winner, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    return () => { clearInterval(joinIv); clearInterval(cdIv); };
  }, [treasureChest?.active, treasureChest?.winner]);

  // ── VIP entrance simulation ──
  useEffect(() => {
    if (phase !== "live") return;
    const vipNames = [{ name: "Diamond_VIP 💎", level: 50 }, { name: "King_Whale 👑", level: 80 }, { name: "Platinum_Star ⭐", level: 65 }];
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (Math.random() > 0.7) {
          const vip = vipNames[Math.floor(Math.random() * vipNames.length)];
          setVipEntrance(vip);
          setChatMessages((p) => [...p.slice(-20), { id: `vip-${Date.now()}`, user: "👑", text: `${vip.name} (Lv.${vip.level}) entered the stream!`, isSystem: true }]);
          setTimeout(() => setVipEntrance(null), 4000);
        }
        schedule();
      }, 40000 + Math.random() * 30000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [phase]);

  const sendReaction = useCallback((emoji: string) => {
    spawnFloatingReaction(emoji);
    setLikes((p) => p + 1);
  }, [spawnFloatingReaction]);

  const sendGift = useCallback((gift: { icon: string; name: string; coins: number }, qty = 1) => {
    // Haptic feedback on mobile
    try { navigator.vibrate?.(qty > 1 ? [50, 30, 50] : [50]); } catch {} // eslint-disable-line no-empty
    const senders = ["Alex", "Jordan", "Sam", "Taylor", "Morgan"];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const totalCoins = gift.coins * qty;
    setGiftsReceived((p) => p + qty);
    setCoinsEarned((p) => p + totalCoins);
    setTopGifters((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + totalCoins }));
    spawnFloatingReaction(gift.icon);

    // Track recent gifts (unique, max 4)
    setRecentGifts((prev) => {
      const filtered = prev.filter((g) => g.name !== gift.name);
      return [gift, ...filtered].slice(0, 4);
    });

    // Add gift message to chat
    setChatMessages((prev) => [
      ...prev.slice(-20),
      {
        id: `gift-${Date.now()}`,
        user: sender,
        text: qty > 1 ? `sent ${gift.name} x${qty} (${totalCoins.toLocaleString()} coins) 🎁` : `sent ${gift.name} (${gift.coins} coins) 🎁`,
        isGift: true,
        avatar: ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"][Math.floor(Math.random() * 5)],
      },
    ]);

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
    if (soundEnabled) {
      const isPremium = !!giftAnimationVideos[gift.name];
      if (isPremium) {
        playPremiumGiftSound();
      } else {
        playGiftSound(newCombo);
      }
    }
    
    setActiveGiftAnim({ name: gift.name, coins: totalCoins, senderName: sender });
    setGiftQty(1); // Reset qty after send
    // Add to PK Battle score if active
    addPkScore(totalCoins);
  }, [spawnFloatingReaction, giftCombo, addPkScore]);

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
              <img src={goldCoinIcon} alt="coins" className="h-6 w-6 mx-auto mb-1" />
              <p className="text-xl font-bold text-amber-300">{coinsEarned}</p>
              <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">Z Coins Earned</p>
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
               <span className="text-xs text-white/50">Shares</span>
               <span className="text-sm font-semibold text-blue-400">{shareCount} 🔗</span>
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
                      <span className="text-xs text-amber-300 font-bold flex items-center gap-1">{coins.toLocaleString()} <img src={goldCoinIcon} alt="" className="w-3.5 h-3.5 inline" /></span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Share prompt */}
          {shareCount === 0 && (
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                <Share2 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">Share your stream highlights!</p>
                <p className="text-white/40 text-[10px]">Let your audience know about your next stream</p>
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `Watch ${title} on ZIVO Live!`, url: window.location.origin + "/live" }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(window.location.origin + "/live");
                    toast.success("Link copied!");
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold shrink-0 active:scale-95 transition-transform"
              >
                Share
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate("/live")} className="rounded-full flex-1 border-white/20 text-white hover:bg-white/10">
              Back to Live
            </Button>
            <Button
              onClick={() => {
                setPhase("setup"); setElapsed(0); setViewerCount(0); setPeakViewers(0);
                setLikes(0); setChatMessages([]); setGiftsReceived(0); setCoinsEarned(0); setTopGifters({}); setGiftStreakFlash(false); setShowLeaderboard(false); setGoalCelebrated(false); setGiftCombo(0); setNewFollowersCount(0); setShareCount(0); setNewFollower(null); setSelectedGift(null); setRecentGifts([]); setPinnedChatMsg(null); setGiftQty(1); setCameraFilter("none"); setShowViewerList(false); setActivePoll(null); setShowPollCreator(false); setSlowModeCooldown(0); lastMilestoneRef.current = 0; startCamera();
              }}
              className="rounded-full flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
            >
              Go Live Again
            </Button>
          </div>

          {/* Wallet CTA */}
          {coinsEarned > 0 && (
            <button
              onClick={() => navigate("/wallet")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/20 active:scale-[0.98] transition-transform mt-1"
            >
              <img src={goldCoinIcon} alt="" className="w-5 h-5" />
              <span className="text-amber-300 text-sm font-semibold">View Wallet & Earnings</span>
            </button>
          )}

          {/* Schedule Next Stream */}
          <button
            onClick={() => toast("📅 Stream scheduling coming soon!", { description: "Set a time and notify your followers automatically." })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 active:scale-[0.98] transition-transform"
          >
            <CalendarPlus className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Schedule Next Stream</span>
          </button>
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
              {phase === "setup" && (
                <Button size="sm" variant="outline" onClick={startCamera} className="text-white border-white/20 rounded-full">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry
                </Button>
              )}
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
            style={{ filter: cameraFilters[cameraFilter] || undefined }}
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
          onClick={() => {
            if (showGiftPanel) { setShowGiftPanel(false); setSelectedGift(null); return; }
            streamRef.current?.getTracks().forEach((t) => t.stop()); phase === "live" ? setShowEndConfirm(true) : navigate(-1);
          }}
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
        <div className="relative z-10 pl-4 pr-14 mt-3">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20">
                {user?.email?.[0]?.toUpperCase() || "Z"}
              </div>
              {/* Host Level Badge */}
              <span className={cn(
                "absolute -bottom-1 -right-1 text-[7px] font-bold px-1 py-0.5 rounded-full border",
                hostLevel >= 50 ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-amber-300/50" :
                hostLevel >= 20 ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-blue-300/50" :
                "bg-white/20 text-white/80 border-white/20"
              )}>
                {hostLevel}
              </span>
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
                  <button
                    onClick={() => { setAutoThank((p) => !p); toast(autoThank ? "Auto-thank disabled" : "Auto-thank enabled ❤️", { duration: 1500 }); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      autoThank
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:text-zinc-400"
                    )}
                  >
                    <Heart className="h-3 w-3" /> Thank
                  </button>
                  <button
                    onClick={() => { setSoundEnabled((p) => !p); toast(soundEnabled ? "🔇 Sounds muted" : "🔊 Sounds on", { duration: 1500 }); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      soundEnabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:text-zinc-400"
                    )}
                  >
                    {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />} Sound
                  </button>
                  <button
                    onClick={() => { setSlowMode((p) => !p); toast(slowMode ? "Slow mode off" : "⏳ Slow mode on (5s)", { duration: 1500 }); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border",
                      slowMode
                        ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700/50 hover:text-zinc-400"
                    )}
                  >
                    <Timer className="h-3 w-3" /> Slow
                  </button>
                </div>
                {/* Second row */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => toast("📡 Screen share coming soon!", { description: "Share your screen with viewers" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700/50 hover:text-zinc-400 transition-all"
                  >
                    <Monitor className="h-3 w-3" /> Screen
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/60 text-lg font-semibold tracking-wider uppercase"
          >
            Going Live in
          </motion.p>
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/30 text-sm"
          >
            {topic} · {title || "My Live Stream"}
          </motion.p>
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
                    <img src={goldCoinIcon} alt="" className="w-3 h-3" />
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
              <button onClick={() => setBeautyMode((p) => !p)} className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", beautyMode ? "bg-pink-500/30 border-pink-500/20" : "bg-black/30")}>
                <Sparkles className={cn("h-3.5 w-3.5", beautyMode ? "text-pink-300" : "text-white/60")} />
              </button>
              <button
                onClick={() => {
                  const filters: Array<"none" | "warm" | "cool" | "bw" | "vintage"> = ["none", "warm", "cool", "bw", "vintage"];
                  const idx = filters.indexOf(cameraFilter);
                  setCameraFilter(filters[(idx + 1) % filters.length]);
                  toast(`🎨 Filter: ${filters[(idx + 1) % filters.length] === "none" ? "Off" : filters[(idx + 1) % filters.length]}`, { duration: 1500 });
                }}
                className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", cameraFilter !== "none" ? "bg-cyan-500/30 border-cyan-500/20" : "bg-black/30")}
              >
                <Palette className={cn("h-3.5 w-3.5", cameraFilter !== "none" ? "text-cyan-300" : "text-white/60")} />
              </button>
            </div>

            <div className="w-5 border-t border-white/10" />

            {/* Engagement actions */}
            <button onClick={() => setShowViewerList((p) => !p)} className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5 relative">
              <Users className="h-4 w-4 text-white/70" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-green-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center px-0.5">{viewerCount}</span>
            </button>

            <button onClick={() => setShowLeaderboard((p) => !p)} className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5">
              <Trophy className="h-4 w-4 text-amber-400" />
            </button>

            {/* Sound toggle */}
            <button onClick={() => { setSoundEnabled((p) => !p); toast(soundEnabled ? "🔇 Muted" : "🔊 Sound on", { duration: 1200 }); }} className={cn("w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", soundEnabled ? "bg-black/30" : "bg-red-500/20")}>
              {soundEnabled ? <Volume2 className="h-4 w-4 text-white/70" /> : <VolumeX className="h-4 w-4 text-red-300" />}
            </button>

            {/* Poll button */}
            <button onClick={() => setShowPollCreator((p) => !p)} className={cn("w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", activePoll ? "bg-blue-500/25 border-blue-500/20" : "bg-black/30")}>
              <BarChart3 className={cn("h-4 w-4", activePoll ? "text-blue-300" : "text-white/70")} />
            </button>

            {/* PK Battle button */}
            <button
              onClick={() => {
                if (pkBattle?.active) { toast("⚔️ Battle already in progress!"); return; }
                const opponents = ["DJ_Luna", "KingAlex", "StarMia", "ProGamer99"];
                const opp = opponents[Math.floor(Math.random() * opponents.length)];
                setPkBattle({ active: true, hostScore: 0, opponentScore: 0, opponentName: opp, endsAt: Date.now() + 120000, winner: null });
                setChatMessages((prev) => [...prev.slice(-20), { id: `pk-${Date.now()}`, user: "⚔️", text: `PK Battle started vs ${opp}! Send gifts to support!`, isSystem: true }]);
                toast.success(`⚔️ PK Battle vs ${opp}!`);
              }}
              className={cn("w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", pkBattle?.active ? "bg-red-500/25 border-red-500/20" : "bg-black/30")}
            >
              <span className="text-sm">⚔️</span>
            </button>

            {/* Treasure Chest */}
            <button
              onClick={() => {
                if (treasureChest?.active) return;
                setTreasureChest({ active: true, countdown: 15, participants: [], winner: null });
                setChatMessages((prev) => [...prev.slice(-20), { id: `chest-${Date.now()}`, user: "🎁", text: "Treasure Chest opened! Tap to join the draw!", isSystem: true }]);
                toast("🎁 Treasure Chest! 15s to join!", { duration: 3000 });
              }}
              className={cn("w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", treasureChest?.active ? "bg-amber-500/25 border-amber-500/20" : "bg-black/30")}
            >
              <span className="text-sm">🎁</span>
            </button>

            {/* Guest Invite */}
            <button
              onClick={() => setShowGuestInvite((p) => !p)}
              className={cn("w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", coHosts.length > 0 ? "bg-purple-500/25 border-purple-500/20" : "bg-black/30")}
            >
              <span className="text-sm">👥</span>
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
            <div className="relative pl-4 pr-14 mb-2 max-h-[200px]">
              {/* Gradient fade at top */}
              <div className="absolute top-0 left-4 right-4 h-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none rounded-t-2xl" />
              <div className="overflow-y-auto max-h-[200px] space-y-1.5 scroll-smooth scrollbar-hide">
                {/* Pinned message (system or host-pinned) */}
                {(pinnedChatMsg || chatMessages.find((m) => m.isPinned)) && (
                  <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 w-fit max-w-[85%] bg-red-500/15 border border-red-500/20 mb-1 pointer-events-auto">
                    <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Pinned</span>
                    <span className="text-[11px] text-white/70">{pinnedChatMsg || chatMessages.find((m) => m.isPinned)?.text}</span>
                    {pinnedChatMsg && (
                      <button onClick={() => setPinnedChatMsg(null)} className="text-white/30 hover:text-white/60 ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
                {chatMessages.filter((m) => !m.isPinned).slice(-8).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (!msg.isSystem && !msg.isGift) {
                        setPinnedChatMsg(`${msg.user}: ${msg.text}`);
                        toast.success(`📌 Pinned message from ${msg.user}`);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-1.5 w-fit max-w-[80%] animate-in slide-in-from-left-3 fade-in duration-200 pointer-events-auto cursor-pointer",
                      msg.isGift ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/20" :
                      msg.isSystem ? "bg-transparent pointer-events-none" :
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
                    {/* Top Fan badge */}
                    {topGifterName && msg.user === topGifterName && (
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/30 text-amber-200 border border-amber-500/30">⭐ Top Fan</span>
                    )}
                    <span className={cn("text-xs font-medium", msg.isSystem ? "text-white/40 italic" : "text-white/80")}>{msg.user}</span>
                    <span className={cn("text-xs", msg.isGift ? "text-amber-300" : msg.isSystem ? "text-white/30 italic" : "text-white/90")}>{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* Active Poll Widget */}
          <AnimatePresence>
            {activePoll && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="px-3 mb-2"
              >
                <div className="bg-blue-950/70 backdrop-blur-md rounded-2xl p-3 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-[11px] font-bold text-blue-300">POLL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/40">{activePoll.totalVotes} votes</span>
                      <button onClick={() => setActivePoll(null)} className="text-white/30 hover:text-white/60">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold mb-2">{activePoll.question}</p>
                  <div className="space-y-1.5">
                    {activePoll.options.map((opt, i) => {
                      const pct = activePoll.totalVotes > 0 ? Math.round((activePoll.votes[i] / activePoll.totalVotes) * 100) : 0;
                      return (
                        <div key={i} className="relative">
                          <div className="h-7 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                            <motion.div
                              className="h-full rounded-lg bg-blue-500/25"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ type: "spring", damping: 20 }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-between px-2.5">
                            <span className="text-[11px] text-white/80 font-medium">{opt}</span>
                            <span className="text-[10px] text-blue-300 font-bold">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Poll Creator */}
          <AnimatePresence>
            {showPollCreator && !activePoll && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="px-3 mb-2"
              >
                <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/70">📊 Create Poll</span>
                    <button onClick={() => setShowPollCreator(false)} className="text-white/30 hover:text-white/60">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <Input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    maxLength={80}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs rounded-xl h-8"
                  />
                  {pollOptions.map((opt, i) => (
                    <Input
                      key={i}
                      value={opt}
                      onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                      placeholder={`Option ${i + 1}`}
                      maxLength={40}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs rounded-xl h-8"
                    />
                  ))}
                  <div className="flex gap-2">
                    {pollOptions.length < 4 && (
                      <button onClick={() => setPollOptions((p) => [...p, ""])} className="text-[10px] text-blue-400 font-medium">+ Add option</button>
                    )}
                    <div className="flex-1" />
                    <button onClick={createPoll} className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold active:scale-95 transition-transform">
                      Start Poll
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat input + End button */}
          <div className="px-3 pb-4 flex gap-2 items-center" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 16px), 16px)" }}>
            {slowMode && slowModeCooldown > 0 && (
              <span className="text-[9px] text-blue-300 font-medium absolute -top-5 left-4">⏳ Slow mode: {slowModeCooldown}s</span>
            )}
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder={slowMode ? `Slow mode (${slowModeCooldown > 0 ? `${slowModeCooldown}s` : "ready"})` : "Say something..."}
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
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 bg-amber-500/15 rounded-full px-2.5 py-1 border border-amber-500/20">
                        <img src={goldCoinIcon} alt="coins" className="w-4 h-4" />
                        <span className="text-amber-300 text-[11px] font-bold">{coinsEarned.toLocaleString()}</span>
                      </div>
                      <span className="text-[8px] text-amber-400/50 uppercase tracking-wider font-medium">Earned</span>
                    </div>
                    <button
                      onClick={() => toast("💰 Coin Recharge coming soon!", { description: "You'll be able to purchase Z Coins to send premium gifts." })}
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
                  <button onClick={() => setShowGiftPanel(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <X className="h-3.5 w-3.5 text-white/60" />
                  </button>
                </div>

                {/* Recent gifts quick row */}
                {recentGifts.length > 0 && (
                  <div className="px-3 pb-2 border-b border-white/5">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider font-medium mb-1.5">Recently Sent</p>
                    <div className="flex gap-2">
                      {recentGifts.map((g) => (
                        <button
                          key={`recent-${g.name}`}
                          onClick={() => { sendGift(g); }}
                          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                        >
                          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {giftImages[g.name] ? (
                              <img src={giftImages[g.name]} alt="" className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-xl">{g.icon}</span>
                            )}
                          </div>
                          <span className="text-[8px] text-white/40">{g.coins}</span>
                        </button>
                      ))}
                      {/* Lucky Bag */}
                      <button
                        onClick={() => {
                          const allItems = allGifts[giftTab];
                          const lucky = allItems[Math.floor(Math.random() * allItems.length)];
                          sendGift(lucky);
                          toast(`🎲 Lucky! You sent ${lucky.name}!`);
                        }}
                        className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                          <span className="text-xl">🎲</span>
                        </div>
                        <span className="text-[8px] text-purple-300">Lucky</span>
                      </button>
                    </div>
                  </div>
                )}

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
                            gift.badge === "Unlock" ? "bg-pink-500 text-white" :
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
                          onClick={() => { sendGift(selectedGift, giftQty); setSelectedGift(null); }}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-4 py-2 shadow-lg active:scale-95 transition-transform shrink-0",
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
                <div className="flex items-center border-t border-white/10 px-2 py-2 gap-1" style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 8px), 8px)" }}>
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
                    onClick={() => toast("💰 Coin Recharge coming soon!", { description: "You'll be able to purchase Z Coins to send premium gifts." })}
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
                        <span className={cn("text-[10px] font-bold flex items-center gap-0.5", colors[i])}><img src={goldCoinIcon} alt="" className="w-3 h-3" />{coins.toLocaleString()}</span>
                      </div>
                    );
                  })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewer List popup */}
      <AnimatePresence>
        {phase === "live" && showViewerList && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed right-3 z-50 w-48"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 210px)" }}
          >
            <div
              className="rounded-2xl px-3 py-2.5 space-y-1"
              style={{
                background: "linear-gradient(135deg, rgba(20,30,50,0.95) 0%, rgba(25,35,60,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(100,200,255,0.12)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Viewers ({viewerCount})</span>
                </div>
                <button onClick={() => setShowViewerList(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3 w-3" />
                </button>
              </div>
              {fakeViewerNames.slice(0, Math.min(viewerCount, 10)).map((name, i) => (
                <div key={name} className="flex items-center gap-2 py-0.5">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold", ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"][i % 5])}>
                    {name[0]}
                  </div>
                  <span className="text-[11px] text-white/80 flex-1 truncate">{name}</span>
                  {i === 0 && <span className="text-[7px] bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded-full font-bold">TOP</span>}
                </div>
              ))}
              {viewerCount > 10 && (
                <p className="text-[9px] text-white/30 text-center pt-1">+{viewerCount - 10} more</p>
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
              <p className="text-white/50 text-sm text-center mt-1.5">
                You have {viewerCount} viewers watching.
              </p>
              {coinsEarned > 0 && (
                <div className="flex items-center justify-center gap-1.5 mt-2 mb-3">
                  <img src={goldCoinIcon} alt="" className="w-4 h-4" />
                  <span className="text-amber-300 text-sm font-bold">{coinsEarned} Z Coins earned</span>
                </div>
              )}
              <p className="text-white/30 text-xs text-center mb-5">Are you sure you want to end?</p>
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
