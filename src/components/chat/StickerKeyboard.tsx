/**
 * StickerKeyboard — iMessage-style rich panel (stickers, GIFs, avatar, music, store, memes, future)
 */
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StickerKeyboardProps {
  open: boolean;
  onClose: () => void;
  onSendSticker: (payload: StickerSendPayload) => void;
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

interface GifItem {
  label: string;
  emoji: string;
  category: "All" | "Reactions" | "Love" | "Dance" | "Fun";
}

interface TrackItem {
  title: string;
  artist: string;
  duration: string;
  previewUrl: string;
  shareUrl: string;
}

interface StorePackItem {
  name: string;
  count: number;
  emoji: string;
  category: "Fun" | "Anime" | "Travel";
}

type TabKey = "stickers" | "gifs" | "avatar" | "music" | "store" | "memes" | "future";

const RECENT_KEY = "zivo_recent_stickers";
const LAST_TAB_KEY = "zivo_last_sticker_tab";
const STORE_INSTALLED_KEY = "zivo_store_installed_packs";
const FAV_TRACKS_KEY = "zivo_favorite_tracks";
const RECENT_TRACKS_KEY = "zivo_recent_tracks";

const BUILTIN_STICKERS: Record<string, string[]> = {
  "Classic": ["😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "🥰", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤔", "🫤", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮"],
  "Animals": ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦉", "🦄", "🐝", "🦋", "🐢", "🐬"],
  "Love": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "🤎", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "😘", "🥰", "😍"],
};

const GIF_ITEMS: GifItem[] = [
  { label: "Happy", emoji: "😄", category: "Reactions" },
  { label: "Thumbs Up", emoji: "👍", category: "Reactions" },
  { label: "Love", emoji: "😍", category: "Love" },
  { label: "Dance", emoji: "💃", category: "Dance" },
  { label: "Laugh", emoji: "😂", category: "Fun" },
  { label: "Wow", emoji: "😮", category: "Reactions" },
  { label: "Party", emoji: "🥳", category: "Fun" },
  { label: "Hype", emoji: "🔥", category: "Fun" },
];

const AVATAR_ITEMS = [
  { label: "Happy", emoji: "😊" },
  { label: "LOL", emoji: "😂" },
  { label: "Love", emoji: "😍" },
  { label: "Cool", emoji: "😎" },
  { label: "Think", emoji: "🤔" },
  { label: "Sad", emoji: "🥲" },
  { label: "Party", emoji: "🥳" },
  { label: "Sleep", emoji: "😴" },
];

const TRACKS: TrackItem[] = [
  {
    title: "Midnight Drive",
    artist: "Zivo Sessions",
    duration: "3:20",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    shareUrl: "https://www.soundhelix.com/audio-examples",
  },
  {
    title: "City Lights",
    artist: "Zivo Sessions",
    duration: "3:23",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    shareUrl: "https://www.soundhelix.com/audio-examples",
  },
  {
    title: "Ocean Ride",
    artist: "Zivo Sessions",
    duration: "2:21",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    shareUrl: "https://www.soundhelix.com/audio-examples",
  },
  {
    title: "Sunset Loop",
    artist: "Zivo Sessions",
    duration: "2:47",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    shareUrl: "https://www.soundhelix.com/audio-examples",
  },
];

const STORE_PACKS: StorePackItem[] = [
  { name: "Cute Cats", count: 24, emoji: "🐱", category: "Fun" },
  { name: "Anime Reactions", count: 32, emoji: "⚡", category: "Anime" },
  { name: "Travel Vibes", count: 18, emoji: "✈️", category: "Travel" },
  { name: "Emoji Blast", count: 40, emoji: "💥", category: "Fun" },
  { name: "Tokyo Mood", count: 28, emoji: "🗼", category: "Anime" },
];

const MEME_ITEMS = [
  { label: "No Way", emoji: "😱" },
  { label: "Big Mood", emoji: "🫠" },
  { label: "Chef's Kiss", emoji: "🤌" },
  { label: "Legend", emoji: "🫡" },
  { label: "Plot Twist", emoji: "🌀" },
  { label: "Mic Drop", emoji: "🎤" },
];

const FUTURE_ACTIONS = [
  { label: "Plan Weekend", emoji: "🗓️", text: "Let's plan this weekend ✨" },
  { label: "Split Fare", emoji: "🚗", text: "Let's split the ride fare." },
  { label: "Start Poll", emoji: "📊", text: "Quick poll: what do you prefer?" },
  { label: "Book Table", emoji: "🍽️", text: "Let's reserve a table for tonight." },
  { label: "Trip Idea", emoji: "🧳", text: "Travel idea: weekend city break?" },
  { label: "Voice Check-in", emoji: "🎙️", text: "Send me a quick voice check-in." },
];

function getRecentStickers(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 30);
  } catch {
    return [];
  }
}

function addRecentSticker(sticker: string) {
  const recent = getRecentStickers().filter((s) => s !== sticker);
  recent.unshift(sticker);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 30)));
}

function readJsonArray(key: string): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, values: string[]) {
  localStorage.setItem(key, JSON.stringify(values));
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60).toString().padStart(1, "0");
  const seconds = Math.floor(total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function StickerKeyboard({ open, onClose, onSendSticker }: StickerKeyboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("stickers");
  const [activePack, setActivePack] = useState(0);
  const [search, setSearch] = useState("");
  const [gifSearch, setGifSearch] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [musicSearch, setMusicSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [memeSearch, setMemeSearch] = useState("");
  const [gifCategory, setGifCategory] = useState<GifItem["category"] | "All">("All");
  const [recentStickers, setRecentStickers] = useState<string[]>([]);
  const [remotePacks, setRemotePacks] = useState<StickerPack[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [favoriteTracks, setFavoriteTracks] = useState<string[]>([]);
  const [recentTracks, setRecentTracks] = useState<string[]>([]);
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;

    const savedTab = localStorage.getItem(LAST_TAB_KEY) as TabKey | null;
    setActiveTab(savedTab || "stickers");
    setSearch("");
    setGifSearch("");
    setAvatarSearch("");
    setMusicSearch("");
    setStoreSearch("");
    setMemeSearch("");
    setGifCategory("All");
    setActivePack(0);
    setRecentStickers(getRecentStickers());
    setFavoriteTracks(readJsonArray(FAV_TRACKS_KEY));
    setRecentTracks(readJsonArray(RECENT_TRACKS_KEY));
    setInstalledPacks(readJsonArray(STORE_INSTALLED_KEY));

    const loadPacks = async () => {
      const { data } = await (supabase as any)
        .from("chat_sticker_packs")
        .select("id, name, emoji_prefix, stickers")
        .order("created_at", { ascending: true });

      if (!data) {
        setRemotePacks([]);
        return;
      }

      const normalized = data
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          emoji_prefix: p.emoji_prefix || "✨",
          stickers: Array.isArray(p.stickers)
            ? p.stickers
            : typeof p.stickers === "string"
              ? JSON.parse(p.stickers)
              : [],
        }))
        .filter((p: StickerPack) => p.stickers.length > 0);

      setRemotePacks(normalized);
    };

    void loadPacks();
  }, [open]);

  useEffect(() => {
    localStorage.setItem(LAST_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (audioTickRef.current) {
        clearInterval(audioTickRef.current);
        audioTickRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const packs = useMemo<StickerPack[]>(() => {
    if (remotePacks.length > 0) return remotePacks;
    return Object.entries(BUILTIN_STICKERS).map(([name, stickers], i) => ({
      id: `builtin-${i}`,
      name,
      emoji_prefix: stickers[0] || "😀",
      stickers,
    }));
  }, [remotePacks]);

  const currentPack = packs[activePack];
  const filteredStickers = useMemo(() => {
    const list = currentPack?.stickers || [];
    if (!search.trim()) return list;
    return list.filter((s) => s.toLowerCase().includes(search.trim().toLowerCase()));
  }, [currentPack?.stickers, search]);

  const sendSticker = (sticker: string) => {
    addRecentSticker(sticker);
    setRecentStickers(getRecentStickers());
    onSendSticker({ text: sticker, messageType: "sticker" });
    onClose();
  };

  const quickSend = (text: string, messageType: "gif" | "text" = "text") => {
    onSendSticker({ text, messageType });
    onClose();
  };

  const toggleTrackPreview = async (trackKey: string, previewUrl: string) => {
    try {
      if (playingTrackId === trackKey && audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
        if (audioTickRef.current) {
          clearInterval(audioTickRef.current);
          audioTickRef.current = null;
        }
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = previewUrl;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setPlayingTrackId(trackKey);
      setAudioDuration(audioRef.current.duration || 0);

      if (audioTickRef.current) {
        clearInterval(audioTickRef.current);
      }
      audioTickRef.current = setInterval(() => {
        if (!audioRef.current) return;
        setAudioProgress(audioRef.current.currentTime || 0);
        setAudioDuration(audioRef.current.duration || 0);
      }, 250);

      audioRef.current.onended = () => {
        setPlayingTrackId(null);
        setAudioProgress(0);
        if (audioTickRef.current) {
          clearInterval(audioTickRef.current);
          audioTickRef.current = null;
        }
      };
    } catch {
      setPlayingTrackId(null);
      toast.error("Song preview unavailable", {
        description: "Tap the song card or Send button to share it in chat.",
      });
    }
  };

  const toggleFavoriteTrack = (trackKey: string) => {
    const next = favoriteTracks.includes(trackKey)
      ? favoriteTracks.filter((id) => id !== trackKey)
      : [trackKey, ...favoriteTracks].slice(0, 25);
    setFavoriteTracks(next);
    writeJsonArray(FAV_TRACKS_KEY, next);
  };

  const registerRecentTrack = (trackKey: string) => {
    const next = [trackKey, ...recentTracks.filter((id) => id !== trackKey)].slice(0, 10);
    setRecentTracks(next);
    writeJsonArray(RECENT_TRACKS_KEY, next);
  };

  const toggleInstallPack = (packName: string) => {
    const next = installedPacks.includes(packName)
      ? installedPacks.filter((name) => name !== packName)
      : [...installedPacks, packName];
    setInstalledPacks(next);
    writeJsonArray(STORE_INSTALLED_KEY, next);
  };

  const clearRecentStickers = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentStickers([]);
    setActivePack(0);
  };

  const sendRandomSticker = () => {
    const source = activePack === -1 ? recentStickers : filteredStickers;
    if (!source.length) return;
    const pick = source[Math.floor(Math.random() * source.length)];
    sendSticker(pick);
  };

  const filteredGifItems = useMemo(() => {
    const q = gifSearch.trim().toLowerCase();
    const byCategory = gifCategory === "All"
      ? GIF_ITEMS
      : GIF_ITEMS.filter((gif) => gif.category === gifCategory);
    if (!q) return byCategory;
    return byCategory.filter((gif) => gif.label.toLowerCase().includes(q));
  }, [gifCategory, gifSearch]);

  const filteredAvatarItems = useMemo(() => {
    const q = avatarSearch.trim().toLowerCase();
    if (!q) return AVATAR_ITEMS;
    return AVATAR_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [avatarSearch]);

  const filteredMusicTracks = useMemo(() => {
    const q = musicSearch.trim().toLowerCase();
    if (!q) return TRACKS;
    return TRACKS.filter((track) =>
      track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q),
    );
  }, [musicSearch]);

  const filteredStorePacks = useMemo(() => {
    const q = storeSearch.trim().toLowerCase();
    if (!q) return STORE_PACKS;
    return STORE_PACKS.filter((pack) =>
      pack.name.toLowerCase().includes(q) || pack.category.toLowerCase().includes(q),
    );
  }, [storeSearch]);

  const filteredMemes = useMemo(() => {
    const q = memeSearch.trim().toLowerCase();
    if (!q) return MEME_ITEMS;
    return MEME_ITEMS.filter((item) => item.label.toLowerCase().includes(q));
  }, [memeSearch]);

  const recentTrackObjects = useMemo(() => {
    return recentTracks
      .map((id) => {
        const index = Number(id.split("-").pop());
        if (Number.isNaN(index)) return null;
        return TRACKS[index] || null;
      })
      .filter(Boolean) as TrackItem[];
  }, [recentTracks]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background border-t border-border/40 rounded-t-3xl shadow-xl max-h-[72vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/20 px-3 pt-3 pb-2 z-10">
          <div className="w-16 h-1.5 rounded-full bg-muted mx-auto mb-3" />
          <div className="grid grid-cols-7 gap-1 items-start">
            {[
              { key: "stickers" as TabKey, label: "Stickers", icon: Smile },
              { key: "gifs" as TabKey, label: "GIFs", icon: ImageIcon },
              { key: "avatar" as TabKey, label: "Avatar", icon: UserRound },
              { key: "music" as TabKey, label: "Music", icon: Music2 },
              { key: "store" as TabKey, label: "Store", icon: Store },
              { key: "memes" as TabKey, label: "Memes", icon: Sparkles },
              { key: "future" as TabKey, label: "Future", icon: Rocket },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl px-2 py-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
                title={tab.label}
                aria-label={tab.label}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={onClose}
              className="text-primary text-sm font-semibold px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              Done
            </button>
          </div>
        </div>

        {activeTab === "stickers" && (
          <>
            <div className="px-3 py-2 border-b border-border/10">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stickers"
                  className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                <span>{activePack === -1 ? recentStickers.length : filteredStickers.length} items</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={sendRandomSticker}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border/30 hover:bg-muted/40"
                  >
                    <Shuffle className="w-3 h-3" /> Random
                  </button>
                  {recentStickers.length > 0 && (
                    <button
                      onClick={clearRecentStickers}
                      className="px-2 py-1 rounded-md border border-border/30 hover:bg-muted/40"
                    >
                      Clear recent
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none border-b border-border/10">
              {recentStickers.length > 0 && (
                <button
                  onClick={() => setActivePack(-1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    activePack === -1 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Recent
                </button>
              )}
              {packs.map((pack, i) => (
                <button
                  key={pack.id}
                  onClick={() => setActivePack(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    activePack === i ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pack.emoji_prefix} {pack.name}
                </button>
              ))}
            </div>

            <div className="h-[280px] overflow-y-auto p-2">
              <div className="grid grid-cols-8 gap-0.5">
                {(activePack === -1 ? recentStickers : filteredStickers).map((sticker, i) => (
                  <button
                    key={`${sticker}-${i}`}
                    onClick={() => sendSticker(sticker)}
                    className="aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-muted/60 active:scale-90 transition-all"
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              {(activePack !== -1 && filteredStickers.length === 0) && (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No stickers found</div>
              )}
            </div>
          </>
        )}

        {activeTab === "gifs" && (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                placeholder="Search GIFs..."
                className="w-full h-11 rounded-full bg-muted/30 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {(["All", "Reactions", "Love", "Dance", "Fun"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGifCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    gifCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredGifItems.map((gif) => (
                <button
                  key={gif.label}
                  onClick={() => quickSend(`${gif.emoji} GIF: ${gif.label}`, "gif")}
                  className="rounded-2xl border border-border/30 p-3 text-left hover:bg-muted/30"
                >
                  <p className="text-2xl">{gif.emoji}</p>
                  <p className="text-sm font-semibold mt-1">{gif.label}</p>
                </button>
              ))}
            </div>
            {filteredGifItems.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">No GIF results</p>
            )}
          </div>
        )}

        {activeTab === "avatar" && (
          <div className="p-4">
            <p className="text-sm font-bold text-foreground">Your Avatar Stickers</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Tap a mood to send an avatar sticker</p>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={avatarSearch}
                onChange={(e) => setAvatarSearch(e.target.value)}
                placeholder="Search avatar mood"
                className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {filteredAvatarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => quickSend(`${item.emoji} ${item.label}`)}
                  className="rounded-2xl bg-muted/30 p-3 hover:bg-muted/50"
                >
                  <p className="text-3xl">{item.emoji}</p>
                  <p className="text-xs font-medium mt-2 truncate">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "music" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Share a Track</p>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={musicSearch}
                onChange={(e) => setMusicSearch(e.target.value)}
                placeholder="Search songs or artists"
                className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm"
              />
            </div>

            {recentTrackObjects.length > 0 && (
              <div className="rounded-xl border border-border/30 p-2">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Recently shared</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentTrackObjects.slice(0, 3).map((track) => (
                    <span key={`recent-${track.title}`} className="text-[11px] px-2 py-1 rounded-full bg-muted/50">
                      {track.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {filteredMusicTracks.map((track) => {
              const index = TRACKS.findIndex((item) => item.title === track.title && item.artist === track.artist);
              const trackKey = `${track.title}-${index}`;
              const isPlaying = playingTrackId === trackKey;
              const isFavorite = favoriteTracks.includes(trackKey);

              return (
                <button
                  key={trackKey}
                  onClick={() => {
                    registerRecentTrack(trackKey);
                    quickSend(`🎵 ${track.title} — ${track.artist}\nListen: ${track.shareUrl}`);
                  }}
                  className="w-full text-left rounded-2xl border border-border/30 px-3 py-2.5 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                  title="Tap song to send"
                  aria-label={`Send ${track.title} by ${track.artist}`}
                >
                  <span className="text-2xl">🎵</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist} · {track.duration}</p>
                    {isPlaying && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${audioDuration > 0 ? Math.min(100, (audioProgress / audioDuration) * 100) : 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatSeconds(audioProgress)}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteTrack(trackKey);
                    }}
                    className="h-8 w-8 rounded-full border border-border/40 inline-flex items-center justify-center text-foreground/80 hover:bg-muted/40"
                    title={isFavorite ? "Unfavorite" : "Favorite"}
                    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleTrackPreview(trackKey, track.previewUrl);
                    }}
                    className="h-8 w-8 rounded-full border border-border/40 inline-flex items-center justify-center text-foreground/80 hover:bg-muted/40"
                    title={isPlaying ? "Pause preview" : "Play preview"}
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      registerRecentTrack(trackKey);
                      quickSend(`🎵 ${track.title} — ${track.artist}\nListen: ${track.shareUrl}`);
                    }}
                    className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Send
                  </button>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "store" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Sticker Store</p>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search pack or category"
                className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm"
              />
            </div>
            {filteredStorePacks.map((pack) => {
              const installed = installedPacks.includes(pack.name);
              return (
                <div key={pack.name} className="rounded-2xl border border-border/30 px-3 py-3 flex items-center gap-3">
                  <span className="text-3xl">{pack.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">{pack.count} stickers · {pack.category}</p>
                  </div>
                  <button
                    onClick={() => toggleInstallPack(pack.name)}
                    className={`h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      installed
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {installed ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    {installed ? "Added" : "Get"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "memes" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">Meme Reactions</p>
            <p className="text-xs text-muted-foreground">Quick meme-style reactions.</p>
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={memeSearch}
                onChange={(e) => setMemeSearch(e.target.value)}
                placeholder="Search meme"
                className="w-full h-10 rounded-full bg-muted/30 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredMemes.map((item) => (
                <button
                  key={item.label}
                  onClick={() => quickSend(`${item.emoji} ${item.label}`)}
                  className="rounded-2xl border border-border/30 p-3 text-left hover:bg-muted/30"
                >
                  <p className="text-2xl">{item.emoji}</p>
                  <p className="text-sm font-semibold mt-1">{item.label}</p>
                </button>
              ))}
            </div>
            {filteredMemes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">No memes found</p>
            )}
          </div>
        )}

        {activeTab === "future" && (
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">2026 Quick Actions</p>
            <p className="text-xs text-muted-foreground">One-tap actions for modern chat workflows.</p>
            <div className="grid grid-cols-2 gap-3">
              {FUTURE_ACTIONS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => quickSend(`${item.emoji} ${item.text}`)}
                  className="rounded-2xl border border-border/30 p-3 text-left hover:bg-muted/30"
                >
                  <p className="text-2xl">{item.emoji}</p>
                  <p className="text-sm font-semibold mt-1">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
