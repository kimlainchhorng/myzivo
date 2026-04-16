/**
 * GoLivePage — Broadcast a live stream with camera, title, and chat
 * Premium 2026 redesign with enhanced visuals
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useGiftAnimationQueue } from "@/hooks/useGiftAnimationQueue";
import goldCoinIcon from "@/assets/gifts/gold-coin.png";
import { lazy, Suspense } from "react";
const GiftAnimationOverlay = lazy(() => import("@/components/live/GiftAnimationOverlay"));
const CoinRechargeSheet = lazy(() => import("@/components/live/CoinRechargeSheet"));
import { playGiftSound, playPremiumGiftSound, playLegendaryGiftSound } from "@/utils/giftSounds";
import { hasGiftVideo, giftAnimationVideos, preloadGiftAnimations } from "@/config/giftAnimations";
import { giftCatalog, getLevelColor, getLevelBg, type GiftItem } from "@/config/giftCatalog";
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
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Crown from "lucide-react/dist/esm/icons/crown";
import Flame from "lucide-react/dist/esm/icons/flame";
import Star from "lucide-react/dist/esm/icons/star";
import Medal from "lucide-react/dist/esm/icons/medal";
import Swords from "lucide-react/dist/esm/icons/swords";
import Music from "lucide-react/dist/esm/icons/music";
import Gamepad2 from "lucide-react/dist/esm/icons/gamepad-2";
import ChefHat from "lucide-react/dist/esm/icons/chef-hat";
import Laptop from "lucide-react/dist/esm/icons/laptop";
import Dumbbell from "lucide-react/dist/esm/icons/dumbbell";
import PaintBucket from "lucide-react/dist/esm/icons/paintbrush";
import Plane from "lucide-react/dist/esm/icons/plane";
import Shirt from "lucide-react/dist/esm/icons/shirt";
import Laugh from "lucide-react/dist/esm/icons/laugh";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Globe from "lucide-react/dist/esm/icons/globe";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Link from "lucide-react/dist/esm/icons/link";
import Gem from "lucide-react/dist/esm/icons/gem";
import Clapperboard from "lucide-react/dist/esm/icons/clapperboard";
import Check from "lucide-react/dist/esm/icons/check";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Waves from "lucide-react/dist/esm/icons/waves";
import Hand from "lucide-react/dist/esm/icons/hand";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Coins from "lucide-react/dist/esm/icons/coins";
import CircleDot from "lucide-react/dist/esm/icons/circle-dot";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import { ReactionIcon, MedalIcon, QUICK_REACTIONS } from "@/utils/reactionIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { giftImages, preloadGiftImages } from "@/config/giftIcons";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type LivePhase = "setup" | "countdown" | "live" | "ended";

export default function GoLivePage() {
  // Preload gift video URLs in background
  useEffect(() => { preloadGiftAnimations(); preloadGiftImages(); }, []);
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
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const [giftsReceived, setGiftsReceived] = useState(0);
  const [giftTab, setGiftTab] = useState<"gifts" | "interactive" | "exclusive">("gifts");
  const [beautyMode, setBeautyMode] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [streamQuality, setStreamQuality] = useState<"HD" | "SD">("HD");
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [coinBalance, setCoinBalance] = useState(1250);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const { activeGift: activeGiftAnim, comboCount: giftCombo, enqueue: enqueueGiftAnim, onComplete: onGiftAnimComplete } = useGiftAnimationQueue();
  const [viewerGiftNotif, setViewerGiftNotif] = useState<{ id: string; sender: string; giftName: string; coins: number } | null>(null);
  // ── Gift notification queue (right-side stacked, TikTok-style) ──
  const [giftNotifQueue, setGiftNotifQueue] = useState<{ id: string; sender: string; giftName: string; coins: number }[]>([]);
  // ── "Gift Sent!" flyout when user sends ──
  const [sentGiftFlyout, setSentGiftFlyout] = useState<{ id: string; giftName: string; coins: number; qty: number; combo: number; tier: number } | null>(null);
  // ── Send button sparkle burst ──
  const [sendSparkle, setSendSparkle] = useState(false);
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
  // ── Cash out state ──
  const [cashedOut, setCashedOut] = useState(false);
  // ── Host level ──
  const hostLevel = useMemo(() => Math.min(99, Math.floor(coinsEarned / 50) + 1), [coinsEarned]);
  // ── Chat mute/ban ──
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());

  // ── NEW: Face Stickers / AR Effects ──
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [showStickerPanel, setShowStickerPanel] = useState(false);

  // ── NEW: Clip / Highlight capture ──
  const [clipSaved, setClipSaved] = useState(false);

  // ── NEW: Revenue mini-dashboard ──
  const [showRevenueDash, setShowRevenueDash] = useState(false);

  // ── NEW: Top-3 gifter mini-banner always visible ──
  const [showTop3Banner, setShowTop3Banner] = useState(true);

  // ── NEW: Combo multiplier text ──
  const [comboMultiplierText, setComboMultiplierText] = useState<{ text: string; id: string } | null>(null);

  // ── NEW v3: Gift Streak Counter ──
  const [giftStreakCount, setGiftStreakCount] = useState(0);
  const giftStreakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── NEW v3: Super Chat ──
  const [superChat, setSuperChat] = useState<{ user: string; text: string; coins: number; id: string } | null>(null);

  // ── NEW v3: Milestone Celebrations ──
  const [milestoneEffect, setMilestoneEffect] = useState<"confetti" | "firework" | null>(null);

  // ── NEW v3: Wave animation ──
  const [waveActive, setWaveActive] = useState(false);

  // ── NEW v3: Chat Trending Words ──
  const [trendingWord, setTrendingWord] = useState<string | null>(null);

  // ── NEW v4: Hashtags for discovery ──
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");

  // ── NEW v4: Background Music ──
  const [bgMusic, setBgMusic] = useState<string | null>(null);

  // ── NEW v4: On-demand stream effects ──
  const [screenEffect, setScreenEffect] = useState<"confetti" | "hearts" | "fire" | null>(null);

  // ── NEW v4: Stream Rating (ended phase) ──
  const [streamRating, setStreamRating] = useState(0);

  // ── NEW v4: Animated coin counter (ended) ──
  const [displayedCoins, setDisplayedCoins] = useState(0);

  // ── Expandable sidebar "More Tools" ──
  const [showMoreTools, setShowMoreTools] = useState(false);

  const cameraFilters: Record<string, string> = useMemo(() => ({
    none: "",
    warm: "sepia(0.25) saturate(1.3) brightness(1.05)",
    cool: "hue-rotate(15deg) saturate(0.9) brightness(1.05)",
    bw: "grayscale(1) contrast(1.1)",
    vintage: "sepia(0.4) contrast(0.9) brightness(1.1) hue-rotate(-10deg)",
  }), []);

  const fakeViewerNames = useMemo(() => ["Luna", "Kai", "Mia", "Nora", "Zara", "Leo", "Aria", "Alex", "Jordan", "Sam"], []);

  const faceStickers = useMemo(() => [
    { id: "dog", icon: <span className="text-amber-300"><Heart className="h-5 w-5" /></span>, label: "Dog Ears", filter: "drop-shadow(0 0 8px rgba(255,200,100,0.5))" },
    { id: "hearts", icon: <Heart className="h-5 w-5 text-pink-400" />, label: "Love", filter: "drop-shadow(0 0 8px rgba(255,100,150,0.5))" },
    { id: "crown", icon: <Crown className="h-5 w-5 text-amber-400" />, label: "Crown", filter: "drop-shadow(0 0 8px rgba(255,215,0,0.5))" },
    { id: "stars", icon: <Star className="h-5 w-5 text-blue-300" />, label: "Stars", filter: "drop-shadow(0 0 8px rgba(200,200,255,0.5))" },
    { id: "bunny", icon: <Sparkles className="h-5 w-5 text-pink-300" />, label: "Bunny", filter: "drop-shadow(0 0 8px rgba(255,180,200,0.5))" },
    { id: "devil", icon: <Flame className="h-5 w-5 text-red-400" />, label: "Devil", filter: "drop-shadow(0 0 8px rgba(200,50,100,0.5))" },
    { id: "angel", icon: <Sparkles className="h-5 w-5 text-sky-300" />, label: "Angel", filter: "drop-shadow(0 0 8px rgba(180,220,255,0.5))" },
    { id: "fire", icon: <Flame className="h-5 w-5 text-orange-400" />, label: "Fire", filter: "drop-shadow(0 0 8px rgba(255,100,0,0.5))" },
  ], []);

  const allGifts = useMemo(() => giftCatalog, []);

  const quickReactions = useMemo(() => [
    { icon: <Heart className="h-4 w-4 text-red-400" />, key: "heart" },
    { icon: <Flame className="h-4 w-4 text-orange-400" />, key: "fire" },
    { icon: <Star className="h-4 w-4 text-yellow-400" />, key: "star" },
    { icon: <Hand className="h-4 w-4 text-white/80" />, key: "clap" },
    { icon: <Laugh className="h-4 w-4 text-amber-300" />, key: "laugh" },
  ], []);

  const topicConfig = useMemo(() => [
    { name: "General", icon: <Globe className="h-3.5 w-3.5" /> },
    { name: "Music", icon: <Music className="h-3.5 w-3.5" /> },
    { name: "Gaming", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { name: "Cooking", icon: <ChefHat className="h-3.5 w-3.5" /> },
    { name: "Tech", icon: <Laptop className="h-3.5 w-3.5" /> },
    { name: "Fitness", icon: <Dumbbell className="h-3.5 w-3.5" /> },
    { name: "Art", icon: <PaintBucket className="h-3.5 w-3.5" /> },
    { name: "Travel", icon: <Plane className="h-3.5 w-3.5" /> },
    { name: "Fashion", icon: <Shirt className="h-3.5 w-3.5" /> },
    { name: "Comedy", icon: <Laugh className="h-3.5 w-3.5" /> },
    { name: "Education", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { name: "Sports", icon: <CircleDot className="h-3.5 w-3.5" /> },
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
          text: `Welcome to "${streamTitle}"! Be respectful and have fun!`,
          isSystem: true,
          isPinned: true,
          avatar: "bg-red-500",
        }]);
        toast.success("You're live!");
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
    const msgs = ["Amazing!", "This is amazing!", "Hello from NYC!", "Love this!", "First time here!", "Keep going!", "Wow!", "Amazing work!", "You're amazing!", "Can't stop watching!"];
    const avatarColors = ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500"];

    let lastViewer = 0, lastLike = 0, lastElapsed = 0, lastChat = 0;
    let raf: number;
    const tick = (now: number) => {
      if (!lastViewer) { lastViewer = lastLike = lastElapsed = lastChat = now; }

      if (now - lastElapsed >= 1000) {
        setElapsed((p) => {
          const next = p + 1;
          // Duration milestones
          const durationMilestones: Record<number, string> = { 300: "5 minutes! Great start!", 900: "15 minutes! You're on fire!", 1800: "30 minutes! Incredible stream!", 3600: "1 hour! Legendary broadcaster!" };
          if (durationMilestones[next]) {
            setChatMessages((prev) => [...prev.slice(-20), { id: `dur-${next}`, user: "System", text: durationMilestones[next], isSystem: true }]);
            toast.success(durationMilestones[next]);
          }
          return next;
        });
        lastElapsed = now;
      }
      if (now - lastViewer >= 3000) {
        setViewerCount((p) => {
          const growthPhase = p < 20;
          const delta = growthPhase
            ? Math.floor(Math.random() * 4) + 1
            : Math.random() > 0.35 ? Math.floor(Math.random() * 3) + 1 : -Math.floor(Math.random() * 2);
          const next = Math.max(0, Math.min(500, p + delta));
          setPeakViewers((pk) => Math.max(pk, next));
          if (next !== p) { setViewerPulse(true); setTimeout(() => setViewerPulse(false), 600); }
          const milestones = [10, 25, 50, 100, 250, 500];
          for (const m of milestones) {
            if (next >= m && p < m && m > lastMilestoneRef.current) {
              lastMilestoneRef.current = m;
              setChatMessages((prev) => [
                ...prev.slice(-20),
                { id: `milestone-${m}`, user: "System", text: `${m} viewers! Amazing!`, isSystem: true },
              ]);
              toast.success(`${m} viewers milestone reached!`);
              break;
            }
          }
          // Viewer join notification (occasionally)
          if (delta > 0 && Math.random() > 0.6) {
            const joinName = names[Math.floor(Math.random() * names.length)];
            setChatMessages((prev) => [
              ...prev.slice(-20),
              { id: `join-${now}`, user: joinName, text: "joined the stream", isSystem: true, avatar: avatarColors[Math.floor(Math.random() * avatarColors.length)] },
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
    const giftPool = [...allGifts.gifts, ...allGifts.interactive.slice(0, 3)];
    const viewers = ["Luna", "Kai", "Mia", "Nora", "Zara", "Leo", "Aria"];
    let timerRef: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 25000 + Math.random() * 25000;
      timerRef = setTimeout(() => {
        const gift = giftPool[Math.floor(Math.random() * giftPool.length)];
        const sender = viewers[Math.floor(Math.random() * viewers.length)];
        const notif = { id: Date.now().toString(), sender, giftName: gift.name, coins: gift.coins };
        setViewerGiftNotif(notif);
        setGiftNotifQueue((prev) => [notif, ...prev].slice(0, 3));
        setGiftsReceived((p) => p + 1);
        setCoinsEarned((p) => p + gift.coins);
        setTopGifters((prev) => ({ ...prev, [sender]: (prev[sender] || 0) + gift.coins }));
        setChatMessages((prev) => [
          ...prev.slice(-20),
          { id: `vgift-${Date.now()}`, user: sender, text: `sent ${gift.name} (${gift.coins} coins)`, isGift: true, avatar: ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"][Math.floor(Math.random() * 5)] },
        ]);
        if (soundEnabled) playGiftSound(1, gift.coins);
        if (autoThank) {
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev.slice(-20),
              { id: `thx-${Date.now()}`, user: "You (Host)", text: `Thank you ${sender} for the ${gift.name}!`, avatar: "bg-red-500" },
            ]);
          }, 1500);
        }
        const now = Date.now();
        if (now - lastGiftTimeRef.current < 8000) {
          setGiftStreakFlash(true);
          setTimeout(() => setGiftStreakFlash(false), 1500);
        }
        setGiftStreakCount((p) => p + 1);
        if (giftStreakTimerRef.current) clearTimeout(giftStreakTimerRef.current);
        giftStreakTimerRef.current = setTimeout(() => setGiftStreakCount(0), 10000);
        lastGiftTimeRef.current = now;
        setTimeout(() => setViewerGiftNotif((cur) => cur?.id === notif.id ? null : cur), 4000);
        setTimeout(() => setGiftNotifQueue((prev) => prev.filter((n) => n.id !== notif.id)), 5000);
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
      toast(`Slow mode: wait ${slowModeCooldown}s`, { duration: 1500 });
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
    setChatMessages((prev) => [...prev.slice(-20), { id: `poll-${Date.now()}`, user: "System", text: `Poll: "${q}" — Vote now!`, isSystem: true }]);
    toast.success("Poll created!");
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

  // Goal celebration + milestone effects
  useEffect(() => {
    if (coinsEarned >= streamGoal && !goalCelebrated) {
      setGoalCelebrated(true);
      toast.success("Stream goal reached! Amazing!", { duration: 5000 });
      setMilestoneEffect("confetti");
      setTimeout(() => setMilestoneEffect(null), 4000);
      ["heart", "party", "sparkle", "star", "crown"].forEach((e, i) => {
        setTimeout(() => spawnFloatingReaction(e), i * 200);
      });
    }
  }, [coinsEarned, streamGoal, goalCelebrated, spawnFloatingReaction]);

  // ── NEW: Super Chat simulation (random viewer sends highlighted message) ──
  useEffect(() => {
    if (phase !== "live") return;
    const superChatMsgs = [
      { text: "You're the BEST streamer!", coins: 50 },
      { text: "Keep going! Love from Brazil!", coins: 25 },
      { text: "This stream is FIRE!", coins: 100 },
      { text: "Happy birthday to me!", coins: 30 },
      { text: "First super chat! Am I famous?", coins: 10 },
    ];
    const names = ["Luna", "Kai", "VIP_Star", "Diamond_Alex"];
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (Math.random() > 0.5) {
          const msg = superChatMsgs[Math.floor(Math.random() * superChatMsgs.length)];
          const name = names[Math.floor(Math.random() * names.length)];
          setSuperChat({ user: name, text: msg.text, coins: msg.coins, id: Date.now().toString() });
          setCoinsEarned((p) => p + msg.coins);
          setChatMessages((prev) => [...prev.slice(-20), { id: `sc-${Date.now()}`, user: name, text: `SUPER CHAT: ${msg.text}`, isGift: true, avatar: "bg-amber-500" }]);
          setTimeout(() => setSuperChat(null), 6000);
        }
        schedule();
      }, 45000 + Math.random() * 35000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [phase]);

  // ── NEW: Trending words detection from chat ──
  useEffect(() => {
    if (phase !== "live" || chatMessages.length < 5) return;
    const words: Record<string, number> = {};
    const recent = chatMessages.slice(-10);
    for (const msg of recent) {
      if (msg.isSystem || msg.isGift) continue;
      const tokens = msg.text.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !["the", "and", "you", "this", "are", "for", "was"].includes(w));
      for (const t of tokens) words[t] = (words[t] || 0) + 1;
    }
    const top = Object.entries(words).sort(([, a], [, b]) => b - a)[0];
    if (top && top[1] >= 2) {
      setTrendingWord(top[0]);
    } else {
      setTrendingWord(null);
    }
  }, [chatMessages, phase]);

  // ── NEW: Wave animation trigger (simulated) ──
  useEffect(() => {
    if (phase !== "live") return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (viewerCount >= 3 && Math.random() > 0.7) {
          setWaveActive(true);
          setChatMessages((prev) => [...prev.slice(-20), { id: `wave-${Date.now()}`, user: "System", text: "Viewers started a WAVE!", isSystem: true }]);
          setTimeout(() => setWaveActive(false), 3000);
        }
        schedule();
      }, 50000 + Math.random() * 40000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [phase, viewerCount]);

  // ── PK Battle simulation ──
  useEffect(() => {
    if (!pkBattle?.active || phase !== "live") return;
    const iv = setInterval(() => {
      setPkBattle((prev) => {
        if (!prev || !prev.active) return prev;
        if (Date.now() > prev.endsAt) {
          const winner = prev.hostScore >= prev.opponentScore ? "You" : prev.opponentName;
          setChatMessages((p) => [...p.slice(-20), { id: `pk-end-${Date.now()}`, user: "System", text: `PK Battle ended! ${winner} wins!`, isSystem: true }]);
          toast.success(`${winner} won the PK Battle!`);
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
          setChatMessages((p) => [...p.slice(-20), { id: `chest-win-${Date.now()}`, user: "System", text: `${winner} won ${prize} Z Coins from the Treasure Chest!`, isSystem: true }]);
          toast.success(`${winner} won ${prize} Z Coins!`);
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
    const vipNames = [{ name: "Diamond_VIP", level: 50 }, { name: "King_Whale", level: 80 }, { name: "Platinum_Star", level: 65 }];
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (Math.random() > 0.7) {
          const vip = vipNames[Math.floor(Math.random() * vipNames.length)];
          setVipEntrance(vip);
          setChatMessages((p) => [...p.slice(-20), { id: `vip-${Date.now()}`, user: "System", text: `${vip.name} (Lv.${vip.level}) entered the stream!`, isSystem: true }]);
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
    spawnFloatingReaction("gift");

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
        text: qty > 1 ? `sent ${gift.name} x${qty} (${totalCoins.toLocaleString()} coins)` : `sent ${gift.name} (${gift.coins} coins)`,
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
    }
    lastGiftRef.current = { name: gift.name, time: now };

    // ── NEW: Combo Multiplier Visual ──
    if (newCombo >= 2) {
      const comboLabels = ["", "", "COMBO x2", "COMBO x3", "COMBO x4", "MEGA x5", "ULTRA x6", "SUPREME x7"];
      const label = newCombo < comboLabels.length ? comboLabels[newCombo] : `GODLIKE x${newCombo}`;
      setComboMultiplierText({ text: label, id: `combo-${now}` });
      setTimeout(() => setComboMultiplierText(null), 2500);
    }
    
    // Play sound effects
    if (soundEnabled) {
      if (gift.coins >= 20000) {
        playLegendaryGiftSound();
      } else if (!!hasGiftVideo(gift.name)) {
        playPremiumGiftSound();
      } else {
        playGiftSound(newCombo, gift.coins);
      }
    }
    
    enqueueGiftAnim({ name: gift.name, coins: totalCoins, senderName: sender, combo: newCombo });
    // Auto-close gift panel for immersive video animation experience
    if (hasGiftVideo(gift.name)) {
      setShowGiftPanel(false);
      setSelectedGift(null);
    }
    setGiftQty(1); // Reset qty after send
    // ── "Gift Sent!" flyout — skip when full-screen video animation plays (has its own banner) ──
    const hasVideoAnim = Boolean(hasGiftVideo(gift.name));
    if (!hasVideoAnim) {
      const flyoutId = `sent-${Date.now()}`;
      const effectiveTier = Math.max(qty, newCombo * qty);
      setSentGiftFlyout({ id: flyoutId, giftName: gift.name, coins: totalCoins, qty, combo: newCombo, tier: effectiveTier });
      setSendSparkle(true);
      setTimeout(() => setSendSparkle(false), 600);
      setTimeout(() => setSentGiftFlyout((cur) => cur?.id === flyoutId ? null : cur), 2500);
    }
    // Add to PK Battle score if active
    addPkScore(totalCoins);
  }, [spawnFloatingReaction, giftCombo, addPkScore]);

  // ── Animated coin counter for ended screen ──
  useEffect(() => {
    if (phase === "ended" && coinsEarned > 0 && displayedCoins < coinsEarned) {
      const step = Math.max(1, Math.ceil(coinsEarned / 40));
      const timer = setTimeout(() => {
        setDisplayedCoins((p) => Math.min(p + step, coinsEarned));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [phase, coinsEarned, displayedCoins]);

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
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-[10px] text-blue-300/70 bg-blue-500/10 rounded-full px-2 py-0.5">#{tag}</span>
                ))}
              </div>
            )}
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
              <motion.p
                key={displayedCoins}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-amber-300"
              >
                {displayedCoins.toLocaleString()}
              </motion.p>
              <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">Z Coins Earned</p>
              {coinsEarned > 0 && (
                <p className="text-[11px] text-green-400 font-semibold mt-1">≈ ${(coinsEarned * 0.009).toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Engagement summary */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Gifts Received</span>
              <span className="text-sm font-semibold text-white">{giftsReceived}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Chat Messages</span>
              <span className="text-sm font-semibold text-white">{chatMessages.length}</span>
            </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">New Followers</span>
               <span className="text-sm font-semibold text-purple-400">{newFollowersCount}</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">Shares</span>
               <span className="text-sm font-semibold text-blue-400">{shareCount}</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">Engagement Rate</span>
               <span className="text-sm font-semibold text-green-400">
                 {peakViewers > 0 ? Math.min(95, Math.round((giftsReceived / peakViewers) * 40 + (likes / Math.max(1, elapsed / 30)) * 5)) : 0}% 
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-white/50">Avg Watch Time</span>
               <span className="text-sm font-semibold text-white">{formatTime(Math.round(elapsed * 0.6))} </span>
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
                  const medals = ["#1", "#2", "#3"];
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
                setLikes(0); setChatMessages([]); setGiftsReceived(0); setCoinsEarned(0); setTopGifters({}); setGiftStreakFlash(false); setShowLeaderboard(false); setGoalCelebrated(false); setNewFollowersCount(0); setShareCount(0); setNewFollower(null); setSelectedGift(null); setRecentGifts([]); setPinnedChatMsg(null); setGiftQty(1); setCameraFilter("none"); setShowViewerList(false); setActivePoll(null); setShowPollCreator(false); setSlowModeCooldown(0); setPkBattle(null); setTreasureChest(null); setCoHosts([]); setShowGuestInvite(false); setVipEntrance(null); setMutedUsers(new Set()); setActiveSticker(null); setShowStickerPanel(false); setClipSaved(false); setShowRevenueDash(false); setShowTop3Banner(true); setComboMultiplierText(null); setGiftStreakCount(0); setSuperChat(null); setMilestoneEffect(null); setWaveActive(false); setTrendingWord(null); setHashtags([]); setHashtagInput(""); setBgMusic(null); setScreenEffect(null); setStreamRating(0); setDisplayedCoins(0); setGiftNotifQueue([]); setSentGiftFlyout(null); setSendSparkle(false); setShowMoreTools(false); setCashedOut(false); lastMilestoneRef.current = 0; startCamera();
              }}
              className="rounded-full flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/20"
            >
              Go Live Again
            </Button>
          </div>

          {/* Earnings Cash-Out Card */}
          {coinsEarned > 0 && (
            <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20 space-y-3 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-bold">Stream Earnings</p>
                  <p className="text-white/40 text-[10px]">Coins convert at $0.009 per coin</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <img src={goldCoinIcon} alt="" className="w-5 h-5" />
                  <span className="text-amber-300 text-sm font-semibold">{coinsEarned.toLocaleString()} coins</span>
                </div>
                <span className="text-green-400 text-lg font-bold">${(coinsEarned * 0.009).toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  if (cashedOut) return;
                  setCashedOut(true);
                  toast.success(`$${(coinsEarned * 0.009).toFixed(2)} added to your ZIVO Wallet!`, {
                    description: `${coinsEarned.toLocaleString()} coins converted`,
                    duration: 4000,
                  });
                }}
                disabled={cashedOut}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]",
                  cashedOut
                    ? "bg-green-500/20 text-green-300 cursor-default"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-emerald-700"
                )}
              >
                {cashedOut ? "✓ Cashed Out to Wallet" : `Cash Out $${(coinsEarned * 0.009).toFixed(2)} to Wallet`}
              </button>
            </div>
          )}

          {/* ── NEW: Save Highlights & Replay ── */}
          <button
            onClick={() => toast.success("Highlights saved! Access them from your profile.", { duration: 3000 })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/10 border border-purple-500/20 active:scale-[0.98] transition-transform"
          >
            <Clapperboard className="h-5 w-5 text-purple-300" />
            <span className="text-purple-300 text-sm font-semibold">Save Highlights & Replay</span>
          </button>

          {/* Stream Rating */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
            <p className="text-xs text-white/50 font-medium">How was your stream?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => { setStreamRating(star); toast.success(`Rated ${star}/5`); }}
                  className={cn(
                    "text-2xl transition-all duration-200",
                    star <= streamRating ? "scale-110" : "opacity-30 hover:opacity-60"
                  )}
                >
                  <Star className={cn("h-5 w-5", star <= streamRating ? "text-amber-400 fill-amber-400" : "text-white/30")} />
                </button>
              ))}
            </div>
            {streamRating > 0 && (
              <p className="text-[10px] text-white/30">{streamRating >= 4 ? "Amazing stream!" : streamRating >= 3 ? "Good work! Keep going!" : "Every stream makes you better!"}</p>
            )}
          </div>

          {/* Schedule Next Stream */}
          <button
            onClick={() => toast("Stream scheduling coming soon!", { description: "Set a time and notify your followers automatically." })}
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
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto relative"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)",
                  border: "1.5px solid rgba(255,255,255,0.08)",
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <CameraOff className="h-9 w-9 text-white/15" />
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <div>
                <p className="text-white/40 text-sm font-medium">Camera unavailable</p>
                <p className="text-white/20 text-[11px] mt-1">Check permissions or try another device</p>
              </div>
              {phase === "setup" && (
                <Button size="sm" variant="outline" onClick={startCamera} className="text-white border-white/20 rounded-full gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
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

        {/* ── Face Sticker Overlay ── */}
        {phase === "live" && activeSticker && (
          <div className="absolute inset-0 z-[2] pointer-events-none flex items-start justify-center pt-[15%]">
            <motion.div
              key={activeSticker}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 h-20"
              style={{ filter: faceStickers.find(s => s.id === activeSticker)?.filter }}
            >
              {faceStickers.find(s => s.id === activeSticker)?.icon}
            </motion.div>
          </div>
        )}

        {/* Double-tap to heart */}
        {phase === "live" && (
           <div
             className="absolute inset-0 z-[1]"
             onDoubleClick={() => {
               spawnFloatingReaction("heart");
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

          {/* Stream Goal Progress Bar — Enhanced */}
          <div className="mt-2 bg-black/30 backdrop-blur-md rounded-xl px-3 py-2 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/50 font-medium flex items-center gap-1"><Target className="h-3 w-3 text-amber-400/70" /> Stream Goal</span>
              <span className="text-[10px] text-amber-300 font-bold">{Math.min(coinsEarned, streamGoal)}/{streamGoal}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: coinsEarned >= streamGoal
                    ? "linear-gradient(90deg, #10B981, #34D399, #6EE7B7)"
                    : "linear-gradient(90deg, #F59E0B, #FBBF24, #FCD34D)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((coinsEarned / streamGoal) * 100, 100)}%` }}
                transition={{ type: "spring", damping: 20 }}
              />
              {/* Shimmer effect on progress bar */}
              {coinsEarned > 0 && coinsEarned < streamGoal && (
                <motion.div
                  className="absolute top-0 h-full w-8 rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                  animate={{ left: ["-10%", "110%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
              )}
            </div>
            {coinsEarned >= streamGoal && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] text-emerald-300 mt-1 text-center flex items-center justify-center gap-0.5 font-semibold"
              >
                <PartyPopper className="h-3 w-3" /> Goal reached! 🎉
              </motion.p>
            )}
          </div>

          {/* ── PK Battle Bar ── */}
          <AnimatePresence>
            {pkBattle?.active && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mt-2 bg-black/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-red-500/20"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-0.5"><Swords className="h-3 w-3" /> PK Battle</span>
                  <span className="text-[9px] text-white/40">{Math.max(0, Math.round((pkBattle.endsAt - Date.now()) / 1000))}s left</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-white/80 font-semibold">You</span>
                      <span className="text-[10px] text-amber-300 font-bold">{pkBattle.hostScore}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        animate={{ width: `${pkBattle.hostScore + pkBattle.opponentScore > 0 ? (pkBattle.hostScore / (pkBattle.hostScore + pkBattle.opponentScore)) * 100 : 50}%` }}
                      />
                    </div>
                  </div>
                  <Swords className="h-5 w-5 text-red-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-white/80 font-semibold">{pkBattle.opponentName}</span>
                      <span className="text-[10px] text-amber-300 font-bold">{pkBattle.opponentScore}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-400"
                        animate={{ width: `${pkBattle.hostScore + pkBattle.opponentScore > 0 ? (pkBattle.opponentScore / (pkBattle.hostScore + pkBattle.opponentScore)) * 100 : 50}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-white/30 text-center mt-1">Send gifts to help win! </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Treasure Chest Widget ── */}
          <AnimatePresence>
            {treasureChest?.active && !treasureChest.winner && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="mt-2 bg-gradient-to-r from-amber-900/60 to-yellow-900/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-amber-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider"> Treasure Chest</span>
                  <motion.span
                    key={treasureChest.countdown}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-black text-amber-200"
                  >
                    {treasureChest.countdown}s
                  </motion.span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {treasureChest.participants.map((p) => (
                    <div key={p} className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center text-[8px] text-white font-bold border border-amber-500/20">
                      {p[0]}
                    </div>
                  ))}
                  {treasureChest.participants.length === 0 && <span className="text-[9px] text-white/30">Waiting for participants...</span>}
                </div>
                <p className="text-[8px] text-amber-200/50">{treasureChest.participants.length} joined · Drawing soon!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Co-Host Grid ── */}
          {coHosts.length > 0 && (
            <div className="mt-2 flex gap-2 px-1">
              {coHosts.map((host) => (
                <div key={host.name} className="flex items-center gap-1.5 bg-purple-500/15 backdrop-blur-md rounded-full px-2.5 py-1 border border-purple-500/20">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold", host.avatar)}>
                    {host.name[0]}
                  </div>
                  <span className="text-[10px] text-white/80 font-medium">{host.name}</span>
                  <button onClick={() => setCoHosts((p) => p.filter((h) => h.name !== host.name))} className="text-white/30 hover:text-white/60">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Setup form */}
      {phase === "setup" && (
        <div className="relative z-10 flex-1 min-h-0 flex flex-col p-3 pb-4 overflow-y-auto overscroll-contain">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }} className="mt-auto space-y-2.5">
            {/* Stream setup card */}
            <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-3 space-y-2.5 border border-white/10 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="text-white font-semibold text-[13px]">Stream Setup</span>
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

              {/* Hashtags for discovery */}
              <div>
                <p className="text-zinc-400 text-xs mb-2 font-medium">Hashtags</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {hashtags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-blue-500/15 text-blue-300 text-[11px] font-medium rounded-full px-2.5 py-1 border border-blue-500/20">
                      #{tag}
                      <button onClick={() => setHashtags((p) => p.filter((t) => t !== tag))} className="text-blue-400/60 hover:text-blue-300">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                {hashtags.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && hashtagInput.trim()) {
                          setHashtags((p) => [...p, hashtagInput.trim()]);
                          setHashtagInput("");
                        }
                      }}
                      placeholder="Add hashtag..."
                      maxLength={20}
                      className="bg-zinc-800/80 border-zinc-700/50 text-white placeholder:text-zinc-500 text-xs rounded-xl h-8 flex-1"
                    />
                    <button
                      onClick={() => { if (hashtagInput.trim()) { setHashtags((p) => [...p, hashtagInput.trim()]); setHashtagInput(""); } }}
                      className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 text-[11px] font-medium border border-blue-500/20"
                    >
                      Add
                    </button>
                  </div>
                )}
                {hashtags.length === 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {["trending", "live", "fyp", "viral"].map((suggestion) => (
                      <button key={suggestion} onClick={() => setHashtags((p) => [...p, suggestion])} className="text-[10px] text-zinc-500 bg-zinc-800/60 rounded-full px-2 py-0.5 hover:text-zinc-400 transition-colors">
                        #{suggestion}
                      </button>
                    ))}
                  </div>
                )}
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
                    onClick={() => { setAutoThank((p) => !p); toast(autoThank ? "Auto-thank disabled" : "Auto-thank enabled", { duration: 1500 }); }}
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
                    onClick={() => { setSoundEnabled((p) => !p); toast(soundEnabled ? "Sounds muted" : "Sounds on", { duration: 1500 }); }}
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
                    onClick={() => { setSlowMode((p) => !p); toast(slowMode ? "Slow mode off" : "Slow mode on (5s)", { duration: 1500 }); }}
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
                    onClick={() => toast("Screen share coming soon!", { description: "Share your screen with viewers" })}
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
                  <Heart className="h-3.5 w-3.5 text-purple-400" />
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
                <ReactionIcon name={r.emoji} className="h-6 w-6" />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Left-side stacked gift notification queue (TikTok-style) ── */}
          <div className="absolute left-2 z-30 flex flex-col gap-2 items-start w-[200px]" style={{ top: "calc(env(safe-area-inset-top, 0px) + 180px)" }}>
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
                      <span className="text-amber-200 text-[9px] font-bold">{notif.coins}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── "Gift Sent!" flyout — slides from right when user sends ── */}
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
                      <Check className="h-3 w-3 inline mr-0.5" />
                      {sentGiftFlyout.tier >= 50 ? " 🔥 COMBO!" : sentGiftFlyout.tier >= 20 ? " ⚡ Combo!" : sentGiftFlyout.tier >= 5 ? " 💜 Combo!" : sentGiftFlyout.tier >= 3 ? " 💙 Hit!" : " Gift Sent!"}
                      {sentGiftFlyout.combo > 1 && <span className="ml-1 text-yellow-200">x{sentGiftFlyout.combo}</span>}
                      {sentGiftFlyout.qty > 1 && <span className={cn("ml-1", sentGiftFlyout.tier >= 50 ? "text-yellow-200" : sentGiftFlyout.tier >= 20 ? "text-amber-200" : sentGiftFlyout.tier >= 5 ? "text-purple-200" : sentGiftFlyout.tier >= 3 ? "text-blue-200" : "text-emerald-200")}>×{sentGiftFlyout.qty}</span>}
                    </p>
                    <div className="flex items-center gap-1">
                      <img src={goldCoinIcon} alt="" className="w-3 h-3" />
                      <span className={cn("text-[10px] font-semibold", sentGiftFlyout.tier >= 50 ? "text-yellow-100" : sentGiftFlyout.tier >= 20 ? "text-amber-100" : sentGiftFlyout.tier >= 5 ? "text-purple-100" : "text-emerald-100")}>{sentGiftFlyout.coins.toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Sparkle particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white"
                      initial={{ opacity: 1, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        x: Math.cos((i / 6) * Math.PI * 2) * 40,
                        y: Math.sin((i / 6) * Math.PI * 2) * 40,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Side actions — minimal 4-button sidebar like TikTok */}
          <div className="absolute right-2 bottom-44 flex flex-col gap-2 items-center z-30">
            <button onClick={flipCamera} className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5">
              <RotateCcw className="h-3.5 w-3.5 text-white/60" />
            </button>
            <button onClick={toggleMic} className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", micOn ? "bg-black/30" : "bg-red-500/30")}>
              {micOn ? <Mic className="h-3.5 w-3.5 text-white/60" /> : <MicOff className="h-3.5 w-3.5 text-red-300" />}
            </button>

            {/* "More" toggle — opens bottom sheet */}
            <button onClick={() => setShowMoreTools((p) => !p)} className={cn("w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5", showMoreTools ? "bg-white/15" : "bg-black/30")}>
              {showMoreTools ? <X className="h-3.5 w-3.5 text-white/70" /> : <MoreHorizontal className="h-3.5 w-3.5 text-white/70" />}
            </button>

            <div className="w-5 border-t border-white/10" />

            {/* Heart + Gift — always visible */}
            <div className="flex flex-col items-center">
              <button onClick={() => sendReaction("heart")} className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-white/5">
                <Heart className="h-4 w-4 text-red-400" />
              </button>
              <span className="text-white text-[8px] mt-0.5 font-medium">{likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
            </div>

            <button onClick={() => setShowGiftPanel(true)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform border border-amber-500/20 relative" data-testid="gift-btn">
              <Gift className="h-4 w-4 text-yellow-300" />
              {giftsReceived > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">{giftsReceived > 99 ? "99+" : giftsReceived}</span>
              )}
            </button>
          </div>

          {/* "More Tools" bottom sheet overlay — grid layout */}
          <AnimatePresence>
            {showMoreTools && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl rounded-t-2xl border-t border-white/10 p-4 pb-6"
              >
                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-xs font-semibold">Stream Tools</span>
                  <button onClick={() => setShowMoreTools(false)} className="text-white/40 hover:text-white/70">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {/* Row 1 */}
                  <button onClick={() => setShowViewerList((p) => !p)} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative">
                      <Users className="h-4 w-4 text-white/70" />
                      <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-3 bg-green-500 text-white text-[6px] font-bold rounded-full flex items-center justify-center px-0.5">{viewerCount}</span>
                    </div>
                    <span className="text-white/50 text-[9px]">Viewers</span>
                  </button>
                  <button onClick={toggleCamera} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cameraOn ? "bg-white/10" : "bg-red-500/30")}>
                      {cameraOn ? <Camera className="h-4 w-4 text-white/70" /> : <CameraOff className="h-4 w-4 text-red-300" />}
                    </div>
                    <span className="text-white/50 text-[9px]">Camera</span>
                  </button>
                  <button onClick={() => setBeautyMode((p) => !p)} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", beautyMode ? "bg-pink-500/30" : "bg-white/10")}>
                      <Sparkles className={cn("h-4 w-4", beautyMode ? "text-pink-300" : "text-white/70")} />
                    </div>
                    <span className="text-white/50 text-[9px]">Beauty</span>
                  </button>
                  <button
                    onClick={() => {
                      const filters: Array<"none" | "warm" | "cool" | "bw" | "vintage"> = ["none", "warm", "cool", "bw", "vintage"];
                      const idx = filters.indexOf(cameraFilter);
                      setCameraFilter(filters[(idx + 1) % filters.length]);
                      toast(`Filter: ${filters[(idx + 1) % filters.length] === "none" ? "Off" : filters[(idx + 1) % filters.length]}`, { duration: 1500 });
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cameraFilter !== "none" ? "bg-cyan-500/30" : "bg-white/10")}>
                      <Palette className={cn("h-4 w-4", cameraFilter !== "none" ? "text-cyan-300" : "text-white/70")} />
                    </div>
                    <span className="text-white/50 text-[9px]">Filter</span>
                  </button>
                  <button onClick={() => setShowStickerPanel((p) => !p)} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeSticker ? "bg-yellow-500/30" : "bg-white/10")}>
                      <Sparkles className="h-4 w-4 text-pink-300" />
                    </div>
                    <span className="text-white/50 text-[9px]">Sticker</span>
                  </button>
                  {/* Row 2 */}
                  <button onClick={() => { setClipSaved(true); toast.success("Clip saved!"); setTimeout(() => setClipSaved(false), 3000); }} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", clipSaved ? "bg-green-500/30" : "bg-white/10")}>
                      {clipSaved ? <Check className="h-4 w-4 text-green-300" /> : <ImageIcon className="h-4 w-4 text-white/70" />}
                    </div>
                    <span className="text-white/50 text-[9px]">Clip</span>
                  </button>
                  <button onClick={() => { setSoundEnabled((p) => !p); toast(soundEnabled ? "Muted" : "Sound on", { duration: 1200 }); }} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", !soundEnabled ? "bg-red-500/20" : "bg-white/10")}>
                      {soundEnabled ? <Volume2 className="h-4 w-4 text-white/70" /> : <VolumeX className="h-4 w-4 text-red-300" />}
                    </div>
                    <span className="text-white/50 text-[9px]">Sound</span>
                  </button>
                  <button
                    onClick={() => {
                      const tracks = [null, "Chill Lo-fi", "Acoustic", "Piano Vibes", "Upbeat Pop"];
                      const idx = tracks.indexOf(bgMusic);
                      const next = tracks[(idx + 1) % tracks.length];
                      setBgMusic(next);
                      toast(next ? `Music: ${next}` : "Music off", { duration: 1500 });
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgMusic ? "bg-violet-500/25" : "bg-white/10")}>
                      <Music className="h-4 w-4 text-violet-300" />
                    </div>
                    <span className="text-white/50 text-[9px]">Music</span>
                  </button>
                  <button onClick={() => setShowPollCreator((p) => !p)} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activePoll ? "bg-blue-500/25" : "bg-white/10")}>
                      <BarChart3 className={cn("h-4 w-4", activePoll ? "text-blue-300" : "text-white/70")} />
                    </div>
                    <span className="text-white/50 text-[9px]">Poll</span>
                  </button>
                  <button
                    onClick={() => {
                      if (pkBattle?.active) { toast("Battle already in progress!"); return; }
                      const opponents = ["DJ_Luna", "KingAlex", "StarMia", "ProGamer99"];
                      const opp = opponents[Math.floor(Math.random() * opponents.length)];
                      setPkBattle({ active: true, hostScore: 0, opponentScore: 0, opponentName: opp, endsAt: Date.now() + 120000, winner: null });
                      setChatMessages((prev) => [...prev.slice(-20), { id: `pk-${Date.now()}`, user: "System", text: `PK Battle started vs ${opp}!`, isSystem: true }]);
                      toast.success(`PK Battle vs ${opp}!`);
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", pkBattle?.active ? "bg-red-500/25" : "bg-white/10")}>
                      <span className="text-base">VS</span>
                    </div>
                    <span className="text-white/50 text-[9px]">PK</span>
                  </button>
                  {/* Row 3 */}
                  <button
                    onClick={() => {
                      if (treasureChest?.active) return;
                      setTreasureChest({ active: true, countdown: 15, participants: [], winner: null });
                      setChatMessages((prev) => [...prev.slice(-20), { id: `chest-${Date.now()}`, user: "System", text: "Treasure Chest opened! Tap to join!", isSystem: true }]);
                      toast("Treasure Chest! 15s to join!", { duration: 3000 });
                    }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", treasureChest?.active ? "bg-amber-500/25" : "bg-white/10")}>
                      <span className="text-base"></span>
                    </div>
                    <span className="text-white/50 text-[9px]">Chest</span>
                  </button>
                  <button onClick={() => setShowGuestInvite((p) => !p)} className="flex flex-col items-center gap-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", coHosts.length > 0 ? "bg-purple-500/25" : "bg-white/10")}>
                      <Users className="h-4 w-4 text-white/70" />
                    </div>
                    <span className="text-white/50 text-[9px]">Guests</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick reaction bar */}
          <div className="px-3 pr-[56px] mb-2 flex gap-1 justify-start">
            {quickReactions.map((r) => (
              <button
                key={r.key}
                onClick={() => sendReaction(r.key)}
                className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-md flex items-center justify-center shrink-0 active:scale-75 transition-transform text-sm border border-white/5"
              >
                {r.icon}
              </button>
            ))}
          </div>

          {/* Chat messages overlay */}
          {showChat && (
            <div className="relative pl-4 pr-14 mb-2 max-h-[160px]">
              {/* Gradient fade at top */}
              <div className="absolute top-0 left-4 right-4 h-6 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none rounded-t-2xl" />
              <div className="overflow-y-auto max-h-[160px] space-y-1 scroll-smooth scrollbar-hide">
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
                {chatMessages.filter((m) => !m.isPinned && !mutedUsers.has(m.user)).slice(-6).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (!msg.isSystem && !msg.isGift) {
                        setPinnedChatMsg(`${msg.user}: ${msg.text}`);
                        toast.success(`Pinned message from ${msg.user}`);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!msg.isSystem && msg.user !== "You (Host)") {
                        setMutedUsers((prev) => new Set(prev).add(msg.user));
                        toast(`Muted ${msg.user}`, { duration: 2000 });
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-1.5 w-fit max-w-[80%] animate-in slide-in-from-left-3 fade-in duration-200 pointer-events-auto cursor-pointer",
                      msg.isGift ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/20" :
                      msg.isSystem ? "bg-transparent pointer-events-none" :
                      msg.level && msg.level >= 40 ? "bg-gradient-to-r from-amber-900/40 to-yellow-900/20 border border-amber-500/15 shadow-sm shadow-amber-500/10" :
                      msg.level && msg.level >= 30 ? "bg-gradient-to-r from-purple-900/40 to-pink-900/20 border border-purple-500/15" :
                      msg.level && msg.level >= 20 ? "bg-gradient-to-r from-blue-900/40 to-cyan-900/20 border border-blue-500/10" :
                      msg.level && msg.level >= 10 ? "bg-gradient-to-r from-green-900/30 to-emerald-900/15 border border-green-500/10" :
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
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border",
                        msg.level >= 40 ? "bg-gradient-to-r from-amber-500/40 to-yellow-500/30 text-amber-200 border-amber-500/30 shadow-sm shadow-amber-500/10" :
                        msg.level >= 30 ? "bg-gradient-to-r from-purple-500/40 to-pink-500/30 text-purple-200 border-purple-500/30" :
                        msg.level >= 20 ? "bg-gradient-to-r from-blue-500/40 to-cyan-500/30 text-blue-200 border-blue-500/30" :
                        msg.level >= 10 ? "bg-gradient-to-r from-green-500/30 to-emerald-500/20 text-green-300 border-green-500/20" :
                        "bg-white/10 text-white/50 border-white/10"
                      )}>
                        Lv.{msg.level}
                      </span>
                    )}
                    {/* Top Fan badge */}
                    {topGifterName && msg.user === topGifterName && (
                      <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/30 text-amber-200 border border-amber-500/30 flex items-center gap-0.5"><Star className="h-2 w-2 fill-amber-300 text-amber-300" /> Top Fan</span>
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
                    <span className="text-[11px] font-bold text-white/70"> Create Poll</span>
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
              <span className="text-[9px] text-blue-300 font-medium absolute -top-5 left-4 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> Slow mode: {slowModeCooldown}s</span>
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
                          toast(`Lucky! You sent ${lucky.name}!`);
                        }}
                        className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-purple-300" />
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
                          onClick={() => {
                            sendGift(selectedGift, giftQty);
                            setGiftQty(1);
                            // Keep panel open — user closes manually via X
                          }}
                          className={cn(
                            "relative flex items-center gap-1.5 rounded-full px-4 py-2.5 shadow-lg active:scale-90 transition-all shrink-0 overflow-hidden",
                            selectedGift.coins >= 500
                              ? "bg-gradient-to-r from-red-500 to-rose-500 shadow-red-500/25"
                              : "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/25"
                          )}
                        >
                          {/* Send sparkle burst */}
                          {sendSparkle && (
                            <>
                              {[...Array(8)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 rounded-full bg-white"
                                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                  animate={{
                                    opacity: 0,
                                    x: Math.cos((i / 8) * Math.PI * 2) * 30,
                                    y: Math.sin((i / 8) * Math.PI * 2) * 30,
                                    scale: 0,
                                  }}
                                  transition={{ duration: 0.5, delay: i * 0.03 }}
                                />
                              ))}
                            </>
                          )}
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
                <p className="text-[10px] text-white/30 text-center py-2">No gifters yet — be the first!</p>
              ) : (
                Object.entries(topGifters)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([name, coins], i) => {
                    const medals = ["#1", "#2", "#3", "#4", "#5"];
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
            className="fixed right-3 z-50 w-56"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 180px)" }}
          >
            <div
              className="rounded-2xl px-3 py-3 space-y-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(20,30,50,0.95) 0%, rgba(25,35,60,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(100,200,255,0.12)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Viewers</span>
                  <span className="text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full font-bold">{viewerCount}</span>
                </div>
                <button onClick={() => setShowViewerList(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Stats bar */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <div className="flex-1 text-center">
                  <p className="text-[8px] text-white/30 uppercase">Peak</p>
                  <p className="text-[11px] text-white/80 font-bold">{peakViewers}</p>
                </div>
                <div className="w-px h-5 bg-white/10" />
                <div className="flex-1 text-center">
                  <p className="text-[8px] text-white/30 uppercase">New</p>
                  <p className="text-[11px] text-green-300 font-bold">+{newFollowersCount}</p>
                </div>
                <div className="w-px h-5 bg-white/10" />
                <div className="flex-1 text-center">
                  <p className="text-[8px] text-white/30 uppercase">Shared</p>
                  <p className="text-[11px] text-blue-300 font-bold">{shareCount}</p>
                </div>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-1 scrollbar-hide">
                {fakeViewerNames.slice(0, Math.min(viewerCount, 10)).map((name, i) => {
                  const isTopGifter = topGifterName === name.split(" ")[0];
                  const isMuted = mutedUsers.has(name);
                  return (
                    <div key={name} className="flex items-center gap-2 py-1 group">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0", ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"][i % 5])}>
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[11px] font-medium truncate", isMuted ? "text-white/30 line-through" : "text-white/80")}>{name}</span>
                          {isTopGifter && <span className="text-[7px] bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-0.5"><Star className="h-2 w-2 fill-amber-300 text-amber-300" /> Top</span>}
                          {i === 0 && !isTopGifter && <span className="text-[7px] bg-green-500/20 text-green-300 px-1 py-0.5 rounded-full font-bold shrink-0">Early</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isMuted) {
                            setMutedUsers((prev) => { const n = new Set(prev); n.delete(name); return n; });
                            toast(`Unmuted ${name}`);
                          } else {
                            setMutedUsers((prev) => new Set(prev).add(name));
                            toast(`Muted ${name}`);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-opacity"
                      >
                        {isMuted ? <Volume2 className="h-3 w-3 text-green-300" /> : <VolumeX className="h-3 w-3 text-white/40" />}
                      </button>
                    </div>
                  );
                })}
              </div>
              {viewerCount > 10 && (
                <p className="text-[9px] text-white/30 text-center pt-1 border-t border-white/5 mt-1">+{viewerCount - 10} more watching</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIP Entrance Effect ── */}
      <AnimatePresence>
        {phase === "live" && vipEntrance && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 18, stiffness: 160 }}
            className="fixed left-0 right-0 z-50"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 130px)" }}
          >
            <div
              className="mx-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{
                background: "linear-gradient(95deg, rgba(120,50,180,0.9) 0%, rgba(200,100,255,0.7) 40%, rgba(255,180,50,0.5) 80%, transparent 100%)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 30px rgba(150,50,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "1px solid rgba(200,150,255,0.2)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-2xl"
              >
                <Crown className="h-6 w-6 text-amber-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                  {vipEntrance.name}
                </p>
                <p className="text-purple-200/80 text-[10px]">
                  Level {vipEntrance.level} VIP entered the stream!
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-lg"
              >
                <Sparkles className="h-5 w-5 text-purple-200" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Guest Invite Panel ── */}
      <AnimatePresence>
        {phase === "live" && showGuestInvite && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed right-3 z-50 w-52"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 210px)" }}
          >
            <div
              className="rounded-2xl px-3 py-2.5 space-y-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(50,20,80,0.95) 0%, rgba(60,30,90,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(180,100,255,0.15)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-purple-300" />
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Invite Guest</span>
                </div>
                <button onClick={() => setShowGuestInvite(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[9px] text-white/30 mb-2">Invite a viewer to co-host with you</p>
              {fakeViewerNames.slice(0, Math.min(viewerCount, 5)).map((name) => {
                const isCoHost = coHosts.some((h) => h.name === name);
                return (
                  <div key={name} className="flex items-center gap-2 py-1">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-[8px] text-white font-bold">
                      {name[0]}
                    </div>
                    <span className="text-[11px] text-white/80 flex-1 truncate">{name}</span>
                    <button
                      onClick={() => {
                        if (isCoHost) {
                          setCoHosts((p) => p.filter((h) => h.name !== name));
                          toast(`Removed ${name} from co-host`);
                        } else if (coHosts.length < 3) {
                          setCoHosts((p) => [...p, { name, avatar: ["bg-pink-500", "bg-blue-500", "bg-green-500"][p.length % 3] }]);
                          setChatMessages((prev) => [...prev.slice(-20), { id: `cohost-${Date.now()}`, user: "System", text: `${name} joined as co-host!`, isSystem: true }]);
                          toast.success(`${name} is now co-hosting!`);
                        } else {
                          toast.error("Max 3 co-hosts");
                        }
                      }}
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full transition-all",
                        isCoHost ? "bg-red-500/20 text-red-300" : "bg-purple-500/20 text-purple-300"
                      )}
                    >
                      {isCoHost ? "Remove" : "Invite"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW: Face Sticker Panel ── */}
      <AnimatePresence>
        {phase === "live" && showStickerPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed right-3 z-50 w-48"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 210px)" }}
          >
            <div
              className="rounded-2xl px-3 py-2.5 space-y-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(60,30,80,0.95) 0%, rgba(80,40,100,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,180,255,0.15)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-pink-300" />
                  <span className="text-[11px] font-bold text-pink-300 uppercase tracking-wider">Stickers</span>
                </div>
                <button onClick={() => setShowStickerPanel(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {faceStickers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSticker((prev) => prev === s.id ? null : s.id); toast(`${s.label} ${activeSticker === s.id ? "Removed" : "Applied"}`, { duration: 1200 }); }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all border",
                      activeSticker === s.id ? "bg-pink-500/30 border-pink-500/30 shadow-lg shadow-pink-500/20" : "bg-white/5 border-white/10"
                    )}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
              {activeSticker && (
                <button onClick={() => { setActiveSticker(null); toast("Sticker removed"); }} className="w-full text-[9px] text-pink-300/60 text-center mt-1">
                  Tap active sticker to remove
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW: Top-3 Gifter Mini-Banner (persistent during live) ── */}
      {phase === "live" && showTop3Banner && Object.keys(topGifters).length > 0 && !showLeaderboard && (
        <div className="fixed left-3 z-40" style={{ top: "calc(env(safe-area-inset-top, 0px) + 170px)" }}>
          <div
            className="rounded-xl px-2.5 py-1.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(40,25,10,0.85) 0%, rgba(60,35,15,0.8) 100%)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,200,80,0.12)",
            }}
          >
            <span className="text-[8px] text-amber-400 font-bold uppercase">Top</span>
            {Object.entries(topGifters)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([name, coins], i) => {
                const medals = ["#1", "#2", "#3"];
                return (
                  <div key={name} className="flex items-center gap-1">
                    <span className="text-[10px]">{medals[i]}</span>
                    <span className="text-[9px] text-white/70 font-medium max-w-[40px] truncate">{name}</span>
                    <span className="text-[8px] text-amber-300 font-bold">{coins}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── NEW: Combo Multiplier Overlay ── */}
      <AnimatePresence>
        {phase === "live" && comboMultiplierText && (
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

      {/* ── NEW v3: Gift Streak Counter ── */}
      <AnimatePresence>
        {phase === "live" && giftStreakCount >= 2 && (
          <motion.div
            key={`streak-${giftStreakCount}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed left-4 z-50 pointer-events-none"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 200px)" }}
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600/80 to-orange-500/70 backdrop-blur-md rounded-2xl px-3 py-2 border border-red-400/30 shadow-lg shadow-red-500/30">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.4, repeat: Infinity }}><Flame className="h-5 w-5 text-orange-400" /></motion.div>
              <div>
                <p className="text-white text-xs font-black">GIFT STREAK</p>
                <p className="text-amber-200 text-lg font-black leading-none">{giftStreakCount}x</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW v3: Super Chat Overlay ── */}
      <AnimatePresence>
        {phase === "live" && superChat && (
          <motion.div
            key={superChat.id}
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-3 right-14 z-50"
            style={{ bottom: "280px" }}
          >
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,180,0,0.9) 0%, rgba(255,120,0,0.85) 100%)", boxShadow: "0 4px 30px rgba(255,150,0,0.4)" }}>
              <div className="px-3 py-1.5 flex items-center gap-2 border-b border-white/20">
                <span className="text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> Super Chat</span>
                <span className="text-white/80 text-[10px] font-bold ml-auto flex items-center gap-1"><img src={goldCoinIcon} alt="" className="w-3 h-3" />{superChat.coins}</span>
              </div>
              <div className="px-3 py-2">
                <p className="text-white text-[11px] font-bold">{superChat.user}</p>
                <p className="text-white text-sm font-semibold mt-0.5">{superChat.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW v3: Milestone Confetti/Firework Effect ── */}
      <AnimatePresence>
        {phase === "live" && milestoneEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 400, opacity: 1, scale: 0 }}
                animate={{ y: 800, opacity: 0, scale: 1, rotate: Math.random() * 720 }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "easeOut" }}
                className="absolute text-2xl"
              >
                ""
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW v3: Wave Animation ── */}
      <AnimatePresence>
        {phase === "live" && waveActive && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed left-3 right-14 z-50 pointer-events-none"
            style={{ bottom: "240px" }}
          >
            <div className="flex items-center gap-1 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: 3 }}
                  className="text-2xl"
                >
                  <Hand className="h-5 w-5 text-white/70" />
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW v3: Trending Word Indicator ── */}
      {phase === "live" && trendingWord && (
        <div className="fixed left-3 z-40 pointer-events-none" style={{ top: "calc(env(safe-area-inset-top, 0px) + 195px)" }}>
          <div className="flex items-center gap-1 bg-blue-500/20 backdrop-blur-sm rounded-full px-2 py-0.5 border border-blue-500/20">
            <Flame className="h-2.5 w-2.5 text-orange-400" />
            <span className="text-[8px] text-blue-300 font-bold uppercase">Trending:</span>
            <span className="text-[9px] text-white/80 font-semibold">{trendingWord}</span>
          </div>
        </div>
      )}

      {/* ── NEW: Revenue Mini-Dashboard ── */}
      <AnimatePresence>
        {phase === "live" && showRevenueDash && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed right-3 z-50 w-52"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 210px)" }}
          >
            <div
              className="rounded-2xl px-3 py-2.5 space-y-2"
              style={{
                background: "linear-gradient(135deg, rgba(10,40,20,0.95) 0%, rgba(15,50,25,0.92) 100%)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(80,200,120,0.15)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Revenue</span>
                </div>
                <button onClick={() => setShowRevenueDash(false)} className="text-white/30 hover:text-white/60">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Total Earned</span>
                  <span className="text-sm font-bold text-amber-300 flex items-center gap-1"><img src={goldCoinIcon} alt="" className="w-3.5 h-3.5" />{coinsEarned.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Coins/min</span>
                  <span className="text-[11px] font-semibold text-emerald-300">{elapsed > 60 ? (coinsEarned / (elapsed / 60)).toFixed(1) : coinsEarned.toString()} </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Projected (1hr)</span>
                  <span className="text-[11px] font-semibold text-emerald-200">{elapsed > 30 ? Math.round((coinsEarned / elapsed) * 3600).toLocaleString() : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Gifts</span>
                  <span className="text-[11px] font-semibold text-white/70">{giftsReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Top Gift Value</span>
                  <span className="text-[11px] font-semibold text-amber-200">{Object.values(topGifters).length > 0 ? Math.max(...Object.values(topGifters)).toLocaleString() : "0"} </span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-1.5">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${Math.min((coinsEarned / streamGoal) * 100, 100)}%` }} />
                </div>
                <p className="text-[8px] text-white/30 text-center mt-0.5">{Math.min(coinsEarned, streamGoal)}/{streamGoal} Goal</p>
              </div>
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

      {/* ── NEW v4: Screen Effects Overlay ── */}
      <AnimatePresence>
        {phase === "live" && screenEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
          >
            {Array.from({ length: screenEffect === "confetti" ? 30 : 20 }).map((_, i) => (
              <motion.span
                key={`effect-${i}`}
                initial={{ y: -20, x: Math.random() * 400, opacity: 1, rotate: 0 }}
                animate={{
                  y: 800,
                  rotate: Math.random() * 360,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                className="absolute text-xl"
              >
                {screenEffect === "confetti" ? <ReactionIcon name={["party", "sparkle", "star", "crown", "gem"][i % 5]} className="h-5 w-5" /> :
                 screenEffect === "hearts" ? <ReactionIcon name="heart" className="h-5 w-5" /> :
                 <ReactionIcon name={["fire", "zap", "flame", "trending", "star"][i % 5]} className="h-5 w-5" />}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NEW v4: Background Music Indicator ── */}
      <AnimatePresence>
        {phase === "live" && bgMusic && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed left-3 z-40"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}
          >
            <div className="flex items-center gap-1.5 bg-violet-900/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-violet-500/20">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-xs"
              >
                <Music className="h-3 w-3 text-violet-200" />
              </motion.span>
              <span className="text-[10px] text-violet-200 font-medium truncate max-w-[100px]">{bgMusic}</span>
              <button onClick={() => setBgMusic(null)} className="text-white/30 hover:text-white/60">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen gift animation overlay */}
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
          onPurchase={(coins) => setCoinBalance(prev => prev + coins)}
        />
      </Suspense>
    </div>
  );
}
