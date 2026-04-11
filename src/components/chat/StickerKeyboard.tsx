/**
 * StickerKeyboard — Version 2026 rich media panel
 * Tabs: Stickers, GIFs, Avatar, Music, Store, Memes, Future
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Image as ImageIcon,
  UserRound,
  Music2,
  Store,
  Search,
  Sparkles,
  Play,
  Pause,
  Shuffle,
  Heart,
  Download,
  Check,
  Rocket,
  Send,
  Volume2,
  Clock,
  Mic,
  Camera,
  Link2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ILLUSTRATED_PACKS, type IllustratedStickerPack } from "@/config/illustratedStickers";
import { toast } from "sonner";

/* ═══════════════ Types ═══════════════ */

interface StickerKeyboardProps {
  open: boolean;
  onClose: () => void;
  onSendSticker: (payload: StickerSendPayload) => void;
  onStartVoice?: () => void;
  onOpenCamera?: () => void;
}

export interface StickerSendPayload {
  text: string;
  messageType?: "sticker" | "gif" | "text";
}

interface StickerPack {
  id: string;
  name: string;
  emoji_prefix: string;
  stickers: string[];
}

type TabKey = "stickers" | "gifs" | "avatar" | "music" | "store" | "memes" | "future";

/* ═══════════════ Storage Keys ═══════════════ */

const RECENT_KEY = "zivo_recent_stickers";
const LAST_TAB_KEY = "zivo_last_sticker_tab";
const STORE_INSTALLED_KEY = "zivo_store_installed_packs";
const FAV_TRACKS_KEY = "zivo_favorite_tracks";
const RECENT_TRACKS_KEY = "zivo_recent_tracks";

/* ═══════════════ Sticker Data — 10 packs ═══════════════ */

const BUILTIN_STICKERS: Record<string, string[]> = {
  "Smileys": [
    "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
    "😋","😎","😍","🥰","😘","😗","😙","😚","🙂","🤗",
    "🤔","🫤","😐","😑","😶","🙄","😏","😣","😥","😮",
    "🤐","😯","😪","😫","🥱","😴","🤤","😛","😜","😝",
    "🤑","🤠","😈","👿","👻","💀","☠️","👽","🤖","🎃",
  ],
  "Hands": [
    "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌",
    "🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉",
    "👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛",
    "🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅",
    "🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","👀",
  ],
  "Hearts": [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
    "❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝",
    "💟","♥️","🫀","💑","💏","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","🥰","😍",
  ],
  "Animals": [
    "🐱","🐶","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦉","🦄",
    "🐝","🦋","🐢","🐬","🐳","🐙","🦀","🐠","🐡","🦈",
    "🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🐪","🦒",
  ],
  "Food": [
    "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈",
    "🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍕","🍔",
    "🍟","🌭","🌮","🌯","🥙","🧆","🥚","🍳","🥘","🍲",
    "🥗","🍿","🧈","🧀","🍰","🎂","🧁","🍩","🍪","🍫",
  ],
  "Travel": [
    "🚗","🚕","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻",
    "🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛺","✈️","🛫",
    "🛬","🚀","🛸","🚁","⛵","🚢","🗺️","🧭","⛺","🏖️",
    "🏔️","🗻","🌋","🗼","🏰","🗽","⛩️","🕌","🛕","⛪",
  ],
  "Sports": [
    "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
    "🏓","🏸","🏒","🥍","🏑","🥊","🥋","🎿","⛷️","🏂",
    "🏋️","🤸","🤼","🤺","🤾","🏌️","🏇","🧘","🏄","🏊",
    "🤽","🚣","🧗","🚴","🏆","🥇","🥈","🥉","🏅","🎖️",
  ],
  "Nature": [
    "🌸","💐","🌷","🌹","🥀","🌺","🌻","🌼","🌱","🪴",
    "🌲","🌳","🌴","🌵","🎋","🎍","🍀","☘️","🍁","🍂",
    "🍃","🌾","🌿","🪻","🪷","🍄","🐚","🪸","🪨","🌊",
    "💧","💦","☀️","🌤️","⛅","🌈","⭐","🌟","✨","🔥",
  ],
  "Objects": [
    "📱","💻","⌨️","🖥️","🖨️","🖱️","💿","📷","📸","📹",
    "🎥","🎞️","📞","☎️","📺","📻","🎙️","🎚️","🎛️","⏰",
    "⌚","🔋","🔌","💡","🔦","🕯️","🪔","💰","💳","💎",
    "🔑","🗝️","🔒","🔓","📦","📫","📬","🏷️","🔖","📎",
  ],
  "Flags": [
    "🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️",
    "🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇯🇵","🇰🇷","🇨🇳","🇮🇳",
    "🇧🇷","🇲🇽","🇨🇦","🇦🇺","🇮🇹","🇪🇸","🇷🇺","🇹🇭",
    "🇻🇳","🇵🇭","🇮🇩","🇸🇬","🇲🇾","🇰🇭","🇦🇪","🇸🇦",
  ],
};

/* ═══════════════ GIF Data ═══════════════ */

const GIF_CATEGORIES = ["Trending", "Reactions", "Love", "Dance", "Funny", "Celebrate"] as const;
type GifCategory = typeof GIF_CATEGORIES[number];

interface GifItem {
  id: string;
  label: string;
  url: string;
  category: GifCategory;
  altText: string;
}

const GIF_ITEMS: GifItem[] = [
  { id: "g1", label: "Thumbs Up", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif", category: "Reactions", altText: "thumbs up" },
  { id: "g2", label: "Happy Dance", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif", category: "Dance", altText: "happy dance" },
  { id: "g3", label: "Love", url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/200w.gif", category: "Love", altText: "love hearts" },
  { id: "g4", label: "LOL", url: "https://media.giphy.com/media/10JhviFuU2gWD6/200w.gif", category: "Funny", altText: "laughing" },
  { id: "g5", label: "Mind Blown", url: "https://media.giphy.com/media/xT0xeJpnrWC3XWblEk/200w.gif", category: "Reactions", altText: "mind blown" },
  { id: "g6", label: "Celebrate", url: "https://media.giphy.com/media/g9582DNuQppxC/200w.gif", category: "Celebrate", altText: "celebration" },
  { id: "g7", label: "Wow", url: "https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/200w.gif", category: "Reactions", altText: "wow" },
  { id: "g8", label: "Party", url: "https://media.giphy.com/media/l0MYJnJQ4EiYLxvQ4/200w.gif", category: "Celebrate", altText: "party" },
  { id: "g9", label: "Clapping", url: "https://media.giphy.com/media/NEvPzZ8bd1V4Y/200w.gif", category: "Reactions", altText: "clapping" },
  { id: "g10", label: "Hug", url: "https://media.giphy.com/media/XpgOZHuDfIkoM/200w.gif", category: "Love", altText: "hug" },
  { id: "g11", label: "Groovy", url: "https://media.giphy.com/media/l3q2Hy66w1hpDSWUE/200w.gif", category: "Dance", altText: "groovy dance" },
  { id: "g12", label: "Sarcastic", url: "https://media.giphy.com/media/Fml0fgAxVx1eM/200w.gif", category: "Funny", altText: "sarcastic" },
  { id: "g13", label: "Yes!", url: "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/200w.gif", category: "Reactions", altText: "yes" },
  { id: "g14", label: "No No", url: "https://media.giphy.com/media/JYZ397GsFrFtu/200w.gif", category: "Funny", altText: "no" },
  { id: "g15", label: "Kiss", url: "https://media.giphy.com/media/G3fPad8N68GfS/200w.gif", category: "Love", altText: "kiss" },
  { id: "g16", label: "Fire", url: "https://media.giphy.com/media/l4FATJpd4LWgeruTK/200w.gif", category: "Trending", altText: "fire" },
  { id: "g17", label: "Confetti", url: "https://media.giphy.com/media/s2qXK8wAvkHTO/200w.gif", category: "Celebrate", altText: "confetti" },
  { id: "g18", label: "Moonwalk", url: "https://media.giphy.com/media/l2JhL1AzTxORUOi7S/200w.gif", category: "Dance", altText: "moonwalk" },
  { id: "g19", label: "Facepalm", url: "https://media.giphy.com/media/XsUtdIeJ0MWMo/200w.gif", category: "Funny", altText: "facepalm" },
  { id: "g20", label: "Cool", url: "https://media.giphy.com/media/62PP2yEIAZF6g/200w.gif", category: "Trending", altText: "cool" },
];

/* ═══════════════ Avatar Moods ═══════════════ */

const AVATAR_MOODS = [
  { label: "Happy", emoji: "😊", color: "from-yellow-400/30 to-orange-400/20", ring: "ring-yellow-400/50" },
  { label: "LOL", emoji: "😂", color: "from-amber-400/30 to-yellow-300/20", ring: "ring-amber-400/50" },
  { label: "Love", emoji: "😍", color: "from-rose-400/30 to-pink-400/20", ring: "ring-rose-400/50" },
  { label: "Cool", emoji: "😎", color: "from-blue-400/30 to-cyan-400/20", ring: "ring-blue-400/50" },
  { label: "Think", emoji: "🤔", color: "from-purple-400/30 to-violet-400/20", ring: "ring-purple-400/50" },
  { label: "Sad", emoji: "🥲", color: "from-sky-400/30 to-blue-400/20", ring: "ring-sky-400/50" },
  { label: "Party", emoji: "🥳", color: "from-fuchsia-400/30 to-pink-400/20", ring: "ring-fuchsia-400/50" },
  { label: "Sleep", emoji: "😴", color: "from-indigo-400/30 to-slate-400/20", ring: "ring-indigo-400/50" },
  { label: "Angry", emoji: "😤", color: "from-red-400/30 to-orange-400/20", ring: "ring-red-400/50" },
  { label: "Shocked", emoji: "😱", color: "from-emerald-400/30 to-teal-400/20", ring: "ring-emerald-400/50" },
  { label: "Wink", emoji: "😜", color: "from-lime-400/30 to-green-400/20", ring: "ring-lime-400/50" },
  { label: "Cry", emoji: "😭", color: "from-blue-300/30 to-indigo-400/20", ring: "ring-blue-300/50" },
];

/* ═══════════════ Music Tracks ═══════════════ */

interface TrackItem {
  title: string;
  artist: string;
  duration: string;
  previewUrl: string;
  shareUrl: string;
  genre: string;
  coverGradient: string;
}

const TRACKS: TrackItem[] = [
  { title: "Midnight Drive", artist: "Zivo Sessions", duration: "3:20", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", shareUrl: "https://hizovo.com/sound/midnight-drive", genre: "Chill", coverGradient: "from-violet-600 to-indigo-800" },
  { title: "City Lights", artist: "Zivo Sessions", duration: "3:23", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", shareUrl: "https://hizovo.com/sound/city-lights", genre: "Lo-fi", coverGradient: "from-amber-500 to-orange-700" },
  { title: "Ocean Ride", artist: "Zivo Sessions", duration: "2:21", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", shareUrl: "https://hizovo.com/sound/ocean-ride", genre: "Ambient", coverGradient: "from-cyan-500 to-blue-700" },
  { title: "Sunset Loop", artist: "Zivo Sessions", duration: "2:47", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", shareUrl: "https://hizovo.com/sound/sunset-loop", genre: "Beats", coverGradient: "from-rose-500 to-pink-700" },
  { title: "Neon Streets", artist: "Zivo Sessions", duration: "4:01", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", shareUrl: "https://hizovo.com/sound/neon-streets", genre: "Synth", coverGradient: "from-emerald-500 to-teal-800" },
  { title: "Golden Hour", artist: "Zivo Sessions", duration: "3:45", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", shareUrl: "https://hizovo.com/sound/golden-hour", genre: "Pop", coverGradient: "from-yellow-500 to-amber-700" },
  { title: "Night Runner", artist: "Zivo Sessions", duration: "3:55", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", shareUrl: "https://hizovo.com/sound/night-runner", genre: "Electronic", coverGradient: "from-purple-600 to-fuchsia-800" },
  { title: "Coastal Breeze", artist: "Zivo Sessions", duration: "2:38", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", shareUrl: "https://hizovo.com/sound/coastal-breeze", genre: "Tropical", coverGradient: "from-teal-400 to-sky-600" },
];

/* ═══════════════ Store Packs ═══════════════ */

interface StorePackItem {
  name: string;
  count: number;
  emoji: string;
  category: string;
  gradient: string;
  preview: string[];
}

const STORE_PACKS: StorePackItem[] = [
  { name: "Cute Cats", count: 24, emoji: "🐱", category: "Fun", gradient: "from-amber-400 to-orange-500", preview: ["😺","😸","😻","🙀"] },
  { name: "Anime Reactions", count: 32, emoji: "⚡", category: "Anime", gradient: "from-violet-500 to-purple-600", preview: ["💫","✨","⚡","🌟"] },
  { name: "Travel Vibes", count: 18, emoji: "✈️", category: "Travel", gradient: "from-sky-400 to-blue-600", preview: ["🌍","✈️","🏖️","🗺️"] },
  { name: "Emoji Blast", count: 40, emoji: "💥", category: "Fun", gradient: "from-rose-500 to-red-600", preview: ["🔥","💥","💢","⭐"] },
  { name: "Tokyo Mood", count: 28, emoji: "🗼", category: "Anime", gradient: "from-pink-400 to-fuchsia-600", preview: ["🗼","🍜","🎌","🌸"] },
  { name: "Love Language", count: 22, emoji: "💕", category: "Love", gradient: "from-rose-400 to-pink-500", preview: ["💕","💌","💋","🌹"] },
  { name: "Sporty", count: 30, emoji: "⚽", category: "Sports", gradient: "from-green-500 to-emerald-600", preview: ["⚽","🏀","🏆","🎯"] },
  { name: "Foodies", count: 36, emoji: "🍕", category: "Food", gradient: "from-orange-400 to-red-500", preview: ["🍕","🍔","🌮","🍰"] },
];

/* ═══════════════ Memes ═══════════════ */

const MEME_ITEMS = [
  { label: "No Way", emoji: "😱", caption: "when you realize it's Monday tomorrow", bg: "bg-gradient-to-br from-red-500/20 to-orange-500/10" },
  { label: "Big Mood", emoji: "🫠", caption: "me after 3 hours of meetings", bg: "bg-gradient-to-br from-yellow-500/20 to-amber-500/10" },
  { label: "Chef's Kiss", emoji: "🤌", caption: "that first coffee in the morning", bg: "bg-gradient-to-br from-emerald-500/20 to-green-500/10" },
  { label: "Legend", emoji: "🫡", caption: "respect earned, not given", bg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/10" },
  { label: "Plot Twist", emoji: "🌀", caption: "nobody saw that coming", bg: "bg-gradient-to-br from-purple-500/20 to-violet-500/10" },
  { label: "Mic Drop", emoji: "🎤", caption: "said what needed to be said", bg: "bg-gradient-to-br from-pink-500/20 to-rose-500/10" },
  { label: "RIP", emoji: "💀", caption: "I'm literally dead", bg: "bg-gradient-to-br from-slate-500/20 to-gray-500/10" },
  { label: "Slay", emoji: "💅", caption: "you better work", bg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10" },
  { label: "Vibing", emoji: "🕺", caption: "living my best life rn", bg: "bg-gradient-to-br from-indigo-500/20 to-blue-500/10" },
  { label: "Bruh", emoji: "🗿", caption: "seriously right now?", bg: "bg-gradient-to-br from-stone-500/20 to-zinc-500/10" },
];

/* ═══════════════ Future Actions ═══════════════ */

const FUTURE_ACTIONS = [
  { label: "Plan Weekend", emoji: "🗓️", text: "Let's plan this weekend ✨", desc: "Create a plan together", gradient: "from-violet-500/20 to-purple-500/10" },
  { label: "Split Fare", emoji: "🚗", text: "Let's split the ride fare.", desc: "Share ride costs", gradient: "from-emerald-500/20 to-green-500/10" },
  { label: "Start Poll", emoji: "📊", text: "Quick poll: what do you prefer?", desc: "Get everyone's opinion", gradient: "from-blue-500/20 to-sky-500/10" },
  { label: "Book Table", emoji: "🍽️", text: "Let's reserve a table for tonight.", desc: "Restaurant reservation", gradient: "from-amber-500/20 to-orange-500/10" },
  { label: "Trip Idea", emoji: "🧳", text: "Travel idea: weekend city break?", desc: "Suggest a getaway", gradient: "from-cyan-500/20 to-teal-500/10" },
  { label: "Voice Note", emoji: "🎙️", text: "Send me a quick voice check-in.", desc: "Quick audio message", gradient: "from-rose-500/20 to-pink-500/10" },
];

/* ═══════════════ Helpers ═══════════════ */

function getRecentStickers(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 30); } catch { return []; }
}
function addRecentSticker(sticker: string) {
  const recent = getRecentStickers().filter((s) => s !== sticker);
  recent.unshift(sticker);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 30)));
}
function readJsonArray(key: string): string[] {
  try { const d = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function writeJsonArray(key: string, values: string[]) { localStorage.setItem(key, JSON.stringify(values)); }
function formatSeconds(total: number): string {
  return `${Math.floor(total / 60)}:${Math.floor(total % 60).toString().padStart(2, "0")}`;
}

/** Detect Spotify / Apple Music link and extract metadata from URL */
function parseMusicLink(url: string): { platform: "spotify" | "apple" | null; display: string } {
  const trimmed = url.trim();
  if (/open\.spotify\.com\/(track|album|playlist)/i.test(trimmed)) {
    const parts = trimmed.split("/").pop()?.split("?")[0] || "";
    return { platform: "spotify", display: `Spotify: ...${parts.slice(-8)}` };
  }
  if (/music\.apple\.com/i.test(trimmed)) {
    return { platform: "apple", display: "Apple Music link" };
  }
  return { platform: null, display: "" };
}

/* ═══════════════ Component ═══════════════ */

export default function StickerKeyboard({ open, onClose, onSendSticker, onStartVoice, onOpenCamera }: StickerKeyboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("stickers");
  const [activePack, setActivePack] = useState(1000); // Default to first illustrated pack
  const [search, setSearch] = useState("");
  const [gifCategory, setGifCategory] = useState<GifCategory | "All">("All");
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [remotePacks, setRemotePacks] = useState<StickerPack[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [favoriteTracks, setFavoriteTracks] = useState<string[]>([]);
  const [recentTracks, setRecentTracks] = useState<string[]>([]);
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [musicLinkInput, setMusicLinkInput] = useState("");
  const [musicLinkParsed, setMusicLinkParsed] = useState<ReturnType<typeof parseMusicLink> | null>(null);
  const [previewSticker, setPreviewSticker] = useState<{ id: string; src: string; alt: string } | null>(null);
  const [favoriteStickers, setFavoriteStickers] = useState<string[]>([]);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Load state on open */
  useEffect(() => {
    if (!open) return;
    const savedTab = localStorage.getItem(LAST_TAB_KEY) as TabKey | null;
    setActiveTab(savedTab || "stickers");
    setSearch("");
    setGifCategory("All");
    setActivePack(1000);
    setMusicLinkInput("");
    setMusicLinkParsed(null);
    setRecentStickers(getRecentStickers());
    setFavoriteTracks(readJsonArray(FAV_TRACKS_KEY));
    setRecentTracks(readJsonArray(RECENT_TRACKS_KEY));
    setInstalledPacks(readJsonArray(STORE_INSTALLED_KEY));

    const loadPacks = async () => {
      const { data } = await (supabase as any).from("chat_sticker_packs").select("id, name, emoji_prefix, stickers").order("created_at", { ascending: true });
      if (!data) { setRemotePacks([]); return; }
      setRemotePacks(
        data.map((p: any) => ({
          id: p.id, name: p.name, emoji_prefix: p.emoji_prefix || "✨",
          stickers: Array.isArray(p.stickers) ? p.stickers : typeof p.stickers === "string" ? JSON.parse(p.stickers) : [],
        })).filter((p: StickerPack) => p.stickers.length > 0)
      );
    };
    void loadPacks();
  }, [open]);

  useEffect(() => { localStorage.setItem(LAST_TAB_KEY, activeTab); }, [activeTab]);

  /* Cleanup audio */
  useEffect(() => {
    return () => {
      if (audioTickRef.current) clearInterval(audioTickRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  /* Music link detection */
  useEffect(() => {
    if (musicLinkInput.trim().length > 10) {
      setMusicLinkParsed(parseMusicLink(musicLinkInput));
    } else {
      setMusicLinkParsed(null);
    }
  }, [musicLinkInput]);

  /* ── Sticker packs ── */
  const packs = useMemo<StickerPack[]>(() => {
    if (remotePacks.length > 0) return remotePacks;
    return Object.entries(BUILTIN_STICKERS).map(([name, stickers], i) => ({
      id: `builtin-${i}`, name, emoji_prefix: stickers[0] || "😀", stickers,
    }));
  }, [remotePacks]);

  // Illustrated packs offset: activePack values >= 1000 are illustrated
  const isIllustratedPack = activePack >= 1000;
  const illustratedPackIndex = activePack - 1000;
  const currentIllustratedPack = isIllustratedPack ? ILLUSTRATED_PACKS[illustratedPackIndex] : null;

  const currentPack = !isIllustratedPack ? packs[activePack] : null;
  const filteredStickers = useMemo(() => {
    const list = currentPack?.stickers || [];
    if (!search.trim()) return list;
    return list.filter((s) => s.toLowerCase().includes(search.trim().toLowerCase()));
  }, [currentPack?.stickers, search]);

  const filteredIllustratedStickers = useMemo(() => {
    if (!currentIllustratedPack) return [];
    const q = search.trim().toLowerCase();
    if (!q) return currentIllustratedPack.stickers;
    return currentIllustratedPack.stickers.filter((s) => s.alt.toLowerCase().includes(q));
  }, [currentIllustratedPack, search]);

  /* ── Actions ── */
  const sendSticker = useCallback((sticker: string) => {
    addRecentSticker(sticker);
    setRecentStickers(getRecentStickers());
    onSendSticker({ text: sticker, messageType: "sticker" });
    onClose();
  }, [onSendSticker, onClose]);

  const quickSend = useCallback((text: string, messageType: "gif" | "text" = "text") => {
    onSendSticker({ text, messageType });
    onClose();
  }, [onSendSticker, onClose]);

  const toggleTrackPreview = useCallback(async (trackKey: string, previewUrl: string) => {
    try {
      if (playingTrackId === trackKey && audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
        if (audioTickRef.current) { clearInterval(audioTickRef.current); audioTickRef.current = null; }
        return;
      }
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.pause();
      audioRef.current.src = previewUrl;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setPlayingTrackId(trackKey);
      setAudioDuration(audioRef.current.duration || 0);
      if (audioTickRef.current) clearInterval(audioTickRef.current);
      audioTickRef.current = setInterval(() => {
        if (!audioRef.current) return;
        setAudioProgress(audioRef.current.currentTime || 0);
        setAudioDuration(audioRef.current.duration || 0);
      }, 250);
      audioRef.current.onended = () => {
        setPlayingTrackId(null);
        setAudioProgress(0);
        if (audioTickRef.current) { clearInterval(audioTickRef.current); audioTickRef.current = null; }
      };
    } catch {
      setPlayingTrackId(null);
      toast.error("Song preview unavailable");
    }
  }, [playingTrackId]);

  const toggleFavoriteTrack = useCallback((trackKey: string) => {
    setFavoriteTracks((prev) => {
      const next = prev.includes(trackKey) ? prev.filter((id) => id !== trackKey) : [trackKey, ...prev].slice(0, 25);
      writeJsonArray(FAV_TRACKS_KEY, next);
      return next;
    });
  }, []);

  const registerRecentTrack = useCallback((trackKey: string) => {
    setRecentTracks((prev) => {
      const next = [trackKey, ...prev.filter((id) => id !== trackKey)].slice(0, 10);
      writeJsonArray(RECENT_TRACKS_KEY, next);
      return next;
    });
  }, []);

  const toggleInstallPack = useCallback((packName: string) => {
    setInstalledPacks((prev) => {
      const next = prev.includes(packName) ? prev.filter((n) => n !== packName) : [...prev, packName];
      writeJsonArray(STORE_INSTALLED_KEY, next);
      toast.success(next.includes(packName) ? `${packName} installed!` : `${packName} removed`);
      return next;
    });
  }, []);

  /* ── Filtered data ── */
  const filteredGifs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byCategory = gifCategory === "All" ? GIF_ITEMS : GIF_ITEMS.filter((g) => g.category === gifCategory);
    if (!q) return byCategory;
    return byCategory.filter((g) => g.label.toLowerCase().includes(q) || g.altText.toLowerCase().includes(q));
  }, [gifCategory, search]);

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TRACKS;
    return TRACKS.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q));
  }, [search]);

  if (!open) return null;

  const searchPlaceholders: Record<TabKey, string> = {
    stickers: "Search stickers",
    gifs: "Search GIFs",
    avatar: "Search mood",
    music: "Search songs or artists",
    store: "Search sticker packs",
    memes: "Search memes",
    future: "Search actions",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background border-t border-border/40 rounded-t-3xl shadow-xl max-h-[72vh] overflow-hidden flex flex-col"
      >
        {/* ── Tab bar + search ── */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/20 px-3 pt-3 pb-2 z-10 shrink-0">
          <div className="w-16 h-1.5 rounded-full bg-muted mx-auto mb-3" />

          {/* Quick-access row: Voice + Camera + Tabs */}
          <div className="flex items-center gap-1.5 mb-2">
            {/* Voice & Camera shortcuts */}
            {onStartVoice && (
              <button
                onClick={() => { onClose(); onStartVoice(); }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center shrink-0 border border-rose-500/20"
                title="Voice message"
              >
                <Mic className="w-5 h-5 text-rose-500" />
              </button>
            )}
            {onOpenCamera && (
              <button
                onClick={() => { onClose(); onOpenCamera(); }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 flex items-center justify-center shrink-0 border border-blue-500/20"
                title="Camera"
              >
                <Camera className="w-5 h-5 text-blue-500" />
              </button>
            )}
          </div>

          {/* Tab grid */}
          <div className="grid grid-cols-7 gap-1">
            {([
              { key: "stickers" as TabKey, label: "Stickers", icon: Smile },
              { key: "gifs" as TabKey, label: "GIFs", icon: ImageIcon },
              { key: "avatar" as TabKey, label: "Avatar", icon: UserRound },
              { key: "music" as TabKey, label: "Music", icon: Music2 },
              { key: "store" as TabKey, label: "Store", icon: Store },
              { key: "memes" as TabKey, label: "Memes", icon: Sparkles },
              { key: "future" as TabKey, label: "Future", icon: Rocket },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                className={`rounded-2xl px-1 py-2 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Unified search */}
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholders[activeTab]}
                className="w-full h-9 rounded-full bg-muted/30 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <button onClick={onClose} className="text-primary text-sm font-semibold px-2 py-1 rounded-lg hover:bg-primary/10 shrink-0">Done</button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ═══ STICKERS ═══ */}
          {activeTab === "stickers" && (
            <>
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/10">
                <span>{isIllustratedPack ? filteredIllustratedStickers.length : (activePack === -1 ? recentStickers.length : filteredStickers.length)} items</span>
                <div className="flex items-center gap-1.5">
                  {!isIllustratedPack && (
                    <button onClick={() => {
                      const source = activePack === -1 ? recentStickers : filteredStickers;
                      if (source.length) sendSticker(source[Math.floor(Math.random() * source.length)]);
                    }} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/30 hover:bg-muted/40">
                      <Shuffle className="w-3 h-3" /> Random
                    </button>
                  )}
                  {recentStickers.length > 0 && (
                    <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentStickers([]); setActivePack(0); }}
                      className="px-2 py-1 rounded-md border border-border/30 hover:bg-muted/40">Clear</button>
                  )}
                </div>
              </div>

              {/* Pack tabs — scrollable */}
              <div className="flex px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none border-b border-border/10">
                {recentStickers.length > 0 && (
                  <button onClick={() => setActivePack(-1)} className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activePack === -1 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <Clock className="w-3 h-3 inline mr-1" />Recent
                  </button>
                )}
                {/* Illustrated packs first */}
                {ILLUSTRATED_PACKS.map((pack, i) => (
                  <button key={pack.id} onClick={() => setActivePack(1000 + i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activePack === 1000 + i ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    {pack.icon} {pack.name}
                  </button>
                ))}
                {/* Emoji packs */}
                {packs.map((pack, i) => (
                  <button key={pack.id} onClick={() => setActivePack(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activePack === i ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    {pack.emoji_prefix} {pack.name}
                  </button>
                ))}
              </div>

              {/* Sticker grid */}
              <div className="h-[240px] overflow-y-auto p-2">
                {isIllustratedPack ? (
                  /* Illustrated sticker grid — 5 columns with images */
                  <div className="grid grid-cols-5 gap-2">
                    {filteredIllustratedStickers.map((sticker) => (
                      <button key={sticker.id} onClick={() => sendSticker(`[sticker:${sticker.id}:${sticker.src}]`)}
                        className="aspect-square flex items-center justify-center rounded-xl hover:bg-muted/60 active:scale-90 transition-all p-1">
                        <img src={sticker.src} alt={sticker.alt} className="w-full h-full object-contain" loading="lazy" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Emoji sticker grid */
                  <div className="grid grid-cols-8 gap-0.5">
                    {(activePack === -1 ? recentStickers : filteredStickers).map((sticker, i) => (
                      <button key={`${sticker}-${i}`} onClick={() => sendSticker(sticker)}
                        className="aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-muted/60 active:scale-90 transition-all">
                        {sticker}
                      </button>
                    ))}
                  </div>
                )}
                {!isIllustratedPack && activePack !== -1 && filteredStickers.length === 0 && (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No stickers found</div>
                )}
                {isIllustratedPack && filteredIllustratedStickers.length === 0 && (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No stickers found</div>
                )}
              </div>
            </>
          )}

          {/* ═══ GIFs — animated thumbnails ═══ */}
          {activeTab === "gifs" && (
            <div className="p-3 space-y-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {(["All", ...GIF_CATEGORIES] as const).map((cat) => (
                  <button key={cat} onClick={() => setGifCategory(cat as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      gifCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                    }`}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredGifs.map((gif) => (
                  <button key={gif.id} onClick={() => quickSend(`[GIF] ${gif.label}: ${gif.url}`, "gif")}
                    className="relative rounded-xl overflow-hidden border border-border/20 hover:border-primary/40 transition-all active:scale-95 aspect-square bg-muted/20">
                    <img src={gif.url} alt={gif.altText} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                      <p className="text-[11px] font-semibold text-white">{gif.label}</p>
                    </div>
                  </button>
                ))}
              </div>
              {filteredGifs.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No GIFs found</p>}
            </div>
          )}

          {/* ═══ AVATAR — mood circles ═══ */}
          {activeTab === "avatar" && (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-bold text-foreground">Your Avatar Moods</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tap a mood to send your avatar sticker</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_MOODS.filter((m) => !search.trim() || m.label.toLowerCase().includes(search.trim().toLowerCase())).map((mood) => (
                  <button key={mood.label} onClick={() => quickSend(`${mood.emoji} ${mood.label}`)} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${mood.color} ring-2 ${mood.ring} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                      {mood.emoji}
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ MUSIC — album cards + link sharing ═══ */}
          {activeTab === "music" && (
            <div className="p-3 space-y-3">
              {/* Music link share */}
              <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-bold text-foreground">Share a Music Link</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={musicLinkInput}
                    onChange={(e) => setMusicLinkInput(e.target.value)}
                    placeholder="Paste Spotify or Apple Music link..."
                    className="flex-1 h-9 rounded-full bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60"
                  />
                  {musicLinkParsed?.platform ? (
                    <button
                      onClick={() => {
                        quickSend(`🎵 ${musicLinkParsed.platform === "spotify" ? "🟢 Spotify" : "🍎 Apple Music"}\n${musicLinkInput.trim()}`);
                        setMusicLinkInput("");
                      }}
                      className="h-9 px-3 rounded-full bg-green-500 text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" /> Share
                    </button>
                  ) : musicLinkInput.trim() ? (
                    <button onClick={() => setMusicLinkInput("")} className="h-9 w-9 rounded-full bg-muted/40 inline-flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ) : null}
                </div>
                {musicLinkParsed?.platform && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center gap-2">
                    <span className="text-lg">{musicLinkParsed.platform === "spotify" ? "🟢" : "🍎"}</span>
                    <span className="text-xs text-muted-foreground">{musicLinkParsed.display}</span>
                    <Check className="w-3.5 h-3.5 text-green-500 ml-auto" />
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">Browse Tracks</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Volume2 className="w-3 h-3" />
                  <span>{filteredTracks.length} tracks</span>
                </div>
              </div>

              {filteredTracks.map((track, index) => {
                const trackKey = `track-${index}`;
                const isPlaying = playingTrackId === trackKey;
                const isFavorite = favoriteTracks.includes(trackKey);

                return (
                  <div key={trackKey} className="rounded-2xl border border-border/30 overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 p-3">
                      <button onClick={() => void toggleTrackPreview(trackKey, track.previewUrl)}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.coverGradient} flex items-center justify-center shrink-0 shadow-lg`}>
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{track.genre}</span>
                          <span className="text-[10px] text-muted-foreground">{track.duration}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleFavoriteTrack(trackKey)} className="p-1.5">
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                      </button>
                      <button onClick={() => {
                        registerRecentTrack(trackKey);
                        quickSend(`🎵 ${track.title} — ${track.artist}\n${track.genre} · ${track.duration}\nListen: ${track.shareUrl}`);
                      }} className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1">
                        <Send className="w-3 h-3" /> Send
                      </button>
                    </div>
                    {isPlaying && (
                      <div className="px-3 pb-2">
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full bg-primary rounded-full"
                            style={{ width: `${audioDuration > 0 ? Math.min(100, (audioProgress / audioDuration) * 100) : 0}%` }} />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">{formatSeconds(audioProgress)}</span>
                          <span className="text-[10px] text-muted-foreground">{formatSeconds(audioDuration)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredTracks.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No tracks found</p>}
            </div>
          )}

          {/* ═══ STORE — pack cards ═══ */}
          {activeTab === "store" && (
            <div className="p-3 space-y-3">
              <p className="text-sm font-bold text-foreground">Sticker Store</p>
              {STORE_PACKS.filter((p) => !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase()) || p.category.toLowerCase().includes(search.trim().toLowerCase())).map((pack) => {
                const installed = installedPacks.includes(pack.name);
                return (
                  <div key={pack.name} className="rounded-2xl border border-border/30 overflow-hidden">
                    <div className={`bg-gradient-to-r ${pack.gradient} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{pack.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-white drop-shadow">{pack.name}</p>
                          <p className="text-xs text-white/80">{pack.count} stickers · {pack.category}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleInstallPack(pack.name)}
                        className={`h-8 px-4 rounded-full text-xs font-bold shadow-lg ${installed ? "bg-white/20 text-white backdrop-blur" : "bg-white text-gray-900"}`}>
                        {installed ? <><Check className="w-3.5 h-3.5 inline mr-1" />Added</> : <><Download className="w-3.5 h-3.5 inline mr-1" />Get</>}
                      </button>
                    </div>
                    <div className="px-4 py-2.5 flex gap-3">
                      {pack.preview.map((emoji, i) => <span key={i} className="text-2xl">{emoji}</span>)}
                      <span className="text-xs text-muted-foreground self-center ml-auto">+{pack.count - pack.preview.length} more</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ MEMES — gradient cards ═══ */}
          {activeTab === "memes" && (
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">Meme Reactions</p>
                <p className="text-xs text-muted-foreground">Quick meme-style reactions for chat</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MEME_ITEMS.filter((m) => !search.trim() || m.label.toLowerCase().includes(search.trim().toLowerCase())).map((item) => (
                  <button key={item.label} onClick={() => quickSend(`${item.emoji} ${item.label}\n"${item.caption}"`)}
                    className={`rounded-2xl ${item.bg} border border-border/20 p-4 text-left hover:scale-[1.02] active:scale-95 transition-all`}>
                    <p className="text-4xl mb-2">{item.emoji}</p>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 italic">"{item.caption}"</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ FUTURE — action cards ═══ */}
          {activeTab === "future" && (
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">Quick Actions</p>
                <p className="text-xs text-muted-foreground">One-tap workflows for modern chat</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FUTURE_ACTIONS.map((item) => (
                  <button key={item.label} onClick={() => quickSend(`${item.emoji} ${item.text}`)}
                    className={`rounded-2xl bg-gradient-to-br ${item.gradient} border border-border/20 p-4 text-left hover:scale-[1.02] active:scale-95 transition-all`}>
                    <p className="text-3xl mb-2">{item.emoji}</p>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
